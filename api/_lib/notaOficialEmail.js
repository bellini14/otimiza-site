import { eyebrow, shell } from './guideEmail.js'

const SITE = 'https://www.otm.com.br'
export const NOTA_OFICIAL_URL = `${SITE}/nota-oficial`

const INK = '#2b333c'
const BODY = '#5a6572'
const MUTED = '#7b8490'
const RED = '#e02020'
const PAPER = '#f2f1ec'
const LINE = '#e3e1da'
const FONT = 'Arial,Helvetica,sans-serif'

const IDENTITY = [
  ['Razão social', 'Otimiza Consultoria em Administração Ltda.'],
  ['CNPJ', '00.287.054/0001-80'],
  ['Site oficial', `<a href="${SITE}" style="color:${INK};text-decoration:underline">www.otm.com.br</a>`, 'www.otm.com.br'],
  ['E-mail', `Comunicações somente pelo domínio <strong>@otm.com.br</strong>`, 'Comunicações realizadas exclusivamente pelo domínio @otm.com.br'],
  ['Telefone', `<a href="tel:+555432116045" style="color:${INK};text-decoration:none">(54) 3211-6045</a>`, '(54) 3211-6045'],
]

const p = (html, extra = '') => `<p style="margin:0 0 18px;font-size:16px;line-height:26px;${extra}">${html}</p>`

export function buildNotaOficialEmail() {
  const rows = IDENTITY.map(([label, value], index) => {
    const border = index > 0 ? `border-top:1px solid ${LINE};` : ''
    return `<tr><td width="34%" valign="top" style="padding:13px 0;${border}font-family:${FONT};font-size:11px;line-height:20px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${BODY}">${label}</td><td style="padding:13px 0;${border}font-family:${FONT};font-size:15px;line-height:21px;font-weight:600;color:${INK}">${value}</td></tr>`
  }).join('')

  const body = `<tr><td class="pad" style="padding:40px 40px 34px;font-family:${FONT};color:${BODY}">${eyebrow('Comunicado importante')}<h1 style="margin:0 0 22px;font-size:34px;line-height:40px;font-weight:600;letter-spacing:-0.5px;color:${RED}">Atenção a contatos e cobranças em nosso nome.</h1><p style="margin:0 0 10px;font-size:17px;line-height:27px;font-weight:bold;color:${INK}">Prezados clientes, parceiros e fornecedores,</p>`
    + p('Identificamos relatos de contatos comerciais, solicitações de pagamento e cobranças realizados por terceiros que utilizam o nome Otimiza ou denominações semelhantes à nossa empresa. Diante disso, queremos esclarecer e reforçar alguns pontos importantes para sua segurança.')
    + p(`A <strong style="color:${INK}">Otimiza Consultoria em Administração Ltda.</strong> não possui qualquer vínculo societário, comercial ou operacional com outras empresas de nome semelhante que estejam realizando essas abordagens. Nossa sede é única e exclusiva em Caxias do Sul/RS.`, 'margin-bottom:0')
    + `</td></tr>`
    + `<tr><td class="pad" style="padding:0 40px 34px;font-family:${FONT}"><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:${PAPER};border-radius:12px"><tr><td style="padding:24px 26px 14px;font-family:${FONT}"><p style="margin:0 0 8px;padding-left:14px;border-left:2px solid ${RED};font-size:17px;line-height:24px;font-weight:600;color:${INK}">Para evitar qualquer equívoco ou possível fraude</p><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">${rows}</table></td></tr></table></td></tr>`
    + `<tr><td class="pad" style="padding:4px 40px 10px;border-top:1px solid ${LINE};font-family:${FONT};color:${BODY}"><p style="margin:30px 0 18px;font-size:16px;line-height:26px">Toda cobrança legítima emitida por nossa empresa deve identificar como beneficiária a <strong style="color:${INK}">Otimiza Consultoria em Administração Ltda., CNPJ 00.287.054/0001-80</strong>. Não autorizamos pagamentos em contas de pessoas físicas ou de outras pessoas jurídicas.</p><p style="margin:0 0 24px;padding-left:20px;border-left:2px solid ${RED};font-size:19px;line-height:28px;font-weight:600;color:${INK}">Antes de realizar qualquer pagamento ou compartilhar informações, confira atentamente a razão social e o CNPJ do beneficiário.</p>`
    + p('Em caso de dúvida, não efetue a operação e entre em contato diretamente conosco pelos canais oficiais.')
    + p('Estamos adotando as medidas cabíveis junto às autoridades competentes para o registro dos fatos e a preservação de nossos direitos.')
    + p('Reforçamos nosso compromisso com a transparência, a segurança e a confiança nas relações que construímos há mais de 30 anos.', 'margin-bottom:28px')
    + `<table role="presentation" border="0" cellspacing="0" cellpadding="0" class="cta"><tr><td align="center" bgcolor="${RED}" style="background:${RED};border-radius:999px"><a href="${NOTA_OFICIAL_URL}" style="display:inline-block;padding:16px 30px;border-radius:999px;font-family:${FONT};font-size:16px;line-height:22px;font-weight:bold;text-decoration:none;color:#ffffff">Leia a nota oficial no site &rarr;</a></td></tr></table><p style="margin:14px 0 0;font-size:13px;line-height:20px;color:${MUTED}">Dúvidas? Ligue para <a href="tel:+555432116045" style="color:${BODY};text-decoration:underline">(54) 3211-6045</a> ou escreva para <a href="mailto:otm@otm.com.br" style="color:${BODY};text-decoration:underline">otm@otm.com.br</a>.</p></td></tr>`
    + `<tr><td class="pad" style="padding:30px 40px 40px;font-family:${FONT}"><p style="margin:0;font-size:15px;line-height:22px;color:${BODY}">Atenciosamente,</p><p style="margin:6px 0 0;font-size:15px;line-height:22px;font-weight:bold;color:${INK}">Otimiza Consultoria em Administração Ltda.</p><p style="margin:2px 0 0;font-size:14px;line-height:21px;color:${MUTED}">Caxias do Sul – RS · www.otm.com.br · (54) 3211-6045</p></td></tr>`

  const html = shell({
    title: 'Comunicado importante: atenção a cobranças em nome da Otimiza',
    preheader: 'Confira a razão social e o CNPJ antes de qualquer pagamento. Nossos canais oficiais estão neste e-mail.',
    body,
  })

  const text = [
    'COMUNICADO IMPORTANTE', '',
    'Prezados clientes, parceiros e fornecedores,', '',
    'Identificamos relatos de contatos comerciais, solicitações de pagamento e cobranças realizados por terceiros que utilizam o nome Otimiza ou denominações semelhantes à nossa empresa.',
    'Diante disso, queremos esclarecer e reforçar alguns pontos importantes para sua segurança.', '',
    'A Otimiza Consultoria em Administração Ltda. não possui qualquer vínculo societário, comercial ou operacional com outras empresas de nome semelhante que estejam realizando essas abordagens. Nossa sede é única e exclusiva em Caxias do Sul/RS.', '',
    'Para evitar qualquer equívoco ou possível fraude, destacamos:',
    ...IDENTITY.map(([label, value, plain]) => `- ${label}: ${plain || value}`), '',
    'Toda cobrança legítima emitida por nossa empresa deve identificar como beneficiária a Otimiza Consultoria em Administração Ltda., CNPJ 00.287.054/0001-80. Não autorizamos pagamentos em contas de pessoas físicas ou de outras pessoas jurídicas.', '',
    'Nossa recomendação: antes de realizar qualquer pagamento ou compartilhar informações, confira atentamente a razão social e o CNPJ do beneficiário. Em caso de dúvida, não efetue a operação e entre em contato diretamente conosco pelos canais oficiais.', '',
    'Estamos adotando as medidas cabíveis junto às autoridades competentes para o registro dos fatos e a preservação de nossos direitos.', '',
    'Reforçamos nosso compromisso com a transparência, a segurança e a confiança nas relações que construímos há mais de 30 anos.', '',
    `Nota oficial: ${NOTA_OFICIAL_URL}`, '',
    'Atenciosamente,',
    'OTIMIZA CONSULTORIA EM ADMINISTRAÇÃO LTDA.',
    'Otimiza | Caxias do Sul – RS',
    'www.otm.com.br',
    '(54) 3211-6045',
  ].join('\n')

  return { subject: 'Comunicado importante: atenção a cobranças em nome da Otimiza', html, text }
}
