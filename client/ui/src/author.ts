
type Author = {
  /**
   * name
   */
  name?: string
  /**
   * email
   */
  email?: string
}


/**
 * author
 */
let author: Author|null = null

/**
 * listeners
 */
const listeners: (()=>void)[] = []



/**
 * compare str
 */
function compareStr(strA?: string, strB?: string) {
  let result = 0
  if (typeof strA === "string" && typeof strB === "string") {
    result = strA < strB ? -1 : 0
    if (result == 0) {
      result = strA === strB ? 0 : 1
    }
  } else if (strA) {
    result = -1
  } else if (strB) {
    result = 1
  }
  return result
}


/**
 * compare author
 */
function compare(authorA: Author, authorB: Author): number {
  const nameA = authorA.name 
  const nameB = authorB.name
  let result = compareStr(authorA.name, authorB.name)
  if (result === 0) {
    result = compareStr(authorA.email, authorB.email)
  }
  return result
}

/**
 * update author value
 */
export function setAuthor(newAuthor : Author | null) {
  let doSet = false
  if (newAuthor) {
    if (author) {
      doSet = compare(author, newAuthor) !== 0  
    } else {
      doSet = true
    }
    if (doSet) {
      author = {
        name: newAuthor.name,
        email: newAuthor.email
      }
    }
  } else {
    doSet = author ? true : false
    if (doSet) {
      author = null
    }
  }
  if (doSet) {
    saveIntoStorage()
    emitChange()
  }
}


/**
 * get author
 */
export function getAuthor(): Author | null {
  let result: Author | null = null
  if (author) {
    result = { ...author }
  }
  return result
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
    const authorName = globalThis.localStorage.getItem('author-name')
    const authorEmail = globalThis.localStorage.getItem('author-email')
    let newAuthor: Author | null = null
    if (authorName || authorEmail) {
      newAuthor = {
        name: authorName ?? undefined,
        email: authorEmail ?? undefined
      }
    }
    setAuthor(newAuthor)
  }
}

/**
 * save data into local storage
 */
export function saveIntoStorage() {

  let authorName : string | undefined
  let authorEmail : string | undefined
  if (author) {
    authorName = author.name
    authorEmail = author.email  
  }
  if (authorName) {
    globalThis.localStorage.setItem('author-name', authorName)
  } else {
    globalThis.localStorage.removeItem('author-name')
  }
  if (authorEmail) {
    globalThis.localStorage.setItem('author-email', authorEmail)
  } else {
    globalThis.localStorage.removeItem('author-email')
  }
}


/**
 * notifiy change
 */
function emitChange():void {
  listeners.forEach(listener => listener())
}


// vi: se ts=2 sw=2 et:
