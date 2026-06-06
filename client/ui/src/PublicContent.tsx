import {
  useEffect,
  useState,
  Suspense,
  startTransition
} from 'react'
import Markdown from 'react-markdown'
import { getContent } from 'awblog-base'

/**
 * content properties
 */
type ContentProperties = {

  /**
   * content id
   */
  contentId: number
}

type PublicContentProperties = ContentProperties



/**
 * content
 */
function Content(props: ContentProperties) {
  
  const [content, setContent] = useState()
  const [contentType, setContentType] = useState('')
  
  useEffect(()=>{ 
    let doUpdate = true;
    startTransition(async () => {
      let contentResType = contentType
      let contentResData = content
      if (doUpdate) {
        if (props.contentId) {
          const contentRes = await getContent(props.contentId)
          contentResType = contentRes.headers.get('Content-Type') ?? ''
          if (contentResType) {
            if (contentResType.indexOf('text') != -1) {
              contentResData = await contentRes.text()
            } else {
              contentResData = undefined
            }
          }
        } else {
          contentResType = ''
          contentResData = undefined
        }
        setContentType(contentResType)
        setContent(contentResData)
      }
    })
    return ()=> { doUpdate = false }
  }, [props.contentId])

  if (contentType.indexOf('text') != -1 && content) {
    return <Markdown>{content as string}</Markdown>
  } else {
    return null
  }
}


/**
 * render public content
 */
export default function PublicContent(props: PublicContentProperties) {


  return (
    <>
      <Suspense fallback={<p>loading...</p>}>
        <Content { ...props} />
      </Suspense>
    </>
  )

}

// vi: se ts=2 sw=2 et:
