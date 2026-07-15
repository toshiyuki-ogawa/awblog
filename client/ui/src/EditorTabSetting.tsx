import { useState, useId, useImperativeHandle, useEffect } from 'react'
import {
  commandContainer as commandContainerClass
} from './EditorTabSetting.module.css'
import {
  setTabSize,
  setSoftTab,
  getTabSize,
  isSoftTab,
  updateTabSizeWithStorage,
  updateSoftTabWithStorage
} from './editor-tab'
import { getDomainText } from './i18n'

/**
 * tab setting control
 */
export type EditorTabSettingControl = {

  /**
   * set soft tab enable
   */
  setSoftTab: ((enable: boolean) => void)


  /**
   * set tab size
   */
  setTabSize: ((size: number) => void)
}

/**
 * editor tab setting properties
 */
type EditorTabSettingProperties = {
  /**
   * ref
   */
  ref?: React.Ref<EditorTabSettingControl>

  /**
   * notified when tab setting changed
   */
  onTabSettingChanged?: ((tabSize: number, softTab: boolean) => void)

}


/**
 * editor tab setting
 */
export default function EditorTabSetting(props: EditorTabSettingProperties) {

  const tabSizeId = useId()
  const softTabId = useId()

  const [editorTabSize, setEditorTabSize] = useState(getTabSize())
  const [softTabEnable, setSoftTabEnable] = useState(isSoftTab())

  useImperativeHandle(props.ref, () => {
    return {

      setTabSize: setEditorTabSize,
      setSoftTab: setSoftTabEnable
    } 
  })
  
  /**
   * handle form action event
   */
  function action(formData: FormData): void {
    const verb = formData.get('verb') as string
    if (verb == 'apply') {
      setTabSize(editorTabSize)  
      setSoftTab(softTabEnable)
    } else {
      updateTabSizeWithStorage()
      updateSoftTabWithStorage()
      setEditorTabSize(getTabSize())  
      setSoftTabEnable(isSoftTab())
    }
  }

  /**
   * handle submit event
   */
  function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target)

    const submitter =
      e.nativeEvent.submitter as HTMLButtonElement | HTMLInputElement | null

    if (submitter) {
      formData.append(submitter.name, submitter.value)
    }
    action(formData)
  }

  /**
   * handle tab size changed event
   */
  function onTabSizeChanged(e: React.ChangeEvent<HTMLInputElement>) {
    const size = parseInt(e.target.value)
    if (!isNaN(size) && size > 0) {
      setEditorTabSize(size)
    }
  } 

  /**
   * handle soft tab enabled event
   */
  function onSoftTabEnableChanged(e: React.ChangeEvent<HTMLInputElement>) {
    setSoftTabEnable(e.target.checked)
  }

  useEffect(() => {
    if (props.onTabSettingChanged) {
      props.onTabSettingChanged(editorTabSize, softTabEnable)
    }
     
  }, [props.onTabSettingChanged, softTabEnable, editorTabSize])

  return (
    <form
      onSubmit={onSubmit}
      >
      <dl>
        <dt>
          <label
            htmlFor={tabSizeId}>{getDomainText('awblog', 'Tab size')}</label>
        </dt>
        <dd>
          <input
            id={tabSizeId}
            type="number"
            min={1}
            value={editorTabSize}
            onChange={onTabSizeChanged}
            name="tab-size"
            />
        </dd>
        <dt>
          <label htmlFor={softTabId}>
            {getDomainText('awblog', 'Soft tab')}
          </label>
        </dt>
        <dd>
          <label>
            <input
              id={softTabId}
              type="checkbox"
              checked={softTabEnable}
              onChange={onSoftTabEnableChanged}
              />
           {getDomainText('awblog', 'enable')}
          </label>
        </dd>
      </dl>
        <div
          className={commandContainerClass}>
          <button name="verb" value="apply">
            {getDomainText('awblog', 'Apply')}
          </button>
          <button name="verb" value="reload">
            {getDomainText('awblog', 'Update with storage contents')}
          </button>
        </div>
    </form>
  ) 
}

// vi: se ts=2 sw=2 et:
