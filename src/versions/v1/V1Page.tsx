import V1Nav from './V1Nav'
import V1Hero from './V1Hero'
import V1Intro from './V1Intro'
import V1Companies from './V1Companies'
import V1Map from './V1Map'
import V1Projects from './V1Projects'
import V1Philosophy from './V1Philosophy'
import V1News from './V1News'
import V1Cta from './V1Cta'
import V1Footer from './V1Footer'

export default function V1Page() {
  return (
    <div className="theme-v1 min-h-screen">
      <V1Nav />
      <main>
        <V1Hero />
        <V1Intro />
        <V1Companies />
        <V1Map />
        <V1Projects />
        <V1Philosophy />
        <V1News />
        <V1Cta />
      </main>
      <V1Footer />
    </div>
  )
}
