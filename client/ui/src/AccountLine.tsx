import { 
  useState,
  useSyncExternalStore,
  useRef,
  useEffect,
  useEffectEvent } from 'react'
import TriangleSvgIcon from './TriangleSvgIcon'
import AccountMng from './AccountMng'
import { getDomainText } from './i18n'
import { subscribe, getOauthToken} from './account'
import {
  accordion as accordionClass,
  accClose as accCloseClass,
  controlTitle as controlTitleClass
} from './AccountLine.module.css'


/**
 * account line properties
 */
type AccountLineProperties = {
  /**
   * open accordion
   */
  open?: boolean 
}

/**
 * acount line
 */
export default function AccountLine(props: AccountLineProperties) {
  const [ accordionClasses, setAccordionClasses ] = useState(
    new Set(
      props.open ?  [accordionClass] : [accordionClass, accCloseClass]))
  const oauthToken = useSyncExternalStore(subscribe, getOauthToken) 
  const [ accMngCntMaxHeight, setAccMngCntMaxHeight ] = 
    useState<number | null>(null)
  const accMngCntRef = useRef<HTMLDivElement | null>(null)

  const onUpdateAccMngCntHeight = useEffectEvent(() => {
    if (accMngCntRef.current) {
      setAccMngCntMaxHeight(accMngCntRef.current.scrollHeight)
    }
  })
 
  function getAccMngCntStyle():{ [key: string]: string } {
    if (accMngCntMaxHeight) {
      if (!accordionClasses.has(accCloseClass)) {
        return {
          maxHeight:`${accMngCntMaxHeight}px`
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
    if (accordionClasses.has(accCloseClass)) {
      accordionClasses.delete(accCloseClass)
    } else {
      accordionClasses.add(accCloseClass)
    }
    setAccordionClasses(new Set([...accordionClasses]))
  }
  useEffect(() => {
    onUpdateAccMngCntHeight()
  }, [accMngCntRef.current, oauthToken])


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
          open={!accordionClasses.has(accCloseClass)}
        />
        <span>{getDomainText('awblog', 'Account')}</span>
      </div>
      <div
        className={[...accordionClasses].join(' ')}
        style={getAccMngCntStyle()}
        ref={accMngCntRef} >
        <AccountMng onButtonRendered={onUpdateAccMngCntHeight} />  
      </div>
    </>
  )
}

// vi: se ts=2 sw=2 et:
