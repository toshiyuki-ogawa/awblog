
import { getOauthToken as getOauthTokenGoogle } from './google-oauth'

import { decodePayload } from './jwt'

/**
 * jwt user properties
 */
type JwtUserProperties = {

  /**
   * jwt token type
   */
  jtwType?: string
}


/**
 *  get token
 */
function getToken(): string | null {
  return getOauthTokenGoogle()
} 




/**
 * show jwt user infomation
 */
export default function JwtUser(props: JwtUserProperties) {

  const token = getToken()

  if (token) {
    const strToken = JSON.stringify(decodePayload(token)!!, null, 2) 
    return <pre>{strToken}</pre>
  } else {
    return null
  }

}



// vi: se ts=2 sw=2 et:
