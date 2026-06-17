import { useState, useRef, useEffect, Activity, ReactNode } from 'react'


import {
  messageBox as messageBoxClass
} from './LazyMessage.module.css'

export type MessageControl = {

  /**
   * message
   */
  setMessage: ((msg: string)=>void)
}

/**
 * message properties
 */
type LazyMessageProperties = {

  /**
   * ready to respond message
   */
  onReady?: ((msgControl: MessageControl)=>void)
  
  /**
   * react node
   */
  children?: ReactNode

}

/**
 * lasy message
 */
export default function LazyMessage(props: LazyMessageProperties) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  /**
   * set message
   */
  function handleSetMessage(msg: string) {
    if (containerRef.current) {
      containerRef.current.innerHTML = msg
      containerRef.current.style.setProperty(
        'max-height', `${containerRef.current.scrollHeight}px`)
    }
  }


  useEffect(()=> {
    if (containerRef.current) {
      if (props.onReady) {
        props.onReady({
          setMessage: handleSetMessage
        })
      }
    }
  }, [containerRef.current])  

  return (
    <div 
      ref={containerRef}
      className={messageBoxClass}
      style={
        {
          maxHeight: 0
        }
      }
      >{props.children}</div>
  )

}


// vi: se ts=2 sw=2 et:
