import { defineArrayMember, defineField, defineType } from 'sanity'

export const customerTestimonialType = defineType({
  name: 'customerTestimonial',
  title: 'Depoimentos',
  type: 'document',
  fields: [
    defineField({
      name: 'clientName',
      title: 'Nome da pessoa',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'company',
      title: 'Empresa',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Cargo',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'string',
      description: 'Exemplo: Industria, Saude, Tecnologia ou Servicos.',
    }),
    defineField({
      name: 'avatar',
      title: 'Foto da pessoa',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'shortQuote',
      title: 'Depoimento curto para a Home',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'showOnCases',
      title: 'Mostrar na pagina Cases',
      type: 'boolean',
      description: 'Quando desligado, o depoimento continua aparecendo apenas na Home.',
      initialValue: false,
    }),
    defineField({
      name: 'detailedQuote',
      title: 'Depoimento detalhado para Cases',
      type: 'text',
      rows: 6,
      description: 'Texto completo exibido na secao Testemunhais da pagina Cases.',
      hidden: ({ parent }) => parent?.showOnCases === false,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context?.parent?.showOnCases && !value) {
            return 'Preencha o depoimento detalhado para exibir na pagina Cases.'
          }

          return true
        }),
    }),
    defineField({
      name: 'metrics',
      title: 'Indicadores do testemunhal',
      type: 'array',
      hidden: ({ parent }) => parent?.showOnCases === false,
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Indicador',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'value',
              title: 'Valor',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'value',
            },
          },
        }),
      ],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: 'sortOrder',
      title: 'Ordem de exibicao',
      type: 'number',
      description: 'Numeros menores aparecem primeiro.',
    }),
    defineField({
      name: 'isVisible',
      title: 'Exibir no site',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'clientName',
      subtitle: 'company',
      media: 'avatar',
    },
  },
})
