import { lazy, Suspense, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import LandingPage from './components/landing/LandingPage.jsx'
import { registerRuntimeIdentity } from './app/runtime-identity.js'

const Editor = lazy(() => import('./main.jsx'))
const isEditor = /^\/editor\/?$/.test(window.location.pathname)
document.documentElement.dataset.view = isEditor ? 'editor' : 'landing'

function Site() {
  useLayoutEffect(() => { document.getElementById('root')?.removeAttribute('data-booting') }, [])
  return isEditor ? <Suspense fallback={null}><Editor /></Suspense> : <LandingPage />
}

registerRuntimeIdentity()
createRoot(document.getElementById('root')).render(<Site />)
