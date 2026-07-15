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
  saveCommitToolbar as saveCommitToolbarClass,
  optionTitle as optionTitleClass,
  editor as editorClass,
  binaryEditEmbedControl as binaryEditEmbedControlClass
} from './ContentEdit.module.css'
import ContentEditToolbar from './ContentEditToolbar'
import AccountLine from './AccountLine'
import AccountMng from './AccountMng'
import { EditAuthorList } from './EditAuthor'
import CommitOption from './CommitOption'
import TitleAccordion from './TitleAccordion'
import LinkSelect, { type LinkItem } from './LinkSelect'
import SimpleMessage from './SimpleMessage'
import TextEdit from './TextEdit'
import BinaryEdit from './BinaryEdit'
import Progress from './Progress'
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
import { createMessageMng, type MessageMng } from './message-mng'


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
  messageMng: MessageMng | null = null): Promise<boolean> {
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
      if (messageMng) {
        if (message) {
          message = getDomainText('awblog', message)
          messageMng.setMessage(`${message}`)
        } else {
          messageMng.setMessage('')
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

  const selectId = useId()
  const navigate = useNavigate()
  const contentTypeUiControl = useRef<ContentTypeUiControl  | null>(null)
  const contentTypeMng = createContentTypeMng(props.contentId) 
  const messageMng = createMessageMng()
  const dataControlRef = useRef<DataControl | null>(null)

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
   * save content
   */
  function saveContent() {
    if (dataControlRef.current) {
      dataControlRef.current.save()
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
      props.contentId, deleteEditing, messageMng)

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
   * content editor
   */
  function ContentEditor() {
    const contentType = useSyncExternalStore(
      contentTypeMng.subscribe, contentTypeMng.getContentType)
    const editorType = selectEditorTypeWithContentType(contentType)

    if (editorType == "text") {
      return (
        <TextEdit
          messageMng={messageMng}
          contentTypeMng={contentTypeMng}
          ref={dataControlRef}
          { ...props }
        />
      )
    } else if (editorType == "binary") {
      return (
        <BinaryEdit
          messageMng={messageMng}
          contentTypeMng={contentTypeMng}
          ref={dataControlRef}
          embedControlClassName={binaryEditEmbedControlClass}
          { ...props }
        />
      )
    } else {
      return null
    }
  }
  function ContentTypeLine() {
    const contentType = useSyncExternalStore(
      contentTypeMng.subscribe, contentTypeMng.getContentType)

    return (
      <TitleAccordion
        title={
          getDomainText(
            'awblog',
            `Content type: ${contentType}`)
        } >
        <ContentTypeEdit
          contentTypeMng={contentTypeMng}
          messageMng={messageMng}
          uiControlAttached={contentTypeUiControlAttached}
          /> 
      </TitleAccordion>
    )
  }

  return (
    <>
      <ContentEditToolbar
        saveAction={saveContent}
        commitAction={handleCommitContent}
        className={saveCommitToolbarClass}/>
      <SimpleMessage messageMng={messageMng} />

      <TitleAccordion
        title={getDomainText('awblog', 'Save and commit settings')}>
        <h1
          className={optionTitleClass}>
          {getDomainText('awblog', 'Commit')}
        </h1>
        <CommitOption />
        <div>
          <div>
            <label
              htmlFor={selectId}
              >{
              getDomainText(
                'awblog',
                'Select the page to navigate to after deleting the page being edited.')
            }</label>
          </div>
          <LinkSelect
            id={selectId}
            links={createLinkItems()}
            onSelect={handleLinkChanged}
            defaultValue={getGotoNext() ?? getBaseIndex() } />
          <h1
            className={optionTitleClass}>
            {getDomainText('awblog', 'Account')}
          </h1>
          <AccountMng />
          <h1
            className={optionTitleClass}>
            {getDomainText('awblog', 'Author')}
          </h1>
          <EditAuthorList />
        </div>
      </TitleAccordion>
      <ContentTypeLine />

      <Suspense fallback={<Progress />}>
        <ContentEditor />
      </Suspense>
    </>
  )
}

// vi: se ts=2 sw=2 et:
