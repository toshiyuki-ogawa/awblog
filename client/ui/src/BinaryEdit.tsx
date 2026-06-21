import { 
  useState, useRef, useEffect
} from 'react'
import BlobPreview from './BlobPreview'
import { getDomainText } from './i18n'
import { 
  updateContentWithBlob, getContentHeader, updateContentHeader, getContent
} from 'awblog-base'
import { getOauthToken } from './account'
import mime from 'mime'
import { type DataControl } from './data-control'

/**
 * header edit properties
 */
type BinaryEditProperties = {
  /**
   * content id
   */
  contentId: number

  /**
   * on data contrl attached
   */
  onDataControlAttached?: ((dataConrol: DataControl)=>void)
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
 * update contents and get content
 */
async function updateContent(
  contentId: number, file?: File): Promise<Response | null> {
  let result = null
  if (file) {

    const headerRes = await getContentHeader(
      contentId, true, getOauthToken() ?? undefined)

    if (headerRes) {

      let contentType = file.type
      if (!contentType) {
        contentType = nameToType(file.name)
      }
      const contentHeader = { ...headerRes }
      contentHeader['content-type'] = contentType
    
      let updateRes = await updateContentWithBlob(
        contentId, file, getOauthToken() ?? undefined)
      
      if (updateRes) {
        updateRes = await updateContentHeader(
          contentId, contentHeader, getOauthToken() ?? undefined)
      }
      if (updateRes) {
        result = await getContent(
          contentId, true, getOauthToken() ?? undefined)
      }
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
        } else {
          setFile(undefined)
        }
      } else {
        if (files.length) {
          setBlobResponse(await updateContent(props.contentId, files[0]))
        } else {
          setBlobResponse(await updateContent(props.contentId, undefined))
        }
      }
    }
  }
  
  /**
   * save 
   */
  function save() {
    (async () => {
      if (imgInputElement.current) {
        const files = imgInputElement.current.files as FileList
         if (files.length) {
          setBlobResponse(await updateContent(props.contentId, files[0]))
        } else {
          setBlobResponse(await updateContent(props.contentId, undefined))
        }
      }
    })()
  }

  useEffect(()=> {
    if (props.onDataControlAttached) {
      props.onDataControlAttached({
        save
      })
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
        </form>
      </div>
      <div>
        <BlobPreview
          contentResponse={blobResponse ?? undefined}
          blob={file}/>
      </div>
    </>
  )
}

// vi: se ts=2 sw=2 et:
