import { useState, useSyncExternalStore, useId } from 'react'
import { subscribe, setAuthor, getAuthor } from './author'
import { 
  subscribe as subscribeOauthToken, 
  getOauthToken
} from './account'
import { decodePayload } from './jwt'
import { type JwtUser } from './jwt-user'

import { getDomainText } from './i18n'
import {
  authorForm as authorFormClass,
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
export function EditAuthorList(props: EditAuthorProperties) {
  useSyncExternalStore(subscribeOauthToken, getOauthToken)
  const formId = useId()
  const nameId = useId()
  const emailId = useId()
  
  const author = getAuthor()

  const nameDefault = author ? author.name : ''
  const emailDefault = author ? author.email : ''

  const [ name, setName ] = useState(nameDefault)
  const [ email, setEmail ] = useState(emailDefault)

  /**
   * copy account into author
   */
  function copyAccountIntoAuthor(_e: React.MouseEvent) {
    const token = getOauthToken()
    if (token) {
      const payload = decodePayload(token) 
      if (payload) {
        const userInfo = payload as JwtUser
        setName(userInfo.name)
        setEmail(userInfo.email)
      }
    }
  }


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
    <>
      <div
        className={controlContainerClass}>
        <button name="save" value="true" form={formId} >
          {getDomainText('awblog', 'Update')}
        </button>
        <button type="button" 
          form={formId}
          onClick={copyAccountIntoAuthor} >
          {getDomainText('awblog', 'Copy from account')}
        </button>
      </div>
      <form
        className={authorFormClass}
        id={formId}
        action={action}>
        <dl>
          <dt>
            <label htmlFor={nameId}>{getDomainText('awblog', 'Author')}</label>
          </dt>
          <dd>
            <input name="name" 
              defaultValue={nameDefault}
              onChange={e => setName((e.target as HTMLInputElement).value)}
              value={name}
              id={nameId} />
          </dd>
          <dt>
            <label htmlFor={emailId}>{getDomainText('awblog', 'Email')}</label>
          </dt>
          <dd>
            <input name="email" type="email"
              defaultValue={emailDefault}
              onChange={e => setEmail((e.target as HTMLInputElement).value)}
              value={email}
              required={true}
              id={emailId} />
          </dd>
        </dl>
      </form>
    </>
  )
}



/**
 * edit author
 */
export function EditAuthorSingleLine(props: EditAuthorProperties) {
  useSyncExternalStore(subscribeOauthToken, getOauthToken)
  
  const author = getAuthor()

  const nameDefault = author ? author.name : ''
  const emailDefault = author ? author.email : ''

  const [ name, setName ] = useState(nameDefault)
  const [ email, setEmail ] = useState(emailDefault)

  /**
   * copy account into author
   */
  function copyAccountIntoAuthor(_e: React.MouseEvent) {
    const token = getOauthToken()
    if (token) {
      const payload = decodePayload(token) 
      if (payload) {
        const userInfo = payload as JwtUser
        setName(userInfo.name)
        setEmail(userInfo.email)
      }
    }
  }

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
      className={[controlContainerClass, authorFormClass].join(' ')}
      action={action}>
      <div className={controlItemClass}>
        <label>{getDomainText('awblog', 'Author')}
        <input name="name" 
          defaultValue={nameDefault}
          onChange={e => setName((e.target as HTMLInputElement).value)}
          value={name} /></label>
      </div>
      <div className={controlItemClass}>
        <label>{getDomainText('awblog', 'Email')}
        <input name="email" type="email"
          defaultValue={emailDefault}
          value={email}
          onChange={e => setEmail((e.target as HTMLInputElement).value)}
          required={true} /></label>
      </div>
      <button name="save" value="true">
        {getDomainText('awblog', 'Update')}
      </button>
      <button 
        type="button"
        onClick={copyAccountIntoAuthor}>
        {getDomainText('awblog', 'Copy from account')}
      </button>
    </form>
  )
}


// vi: se ts=2 sw=2 et:
