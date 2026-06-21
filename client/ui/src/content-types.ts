
/**
 * content types
 */
let contentTypes: string[][] = []


/**
 * load content type list 
 */
export async function loadContentTypes() {

  try {
    const res = await fetch('content-types.txt')
    if (res.ok) {
      contentTypes = (await res.text()).split("\n")
        .map(item => item.trim())
        .filter(item => item.length)
        .map(item => item.split(",").map(item => item.trim()))
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
