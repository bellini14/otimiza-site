import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))

export const validClientSectors = new Set([
  'Alimentos, Bebidas e Supermercados',
  'Associações, Fundações e Órgãos Públicos',
  'Bancos',
  'Comércio e Distribuidoras',
  'Educação, Editora e Outros Serviços',
  'Energia',
  'Indústria',
  'Informática, Consultoria e Tecnologia',
  'Logística e Transportes',
  'Móveis',
  'Saúde',
  'Vestuário e Calçados',
  'Serviços',
])

const records = [
  ['aes-brasil', 'AES Brasil', 'AES', 'Energia', '01-aes.png', 'https://www.aesbrasil.com.br/'],
  ['banco-moneo', 'Banco Moneo S.A.', 'Banco Moneo', 'Bancos', '02-moneo.png', 'https://www.bancomoneo.com.br/', ['Banco Moneo']],
  ['bebidas-fruki', 'Bebidas Fruki S.A.', 'Fruki Bebidas', 'Alimentos, Bebidas e Supermercados', '03-fruki.png', 'https://fruki.com.br/', ['Fruki']],
  ['bontempo', 'Bontempo – Novatempo Franchising Ltda.', 'Bontempo', 'Móveis', '04-bontempo.png', 'https://www.bontempo.com.br/', ['Bontempo']],
  ['brametal', 'Brametal – Metalúrgica Brandão S.A.', 'Brametal', 'Indústria', '05-brametal.svg', 'https://www.brametal.com.br/'],
  ['santa-clara', 'Cooperativa Santa Clara', 'Santa Clara', 'Alimentos, Bebidas e Supermercados', '06-santa-clara.png', 'https://www.coopsantaclara.com.br/'],
  ['engie-brasil', 'ENGIE Brasil Energia S.A.', 'ENGIE', 'Energia', '07-engie.svg', 'https://www.engie.com.br/'],
  ['fiergs', 'Federação das Indústrias do RS (FIERGS)', 'FIERGS', 'Associações, Fundações e Órgãos Públicos', '08-fiergs.png', 'https://www.fiergs.org.br/'],
  ['freios-controil', 'Freios Controil Ltda.', 'Controil', 'Indústria', '09-controil.jpg', 'https://controil.com.br/'],
  ['grendene', 'Grendene S.A.', 'Grendene', 'Vestuário e Calçados', '10-grendene.png', 'https://www.grendene.com.br/'],
  ['irmaos-fischer', 'Irmãos Fischer S.A. Ind. e Com.', 'Fischer', 'Indústria', '11-fischer.svg', 'https://www.fischer.com.br/'],
  ['hacker-turbinas', 'Hacker Turbinas Elétricas', 'Hacker', 'Indústria', '12-hacker.webp', 'https://www.hackerturbinas.com.br/'],
  ['lojas-colombo', 'Lojas Colombo S.A.', 'Lojas Colombo', 'Comércio e Distribuidoras', '13-colombo.svg', 'https://www.colombo.com.br/', ['Lojas Colombo']],
  ['marcopolo', 'Marcopolo S.A.', 'Marcopolo', 'Indústria', '14-marcopolo.svg', 'https://www.marcopolo.com.br/', ['Marcopolo']],
  ['metalurgica-siemsen', 'Metalúrgica Siemsen', 'Skymsen', 'Indústria', '15-skymsen.png', 'https://www.skymsen.com/'],
  ['moinho-do-nordeste', 'Moinho do Nordeste S.A.', 'Moinho do Nordeste', 'Alimentos, Bebidas e Supermercados', '16-moinho-nordeste.png', 'https://moinhodonordeste.com.br/'],
  ['moinhos-galopolis', 'Moinhos Galópolis S.A.', 'Roseflor', 'Alimentos, Bebidas e Supermercados', '17-roseflor.jpg', 'https://www.roseflor.com.br/'],
  ['pisani-plasticos', 'Pisani Plásticos S.A.', 'Pisani', 'Indústria', '18-pisani.svg', 'https://pisani.com.br/'],
  ['roni-da-silva-chaves', 'Roni da Silva Chaves', 'Roni Chaves', 'Comércio e Distribuidoras', '19-roni.png', 'https://ronichaves.com.br/'],
  ['sca-moveis', 'SCA Indústria de Móveis Ltda.', 'SCA', 'Móveis', '20-sca.svg', 'https://sca.com.br/'],
  ['sim-rede-de-postos', 'SIM Rede de Postos – Ditrento Postos e Logística Ltda.', 'SIM Rede de Postos', 'Comércio e Distribuidoras', '21-sim.png', 'https://www.simrede.com.br/', ['Postos SIM']],
  ['sulmaq-maquinas', 'Sulmaq Máquinas', 'Sulmaq', 'Indústria', '22-sulmaq.jpg', 'https://www.sulmaq.com.br/', ['Sulmaq']],
  ['tesouro-rs', 'Tesouro e Receita do Estado do RS', 'Tesouro do Estado RS', 'Associações, Fundações e Órgãos Públicos', '23-tesouro.png', 'https://tesouro.fazenda.rs.gov.br/'],
  ['unicasa', 'Unicasa Indústria de Móveis S.A.', 'Dell Anno', 'Móveis', '24-dellanno.svg', 'https://www.dellanno.com.br/', ['Unicasa']],
  ['unimed-porto-alegre', 'Unimed Porto Alegre', 'Unimed Porto Alegre', 'Saúde', '25-unimed-poa.png', 'https://www.unimedpoa.com.br/'],
  ['unimed-vtrp', 'Unimed Vales do Taquari e Rio Pardo', 'Unimed VTRP', 'Saúde', '26-unimed-vtrp.png', 'https://www.unimedvtrp.com.br/', ['Unimed VTRP']],
  ['zen', 'Zen S.A.', 'ZEN', 'Indústria', '27-zen.png', 'https://www.zensa.com.br/', ['Zen']],
]

const recolorWhiteFiles = new Set([
  '02-moneo.png',
  '05-brametal.svg',
  '13-colombo.svg',
  '16-moinho-nordeste.png',
  '24-dellanno.svg',
])

export const homeClientLogos = records.map(
  ([slug, name, logoAlt, sector, sourceFile, website, aliases = []], index) => ({
    id: `home-client-${slug}`,
    name,
    logoAlt,
    sector,
    sourceFile,
    sourcePath: path.join(scriptDirectory, 'sources', sourceFile),
    outputFile: `${String(index + 1).padStart(2, '0')}-${slug}.png`,
    website,
    aliases: [name, logoAlt, ...aliases],
    sortOrder: index + 1,
    recolorWhite: recolorWhiteFiles.has(sourceFile),
  }),
)

