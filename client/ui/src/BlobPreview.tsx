import { useEffect, useState } from 'react'
import mime from 'mime'

/**
 * blob preview properties
 */
type BlobPreviewProperties = {

  /**
   * content response
   */
  contentResponse?: Response
  /**
   * direct content
   */
  blob?: Blob | File

  /**
   * direct content type
   */
  contentType?: string
}


/**
 * you get true if content type is src property for img tag.
 */
function isImageType(contentType: string): boolean {
  const supportTypes = [
    'apng',
    'avif',
    'gif',
    'jpeg',
    'png',
    'svg',
    'webp'
  ]
  contentType = contentType.toLowerCase()
  let result = supportTypes
    .findIndex(type => contentType.indexOf(type) != -1) !== -1
  return result
}


/**
 * blob preview
 */
export default function BlobPreview(props: BlobPreviewProperties) {

  const [blob, setBlob] = useState<Blob | null>(null)
  const [contentResType, setContentResType] = useState<string>(
    props.contentType ?? '')

  useEffect(()=> {
    let doRun = true
    if (!contentResType) {
      if (blob && doRun) {
        if (blob.type) {
          setContentResType(blob.type)
        } else {
          const fileBlob = blob as File
          if (fileBlob.name) {
            const fileName = fileBlob.name
            const idx = fileName.lastIndexOf('.')
            if (idx !== -1) {
              const ext = fileName.slice(idx + 1)
              const mimeType = mime.getType(ext) 
              if (mimeType) {
                setContentResType(mimeType as string)
              }
            }
          }
        }
      }
    }
    return () =>{
      doRun = false
    }

  }, [blob])

  useEffect(()=> {
    let doRun = true

    if (props.contentResponse) {
      (async ()=> {
        if (doRun) {
          let contentType = ''
          if (!contentType) {
            if ((props.contentResponse!!).headers.get('Content-Type')) {
              setContentResType(
                (props.contentResponse!!).headers.get('Content-Type') ?? '')
            }
          }
          setBlob(await (props.contentResponse!!).blob() ?? null)
        }
      })()
    } else if (props.blob) {
      if (doRun) {
        setBlob(props.blob)
      }
    }

    return () => {
      doRun = false
    }
  }, [props.contentResponse, props.blob]) 


  if (contentResType) {
    if (blob) {
      if (isImageType(contentResType)) {
        return <img
            src={
              blob ? URL.createObjectURL(blob) : ''
            }
          />
      } else {
        return <embed
            src={
              blob ? URL.createObjectURL(blob) : ''
            }
            type={contentResType}
          />
      }
    } else {
      return null
    }
  } else {
    return null
  }
}


// vi: se ts=2 sw=2 et:
