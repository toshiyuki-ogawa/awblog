import { getRequestPath } from './config.ts'

/**
 * check status header 
 */
function isOkResponse(headers: Headers): boolean {
  let result = true
  if (headers.has('Status')) {
    const status = headers.get('Status')!.trim()
    const statusCode = parseInt(status.split(" \t")[0])
    result =  200 <= statusCode && statusCode < 300
  }
  return result
}


/**
 * create content
 */
export async function createContent(bearer?: string):
  Promise<number | undefined> {

  let result
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (bearer) {
      headers.append('Bearer', bearer)
    }
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'create-content')
    const requestUrl = `${requestPath}?${searchParams}`
    const res = await fetch(requestUrl, {
      method: 'POST',
      headers
    })
    if (res.ok) {
      if (isOkResponse(res.headers)) {
        const jsonObj = await res.json()
        result = jsonObj['content-id']
      }
    }
  }
  return result
}

/**
 * update content
 */
export async function updateContentWithStr(
  contentId: number,
  content: string,
  bearer?: string): Promise<boolean> {
  let result = false
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (bearer) {
      headers.append('Bearer', bearer)
    }
    headers.append('Content-Type', 'application/x-www-form-urlencoded')
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'update-content')
    searchParams.append('content-id', contentId.toString())

    const bodyParams = new URLSearchParams()
    bodyParams.append('content', content)
    const body = bodyParams.toString()
    const res = await fetch(`${requestPath}?${searchParams}`, {
      method: 'POST',
      body,
      headers
    })
    if (res.ok) {
      result = isOkResponse(res.headers)
    }
  }
  return result
}

/**
 * update content
 */
export async function updateContentWithBlob(
  contentId: number,
  content: Blob,
  bearer?: string): Promise<boolean> {
  let result = false
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (bearer) {
      headers.append('Bearer', bearer)
    }
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'update-content')
    searchParams.append('content-id', contentId.toString())

    const body = new FormData()
    body.append('content', content)
    const res = await fetch(`${requestPath}?${searchParams}`, {
      method: 'POST',
      body,
      headers
    })
    if (res.ok) {
      result = isOkResponse(res.headers)
    }
  }
  return result
}

/**
 * get content
 */
export async function getContent(
  contentId: number,
  edit?: boolean,
  bearer?: string): Promise<any> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (bearer) {
      headers.append('Bearer', bearer)
    }

    const searchParams = new URLSearchParams()
    searchParams.append('action', 'get-content')
    searchParams.append('content-id', contentId.toString())
    if (edit) {
      searchParams.append('edit', edit.toString())
    }
    const res = await fetch(`${requestPath}?${searchParams}`, {
      method: 'GET',
      headers
    })
    if (res.ok && isOkResponse(res.headers)) {
      result = res
    }
  }
  return result
}

/**
 * update content header
 */
export async function updateContentHeader(
  contentId: number,
  contentHeader: { [key: string]: any },
  bearer?: string): Promise<boolean> {
  let result = false
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (bearer) {
      headers.append('Bearer', bearer)
    }
    headers.append('Content-Type', 'application/json')
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'update-header')
    searchParams.append('content-id', contentId.toString())

    const body = JSON.stringify(contentHeader)
    const res = await fetch(`${requestPath}?${searchParams}`, {
      method: 'POST',
      body,
      headers
    })
    if (res.ok) {
      result = isOkResponse(res.headers)
    }
  }
  return result
}

/**
 * get content header 
 */
export async function getContentHeader(
  contentId: number,
  edit?: boolean,
  bearer?: string): Promise<any> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (bearer) {
      headers.append('Bearer', bearer)
    }

    const searchParams = new URLSearchParams()
    searchParams.append('action', 'get-header')
    searchParams.append('content-id', contentId.toString())
    if (edit) {
      searchParams.append('edit', edit.toString())
    }
    const res = await fetch(`${requestPath}?${searchParams}`, {
      method: 'GET',
      headers
    })
    if (res.ok && isOkResponse(res.headers)) {
      result = res
    }
  }
  return result
}

/**
 * commit content
 */
export async function commit(
  contentId: number,
  author: string,
  email: string,
  deleteEditing?: boolean,
  bearer?: string): Promise<any> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (bearer) {
      headers.append('Bearer', bearer)
    }

    const searchParams = new URLSearchParams()
    searchParams.append('action', 'commit')
    searchParams.append('content-id', contentId.toString())
    searchParams.append('author', author)
    searchParams.append('email', email)
    if (deleteEditing) {
      searchParams.append('delete', true.toString())
    }
    const res = await fetch(`${requestPath}?${searchParams}`, {
      method: 'GET',
      headers
    })
    if (res.ok && isOkResponse(res.headers)) {
      result = res
    }
  }
  return result
}

/**
 * get history object ids
 */
export async function getHistoryOids(
  contentId: number,
  bearer?: string): Promise<any> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (bearer) {
      headers.append('Bearer', bearer)
    }

    const searchParams = new URLSearchParams()
    searchParams.append('action', 'get-history')
    searchParams.append('content-id', contentId.toString())
    const res = await fetch(`${requestPath}?${searchParams}`, {
      method: 'GET',
      headers
    })
    if (res.ok && isOkResponse(res.headers)) {
      result = res
    }
  }
  return result
}

/**
 * list commited items
 */
export async function listCommit(
  bearer?: string): Promise<any> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (bearer) {
      headers.append('Bearer', bearer)
    }

    const searchParams = new URLSearchParams()
    searchParams.append('action', 'list-commit')
    const res = await fetch(`${requestPath}?${searchParams}`, {
      method: 'GET',
      headers
    })
    if (res.ok && isOkResponse(res.headers)) {
      result = res
    }
  }
  return result
}

/**
 * get editing status about content id 
 */
export async function isEditing(
  contentId: number,
  bearer?: string): Promise<any> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (bearer) {
      headers.append('Bearer', bearer)
    }

    const searchParams = new URLSearchParams()
    searchParams.append('action', 'is-editing')
    searchParams.append('content-id', contentId.toString())
    const res = await fetch(`${requestPath}?${searchParams}`, {
      method: 'GET',
      headers
    })
    if (res.ok && isOkResponse(res.headers)) {
      result = res
    }
  }
  return result
}





// vi: se ts=2 sw=2 et:
