import { useEffect } from 'react'

function SeoHead({
  title,
  description,
  canonicalUrl,
  imageUrl,
  ogType = 'website',
  structuredData,
}) {
  useEffect(() => {
    if (title) {
      document.title = title
    }
  }, [title])

  useEffect(() => {
    if (!description) return
    let element = document.head.querySelector('meta[name="description"]')
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute('name', 'description')
      document.head.appendChild(element)
    }
    element.setAttribute('content', description)
  }, [description])

  useEffect(() => {
    if (!canonicalUrl) return
    let element = document.head.querySelector('link[rel="canonical"]')
    if (!element) {
      element = document.createElement('link')
      element.setAttribute('rel', 'canonical')
      document.head.appendChild(element)
    }
    element.setAttribute('href', canonicalUrl)
  }, [canonicalUrl])

  useEffect(() => {
    const values = {
      'og:title': title,
      'og:description': description,
      'og:type': ogType,
      'og:url': canonicalUrl,
      'og:image': imageUrl,
      'og:site_name': 'Otimiza',
    }

    Object.entries(values).forEach(([property, content]) => {
      if (!content) return
      let element = document.head.querySelector(`meta[property="${property}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('property', property)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    })
  }, [canonicalUrl, description, imageUrl, ogType, title])

  useEffect(() => {
    const values = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': imageUrl,
    }

    Object.entries(values).forEach(([name, content]) => {
      if (!content) return
      let element = document.head.querySelector(`meta[name="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute('name', name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    })
  }, [description, imageUrl, title])

  useEffect(() => {
    if (!structuredData) return
    let element = document.head.querySelector('script[data-seo-json-ld]')
    if (!element) {
      element = document.createElement('script')
      element.setAttribute('type', 'application/ld+json')
      element.setAttribute('data-seo-json-ld', '')
      document.head.appendChild(element)
    }
    element.textContent = JSON.stringify(structuredData).replaceAll('<', '\\u003c')
  }, [structuredData])

  return null
}

export default SeoHead
