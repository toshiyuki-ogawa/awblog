import { useSearchParams } from 'react-router'
import PublicContent from './PublicContent'

/**
 * public page properties
 */
type PublicPageProperties = {
  [key: string]: string
}


/**
 * public page
 */
export default function PublicPage(props: PublicPageProperties) {

  let [searchParams] = useSearchParams()

  if (searchParams.has('content-id')) {
    const contentId = parseInt(searchParams.get('content-id') as string)
    if (!isNaN(contentId)) {
      return <PublicContent contentId={contentId} />
    } else {
      return null
    }
  } else {
    return null
  }
}


// vi: se ts=2 sw=2 et:
