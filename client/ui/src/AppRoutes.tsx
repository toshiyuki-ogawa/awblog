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
export default function AppRoutes() {
  return (
    <>
      <Routes>
        <Route index element={<App />}/>
        <Route path="/index.html" element={<App />} />
        <Route path="/contents-mng.html" element={<Contents />} />
        <Route path="/public.html" element={<PublicPage />}/>
        <Route path="/page-mng.html" element={<MngPage />} />
        <Route path="/edit-author.html" element={<EditAuthorPage />} />
        <Route path="/signin.html" element={<SignInPage />} />
      </Routes>
    </>
  )
}

// vi: se ts=2 sw=2 et:
