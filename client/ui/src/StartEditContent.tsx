import {
  useRef, useEffect, useEffectEvent, Suspense, useState,
  startTransition
} from 'react'
import { useNavigate } from 'react-router'
import { editContent } from 'awblog-base'
import AccountLine from './AccountLine'
import SimpleMessage from './SimpleMessage'
import Progress from './Progress'
import { getOauthToken } from './account'
import { createMessageMng, type MessageMng } from './message-mng'
import { getDomainText } from './i18n'
import { getBasename } from './basename'


/**
 * the properties to edit content
 */
type StartEditContentProperties = {
  /**
   * content id
   */
  contentId: number

  /**
   * the flag to start edit on component showing 
   */
  autoStart: boolean
}

/**
 * edit content
 */
export default function StartEditContent(props: StartEditContentProperties) {
  const [editing, setEditing] = useState(false) 
  const messageMng = useRef(createMessageMng())
  const navigate = useNavigate()
  const [autoStarting, setAutoStarting] = useState(props.autoStart)
  /**
   * handle form action
   */
  function action(formData: FormData) {
    const actionName = formData.get('action') as string
    if (actionName == 'create') {
      startToEditContent()
    }
  }

  const startToEditContent = useEffectEvent(()=>{
    startTransition(async ()=> {
      let succeeded = false

      const token = getOauthToken()
      const resp = await editContent(props.contentId, token ?? '')
      let message = ''
      if (resp) {
        const respJson = await resp.json()
        if ('status' in respJson) {
          succeeded = respJson.status == 'OK'
        }
        if ('message' in respJson) {
          message = respJson.message
        }
      }

      startTransition(()=> {
        if (message) {
          message = getDomainText('awblog', message)
          messageMng.current.setMessage(`${message}`)
        } else {
          messageMng.current.setMessage('')
        }
        setEditing(true)
        setAutoStarting(false)
      })
    })
  })
  useEffect(() => {
    if (editing) {
      navigate(
        {
          pathname: `${getBasename()}page-mng.html`,
          search: `?content-id=${props.contentId}`
        },
        {
          replace: props.autoStart
        })
    } 
  }, [editing])

  useEffect(()=> {
    if (props.autoStart) {
      startToEditContent()
    } 
  }, [props.autoStart])

  if (!autoStarting) {
    return (
      <Suspense fallback={<Progress />}>
        <AccountLine />
        <SimpleMessage messageMng={messageMng.current} />
        <div>
          <form action={action}>
            <button
              name="action"
              value="edit">
              {getDomainText('awblog', 'Edit')}
            </button>
          </form>
        </div> 
      </Suspense>
    )
  } else {
    return <Progress />
  }
}

// vi: se ts=2 sw=2 et:
