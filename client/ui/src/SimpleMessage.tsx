import {
  useState, useRef, useLayoutEffect,
  useEffectEvent, useSyncExternalStore
} from 'react'

import { type MessageMng } from './message-mng'

import {
  messageBox as messageBoxClass
} from './SimpleMessage.module.css'

/**
 * message properties
 */
type SimpleMessageProperties = {

  /**
   * message management
   */
  messageMng: MessageMng
}

/**
 * lasy message
 */
export default function SimpleMessage(props: SimpleMessageProperties) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const message = useSyncExternalStore(
    props.messageMng.subscribe, props.messageMng.getMessage)
  const [containerStyle, setContainerStyle] = useState({
    maxHeight: "0"
  }) 

  /**
   * update max height
   */
  const updateMaxHeight = useEffectEvent(() => {
    if (containerRef.current) {
      setContainerStyle({
        maxHeight: `${containerRef.current.scrollHeight}px`
      })
    }
  })
  useLayoutEffect(()=> {
    updateMaxHeight()  
  }, [message])  

  const innerHtml = {
    __html: message
  }

  return (
    <div 
      ref={containerRef}
      className={messageBoxClass}
      style={containerStyle}
      dangerouslySetInnerHTML={ innerHtml }
    />
  )

}
// vi: se ts=2 sw=2 et:
