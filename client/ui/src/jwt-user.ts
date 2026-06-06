import { decodePayload } from './jwt'

/**
 * user properties
 */
export type JwtUser = {
  email: string
  email_verified: boolean
  name: string
  iat: number
  exp: number
}


/**
 * get user properties from jwt
 */
export function getJwtUser(
  token: string): JwtUser | null {
  const res = decodePayload(token)
  let result: JwtUser | null  = null
  if (res) {
    result = res as JwtUser 
  }
  return result
}


// vi: se ts=2 sw=2 et:
