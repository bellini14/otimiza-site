// Gera o e-mail do comunicado de segurança em outputs/ para envio manual (RD Station, Outlook etc.).
import fs from 'node:fs'
import path from 'node:path'
import { buildNotaOficialEmail } from '../api/_lib/notaOficialEmail.js'

const outDir = path.resolve('outputs')
fs.mkdirSync(outDir, { recursive: true })
const { subject, html, text } = buildNotaOficialEmail()
fs.writeFileSync(path.join(outDir, 'email-nota-oficial.html'), html)
fs.writeFileSync(path.join(outDir, 'email-nota-oficial.txt'), `Assunto: ${subject}\n\n${text}\n`)
console.log(`Assunto: ${subject}`)
console.log(`Gerado: ${path.join(outDir, 'email-nota-oficial.html')}`)
