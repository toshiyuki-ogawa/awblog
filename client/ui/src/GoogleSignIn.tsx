import { 
  useState, useEffect, Suspense, useRef, startTransition
} from 'react'

import { setOauthToken } from './google-oauth'

import {
  buttonContainer as buttonContainerClass
} from './GoogleSignIn.module.css'


/**
 * Signin with google properties
 */
type GoogleSignInProperties = {
  /**
   * notified button rendered
   */
  onRendered?: (()=>void)
}

/**
 * the flag whether google account id library is initialized
 */
let initialized = false


/**
 * get client id
 */
async function getClientId(): Promise<string> {
  const res = await fetch('google-client-id.txt')
  let result=''

  if (res.ok) {
    result = await res.text()
    result = result.trim()
  }
  return result
}

/**
 * handle credential
 */
function handleCredential(
  response: google.accounts.id.CredentialResponse): void {
  setOauthToken(response.credential)
}

/**
 * initialize account library
 */
async function initAccountLibraryIfNot(): Promise<boolean> {
  let result = false  
  if (!initialized) {
    const clientId = await getClientId()
    if (clientId) {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential
      }) 
      initialized = true
      result = true
    }
  } else {
    result = true
  }
  return result
}





/**
 * sign in with google
 */
export default function GoogleSignIn(props: GoogleSignInProperties) {
  
  const signInRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    startTransition(async () => {
      await initAccountLibraryIfNot()      
      if (signInRef.current) {
        google.accounts.id.renderButton(
          signInRef.current, {
            type: 'standard'
          })
        if (props.onRendered) {
          props.onRendered()
        }
      }
    }) 
  }, [props.onRendered])

  return (
    <Suspense fallback={<p>loading...</p>}>
      <div
        ref={signInRef}
        className={buttonContainerClass}
        style={
          {
            colorScheme: 'light'
          }  
        }/> 
    </Suspense>
  )
}

// vi: se ts=2 sw=2 et:
