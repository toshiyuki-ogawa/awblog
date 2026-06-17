import { 
  useState,
  useSyncExternalStore,
  useRef,
  useEffect,
  useEffectEvent,
  type ReactNode } from 'react'
import TriangleSvgIcon from './TriangleSvgIcon'
import {
  accordion as accordionClass,
  optionClose as optionCloseClass,
  controlTitle as controlTitleClass
} from './TitleAccordion.module.css'


/**
 * title accordion properties
 */
type TitleAccordionProperties = {
  /**
   * open accordion
   */
  open?: boolean

  /**
   * title
   */
  title: string

  /**
   * react node
   */
  children: ReactNode 
}

/**
 * title accordion
 */
export default function TitleAccordion(props: TitleAccordionProperties) {
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
        <span>{props.title}</span>
      </div>
      <div
        className={[...accordionClasses].join(' ')}
        style={getOptionCntStyle()}
        ref={optionCntRef} >
        {props.children}
      </div>
    </>
  )
}


// vi: se ts=2 sw=2 et:
