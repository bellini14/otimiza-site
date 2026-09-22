let scriptPromise
export function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      const fail = () => {
        clearTimeout(timer)
        script.remove()
        scriptPromise = undefined
        reject(new Error('Verificação de segurança indisponível.'))
      }
      const timer = setTimeout(fail, 12000)
      script.onerror = fail
      script.onload = () => {
        if (!window.turnstile) return fail()
        clearTimeout(timer)
        resolve(window.turnstile)
      }
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}
