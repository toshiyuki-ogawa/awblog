import { 
  useEffect, startTransition, useRef, useState,
  useSyncExternalStore, useEffectEvent, useImperativeHandle,
  useId
} from 'react'
import * as ace from 'ace-builds'
import { themesByName } from 'ace-builds/src-noconflict/ext-themelist'
import { type DataControl } from './data-control'
import { 
  getContent,
  updateContentWithStr,
  commit
} from 'awblog-base'

import TitleAccordion from './TitleAccordion'
import EditorThemeSelector, {
  type EditorThemeSelectorControl
} from './EditorThemeSelector'

import EditorModeSelector, {
  type EditorModeSelectorControl
} from './EditorModeSelector'

import EditorTabSetting, {
  type EditorTabSettingControl
} from './EditorTabSetting'


import { 
  editor as editorClass,
  downloadCommandContainer as downloadCommandContainerClass
} from './TextEdit.module.css'
import { getOauthToken } from './account'
import { type ContentTypeMng } from './content-type-mng'
import { type MessageMng } from './message-mng'
import { getDomainText } from './i18n'
import { isSoftTab, getTabSize } from './editor-tab'
import { 
  getTheme as getAceTheme,
  setTheme as setAceTheme,
  updateThemeWithStorage as updateAceThemeWithStorage,
  getMode as getAceMode,
  setMode as setAceMode,
  updateModeWithStorage as updateAceModeWithStorage
} from './ace'

import { 
  getTextFileName, setTextFileName
} from './download-file-name'

import { getContentTypes } from './content-types'

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
 * updater with file properties
 */
type UpdaterWithFileProperties = {

  /**
   * called when text loaded
   */
  onTextLoad: (text: string) => void
}

/**
 * download properties
 */
type DownloadProperties = {

  /**
   * content id
   */
  contentId: number

  /**
   * content type manage ment
   */
  contentTypeMng: ContentTypeMng


  /**
   * get editor content
   */
  getEditorContent?: (()=>string)
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
   * ref
   */
  ref?: React.Ref<DataControl>
}

/**
 * get true if content type is in text category.  
 */
function isTextType(contentType: string): boolean {
  const contentTypeItem = getContentTypes()
    .find((item) => item[0] == contentType) 
  let result = false
  if (contentTypeItem) {
    if (contentTypeItem.length > 2) {
      result = contentTypeItem[2].indexOf('text') != -1
    } else {
      result = contentType.indexOf('text') != -1
    }
  }
  return result
}
 

/**
 * update text content with user selected file.
 */
function UpdaterWithFile(props: UpdaterWithFileProperties) {

  const dataInputElement = useRef<HTMLInputElement | null>(null)

  /**
   * handle form action
   */
  function action(formData: FormData) {
    if (dataInputElement.current) {
      const files = dataInputElement.current.files as FileList
      if (files.length) {
        (async ()=> {
          const file = files[0]
          props.onTextLoad(await file.text())
        })()
      }
    }
  }

  /**
   * handle submit event
   */
  function onSubmit(e : React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target)
    action(formData)
  }

  const textInputId = useId()
  return (
    <div>
      <form onSubmit={onSubmit}>
        <dl>
          <dt>
            <label htmlFor={textInputId}>
              {getDomainText('awblog', 'Text source')}
            </label>
          </dt>
          <dd>
            <input
              id={textInputId}
              name="text-data"
              type="file"
              accept=".txt,.md,htm,.html,.css,.mjs,.js,.json"
              ref={dataInputElement}/>
          </dd>
        </dl> 
        <button>
          {getDomainText('awblog', 'Update')}
        </button>
      </form>
    </div>
  )
}


/**
 * download component
 */
function Download0(props: DownloadProperties) {
  
  const anchorRef = useRef<HTMLAnchorElement | null>(null)
  const [fileName, setFileName] = useState<string>(getTextFileName())
  const fileNameId = useId()

  const doDownload = useEffectEvent(()=>{
    if (anchorRef.current) {
      anchorRef.current.click()
    } 
  })

  /**
   * handl input value changed event
   */
  function onFileNameChanged(e: React.ChangeEvent<HTMLInputElement>) {
    setFileName(e.target.value)
  }

  /**
   * handle action event to save file name
   */
  function actionSaveFileName(formData: FormData) {
    const verb = formData.get('verb') as string
    if ('save' == verb) {
      setTextFileName(fileName) 
    }
  }

  /**
   * handle action event
   */
  async function actionDownload(formData: FormData) {
    const verb = formData.get('verb') as string
    if ('download' == verb) {
      let content = ''
      if (props.getEditorContent) {
        content = props.getEditorContent()
      }
      if (content && anchorRef.current) {
        const contentType = props.contentTypeMng.getContentType()
        if (contentType) {
          const blob = new Blob([content], {type: contentType}) 
          anchorRef.current.href = URL.createObjectURL(blob);
          await (async ()=>{
            doDownload()
          })()
        }
      }
    }
  }

  /**
   * handle submit event
   */
  function onSubmitDownload(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const submitter =
      e.nativeEvent.submitter as HTMLButtonElement | HTMLInputElement | null

    if (submitter) {
      formData.append(submitter.name, submitter.value)
    }
    actionDownload(formData) 
  }


  /**
   * submit save file name
   */
  function onSubmitSaveFileName(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const submitter =
      e.nativeEvent.submitter as HTMLButtonElement | HTMLInputElement | null
    if (submitter) {
      formData.append(submitter.name, submitter.value)
    }
    actionSaveFileName(formData)
  }
 
  return (
    <>
      <form action={actionSaveFileName}>
        <dl>
          <dt>
            <label
              htmlFor={fileNameId}>
              {getDomainText('awblog', 'Download file name')}
            </label>
          </dt>
          <dd>
            <input id={fileNameId}
              minLength={0}
              maxLength={256}
              onChange={onFileNameChanged}
              value={fileName}  />
          </dd>
        </dl>
        <button name="verb" value="save">
          {getDomainText('awblog', 'Save')}
        </button>
      </form>
      <a
        ref={anchorRef}
        download={fileName}
        style={
          {
            display: 'none'
          }
        }
        >download</a>
      <form 
        onSubmit={onSubmitDownload}
        className={downloadCommandContainerClass} >
        <button name="verb" value="download">
          {getDomainText('awblog', 'Download')}
        </button>
      </form>
    </>
  )
}

/**
 * download component with extension
 */
function DownloadWithExtension(props: DownloadProperties) {

  const startDownload = useEffectEvent((data: string)=> {
    (async ()=> {
      try {
        const fileHandle = await (globalThis as any).showSaveFilePicker()
        if (fileHandle) {
          const fw = await fileHandle.createWritable()
          await fw.write(data)
          await fw.close()
        }
      } catch (err) {
      }
    })() 
  })

  /**
   * handle action event
   */
  async function actionDownload(formData: FormData) {
    const verb = formData.get('verb') as string
    if ('download' == verb) {
      let content = ''
      if (props.getEditorContent) {
        content = props.getEditorContent()
      }
      if (content) {
        await (async ()=>{
          startDownload(content)
        })()
      }
    }
  }

  return (
    <form action={actionDownload}>
      <button name="verb" value="download">
        {getDomainText('awblog', 'Download...')}
      </button>
    </form>
  ) 
}


/**
 * download component
 */
function Download(props: DownloadProperties) {

  if ((globalThis as any).showSaveFilePicker) {
    return <DownloadWithExtension { ...props } />
  } else {
    return <Download0 { ...props } />
  }
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
          if (isTextType(contentResType)) {
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

      const editorTheme = getAceTheme()
      if (editorTheme) {
        aceEditor.setTheme(editorTheme)
      }

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

  if (isTextType(contentType)) {
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
  const themeSelectorControl = useRef<EditorThemeSelectorControl | null>(null)
  const modeSelectorControl = useRef<EditorModeSelectorControl | null>(null)
  /**
   * synchronize theme control with editor
   */
  function syncThemeControlWithEditor(): void {
    if (editor.current && themeSelectorControl.current) {
      themeSelectorControl.current.setDefaultTheme(editor.current.getTheme())
    }
  }
  /**
   * synchronize mode control with editor
   */
  function syncEditorMode(): void {
    if (editor.current && modeSelectorControl.current) {

      let mode = getAceMode()
      if (!mode) {
        modeSelectorControl.current.setDefaultMode('ace/mode/text')
      } else {
        onModeSelected(mode)
      }
    }
  }
  /**
   * sync editor setting with editor tab
   */
  function syncTabSettingWithEditorTab() {
    if (editor.current) {
      editor.current.session.setTabSize(getTabSize())
      editor.current.session.setUseSoftTabs(isSoftTab())
    }
  }
  /**
   * handle editor attached event.
   */
  function onEditorAttached(aceEditor: ace.Editor): void {
    editor.current = aceEditor
    editor.current.setOption('navigateWithinSoftTabs', true)
    syncThemeControlWithEditor()
    syncTabSettingWithEditorTab()
  }

  /**
   * handle event to get editor content
   */
  function getEditorContent(): string {
    let result = ''
    if (editor.current) {
      result = editor.current.getValue()
    }
    return result
  }
  /**
   * handle text load event
   */
  function onTextLoad(text: string): void {
    if (editor.current) {
      editor.current.setValue(text)
    }
  }
  /**
   * handle theme selected event
   */
  function onThemeSelected(theme: string): void {
    if (editor.current) {
      editor.current.setTheme(theme)
    }
  }

  /**
   * tab setting changed
   */
  function onTabSettingChanged(tabSize: number, softTab: boolean):void {
    if (editor.current) {
      editor.current.session.setTabSize(tabSize)
      editor.current.session.setUseSoftTabs(softTab)
    }
  }

  /**
   * handle mode selected event
   */
  function onModeSelected(mode: string): void {
    if (editor.current) {
      editor.current.session.setMode(mode)
    }
  }
 
  /**
   * save content
   */
  function save():void {
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
  useEffect(() => {
    syncThemeControlWithEditor()
  }, [editor.current, themeSelectorControl.current])
  useEffect(() => {
    syncEditorMode()
  }, [editor.current, modeSelectorControl.current])


  useImperativeHandle(props.ref, ()=> {
    return {
      save
    }
  })

  return (
    <>
      <TitleAccordion
        title={
          getDomainText(
            'awblog',
            `Editor setting`)
        } >
        <div>
          <EditorThemeSelector 
            ref={themeSelectorControl}
            onThemeSelected={onThemeSelected}
            />
        </div>
        <div>
          <EditorModeSelector 
            ref={modeSelectorControl}
            onModeSelected={onModeSelected}
            />
        </div>
        <div>
          <EditorTabSetting
            onTabSettingChanged={onTabSettingChanged}
          />
        </div>
      </TitleAccordion>
      <TitleAccordion
        title={
          getDomainText('awblog', 'Upload and download')
        }>
        <UpdaterWithFile 
          onTextLoad = {onTextLoad} 
        />
        
        <Download
          contentId={props.contentId}
          contentTypeMng={props.contentTypeMng}
          getEditorContent={getEditorContent}
          />
      </TitleAccordion>

      <Editor 
        onEditorAttached={onEditorAttached}
        { ...props } />
    </>
  )
}
// vi: se ts=2 sw=2 et:
