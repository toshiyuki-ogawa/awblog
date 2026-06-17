import { 
  useEffect, Suspense, startTransition, useState,
  useRef, useId
} from 'react'
import { useNavigate } from 'react-router'
import * as ace from 'ace-builds'
import { 
  getContent,
  updateContentWithStr,
  commit
} from 'awblog-base'
import { 
  editor as editorClass
} from './ContentEdit.module.css'
import ContentEditToolbar from './ContentEditToolbar'
import AccountLine from './AccountLine'
import EditAuthorLine from './EditAuthorLine'
import CommitOption from './CommitOption'
import TitleAccordion from './TitleAccordion'
import LinkSelect, { type LinkItem } from './LinkSelect'
import LazyMessage, { type MessageControl } from './LazyMessage'
import { getOauthToken } from './account'
import { getAuthor } from './author'
import { subscribe, setDeleteEditing, isDeleteEditing } from './commit-option'
import { getDomainText } from './i18n'
import { getEntries, getBaseIndex } from './index-entries'
import { getEntryTitle } from './entry-title'
import { setGotoNext, getGotoNext } from './content-edit-setting'

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
 * create link item list
 */
function createLinkItems(): LinkItem[] {

  let currentPath = ''
  if (document.location) {
    currentPath = document.location.pathname
    if (currentPath.length) {
      currentPath = currentPath.substring(1)
    }
  }
  const entryTitle = getEntryTitle()
  return getEntries()
    .filter(item => item != currentPath)
    .map(item => {
      let title = entryTitle[item]
      if (title) {
        title = getDomainText('awblog', title as string)
      }
      return {
        link: item,
        title: title
      }
    })
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
  const messageControl = useRef<MessageControl | null>(null)
  const selectId = useId()
  const navigate = useNavigate()

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
      const token = getOauthToken()
      if (token) {
        const content = editor.current.getValue();

        (async () => {
          await updateContentWithStr(
            props.contentId, content, token)
        })() 
      }
    }
  } 

  /**
   * commit content
   */
  function commitContent() {
    if (editor.current) {
      const author = getAuthor()
      const token = getOauthToken()
      if (author
          && token
          && author.name
          && author.email) {
        (async ()=> {
          const deleteEditing = isDeleteEditing()
          const resp = await commit(
            props.contentId,
            author.name!!, author.email!!, deleteEditing, token)
          let succeeded = false
          let message = ''
          if (resp) {
            const respJson = await resp.json()
            if ('status' in respJson) {
              succeeded = respJson.status == 'OK'
            }
            if ('message' in respJson) {
              message = respJson.message
            }
          }
          if (succeeded && deleteEditing) {
            
            const nextLink = getGotoNext() ?? getBaseIndex()   
            navigate({
              pathname: `/${nextLink}`,
              search: document.location.search
            })
          } else {
            if (messageControl.current) {
              if (message) {
                message = getDomainText('awblog', message)
                messageControl.current.setMessage(`${message}`)
              } else {
                messageControl.current.setMessage('')
              }
            }
          }
        })() 
      }
    }  
  }


  /**
   * handle link select event
   */
  function handleLinkChanged(linkItem: LinkItem) {
    setGotoNext(linkItem.link)
  }

  /**
   * handle event about display message
   */
  function onReadyToDisplayMessage(control: MessageControl) {
    messageControl.current = control
  }

  return (
    <>
      <ContentEditToolbar
        saveAction={saveContent}
        commitAction={commitContent} />
      <LazyMessage onReady={onReadyToDisplayMessage} />
      <TitleAccordion
        title={getDomainText('awblog', 'Commit option')}>
        <CommitOption />
        <div>
          <div>
            <label
              htmlFor={selectId}
              >{
              getDomainText(
                'awblog',
                'Select the page to go to when you delete edit page.')
            }</label>
          </div>
          <LinkSelect
            id={selectId}
            links={createLinkItems()}
            onSelect={handleLinkChanged}
            defaultValue={getGotoNext() ?? getBaseIndex() } />
        </div>
      </TitleAccordion>
      <AccountLine />
      <EditAuthorLine />
      <Suspense fallback={<p>loading...</p>}>
        <Editor 
          onEditorAttached={onEditorAttached}
          { ...props } />

      </Suspense>
    </>
  )
}

// vi: se ts=2 sw=2 et:
