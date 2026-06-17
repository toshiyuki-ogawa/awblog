
/**
 * not available svg properties
 */
type NotAvailableSvgProperties = {
  /**
   * fill
   */
  fill?: string
  /**
   * icon size
   */
  iconSize?: string
}



/**
 * not available svg 
 */
export default function NotAvailableSvg(props: NotAvailableSvgProperties) {

  return (
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={props.iconSize}
      height={props.iconSize}>
      <rect x="0" y="0" width="100%" height="100%" fill={props.fill} />

      <path
        fill-rule="evenodd"
        d="M 0 50
          A 50 50 0 1 0 100 50
          A 50 50 0 1 0 0 50
          Z
          M 15 50
          V 58
          A 2 2 0 0 0 17 60
          H 83
          A 2 2 0 0 0 85 58
          V 42
          A 2 2 0 0 0 83 40
          H 17
          A 2 2 0 0 0 15 42
          Z"/> 
     
    </svg>
  )
}

// vi: se ts=2 sw=2 et:
