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
  editor as editorClass
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

  const textInputId = useId()
  return (
    <div>
      <form action={action}>
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
      <UpdaterWithFile 
        onTextLoad = {onTextLoad} 
      />

      <Editor 
        onEditorAttached={onEditorAttached}
        { ...props } />
    </>
  )
}
// vi: se ts=2 sw=2 et:
