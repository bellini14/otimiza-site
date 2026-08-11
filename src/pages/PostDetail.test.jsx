import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

function createJsonResponse(payload, ok = true, status = ok ? 200 : 500) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(payload),
  }
}

function buildPostResponse() {
  return {
    post: {
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
              text: 'Paragrafo de abertura.',
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
    },
    more: [],
  }
}

function renderPostDetail(initialEntry = '/inspire/post-com-imagem-inline') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/inspire/:slug" element={<PostDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

let fetchMock
let consoleErrorSpy

beforeEach(() => {
  client.fetch.mockResolvedValue(buildPostResponse())
  fetchMock = vi.fn()
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.stubGlobal('fetch', fetchMock)
  window.scrollTo = vi.fn()
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
  consoleErrorSpy.mockRestore()
})

describe('PostDetail', () => {
  it('resolves mapped urlFor output for inline images and social metadata', async () => {
    const legacySanityUrl = 'https://cdn.sanity.io/images/igy822g7/production/0122eed8d7195fe28022797c883bcb730ac02641-856x314.png?w=1200'
    const response = buildPostResponse()
    response.post.mainImage = { assetUrl: legacySanityUrl }
    response.post.content[1].assetUrl = legacySanityUrl
    client.fetch.mockResolvedValue(response)

    renderPostDetail()

    expect(await screen.findByRole('img', { name: 'Equipe em workshop' })).toHaveAttribute(
      'src',
      'https://www.otm.com.br/wp-content/uploads/2020/10/Screenshot_11.png',
    )
    expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://www.otm.com.br/wp-content/uploads/2020/10/Screenshot_11.png',
    )
  })

  it('lets native mouse-wheel scrolling reach the article column', () => {
    client.fetch.mockReturnValue(new Promise(() => {}))

    renderPostDetail()

    expect(document.querySelector('.post-detail__main')).toHaveAttribute('data-lenis-prevent-wheel')
  })

  it('keeps the entrance animation on an inner article layer', () => {
    client.fetch.mockReturnValue(new Promise(() => {}))

    renderPostDetail()

    expect(document.querySelector('.post-detail__main > .post-detail__content')).not.toBeNull()
  })

  it('starts the article entrance only after the Sanity content resolves', async () => {
    let resolvePost
    client.fetch.mockReturnValue(new Promise((resolve) => {
      resolvePost = resolve
    }))

    renderPostDetail({
      pathname: '/inspire/post-com-imagem-inline',
      state: {
        postPreview: {
          title: 'Post com imagem inline',
          description: 'Resumo do post',
          publishedAt: '2026-04-13T12:00:00Z',
          eyebrow: 'Insights',
        },
      },
    })

    expect(document.querySelector('.post-detail__content')).toHaveClass('post-detail__content--loading')
    expect(document.querySelector('.post-detail__content')).not.toHaveClass('post-detail__content--ready')
    expect(document.querySelector('.post-detail__hero-actions')).toHaveClass('post-detail__hero-actions--loading')
    expect(document.querySelector('.post-detail__hero-actions-placeholder')).not.toBeNull()

    resolvePost(buildPostResponse())

    await waitFor(() => {
      expect(document.querySelector('.post-detail__content')).toHaveClass('post-detail__content--ready')
    })
    expect(document.querySelector('.post-detail__hero-actions')).toHaveClass('post-detail__hero-actions--ready')
    expect(document.querySelector('.post-detail__hero-actions-row')).toHaveClass('post-detail__hero-actions-row--enter')
    expect(document.querySelector('.post-detail__hero-actions-placeholder')).toBeNull()
    expect(screen.getByText('Paragrafo de abertura.')).toBeInTheDocument()
  })

  it('renders an article loading shell immediately while the Sanity detail request is pending', () => {
    client.fetch.mockReturnValue(new Promise(() => {}))

    renderPostDetail()

    expect(screen.getByRole('link', { name: /voltar para inspire/i })).toHaveAttribute('href', '/inspire')
    expect(document.querySelector('.post-detail__loading-shell')).not.toBeNull()
    expect(document.querySelector('.animate-spin')).toBeNull()
  })

  it('renders the article shell immediately when navigation preview data is available', () => {
    client.fetch.mockReturnValue(new Promise(() => {}))

    renderPostDetail({
      pathname: '/inspire/post-com-imagem-inline',
      state: {
        postPreview: {
          title: 'Post com imagem inline',
          description: 'Resumo do post',
          publishedAt: '2026-04-13T12:00:00Z',
          eyebrow: 'Insights',
        },
      },
    })

    expect(screen.getByRole('heading', { name: 'Post com imagem inline' })).toBeInTheDocument()
    expect(screen.queryByText('Resumo do post')).not.toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeNull()
  })

  it('keeps the navigation preview visible when the Sanity refresh fails', async () => {
    client.fetch.mockRejectedValueOnce(new Error('sanity unavailable'))

    renderPostDetail({
      pathname: '/inspire/post-com-imagem-inline',
      state: {
        postPreview: {
          title: 'Post com imagem inline',
          description: 'Resumo do post',
          publishedAt: '2026-04-13T12:00:00Z',
          eyebrow: 'Insights',
        },
      },
    })

    await waitFor(() => {
      expect(client.fetch).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByRole('heading', { name: 'Post com imagem inline' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Post nao encontrado' })).not.toBeInTheDocument()
    expect(document.querySelector('.post-detail__hero-actions')).not.toBeNull()
  })

  it('renders inline body images, captions, and the fetched global like count', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))

    const { container } = renderPostDetail()

    const articleTitle = await screen.findByRole('heading', { name: 'Post com imagem inline' })
    expect(articleTitle).toBeInTheDocument()
    expect(articleTitle).toHaveClass('font-medium')
    expect(articleTitle).toHaveClass('tracking-[-0.015em]')
    expect(articleTitle).not.toHaveClass('tracking-[-0.04em]')
    expect(articleTitle).not.toHaveClass('font-bold')
    expect(screen.getByText('Paragrafo de abertura.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Equipe em workshop' })).toHaveAttribute(
      'src',
      'https://cdn.sanity.io/images/demo/workshop.jpg',
    )
    expect(screen.getByRole('img', { name: 'Equipe em workshop' })).toHaveAttribute('loading', 'eager')
    expect(screen.getByRole('img', { name: 'Equipe em workshop' })).toHaveAttribute('fetchpriority', 'high')
    expect(screen.getByText('Workshop com o time do cliente.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /voltar para inspire/i })).toHaveAttribute('href', '/inspire')
    expect(screen.getByText('Obrigado por ler na Inspire.')).toBeInTheDocument()
    const likeButton = await screen.findByRole('button', { name: /7 curtidas/i })
    const count = container.querySelector('.post-like-button__count')
    expect(count?.textContent).toBe('7')
    expect(likeButton).toContainElement(count)
    expect(fetchMock).toHaveBeenCalledWith('/api/posts/post-com-imagem-inline/likes', { method: 'GET' })
  })

  it('places the post actions inside the article hero before the body', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))

    renderPostDetail()

    expect(await screen.findByRole('heading', { name: 'Post com imagem inline' })).toBeInTheDocument()

    const hero = document.querySelector('.post-detail__hero')
    const actions = hero?.querySelector('.post-detail__hero-actions')
    const articleBody = document.querySelector('.post-detail__article-body')
    const sidebar = document.querySelector('.post-detail__sidebar')
    const newsletter = sidebar?.querySelector('.inspire-sidebar__newsletter')

    expect(hero).not.toBeNull()
    expect(sidebar).not.toBeNull()
    expect(actions).not.toBeNull()
    expect(articleBody).not.toBeNull()
    expect(newsletter).not.toBeNull()
    expect(sidebar).not.toContainElement(actions)
    expect(hero.compareDocumentPosition(articleBody) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(actions.querySelectorAll('.post-detail__hero-action-item')).toHaveLength(3)
    expect(within(actions).queryByText('Gostou?')).not.toBeInTheDocument()
    expect(within(actions).queryByText('Compartilhe!')).not.toBeInTheDocument()
    expect(within(actions).queryByText('Conte pra gente')).not.toBeInTheDocument()
    expect(await within(actions).findByRole('button', { name: /7 curtidas/i })).toBeInTheDocument()
    expect(within(actions).getByText('Curtir')).toBeInTheDocument()
    expect(within(actions).getByRole('button', { name: 'Compartilhar' })).toHaveAttribute('data-inspire-tooltip', 'Compartilhar artigo')
    const contactButton = within(actions).getByRole('button', { name: 'Contato' })
    expect(contactButton).toHaveAttribute('data-inspire-tooltip', 'Enviar mensagem')
    expect(contactButton).toHaveAttribute('aria-haspopup', 'dialog')
    expect(contactButton).toHaveAttribute('aria-expanded', 'false')
    expect(contactButton.querySelector('svg')).not.toBeNull()
    expect(within(newsletter).getByRole('heading', { name: 'Assine o Inspire' })).toBeInTheDocument()
    expect(within(newsletter).getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
    expect(document.querySelector('.post-detail__footer-actions')).toBeNull()
  })

  it('opens an article-aware contact dialog in a portal and sends its message', async () => {
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockResolvedValueOnce(createJsonResponse({ message: 'Mensagem recebida.' }))

    renderPostDetail()

    expect(await screen.findByRole('heading', { name: 'Post com imagem inline' })).toBeInTheDocument()

    const contactButton = screen.getByRole('button', { name: 'Contato' })
    expect(screen.queryByRole('dialog', { name: 'Converse sobre este artigo' })).not.toBeInTheDocument()

    fireEvent.click(contactButton)

    const panel = screen.getByRole('dialog', { name: 'Converse sobre este artigo' })
    expect(contactButton).toHaveAttribute('aria-expanded', 'true')
    expect(panel).toHaveAttribute('aria-modal', 'true')
    expect(document.querySelector('.post-detail__sidebar')).not.toContainElement(panel)
    expect(panel.parentElement?.parentElement).toBe(document.body)
    const heading = within(panel).getByRole('heading', { name: 'Converse sobre este artigo' })
    const headingGroup = heading.closest('.post-detail__contact-heading-group')
    const headingIcon = within(panel).getByTestId('contact-heading-icon')
    expect(headingGroup).toContainElement(headingIcon)
    expect(headingIcon).toHaveClass('post-detail__contact-heading-icon')
    expect(headingIcon.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(within(headingGroup).getByText('Compartilhe uma dúvida, percepção ou aplicação prática.')).toHaveClass('post-detail__contact-heading-copy')
    expect(within(panel).getByText('Sobre o artigo')).toBeInTheDocument()
    expect(within(panel).getByText('Post com imagem inline')).toHaveClass('post-detail__contact-article-title')
    expect(within(panel).getByText('A equipe da Otimiza responderá pelo seu e-mail.')).toHaveClass('post-detail__contact-prompt')

    fireEvent.change(within(panel).getByRole('textbox', { name: 'Nome' }), {
      target: { value: 'João Silva' },
    })
    fireEvent.change(within(panel).getByRole('textbox', { name: 'Email' }), {
      target: { value: 'leitor@example.com' },
    })
    fireEvent.change(within(panel).getByRole('textbox', { name: 'Mensagem' }), {
      target: { value: 'Quero conversar sobre este tema.' },
    })
    const newsletterConsent = within(panel).getByRole('checkbox', {
      name: /newsletter Inspire e comunicações da Otimiza/i,
    })
    expect(newsletterConsent).toHaveAccessibleName('Aceito receber a newsletter Inspire e comunicações da Otimiza. Saiba mais em Política de Privacidade.')
    fireEvent.click(newsletterConsent)
    const submitButton = within(panel).getByRole('button', { name: 'Enviar mensagem' })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('Enviando...')
    expect(within(panel).getByRole('textbox', { name: 'Nome' })).toBeDisabled()
    expect(within(panel).getByRole('textbox', { name: 'Email' })).toBeDisabled()
    expect(within(panel).getByRole('textbox', { name: 'Mensagem' })).toBeDisabled()
    expect(within(panel).getByRole('status')).toHaveTextContent('Enviando sua mensagem...')

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/contact', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))
    const requestBody = JSON.parse(fetchMock.mock.calls[1][1].body)
    expect(requestBody.firstName).toBe('João')
    expect(requestBody.lastName).toBe('Silva')
    expect(requestBody.email).toBe('leitor@example.com')
    expect(requestBody.message).toContain('Post com imagem inline')
    expect(requestBody.message).toContain('Link: /2026/04/13/post-com-imagem-inline')
    expect(requestBody.message).toContain('Quero conversar sobre este tema.')
    expect(requestBody.message).toContain('Atualizações mensais do Inspire: Sim')
    expect(requestBody.newsletterConsent).toBe(true)
    expect(requestBody.newsletterSource).toBe('otimiza-inspire-article-contact-newsletter')
    expect(await within(panel).findByText(/mensagem enviada.*responderá pelo seu e-mail/i)).toBeInTheDocument()

    fireEvent.change(within(panel).getByRole('textbox', { name: 'Mensagem' }), {
      target: { value: 'Uma nova mensagem.' },
    })
    expect(within(panel).queryByText(/mensagem enviada.*responderá pelo seu e-mail/i)).not.toBeInTheDocument()
  })

  it('keeps the contextual message available and explains how to retry after a contact failure', async () => {
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockResolvedValueOnce(createJsonResponse({ error: 'Serviço indisponível.' }, false, 503))

    renderPostDetail()

    expect(await screen.findByRole('heading', { name: 'Post com imagem inline' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Contato' }))

    const panel = screen.getByRole('dialog', { name: 'Converse sobre este artigo' })
    const nameField = within(panel).getByRole('textbox', { name: 'Nome' })
    const emailField = within(panel).getByRole('textbox', { name: 'Email' })
    const messageField = within(panel).getByRole('textbox', { name: 'Mensagem' })

    fireEvent.change(nameField, { target: { value: 'João Silva' } })
    fireEvent.change(emailField, { target: { value: 'leitor@example.com' } })
    fireEvent.change(messageField, { target: { value: 'Minha reflexão sobre o artigo.' } })
    fireEvent.click(within(panel).getByRole('button', { name: 'Enviar mensagem' }))

    const alert = await within(panel).findByRole('alert')
    expect(alert).toHaveTextContent('Serviço indisponível.')
    expect(alert).toHaveTextContent('Sua mensagem continua no formulário para você tentar novamente.')
    expect(nameField).toHaveValue('João Silva')
    expect(emailField).toHaveValue('leitor@example.com')
    expect(messageField).toHaveValue('Minha reflexão sobre o artigo.')
    expect(within(panel).getByRole('button', { name: 'Enviar mensagem' })).toBeEnabled()

    fireEvent.click(within(panel).getByRole('button', { name: 'Fechar contato' }))
    fireEvent.click(screen.getByRole('button', { name: 'Contato' }))

    const reopenedPanel = screen.getByRole('dialog', { name: 'Converse sobre este artigo' })
    expect(within(reopenedPanel).getByRole('alert')).toHaveTextContent('Serviço indisponível.')
    expect(within(reopenedPanel).getByRole('textbox', { name: 'Mensagem' })).toHaveValue('Minha reflexão sobre o artigo.')
  })

  it('closes the contact dialog accessibly and preserves unfinished fields when reopened', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))

    renderPostDetail()

    expect(await screen.findByRole('heading', { name: 'Post com imagem inline' })).toBeInTheDocument()

    const contactButton = screen.getByRole('button', { name: 'Contato' })
    fireEvent.click(contactButton)

    const panel = screen.getByRole('dialog', { name: 'Converse sobre este artigo' })
    const closeButton = within(panel).getByRole('button', { name: 'Fechar contato' })
    const submitButton = within(panel).getByRole('button', { name: 'Enviar mensagem' })
    const emailField = within(panel).getByRole('textbox', { name: 'Email' })
    const messageField = within(panel).getByRole('textbox', { name: 'Mensagem' })
    const backdrop = panel.parentElement

    expect(closeButton).toHaveFocus()
    expect(document.documentElement).toHaveStyle({ overflow: 'hidden' })

    submitButton.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(closeButton).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(submitButton).toHaveFocus()

    const sidebarNewsletter = document.querySelector('.inspire-sidebar__newsletter')
    const outsideEmailField = within(sidebarNewsletter).getByRole('textbox', { name: 'Email' })
    outsideEmailField.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(closeButton).toHaveFocus()

    outsideEmailField.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(submitButton).toHaveFocus()

    fireEvent.change(emailField, { target: { value: 'leitor@example.com' } })
    fireEvent.change(messageField, { target: { value: 'Rascunho preservado.' } })

    fireEvent.mouseDown(panel)
    expect(screen.getByRole('dialog', { name: 'Converse sobre este artigo' })).toBeInTheDocument()

    fireEvent.mouseDown(backdrop)

    expect(contactButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog', { name: 'Converse sobre este artigo' })).not.toBeInTheDocument()
    expect(contactButton).toHaveFocus()
    expect(document.documentElement).not.toHaveStyle({ overflow: 'hidden' })

    fireEvent.click(contactButton)
    const reopenedPanel = screen.getByRole('dialog', { name: 'Converse sobre este artigo' })
    expect(within(reopenedPanel).getByRole('textbox', { name: 'Email' })).toHaveValue('leitor@example.com')
    expect(within(reopenedPanel).getByRole('textbox', { name: 'Mensagem' })).toHaveValue('Rascunho preservado.')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Converse sobre este artigo' })).not.toBeInTheDocument()
    expect(contactButton).toHaveFocus()

    fireEvent.click(contactButton)
    fireEvent.click(screen.getByRole('button', { name: 'Fechar contato' }))
    expect(screen.queryByRole('dialog', { name: 'Converse sobre este artigo' })).not.toBeInTheDocument()
    expect(contactButton).toHaveFocus()
  })

  it('highlights the category inside the post with the same yellow strip', async () => {
    renderPostDetail()

    const category = await screen.findByText('Insights')

    expect(category).toHaveClass('inspire-category-label')
    expect(category.querySelector('svg')).toBeNull()
    expect(category).not.toHaveClass('font-bold', 'uppercase', 'tracking-[0.18em]')
  })

  it('shows the liked state immediately when the browser already stored the like', async () => {
    window.localStorage.setItem('post-like:post-com-imagem-inline', 'true')
    fetchMock.mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))

    renderPostDetail()

    expect(await screen.findByRole('button', { name: /7 curtidas, curtido/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('marks the post as liked after a successful click and persists it locally', async () => {
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 8, liked: true }))

    renderPostDetail()

    const likeButton = await screen.findByRole('button', { name: /7 curtidas/i })
    fireEvent.click(likeButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /8 curtidas, curtido/i })).toHaveAttribute('aria-pressed', 'true')
    })

    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/posts/post-com-imagem-inline/likes', { method: 'POST' })
    expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBe('true')
  })

  it('does not mark the post as liked locally if the like request fails', async () => {
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ slug: 'post-com-imagem-inline', count: 7 }))
      .mockResolvedValueOnce(createJsonResponse({ error: 'boom' }, false, 500))

    renderPostDetail()

    const likeButton = await screen.findByRole('button', { name: /7 curtidas/i })
    fireEvent.click(likeButton)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    expect(screen.getByRole('button', { name: /7 curtidas/i })).toBeEnabled()
    expect(window.localStorage.getItem('post-like:post-com-imagem-inline')).toBeNull()
  })

  it('keeps the page usable when the initial like count request fails', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({ error: 'boom' }, false, 500))

    renderPostDetail()

    expect(await screen.findByRole('heading', { name: 'Post com imagem inline' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /curtir este post/i })).toBeEnabled()
    expect(screen.queryByText(/curtidas/i)).not.toBeInTheDocument()
  })
})
