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
 *  content manage ment
 */
export default function MngContent(
  mngContentProps: MngContentProperties) {
  
  return <ContentEdit contentId={mngContentProps.contentId} />
}


// vi: se ts=2 sw=2 et:
