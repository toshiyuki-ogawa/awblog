import { 
  useEffect, Suspense, startTransition, useState,
  useRef
} from 'react'

import * as ace from 'ace-builds'
import { getContent, updateContentWithStr } from 'awblog-base'
import { editor as editorClass } from './ContentEdit.module.css'
import ContentEditToolbar from './ContentEditToolbar'
import AuthorLine from './AuthorLine'


/**
 * editor container object
 */
type EditorContainer = {
  ref: ace.Editor | null
}


/**
 * content edit properties
 */
type ContentEditProperties = {
  /**
   * content id
   */
  contentId: number
}

/**
 * editor properties
 */
type EditorProperties = {
  /**
   * content id
   */
  contentId: number

  /**
   * when editor is attached
   */
  onEditorAttached?: ((editor: ace.Editor)=>void) 
}


/**
 * editor
 */
function Editor(props: EditorProperties) {
  const [content, setContent] = useState()
  const [contentType, setContentType] = useState('')
  const [editor, setEditor] = useState<ace.Editor | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  
  useEffect(()=>{ 
    let doUpdate = true;
    startTransition(async () => {
      let contentResType = contentType
      let contentResData = content
      if (doUpdate) {
        if (props.contentId) {
          const contentRes = await getContent(props.contentId, true)
          contentResType = contentRes.headers.get('Content-Type') ?? ''
          if (contentResType) {
            if (contentResType.indexOf('text') != -1) {
              contentResData = await contentRes.text()
            } else {
              contentResData = undefined
            }
          }
        } else {
          contentResType = ''
          contentResData = undefined
        }
        setContentType(contentResType)
        setContent(contentResData)
      }
    })
    return ()=> { doUpdate = false }
  }, [props.contentId])


  useEffect(()=> {
    if (editorRef.current && !editor) {
      const el = editorRef.current
      const aceEditor = ace.edit(el)
      setEditor(aceEditor)
      if (props.onEditorAttached) {
        props.onEditorAttached(aceEditor)
      }
    }
  }, [content])

  useEffect(()=> {
    if (editor) {
      editor.setValue(content ?? '')
    } 
  }, [content, editor])

  if (contentType.indexOf('text') != -1 && content) {
    return <div className={editorClass} ref={editorRef}></div>
  } else {
    return null
  }
}


/**
 * edit content 
 */
export default function ContentEdit(props: ContentEditProperties) {

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
  function saveContent() {
    if (editor.current) {
      const content = editor.current.getValue();
      (async () => {
        await updateContentWithStr(
          props.contentId, content)
      })() 
    }
  } 

  /**
   * commit content
   */
  function commitContent() {
    if (editor.current) {
      const content = editor.current.getValue();
    }  
  }

  return (
    <>
      <ContentEditToolbar saveAction={saveContent} />
      <AuthorLine />
      <Suspense fallback={<p>loading...</p>}>
        <Editor 
          onEditorAttached={onEditorAttached}
          { ...props } />

      </Suspense>
    </>
  )
}

// vi: se ts=2 sw=2 et:
