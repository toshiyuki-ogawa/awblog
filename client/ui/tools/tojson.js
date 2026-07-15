import process, { env, stdin, stdout }  from 'node:process'
import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * show help message
 */
function showHelp() {
  const scriptName = path.basename(process.argv[1])
  const msg = `${scriptName} [OPTIONS]
-h, --help              show this message.
-j, --json-file=[FILE]  specifiy json file to updated.
`
  stdout.write(msg)
}

/**
 * parse command line arguments
 */
function parseOptions() {
  let idx = 2 
  const result = {
  }
  while (idx < process.argv.length) {
    const arg = process.argv[idx]
    if ('-j' == arg || '--json-file' == arg) {
      if (idx < process.argv.length - 1) {
        result.jsonFile = process.argv[++idx]
      } else {
        result.showHelp = true
        result.exit = 1
      }
    } else if (/--json-file=(.+)/.test(arg)) {
      result.jsonFile = RegExp.$1
    } else if ('-h' == arg || '--help' == arg) {
      result.showHelp = true
    } else {
      result.showHelp = true
      result.exit = 1
    }
    idx++
  }
  return result
}

/**
 * load json string from file
 */
async function loadJsonStrFromFile(options) {
  let result
  if (options.jsonFile) {
    try {
      result = await fs.readFile(options.jsonFile, { encoding: 'utf8' }) 
    } catch (err) {
    }
  }
  return result
}

/**
 * write json string into file
 */
async function writeJsonStringToFile(options, jsonStr) {
  let result
  if (options.jsonFile) {
    try {
      result = await fs.writeFile(options.jsonFile, jsonStr) 
    } catch (err) {
    }
  }
  return result
}

/**
 * load json object from file
 */
async function loadJsonFromFile(options) {
  let result
  if (options.jsonFile) {
    try {
      const jsonStr = await fs.readFile(options.jsonFile, { encoding: 'utf8' }) 
      if (jsonStr) {
        result = JSON.parse(jsonStr)
      }
    } catch(err) {
    }
  }
  return result
}

/**
 * write json object into file
 */
async function writeJsonToFile(options, jsonObj) {
  await writeJsonStringToFile(options, JSON.stringify(jsonObj))
}

/**
 * update json data
 */
async function updateJsonData(options, key, value) {
  const jsonData = (await loadJsonFromFile(options)) ?? { }
  let msgMap
  if (options.domain) {
    if (!jsonData[options.domain]) {
      msgMap = {}
      jsonData[options.domain] = msgMap
    } else {
      msbMap = jsonData[options.domain]
    }
  } else {
    msgMap = jsonData
  }
  msgMap[key] = value
  writeJsonToFile(options, jsonData)
}


/**
 * main procedurpli
 */
async function mainProc(options) {
  const msgid = env['MSGEXEC_MSGID']
  if (msgid) {
    let strData = ''

    stdin.setEncoding('utf8')
    stdin.on('data', (chunk) => strData += chunk)
    stdin.on('end', () => {
      updateJsonData(options, msgid, strData)
    })
  }
}

(async ()=>{
  const options = parseOptions()
  if (!options.showHelp) {
    await mainProc(options)
  } else {
    showHelp()
  }
  if (options.exit) {
    process.exitCode = options.exit
  }
})()


// vi: se ts=2 sw=2 et:
