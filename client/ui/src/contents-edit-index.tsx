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
import {
  initAccountLibrary as initGoogleAccountLib
} from './oauth-token-google'

// start application
(async () => {

  /**
   * get basename
   */
  async function getBasename(): Promise<string> {
    let result = '/'
    try {
      const res = await fetch('basename.txt')
      if (res.ok) {
        result = await res.text()
        result = result.trim()
      }
    } catch (e) {
    }
    return result
  }

  const basename = await getBasename()
  const succeeded = await loadI18nSetting(basename)
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
