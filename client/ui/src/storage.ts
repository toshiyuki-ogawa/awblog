import { loadFromStorage as loadAuthor } from './author'
import { loadFromStorage as loadGoogle } from './google-oauth'
import { loadFromStorage as loadCommitOption } from './commit-option'
import {
  loadFromStorage as loadContentEditSetting
} from './content-edit-setting'

/**
 * load storage
 */
export default function loadDataFromStorage() {
  loadGoogle()
  loadAuthor()
  loadCommitOption()
  loadContentEditSetting()
}


// vi: se ts=2 sw=2 et:
