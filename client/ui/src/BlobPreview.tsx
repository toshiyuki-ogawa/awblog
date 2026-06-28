import { useEffect, useState, useMemo, useId } from 'react'
import mime from 'mime'
import { getDomainText } from './i18n'
import {
  embedCommandContainer as embedCommandContainerClass
} from './BlobPreview.module.css'

/**
 * embed component properties
 */
type EmbedProperties = {

  /**
   * content data
   */
  blob?: Blob


  /**
   * content type
   */
  contentType: string

  /**
   * initial width
   */
  width?: number

  /**
   * initial height
   */
  height?: number

  /**
   * embed control class name
   */
  embedControlClassName?: string
}

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

  /**
   * embed control class name:
   */
  embedControlClassName?: string
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
 * embed properties
 */
function Embed(props: EmbedProperties) {

  const [width, setWidth] = useState(props.width ?? 400)
  const [height, setHeight] = useState(props.height ?? 600)

  /**
   * handle form action
   */
  function action(formData: FormData) {
    const widthStr = formData.get("width") as string
    const heightStr = formData.get("height") as string
    setWidth(parseInt(widthStr))
    setHeight(parseInt(heightStr))
  }
  const widthInputId = useId()
  const heightInputId = useId()
  return (
    <>
      <div
        className={props.embedControlClassName}>
        <form action={action}>
          <dl>
            <dt>
              <label htmlFor={widthInputId}>
                {getDomainText('awblog', 'Preview width')}
              </label>
            </dt>
            <dd>
              <input 
                id={widthInputId}
                name="width"
                type="number"
                min="100"
                defaultValue={width} />
            </dd> 
            <dt>
              <label htmlFor={heightInputId}>
                {getDomainText('awblog', 'Preview height')}
              </label>
            </dt>
            <dd>
              <input
                id={heightInputId}
                name="height"
                type="number"
                min="100"
                defaultValue={height}
              />
            </dd>
          </dl>
          <div
            className={embedCommandContainerClass}>
            <button>{getDomainText('awblog', 'Update')}</button>
          </div>
        </form>
      </div>
      <embed
        src={
          props.blob ? URL.createObjectURL(props.blob) : ''
        }
        type={props.contentType}
        width={width}
        height={height}
      />
    </>
  )
}


/**
 * blob preview
 */
export default function BlobPreview(props: BlobPreviewProperties) {

  const [blob, setBlob] = useState<Blob | null>(null)
  const contentResType = useMemo(()=> {
    let result = props.contentType ?? ''
    if (!result) {
      if (props.contentResponse) {
        if (props.contentResponse.headers.get('Content-Type')) {
          result = props.contentResponse.headers.get('Content-Type') ?? ''
        }
      } else if (props.blob) {
        if (props.blob.type) {
          result = props.blob.type
        } else {
          const fileBlob = props.blob as File
          if (fileBlob.name) {
            const fileName = fileBlob.name
            const idx = fileName.lastIndexOf('.')
            if (idx !== -1) {
              const ext = fileName.slice(idx + 1)
              const mimeType = mime.getType(ext) 
              if (mimeType) {
                result = mimeType as string
              }
            }
          }
        } 
      }
    } 
    return result
  }, [props.contentType, props.contentResponse, props.blob])

  useEffect(()=> {
    let doRun = true

    if (props.contentResponse) {
      (async ()=> {
        if (doRun) {
          setBlob(await (props.contentResponse!!).blob() ?? null)
        }
      })()
    } else if (props.blob) {
      if (doRun) {
        setBlob(props.blob)
      }
    } else {
      if (doRun) {
        setBlob(null)
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
        return <Embed
                embedControlClassName={props.embedControlClassName}
                blob={blob} 
                contentType={contentResType} />
      }
    } else {
      return null
    }
  } else {
    return null
  }
}


// vi: se ts=2 sw=2 et:
