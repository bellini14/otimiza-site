import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { client, urlFor } from '../lib/sanity'
import { PortableText } from '@portabletext/react'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'

function PostDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const query = `*[_type == "post" && slug.current == $slug][0] {
      title,
      description,
      publishedAt,
      eyebrow,
      mainImage,
      content
    }`
    
    client.fetch(query, { slug }).then((data) => {
      setPost(data)
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-red"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Post não encontrado</h1>
        <p className="mt-4 text-slate-600">O artigo que você está procurando não existe ou foi removido.</p>
        <Link to="/insights-e-blog" className="mt-8 inline-flex items-center gap-2 text-brand-red hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar para o blog
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-[900px] px-4 py-16 sm:px-6 lg:py-24">
      <Link 
        to="/insights-e-blog" 
        className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para Insights e Blog
      </Link>

      <header className="mb-12">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {post.eyebrow && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <Tag className="h-3 w-3" /> {post.eyebrow}
            </span>
          )}
          {post.publishedAt && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          )}
        </div>
        
        <h1 className="font-display text-4xl font-bold text-slate-900 sm:text-5xl lg:text-6xl leading-[1.1]">
          {post.title}
        </h1>
        
        {post.description && (
          <p className="mt-8 text-xl leading-relaxed text-slate-600 italic border-l-4 border-brand-red pl-6">
            {post.description}
          </p>
        )}
      </header>

      {post.mainImage && (
        <div className="mb-16 overflow-hidden rounded-2xl shadow-xl">
          <img 
            src={urlFor(post.mainImage).width(1200).url()} 
            alt={post.title}
            className="w-full object-cover"
          />
        </div>
      )}

      <div className="prose prose-slate prose-lg max-w-none 
        prose-headings:font-display prose-headings:text-slate-900
        prose-p:leading-relaxed prose-p:text-slate-700
        prose-strong:text-slate-900
        prose-li:text-slate-700">
        <PortableText value={post.content} />
      </div>

      <footer className="mt-20 border-t border-slate-200 pt-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-slate-500">Obrigado por ler nosso insight.</p>
          <div className="flex gap-4">
            <button className="rounded-full bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-200">
              Compartilhar
            </button>
            <Link 
              to="/contato" 
              className="rounded-full bg-brand-red px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Falar com um especialista
            </Link>
          </div>
        </div>
      </footer>
    </article>
  )
}

export default PostDetail
