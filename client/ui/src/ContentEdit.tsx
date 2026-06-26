import { 
  useEffect, Suspense, startTransition, useState,
  useRef, useId, useSyncExternalStore
} from 'react'
import { useNavigate } from 'react-router'
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
import TextEdit from './TextEdit'
import BinaryEdit from './BinaryEdit'
import ContentTypeEdit, { type ContentTypeUiControl } from './ContentTypeEdit'
import { getOauthToken } from './account'
import { getAuthor } from './author'
import { subscribe, setDeleteEditing, isDeleteEditing } from './commit-option'
import { getDomainText } from './i18n'
import { getEntries, getBaseIndex } from './index-entries'
import { getEntryTitle } from './entry-title'
import { setGotoNext, getGotoNext } from './content-edit-setting'
import { type DataControl } from './data-control'
import { getContentTypes } from './content-types'
import { createContentTypeMng } from './content-type-mng'


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
 * commit content
 */
async function commitContent(
  contentId: number,
  deleteEditing: boolean,
  messageControl: MessageControl | null = null): Promise<boolean> {
  const author = getAuthor()
  const token = getOauthToken()
  let result = false
  if (author
      && token
      && author.name
      && author.email) {
    const resp = await commit(
      contentId,
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
    if (succeeded) {
      result = true
    } else {
      if (messageControl) {
        if (message) {
          message = getDomainText('awblog', message)
          messageControl.setMessage(`${message}`)
        } else {
          messageControl.setMessage('')
        }
      }
    }
  }
  return result
}

/**
 * you get true if content type is supported by content edit module
 */
function isSupportedContentType(contentType: string): boolean {
  return getContentTypes()
    .find((item) => item[0] == contentType) ? true : false 
}

/**
 * select edtitor type from content type
 */
function selectEditorTypeWithContentType(
  contentType: string): string | null {
 
  let result = null
  if (isSupportedContentType(contentType)) {
    if (contentType.indexOf("text") != -1) {
      result = "text"
    } else {
      result = "binary"
    }
  }   
  return result
}

/**
 * edit content 
 */
export default function ContentEdit(props: ContentEditProperties) {

  const messageControl = useRef<MessageControl | null>(null)
  const selectId = useId()
  const navigate = useNavigate()
  const textEditControl = useRef<DataControl | null>(null)
  const binaryEditControl = useRef<DataControl | null>(null)
  const contentTypeUiControl = useRef<ContentTypeUiControl  | null>(null)
  const contentTypeMng = createContentTypeMng(props.contentId) 


  useEffect(()=> {
    let doRun = true;
    (async ()=>{
      if (doRun) {
        await contentTypeMng.loadContentType()
      }
    })() 
    return ()=> {
      doRun = false
    }
  }, [props.contentId])

  /**
   * handle text edit data control attached event
   */
  function onTextEditControlAttached(dataControl: DataControl) {
    textEditControl.current = dataControl
  }

  /**
   * handle binary edit data control attached event
   */
  function onBinaryEditControlAttached(dataControl: DataControl) {
    binaryEditControl.current = dataControl
  }

  /**
   * save content
   */
  function saveContent() {
    if (textEditControl.current) {
      textEditControl.current.save()
    }
  } 


  /**
   * handle control ui control attached event
   */
  function contentTypeUiControlAttached(uiControl: ContentTypeUiControl) {
    contentTypeUiControl.current = uiControl
  }

  /**
   * commit content
   */
  async function handleCommitContent() {
    const deleteEditing = isDeleteEditing()
    const res = await commitContent(
      props.contentId, deleteEditing, messageControl.current)

    if (res && deleteEditing) {
      const nextLink = getGotoNext() ?? getBaseIndex()   
      navigate({
        pathname: `/${nextLink}`,
        search: document.location.search
      })
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

  /**
   * content editor
   */
  function ContentEditor() {
    const contentType = useSyncExternalStore(
      contentTypeMng.subscribe, contentTypeMng.getContentType)
    const editorType = selectEditorTypeWithContentType(contentType)

    if (editorType == "text") {
      return (
        <TextEdit
          contentTypeMng={contentTypeMng}
          onDataControlAttached={onTextEditControlAttached}
          { ...props }
        />
      )
    } else if (editorType == "binary") {
      return (
        <BinaryEdit
          contentTypeMng={contentTypeMng}
          onDataControlAttached={onBinaryEditControlAttached}
          { ...props }
        />
      )
    } else {
      return null
    }
  }

  return (
    <>
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
      <LazyMessage onReady={onReadyToDisplayMessage} />
      <ContentTypeEdit
        contentTypeMng={contentTypeMng}
        uiControlAttached={contentTypeUiControlAttached}
        /> 
      <ContentEditToolbar
        saveAction={saveContent}
        commitAction={handleCommitContent} />
      <Suspense fallback={<p>loading...</p>}>
        <ContentEditor />
      </Suspense>
    </>
  )
}

// vi: se ts=2 sw=2 et:
