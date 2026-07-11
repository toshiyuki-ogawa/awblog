import * as ace from 'ace-builds'

import { getBasename } from './basename'

/**
 * theme
 */
let theme = ''

/**
 * editor mode
 */
let mode = ''

/**
 * theme listener
 */
const themeListeners: (()=>void)[] = []

/**
 * mode listener
 */
const modeListeners: (()=>void)[] = []



/**
 * init ace library
 */
export function init(): void {
  ace.config.set('basePath', `${getBasename()}assets/ace`)

  setThemeI(readThemeFromStorage(), false)
  setModeI(readModeFromStorage(), false)
}


/**
 * get editor theme
 */
export function getTheme(): string {
  return theme
}


/**
 * set editor theme
 */
export function setTheme(theme: string): void {
  setThemeI(theme) 
}


/**
 * update theme with storage
 */
export function updateThemeWithStorage(): void {
  setThemeI(readThemeFromStorage(), false)
}

/**
 * set editor theme
 */
function setThemeI(
  editorTheme: string, 
  saveToStorage: boolean = true): void {

  if (theme != editorTheme) {
    theme = editorTheme 
    if (saveToStorage) {
      writeThemeIntoStorage(theme)
    }
    notifyThemeChanged()
  }
}

/**
 * write theme into storage
 */
function writeThemeIntoStorage(
  theme: string): void {
  if (theme) {
    globalThis.localStorage.setItem('ace-theme', theme)
  } else {
    globalThis.localStorage.removeItem('ace-theme')
  }
}

/**
 * read theme from storage
 */
function readThemeFromStorage(): string {
  return globalThis.localStorage.getItem('ace-theme') ?? ''
}

/**
 * notify theme changed 
 */
function notifyThemeChanged(): void {
  themeListeners.forEach(listener => listener())
}

/**
 * subscribe theme changed event
 */
function subscribeThemeChanged(
  listener: (()=>void)): (()=>void) {

  themeListeners.push(listener)

  return ()=>{
    const idx = themeListeners.indexOf(listener)
    if (idx != -1) {
      themeListeners.splice(idx, 1)
    }
  }
}


/**
 * get editor mode 
 */
export function getMode(): string {
  return mode
}


/**
 * set editor mode
 */
export function setMode(mode: string): void {
  setModeI(mode) 
}


/**
 * update mode with storage
 */
export function updateModeWithStorage(): void {
  setThemeI(readModeFromStorage(), false)
}

/**
 * set editor mode 
 */
function setModeI(
  editorMode: string, 
  saveToStorage: boolean = true): void {

  if (mode != editorMode) {
    mode = editorMode
    if (saveToStorage) {
      writeModeIntoStorage(mode)
    }
    notifyModeChanged()
  }
}

/**
 * write mode into storage
 */
function writeModeIntoStorage(
  theme: string): void {
  if (theme) {
    globalThis.localStorage.setItem('ace-mode', theme)
  } else {
    globalThis.localStorage.removeItem('ace-mode')
  }
}

/**
 * read mode from storage
 */
function readModeFromStorage(): string {
  return globalThis.localStorage.getItem('ace-mode') ?? ''
}

/**
 * notify mode changed 
 */
function notifyModeChanged(): void {
  modeListeners.forEach(listener => listener())
}

/**
 * subscribe mode changed event
 */
function subscribeModeChanged(
  listener: (()=>void)): (()=>void) {

  modeListeners.push(listener)

  return ()=>{
    const idx = modeListeners.indexOf(listener)
    if (idx != -1) {
      modeListeners.splice(idx, 1)
    }
  }
}



// vi: se ts=2 sw=2 et:
