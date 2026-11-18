import { useState } from 'react'
import { Link } from 'react-router-dom'
import ItiLogo from '../versions/iti/ItiLogo'
import { ASSETS, CONTACT, COPY, MARKETS, SECTORS } from '../versions/iti/content'
import { Card, PairFields, PhotoField, TextField, type Pair } from './fields'
import { photoUrl } from '../versions/iti/media'

type SectionId = 'hero' | 'about' | 'vision' | 'values' | 'markets' | 'sites' | 'contact'

const NAV: { id: SectionId; label: string; hint: string }[] = [
  { id: 'hero', label: 'Hero', hint: 'Opening screen' },
  { id: 'about', label: 'About', hint: 'Story and figures' },
  { id: 'vision', label: 'Vision & Mission', hint: 'Two statements' },
  { id: 'values', label: 'Values', hint: 'Six principles' },
  { id: 'markets', label: 'Markets', hint: 'Four regions' },
  { id: 'sites', label: 'Sites', hint: 'Plants and terminals' },
  { id: 'contact', label: 'Contact', hint: 'Barcelona office' },
]

type Stat = { value: string; prefix: string; suffix: string; label: Pair }
type ValueItem = { id: string; title: Pair; body: Pair; photo: string }
type MarketDraft = {
  id: string
  name: Pair
  investment: string
  headline: Pair
  summary: Pair
  points: Pair[]
  photo: string
  illustrative?: boolean
}
type SiteDraft = {
  id: string
  name: string
  city: Pair
  kind: Pair
  milestone: Pair
  investment: string
  about: Pair
  photo: string
  logo?: string
  url: string
  status: 'operational' | 'construction'
  illustrative?: boolean
  sector: string
}

type Draft = {
  hero: {
    eyebrow: Pair
    title: Pair
    lead: Pair
    ctaPrimary: Pair
    ctaSecondary: Pair
    countries: Pair
    photo: string
  }
  about: { eyebrow: Pair; title: Pair; lead: Pair; definesTitle: Pair; pillars: { title: Pair; body: Pair }[] }
  stats: Stat[]
  purpose: { eyebrow: Pair; title: Pair; lead: Pair }
  vision: { eyebrow: Pair; headline: Pair; body: Pair }
  mission: { eyebrow: Pair; headline: Pair; body: Pair }
  values: { eyebrow: Pair; title: Pair; items: ValueItem[] }
  footprint: { eyebrow: Pair; title: Pair; body: Pair }
  markets: MarketDraft[]
  sites: SiteDraft[]
  contact: { eyebrow: Pair; title: Pair; body: Pair; address: Pair; cta: Pair; email: string; website: string; photo: string }
}

function seed(): Draft {
  return {
    hero: { ...COPY.hero, photo: photoUrl('hero', 1600) },
    about: {
      eyebrow: COPY.about.eyebrow,
      title: COPY.about.title,
      lead: COPY.about.lead,
      definesTitle: COPY.about.definesTitle,
      pillars: COPY.about.pillars.map((p) => ({ title: { ...p.title }, body: { ...p.body } })),
    },
    stats: COPY.stats.map((s) => ({ value: String(s.value), prefix: s.prefix, suffix: s.suffix, label: { ...s.label } })),
    purpose: { ...COPY.purpose },
    vision: { ...COPY.vision },
    mission: { ...COPY.mission },
    values: {
      eyebrow: COPY.values.eyebrow,
      title: COPY.values.title,
      items: COPY.values.items.map((v) => ({ ...v, title: { ...v.title }, body: { ...v.body }, photo: `/iti/photos/value-${v.id}.jpg` })),
    },
    footprint: { eyebrow: COPY.footprint.eyebrow, title: COPY.footprint.title, body: COPY.footprint.body },
    markets: MARKETS.map((m) => ({
      id: m.id,
      name: { ...m.name },
      investment: m.investment,
      headline: { ...m.headline },
      summary: { ...m.summary },
      points: (m.points ?? []).map((p) => ({ ...p })),
      photo: photoUrl(m.photo),
      illustrative: m.illustrative,
    })),
    sites: ASSETS.map((a) => ({
      id: a.id,
      name: a.name,
      city: { ...a.city },
      kind: { ...a.kind },
      milestone: { ...a.milestone },
      investment: a.investment ?? '',
      about: { ...a.about },
      photo: photoUrl(a.photo),
      logo: a.logo,
      url: a.url,
      status: a.status,
      illustrative: a.illustrative,
      sector: SECTORS[a.sector].label.en,
    })),
    contact: {
      eyebrow: COPY.contact.eyebrow,
      title: COPY.contact.title,
      body: COPY.contact.body,
      address: COPY.contact.address,
      cta: COPY.contact.cta,
      email: CONTACT.email,
      website: CONTACT.website,
      photo: photoUrl('sesco-silos', 960),
    },
  }
}

export default function AdminPage() {
  const [section, setSection] = useState<SectionId>('hero')
  const [draft, setDraft] = useState<Draft>(seed)
  const [marketId, setMarketId] = useState<string>(MARKETS[0].id)
  const [siteId, setSiteId] = useState(ASSETS[0].id)
  const [valueId, setValueId] = useState(COPY.values.items[0].id)
  const [saved, setSaved] = useState(false)

  const current = NAV.find((n) => n.id === section)!

  function save() {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="iti-admin min-h-screen bg-[#e2e7e8] text-[#053552]" style={{ fontFamily: 'Figtree, sans-serif' }}>
      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="flex flex-col bg-[#053552] text-white lg:sticky lg:top-0 lg:h-screen">
          <div className="flex items-center justify-between px-5 py-5">
            <ItiLogo tone="white" layout="horizontal" descriptor={false} className="h-9 w-[150px]" />
          </div>
          <p className="px-5 pb-2 text-[0.62rem] font-semibold tracking-[0.2em] text-white/40 uppercase">Content</p>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
            {NAV.map((item) => {
              const on = item.id === section
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`shrink-0 rounded-xl px-3 py-2.5 text-left transition lg:w-full ${
                    on ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`h-4 w-[3px] rounded-full ${on ? 'bg-[#a9613a]' : 'bg-transparent'}`} />
                    <span>
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="hidden text-[0.68rem] text-white/45 lg:block">{item.hint}</span>
                    </span>
                  </span>
                </button>
              )
            })}
          </nav>
          <div className="mt-auto hidden border-t border-white/10 p-4 lg:block">
            <Link to="/en" className="block rounded-xl px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white">
              View live page
            </Link>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[rgba(5,53,82,0.08)] bg-[#e2e7e8]/90 px-5 py-4 backdrop-blur sm:px-8">
            <div>
              <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-[#a9613a] uppercase">Draft</p>
              <h1 className="iti-admin-head text-xl font-bold tracking-tight">{current.label}</h1>
            </div>
            <button
              type="button"
              onClick={save}
              className="rounded-full bg-[#a9613a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#93522f]"
            >
              {saved ? 'Saved' : 'Save draft'}
            </button>
          </header>

          <div className="mx-auto flex max-w-4xl flex-col gap-5 px-5 py-6 sm:px-8 sm:py-8">
            <p className="text-sm text-[#4a6474]">
              English and Arabic sit side by side. This draft stays in the browser and does not change the live page yet.
            </p>
            {section === 'hero' && <HeroEditor draft={draft} setDraft={setDraft} />}
            {section === 'about' && <AboutEditor draft={draft} setDraft={setDraft} />}
            {section === 'vision' && <VisionEditor draft={draft} setDraft={setDraft} />}
            {section === 'values' && <ValuesEditor draft={draft} setDraft={setDraft} valueId={valueId} setValueId={setValueId} />}
            {section === 'markets' && (
              <MarketsEditor draft={draft} setDraft={setDraft} marketId={marketId} setMarketId={setMarketId} />
            )}
            {section === 'sites' && <SitesEditor draft={draft} setDraft={setDraft} siteId={siteId} setSiteId={setSiteId} />}
            {section === 'contact' && <ContactEditor draft={draft} setDraft={setDraft} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroEditor({ draft, setDraft }: { draft: Draft; setDraft: (d: Draft) => void }) {
  const hero = draft.hero
  const set = (patch: Partial<Draft['hero']>) => setDraft({ ...draft, hero: { ...hero, ...patch } })
  return (
    <>
      <Card>
        <PhotoField src={hero.photo} onChange={(photo) => set({ photo })} />
      </Card>
      <Card>
        <div className="flex flex-col gap-5">
          <PairFields label="Eyebrow" value={hero.eyebrow} onChange={(eyebrow) => set({ eyebrow })} />
          <PairFields label="Headline" value={hero.title} onChange={(title) => set({ title })} />
          <PairFields label="Lead" value={hero.lead} onChange={(lead) => set({ lead })} area />
          <PairFields label="Primary button" value={hero.ctaPrimary} onChange={(ctaPrimary) => set({ ctaPrimary })} />
          <PairFields label="Secondary button" value={hero.ctaSecondary} onChange={(ctaSecondary) => set({ ctaSecondary })} />
          <PairFields label="Countries line" value={hero.countries} onChange={(countries) => set({ countries })} />
        </div>
      </Card>
    </>
  )
}

function AboutEditor({ draft, setDraft }: { draft: Draft; setDraft: (d: Draft) => void }) {
  const about = draft.about
  const set = (patch: Partial<Draft['about']>) => setDraft({ ...draft, about: { ...about, ...patch } })
  return (
    <>
      <Card>
        <div className="flex flex-col gap-5">
          <PairFields label="Eyebrow" value={about.eyebrow} onChange={(eyebrow) => set({ eyebrow })} />
          <PairFields label="Title" value={about.title} onChange={(title) => set({ title })} />
          <PairFields label="Lead" value={about.lead} onChange={(lead) => set({ lead })} area />
        </div>
      </Card>
      <Card>
        <div className="flex flex-col gap-5">
          <PairFields label="Pillars title" value={about.definesTitle} onChange={(definesTitle) => set({ definesTitle })} />
          {about.pillars.map((pl, i) => {
            const setPillar = (patch: Partial<typeof pl>) => set({ pillars: about.pillars.map((item, n) => (n === i ? { ...item, ...patch } : item)) })
            return (
              <div key={i} className="flex flex-col gap-3 border-t border-[rgba(5,53,82,0.08)] pt-5">
                <PairFields label={`Pillar ${i + 1}`} value={pl.title} onChange={(title) => setPillar({ title })} />
                <PairFields label="Supporting line" value={pl.body} onChange={(body) => setPillar({ body })} area />
              </div>
            )
          })}
        </div>
      </Card>
      <Card>
        <p className="iti-admin-head mb-4 text-lg font-bold">Figures</p>
        <div className="flex flex-col gap-6">
          {draft.stats.map((s, i) => (
            <div key={s.label.en} className="grid gap-3 border-t border-[rgba(5,53,82,0.08)] pt-5 first:border-0 first:pt-0 sm:grid-cols-[120px_1fr]">
              <TextField
                label="Number"
                value={`${s.prefix}${s.value}${s.suffix}`}
                onChange={(value) => {
                  const stats = draft.stats.map((item, n) => (n === i ? { ...item, prefix: '', suffix: '', value } : item))
                  setDraft({ ...draft, stats })
                }}
              />
              <PairFields
                label="Caption"
                value={s.label}
                onChange={(label) => {
                  const stats = draft.stats.map((item, n) => (n === i ? { ...item, label } : item))
                  setDraft({ ...draft, stats })
                }}
              />
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

function VisionEditor({ draft, setDraft }: { draft: Draft; setDraft: (d: Draft) => void }) {
  return (
    <>
      <Card>
        <div className="flex flex-col gap-5">
          <PairFields label="Eyebrow" value={draft.purpose.eyebrow} onChange={(eyebrow) => setDraft({ ...draft, purpose: { ...draft.purpose, eyebrow } })} />
          <PairFields label="Title" value={draft.purpose.title} onChange={(title) => setDraft({ ...draft, purpose: { ...draft.purpose, title } })} />
          <PairFields label="Lead" value={draft.purpose.lead} onChange={(lead) => setDraft({ ...draft, purpose: { ...draft.purpose, lead } })} />
        </div>
      </Card>
      {(['mission', 'vision'] as const).map((key) => {
        const block = draft[key]
        const set = (patch: Partial<typeof block>) => setDraft({ ...draft, [key]: { ...block, ...patch } })
        return (
          <Card key={key}>
            <div className="flex flex-col gap-5">
              <PairFields label="Eyebrow" value={block.eyebrow} onChange={(eyebrow) => set({ eyebrow })} />
              <PairFields label="Headline" value={block.headline} onChange={(headline) => set({ headline })} area />
              <PairFields label="Supporting line" value={block.body} onChange={(body) => set({ body })} area />
            </div>
          </Card>
        )
      })}
    </>
  )
}

function ValuesEditor({
  draft,
  setDraft,
  valueId,
  setValueId,
}: {
  draft: Draft
  setDraft: (d: Draft) => void
  valueId: string
  setValueId: (id: string) => void
}) {
  const values = draft.values
  const item = values.items.find((v) => v.id === valueId) ?? values.items[0]
  const setItem = (patch: Partial<ValueItem>) =>
    setDraft({
      ...draft,
      values: { ...values, items: values.items.map((v) => (v.id === item.id ? { ...v, ...patch } : v)) },
    })
  return (
    <>
      <Card>
        <div className="flex flex-col gap-5">
          <PairFields label="Eyebrow" value={values.eyebrow} onChange={(eyebrow) => setDraft({ ...draft, values: { ...values, eyebrow } })} />
          <PairFields label="Title" value={values.title} onChange={(title) => setDraft({ ...draft, values: { ...values, title } })} />
        </div>
      </Card>
      <div className="flex gap-2 overflow-x-auto">
        {values.items.map((v, i) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setValueId(v.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              v.id === item.id ? 'bg-[#053552] text-white' : 'bg-white text-[#053552] ring-1 ring-[rgba(5,53,82,0.12)]'
            }`}
          >
            {String(i + 1).padStart(2, '0')} {v.title.en}
          </button>
        ))}
      </div>
      <Card>
        <div className="flex flex-col gap-5">
          <PhotoField src={item.photo} onChange={(photo) => setItem({ photo })} />
          <PairFields label="Title" value={item.title} onChange={(title) => setItem({ title })} />
          <PairFields label="Body" value={item.body} onChange={(body) => setItem({ body })} area />
        </div>
      </Card>
    </>
  )
}

function MarketsEditor({
  draft,
  setDraft,
  marketId,
  setMarketId,
}: {
  draft: Draft
  setDraft: (d: Draft) => void
  marketId: string
  setMarketId: (id: string) => void
}) {
  const market = draft.markets.find((m) => m.id === marketId) ?? draft.markets[0]
  const set = (patch: Partial<MarketDraft>) =>
    setDraft({ ...draft, markets: draft.markets.map((m) => (m.id === market.id ? { ...m, ...patch } : m)) })
  return (
    <>
      <Card>
        <div className="flex flex-col gap-5">
          <PairFields
            label="Section eyebrow"
            value={draft.footprint.eyebrow}
            onChange={(eyebrow) => setDraft({ ...draft, footprint: { ...draft.footprint, eyebrow } })}
          />
          <PairFields
            label="Section title"
            value={draft.footprint.title}
            onChange={(title) => setDraft({ ...draft, footprint: { ...draft.footprint, title } })}
          />
          <PairFields
            label="Section introduction"
            value={draft.footprint.body}
            onChange={(body) => setDraft({ ...draft, footprint: { ...draft.footprint, body } })}
            area
          />
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {draft.markets.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMarketId(m.id)}
            className={`overflow-hidden rounded-2xl text-left ring-1 transition ${
              m.id === market.id ? 'ring-2 ring-[#a9613a]' : 'ring-[rgba(5,53,82,0.1)]'
            }`}
          >
            <img src={m.photo} alt="" className="h-16 w-full object-cover" />
            <span className="block bg-white px-3 py-2 text-sm font-semibold">{m.name.en}</span>
          </button>
        ))}
      </div>
      <Card>
        <div className="flex flex-col gap-5">
          <PhotoField src={market.photo} illustrative={market.illustrative} onChange={(photo) => set({ photo, illustrative: false })} />
          <PairFields label="Name" value={market.name} onChange={(name) => set({ name })} />
          <TextField label="Investment" value={market.investment} onChange={(investment) => set({ investment })} />
          <PairFields label="Headline" value={market.headline} onChange={(headline) => set({ headline })} />
          <PairFields label="Summary" value={market.summary} onChange={(summary) => set({ summary })} area />
          {market.points.map((p, i) => (
            <PairFields
              key={i}
              label={`Point ${i + 1}`}
              value={p}
              onChange={(next) => set({ points: market.points.map((item, n) => (n === i ? next : item)) })}
            />
          ))}
        </div>
      </Card>
    </>
  )
}

function SitesEditor({
  draft,
  setDraft,
  siteId,
  setSiteId,
}: {
  draft: Draft
  setDraft: (d: Draft) => void
  siteId: string
  setSiteId: (id: string) => void
}) {
  const site = draft.sites.find((s) => s.id === siteId) ?? draft.sites[0]
  const set = (patch: Partial<SiteDraft>) =>
    setDraft({ ...draft, sites: draft.sites.map((s) => (s.id === site.id ? { ...s, ...patch } : s)) })
  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {draft.sites.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSiteId(s.id)}
            className={`shrink-0 rounded-xl bg-white px-3 py-2.5 text-left ring-1 transition lg:w-full ${
              s.id === site.id ? 'ring-2 ring-[#a9613a]' : 'ring-[rgba(5,53,82,0.1)]'
            }`}
          >
            <span className="block text-sm font-semibold">{s.name}</span>
            <span className="block text-xs text-[#4a6474]">{s.city.en}</span>
          </button>
        ))}
      </div>
      <Card>
        <div className="flex flex-col gap-5">
          <PhotoField src={site.photo} illustrative={site.illustrative} onChange={(photo) => set({ photo, illustrative: false })} />
          {site.logo && <PhotoField label="Logo" src={site.logo} onChange={(logo) => set({ logo })} />}
          <TextField label="Name" value={site.name} onChange={(name) => set({ name })} />
          <PairFields label="City" value={site.city} onChange={(city) => set({ city })} />
          <p className="text-xs text-[#4a6474]">Sector stays fixed: {site.sector}</p>
          <div>
            <p className="mb-2 text-[0.68rem] font-semibold tracking-[0.16em] text-[#215c7e] uppercase">Status</p>
            <div className="flex gap-2">
              {(['operational', 'construction'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => set({ status })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    site.status === status ? 'bg-[#053552] text-white' : 'bg-[#e2e7e8] text-[#053552]'
                  }`}
                >
                  {status === 'operational' ? 'Operational' : 'Under construction'}
                </button>
              ))}
            </div>
          </div>
          <PairFields label="Kind" value={site.kind} onChange={(kind) => set({ kind })} />
          <PairFields label="Milestone" value={site.milestone} onChange={(milestone) => set({ milestone })} />
          <TextField label="Investment" value={site.investment} onChange={(investment) => set({ investment })} />
          <PairFields label="About" value={site.about} onChange={(about) => set({ about })} area />
          <TextField label="Website" value={site.url} onChange={(url) => set({ url })} />
        </div>
      </Card>
    </div>
  )
}

function ContactEditor({ draft, setDraft }: { draft: Draft; setDraft: (d: Draft) => void }) {
  const contact = draft.contact
  const set = (patch: Partial<Draft['contact']>) => setDraft({ ...draft, contact: { ...contact, ...patch } })
  return (
    <>
      <Card>
        <PhotoField src={contact.photo} onChange={(photo) => set({ photo })} />
      </Card>
      <Card>
        <div className="flex flex-col gap-5">
          <PairFields label="Eyebrow" value={contact.eyebrow} onChange={(eyebrow) => set({ eyebrow })} />
          <PairFields label="Title" value={contact.title} onChange={(title) => set({ title })} />
          <PairFields label="Body" value={contact.body} onChange={(body) => set({ body })} area />
          <TextField label="Email" value={contact.email} onChange={(email) => set({ email })} />
          <TextField label="Website" value={contact.website} onChange={(website) => set({ website })} />
          <PairFields label="Address" value={contact.address} onChange={(address) => set({ address })} />
          <PairFields label="Button" value={contact.cta} onChange={(cta) => set({ cta })} />
        </div>
      </Card>
    </>
  )
}
