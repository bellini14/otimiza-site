import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PostDetail from './PostDetail'
import { client } from '../lib/sanity'

vi.mock('../lib/sanity', () => ({
  client: {
    fetch: vi.fn(),
  },
  urlFor: vi.fn((source) => ({
    width: vi.fn(() => ({
      url: () => source?.assetUrl ?? source?.asset?._ref ?? 'https://cdn.sanity.io/images/fallback.jpg',
    })),
  })),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('PostDetail', () => {
  it('renders inline body images and captions from portable text', async () => {
    client.fetch.mockResolvedValue({
      title: 'Post com imagem inline',
      description: 'Resumo do post',
      publishedAt: '2026-04-13T12:00:00Z',
      eyebrow: 'Insights',
      mainImage: null,
      content: [
        {
          _type: 'block',
          _key: 'intro',
          style: 'normal',
          markDefs: [],
          children: [
            {
              _type: 'span',
              _key: 'intro-span',
              marks: [],
              text: 'Parágrafo de abertura.',
            },
          ],
        },
        {
          _type: 'image',
          _key: 'body-image',
          alt: 'Equipe em workshop',
          caption: 'Workshop com o time do cliente.',
          assetUrl: 'https://cdn.sanity.io/images/demo/workshop.jpg',
          asset: {
            _ref: 'image-demo-workshop-1200x800-jpg',
          },
        },
      ],
    })

    render(
      <MemoryRouter initialEntries={['/insights-e-blog/post-com-imagem-inline']}>
        <Routes>
          <Route path="/insights-e-blog/:slug" element={<PostDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Post com imagem inline' })).toBeInTheDocument()
    expect(screen.getByText('Parágrafo de abertura.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Equipe em workshop' })).toHaveAttribute(
      'src',
      'https://cdn.sanity.io/images/demo/workshop.jpg',
    )
    expect(screen.getByText('Workshop com o time do cliente.')).toBeInTheDocument()
  })
})
