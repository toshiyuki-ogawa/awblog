import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import PublicAppRoutes from './PublicAppRoutes'
import { init as initAwblog }  from 'awblog-base'
import { loadI18nSetting } from './i18n'
import { loadIndexEntries } from './index-entries'
import { loadBasename, getBasename } from './basename'

import { getRootName } from './root-name'
// start application
(async () => {

  await loadBasename()
  const basename = await getBasename()
  await initAwblog()
  await loadIndexEntries("index.html")

  createRoot(document.getElementById(getRootName())!).render(
    <BrowserRouter basename={basename} >
      <PublicAppRoutes />
    </BrowserRouter>
  )
})()


// vi: se ts=2 sw=2 et:
