import { useState, useEffect, useImperativeHandle } from 'react'
import * as ace from 'ace-builds'
import { 
  getMode as getAceMode,
  setMode as setAceMode,
  updateModeWithStorage as updateAceModeWithStorage
} from './ace'
import { modesByName } from 'ace-builds/src-noconflict/ext-modelist'

import { getDomainText } from './i18n'
import {
  commandContainer as commandContainerClass
} from './EditorModeSelector.module.css'

/**
 * theme selector control
 */
export type EditorModeSelectorControl = {

  /**
   * set Default mode
   */
  setDefaultMode: ((mode: string) => void)
}

/**
 * mode selector properties
 */
type EditorModeSelectorProperties  = {

  /**
   * ref
   */
  ref?: React.Ref<EditorModeSelectorControl>


  /**
   * notified a theme is selected
   */
  onModeSelected?: ((mode: string)=>void)
}


/**
 * mode selector
 */
export default function EditorModeSelector(
  props: EditorModeSelectorProperties) {
  const [editorMode, setEditorMode] = useState(getAceMode())

  useImperativeHandle(props.ref, ()=>{
    return {
      setDefaultMode: setEditorMode
    }
  })

  /**
   * get mode name
   */
  function getModeName(mode: string): string {
    const keys = Object.keys(modesByName)
    const name = keys.find(item => modesByName[item].mode == mode)
    return name ?? ''
  }

  function action(formData: FormData) {
    const verb = formData.get("verb") as string
    if ('save' == verb) {
      setAceMode(editorMode) 
    } else {
      updateAceModeWithStorage()
      setEditorMode(getAceMode())
    }
  }

  /**
   * handle selection changed
   */
  function selectionChanged(e: React.ChangeEvent<HTMLSelectElement>) {
    setEditorMode(e.target.value) 
  }

  useEffect(()=>{
    if (props.onModeSelected) {
      props.onModeSelected(editorMode)
    }
  }, [editorMode, props.onModeSelected])

  function Items() {
    return Object.keys(modesByName).map((name: string)=> {
      return <option value={modesByName[name].mode}>{name}</option>
    })
  }
  return (
    <>
      <dl>
        <dt>
          <label>{getDomainText('awblog', 'Mode')}</label>
        </dt>
        <dd>
          <select
            name="mode" 
            onChange={selectionChanged}
            value={editorMode}
            >
          {
            Items()
          }
          </select>
        </dd>
      </dl>
      <form 
        className={commandContainerClass} 
        action={action}>
        <button
          name="verb"
          value="save">
          {getDomainText('awblog', 'Save')}
        </button>
        <button
          name="verb"
          value="update">
          {getDomainText('awblog', 'Update with storage contents')}
        </button>
      </form>
    </>
  )
}



// vi: se ts=2 sw=2 et:
