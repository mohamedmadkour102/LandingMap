import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import ItiNav from './ItiNav'
import ItiFootprint from './ItiFootprint'
import { ItiAbout, ItiContact, ItiFooter, ItiHero, ItiValues, ItiVision } from './ItiSections'
import { COPY, type Lang } from './content'

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
        <ItiFootprint key={lang} lang={lang} />
        <ItiContact lang={lang} />
      </main>
      <ItiFooter lang={lang} />
    </div>
  )
}
