import {
  useEffect, useState, startTransition,
  useSyncExternalStore, Suspense
} from 'react'
import { getContentHeader } from 'awblog-base'

import ContentTypeEdit from './ContentTypeEdit'
import ContentEdit from './ContentEdit'
import BinaryEdit, { isBinaryEditType } from './BinaryEdit'
import { getOauthToken } from './account'


/**
 * editor properties
 */
type ContentEditorProperties = {
  /**
   * content id
   */
  contentId: number
  /**
   * content type
   */
  contentType: string
}

/**
 * content editor selector properties
 */
type ContentEditorSelectorProperties = ContentEditorProperties

/**
 * management content properties
 */
type MngContentProperties = {
  /**
   * content id
   */
  contentId: number
}



/**
 * select content editor 
 */
function ContentEditorSelector(props: ContentEditorSelectorProperties) {

  if (props.contentType.indexOf('text') != -1) {
    return <ContentEdit contentId={props.contentId} />
  } else if (isBinaryEditType(props.contentType)) {
    return <BinaryEdit contentId={props.contentId} />
  } else {
    return null
  }
}


/**
 *  content manage ment
 */
export default function MngContent(
  mngContentProps: MngContentProperties) {
  const [contentType, setContentType] = useState('')

  function contentTypeChanged(contentType: string) {
    setContentType(contentType)
  }
  
  return (
    <>
      <ContentTypeEdit
        contentId={mngContentProps.contentId}
        contentTypeChanged={contentTypeChanged}
        /> 
      <Suspense fallback={<p>loading...</p>}> 
        <ContentEditorSelector 
          contentId={mngContentProps.contentId}
          contentType={contentType} />
      </Suspense>
    </>
  )
}


// vi: se ts=2 sw=2 et:
