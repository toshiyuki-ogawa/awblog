
type IndexEntries = {
  [key: string]: string[]
}

/**
 * entry title mapping
 */
let entries: string[] | null = null

/**
 * initial index 
 */
let baseIndex: string = 'index.html'


/**
 * load index entries
 */
export async function loadIndexEntries(baseIndexParam: string) {

  try {
    const res = await fetch('index-entries.json')
    if (res.ok) {
      const indexEntries = (await res.json()) as IndexEntries
      entries = indexEntries[baseIndexParam] ?? []
      baseIndex = baseIndexParam
    }
  } catch(e) {
    console.error(e)
  }
}

/**
 * get index 
 */
export function getBaseIndex(): string {
  return baseIndex
}


/**
 * get index entry mapping mapping
 */
export function getEntries(): string[] {

  let result = [] as string[]
  if (entries) {
    result = entries
  }
  return result

}


// vi: se ts=2 sw=2 et:
