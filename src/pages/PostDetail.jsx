import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { ArrowLeft, Calendar, Share2, Tag } from 'lucide-react'
import { client, urlFor } from '../lib/sanity'
import PostLikeButton from '../components/PostLikeButton'

function PostDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [morePosts, setMorePosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    window.scrollTo(0, 0)

    const query = `{
      "post": *[_type == "post" && slug.current == $slug][0] {
        title,
        description,
        publishedAt,
        eyebrow,
        mainImage,
        content
      },
      "more": *[_type == "post" && slug.current != $slug] | order(publishedAt desc)[0...3] {
        title,
        description,
        "imgSrc": mainImage.asset->url,
        "slug": slug.current,
        publishedAt,
        eyebrow
      }
    }`

    async function loadPost() {
      try {
        const data = await client.fetch(query, { slug })
        const resolvedPost = data?.post ?? data ?? null
        const resolvedMore = data?.more ?? []

        if (cancelled) {
          return
        }

        setPost(resolvedPost)
        setMorePosts(resolvedMore)

        if (resolvedPost) {
          document.title = `${resolvedPost.title} | Otimiza`

          let metaOgImage = document.querySelector('meta[property="og:image"]')
          if (!metaOgImage) {
            metaOgImage = document.createElement('meta')
            metaOgImage.setAttribute('property', 'og:image')
            document.head.appendChild(metaOgImage)
          }

          if (resolvedPost.mainImage) {
            const imageUrl = urlFor(resolvedPost.mainImage).width(1200).url()
            metaOgImage.setAttribute('content', imageUrl)
          }
        }
      } catch (error) {
        console.error('Error fetching post details from Sanity:', error)

        if (!cancelled) {
          setPost(null)
          setMorePosts([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadPost()

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-red" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl py-24 text-center text-[#5A6572]">
        <h1 className="text-3xl font-bold text-[#5A6572]">Post nao encontrado</h1>
        <p className="mt-4 text-[#5A6572]">O artigo que voce esta procurando nao existe ou foi removido.</p>
        <Link to="/inspire" className="mt-8 inline-flex items-center gap-2 font-semibold text-[#5A6572] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar para Inspire
        </Link>
      </div>
    )
  }

  const portableTextComponents = {
    types: {
      image: ({ value }) => {
        if (!value?.asset) {
          return null
        }

        return (
          <figure className="my-10 overflow-hidden rounded-2xl">
            <img
              src={urlFor(value).width(1200).url()}
              alt={value.alt || post.title}
              className="w-full rounded-2xl object-cover"
              loading="lazy"
              decoding="async"
            />
            {value.caption && (
              <figcaption className="mt-3 text-sm leading-6 text-[#5A6572]">
                {value.caption}
              </figcaption>
            )}
          </figure>
        )
      },
    },
  }

  return (
    <article className="relative w-full px-6 pb-14 md:px-12 lg:pb-20">
      <div className="relative z-10 mx-auto w-full max-w-[1380px]">
        <header className="mb-12 border-b border-[#ececec] pb-10 pt-32 sm:pt-40">
          <Link
            to="/inspire"
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-[#5A6572] transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Inspire
          </Link>

          <div className="mb-6 flex flex-wrap items-center gap-4 text-[#5A6572]">
            {post.eyebrow && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5A6572] backdrop-blur">
                <Tag className="h-3 w-3" /> {post.eyebrow}
              </span>
            )}
            {post.publishedAt && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/40 px-2 py-1 text-xs font-semibold text-[#5A6572] backdrop-blur">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>

          <h1 className="text-[2.6rem] font-bold leading-[1.05] tracking-[-0.04em] text-[#5A6572] sm:text-[3.6rem] lg:text-[4.6rem]">
            {post.title}
          </h1>

          {post.description && (
            <p className="mt-8 border-l-2 border-[#d8dde3] pl-6 text-xl leading-relaxed text-[#5A6572]">
              {post.description}
            </p>
          )}
        </header>

        <div
          className="mx-auto max-w-4xl
          [&_h1]:text-[#5A6572] [&_h1]:font-bold [&_h1]:tracking-[-0.02em]
          [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-[-0.02em] [&_h2]:text-[#5A6572]
          [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:tracking-[-0.02em] [&_h3]:text-[#5A6572]
          [&_h4]:font-bold [&_h4]:tracking-[-0.02em] [&_h4]:text-[#5A6572]
          [&_p]:mb-7 [&_p]:text-[1.25rem] [&_p]:leading-[1.85] [&_p]:text-[#5A6572] md:[&_p]:text-[1.375rem]
          [&_a]:text-[#5A6572] [&_a]:underline [&_a]:transition-opacity hover:[&_a]:opacity-80
          [&_strong]:font-bold [&_strong]:text-[#5A6572]
          [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6
          [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6
          [&_li]:my-2 [&_li]:text-[1.25rem] [&_li]:leading-[1.85] [&_li]:text-[#5A6572] md:[&_li]:text-[1.375rem]
          [&_blockquote]:my-10 [&_blockquote]:border-l-4 [&_blockquote]:border-[#d8dde3] [&_blockquote]:bg-[#f9f9f9] [&_blockquote]:px-8 [&_blockquote]:py-3 [&_blockquote]:text-xl [&_blockquote]:italic [&_blockquote]:text-[#5A6572] md:[&_blockquote]:text-2xl"
        >
          <PortableText value={post.content} components={portableTextComponents} />
        </div>

        <footer className="mx-auto mt-16 max-w-4xl border-t border-[#ececec] pt-8">
          <div className="mb-16 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-sm text-[#5A6572]">Obrigado por ler na Inspire.</p>
            <div className="flex flex-wrap items-center gap-3">
              <PostLikeButton slug={slug} variant="detail" />
              <button className="flex items-center gap-2 rounded-full border border-[#dfdfdf] px-5 py-2.5 text-sm font-medium text-[#5A6572] transition-colors hover:bg-[#f5f5f5] hover:text-[#5A6572]">
                <Share2 size={16} strokeWidth={1.8} />
                Compartilhar
              </button>
              <Link
                to="/contato"
                className="ml-2 flex items-center justify-center rounded-full bg-[#f3f5f7] px-6 py-2.5 text-sm font-semibold text-[#5A6572] transition-colors hover:bg-[#eceff2]"
              >
                Falar com a Otimiza
              </Link>
            </div>
          </div>

          {morePosts.length > 0 && (
            <div className="border-t border-[#ececec] pt-12">
              <h2 className="mb-8 text-2xl font-bold text-[#5A6572]">Mais postagens</h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                {morePosts.map((mp, index) => (
                  <Link key={mp.slug || index} to={`/inspire/${mp.slug}`} className="group block">
                    <div className="mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-[#e8e8e8]">
                      {mp.imgSrc ? (
                        <img
                          src={mp.imgSrc}
                          alt={mp.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[#f7f7f7] to-[#ececec]" />
                      )}
                    </div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5A6572]">
                      {mp.eyebrow || 'Otimiza Editorial'}
                    </p>
                    <h3 className="text-lg font-bold leading-[1.25] text-[#5A6572] group-hover:underline">
                      {mp.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </footer>
      </div>
    </article>
  )
}

export default PostDetail
