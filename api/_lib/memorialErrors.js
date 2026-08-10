export class MemorialError extends Error {
  constructor(code, message, status = 400) {
    super(message)
    this.name = 'MemorialError'
    this.code = code
    this.status = status
  }
}

export function sendMemorialError(res, error) {
  if (error instanceof MemorialError) {
    return res.status(error.status).json({
      error: { code: error.code, message: error.message },
    })
  }
  console.error('Memorial request failed.', error)
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Não foi possível concluir agora. Tente novamente.',
    },
  })
}
