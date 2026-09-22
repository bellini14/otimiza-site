export async function sendMailWithDeadline(transport, message) {
  let timer
  try {
    return await Promise.race([
      transport.sendMail(message),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          transport.close?.()
          reject(new Error('Email delivery deadline exceeded'))
        }, 20000)
      }),
    ])
  } finally {
    clearTimeout(timer)
    transport.close?.()
  }
}
