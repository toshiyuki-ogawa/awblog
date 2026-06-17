import { 
  useState,
  useSyncExternalStore,
  useRef,
  useEffect,
  useEffectEvent } from 'react'
import TriangleSvgIcon from './TriangleSvgIcon'
import CommitOption from './CommitOption'
import { getDomainText } from './i18n'
import {
  accordion as accordionClass,
  optionClose as optionCloseClass,
  controlTitle as controlTitleClass
} from './OptionLine.module.css'


/**
 * commit option line properties
 */
type CommitOptionLineProperties = {
  /**
   * open accordion
   */
  open?: boolean
}

/**
 * commit option line
 */
export default function CommitOptionLine(props: CommitOptionLineProperties) {
  const [ accordionClasses, setAccordionClasses ] = useState(
    new Set(
      props.open
        ? [accordionClass]
        : [accordionClass, optionCloseClass]))
 
  const [ optionCntMaxHeight, setOptionCntMaxHeight ] = 
    useState<number | null>(null)
  const optionCntRef = useRef<HTMLDivElement | null>(null)

  const onUpdateOptionCntHeight = useEffectEvent(() => {
    if (optionCntRef.current) {
      setOptionCntMaxHeight(optionCntRef.current.scrollHeight)
    }
  })
  
  function getOptionCntStyle():{ [key: string]: string } {
    if (optionCntMaxHeight) {
      if (!accordionClasses.has(optionCloseClass)) {
        return {
          maxHeight:`${optionCntMaxHeight}px`
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
    if (accordionClasses.has(optionCloseClass)) {
      accordionClasses.delete(optionCloseClass)
    } else {
      accordionClasses.add(optionCloseClass)
    }
    setAccordionClasses(new Set([...accordionClasses]))
  }
  useEffect(() => {
    onUpdateOptionCntHeight()
  }, [optionCntRef.current])


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
          open={!accordionClasses.has(optionCloseClass)}
        />
        <span>{getDomainText('awblog', 'Commit option')}</span>
      </div>
      <div
        className={[...accordionClasses].join(' ')}
        style={getOptionCntStyle()}
        ref={optionCntRef} >
        <CommitOption />  
      </div>
    </>
  )
}


// vi: se ts=2 sw=2 et:
