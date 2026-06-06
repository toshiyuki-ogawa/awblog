import { useSyncExternalStore } from 'react'
import GoogleSignIn from './GoogleSignIn'
import { type JwtUser, getJwtUser }  from './jwt-user'
import { 
  subscribe, 
  getOauthToken} from './account'
import { getDomainText } from './i18n'


/**
 * account manager properties
 */
type AccountMngProperties = {


  /**
   * notify when signin button rendered
   */
  onButtonRendered?: (()=>void)

}

/**
 * user view properties
 */
type UserViewProperties = {
  /**
   * token type(google, apple, github, microsoft)
   */
  tokenType: string
}

/**
 * user view
 */
function UserView(props: UserViewProperties) {

  const token = getOauthToken()

  let jwtUser: JwtUser | null = null
  if (token) {
    jwtUser = getJwtUser(token)
  }
  if (jwtUser) {

    let emailVerified = ''
    if (jwtUser.email_verified) {
      emailVerified = getDomainText('awblog', 'Verified')
    } else {
      emailVerified = getDomainText('awblog', 'Not verified:')
    }
    return (
      <dl>
        <dt>{getDomainText('awblog', 'Name')}</dt>
        <dd>{jwtUser.name}</dd>
        <dt>{getDomainText('awblog', 'Email')}</dt>
        <dd>{jwtUser.email}</dd>
        <dt>{getDomainText('awblog', 'Email verified')}</dt>
        <dd>{emailVerified}</dd>
        <dt>{getDomainText('awblog', 'Token expiration')}</dt>
        <dd>{new Date(jwtUser.exp * 1000).toLocaleString()}</dd>
      </dl>
    )

  } else {
    return null
  }

}

/**
 * account manage
 */
export default function AccountMng(props: AccountMngProperties) {

  useSyncExternalStore(subscribe, getOauthToken) 



  return (
    <>
      <div>
        <UserView 
          tokenType="google"
        />
      </div>
      <div>
        <GoogleSignIn 
          onRendered={
            ()=>{
              if (props.onButtonRendered) {
                props.onButtonRendered()
              }
            }
          }
        />
      </div>
    </>
  )

}

// vi: se ts=2 sw=2 et:
