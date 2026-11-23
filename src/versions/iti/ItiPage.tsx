import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import ItiNav from './ItiNav'
import { ItiAbout, ItiBusinesses, ItiContact, ItiFooter, ItiHero, ItiValues, ItiVision } from './ItiSections'
import { COPY, type Lang } from './content'
import { VersionSwitcher } from './variants'

/** The globe (d3 + geo data) ships in its own chunk, fetched while the visitor reads the upper sections */
const loadFootprint = () => import('./ItiFootprint')
const ItiFootprint = lazy(loadFootprint)

/** Mounts the globe once it is within a screen or two of the viewport; prefetches it when the browser is idle */
function DeferredFootprint({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [mount, setMount] = useState(false)

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200))
    const cancel = window.cancelIdleCallback ?? window.clearTimeout
    const id = idle(() => void loadFootprint())
    return () => cancel(id as number)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMount(true)
          io.disconnect()
        }
      },
      { rootMargin: '120% 0px' },
    )
    io.observe(el)
    // a jump straight to #footprint (nav, hero CTA, Our Businesses) mounts it at once
    const onHash = () => location.hash === '#footprint' && setMount(true)
    onHash()
    window.addEventListener('hashchange', onHash)
    return () => {
      io.disconnect()
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  return (
    <div id="footprint" ref={ref} className="min-h-[100svh] scroll-mt-0 bg-[#021a2b]">
      {mount && (
        <Suspense fallback={<div className="min-h-[100svh]" />}>
          <ItiFootprint key={lang} lang={lang} />
        </Suspense>
      )}
    </div>
  )
}

export default function ItiPage() {
  const { lang: param } = useParams()
  const lang: Lang | null = param === 'en' || param === 'ar' ? param : null

  useEffect(() => {
    if (!lang) return
    const html = document.documentElement
    const prev = { lang: html.lang, dir: html.dir, title: document.title }
    html.lang = lang
    html.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.title = COPY.meta.title[lang]
    return () => {
      html.lang = prev.lang
      html.dir = prev.dir
      document.title = prev.title
    }
  }, [lang])

  if (!lang) return <Navigate to="/en" replace />

  return (
    <div className="iti-root min-h-screen" dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
      <ItiNav lang={lang} />
      <main>
        <ItiHero lang={lang} />
        <ItiAbout lang={lang} />
        <ItiVision lang={lang} />
        <ItiValues lang={lang} />
        <ItiBusinesses lang={lang} />
        <DeferredFootprint lang={lang} />
        <ItiContact lang={lang} />
      </main>
      <ItiFooter lang={lang} />
      <VersionSwitcher />
    </div>
  )
}
