export function rejectMemorialWrite(req, res, allow = '') {
  res.setHeader('Allow', allow)
  res.setHeader('Cache-Control', 'no-store')
  return res.status(405).json({
    error: { code: 'MEMORIAL_READ_ONLY', message: 'O memorial está disponível apenas para leitura.' },
  })
}
