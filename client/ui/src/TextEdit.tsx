import { 
  useEffect, startTransition, useRef, useState,
  useSyncExternalStore, useEffectEvent, useImperativeHandle
} from 'react'
import * as ace from 'ace-builds'
import { type DataControl } from './data-control'
import { 
  getContent,
  updateContentWithStr,
  commit
} from 'awblog-base'

import { 
  editor as editorClass
} from './TextEdit.module.css'
import { getOauthToken } from './account'
import { type ContentTypeMng } from './content-type-mng'
import { type MessageMng } from './message-mng'
import { getDomainText } from './i18n'

/**
 * editor properties
 */
type EditorProperties = {
  /**
   * content id
   */
  contentId: number

  /**
   * content type manage ment
   */
  contentTypeMng: ContentTypeMng

  /**
   * when editor is attached
   */
  onEditorAttached?: ((editor: ace.Editor)=>void) 
}

/**
 * text edit properties
 */
type TextEditProperties = {
  /**
   * content id
   */
  contentId: number

  /**
   * content type manage ment
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
 * editor
 */
function Editor(props: EditorProperties) {
  const [content, setContent] = useState<string | undefined>()
  const [editor, setEditor] = useState<ace.Editor | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const contentType = useSyncExternalStore(
    props.contentTypeMng.subscribe, props.contentTypeMng.getContentType)


  /**
   * load text
   */
  async function loadText() {
    let contentResData: string | undefined = undefined
    if (props.contentId) {
      const contentRes = await getContent(props.contentId, true)
      if (contentRes) {
        const contentResType = contentRes.headers.get('Content-Type') ?? ''
        if (contentResType) {
          if (contentResType.indexOf('text') != -1) {
            contentResData = await contentRes.text()
          } else {
            contentResData = undefined
          }
        }
      }
    } else {
      contentResData = undefined
    }
    setContent(contentResData)
  } 
 
  const onEditorAttached = useEffectEvent(()=> {
    (async ()=> {
      await loadText()
    })()
  }) 

  useEffect(()=>{ 
    let doUpdate = true;
    startTransition(async () => {
      let contentResType = contentType
      let contentResData = content
      if (doUpdate) {
        await loadText()
      }
    })
    return ()=> { doUpdate = false }
  }, [props.contentId])


  useEffect(()=> {
    if (editorRef.current && !editor) {
      const el = editorRef.current
      const aceEditor = ace.edit(el)
      setEditor(aceEditor)
      onEditorAttached()
      if (props.onEditorAttached) {
        props.onEditorAttached(aceEditor)
      }
    }
  })

  useEffect(()=> {
    if (editor) {
      editor.setValue(content ?? '')
    } 
  }, [content, editor])

  if (contentType.indexOf('text') != -1) {
    return <div className={editorClass} ref={editorRef}></div>
  } else {
    return null
  }
}

/**
 * text edit 
 */
export default function TextEdit(props: TextEditProperties) {
  const editor = useRef<ace.Editor | null>(null)

  /**
   * handle editor attached event.
   */
  function onEditorAttached(aceEditor: ace.Editor) {
    editor.current = aceEditor
  }
  /**
   * save content
   */
  function save() {
    if (editor.current) {
      const token = getOauthToken()
      if (token) {
        const content = editor.current.getValue();

        (async () => {
          const res = await updateContentWithStr(
            props.contentId, content, token)
          if (res) {
            const jsonRes = await res.json()
            if ('OK' == jsonRes['status'])  {
              props.messageMng.setMessage('')
            } else {
              if (jsonRes['message']) {
                props.messageMng.setMessage(
                  getDomainText('awblog', jsonRes['message'] ?? '')) 
              }
            }
          }
        })() 
      }
    }
  } 
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
    <Editor 
      onEditorAttached={onEditorAttached}
      { ...props } />
  )
}
// vi: se ts=2 sw=2 et:
