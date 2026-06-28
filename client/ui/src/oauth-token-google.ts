
import { setOauthToken } from './google-oauth'

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
export async function initAccountLibrary(): Promise<boolean> {
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


// vi: se ts=2 sw=2 et:
