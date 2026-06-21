import { useEffect, useState, useId } from 'react'

import { getContentHeader, updateContentHeader } from 'awblog-base'
import { getOauthToken } from './account'
import { getContentTypes } from './content-types'

/**
 * edit content type properties
 */
type ContentTypeEditProperties = {
  /**
   * content id
   */
  contentId: number


  /**
   * notified if content type changed
   */
  contentTypeChanged?: ((contentType: string) => void)
}



/**
 * update content type
 */
async function updateContentType(
  contentId: number,
  contentType: string): Promise<boolean> {
  const contentHeaderRes = await getContentHeader(
    contentId, true, getOauthToken() ?? undefined) 
  let result = false
  if (contentHeaderRes) {
      const contentHeader = await contentHeaderRes.json()
      contentHeader['content-type'] = contentType
      const res = await updateContentHeader(
        contentId,
        contentHeader,
        getOauthToken() ?? undefined)
      result = res ? true : false
  }
  return result
}



/**
 * edit content type
 */ 
export default function ContentTypeEdit(
  props: ContentTypeEditProperties) {

  const [contentType, setContentType] = useState('')
  const itemsId = useId()

  useEffect(()=> {
    (async ()=> {
      const contentHeaderRes = await getContentHeader(
        props.contentId, true,
        getOauthToken() ?? undefined) 
      if (contentHeaderRes) {
        const contentHeader = await contentHeaderRes.json()
        setContentType(contentHeader['content-type'] ?? '') 
      } else {
        setContentType('')
      }
    })()
  })

  useEffect(() => {
    if (props.contentTypeChanged) {
      props.contentTypeChanged(contentType)
    }

  }, [contentType])

  /**
   * form action
   */
  async function action(formData: FormData) {
    const contentType = formData.get("content-type") as string
    const res = await updateContentType(
      props.contentId, contentType)  
    if (res) {
      setContentType(contentType)
    }
  }

  return (
    <>
      <form action={action}> 
        <input
          name="content-type"
          defaultValue={contentType} 
          list={itemsId}
          />
        <input type="submit" />
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
