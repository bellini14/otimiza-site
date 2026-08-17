import { defineArrayMember, defineField, defineType } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'TÃ­tulo',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eyebrow',
      title: 'Categoria (Eyebrow)',
      type: 'string',
      description: 'Ex: Tecnologia, EstratÃ©gia, GestÃ£o',
    }),
    defineField({
      name: 'description',
      title: 'Resumo / DescriÃ§Ã£o',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'mainImage',
      title: 'Imagem Destacada (SEO/Redes Sociais)',
      description: 'Usada como capa do link quando o artigo for compartilhado nas redes sociais.',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data de PublicaÃ§Ã£o',
      type: 'datetime',
    }),
    defineField({
      name: 'content',
      title: 'ConteÃºdo',
      type: 'array',
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              title: 'Texto alternativo',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Legenda',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'relatedContent',
      title: 'Conteúdo relacionado',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'enabled', title: 'Exibir conteúdo relacionado', type: 'boolean', initialValue: false }),
        defineField({
          name: 'type', title: 'Tipo de galeria', type: 'string',
          options: { layout: 'radio', list: [{ title: 'Galeria de imagens', value: 'images' }, { title: 'Galeria de posts', value: 'posts' }] },
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: 'images', title: 'Imagens', type: 'array',
          of: [defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', title: 'Texto alternativo', type: 'string' })] })],
          hidden: ({ parent }) => !parent?.enabled || parent?.type !== 'images',
        }),
        defineField({
          name: 'posts', title: 'Posts relacionados', type: 'array',
          of: [defineArrayMember({ type: 'reference', to: [{ type: 'post' }] })],
          hidden: ({ parent }) => !parent?.enabled || parent?.type !== 'posts',
        }),
      ],
    }),
  ],
})
