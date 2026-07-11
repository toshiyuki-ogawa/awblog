/**
 * tab size 
 */
let tabSize: number = 4


/**
 * soft tab
 */
let enableSoftTab: boolean = false

/**
 * tab size listener
 */
const tabSizeListeners: (()=>void)[] = []

/**
 * soft tab listener
 */
const softTabListeners: (()=>void)[] = []



/**
 * init ace library
 */
export function init(): void {
  setTabSizeI(readTabSizeFromStorage(), false)
  setSoftTabI(readSoftTabFromStorage(), false)
}


/**
 * get editor tab size
 */
export function getTabSize(): number {
  return tabSize
}


/**
 * set tab stop
 */
export function setTabSize(tabSize: number): void {
  setTabSizeI(tabSize) 
}


/**
 * update tab size with storage
 */
export function updateTabSizeWithStorage(): void {
  setTabSizeI(readTabSizeFromStorage(), false)
}

/**
 * set editor theme
 */
function setTabSizeI(
  editorTabSize: number, 
  saveToStorage: boolean = true): void {

  if (tabSize != editorTabSize) {
    tabSize = editorTabSize 
    if (saveToStorage) {
      writeTabSizeIntoStorage(tabSize)
    }
    notifyTabSizeChanged()
  }
}

/**
 * write theme into storage
 */
function writeTabSizeIntoStorage(
  tabSize: number): void {
  globalThis.localStorage.setItem('editor-tab-size', tabSize.toString())
}

/**
 * read tab size from storage
 */
function readTabSizeFromStorage(): number{
  const tabSizeStr = globalThis.localStorage.getItem('editor-tab-size')
  let result = 4
  if (tabSizeStr) {
    result = parseInt(tabSizeStr)
  }
  return result
}

/**
 * notify tab size changed 
 */
function notifyTabSizeChanged(): void {
  tabSizeListeners.forEach(listener => listener())
}

/**
 * subscribe tab size changed event
 */
function subscribeTabSizeChanged(
  listener: (()=>void)): (()=>void) {

  tabSizeListeners.push(listener)

  return ()=>{
    const idx = tabSizeListeners.indexOf(listener)
    if (idx != -1) {
      tabSizeListeners.splice(idx, 1)
    }
  }
}


/**
 * is soft tab
 */
export function isSoftTab(): boolean {
  return enableSoftTab
}


/**
 * set soft tab
 */
export function setSoftTab(enable: boolean): void {
  setSoftTabI(enable) 
}


/**
 * update tab size with storage
 */
export function updateSoftTabWithStorage(): void {
  setSoftTabI(readSoftTabFromStorage(), false)
}

/**
 * set soft tab
 */
function setSoftTabI(
  enable: boolean, 
  saveToStorage: boolean = true): void {

  if (enableSoftTab != enable) {
    enableSoftTab = enable 
    if (saveToStorage) {
      writeSoftTabIntoStorage(enable)
    }
    notifySoftTabChanged()
  }
}

/**
 * write soft tab enabled into storage
 */
function writeSoftTabIntoStorage(
  enable: boolean): void {
  if (enable) {
    globalThis.localStorage.setItem('editor-soft-tab', enable.toString())
  } else {
    globalThis.localStorage.removeItem('editor-soft-tab')
  }
}

/**
 * read tab size from storage
 */
function readSoftTabFromStorage(): boolean{
  const softTabStr = globalThis.localStorage.getItem('editor-soft-tab')
  let result = false
  if (softTabStr) {
    result = Boolean(softTabStr)
  }
  return result
}

/**
 * notify soft tab eanble changed 
 */
function notifySoftTabChanged(): void {
  softTabListeners.forEach(listener => listener())
}

/**
 * subscribe soft tab enable changed event
 */
function subscribeSoftTabChanged(
  listener: (()=>void)): (()=>void) {

  softTabListeners.push(listener)

  return ()=>{
    const idx = softTabListeners.indexOf(listener)
    if (idx != -1) {
      softTabListeners.splice(idx, 1)
    }
  }
}


// vi: se ts=2 sw=2 et:
