import type { ReactNode } from 'react'

export type Pair = { en: string; ar: string }

const input =
  'w-full rounded-xl border border-[rgba(5,53,82,0.14)] bg-white px-3.5 py-2.5 text-sm text-[#053552] outline-none transition placeholder:text-[#4a6474]/50 focus:border-[#053552]'

export function Card({ children }: { children: ReactNode }) {
  return <section className="rounded-2xl bg-white p-5 shadow-[0_1px_0_rgba(5,53,82,0.04)] ring-1 ring-[rgba(5,53,82,0.08)] sm:p-6">{children}</section>
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-[0.68rem] font-semibold tracking-[0.16em] text-[#215c7e] uppercase">{children}</p>
}

export function TextField({
  label,
  value,
  onChange,
  area,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  area?: boolean
}) {
  const El = area ? 'textarea' : 'input'
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <El
        className={`${input} ${area ? 'min-h-28 resize-y leading-relaxed' : ''}`}
        value={value}
        dir="ltr"
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export function PairFields({
  label,
  value,
  onChange,
  area,
}: {
  label: string
  value: Pair
  onChange: (v: Pair) => void
  area?: boolean
}) {
  const El = area ? 'textarea' : 'input'
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[0.65rem] font-medium tracking-wide text-[#4a6474]">English</span>
          <El
            className={`${input} ${area ? 'min-h-28 resize-y leading-relaxed' : ''}`}
            value={value.en}
            dir="ltr"
            onChange={(e) => onChange({ ...value, en: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-right text-[0.65rem] font-medium text-[#4a6474]">العربية</span>
          <El
            className={`${input} iti-ar ${area ? 'min-h-28 resize-y leading-relaxed' : ''}`}
            value={value.ar}
            dir="rtl"
            onChange={(e) => onChange({ ...value, ar: e.target.value })}
          />
        </label>
      </div>
    </div>
  )
}

export function PhotoField({
  src,
  onChange,
  illustrative,
  label = 'Image',
}: {
  src: string
  onChange: (v: string) => void
  illustrative?: boolean
  label?: string
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className={`relative h-44 overflow-hidden rounded-2xl ring-1 ring-[rgba(5,53,82,0.1)] ${label === 'Logo' ? 'bg-white' : 'bg-[#e2e7e8]'}`}>
        <img src={src} alt="" className={`h-full w-full ${label === 'Logo' ? 'object-contain p-6' : 'object-cover'}`} />
        {illustrative && (
          <span className="absolute top-3 left-3 rounded-full bg-[#a9613a] px-2.5 py-1 text-[0.62rem] font-semibold text-white">
            Illustrative
          </span>
        )}
        <label className="absolute right-3 bottom-3 cursor-pointer rounded-full bg-[#053552] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#215c7e]">
          Replace
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onChange(URL.createObjectURL(file))
              e.target.value = ''
            }}
          />
        </label>
      </div>
    </div>
  )
}
