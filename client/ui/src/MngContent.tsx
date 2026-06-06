import { useEffect, useState, startTransition, Suspense } from 'react'

import { getContentHeader } from 'awblog-base'

import ContentEdit from './ContentEdit'


/**
 * editor properties
 */
type ContentEditorProperties = {
  /**
   * content id
   */
  contentId: number
}

/**
 * content editor selector properties
 */
type ContentEditorSelectorProperties = ContentEditorProperties


/**
 * management content properties
 */
type MngContentProperties = ContentEditorProperties


/**
 * select content editor 
 */
function ContentEditorSelector(props: ContentEditorSelectorProperties) {
  const [contentType, setContentType] = useState('')

  useEffect(()=>{ 
    let doUpdate = true;
    startTransition(async () => {
      let contentResType = contentType
      if (doUpdate) {
        if (props.contentId) {
          const headerRes = await getContentHeader(props.contentId, true)
          if (headerRes) {
            const headerJson = await headerRes.json()
            if ('content-type' in headerJson) {
              contentResType = headerJson['content-type']
            }
          }
        } else {
          contentResType = ''
        }
        setContentType(contentResType)
      }
    })
    return ()=> { doUpdate = false }
  }, [props.contentId])

  if (contentType.indexOf('text') != -1) {
    return <ContentEdit contentId={props.contentId} />
  } else {
    return null
  }
}


/**
 *  content manage ment
 */
export default function MngContent(
  mngContentProps: MngContentProperties) {

  
  return (
    <Suspense fallback={<p>loading...</p>}> 
      <ContentEditorSelector {... mngContentProps} />
    </Suspense>
  )
}


// vi: se ts=2 sw=2 et:
