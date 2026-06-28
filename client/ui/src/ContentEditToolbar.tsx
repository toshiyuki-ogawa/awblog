import { getDomainText } from './i18n'

import {
  itemContainer as itemContainerClass
} from './ContentEditToolbar.module.css'

/**
 * toolbar properties
 */
type EditToolbarProperties = {

  /**
   * handle save
   */
  saveAction?: (()=>void)

  /**
   * handle commit
   */
  commitAction?: (()=>void)

  /**
   * class name
   */
  className?: string
}


/**
 * toolbar properties
 */
type ContentEditToolbarProperties = EditToolbarProperties 


/**
 * content edit toolbar
 */
export default function ContentEditToolbar(
  props: ContentEditToolbarProperties) {

  /**
   * handle save action
   */
  function saveAction(_: FormData) {
    if (props.saveAction) {
      props.saveAction()
    }
  }

  /**
   * handle commit action
   */
  function commitAction(_: FormData) {
    if (props.commitAction) {
      props.commitAction()
    }
  }
  const toolbarClasses = [itemContainerClass]
  if (props.className) {
    toolbarClasses.push(props.className)
  }

  return (
    <div className={toolbarClasses.join(' ')}>
      <form action={saveAction}>
        <button>
          {getDomainText('awblog', 'Save')}
        </button>
      </form> 
      <form action={commitAction}>
        <button>
          {getDomainText('awblog', 'Commit')}
        </button>
      </form> 
    </div>
  )
}

// vi: se ts=2 sw=2 et:
