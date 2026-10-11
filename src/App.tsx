import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ConceptSwitcher } from './components/ConceptSwitcher'
import HomePage from './pages/HomePage'

const V1Page = lazy(() => import('./versions/v1/V1Page'))
const V2Page = lazy(() => import('./versions/v2/V2Page'))
const V5Page = lazy(() => import('./versions/v5/V5Page'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-black text-white/50 flex items-center justify-center tracking-[0.3em] text-xs uppercase">
      Loading concept…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/v1" element={<V1Page />} />
          <Route path="/v2" element={<V2Page />} />
          <Route path="/v5" element={<V5Page />} />
        </Routes>
      </Suspense>
      <ConceptSwitcher />
    </BrowserRouter>
  )
}
