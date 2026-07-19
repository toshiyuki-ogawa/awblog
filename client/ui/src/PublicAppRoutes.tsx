import { Routes, Route } from 'react-router'

import IndexPage from './IndexPage'
import { getBasename } from './basename'

/**
 * awblog application 
 */
export default function ContentsEditAppRoutes() {
  return (
    <>
      <Routes>
        <Route path="index.html"
          element={
            <IndexPage 
              navigationPath={`${getBasename()}index.html`}
            />
          }/>
      </Routes>
    </>
  )
}

// vi: se ts=2 sw=2 et:
