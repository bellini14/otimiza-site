import { defineField, defineType } from 'sanity'

export const clientSectorOptions = [
  { title: 'Alimentos, Bebidas e Supermercados', value: 'Alimentos, Bebidas e Supermercados' },
  {
    title: 'Associações, Fundações e Órgãos Públicos',
    value: 'Associações, Fundações e Órgãos Públicos',
  },
  { title: 'Bancos', value: 'Bancos' },
  { title: 'Comércio e Distribuidoras', value: 'Comércio e Distribuidoras' },
  {
    title: 'Educação, Editora e Outros Serviços',
    value: 'Educação, Editora e Outros Serviços',
  },
  { title: 'Energia', value: 'Energia' },
  { title: 'Indústria', value: 'Indústria' },
  {
    title: 'Informática, Consultoria e Tecnologia',
    value: 'Informática, Consultoria e Tecnologia',
  },
  { title: 'Logística e Transportes', value: 'Logística e Transportes' },
  { title: 'Móveis', value: 'Móveis' },
  { title: 'Saúde', value: 'Saúde' },
  { title: 'Vestuário e Calçados', value: 'Vestuário e Calçados' },
  { title: 'Serviços', value: 'Serviços' },
]

export const clientLogoType = defineType({
  name: 'clientLogo',
  title: 'Clientes',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nome do cliente',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sector',
      title: 'Área de atuação',
      type: 'string',
      options: {
        list: clientSectorOptions,
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logotipo',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logoAlt',
      title: 'Texto alternativo do logotipo',
      type: 'string',
      description: 'Se ficar vazio, o site usa o nome do cliente.',
    }),
    defineField({
      name: 'website',
      title: 'Site do cliente',
      type: 'url',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Ordem de exibição',
      type: 'number',
      description: 'Números menores aparecem primeiro dentro da área de atuação.',
    }),
    defineField({
      name: 'isVisible',
      title: 'Exibir no site',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showOnHome',
      title: 'O logotipo aparece na home',
      type: 'boolean',
      description: 'Marque para publicar este logotipo na seção principal de clientes da home.',
      initialValue: false,
    }),
    defineField({
      name: 'showOnCases',
      title: 'O logotipo aparece na página Cases',
      type: 'boolean',
      description: 'Marque para publicar este logotipo na página de Cases.',
      initialValue: true,
    }),
    defineField({
      name: 'showOnNossaAbordagem',
      title: 'Aparece na pÃ¡gina Nossa abordagem?',
      type: 'boolean',
      description: 'Marque para exibir este logotipo no carrossel da pÃ¡gina Nossa abordagem.',
      initialValue: false,
    }),
    defineField({
      name: 'caseTitle',
      title: 'Título na página Cases',
      type: 'string',
      description: 'Título exibido junto ao logotipo na página de Cases.',
      hidden: ({ parent }) => parent?.showOnCases === false,
    }),
    defineField({
      name: 'caseDescription',
      title: 'Descrição na página Cases',
      type: 'text',
      rows: 3,
      description: 'Descrição curta exibida junto ao logotipo na página de Cases.',
      hidden: ({ parent }) => parent?.showOnCases === false,
    }),
    defineField({
      name: 'caseSlug',
      title: 'Slug da página do case',
      type: 'slug',
      description: 'Define a URL do case, por exemplo /cases/banco-moneo.',
      options: {
        source: 'name',
      },
      hidden: ({ parent }) => parent?.showOnCases === false,
    }),
    defineField({
      name: 'caseContent',
      title: 'Conteúdo da página do case',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Conteúdo completo exibido na página individual do case.',
      hidden: ({ parent }) => parent?.showOnCases === false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'sector',
      media: 'logo',
    },
  },
})
