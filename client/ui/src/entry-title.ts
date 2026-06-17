
type EntryTitle = {
  [key: string]: string
}

/**
 * entry title mapping
 */
let entryTitle: EntryTitle | null = null


/**
 * load entry title mapping
 */
export async function loadEntryTitle() {

  try {
    const res = await fetch('entry-title.json')
    if (res.ok) {
      entryTitle = (await res.json()) as EntryTitle
    }
  } catch(e) {
    console.error(e)
  }
}


/**
 * get entry title mapping
 */
export function getEntryTitle(): EntryTitle {

  let result = {} as EntryTitle
  if (entryTitle) {
    result = entryTitle
  }
  return result

}


// vi: se ts=2 sw=2 et:
