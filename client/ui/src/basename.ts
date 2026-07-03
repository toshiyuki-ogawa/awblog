
/**
 * load base name
 */
let basename: string = ''


/**
 * get base name
 */
export function getBasename() {
  return basename
}

/**
 * load base name from site
 */
export async function loadBasename(): Promise<boolean> {
  const res = await fetch('basename.txt') 
  let result = false
  if (res.ok) {
    const contents = await res.text()
    basename = contents.trim()
    result = true
  }
  return result
}


// vi: se ts=2 sw=2 et:
