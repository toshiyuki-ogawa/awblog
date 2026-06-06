import { loadFromStorage as loadAuthor } from './author'
import { loadFromStorage as loadGoogle } from './google-oauth'


/**
 * load storage
 */
export default function loadDataFromStorage() {
  loadGoogle()
  loadAuthor()
}


// vi: se ts=2 sw=2 et:
