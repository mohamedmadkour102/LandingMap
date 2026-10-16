import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ConceptSwitcher } from './components/ConceptSwitcher'
import HomePage from './pages/HomePage'

const ItiPage = lazy(() => import('./versions/iti/ItiPage'))
const AdminPage = lazy(() => import('./admin/AdminPage'))
const V1Page = lazy(() => import('./versions/v1/V1Page'))
const V2Page = lazy(() => import('./versions/v2/V2Page'))
const V5Page = lazy(() => import('./versions/v5/V5Page'))

function PageLoader() {
  return <div className="min-h-screen bg-white" />
}

/** Old /iti/en and /iti/ar addresses keep working */
function LegacyIti() {
  const { lang } = useParams()
  return <Navigate to={lang === 'ar' ? '/ar' : '/en'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/" element={<Navigate to="/en" replace />} />
          <Route path="/iti" element={<Navigate to="/en" replace />} />
          <Route path="/iti/:lang" element={<LegacyIti />} />
          <Route path="/concepts" element={<HomePage />} />
          <Route path="/v1" element={<V1Page />} />
          <Route path="/v2" element={<V2Page />} />
          <Route path="/v5" element={<V5Page />} />
          <Route path="/:lang" element={<ItiPage />} />
        </Routes>
      </Suspense>
      <ConceptSwitcher />
    </BrowserRouter>
  )
}
