import { describe, expect, it, vi } from 'vitest'
import { htmlToPortableText } from './wordpressPortableText.mjs'

describe('htmlToPortableText', () => {
  it('preserves inline images between text blocks', async () => {
    const uploadImage = vi.fn(async ({ imageUrl }) => ({
      asset: {
        _type: 'reference',
        _ref: `image-${imageUrl.split('/').at(-1)}`,
      },
    }))

    const blocks = await htmlToPortableText(
      `
        <p>Introdução do post.</p>
        <p><a href="https://www.otm.com.br/workshop"><img src="https://www.otm.com.br/uploads/workshop.jpg" alt="Equipe em workshop" /></a></p>
        <p>Encerramento do post.</p>
      `,
      { uploadImage },
    )

    expect(uploadImage).toHaveBeenCalledWith({
      imageUrl: 'https://www.otm.com.br/uploads/workshop.jpg',
      alt: 'Equipe em workshop',
      caption: null,
    })
    expect(blocks.map((block) => block._type)).toEqual(['block', 'image', 'block'])
    expect(blocks[1]).toMatchObject({
      _type: 'image',
      alt: 'Equipe em workshop',
      asset: {
        _type: 'reference',
        _ref: 'image-workshop.jpg',
      },
    })
  })
})
