import { Suspense, startTransition, useState } from 'react'
import { getContent, getContentHeader } from 'awblog-base'

/**
 * content preview properties
 */
type ContentPreviewProperties = {

  /**
   * content id
   */
  contentId?: number
}

/**
 * preview properties
 */
type PreviewProperties = {
  /**
   * content id
   */
  contentId?: number
}


/**
 * preview
 */
function Preview(props: PreviewProperties) {
  const [content, setContent] = useState()

  startTransition(async ()=>{ 
    if (props.contentId) {
      const contentRes = await getContent(props.contentId)
      const contentType = contentRes.headers.get('Content-Type') 
      if (contentType) {
        if (contentType.indexOf('text') != -1) {
          setContent(await contentRes.text())
        }
      }
    }
  })

  if (content) { 
    return (<div>{content}</div>)
  } else {
    return null
  }
}

/**
 * simple content preview
 */
export default function ContentPreview(props: ContentPreviewProperties) {

  return (
    <>
      <Suspense fallback={<p>loading ... </p>}>
        <Preview {...props} />
      </Suspense>
    </>
  )

  
}



// vi: se ts=2 sw=2 et:
