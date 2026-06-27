import { 
  useState, useRef, useEffect, useImperativeHandle
} from 'react'
import BlobPreview from './BlobPreview'
import { getDomainText } from './i18n'
import { 
  updateContentWithBlob, getContentHeader, updateContentHeader, getContent
} from 'awblog-base'
import { getOauthToken } from './account'
import mime from 'mime'
import { type DataControl } from './data-control'
import { type ContentTypeMng } from './content-type-mng'
import { type MessageMng } from './message-mng'

/**
 *  binary edit data control
 */
export type BinaryEditDataControl = {

  /**
   * save data
   */
  save: (()=>void)

}


/**
 * header edit properties
 */
type BinaryEditProperties = {
  /**
   * content id
   */
  contentId: number

  /**
   * content type management
   */
  contentTypeMng: ContentTypeMng 

  /**
   * message management
   */
  messageMng: MessageMng

  /**
   * on data contrl attached
   */
  onDataControlAttached?: ((dataConrol: DataControl)=>void)

  /**
   * ref
   */
  ref?: React.Ref<DataControl>
}

/**
 * name to type
 */
function nameToType(name: string): string {
  const idx = name.lastIndexOf('.')
  let result = ''
  if (idx !== -1) {
    const ext = name.slice(idx + 1)
    const lookupRes = mime.getType(ext) 
    if (lookupRes) {
      result = lookupRes as string
    }
  }
  return result
}


/**
 * update message with json response
 */
function updateMessageWithJson(
  jsonRes: {[key: string]: string},
  messageMng: MessageMng): boolean {
  let result = true
  if ('OK' === jsonRes['status']) {
    messageMng.setMessage('')
  } else {
    result = false
    if (jsonRes['message']) {
      messageMng.setMessage(
        getDomainText('awblog', jsonRes['message'] ?? ''))
    }
  }
  return result
}

/**
 * file to content type
 */
function fileToContentType(file?: File): string | undefined {
  let result: string | undefined
  if (file) {
    result = file.type
    if (!result) {
      result = nameToType(file.name)
    }
  }
  return result
}

/**
 * update contents and get content
 */
async function updateContent(
  contentId: number, 
  messageMng: MessageMng,
  file?: File): Promise<Response | null> {
  let result = null

  const res = await getContentHeader(
    contentId, true, getOauthToken() ?? undefined)
  if (res) {
    let succeeded = true
    let contentHeader: { [key: string]: any } | undefined
    if (file) {
      let contentType = fileToContentType(file)!!
      const headerRes = await res.json()
      contentHeader = { ...headerRes }
      if (Object.is((contentHeader!!)['content-type'], contentType)) {
        (contentHeader!!)['content-type'] = contentType
      }
    }
    
    let updateRes = await updateContentWithBlob(
      contentId, file ?? new Blob(), getOauthToken() ?? undefined)
    if (updateRes) {
      succeeded = updateMessageWithJson(await updateRes.json(), messageMng)
    } else {
      succeeded = false
    }
    if (succeeded) {
      if (contentHeader) {
        updateRes = await updateContentHeader(
          contentId, contentHeader, getOauthToken() ?? undefined)
        if (updateRes) {
          succeeded = updateMessageWithJson(await updateRes.json(), messageMng)
        } else {
          succeeded = false
        }
      }
    }
    if (succeeded) {
      result = await getContent(
        contentId, true, getOauthToken() ?? undefined)
    }
  }
  return result
}

/**
 * you get true if content type is supported by the BinaryEdit
 */
export function isBinaryEditType(contentType: string): boolean {
  return contentType.indexOf("image") !== -1
    || contentType.indexOf("application/pdf") !== -1
}


/**
 * header edit
 */
export default function BinaryEdit(
  props: BinaryEditProperties) {

  const [file, setFile] = useState<File | undefined>()

  const [blobResponse, setBlobResponse] = useState<Response | null>(null)
  const imgInputElement = useRef<HTMLInputElement | null>(null)

  /**
   * handle action
   */
  async function action(formData: FormData) {
    const submitType = formData.get("update") 
    if (imgInputElement.current) {
      const files = imgInputElement.current.files as FileList
      if (submitType == "file") {
        if (files.length) {
          setFile(files[0])
        }
      } else {
        setFile(undefined) 
      }
    }
  }
  
  /**
   * save 
   */
  function save() {
    (async () => {
      if (file) {
        setBlobResponse(
          await updateContent(
            props.contentId, props.messageMng, file))
      } else {
        setBlobResponse(
          await updateContent(
            props.contentId, props.messageMng, undefined))
      }
    })()
  }
  useEffect(()=> {
    if (file) {
      let contentType = file.type
      if (!contentType) {
        contentType = nameToType(file.name)
      }
      props.contentTypeMng.setContentType(contentType)
    }
  }, [file])

  useEffect(()=> {
    if (props.onDataControlAttached) {
      props.onDataControlAttached({
        save
      })
    }
  })
  useImperativeHandle(props.ref, ()=> {
    return {
      save
    }
  })
 
  return (
    <>
      <div>
        <form action={action} >
          <label>{getDomainText('awblog', 'Image source')}
            <input name="img"
              type="file" accept="image/*,.pdf"
              ref={imgInputElement}/>
          </label>
          <button name="update" value="file" >
            {getDomainText('awblog', 'Update')}
          </button>
          <button name="update" value="clear">
            {getDomainText('awblog', 'Clear')}
          </button>
        </form>
      </div>
      <div>
        <BlobPreview
          contentResponse={blobResponse ?? undefined}
          blob={file}
          contentType={file ? fileToContentType(file) : undefined}
          />
      </div>
    </>
  )
}

// vi: se ts=2 sw=2 et:
