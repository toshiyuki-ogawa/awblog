
/**
 * default download text file name
 */
const defaultTextFileName = 'data.txt'

/**
 * download text file name
 */
let textFileName = defaultTextFileName

/**
 * text file name subscribers
 */
const textFileNameListeners = [] as (()=>void)[]

/**
 * init ace library
 */
export function init(): void {
  setTextFileNameI(readTextFileNameFromStorage(), false)
}


/**
 * get text file name
 */
export function getTextFileName(): string{
  return textFileName
}


/**
 * set text file name
 */
export function setTextFileName(fileName: string): void {
  setTextFileNameI(fileName) 
}


/**
 * update text file name with storage
 */
export function updateTextFileNameWithStorage(): void {
  setTextFileNameI(readTextFileNameFromStorage(), false)
}

/**
 * set editor theme
 */
function setTextFileNameI(
  fileName: string, 
  saveToStorage: boolean = true): void {

  if (textFileName != fileName) {
    textFileName = fileName 
    if (saveToStorage) {
      writeTextFileNameIntoStorage(fileName)
    }
    notifyTextFileNameChanged()
  }
}

/**
 * write theme into storage
 */
function writeTextFileNameIntoStorage(
  fileName: string): void {
  if (fileName.length > 0 && fileName != defaultTextFileName) {
    globalThis.localStorage.setItem('download-file-name-text', fileName)
  } else {
    globalThis.localStorage.removeItem('download-file-name-text')
  }
}

/**
 * read text file name from storage
 */
function readTextFileNameFromStorage(): string{
  const textFileName = globalThis.localStorage.getItem(
    'download-file-name-text')
  return textFileName ?? defaultTextFileName
}

/**
 * notify text file name changed changed 
 */
function notifyTextFileNameChanged(): void {
  textFileNameListeners.forEach(listener => listener())
}

/**
 * subscribe text file name changed event
 */
export function subscribeTextFileNameChanged(
  listener: (()=>void)): (()=>void) {

  textFileNameListeners.push(listener)

  return ()=>{
    const idx = textFileNameListeners.indexOf(listener)
    if (idx != -1) {
      textFileNameListeners.splice(idx, 1)
    }
  }
}


// vi: se ts=2 sw=2 et:
