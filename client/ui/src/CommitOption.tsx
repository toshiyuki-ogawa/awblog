import { useState, useSyncExternalStore, useId } from 'react'
import { subscribe, setDeleteEditing, isDeleteEditing } from './commit-option'
import { getDomainText } from './i18n'

/**
 * commit option
 */
export default function CommitOption() {
 
  const currentDeleteEditing = useSyncExternalStore(subscribe, isDeleteEditing)

  function handleChangeEvent(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = Boolean(e.target.checked)
    setDeleteEditing(newValue) 
  }

  return (
    <label>
      <input type="checkbox" 
        checked={currentDeleteEditing}
        onChange={ handleChangeEvent }
        defaultChecked={currentDeleteEditing}
      />
        { getDomainText('awblog', 'Delete editing content on commit') }
    </label>
  )
}

// vi: se ts=2 sw=2 et:
