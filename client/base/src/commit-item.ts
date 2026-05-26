
/**
 * commit item
 */
export interface CommitItem {
  /**
   * name
   */
  name: string
  /**
   * object id
   */
  oid: string
  /**
   * file mode
   */
  mode: string
}


/**
 * compare commit items
 */
export function compareCommitItem(a: CommitItem, b: CommitItem): number {
  let result = 0
  if (a.name < b.name) {
    result = -1
  } else if (a.name > b.name) {
    result = 1
  }
  if (result == 0) {
    if (a.oid < b.oid) {
      result = -1
    } else if (a.oid > b.oid) {
      result = 1
    }
  }
  if (result == 0) {
    if (a.mode < b.mode) {
      result = -1
    } else if (a.mode > b.mode) {
      result = 1
    }
  }
  return result
}

// vi: se ts=2 sw=2 et:
