import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { ArrowLeft, Calendar } from 'lucide-react'
import { client, urlFor } from '../lib/sanity'
import PostLikeButton from '../components/PostLikeButton'
import InspireNewsletterSignup from '../components/InspireNewsletterSignup'
import InspireShareButton from '../components/InspireShareButton'
import PostArticleContactPanel from '../components/PostArticleContactPanel'
import SeoHead from '../seo/SeoHead'
import { getPageDescription, getPageTitle } from '../seo/siteMetadata'
import { buildWordPressPostPath } from '../lib/postUrl'

function getPreviewPost(locationState) {
  if (!locationState?.postPreview) {
    return null
  }

  const { title, description, publishedAt, eyebrow, mainImage, content, imgSrc, slug } = locationState.postPreview

  return {
    title,
    description,
    publishedAt,
    eyebrow,
    mainImage: mainImage ?? null,
    content: content ?? [],
    imgSrc: imgSrc ?? null,
    slug: slug ?? null,
  }
}

function PostDetail() {
  const { slug } = useParams()
  const location = useLocation()
  const [post, setPost] = useState(() => getPreviewPost(location.state))
  const [morePosts, setMorePosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const previewPost = getPreviewPost(location.state)

    window.scrollTo(0, 0)
    setPost(previewPost)
    setMorePosts([])
    setLoading(true)

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

      } catch (error) {
        console.error('Error fetching post details from Sanity:', error)

        if (!cancelled && !previewPost) {
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
  }, [location.state, slug])

  const isShellLoading = loading && !post
  const contentPhase = loading ? 'loading' : 'ready'
  const postSocialImage = post?.mainImage
    ? urlFor(post.mainImage).width(1200).url()
    : post?.imgSrc
  const postPath = buildWordPressPostPath({ publishedAt: post?.publishedAt, slug })

  if (!post && !isShellLoading) {
    return (
      <>
        <SeoHead title={getPageTitle()} description={getPageDescription()} />
        <div className="mx-auto max-w-4xl py-24 text-center text-[#5A6572]">
        <h1 className="text-3xl font-bold text-[#5A6572]">Post nao encontrado</h1>
        <p className="mt-4 text-[#5A6572]">O artigo que voce esta procurando nao existe ou foi removido.</p>
        <Link to="/inspire" className="mt-8 inline-flex items-center gap-2 font-semibold text-[#5A6572] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar para Inspire
        </Link>
        </div>
      </>
    )
  }

  let inlineImageIndex = 0

  const portableTextComponents = {
    types: {
      image: ({ value }) => {
        if (!value?.asset) {
          return null
        }

        inlineImageIndex += 1
        const isFirstInlineImage = inlineImageIndex === 1

        return (
          <figure className="my-10 overflow-hidden rounded-2xl">
            <img
              src={urlFor(value).width(1200).url()}
              alt={value.alt || post.title}
              className="w-full rounded-2xl object-cover"
              loading={isFirstInlineImage ? 'eager' : 'lazy'}
              fetchPriority={isFirstInlineImage ? 'high' : 'auto'}
              decoding={isFirstInlineImage ? 'sync' : 'async'}
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
    <>
      {post ? (
        <SeoHead
          title={getPageTitle(post.title)}
          description={getPageDescription(post.description)}
          imageUrl={postSocialImage}
          ogType="article"
        />
      ) : null}
    <article className="post-detail">
      <div className="post-detail__grid">
        <div className="post-detail__main" data-lenis-prevent-wheel>
        <div
          key={`${slug}-${contentPhase}`}
          className={`post-detail__content post-detail__content--${contentPhase}`}
        >
        <header className="post-detail__hero">
          <Link
            to="/inspire"
            className="post-detail__back-link"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Inspire
          </Link>

          {isShellLoading ? (
            <div className="post-detail__loading-shell animate-pulse">
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <div className="h-7 w-28 rounded-full bg-[#eceff2]" />
                <div className="h-7 w-40 rounded-md bg-[#eceff2]" />
              </div>
              <div className="space-y-4">
                <div className="h-12 max-w-3xl rounded-lg bg-[#eceff2] sm:h-16" />
                <div className="h-12 max-w-2xl rounded-lg bg-[#eceff2] sm:h-16" />
              </div>
              <div className="mt-8 space-y-3 border-l-2 border-[#d8dde3] pl-6">
                <div className="h-6 max-w-2xl rounded-md bg-[#f1f3f5]" />
                <div className="h-6 max-w-xl rounded-md bg-[#f1f3f5]" />
              </div>
            </div>
          ) : (
            <>
              <div className="post-detail__hero-meta">
                {post.eyebrow && (
                  <span className="inspire-category-label">{post.eyebrow}</span>
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

              <h1 className="post-detail__title font-medium tracking-[-0.015em]">
                {post.title}
              </h1>

            </>
          )}

          <section
            className={`post-detail__hero-actions post-detail__hero-actions--${loading ? 'loading' : 'ready'}`}
            aria-labelledby="post-detail-actions-title"
            aria-busy={loading}
          >
            <h2 id="post-detail-actions-title" className="sr-only">Ações do artigo</h2>
            {loading ? (
              <div className="post-detail__hero-actions-placeholder" aria-hidden="true" />
            ) : (
              <div className="post-detail__hero-actions-row post-detail__hero-actions-row--enter">
                <div className="post-detail__hero-action-item">
                  <PostLikeButton
                    slug={slug}
                    variant="detail"
                    className="post-detail__hero-like"
                    buttonClassName="post-detail__hero-action-control"
                    showLabel
                  />
                </div>
                <div className="post-detail__hero-action-item">
                  <InspireShareButton
                    className="post-detail__hero-action-control post-detail__hero-action-button"
                    title={post.title}
                    url={postPath}
                  />
                </div>
                <PostArticleContactPanel
                  postTitle={post.title}
                  postPath={postPath}
                />
              </div>
            )}
          </section>
        </header>

        {isShellLoading ? (
          <div className="post-detail__loading-shell mx-auto max-w-4xl animate-pulse space-y-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`h-6 rounded-md bg-[#eceff2] ${index === 5 ? 'max-w-[38%]' : index % 3 === 0 ? 'max-w-[92%]' : index % 3 === 1 ? 'max-w-[96%]' : 'max-w-[88%]'}`}
              />
            ))}
          </div>
        ) : (
          <>
            <div
              className="post-detail__article-body mx-auto max-w-4xl
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
              <PortableText value={post.content ?? []} components={portableTextComponents} />
            </div>

            <footer className="mx-auto mt-16 max-w-4xl border-t border-[#ececec] pt-8">
              <p className="mb-12 text-sm text-[#5A6572]">Obrigado por ler na Inspire.</p>

              {morePosts.length > 0 && (
                <div className="border-t border-[#ececec] pt-12">
                  <h2 className="mb-8 text-2xl font-bold text-[#5A6572]">Mais postagens</h2>
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                    {morePosts.map((mp, index) => (
                      <Link
                        key={mp.slug || index}
                        to={buildWordPressPostPath(mp)}
                        state={{
                          postPreview: {
                            title: mp.title,
                            description: mp.description,
                            publishedAt: mp.publishedAt,
                            eyebrow: mp.eyebrow,
                            imgSrc: mp.imgSrc,
                            slug: mp.slug,
                          },
                        }}
                        className="group block"
                      >
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
          </>
        )}
        </div>
        </div>

        <aside className="post-detail__sidebar">
          <InspireNewsletterSignup />
        </aside>
      </div>
    </article>
    </>
  )
}

export default PostDetail
