/**
 * message control
 */
export type MessageMng = {
  
  /**
   * register listener
   */
  subscribe: ((listener: (()=>void))=>(()=>void))

  /**
   * get content type
   */
  getMessage: (()=>string)

  /**
   * set content type without save to server
   */
  setMessage: ((msg: string)=>void)
}

/**
 * implementation
 */
type MessageMngImpl = MessageMng & {

  /**
   * event listeners
   */
  listeners: (()=>void)[]


  /**
   * current message
   */
  message: string
}

/**
 * set message
 */
function setMessageImpl(
  messageMng: MessageMngImpl,
  message: string): void {
  if (messageMng.message != message) {
    messageMng.message = message
    notifyUpdatedMessageImpl(messageMng)
  }
}

/**
 * notify message changed
 */
function notifyUpdatedMessageImpl(
  messageMng: MessageMngImpl): void {
  messageMng.listeners.forEach(item => item())
}


/**
 * register listener
 */
function registerListenerImpl(
  messageMng: MessageMngImpl,
  listener: (()=>void)): (()=>void) {
   
  messageMng.listeners.push(listener)

  return ()=> {
    const idx = messageMng.listeners.indexOf(listener) 
    if (idx != -1) {
      messageMng.listeners.splice(idx, 1)
    }
  }
}

/**
 * create message management
 */
export function createMessageMng(): MessageMng {
  const result = {
    message: '',
    listeners: [] as (()=>void)[],
    subscribe: (listener: (()=>void)) => registerListenerImpl(result, listener),
    getMessage: () => result.message,
    setMessage: (message: string)=>{
      setMessageImpl(result, message)
    }
  }
  return result
}



// vi: se ts=2 sw=2 et:
