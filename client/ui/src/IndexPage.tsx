import { useSearchParams } from 'react-router'
import PublicContent from './PublicContent'
import { getStartContentId } from './initial-content'
/**
 * index page properties
 */
type IndexPageProperties = {
  /**
   * navigation path to be created as react router link if the node is html
   * anchor element.
   */
  navigationPath: string
}


/**
 * index page
 */
export default function IndexPage(props: IndexPageProperties) {

  let [searchParams] = useSearchParams()
  let contentId = 0
  if (searchParams.has('content-id')) {
    contentId = parseInt(searchParams.get('content-id') as string)
  } else {
    contentId = getStartContentId()
  }
  if (!isNaN(contentId) && contentId) {
    return <PublicContent contentId={contentId}
      navigationPath={props.navigationPath} />
  } else {
    return null
  }
}


// vi: se ts=2 sw=2 et:
