import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import AppRoutes from './AppRoutes'
import { init as initAwblog }  from 'awblog-base'
import { loadI18nSetting } from './i18n'

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
  createRoot(document.getElementById('main')!).render(
    <BrowserRouter basename={basename} >
      <AppRoutes />
    </BrowserRouter>
  )
})()


// vi: se ts=2 sw=2 et:
