import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import ContentEditAppRoutes from './ContentsEditAppRoutes'
import { init as initAwblog }  from 'awblog-base'
import { loadI18nSetting } from './i18n'
import { loadContentTypes } from './content-types'
import loadDataFromStorage from './storage'
import { init as initAccount } from './account'
import { loadEntryTitle } from './entry-title'
import { loadIndexEntries } from './index-entries'
import { loadBasename, getBasename } from './basename'
import {
  initAccountLibrary as initGoogleAccountLib
} from './oauth-token-google'

// start application
(async () => {

  await loadBasename()
  const basename = await getBasename()
  const succeeded = await loadI18nSetting(getBasename())
  await initAwblog()
  await loadEntryTitle()
  await loadIndexEntries("contents-edit-index.html")
  await loadContentTypes() 
  await initGoogleAccountLib()
  loadDataFromStorage()
  initAccount()

  createRoot(document.getElementById('main')!).render(
    <BrowserRouter basename={basename} >
      <ContentEditAppRoutes />
    </BrowserRouter>
  )
})()


// vi: se ts=2 sw=2 et:
