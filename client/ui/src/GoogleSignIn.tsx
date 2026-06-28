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
  

  useEffect(() => {
    if (signInRef.current) {
      google.accounts.id.renderButton(
        signInRef.current, {
          type: 'standard'
        })
    }
  })

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
