import { getOauthToken } from './account'
import { getContentHeader, updateContentHeader } from 'awblog-base'

/**
 * content type management
 */
export type ContentTypeMng = {
  
  /**
   * register listener
   */
  subscribe: ((listener: (()=>void))=>(()=>void))

  /**
   * get content type
   */
  getContentType: (()=>string)


  /**
   * update content type
   */
  updateContentType: ((contentType: string)=> Promise<Response | null>)

  /**
   * load content type from server
   */
  loadContentType: (()=> Promise<void>)

  /**
   * set content type without save to server
   */
  setContentType: ((contentType: string)=>void)
}

/**
 * implementation
 */
type ContentTypeMngImpl = ContentTypeMng & {

  /**
   * event listeners
   */
  listeners: (()=>void)[]

  /**
   * content id
   */
  contentId: number


  /**
   * content type snapshot
   */
  contentType: string
}

/**
 * get content type
 */
async function getContenTypeFromServer(
  contentId: number): Promise<string> {
  const contentHeaderRes = await getContentHeader(
    contentId, true, getOauthToken() ?? undefined) 
  let result = ''
  if (contentHeaderRes) {
      const contentHeader = await contentHeaderRes.json()
      result = contentHeader['content-type'] ?? ''
  }
  return result
}

/**
 * update content type
 */
async function updateContentType(
  contentId: number,
  contentType: string): Promise<Response | null> {
  const contentHeaderRes = await getContentHeader(
    contentId, true, getOauthToken() ?? undefined) 
  let result = null
  if (contentHeaderRes) {
      const contentHeader = await contentHeaderRes.json()
      contentHeader['content-type'] = contentType
      const res = await updateContentHeader(
        contentId,
        contentHeader,
        getOauthToken() ?? undefined)
      result = res
  }
  return result
}


/**
 * update content type
 */
async function updateContentTypeImpl(
  contentTypeMng: ContentTypeMngImpl,
  contentType: string): Promise<Response | null> {
  
  const updateRes = await updateContentType(
    contentTypeMng.contentId, contentType)
  
  let result = null

  if (updateRes) {
    const dupRes = updateRes.clone()
    const jsonRes = await dupRes.json()
    if (jsonRes['Status'] === 'OK') {
      setContentTypeImpl(contentTypeMng, contentType)
    }
    result = updateRes
  }
  return result
}

/**
 * set content type 
 */
function setContentTypeImpl(
  contentTypeMng: ContentTypeMngImpl,
  contentType: string): void {
  if (contentTypeMng.contentType != contentType) {
    contentTypeMng.contentType = contentType
    notifyUpdatedContentTypeImpl(contentTypeMng)
  }
}

/**
 * notify content type changed
 */
function notifyUpdatedContentTypeImpl(
  contentTypeMng: ContentTypeMngImpl): void {
  contentTypeMng.listeners.forEach(item => item())
}


/**
 * register listener
 */
function registerListenerImpl(
  contentTypeMng: ContentTypeMngImpl,
  listener: (()=>void)): (()=>void) {
   
  contentTypeMng.listeners.push(listener)

  return ()=> {
    const idx = contentTypeMng.listeners.indexOf(listener) 
    if (idx != -1) {
      contentTypeMng.listeners.splice(idx, 1)
    }
  }
}

/**
 * create content type management
 */
export function createContentTypeMng(
  contentId: number):ContentTypeMng {
  const result = {
    contentId,
    contentType: '',
    listeners: [] as (()=>void)[],
    subscribe: (listener: (()=>void)) => registerListenerImpl(result, listener),
    getContentType: () => result.contentType,
    updateContentType: async (contentType: string)=> {
      return await updateContentTypeImpl(result, contentType)
    },
    loadContentType: async ()=> {
      setContentTypeImpl(result, await getContenTypeFromServer(contentId))      
    },
    setContentType: (contentType: string)=>{
      setContentTypeImpl(result, contentType)
    }
  }
  return result
}

// vi: se ts=2 sw=2 et:
