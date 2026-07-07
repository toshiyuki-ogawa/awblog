
import ProgressSvg from './ProgressSvg'
import {
  progressBackground,
  progressForeground,
  progress as progressClass
} from './Progress.module.css'

/**
 * progress properties
 */
type ProgressProperties = {

  /**
   * class name
   */
  className?: string

}



/**
 * progress component
 */
export default function Progress(props: ProgressProperties) {

  return (
    <div
      className={props.className ?? progressClass}>
      <ProgressSvg
        backgroundClass={progressBackground}
        foregroundClass={progressForeground}
      />
    </div>
  )
}


// vi: se ts=2 sw=2 et:
