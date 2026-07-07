import { Routes, Route } from 'react-router'

import App from './App'
import Contents from './Contents'
import PublicPage from './PublicPage'
import MngPage from './MngPage'
import EditAuthorPage from './EditAuthorPage'
import SignInPage from './SignInPage'
import StartEditingPage from './StartEditingPage'
import TestPage from './TestPage'
import { getBasename } from './basename'

/**
 * awblog application 
 */
export default function ContentsEditAppRoutes() {
  return (
    <>
      <Routes>
        <Route path="contents-mng.html" element={<Contents />} />
        <Route path="public.html"
          element={
            <PublicPage 
              navigationPath={`${getBasename()}public.html`}
            />
          }/>
        <Route path="page-mng.html" element={<MngPage />} />
        <Route path="start-editing.html" element={<StartEditingPage />} />
        <Route path="contents-edit-test.html" element={<TestPage />} />
      </Routes>
    </>
  )
}

// vi: se ts=2 sw=2 et:
