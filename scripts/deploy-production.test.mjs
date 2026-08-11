import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DeploymentSignalError,
  createWorktreeWorkspace,
  deployProduction,
  parseProjectLink,
  prepareProjectLink,
  resolveExecutables,
} from './deploy-production.mjs'

const temporaryDirectories = []

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => (
      fs.rm(directory, { recursive: true, force: true })
    )),
  )
})

function makeDependencies(overrides = {}) {
  const events = []
  const head = 'a'.repeat(40)
  let signalHandler

  const dependencies = {
    getRepositoryRoot: vi.fn(async () => {
      events.push('git:root')
      return 'C:/repo'
    }),
    ensureVercelCli: vi.fn(async () => events.push('vercel:version')),
    getBranch: vi.fn(async () => {
      events.push('git:branch')
      return 'publish/site'
    }),
    getHead: vi.fn(async () => {
      events.push('git:head')
      return head
    }),
    getUpstream: vi.fn(async () => {
      events.push('git:upstream')
      return head
    }),
    readProjectLink: vi.fn(async () => {
      events.push('link:read')
      return { orgId: 'org_123', projectId: 'prj_456' }
    }),
    createWorktree: vi.fn(async (capturedHead) => {
      events.push(`worktree:create:${capturedHead}`)
    }),
    installRoot: vi.fn(async () => events.push('npm:ci')),
    installStudio: vi.fn(async () => events.push('npm:ci:studio')),
    runTests: vi.fn(async () => events.push('npm:test')),
    runBuild: vi.fn(async () => events.push('npm:build')),
    copyProjectLink: vi.fn(async () => events.push('link:copy')),
    deployVercel: vi.fn(async () => events.push('vercel:deploy')),
    cleanup: vi.fn(async () => events.push('worktree:cleanup')),
    abortActiveStep: vi.fn((signalName) => events.push(`abort:${signalName}`)),
    registerSignalHandlers: vi.fn((handler) => {
      signalHandler = handler
      return () => {}
    }),
    ...overrides,
  }

  return {
    dependencies,
    events,
    head,
    sendSignal(signalName) {
      signalHandler(signalName)
    },
  }
}

describe('deployProduction', () => {
  it('reports a directory outside Git separately from detached HEAD', async () => {
    const context = makeDependencies({ getRepositoryRoot: vi.fn(async () => null) })

    await expect(deployProduction(context.dependencies)).rejects.toThrow(
      'dentro de um repositório Git',
    )
    expect(context.dependencies.getBranch).not.toHaveBeenCalled()
    expect(context.dependencies.createWorktree).not.toHaveBeenCalled()
  })

  it('rejects a detached HEAD before creating a worktree', async () => {
    const context = makeDependencies({ getBranch: vi.fn(async () => null) })

    await expect(deployProduction(context.dependencies)).rejects.toThrow('HEAD destacado')
    expect(context.dependencies.createWorktree).not.toHaveBeenCalled()
  })

  it('rejects a missing upstream before creating a worktree', async () => {
    const context = makeDependencies({ getUpstream: vi.fn(async () => null) })

    await expect(deployProduction(context.dependencies)).rejects.toThrow('não possui upstream')
    expect(context.dependencies.createWorktree).not.toHaveBeenCalled()
  })

  it('rejects when the captured HEAD differs from upstream', async () => {
    const context = makeDependencies({ getUpstream: vi.fn(async () => 'b'.repeat(40)) })

    await expect(deployProduction(context.dependencies)).rejects.toThrow(
      'HEAD aaaaaaa difere do upstream bbbbbbb',
    )
    expect(context.dependencies.createWorktree).not.toHaveBeenCalled()
  })

  it('uses the captured immutable hash and runs every guarded step in order', async () => {
    const context = makeDependencies()

    await deployProduction(context.dependencies)

    expect(context.events).toEqual([
      'git:root',
      'vercel:version',
      'git:branch',
      'git:head',
      'git:upstream',
      'link:read',
      `worktree:create:${context.head}`,
      'npm:ci',
      'npm:ci:studio',
      'npm:test',
      'npm:build',
      'link:copy',
      'vercel:deploy',
      'worktree:cleanup',
    ])
  })

  it.each(['runTests', 'runBuild'])('does not deploy after %s fails', async (step) => {
    const context = makeDependencies({
      [step]: vi.fn(async () => {
        context.events.push(step === 'runTests' ? 'npm:test' : 'npm:build')
        throw new Error(`${step} failed`)
      }),
    })

    await expect(deployProduction(context.dependencies)).rejects.toThrow(`${step} failed`)
    expect(context.dependencies.deployVercel).not.toHaveBeenCalled()
    expect(context.dependencies.cleanup).toHaveBeenCalledOnce()
  })

  it.each([
    ['SIGINT', 130],
    ['SIGTERM', 143],
  ])('forwards %s and cleans up after the active step unwinds', async (signalName, exitCode) => {
    const context = makeDependencies()
    context.dependencies.installRoot.mockImplementationOnce(async () => {
      context.events.push('npm:ci')
      context.sendSignal(signalName)
    })

    const error = await deployProduction(context.dependencies).catch((caught) => caught)

    expect(error).toBeInstanceOf(DeploymentSignalError)
    expect(error.exitCode).toBe(exitCode)
    expect(context.events).toContain(`abort:${signalName}`)
    expect(context.dependencies.installStudio).not.toHaveBeenCalled()
    expect(context.dependencies.cleanup).toHaveBeenCalledOnce()
  })

  it('reports cleanup failure without hiding the original failure', async () => {
    const context = makeDependencies({
      runTests: vi.fn(async () => {
        throw new Error('tests failed')
      }),
      cleanup: vi.fn(async () => {
        throw new Error('cleanup failed')
      }),
    })

    const error = await deployProduction(context.dependencies).catch((caught) => caught)

    expect(error.message).toContain('tests failed')
    expect(error.message).toContain('cleanup failed')
    expect(context.dependencies.deployVercel).not.toHaveBeenCalled()
  })

  it('fails after a successful deploy when cleanup fails', async () => {
    const context = makeDependencies({
      cleanup: vi.fn(async () => {
        throw new Error('cleanup failed')
      }),
    })

    await expect(deployProduction(context.dependencies)).rejects.toThrow('cleanup failed')
    expect(context.dependencies.deployVercel).toHaveBeenCalledOnce()
  })
})

describe('deployment adapters', () => {
  it('accepts only non-empty orgId and projectId in project.json', () => {
    expect(parseProjectLink('{"orgId":"org","projectId":"project","extra":true}')).toEqual({
      orgId: 'org',
      projectId: 'project',
    })
    expect(() => parseProjectLink('{"orgId":"","projectId":"project"}')).toThrow('Vínculo inválido')
    expect(() => parseProjectLink('{"orgId":"org"}')).toThrow('Vínculo inválido')
    expect(() => parseProjectLink('not-json')).toThrow('Vínculo inválido')
  })

  it('copies only a normalized project.json into the clean worktree', async () => {
    const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'otimiza-link-test-'))
    temporaryDirectories.push(fixtureRoot)
    const mainRoot = path.join(fixtureRoot, 'main')
    const worktreeRoot = path.join(fixtureRoot, 'worktree')
    await fs.mkdir(path.join(mainRoot, '.vercel'), { recursive: true })
    await fs.mkdir(worktreeRoot, { recursive: true })
    await fs.writeFile(
      path.join(mainRoot, '.vercel', 'project.json'),
      JSON.stringify({ orgId: 'org', projectId: 'project', projectName: 'otimiza' }),
    )
    await fs.writeFile(path.join(mainRoot, '.vercel', 'other.json'), '{"secret":true}')
    await fs.writeFile(path.join(mainRoot, 'dirty-local-file.txt'), 'do not copy')

    await prepareProjectLink({ mainRoot, worktreeRoot })

    expect(await fs.readdir(path.join(worktreeRoot, '.vercel'))).toEqual(['project.json'])
    expect(
      JSON.parse(await fs.readFile(path.join(worktreeRoot, '.vercel', 'project.json'), 'utf8')),
    ).toEqual({ orgId: 'org', projectId: 'project' })
    await expect(fs.access(path.join(worktreeRoot, 'dirty-local-file.txt'))).rejects.toThrow()
  })

  it('uses command shims on Windows without enabling a shell', () => {
    expect(resolveExecutables('win32')).toEqual({ npm: 'npm.cmd', vercel: 'vercel.cmd' })
    expect(resolveExecutables('linux')).toEqual({ npm: 'npm', vercel: 'vercel' })
  })

  it('removes the temporary root when git worktree add fails', async () => {
    const removed = []
    const temporaryRoot = path.join(os.tmpdir(), 'otimiza-deploy-failed')

    await expect(createWorktreeWorkspace({
      repositoryRoot: 'C:/repo',
      head: 'a'.repeat(40),
      createTemporaryRoot: vi.fn(async () => temporaryRoot),
      runCommand: vi.fn(async () => {
        throw new Error('worktree add failed')
      }),
      removeDirectory: vi.fn(async (directory) => removed.push(directory)),
    })).rejects.toThrow('worktree add failed')

    expect(removed).toEqual([temporaryRoot])
  })
})
