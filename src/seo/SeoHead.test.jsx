import { render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SeoHead from './SeoHead'

describe('SeoHead title management', () => {
  it('sets the document title from the current page metadata', async () => {
    const { rerender } = render(<SeoHead title="Cases de consultoria | Otimiza" />)

    await waitFor(() => {
      expect(document.title).toBe('Cases de consultoria | Otimiza')
    })

    rerender(<SeoHead title="Contato da consultoria | Otimiza" />)

    await waitFor(() => {
      expect(document.title).toBe('Contato da consultoria | Otimiza')
    })
  })

  it('creates and updates one meta description', async () => {
    const { rerender } = render(<SeoHead title="Otimiza" description="Descrição inicial da página." />)
    await waitFor(() => expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1))
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Descrição inicial da página.')

    rerender(<SeoHead title="Otimiza" description="Descrição atualizada da página." />)
    await waitFor(() => expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Descrição atualizada da página.'))
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
  })

  it('creates and updates exactly one absolute canonical link', async () => {
    const { rerender } = render(
      <SeoHead title="Otimiza" canonicalUrl="https://www.otimiza.test/cases" />,
    )
    await waitFor(() => expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1))
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://www.otimiza.test/cases',
    )

    rerender(<SeoHead title="Otimiza" canonicalUrl="https://www.otimiza.test/contato" />)
    await waitFor(() => expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://www.otimiza.test/contato',
    ))
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
  })

  it('creates complete, page-specific Open Graph metadata without duplicates', async () => {
    const props = {
      title: 'Cases de consultoria | Otimiza',
      description: 'Conheça os cases reais da Otimiza.',
      canonicalUrl: 'https://www.otimiza.test/cases',
      imageUrl: 'https://www.otimiza.test/assets/cases.jpg',
      ogType: 'website',
    }
    const { rerender } = render(<SeoHead {...props} />)

    const expected = {
      'og:title': props.title,
      'og:description': props.description,
      'og:type': 'website',
      'og:url': props.canonicalUrl,
      'og:image': props.imageUrl,
      'og:site_name': 'Otimiza',
    }

    await waitFor(() => expect(document.head.querySelectorAll('meta[property^="og:"]')).toHaveLength(6))
    Object.entries(expected).forEach(([property, content]) => {
      expect(document.head.querySelector(`meta[property="${property}"]`)).toHaveAttribute('content', content)
    })

    rerender(<SeoHead {...props} title="Cases atualizados | Otimiza" />)
    await waitFor(() => expect(document.head.querySelector('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Cases atualizados | Otimiza',
    ))
    expect(document.head.querySelectorAll('meta[property^="og:"]')).toHaveLength(6)
  })

  it('creates and updates one valid JSON-LD block', async () => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [{ '@type': 'WebSite', name: 'Otimiza' }],
    }
    const { rerender } = render(<SeoHead title="Otimiza" structuredData={structuredData} />)

    await waitFor(() => expect(document.head.querySelectorAll('script[data-seo-json-ld]')).toHaveLength(1))
    expect(JSON.parse(document.head.querySelector('script[data-seo-json-ld]').textContent)).toEqual(structuredData)

    const updatedData = {
      ...structuredData,
      '@graph': [...structuredData['@graph'], { '@type': 'WebPage', name: 'Cases' }],
    }
    rerender(<SeoHead title="Cases | Otimiza" structuredData={updatedData} />)

    await waitFor(() => expect(
      JSON.parse(document.head.querySelector('script[data-seo-json-ld]').textContent)['@graph'],
    ).toHaveLength(2))
    expect(document.head.querySelectorAll('script[data-seo-json-ld]')).toHaveLength(1)
  })

  it('creates complete Twitter Card metadata consistent with Open Graph', async () => {
    const props = {
      title: 'Tecnologia para gestão | Otimiza',
      description: 'Conheça as soluções de tecnologia da Otimiza.',
      imageUrl: 'https://www.otimiza.test/assets/tecnologia.jpg',
    }
    const { rerender } = render(<SeoHead {...props} />)

    const expected = {
      'twitter:card': 'summary_large_image',
      'twitter:title': props.title,
      'twitter:description': props.description,
      'twitter:image': props.imageUrl,
    }

    await waitFor(() => expect(document.head.querySelectorAll('meta[name^="twitter:"]')).toHaveLength(4))
    Object.entries(expected).forEach(([name, content]) => {
      expect(document.head.querySelector(`meta[name="${name}"]`)).toHaveAttribute('content', content)
    })

    rerender(<SeoHead {...props} title="Tecnologia atualizada | Otimiza" />)
    await waitFor(() => expect(document.head.querySelector('meta[name="twitter:title"]')).toHaveAttribute(
      'content',
      'Tecnologia atualizada | Otimiza',
    ))
    expect(document.head.querySelectorAll('meta[name^="twitter:"]')).toHaveLength(4)
  })
})
