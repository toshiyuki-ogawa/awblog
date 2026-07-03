
import StartNewContent from './StartNewContent'
import StartEditContent from './StartEditContent'
/**
 * properties to start editing
 */
type StartEditingProperties = {
  /**
   * content id
   */
  contentId?: number
  /**
   * the flag start to edit or create content
   */
  autoStart: boolean
}


/**
 * start editing content
 */
export default function StartEditing(props: StartEditingProperties) {

  if (props.contentId) {
    return <StartEditContent 
      contentId={props.contentId}
      autoStart={props.autoStart}
    />
  } else {
    return <StartNewContent 
      autoStart={props.autoStart}/>    
  }
}


// vi: se ts=2 sw=2 et:
