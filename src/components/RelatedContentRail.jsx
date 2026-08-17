import { useEffect, useRef, useState } from 'react'
import { ChevronUp, Eye, X, ZoomIn } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { urlFor } from '../lib/sanity'
import { buildWordPressPostPath } from '../lib/postUrl'
import { resolveLegacyImageUrl } from '../lib/legacyImageUrl'

function imageUrl(image) {
  return image?.asset ? resolveLegacyImageUrl(urlFor(image).width(900).url()) : null
}

export default function RelatedContentRail({ content }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isRendered, setIsRendered] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [slideDirection, setSlideDirection] = useState('next')
  const dragState = useRef(null)
  const dragged = useRef(false)
  const trackRef = useRef(null)
  const lightboxSwipe = useRef(null)
  const imageOpenOnRelease = useRef(null)

  useEffect(() => {
    if (!selectedImage) return undefined
    function closeOnEscape(event) {
      if (event.key === 'Escape') setSelectedImage(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selectedImage])

  if (!content?.enabled || !content?.type) return null
  const items = content.type === 'images' ? content.images : content.posts
  if (!items?.length) return null

  const galleryImages = content.type === 'images'
    ? items.map((image) => ({ src: imageUrl(image), alt: image.alt || 'Imagem relacionada' })).filter((image) => image.src)
    : []
  function selectGalleryImage(index, direction = 'next') {
    const image = galleryImages[index]
    if (image) {
      setSlideDirection(direction)
      setSelectedImage({ ...image, index })
    }
  }
  function toggleGallery() {
    if (isOpen) {
      setIsOpen(false)
      return
    }
    setIsRendered(true)
    setIsOpen(true)
  }
  function startDragging(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const track = trackRef.current ?? event.currentTarget
    dragState.current = { pointerId: event.pointerId, startX: event.clientX, startScrollLeft: track.scrollLeft, track }
    dragged.current = false
    track.setPointerCapture?.(event.pointerId)
    setIsDragging(true)
  }
  function startCardDragging(event) {
    startDragging(event)
    event.stopPropagation()
  }
  function startImageDragging(event, index) {
    startDragging(event)
    imageOpenOnRelease.current = index
    event.stopPropagation()
  }
  function dragGallery(event) {
    const state = dragState.current
    if (!state || state.pointerId !== event.pointerId) return
    const distance = event.clientX - state.startX
    if (Math.abs(distance) > 6) dragged.current = true
    state.track.scrollLeft = state.startScrollLeft - distance
  }
  function stopDragging(event) {
    if (dragState.current?.pointerId !== event.pointerId) return
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    const imageIndex = imageOpenOnRelease.current
    imageOpenOnRelease.current = null
    dragState.current = null
    setIsDragging(false)
    if (event.type !== 'pointercancel' && imageIndex !== null && !dragged.current) selectGalleryImage(imageIndex)
  }
  function startLightboxSwipe(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    lightboxSwipe.current = { pointerId: event.pointerId, startX: event.clientX }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  function finishLightboxSwipe(event) {
    const swipe = lightboxSwipe.current
    if (!swipe || swipe.pointerId !== event.pointerId) return
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    lightboxSwipe.current = null
    const distance = event.clientX - swipe.startX
    if (Math.abs(distance) < 40) return
    if (distance < 0 && selectedImage.index < galleryImages.length - 1) selectGalleryImage(selectedImage.index + 1, 'next')
    if (distance > 0 && selectedImage.index > 0) selectGalleryImage(selectedImage.index - 1, 'previous')
  }

  return (
    <section className="related-content-rail" aria-labelledby="related-content-title">
      <div className="related-content-rail__heading"><h2>
        <button id="related-content-title" className="related-content-rail__toggle" type="button" aria-expanded={isOpen} aria-controls="related-content-gallery" onClick={toggleGallery}>
          Conteúdo relacionado
          <ChevronUp className={isOpen ? '' : 'related-content-rail__toggle-icon--closed'} aria-hidden="true" size={18} strokeWidth={1.8} />
        </button>
      </h2></div>
      {isRendered && (
        <div id="related-content-gallery" className={`related-content-rail__surface${isOpen ? '' : ' related-content-rail__surface--closing'}`} onAnimationEnd={() => !isOpen && setIsRendered(false)}>
          <div className={`related-content-rail__track${isDragging ? ' related-content-rail__track--dragging' : ''}`} ref={trackRef} aria-label="Galeria de conteúdo relacionado. Arraste para ver mais itens." tabIndex="0" onPointerDown={startDragging} onPointerMove={dragGallery} onPointerUp={stopDragging} onPointerCancel={stopDragging}>
            {content.type === 'images' ? items.map((image, index) => {
              const src = imageUrl(image)
              return src ? (
                <figure className="related-content-rail__image" key={image._key || index}>
                  <img src={src} alt={image.alt || ''} loading="lazy" draggable="false" />
                  <button className="related-content-rail__image-open" type="button" aria-label={`Ampliar imagem: ${image.alt || 'conteúdo relacionado'}`} onPointerDown={(event) => startImageDragging(event, index)} onPointerMove={dragGallery} onPointerUp={stopDragging} onPointerCancel={stopDragging} onClick={() => !dragged.current && selectGalleryImage(index)}>
                    <Eye className="related-content-rail__image-open-icon related-content-rail__image-open-icon--eye" aria-hidden="true" size={18} strokeWidth={1.8} /><ZoomIn className="related-content-rail__image-open-icon related-content-rail__image-open-icon--search" aria-hidden="true" size={18} strokeWidth={1.8} />
                  </button>
                </figure>
              ) : null
            }) : items.map((post, index) => (
              <article className="related-content-rail__post" key={post._id || post.slug || index} onPointerDown={startCardDragging}>
                <div>{imageUrl(post.mainImage) ? <img src={imageUrl(post.mainImage)} alt={post.title} loading="lazy" draggable="false" /> : null}</div>
                <p>{post.eyebrow || 'Inspire'}</p><h3>{post.title}</h3>
                <Link className="related-content-rail__post-open" to={buildWordPressPostPath(post)} onPointerDown={(event) => event.stopPropagation()}>Abrir post</Link>
              </article>
            ))}
          </div>
        </div>
      )}
      {selectedImage && createPortal(
        <div className="related-content-lightbox" role="dialog" aria-modal="true" aria-label={selectedImage.alt} onMouseDown={() => setSelectedImage(null)}>
          <button className="related-content-lightbox__close" type="button" aria-label="Fechar imagem ampliada" onClick={() => setSelectedImage(null)}><X aria-hidden="true" size={20} /></button>
          <div className="related-content-lightbox__sequence">
            {selectedImage.index > 0 && <button className="related-content-lightbox__preview" type="button" aria-label="Ver imagem anterior" onMouseDown={(event) => event.stopPropagation()} onClick={() => selectGalleryImage(selectedImage.index - 1, 'previous')}><img src={galleryImages[selectedImage.index - 1].src} alt="" aria-hidden="true" /></button>}
            <div className="related-content-lightbox__current" onMouseDown={(event) => event.stopPropagation()} onPointerDown={startLightboxSwipe} onPointerUp={finishLightboxSwipe} onPointerCancel={finishLightboxSwipe}><img key={selectedImage.index} className={`related-content-lightbox__image related-content-lightbox__image--${slideDirection}`} src={selectedImage.src} alt={selectedImage.alt} /></div>
            {selectedImage.index < galleryImages.length - 1 && <button className="related-content-lightbox__preview" type="button" aria-label="Ver próxima imagem" onMouseDown={(event) => event.stopPropagation()} onClick={() => selectGalleryImage(selectedImage.index + 1, 'next')}><img src={galleryImages[selectedImage.index + 1].src} alt="" aria-hidden="true" /></button>}
          </div>
        </div>, document.body,
      )}
    </section>
  )
}
