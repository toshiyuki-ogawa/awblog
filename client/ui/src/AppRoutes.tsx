import { Routes, Route } from 'react-router'

import App from './App'
import Contents from './Contents'

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
      </Routes>
    </>
  )
}

// vi: se ts=2 sw=2 et:
