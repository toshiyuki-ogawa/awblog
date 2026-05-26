import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  listCommit,
  compareCommitItem,
  type CommitItem
}  from 'awblog-base'
import { getDomainText } from './i18n'

import ContentPreview from './ContentPreview'

/**
 * content list properties
 */
type ContentListProperties = {

  /**
   * line number
   */
  lineNumber: number

  /**
   * count per page
   */
  countPerPage: number
}

/**
 * contents items properties
 */
type ContentItemsProperties = {
  /**
   * items
   */
  items: CommitItem[]
}


/**
 * compare commit items
 */
function compareCommitItems(a: CommitItem[], b: CommitItem[]): number {

  let result = 0

  const compLen = Math.min(a.length, b.length)
  for (let idx = 0; idx < compLen; idx++) {
    result = compareCommitItem(a[idx], b[idx])
    if (result) {
      break
    }
  }
  if (result == 0) {
    result = a.length - b.length
  }
  return result
}


/**
 * create list elements
 */
function createContents(
  lineNumber: number,
  countPerPage: number,
  items: CommitItem[]): ReactNode[]  {

  const lineIndex = lineNumber - 1
  const pageIndex = Math.floor(lineIndex / countPerPage)
  const offset = pageIndex * countPerPage

  const result = items.slice(
    pageIndex, pageIndex + countPerPage).map((item) => {
    return (
      <>
        <li>
          <dl>
            <dt>id</dt>
            <dd>{item.name}</dd>
            <dt>oid</dt>
            <dd>{item.oid}</dd>
            <dt>{getDomainText('awblog', 'Preview')}</dt>
            <dd><ContentPreview contentId={parseInt(item.name)} /></dd>
          </dl>
        </li>
      </>
    ) 
  })
  return result
}



/**
 * content list
 */
export default function ContentList(
  props: ContentListProperties) {
  const [contentItems, setContentItems] = useState<CommitItem[]>([])
  useEffect(() => {
    let doUpdate = true;
    (async () => {
      const res = await listCommit()
      if (res.ok) {
        const jsonObj = await res.json()
        if (jsonObj.items && doUpdate) {
          const items = jsonObj.items as CommitItem[]
          if (compareCommitItems(items, contentItems)) {
            setContentItems(items)
          }
        }
      }
    })()
    return () => {
      doUpdate = false
    }
  }, [contentItems, props.lineNumber, props.countPerPage]) 

  return (
    <>
     <ol>
      {createContents(props.lineNumber, props.countPerPage, contentItems)}
     </ol>
    </>
  )
}


// vi: se ts=2 sw=2 et:
