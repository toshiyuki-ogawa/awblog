import {
  disclosure as disclosureClass,
  close as closeClass,
  open as openClass
} from './TriangleSvgIcon.module.css'

/**
 * to up svg icon properties
 */
type TriangleSvgIconProperties = {
  /**
   * setting line fill
   */
  fill?: string
  /**
   * icon size
   */
  iconSize?: string

  /**
   * open status
   */
  open?: boolean

}

/**
 * render to up icon
 */
export default function TriangleSvgIcon(
  props: TriangleSvgIconProperties) {

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width={props.iconSize}
        height={props.iconSize}>
        <path className={
            [props.open ? openClass : closeClass, disclosureClass].join(' ')
          }
          fill={props.fill}
        />
      </svg>
    </>
  )
}
// vi: se ts=2 sw=2 et:
