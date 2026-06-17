import { useRef, useEffect } from 'react'

/**
 * link item
 */
export type LinkItem = {
  link: string
  title?: string
}

/**
 * link select properties
 */
export type LinkSelectProperties = {

  /**
   * select element id
   */
  id?: string

  /**
   * default value
   */
  defaultValue?: string

  /**
   * link items
   */
  links: LinkItem[]


  /**
   * handle selected action
   */
  onSelect?: ((item: LinkItem)=>void)
}

/**
 * link select
 */
export default function LinkSelect(props: LinkSelectProperties) {

  const valueItemMap = useRef<{ [ key: string]: LinkItem }>({}) 

  useEffect(()=>{
    props.links.forEach(item => {
      valueItemMap.current[item.link] = item
    })
  }, props.links)

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (props.onSelect) {
      props.onSelect(
        valueItemMap.current[e.target.value])
    }
  }

  if (props.links.length) {
    
    let defaultValue = props.defaultValue
      ? props.defaultValue : props.links[0].link

    return (
      <select
        id={props.id}
        defaultValue={defaultValue}
        onChange={onChange}>
        {
          props.links.map(item => {
            return (
              <option
                value={item.link}
                label={item.title ? item.title : item.link} />
            )
          })
        }
      </select>
    )
  } else {
    return null
  }
  
}


// vi: se ts=2 sw=2 et:
