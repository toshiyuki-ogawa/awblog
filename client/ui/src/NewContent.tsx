import { useNavigate } from 'react-router'
import { getBasename } from './basename'
import { getDomainText } from './i18n'

/**
 * new content properties
 */
type NewContentProperties = {
  autoStart?: boolean
}

/**
 * new content
 */
export default function NewContent(props: NewContentProperties) {
  const navigate = useNavigate()

  /**
   * handle form action event
   */
  function action(formData: FormData) {
    const searchParams = new URLSearchParams()
    if (props.autoStart) {
       searchParams.append('auto-start', 'true')
    }
    navigate({
      pathname: `${getBasename()}start-editing.html`,
      search: searchParams.size ? `?${searchParams.toString()}` : ''
    })
  }

  return (
    <form action={action}>
      <button>{getDomainText('awblog', 'New Content')}</button>
    </form>
  )
}


// vi: se ts=2 sw=2 et:
