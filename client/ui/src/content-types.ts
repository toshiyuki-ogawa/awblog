
/**
 * content types
 */
let contentTypes: string[][] = []


/**
 * load content type list 
 */
export async function loadContentTypes() {

  try {
    const res = await fetch('content-types.json')
    if (res.ok) {
      contentTypes = (await res.json()) as string[][]
    }
  } catch(e) {
    console.error(e)
  }
}

/**
 * get content types
 */
export function getContentTypes(): string[][] {
  return contentTypes
}

// vi: se ts=2 sw=2 et:
