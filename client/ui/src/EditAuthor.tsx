import { useState } from 'react'
import { setAuthor, getAuthor } from './author'
import { getDomainText } from './i18n'
import {
  controlItem as controlItemClass,
  controlContainer as controlContainerClass
} from './EditAuthor.module.css'


/**
 * edito author properties
 */
type EditAuthorProperties = {

  /**
   * called when user commit or cacel
   */
  editAction?: ((commitOrNot : boolean)=>void)
}


/**
 * edit author
 */
export default function EditAuthor(props: EditAuthorProperties) {
  
  const author = getAuthor()

  const [ name, setName ] = useState(author ? author.name : '')
  const [ email, setEmail ] = useState(author ? author.email : '')

  /**
   * handle form action
   */
  function action(formData: FormData) {
    const doSave = Boolean(formData.get('save'))
    if (doSave) {
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      setAuthor({ name, email })
    }
    if (props.editAction) {
      props.editAction(doSave)
    }
  }
  return (
    <form
      className={controlContainerClass}
      action={action}>
      <div className={controlItemClass}>
        <label>{getDomainText('awblog', 'Author')}</label>
        <input name="name" 
          defaultValue={name}
          value={name} />
      </div>
      <div className={controlItemClass}>
        <label>{getDomainText('awblog', 'Email')}</label>
        <input name="email" type="email"
          defaultValue={email}
          value={email}
          required={true} />
      </div>
      <button name="save" value="true">
        {getDomainText('awblog', 'Update')}
      </button>
      <button name="save" value="false">
        {getDomainText('awblog', 'Cancel')}
      </button>
    </form>
  )
}


// vi: se ts=2 sw=2 et:
