import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'
import { staticBlogPosts } from '../data/blogPosts'
import { ProjectCard } from '../components/ui/project-card'
import { sitePages } from '../data/sitePages'
import { cn } from '@/lib/utils'

function InsightsBlog() {
  const [blogPosts, setBlogPosts] = useState(staticBlogPosts)
  const [loading, setLoading] = useState(true)
  const pageData = sitePages['insights-e-blog']

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query = `*[_type == "post"] | order(publishedAt desc) [0...50] {
          title,
          description,
          "imgSrc": mainImage.asset->url,
          "link": "/insights-e-blog/" + slug.current,
          eyebrow,
          "linkText": "Ler artigo"
        }`
        const dynamicPosts = await client.fetch(query)
        if (dynamicPosts && dynamicPosts.length > 0) {
          setBlogPosts(dynamicPosts)
        }
      } catch (error) {
        console.error('Error fetching posts from Sanity:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <div className="mx-auto max-w-[1380px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <header className="mb-16">
        <p className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 animate-enter">
          {pageData.title}
        </p>
        <h1 className="mb-6 font-display text-4xl text-slate-900 sm:text-5xl lg:text-7xl animate-enter [animation-delay:150ms]">
          Insights e Artigos
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-slate-600 animate-enter [animation-delay:300ms]">
          {pageData.intro}
        </p>
      </header>

      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 animate-enter [animation-delay:450ms]">
        {blogPosts.map((post) => (
          <div key={post.title} className="flex flex-col h-full">
            <ProjectCard {...post} />
          </div>
        ))}
      </div>

      {loading && blogPosts.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-red"></div>
        </div>
      )}
    </div>
  )
}

export default InsightsBlog