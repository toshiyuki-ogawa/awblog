import {
  useRef, useEffect, useEffectEvent, Suspense, useState,
  startTransition
} from 'react'
import { useNavigate } from 'react-router'
import { createContent } from 'awblog-base'
import AccountLine from './AccountLine'
import SimpleMessage from './SimpleMessage'
import { getOauthToken } from './account'
import { createMessageMng, type MessageMng } from './message-mng'
import { getDomainText } from './i18n'
import { getBasename } from './basename'


/**
 * the properties to create new content
 */
type StartNewContentProperties = {

  /**
   * the flag to start creating on component showing 
   */
  autoStart: boolean

}

/**
 * create new content
 */
export default function StartNewContent(props: StartNewContentProperties) {
   
  const [contentId, setContentId] = useState(0)
  const messageMng = useRef(createMessageMng())
  const navigate = useNavigate()
  const [creating, setCreating ] = useState(props.autoStart)

  /**
   * handle form action
   */
  function action(formData: FormData) {
    const actionName = formData.get('action') as string
    if (actionName == 'create') {
      startToCreateContent()
    }
  }

  const startToCreateContent = useEffectEvent(()=>{
    startTransition(async ()=> {
      const token = getOauthToken()
      const resp = await createContent(token ?? '')
      let newContentId = 0
      let message = ''
      if (resp) {
        const respJson = await resp.json()
        let succeeded = false
        if ('status' in respJson) {
          succeeded = respJson.status == 'OK'
        }
        if ('message' in respJson) {
          message = respJson.message
        }
        if ('content-id' in respJson) {
          newContentId = parseInt(respJson['content-id'])
        }
      }

      startTransition(()=> {
        if (message) {
          message = getDomainText('awblog', message)
          messageMng.current.setMessage(`${message}`)
        } else {
          messageMng.current.setMessage('')
        }
        setContentId(newContentId)
        setCreating(false)
      })
    })
  })
  useEffect(() => {
    if (contentId) {
      navigate(
        {
          pathname: `${getBasename()}page-mng.html`,
          search: `?content-id=${contentId}`
        },
        {
          replace: props.autoStart
        })
    } 
  }, [contentId])

  useEffect(()=> {
    if (props.autoStart) {
      startToCreateContent()
    } 
  }, [props.autoStart])


  if (!creating) {
    return (
      <Suspense fallback={<p>loading...</p>}>
        <AccountLine />
        <SimpleMessage messageMng={messageMng.current} />
        <div>
          <form action={action}>
            <button
              name="action"
              value="create">
              {getDomainText('awblog', 'Create')}
            </button>
          </form>
        </div> 
      </Suspense>
    )
  } else {
    return <p>loading...</p>
  }
}


// vi: se ts=2 sw=2 et:
