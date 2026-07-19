import { getContent } from 'awblog-base'

/**
 * start content id 
 */
let startContentId = 0


/**
 * load initial id 
 */
async function loadInitialId(): Promise<number> {
  let result = 0
  try {
    const res = await fetch('initial-id.txt')
    const idStr = await res.text()
    if (idStr) {
      const id = parseInt(idStr.trim())
      if (!isNaN(id)) {
        result = id
      }
    }
  } catch (err) {
  }
  return result
}


/**
 *  load initial content
 */
async function loadInitialContent(initialId: number): Promise<boolean> {
  let result = false
  const res = await getContent(initialId)
  if (res) {
    const jsonRes = await res.json()
    if (jsonRes['start-content-id']) {
      startContentId = jsonRes['start-content-id'] as number
      result = true
    }
  }
  return result
}


/**
 * load default content
 */
export async function load(): Promise<boolean> {
  const initialContentId = await loadInitialId()
  let result = false
  if (initialContentId) {
    result = await loadInitialContent(initialContentId)    
  }
  return result 
}

/**
 * get content id
 */
export function getStartContentId(): number {
  return startContentId
}
// vi: se ts=2 sw=2 et:
