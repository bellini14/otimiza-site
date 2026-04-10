export const clientSectors = [
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
]

export function groupClientsBySector(clients) {
  return clientSectors
    .map((sector) => ({
      sector,
      clients: clients.filter((client) => client.sector === sector && client.logoUrl),
    }))
    .filter((group) => group.clients.length > 0)
}
