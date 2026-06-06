import { useSearchParams } from 'react-router'

import MngContent from './MngContent'

import { page as pageClass } from './MngPage.module.css'

/**
 * management page properties
 */
type MngPageProperties = {
  [key: string]: string
}



/**
 * management page
 */
export default function MngPage(mngPageProps: MngPageProperties) {

  let [searchParams] = useSearchParams()

  if (searchParams.has('content-id')) {
    const contentId = parseInt(searchParams.get('content-id') as string)
    if (!isNaN(contentId)) {
      return (
        <div className={pageClass}>
          <MngContent contentId={contentId} />
        </div>
      )
    } else {
      return null
    }
  } else {
    return null
  }
}


// vi: se ts=2 sw=2 et:
