import configPathDefault from './config-path.ts'


/**
 * configuration properties
 */
type ConfigurationProperties = {
  /**
   * blog request path
   */
  requestPath: string
}

/**
 * configuration
 */
let config : ConfigurationProperties | null = null

/**
 * initialize configuration
 * load configuration source
 */
export async function init(configPath? : string): Promise<void> {

  if (!config) {
    if (!configPath) {
      configPath = configPathDefault
    }
    const configPathUrl = configPath.trim()
    const res = await fetch(configPathUrl)
    if (res.ok) {
      config = await res.json() as ConfigurationProperties
    }
  }
}


/**
 * get request path
 */
export function getRequestPath(): string | undefined {
  let result
  if (config) {
    result = config.requestPath
  }
  return result
}

// vi: se ts=2 sw=2 et:
