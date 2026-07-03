import { useState } from 'react'
import AccountLine from './AccountLine'
import ContentList from './ContentList'
import NewContent from './NewContent'

import { getDomainText } from './i18n'
import classes from './Contents.module.css'

type ContentsProperties = {
  /**
   * line number
   */
  lineNumber?: number

  /**
   * line count per page:
   */
  countPerPage?: number
}


/**
 * contents
 */
export default function Contents(props: ContentsProperties) {

  const [lineNumber, setLineNumber] = useState(
    props.lineNumber ?? 1)
  const [countPerPage, setCountPerPage] = useState(
    props.countPerPage ?? 30)

  const [listLineNumber, setListLineNumber] = useState(lineNumber)
  const [listCountPerPage, setListCountPerPage] = useState(countPerPage)
  function action(formData: FormData) {
    const lineNumStr = formData.get('lineNumber') as string
    const countPerPageStr = formData.get('countPerPage') as string
    setListLineNumber(parseInt(lineNumStr))
    setListCountPerPage(parseInt(countPerPageStr))
  }

  return (
    <> 
      <AccountLine />
      <div
        className={classes.toolContainer}>
        <form action={action}
          className={classes.controlContainer}>
          <div>
            <label className={classes.controlItem}>
              {getDomainText('awblog', 'Line Number')}
            </label>
            <input 
              className={classes.controlItem}
              type="number"
              name="lineNumber"
              min="1"  
              step="1"
              defaultValue={lineNumber}
              value={lineNumber}
              onChange={
                e => setLineNumber(
                  parseInt(
                    (e.target as HTMLInputElement).value))
              }
              />
          </div>
          <div>
            <label className={classes.controlItem}>
              {getDomainText('awblog', 'Count per page')}
            </label>
            <input 
              className={classes.controlItem}
              type="number"
              name="countPerPage"
              min="1"
              max="100"
              step="1"
              defaultValue={countPerPage} 
              value={countPerPage}
              onChange={
                e => setCountPerPage(
                  parseInt(
                    (e.target as HTMLInputElement).value))
              }
              />
          </div>
          <button>{getDomainText('awblog', 'Update')}</button>
        </form>
      </div>
      <div
        className={classes.toolContainer}>
        <NewContent
          autoStart={true}/>
      </div>
      <ContentList
        lineNumber={listLineNumber}
        countPerPage={listCountPerPage} />
    </>
  ) 
}


// vi: se ts=2 sw=2 et:
