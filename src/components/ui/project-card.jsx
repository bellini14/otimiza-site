import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const linkBaseClassName =
  'group/button mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-900 transition-all duration-300 hover:text-slate-700'

const ProjectCard = React.forwardRef(function ProjectCard(
  {
    className,
    imgSrc,
    title,
    description,
    link,
    linkText = 'View Project',
    eyebrow,
    ...props
  },
  ref,
) {
  const isInternalLink = typeof link === 'string' && link.startsWith('/')

  return (
    <article
      ref={ref}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 transition-all duration-500 ease-in-out hover:-translate-y-2',
        className,
      )}
      {...props}
    >
      <div className="aspect-video overflow-hidden bg-slate-100">
        <img
          src={imgSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          loading="lazy"
        />
        {eyebrow ? (
          <span className="absolute left-4 top-4 inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
            {eyebrow}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold transition-colors duration-300 group-hover:text-slate-700">
          {title}
        </h3>
        <p className="mt-3 flex-1 text-muted-foreground">{description}</p>

        {isInternalLink ? (
          <Link to={link} className={linkBaseClassName}>
            {linkText}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
          </Link>
        ) : (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={linkBaseClassName}
            onClick={(event) => event.stopPropagation()}
          >
            {linkText}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
          </a>
        )}
      </div>
    </article>
  )
})

export { ProjectCard }
