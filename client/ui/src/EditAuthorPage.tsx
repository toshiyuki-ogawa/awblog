import { useState } from 'react'
import { useNavigate } from 'react-router'
import { setAuthor, getAuthor } from './author'
import { getDomainText } from './i18n'
import {
  controlContainer,
  commandContainer
} from './EditAuthorPage.module.css'


/**
 * author page properties
 */
type EditAuthorPageProperties = {
  /**
   * link when author changed or cancel
   */
  gotoLink?: string
}

/**
 * edit author
 */
export default function EditAuthorPage(
  props: EditAuthorPageProperties) {
  
  const author = getAuthor()
  const navigate = useNavigate()
  const authorName = author ? author.name : ''
  const authorEmail = author ? author.email : ''


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
    if (props.gotoLink) {
      navigate(props.gotoLink)
    } else {
      navigate(-1)
    }
  }
  return (
    <form
      className={controlContainer}
      action={action}>
      <table>
        <tbody>
          <tr>
            <th>
              <label>{getDomainText('awblog', 'Author')}</label>
            </th>
            <td>
              <input name="name" 
                defaultValue={authorName ?? ''} />
            </td>
          </tr>
          <th>
            <label>{getDomainText('awblog', 'Email')}</label>
          </th>
          <td>
            <input name="email" type="email"
              defaultValue={authorEmail ?? ''}
              required={true} />
          </td>
        </tbody>
      </table>
      <div className={commandContainer}> 
        <button name="save" value="true">
          {getDomainText('awblog', 'Update')}
        </button>
        <button type="button">
          {getDomainText('awblog', 'Cancel')}
        </button>
      </div>
    </form>
  )
}


// vi: se ts=2 sw=2 et:
