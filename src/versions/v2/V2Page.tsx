import { useState } from 'react'
import { V2Hero } from './V2Hero'
import { V2Presence } from './V2Presence'
import { V2Companies } from './V2Companies'
import { V2Industries } from './V2Industries'
import { V2Stats } from './V2Stats'
import { V2Projects } from './V2Projects'
import { V2News } from './V2News'
import { V2CTA } from './V2CTA'
import { V2Footer } from './V2Footer'

export default function V2Page() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)

  return (
    <div className="theme-v2 min-h-screen overflow-x-hidden bg-black">
      <V2Hero
        selectedCompanyId={selectedCompanyId}
        onSelectLocation={() => {
          /* location panel handled inside globe */
        }}
      />
      <V2Presence selectedCompanyId={selectedCompanyId} />
      <V2Companies
        selectedCompanyId={selectedCompanyId}
        onSelectCompany={(id) => {
          setSelectedCompanyId(id)
          if (id) {
            document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' })
          }
        }}
      />
      <V2Industries />
      <V2Stats />
      <V2Projects />
      <V2News />
      <V2CTA />
      <V2Footer />
    </div>
  )
}
