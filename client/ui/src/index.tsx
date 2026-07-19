import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import PublicAppRoutes from './PublicAppRoutes'
import { init as initAwblog }  from 'awblog-base'
import { loadIndexEntries } from './index-entries'
import { loadBasename, getBasename } from './basename'
import { load as loadInitialContent } from './initial-content'

import { getRootName } from './root-name'
// start application
(async () => {

  await loadBasename()
  const basename = await getBasename()
  await initAwblog()
  await loadInitialContent()
  await loadIndexEntries("index.html")

  createRoot(document.getElementById(getRootName())!).render(
    <BrowserRouter basename={basename} >
      <PublicAppRoutes />
    </BrowserRouter>
  )
})()


// vi: se ts=2 sw=2 et:
