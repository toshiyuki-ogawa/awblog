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
export async function createContent(
  accessToken?: string): Promise<Response | null> {
  let result = null
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'create-content')
    const requestUrl = `${requestPath}?${searchParams}`

    const fetchOptions : RequestInit = {
      headers,
      method: 'POST'
    }
    const res = await fetch(requestUrl, fetchOptions)
    if (res.ok && isOkResponse(res.headers)) {
      result = res
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
  accessToken?: string): Promise<Response | null> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
    headers.append('Content-Type', 'application/x-www-form-urlencoded')
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'update-content')
    searchParams.append('content-id', contentId.toString())

    const body = new URLSearchParams()
    body.append('content', content)
    const res = await fetch(`${requestPath}?${searchParams}`, {
      method: 'POST',
      headers,
      body
    })
    if (res.ok && isOkResponse(res.headers)) {
      result = res
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
  accessToken?: string): Promise<Response | null> {
  let result = null
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'update-content')
    searchParams.append('content-id', contentId.toString())

    const body = new FormData()
    body.append('content', content)
    const res = await fetch(`${requestPath}?${searchParams}`, {
      method: 'POST',
      headers,
      body
    })
    if (res.ok && isOkResponse(res.headers)) {
      result = res
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
  accessToken?: string): Promise<Response | null> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
 
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'get-content')
    searchParams.append('content-id', contentId.toString())
    if (edit) {
      searchParams.append('edit', edit.toString())
    }

    const fetchOptions : RequestInit = {
      method: 'GET',
      headers
    }

    const res = await fetch(`${requestPath}?${searchParams}`, fetchOptions)
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
  accessToken?: string): Promise<Response | null> {
  let result = null
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'update-header')
    searchParams.append('content-id', contentId.toString())
    if (accessToken) {
      searchParams.append('access-token', accessToken)
    }

    const body = JSON.stringify(contentHeader)
    const res = await fetch(`${requestPath}?${searchParams}`, {
      method: 'POST',
      body,
      headers
    })
    if (res.ok && isOkResponse(res.headers)) {
      result = res
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
  accessToken?: string): Promise<Response | null> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
 
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'get-header')
    searchParams.append('content-id', contentId.toString())
    if (edit) {
      searchParams.append('edit', edit.toString())
    }

    const fetchOptions : RequestInit = {
      method: 'GET',
      headers
    }
    
    const res = await fetch(`${requestPath}?${searchParams}`, fetchOptions)
    
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
  accessToken?: string): Promise<Response | null> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
    headers.append('Cache-Control', 'max-age=60')
 
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'commit')
    searchParams.append('content-id', contentId.toString())
    searchParams.append('author', author)
    searchParams.append('email', email)
    if (deleteEditing) {
      searchParams.append('delete', true.toString())
    }
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers
    }
    const res = await fetch(`${requestPath}?${searchParams}`, fetchOptions)
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
  accessToken?: string): Promise<Response | null> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'get-history')
    searchParams.append('content-id', contentId.toString())
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers
    }

    const res = await fetch(`${requestPath}?${searchParams}`, fetchOptions) 
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
  accessToken?: string): Promise<Response | null> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'list-commit')
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers
    }
    const res = await fetch(`${requestPath}?${searchParams}`, fetchOptions)
    if (res.ok && isOkResponse(res.headers)) {
      result = res
    }
  }
  return result
}

/**
 * start to edit content 
 */
export async function editContent(
  contentId: number,
  accessToken?: string): Promise<Response | null> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'edit-content')
    searchParams.append('content-id', contentId.toString())
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers
    }
    const res = await fetch(`${requestPath}?${searchParams}`, fetchOptions)
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
  accessToken?: string): Promise<Response | null> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'is-editing')
    searchParams.append('content-id', contentId.toString())
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers
    }
    const res = await fetch(`${requestPath}?${searchParams}`, fetchOptions)
    if (res.ok && isOkResponse(res.headers)) {
      result = res
    }
  }
  return result
}

/**
 * list released items
 */
export async function listRelease(
  accessToken?: string): Promise<Response | null> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'list-release-id')
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers
    }
    const res = await fetch(`${requestPath}?${searchParams}`, fetchOptions)
    if (res.ok && isOkResponse(res.headers)) {
      result = res
    }
  }
  return result
}

/**
 * list editing items
 */
export async function listEditing(
  accessToken?: string): Promise<Response | null> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'list-editing-id')
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers
    }
    const res = await fetch(`${requestPath}?${searchParams}`, fetchOptions)
    if (res.ok && isOkResponse(res.headers)) {
      result = res
    }
  }
  return result
}

/**
 * list content 
 */
export async function listContent(
  accessToken?: string): Promise<Response | null> {
  let result = null 
  const requestPath = getRequestPath()
  if (requestPath) {
    const headers = new Headers()
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
    const searchParams = new URLSearchParams()
    searchParams.append('action', 'list-content')
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers
    }
    const res = await fetch(`${requestPath}?${searchParams}`, fetchOptions)
    if (res.ok && isOkResponse(res.headers)) {
      result = res
    }
  }
  return result
}

// vi: se ts=2 sw=2 et:
