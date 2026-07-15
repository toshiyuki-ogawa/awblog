import { promisify } from 'node:util'
import process from 'node:process'
import child_process from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs/promises'

/**
 * parse option
 */
function parseOptions() {
  let result = {
    args: []
  }
  let idx
  for (idx = 2; idx < process.argv.length; idx++) {
    const arg = process.argv[idx]
    if (arg == '-i' || arg == '--input') {
      result.input = process.argv[++idx]
    } else if (/--input=(.+)/.test(arg)) {
      result.input = RegExp.$1
    } else if (arg == '-h' || arg == '--help') {
      result.showHelp = true
    } else if (arg == '-t' || arg == '--truncate') {
      result.truncate = true
    } else if (arg == '-j' || arg == '--json-file') {
      result.jsonFile = process.argv[idx + 1]
      result.args.push(arg)
    } else if (/--json-file=(.+)/.test(arg)) {
      result.jsonFile = RegExp.$1
      result.args.push(arg)
    } else {
      result.args.push(arg)
    }
  }
  if (!result.input || !result.jsonFile) {
    result.exit = 1
  }
  return result
}


/**
 * show help message
 */
function showHelp() {
  const progName = path.basename(process.argv0)
  const scriptName = path.basename(process.argv[1])
  const msg = `${progName} ${scriptName} [OPTIONS]
-h, --help                show this message.
-i, --input=[POFILE]      specify po source file
-t, --truncate            truncate json file before write
-j, --json-file=[JSONFILE] specify l10n json file.
`
  process.stdout.write(msg) 
}


/**
 * main process
 */
async function mainProc(options) {
  const scriptDir = path.dirname(process.argv[1])
  const toJson = path.join(scriptDir, 'tojson.js')
  if (options.truncate && options.jsonFile) {
    try {
      const stats = await fs.stat(options.jsonFile)
      if (stats.isFile()) {
          await fs.unlink(options.jsonFile)
      }
    } catch (err) {
    }
  }
  const exec = promisify(child_process.execFile)
  const { stdout } = await exec(
    'msgexec',
    [ '-i', options.input, 'node', toJson, ...options.args ] )
  process.stdout.write(stdout)
}


(async ()=>{
  const options = parseOptions()
  if (!options.showHelp && !options.exit) {
    await mainProc(options)
  } else {
    showHelp()
  }
  if (options.exit) {
    process.exitCode = options.exit
  }
})()

// vi: se ts=2 sw=2 et:
