import { useState, useEffect, useImperativeHandle } from 'react'
import * as ace from 'ace-builds'
import { 
  getTheme as getAceTheme,
  setTheme as setAceTheme,
  updateThemeWithStorage as updateAceThemeWithStorage
} from './ace'
import { themesByName } from 'ace-builds/src-noconflict/ext-themelist'

import { getDomainText } from './i18n'
import {
  commandContainer as commandContainerClass
} from './EditorThemeSelector.module.css'

/**
 * theme selector control
 */
export type EditorThemeSelectorControl = {

  /**
   * set Default theme
   */
  setDefaultTheme: ((theme: string) => void)
}

/**
 * theme selector
 */
type EditorThemeSelectorProperties  = {

  /**
   * ref
   */
  ref?: React.Ref<EditorThemeSelectorControl>


  /**
   * notified a theme is selected
   */
  onThemeSelected?: ((theme: string)=>void)
}


/**
 * theme selector
 */
export default function EditorThemeSelector(
  props: EditorThemeSelectorProperties) {
  const [editorTheme, setEditorTheme] = useState(getAceTheme())

  useImperativeHandle(props.ref, ()=>{
    return {
      setDefaultTheme: setEditorTheme
    }
  })

  /**
   * get theme name
   */
  function getThemeName(theme: string): string {
    const keys = Object.keys(themesByName)
    const name = keys.find(item => themesByName[item].theme == theme)
    return name ?? ''
  }

  function action(formData: FormData) {
    const verb = formData.get("verb") as string
    if ('save' == verb) {
      setAceTheme(editorTheme) 
    } else {
      updateAceThemeWithStorage()
      setEditorTheme(getAceTheme())
    }
  }

  /**
   * handle selection changed
   */
  function selectionChanged(e: React.ChangeEvent<HTMLSelectElement>) {
    setEditorTheme(e.target.value) 
  }

  useEffect(()=>{
    if (props.onThemeSelected) {
      props.onThemeSelected(editorTheme)
    }
  }, [editorTheme, props.onThemeSelected])

  function Items() {
    return Object.keys(themesByName).map((name: string)=> {
      return <option value={themesByName[name].theme}>{name}</option>
    })
  }
  return (
    <>
      <dl>
        <dt>
         <label>{getDomainText('awblog', 'Theme')}</label>  
        </dt>
        <dd>
          <select
            name="theme" 
            onChange={selectionChanged}
            value={editorTheme}
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
          {getDomainText('awblog', 'Update from stroge')}
        </button>
      </form>
    </>
  )
}


// vi: se ts=2 sw=2 et:
