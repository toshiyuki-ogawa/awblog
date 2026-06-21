import { type CommitItem } from './commit-item'

/**
 * content items
 */
export type ContentItems = {
  /**
   * commited item
   */
  commits: CommitItem[],
  /**
   * released content ids
   */
  release: number[],
  /**
   * editing content ids
   */
  editing: number[]
}

// vi: se ts=2 sw=2 et:
