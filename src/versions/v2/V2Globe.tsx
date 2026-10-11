import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { X, ArrowUpRight } from 'lucide-react'
import { companies, getCompany, locations } from '../../data'
import type { Location } from '../../data/types'
import {
  createArcPoints,
  generateNetworkDots,
  latLngToVector3,
} from './geo3d'

const GLOBE_RADIUS = 2.15

const ARC_PAIRS: [string, string][] = [
  ['cairo', 'dubai'],
  ['dubai', 'london'],
  ['cairo', 'riyadh'],
  ['london', 'paris'],
  ['dubai', 'doha'],
]

export interface V2GlobeProps {
  selectedCompanyId?: string | null
  onSelectLocation?: (id: string | null) => void
  highlightedLocationIds?: string[]
  className?: string
  autoRotate?: boolean
  showSelector?: boolean
  compact?: boolean
}

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  )
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => setMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [breakpoint])
  return mobile
}

function LocationPanel({
  location,
  onClose,
  variant = 'desktop',
}: {
  location: Location
  onClose: () => void
  variant?: 'desktop' | 'sheet'
}) {
  const companyNames = location.companies
    .map((id) => getCompany(id)?.shortName)
    .filter(Boolean)

  const shell =
    variant === 'sheet'
      ? 'fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-white/15 bg-black/95 p-5 pb-8 backdrop-blur-md'
      : 'pointer-events-auto w-[260px] rounded-sm border border-white/15 bg-black/90 p-4 backdrop-blur-md shadow-2xl'

  return (
    <div className={shell} style={{ fontFamily: 'var(--font-geo)' }}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.6rem] tracking-[0.28em] text-white/40 uppercase">
            {location.country}
          </p>
          <h3 className="mt-1 text-lg font-light tracking-wide text-white">
            {location.city}
          </h3>
          <p className="mt-0.5 text-[0.65rem] tracking-[0.18em] text-white/45 uppercase">
            {location.role}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/15 p-1.5 text-white/50 transition hover:border-white/40 hover:text-white"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-white/55">
        {location.description}
      </p>

      <div className="mb-4 grid grid-cols-3 gap-2 border-y border-white/10 py-3">
        <div>
          <p className="text-[0.55rem] tracking-[0.2em] text-white/35 uppercase">
            Companies
          </p>
          <p className="mt-1 text-sm text-white">{companyNames.length}</p>
        </div>
        <div>
          <p className="text-[0.55rem] tracking-[0.2em] text-white/35 uppercase">
            People
          </p>
          <p className="mt-1 text-sm text-white">
            {location.employeeCount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[0.55rem] tracking-[0.2em] text-white/35 uppercase">
            Projects
          </p>
          <p className="mt-1 text-sm text-white">{location.projectCount}</p>
        </div>
      </div>

      <p className="mb-4 text-[0.65rem] leading-relaxed text-white/40">
        {companyNames.join(' · ')}
      </p>

      <a
        href="#companies"
        className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.22em] text-white uppercase transition hover:text-white/70"
      >
        Explore
        <ArrowUpRight size={12} />
      </a>
    </div>
  )
}

function GlobeMesh() {
  return (
    <group>
      {/* Near-black core — silhouette only; continents are the point cloud */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color="#050505"
          roughness={1}
          metalness={0}
          emissive="#000000"
        />
      </mesh>
      <mesh scale={1.012}>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

function NetworkDots() {
  const positions = useMemo(
    () => generateNetworkDots(28000, GLOBE_RADIUS, 91),
    [],
  )
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  const dotMap = useMemo(() => {
    const size = 64
    const c = document.createElement('canvas')
    c.width = size
    c.height = size
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.4, 'rgba(255,255,255,0.7)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(c)
    tex.needsUpdate = true
    return tex
  }, [])

  useEffect(
    () => () => {
      geom.dispose()
      dotMap.dispose()
    },
    [geom, dotMap],
  )

  return (
    <points geometry={geom}>
      <pointsMaterial
        map={dotMap}
        color="#e8e8e8"
        size={0.026}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function ArcLines({ visibleIds }: { visibleIds: Set<string> }) {
  const lines = useMemo(() => {
    return ARC_PAIRS.filter(
      ([a, b]) => visibleIds.has(a) && visibleIds.has(b),
    ).map(([a, b]) => {
      const la = locations.find((l) => l.id === a)!
      const lb = locations.find((l) => l.id === b)!
      const start = latLngToVector3(
        la.coordinates[0],
        la.coordinates[1],
        GLOBE_RADIUS,
      )
      const end = latLngToVector3(
        lb.coordinates[0],
        lb.coordinates[1],
        GLOBE_RADIUS,
      )
      return createArcPoints(start, end, GLOBE_RADIUS).map(
        (p) => [p.x, p.y, p.z] as [number, number, number],
      )
    })
  }, [visibleIds])

  return (
    <group>
      {lines.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#ffffff"
          lineWidth={1}
          transparent
          opacity={0.22}
        />
      ))}
    </group>
  )
}

function LocationMarker({
  location,
  active,
  dimmed,
  focused,
  onHover,
  onSelect,
}: {
  location: Location
  active: boolean
  dimmed: boolean
  focused: boolean
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
}) {
  const [lat, lng] = location.coordinates
  const position = useMemo(
    () => latLngToVector3(lat, lng, GLOBE_RADIUS * 1.012),
    [lat, lng],
  )
  const scale = focused ? 1.55 : active ? 1.25 : 1
  const opacity = dimmed ? 0.2 : 1

  return (
    <group position={position}>
      <mesh
        scale={scale}
        onPointerOver={(e) => {
          if (dimmed) return
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
          onHover(location.id)
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
          onHover(null)
        }}
        onClick={(e) => {
          if (dimmed) return
          e.stopPropagation()
          onSelect(location.id)
        }}
      >
        <sphereGeometry args={[0.038, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>
      {(active || focused) && !dimmed && (
        <mesh scale={scale * 2.4}>
          <sphereGeometry args={[0.038, 12, 12]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

function CameraController({
  focusId,
  controlsRef,
  autoRotate,
}: {
  focusId: string | null
  controlsRef: MutableRefObject<any>
  autoRotate: boolean
}) {
  const { camera } = useThree()
  const goalPos = useRef(new THREE.Vector3())
  const goalTarget = useRef(new THREE.Vector3(0, 0, 0))
  const animating = useRef(false)

  useEffect(() => {
    if (!focusId) {
      animating.current = false
      return
    }
    const loc = locations.find((l) => l.id === focusId)
    if (!loc) return
    const surface = latLngToVector3(
      loc.coordinates[0],
      loc.coordinates[1],
      GLOBE_RADIUS,
    )
    goalTarget.current.copy(surface).multiplyScalar(0.15)
    goalPos.current.copy(surface).normalize().multiplyScalar(5.4)
    // Prefer slightly elevated view
    goalPos.current.y += 0.85
    animating.current = true
  }, [focusId])

  useFrame((_, dt) => {
    const controls = controlsRef.current
    if (!controls) return

    if (animating.current && focusId) {
      const t = 1 - Math.exp(-dt * 3.2)
      camera.position.lerp(goalPos.current, t)
      controls.target.lerp(goalTarget.current, t)
      controls.update()
      if (camera.position.distanceTo(goalPos.current) < 0.04) {
        animating.current = false
      }
    } else if (autoRotate && !focusId) {
      controls.autoRotate = true
    } else {
      controls.autoRotate = false
    }
  })

  return null
}

function Scene({
  visibleLocations,
  selectedId,
  hoveredId,
  onHover,
  onSelect,
  autoRotate,
}: {
  visibleLocations: Location[]
  selectedId: string | null
  hoveredId: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
  autoRotate: boolean
}) {
  const controlsRef = useRef<any>(null)
  const visibleIds = useMemo(
    () => new Set(visibleLocations.map((l) => l.id)),
    [visibleLocations],
  )
  const hovered = locations.find((l) => l.id === hoveredId)

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[-6, 4, 3]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-2, 2, 5]} intensity={0.5} color="#c8d0e0" />
      <directionalLight
        position={[5, -1, -4]}
        intensity={0.06}
        color="#334455"
      />

      <GlobeMesh />
      <NetworkDots />
      <ArcLines visibleIds={visibleIds} />

      {locations.map((loc) => {
        const visible = visibleIds.has(loc.id)
        return (
          <LocationMarker
            key={loc.id}
            location={loc}
            active={visible}
            dimmed={!visible}
            focused={selectedId === loc.id}
            onHover={onHover}
            onSelect={onSelect}
          />
        )
      })}

      {hovered && !selectedId && (
        <Html
          position={latLngToVector3(
            hovered.coordinates[0],
            hovered.coordinates[1],
            GLOBE_RADIUS * 1.08,
          ).toArray()}
          center
          distanceFactor={8}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="whitespace-nowrap rounded-sm border border-white/20 bg-black/85 px-2.5 py-1 text-[0.6rem] tracking-[0.2em] text-white uppercase"
            style={{ fontFamily: 'var(--font-geo)' }}
          >
            {hovered.city}
          </div>
        </Html>
      )}

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom
        minDistance={3.6}
        maxDistance={8}
        autoRotate={autoRotate && !selectedId}
        autoRotateSpeed={0.35}
        rotateSpeed={0.55}
        zoomSpeed={0.6}
        dampingFactor={0.08}
        enableDamping
      />
      <CameraController
        focusId={selectedId}
        controlsRef={controlsRef}
        autoRotate={autoRotate}
      />
    </>
  )
}

export function V2Globe({
  selectedCompanyId = null,
  onSelectLocation,
  highlightedLocationIds,
  className = '',
  autoRotate = true,
  showSelector = true,
  compact = false,
}: V2GlobeProps) {
  const isMobile = useIsMobile()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [webglFailed, setWebglFailed] = useState(false)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const ok = !!(
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      )
      if (!ok) setWebglFailed(true)
    } catch {
      setWebglFailed(true)
    }
  }, [])

  const visibleLocations = useMemo(() => {
    if (highlightedLocationIds && highlightedLocationIds.length > 0) {
      return locations.filter((l) => highlightedLocationIds.includes(l.id))
    }
    if (selectedCompanyId) {
      const company = companies.find((c) => c.id === selectedCompanyId)
      if (company) {
        return locations.filter((l) => company.locations.includes(l.id))
      }
    }
    return locations
  }, [selectedCompanyId, highlightedLocationIds])

  const handleSelect = useCallback(
    (id: string) => {
      const next = id === '' || id === selectedId ? null : id
      setSelectedId(next)
      onSelectLocation?.(next)
    },
    [onSelectLocation, selectedId],
  )

  useEffect(() => {
    // Clear selection if filtered out
    if (selectedId && !visibleLocations.some((l) => l.id === selectedId)) {
      setSelectedId(null)
      onSelectLocation?.(null)
    }
  }, [visibleLocations, selectedId, onSelectLocation])

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  const selected = locations.find((l) => l.id === selectedId)
  const useFallback = isMobile || webglFailed

  return (
    <div
      className={`relative ${className}`}
      style={{ fontFamily: 'var(--font-geo)' }}
    >
      {!useFallback ? (
        <Canvas
          className="h-full w-full"
          camera={{ position: [0, 0.6, 5.8], fov: compact ? 42 : 38, near: 0.1, far: 100 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
          }}
        >
          <Suspense fallback={null}>
            <Scene
              visibleLocations={visibleLocations}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onSelect={handleSelect}
              autoRotate={autoRotate}
            />
          </Suspense>
        </Canvas>
      ) : (
        <MobileGlobeFallback
          visibleLocations={visibleLocations}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      )}

      {showSelector && (
        <div
          className={`pointer-events-none absolute z-10 flex flex-col gap-1 ${
            compact
              ? 'right-3 top-3 max-h-[55%] overflow-y-auto'
              : 'bottom-6 left-4 max-h-[40vh] overflow-y-auto md:bottom-10 md:left-8'
          }`}
        >
          <p className="pointer-events-none mb-2 text-[0.55rem] tracking-[0.3em] text-white/35 uppercase">
            Locations
          </p>
          {visibleLocations.map((loc) => (
            <button
              key={loc.id}
              type="button"
              onClick={() => handleSelect(loc.id)}
              className={`pointer-events-auto text-left text-[0.65rem] tracking-[0.18em] uppercase transition ${
                selectedId === loc.id
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {loc.city}
            </button>
          ))}
        </div>
      )}

      {!isMobile && selected && (
        <div className="pointer-events-none absolute top-1/2 right-4 z-20 -translate-y-1/2 md:right-10">
          <div className="pointer-events-auto">
            <LocationPanel
              location={selected}
              onClose={() => handleSelect(selected.id)}
            />
          </div>
        </div>
      )}

      {isMobile && selected && (
        <LocationPanel
          location={selected}
          onClose={() => handleSelect(selected.id)}
          variant="sheet"
        />
      )}
    </div>
  )
}

function MobileGlobeFallback({
  visibleLocations,
  selectedId,
  onSelect,
}: {
  visibleLocations: Location[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 py-10">
      <div className="relative mb-8 aspect-square w-[min(72vw,280px)]">
        <div className="absolute inset-0 rounded-full border border-white/10 bg-[#0a0a0a]" />
        <div className="absolute inset-[8%] rounded-full border border-white/5" />
        {visibleLocations.map((loc, i) => {
          const angle = (i / visibleLocations.length) * Math.PI * 2 - Math.PI / 2
          const r = 38
          const x = 50 + Math.cos(angle) * r
          const y = 50 + Math.sin(angle) * r
          const active = selectedId === loc.id
          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => onSelect(loc.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
              aria-label={loc.city}
            >
              <span
                className={`block rounded-full bg-white transition ${
                  active ? 'h-2.5 w-2.5' : 'h-1.5 w-1.5 opacity-60'
                }`}
              />
            </button>
          )
        })}
      </div>
      <ul className="w-full max-w-xs space-y-2">
        {visibleLocations.map((loc) => (
          <li key={loc.id}>
            <button
              type="button"
              onClick={() => onSelect(loc.id)}
              className={`flex w-full items-center justify-between border-b border-white/10 py-2.5 text-left text-xs tracking-[0.16em] uppercase transition ${
                selectedId === loc.id ? 'text-white' : 'text-white/45'
              }`}
            >
              <span>{loc.city}</span>
              <span className="text-white/25">{loc.countryCode}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default V2Globe
