import StartEditing from './StartEditing'
import { useNavigate, useSearchParams } from 'react-router'



/**
 * the page to start editing
 */
export default function StartEditingPage() {
  let [searchParams] = useSearchParams()

  let contentId: number | undefined
  if (searchParams.has('content-id')) {
    contentId = parseInt(searchParams.get('content-id') as string)
  }
  let autoStart = false
  if (searchParams.has('auto-start')) {
    autoStart = Boolean(searchParams.get('auto-start'))
  }

  return <StartEditing 
    contentId={contentId}
    autoStart={autoStart} 
    />
 
}

// vi: se ts=2 sw=2 et:
