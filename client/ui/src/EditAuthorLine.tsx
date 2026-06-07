import { 
  useState,
  useSyncExternalStore,
  useRef,
  useEffect,
  useEffectEvent } from 'react'
import TriangleSvgIcon from './TriangleSvgIcon'
import { EditAuthorList } from './EditAuthor'
import { getDomainText } from './i18n'
import { subscribe, getOauthToken} from './account'
import {
  accordion as accordionClass,
  authorClose as authorCloseClass,
  controlTitle as controlTitleClass
} from './EditAuthorLine.module.css'


/**
 * author line properties
 */
type EditAuthorLineProperties = {
  /**
   * open accordion
   */
  open?: boolean
}

/**
 * author line
 */
export default function EditAuthorLine(props: EditAuthorLineProperties) {
  const [ accordionClasses, setAccordionClasses ] = useState(
    new Set(
      props.open
        ? [accordionClass]
        : [accordionClass, authorCloseClass]))
 
  useSyncExternalStore(subscribe, getOauthToken) 

  const [ editAuthorCntMaxHeight, setEditAuthorCntMaxHeight ] = 
    useState<number | null>(null)
  const editAuthorCntRef = useRef<HTMLDivElement | null>(null)

  const onUpdateEditAuthorCntHeight = useEffectEvent(() => {
    if (editAuthorCntRef.current) {
      setEditAuthorCntMaxHeight(editAuthorCntRef.current.scrollHeight)
    }
  })
  
  function getEditAuthorCntStyle():{ [key: string]: string } {
    if (editAuthorCntMaxHeight) {
      if (!accordionClasses.has(authorCloseClass)) {
        return {
          maxHeight:`${editAuthorCntMaxHeight}px`
        }
      } else {
        return { 
          maxHeight: '0px'
        }
      }
    } else {
      return {}
    }
  }
  function toggleAccordion() {
    if (accordionClasses.has(authorCloseClass)) {
      accordionClasses.delete(authorCloseClass)
    } else {
      accordionClasses.add(authorCloseClass)
    }
    setAccordionClasses(new Set([...accordionClasses]))
  }
  useEffect(() => {
    onUpdateEditAuthorCntHeight()
  }, [editAuthorCntRef.current])


  /**
   * handle mouse click event
   */
  function handleClick(_e: React.MouseEvent) {
    toggleAccordion()
  }

  return (
    <>
      <div className={controlTitleClass}
        onClick={handleClick}
        >
        <TriangleSvgIcon iconSize="1em" 
          fill="var(--main-color-fg)"
          open={!accordionClasses.has(authorCloseClass)}
        />
        <span>{getDomainText('awblog', 'Author')}</span>
      </div>
      <div
        className={[...accordionClasses].join(' ')}
        style={getEditAuthorCntStyle()}
        ref={editAuthorCntRef} >
        <EditAuthorList />  
      </div>
    </>
  )
}

// vi: se ts=2 sw=2 et:
