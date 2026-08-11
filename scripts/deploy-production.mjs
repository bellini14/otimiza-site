import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const PUBLIC_SITE_URL = 'https://otm.com.br'

export class CommandError extends Error {
  constructor(executable, args, code, details = '') {
    const suffix = details.trim() ? `\n${details.trim()}` : ''
    super(`Comando falhou (${code}): ${executable} ${args.join(' ')}${suffix}`)
    this.name = 'CommandError'
    this.code = code
  }
}

export class DeploymentSignalError extends Error {
  constructor(signalName) {
    super(`Publicação interrompida por ${signalName}.`)
    this.name = 'DeploymentSignalError'
    this.signalName = signalName
    this.exitCode = signalName === 'SIGINT' ? 130 : 143
  }
}

class DeploymentCleanupError extends Error {
  constructor(primaryError, cleanupError) {
    super(`${primaryError.message}\nA limpeza também falhou: ${cleanupError.message}`)
    this.name = 'DeploymentCleanupError'
    this.cause = primaryError
    this.cleanupError = cleanupError
  }
}

export function parseProjectLink(raw) {
  let value

  try {
    value = JSON.parse(raw)
  } catch {
    throw new Error('Vínculo inválido. Execute `vercel link` no projeto principal.')
  }

  if (
    typeof value?.orgId !== 'string'
    || !value.orgId.trim()
    || typeof value?.projectId !== 'string'
    || !value.projectId.trim()
  ) {
    throw new Error('Vínculo inválido. Execute `vercel link` no projeto principal.')
  }

  return {
    orgId: value.orgId.trim(),
    projectId: value.projectId.trim(),
  }
}

export async function prepareProjectLink({ mainRoot, worktreeRoot }) {
  const source = path.join(mainRoot, '.vercel', 'project.json')
  let link

  try {
    link = parseProjectLink(await fs.readFile(source, 'utf8'))
  } catch (error) {
    if (error.message.startsWith('Vínculo inválido')) throw error
    throw new Error('Vínculo da Vercel ausente. Execute `vercel link` no projeto principal.')
  }

  const targetDirectory = path.join(worktreeRoot, '.vercel')
  await fs.mkdir(targetDirectory, { recursive: true })
  await fs.writeFile(
    path.join(targetDirectory, 'project.json'),
    `${JSON.stringify(link, null, 2)}\n`,
    'utf8',
  )

  return link
}

export function resolveExecutables(platform = process.platform) {
  return platform === 'win32'
    ? { npm: 'npm.cmd', vercel: 'vercel.cmd' }
    : { npm: 'npm', vercel: 'vercel' }
}

export async function createWorktreeWorkspace({
  repositoryRoot,
  head,
  runCommand,
  createTemporaryRoot = () => fs.mkdtemp(path.join(os.tmpdir(), 'otimiza-deploy-')),
  removeDirectory = (directory) => fs.rm(directory, { recursive: true, force: true }),
}) {
  const temporaryRoot = await createTemporaryRoot()
  const worktreeRoot = path.join(temporaryRoot, 'worktree')

  try {
    await runCommand(
      'git',
      ['worktree', 'add', '--detach', worktreeRoot, head],
      { cwd: repositoryRoot },
    )
  } catch (error) {
    try {
      await removeDirectory(temporaryRoot)
    } catch (cleanupError) {
      throw new DeploymentCleanupError(error, cleanupError)
    }
    throw error
  }

  return { temporaryRoot, worktreeRoot }
}

export function createCommandRunner({ spawnProcess = spawn } = {}) {
  let activeChild = null

  const runCommand = (executable, args, {
    cwd,
    capture = false,
    env = process.env,
  } = {}) => new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    let settled = false
    const child = spawnProcess(executable, args, {
      cwd,
      env,
      shell: false,
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    })
    activeChild = child

    if (capture) {
      child.stdout?.on('data', (chunk) => {
        stdout += chunk.toString()
      })
      child.stderr?.on('data', (chunk) => {
        stderr += chunk.toString()
      })
    }

    const finish = (callback) => {
      if (settled) return
      settled = true
      if (activeChild === child) activeChild = null
      callback()
    }

    child.once('error', (error) => {
      finish(() => reject(new CommandError(executable, args, 'spawn', error.message)))
    })
    child.once('close', (code, signal) => {
      finish(() => {
        if (code === 0) {
          resolve(capture ? stdout.trim() : undefined)
          return
        }
        reject(new CommandError(executable, args, signal ?? code, stderr))
      })
    })
  })

  return {
    runCommand,
    abortActiveStep(signalName) {
      if (activeChild && !activeChild.killed) activeChild.kill(signalName)
    },
  }
}

function combineCleanupErrors(errors) {
  if (errors.length === 1) return errors[0]
  return new Error(errors.map((error) => error.message).join('\n'))
}

export function createProductionDependencies({
  cwd = process.cwd(),
  platform = process.platform,
  runner = createCommandRunner(),
} = {}) {
  const executables = resolveExecutables(platform)
  let repositoryRoot = cwd
  let workspace = null

  const getOptionalGitValue = async (args) => {
    try {
      return await runner.runCommand('git', args, { cwd, capture: true })
    } catch (error) {
      if (error instanceof CommandError) return null
      throw error
    }
  }

  return {
    async getRepositoryRoot() {
      const resolvedRoot = await getOptionalGitValue(['rev-parse', '--show-toplevel'])
      if (resolvedRoot) repositoryRoot = path.resolve(resolvedRoot)
      return resolvedRoot ? repositoryRoot : null
    },
    ensureVercelCli: () => runner.runCommand(executables.vercel, ['--version'], {
      cwd: repositoryRoot,
      capture: true,
    }),
    getBranch: () => getOptionalGitValue(['symbolic-ref', '--quiet', '--short', 'HEAD']),
    getHead: () => runner.runCommand('git', ['rev-parse', 'HEAD'], {
      cwd: repositoryRoot,
      capture: true,
    }),
    getUpstream: () => getOptionalGitValue(['rev-parse', '--verify', '@{upstream}']),
    async readProjectLink() {
      const source = path.join(repositoryRoot, '.vercel', 'project.json')
      try {
        return parseProjectLink(await fs.readFile(source, 'utf8'))
      } catch (error) {
        if (error.message.startsWith('Vínculo inválido')) throw error
        throw new Error('Vínculo da Vercel ausente. Execute `vercel link` no projeto principal.')
      }
    },
    async createWorktree(head) {
      workspace = await createWorktreeWorkspace({
        repositoryRoot,
        head,
        runCommand: runner.runCommand,
      })
    },
    installRoot: () => runner.runCommand(
      executables.npm,
      ['ci', '--ignore-scripts', '--no-audit'],
      { cwd: workspace.worktreeRoot },
    ),
    installStudio: () => runner.runCommand(
      executables.npm,
      ['ci', '--ignore-scripts', '--no-audit', '--prefix', 'studio'],
      { cwd: workspace.worktreeRoot },
    ),
    runTests: () => runner.runCommand(
      executables.npm,
      ['test', '--', '--testTimeout', '20000'],
      { cwd: workspace.worktreeRoot },
    ),
    runBuild: () => runner.runCommand(
      executables.npm,
      ['run', 'build'],
      {
        cwd: workspace.worktreeRoot,
        env: { ...process.env, VITE_SITE_URL: PUBLIC_SITE_URL },
      },
    ),
    copyProjectLink: () => prepareProjectLink({
      mainRoot: repositoryRoot,
      worktreeRoot: workspace.worktreeRoot,
    }),
    deployVercel: () => runner.runCommand(
      executables.vercel,
      ['deploy', '--prod', '--yes'],
      { cwd: workspace.worktreeRoot },
    ),
    async cleanup() {
      const errors = []

      try {
        await runner.runCommand(
          'git',
          ['worktree', 'remove', '--force', workspace.worktreeRoot],
          { cwd: repositoryRoot },
        )
      } catch (error) {
        errors.push(error)
      }
      try {
        await runner.runCommand('git', ['worktree', 'prune'], { cwd: repositoryRoot })
      } catch (error) {
        errors.push(error)
      }
      try {
        await fs.rm(workspace.temporaryRoot, { recursive: true, force: true })
      } catch (error) {
        errors.push(error)
      }

      workspace = null
      if (errors.length) throw combineCleanupErrors(errors)
    },
    abortActiveStep: runner.abortActiveStep,
    registerSignalHandlers(handler) {
      const onSigint = () => handler('SIGINT')
      const onSigterm = () => handler('SIGTERM')
      process.on('SIGINT', onSigint)
      process.on('SIGTERM', onSigterm)
      return () => {
        process.off('SIGINT', onSigint)
        process.off('SIGTERM', onSigterm)
      }
    },
  }
}

export async function deployProduction(dependencies) {
  let signalError = null
  let worktreeCreated = false
  let primaryError = null
  let cleanupError = null

  const requestAbort = (signalName) => {
    signalError ??= new DeploymentSignalError(signalName)
    dependencies.abortActiveStep(signalName)
  }
  const unregisterSignalHandlers = dependencies.registerSignalHandlers(requestAbort)
  const throwIfAborted = () => {
    if (signalError) throw signalError
  }

  try {
    const root = await dependencies.getRepositoryRoot()
    throwIfAborted()
    if (!root) throw new Error('O comando deve ser executado dentro de um repositório Git.')

    await dependencies.ensureVercelCli()
    throwIfAborted()
    const branch = await dependencies.getBranch()
    throwIfAborted()
    if (!branch) throw new Error('HEAD destacado: faça o deploy a partir de uma branch com upstream.')

    const head = await dependencies.getHead()
    throwIfAborted()
    const upstream = await dependencies.getUpstream(branch)
    throwIfAborted()
    if (!upstream) throw new Error(`A branch ${branch} não possui upstream.`)
    if (head !== upstream) {
      throw new Error(`HEAD ${head.slice(0, 7)} difere do upstream ${upstream.slice(0, 7)}.`)
    }

    const link = await dependencies.readProjectLink()
    throwIfAborted()
    await dependencies.createWorktree(head)
    worktreeCreated = true
    throwIfAborted()
    await dependencies.installRoot()
    throwIfAborted()
    await dependencies.installStudio()
    throwIfAborted()
    await dependencies.runTests()
    throwIfAborted()
    await dependencies.runBuild()
    throwIfAborted()
    await dependencies.copyProjectLink(link)
    throwIfAborted()
    await dependencies.deployVercel()
    throwIfAborted()
  } catch (error) {
    primaryError = signalError ?? error
  } finally {
    if (worktreeCreated) {
      try {
        await dependencies.cleanup()
      } catch (error) {
        cleanupError = error
      }
    }
    unregisterSignalHandlers()
  }

  primaryError ??= signalError
  if (primaryError && cleanupError) throw new DeploymentCleanupError(primaryError, cleanupError)
  if (primaryError) throw primaryError
  if (cleanupError) throw cleanupError
}

export async function main() {
  await deployProduction(createProductionDependencies())
  console.log('Publicação de produção concluída a partir do commit limpo.')
}

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href

if (isMain) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = error instanceof DeploymentSignalError ? error.exitCode : 1
  })
}
