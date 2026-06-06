

/**
 * decode payload from jwt
 */
export function decodePayload(token: string): { [key: string]: any } | null {

  const base64Urls = token.split(".")
  let result = null
  
  if (base64Urls.length > 0) {
    const base64 = base64Urls[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    )
    try {
      result = JSON.parse(jsonPayload)
    } catch {
    }
  }
  return result
}
// vi: se ts=2 sw=2 et:
