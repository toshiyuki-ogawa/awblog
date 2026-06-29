import { Routes, Route } from 'react-router'

import App from './App'
import Contents from './Contents'
import PublicPage from './PublicPage'
import MngPage from './MngPage'
import EditAuthorPage from './EditAuthorPage'
import SignInPage from './SignInPage'

/**
 * awblog application 
 */
export default function ContentsEditAppRoutes() {

  return (
    <>
      <Routes>
        <Route path="contents-mng.html" element={<Contents />} />
        <Route path="public.html" element={<PublicPage />}/>
        <Route path="page-mng.html" element={<MngPage />} />
      </Routes>
    </>
  )
}

// vi: se ts=2 sw=2 et:
