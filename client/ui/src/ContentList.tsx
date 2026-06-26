import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  listContent,
  type CommitItem,
  type ContentItems,
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
  items: ContentItems
}

/**
 * content attribute
 */
type ContentAttr = {
  /**
   * content id
   */
  contentId: number

  /**
   * object id if content is commited
   */
  oid?: string

  /**
   * content is released if this flag is true
   */
  release: boolean

  /**
   * content is editing if this flag is true
   */
  editing: boolean
}

/**
 * compare content attribute
 */
function compareContentAttr(a: ContentAttr, b: ContentAttr): number {
  let result = 0
  result = a.contentId - b.contentId
  if (result == 0) {
    if (a.oid && b.oid) {
      if (a.oid < b.oid) {
        result = -1
      } else if (a.oid > b.oid) {
        result = 1
      } else {
        result = 0
      }
    } else if (a.oid) {
      result = 1
    } else if (b.oid) {
      result = -1
    } else {
      result = 0
    }
  }
  if (result == 0) {
    result = Number(a.release) - Number(b.release)
  }
  if (result == 0) {
    result = Number(a.editing) - Number(b.editing)
  }
  return result
}

/**
 * compare content attr
 */
function compareContentAttrs(a: ContentAttr[], b: ContentAttr[]): number {

  let result = 0

  const compLen = Math.min(a.length, b.length)
  for (let idx = 0; idx < compLen; idx++) {
    result = compareContentAttr(a[idx], b[idx])
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
 * convert from content items to content attributes list
 */
function contentItemsToConentAttrs(
  contentItems: ContentItems): ContentAttr[] {

  const releaseIds = new Set<number>(contentItems.release)
  const editingIds = new Set<number>(contentItems.editing)
  const processedIds = new Set<number>() 
  const idAttrs = new Map<number, ContentAttr>()

  contentItems.commits.forEach(item => {
    const contentId = parseInt(item.name)
    processedIds.add(contentId)
    idAttrs.set(contentId, {
      contentId,
      oid: item.oid,
      release: contentId in releaseIds,
      editing: contentId in editingIds,
    })
  })
  
  const restReleaseIds = releaseIds.difference(processedIds)
  restReleaseIds.forEach(contentId => {
    processedIds.add(contentId)
    idAttrs.set(contentId, {
      contentId,
      release: true,
      editing: contentId in editingIds 
    })
  })
  const restEditingIds = editingIds.difference(processedIds)
  restEditingIds.forEach(contentId => {
    idAttrs.set(contentId, {
      contentId,
      release: false,
      editing: true
    })
  })

  const result: ContentAttr[] = idAttrs
    .keys().toArray().sort().map(id => idAttrs.get(id)!!)

  return result
}


/**
 * create list elements
 */
function createContents(
  lineNumber: number,
  countPerPage: number,
  items: ContentAttr[]): ReactNode[]  {

  const lineIndex = lineNumber - 1
  const pageIndex = Math.floor(lineIndex / countPerPage)
  const offset = pageIndex * countPerPage

  const result = items.slice(
    pageIndex, pageIndex + countPerPage).map((item) => {
    return (
      <>
        <li>
          <dl>
            <dt>{getDomainText('awblog', 'id')}</dt>
            <dd>{item.contentId}</dd>
            <dt>{getDomainText('awblog', 'oid')}</dt>
            <dd>{item.oid}</dd>
            <dt>{getDomainText('awblog', 'release')}</dt>
            <dd>{
              getDomainText(
                'awblog',
                item.release ? 'release' : 'not release')
            }</dd>
            <dt>{getDomainText('awblog', 'editing')}</dt>
            <dd>{
              getDomainText(
                'awblog',
                item.editing ? 'editing' : 'not editing')
            }</dd>
            <dt>{getDomainText('awblog', 'Preview')}</dt>
            <dd><ContentPreview contentId={item.contentId} /></dd>
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
  const [contentAttrs, setContentAttrs] = useState<ContentAttr[]>([])
  useEffect(() => {
    let doUpdate = true;
    (async () => {
      const res = await listContent()
      if (res && res.ok) {
        const jsonObj = await res.json()
        if (doUpdate) {
          const items = contentItemsToConentAttrs(jsonObj as ContentItems)
          if (compareContentAttrs(items, contentAttrs)) {
            setContentAttrs(items)
          }
        }
      }
    })()
    return () => {
      doUpdate = false
    }
  }, [props.lineNumber, props.countPerPage]) 

  return (
    <>
     <ol>
      {createContents(props.lineNumber, props.countPerPage, contentAttrs)}
     </ol>
    </>
  )
}


// vi: se ts=2 sw=2 et:
