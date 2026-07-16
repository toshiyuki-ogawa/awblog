import { 
  useState, useEffect, Suspense, useRef, startTransition, useLayoutEffect
} from 'react'


import {
  buttonContainer as buttonContainerClass
} from './GoogleSignIn.module.css'


/**
 * Signin with google properties
 */
type GoogleSignInProperties = {
  [key: string]: any
}





/**
 * sign in with google
 */
export default function GoogleSignIn(props: GoogleSignInProperties) {
  
  const signInRef = useRef<HTMLDivElement | null>(null)

  const [darkMode, setDarkMode] = useState(
    globalThis.matchMedia('(prefers-color-scheme: dark)') ? true : false)


  /**
   * notify mode change
   */
  function handleModeChanged(e: MediaQueryListEvent) {
    setDarkMode(e.matches ? true : false)
  }

  useEffect(() => {
    globalThis.matchMedia('(prefers-color-scheme: dark)').addEventListener(
      "change", handleModeChanged)
  })
  useEffect(() => {
    if (signInRef.current) {
      const theme = darkMode ? 'outline_dark' : 'outline'

      google.accounts.id.renderButton(
        signInRef.current, {
          type: 'standard',
          theme: theme
        })
    }
  }, [darkMode])

  return (
    <div
      ref={signInRef}
      className={buttonContainerClass}
      style={
        {
          colorScheme: 'light'
        }  
      }/> 
  )
}

// vi: se ts=2 sw=2 et:
