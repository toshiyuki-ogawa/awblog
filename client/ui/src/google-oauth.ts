
/**
 * oauth token
 */
let oauthToken: string | null = null

/**
 * listeners
 */
const listeners: (()=>void)[] = []


/**
 * get oauth token
 */
export function getOauthToken(): string | null {
  return oauthToken
}

/**
 * set oauth token
 */
export function setOauthToken(token: string | null) {
  setOauthTokenI(token)
}

/**
 * set oauth token
 */
function setOauthTokenI(token: string | null, saveStorage: boolean = true) {
  if (!Object.is(oauthToken, token)) {
    oauthToken = token
    if (saveStorage) {
      saveIntoStorage()
    }
    emitChange()
  }
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
 * load auth data from local storage
 */
export function loadFromStorage() {
  if (globalThis.localStorage) {
    const token = globalThis.localStorage.getItem('google-jwt')
    setOauthTokenI(token, false)
  }
}

/**
 * save data into local storage
 */
export function saveIntoStorage() {
  if (oauthToken) {
    globalThis.localStorage.setItem('google-jwt', oauthToken)
  } else {
    globalThis.localStorage.removeItem('google-jwt')
  }
}


/**
 * notifiy change
 */
function emitChange():void {
  listeners.forEach(listener => listener())
}



// vi: se ts=2 sw=2 et:
