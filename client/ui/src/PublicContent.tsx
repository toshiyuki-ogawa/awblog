import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useState,
  Suspense,
  startTransition
} from 'react'
import { 
  type ComponentProps, 
  type AnchorHTMLAttributes,
  type ReactNode } from 'react'
import { Link } from 'react-router'
import Markdown from 'react-markdown'
import Progress from './Progress'
import { type ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { getContent } from 'awblog-base'
import { getRootName } from './root-name'
import { getAwblogPath, loadJsFromElement } from  './awblog'
import { getBasename } from './basename'

/**
 * content properties
 */
type ContentProperties = {

  /**
   * content id
   */
  contentId: number
  /**
   * navigation path to be created as react router link if the node is html
   * anchor element.
   */
  navigationPath: string
}

type PublicContentProperties = ContentProperties

/**
 * text compoent properties
 */
type TextComponentProperties = {

  /**
   * children
   */
  content: string
  /**
   * navigation path to be created as react router link if the node is html
   * anchor element.
   */
  navigationPath: string
}


/**
 * text component
 */
function TextComponent(
  props: TextComponentProperties) {

  const navigationPath = props.navigationPath
  /**
   * custom anchor
   */
  function CustomAnchor(
    props: ComponentProps<'a'> & ExtraProps) {

    let internalRef = false
    let search = ''
    if (props.href) {
      if (props.href.indexOf(getAwblogPath()) == 0) {
        const searchIdx = props.href.indexOf('?')
        if (searchIdx) {
          search = props.href.substring(searchIdx)
          internalRef = true
        }
      }

    }
    if (internalRef) {
      return <Link to={
        {
          pathname: navigationPath,
          search
        }
      }>{props.children ?? ''}</Link> 
    } else {
      return <a {...props}>{props.children}</a>
    }
  }


  return <Markdown
    remarkPlugins={
      [remarkGfm]
    }
    rehypePlugins={
      [rehypeRaw]
    }
    components={{
      a: CustomAnchor 
    }}
    >{props.content}</Markdown>
}


/**
 * content
 */
function Content(props: ContentProperties) {
  
  const [content, setContent] = useState<any>()
  const [contentType, setContentType] = useState('')


  const loadRuntimeJs = useEffectEvent(() => {
    const rootElement = document.getElementById(getRootName())
    if (rootElement) {
      loadJsFromElement(rootElement)
    }
  })

  useEffect(()=>{ 
    let doUpdate = true;
    startTransition(async () => {
      let contentResType = contentType
      let contentResData = content
      if (doUpdate) {
        if (props.contentId) {
          const contentRes = await getContent(props.contentId)
          if (contentRes) {
            contentResType = contentRes.headers.get('Content-Type') ?? ''
            if (contentResType) {
              if (contentResType.indexOf('text') != -1) {
                contentResData = await contentRes.text()
              } else {
                contentResData = undefined
              }
            }
          }
        } else {
          contentResType = ''
          contentResData = undefined
        }
        startTransition(()=> {
          setContentType(contentResType)
          setContent(contentResData)
        })
      }
    })
    return ()=> { doUpdate = false }
  }, [props.contentId])
  useEffect(() => {
    loadRuntimeJs()
  }, [content])

  if (contentType.indexOf('text') != -1 && content) {
    return <TextComponent
      content={content as string}
      navigationPath={props.navigationPath}
      />
  } else {
    return null
  }
}


/**
 * render public content
 */
export default function PublicContent(props: PublicContentProperties) {


  return (
    <>
      <Suspense fallback={<Progress />}>
        <Content { ...props} />
      </Suspense>
    </>
  )

}

// vi: se ts=2 sw=2 et:
