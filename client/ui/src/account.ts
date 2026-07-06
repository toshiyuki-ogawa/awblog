
import { 
  subscribe as subscribeOauthTokenGoogle, 
  getOauthToken as getOauthTokenGoogle,
  loadFromStorage as loadFromStorageGoogle } from './google-oauth'


/**
 * token type accessor map
 */
const tokenTypeAccess : {
  [key: string]: (()=> string | null)
} = {
  'google': getOauthTokenGoogle 
}

/**
 * token type
 */
let tokenType = 'google'


/**
 * unsubscribe token listener
 */
const unsubscribers: (()=>void)[] = []

/**
 * listeners
 */
const listeners: (()=>void)[] = []


/**
 * get oauth token
 */
export function getOauthToken(): string | null {
  const tokenAccess = tokenTypeAccess[tokenType] 
  return tokenAccess ? tokenAccess() : null 
}

/**
 * subscribe
 */
export function subscribe(listener:(()=>void)): (()=>void) {
  listeners.push(listener)
  return ()=> {
    const idx = listeners.indexOf(listener) 
    if (idx != -1) {
      listeners.splice(idx, 1)
    }
  }
}

/**
 * get token type
 */
export function getTokenType(): string | null {
  return tokenType
}

/**
 * set token type
 */
export function setTokenType(tokenType: string) {
  setTokenTypeI(tokenType)
}

/**
 * set token type
 */
function setTokenTypeI(tokenTypeParam: string, saveStorage: boolean = true) {
  if (tokenType != tokenTypeParam) {
    tokenType = tokenTypeParam
    if (saveStorage) {
      saveIntoStorage()
    }
    emitChange()
  }
}

/**
 * notifiy change
 */
function emitChange():void {
  listeners.forEach(listener => listener())
}


/**
 * initialize this library
 */
export function init(): void {
  let unsubscribe = subscribeOauthTokenGoogle(()=> {
    if (tokenType == 'google') {
      emitChange()
    }
  })
  unsubscribers.push(unsubscribe)
  loadFromStorage()
}


/**
 * tear down this library
 */
export function teardown(): void {
  unsubscribers.forEach(elm => elm())
  saveIntoStorage()
}


/**
 * load oath token from storage
 */
export function loadOauthTokenFromStorage()
{
  loadFromStorageGoogle()
}

/**
 * load auth data from local storage
 */
function loadFromStorage() {
  if (globalThis.localStorage) {
    const tokenType = globalThis.localStorage.getItem('awblog-account')
    if (tokenType) {
      setTokenTypeI(tokenType, false)
    } 
  }
}

/**
 * save data into local storage
 */
function saveIntoStorage() {
  if (tokenType) {
    globalThis.localStorage.setItem('awblog-account', tokenType)
  } else {
    globalThis.localStorage.removeItem('awblog-account')
  }
}



// vi: se ts=2 sw=2 et:
