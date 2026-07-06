
/**
 * get awblog path
 */
export function getAwblogPath() {
  return 'awblog-index.cgi'
}


/**
 * load javascript
 */
export function loadJs(element: HTMLElement, contentId: number) {
  console.log(`load ${contentId}`)
  const scriptElem = document.createElement('script') as HTMLScriptElement
  const searchParams = new URLSearchParams()
  searchParams.append('content-id', contentId.toString())
  searchParams.append('action', 'get-content')
  scriptElem.src = `${getAwblogPath()}?${searchParams.toString()}`
  scriptElem.async = true
  element.appendChild(scriptElem)
}


/**
 * load javascript from html
 */
export function loadJsFromElement(element: HTMLElement) {
  const elements = element.getElementsByClassName('content-js') 
  const contentIds = []
  for (let idx = 0; idx < elements.length; idx++) {
    const scriptId = (elements[idx] as HTMLElement).dataset.scriptId
    if (scriptId) {
      const contentId = parseInt(scriptId)
      if (!isNaN(contentId)) {
        contentIds.push(contentId)
      }
    }
  }
  contentIds.forEach(contentId => {
    loadJs(element, contentId)
  })
}

// vi: ts=2 sw=2 et:
