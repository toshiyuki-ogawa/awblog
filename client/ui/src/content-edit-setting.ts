/**
 * content edit setting
 */
type ContentEditSetting = {

  /**
   * the page to go to when you delete editing page.
   */
  gotoNext?: string 
}


/**
 * content edit setting
 */
const contentEditSetting: ContentEditSetting = {}

/**
 * listeners to listen change event about goto next page.
 */
const gotoNextListeners: (()=>void)[] = []

/**
 * get goto next page
 */
export function getGotoNext(): string | undefined {
  return contentEditSetting.gotoNext
}

/**
 * set goto next page
 */
export function setGotoNext(gotoNext: string | null | undefined) {
  setGotoNextI(gotoNext, true)
}

/**
 * set goto next page
 */
function setGotoNextI(
  gotoNext: string | null | undefined,
  saveToStorage: boolean) {
  let updated = false
  if (!Object.is(contentEditSetting.gotoNext, gotoNext)) {
    if (gotoNext) {
      contentEditSetting.gotoNext = gotoNext
    } else {
      contentEditSetting.gotoNext = undefined
    }
    updated = true
  }
  if (saveToStorage) {
    saveIntoStorage()
  }
  if (updated) {
    emitChangeGotoNext()
  }
}


/**
 * set content edit setting
 */
function setContentEditSettingI(
  setting: ContentEditSetting, saveToStorage: boolean) {
  let gotoNext: string | undefined
  if (setting) {
    gotoNext = setting.gotoNext
  }
  setGotoNextI(gotoNext, saveToStorage) 
}


/**
 * load auth data from local storage
 */
export function loadFromStorage() {
  if (globalThis.localStorage) {
    const settingStr = globalThis.localStorage.getItem('content-edit-setting')
    if (settingStr) {
      setContentEditSettingI(
        JSON.parse(settingStr) as ContentEditSetting, false)
    }
  }
}

/**
 * save data into local storage
 */
export function saveIntoStorage() {
  globalThis.localStorage.setItem(
    'content-edit-setting', 
    JSON.stringify(contentEditSetting))
}


/**
 * subscribe
 */
export function subscribeGotoNext(listener:(()=>void)): (()=>void) {
  gotoNextListeners.push(listener)
  return ()=> {
    const idx = gotoNextListeners.indexOf(listener) 
    if (idx != -1) {
      gotoNextListeners.splice(idx, 1)
    }
  }
}



/**
 * notifiy change
 */
function emitChangeGotoNext():void {
  gotoNextListeners.forEach(listener => listener())
}


// vi: se ts=2 sw=2 et:
