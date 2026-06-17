/**
 * the flag whether delete editing content when commit
 */
let deleteEditing : boolean = false

/**
 * listeners
 */
const listeners: (()=>void)[] = []


/**
 * get the flag wheter delete editing content
 */
export function isDeleteEditing(): boolean {
  return deleteEditing
}

/**
 * set delete editing
 */
export function setDeleteEditing(deleteEditing: boolean) {
  setDeleteEditingI(deleteEditing)
}

/**
 * set oauth token
 */
function setDeleteEditingI(flagToDelete: boolean, saveStorage: boolean = true) {
  flagToDelete = Boolean(flagToDelete)
  if (deleteEditing != flagToDelete) {
    deleteEditing = flagToDelete
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
 * load the flag to delete editing on commit from local storage.
 */
export function loadFromStorage() {
  if (globalThis.localStorage) {
    const deleteOnCommitStr = globalThis.localStorage.getItem(
      'delete-on-commit')
    setDeleteEditingI(Boolean(deleteOnCommitStr))
  }
}

/**
 * save data into local storage
 */
export function saveIntoStorage() {
  if (deleteEditing) {
    globalThis.localStorage.setItem(
      'delete-on-commit', deleteEditing.toString())
  } else {
    globalThis.localStorage.removeItem('delete-on-commit')
  }
}


/**
 * notifiy change
 */
function emitChange():void {
  listeners.forEach(listener => listener())
}

// vi: se ts=2 sw=2 et:
