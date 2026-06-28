import { 
  useEffect, useEffectEvent, useRef, useState, useId,
  useSyncExternalStore
} from 'react'

import { getContentHeader, updateContentHeader } from 'awblog-base'
import { getOauthToken } from './account'
import { getContentTypes } from './content-types'
import { type ContentTypeMng } from './content-type-mng'
import { type MessageMng } from './message-mng'
import { getDomainText } from './i18n'

/**
 * content type ui control
 */
export type ContentTypeUiControl = {

  /**
   * set user interface content type
   */
  setContentType: ((contentType: string)=>void)

  /**
   * get user intersafe content type
   */
  getContentType: (()=>string)
}



/**
 * edit content type properties
 */
type ContentTypeEditProperties = {

  /**
   * content type management
   */
  contentTypeMng: ContentTypeMng 

  /**
   * message management
   */
  messageMng: MessageMng

  /**
   * notified if content type changed
   */
  contentTypeUpdated?: ((contentType: string) => void)

  /**
   * notified when user interface control is ready to use.
   */
  uiControlAttached?: ((control: ContentTypeUiControl) => void)
}


/**
 * update content type
 */
async function updateContentType(
  contentId: number,
  contentType: string): Promise<Response | null> {
  const contentHeaderRes = await getContentHeader(
    contentId, true, getOauthToken() ?? undefined) 
  let result = null
  if (contentHeaderRes) {
      const contentHeader = await contentHeaderRes.json()
      contentHeader['content-type'] = contentType
      const res = await updateContentHeader(
        contentId,
        contentHeader,
        getOauthToken() ?? undefined)
      result = res
  }
  return result
}



/**
 * edit content type
 */ 
export default function ContentTypeEdit(
  props: ContentTypeEditProperties) {

  const contentTypeRef = useRef<HTMLInputElement | null>(null)
  const itemsId = useId()
  const contentTypeInputId = useId()
  const contentType = useSyncExternalStore(
    props.contentTypeMng.subscribe, props.contentTypeMng.getContentType)


  /**
   * form action
   */
  async function action(formData: FormData): Promise<void> {
    const contentType = formData.get("content-type") as string
    const modifyAction = formData.get("modify") as string
    if (modifyAction == "save") {
      const res = await props.contentTypeMng.updateContentType(contentType)  
      let updated = false 
      if (res) {
        const jsonRes = await res.json()
        if ('OK' == jsonRes['Status']) {
          updated = true
          props.messageMng.setMessage('')
        } else {
          if (jsonRes['message']) {
            props.messageMng.setMessage(
              getDomainText('awblog', jsonRes['message'] ?? '')) 
          }
        }
      }
      if (!updated) {
        props.contentTypeMng.setContentType(contentType)
      }
    } else {
      await props.contentTypeMng.loadContentType()
    }
  }
  return (
    <>
      <form action={action}> 
        <dl>
          <dt>
            <label
              htmlFor={contentTypeInputId}>
              {getDomainText('awblog', 'Content type')}
            </label>
          </dt>
          <dd>
            <input
              id={contentTypeInputId}
              name="content-type"
              defaultValue={contentType} 
              list={itemsId}
              />
          </dd>
        </dl>
        <button name="modify" value="save">
          {
            getDomainText('awblog', 'Save')
          }
        </button>
        <button name="modify" value="load">
          {
            getDomainText('awblog', 'Load')
          }
        </button>
        <datalist id={itemsId}>
          {
            getContentTypes().map(item => <option value={item[0]} />)
          } 
        </datalist>
      </form>
    </>
  )
}

// vi: se ts=2 sw=2 et:
