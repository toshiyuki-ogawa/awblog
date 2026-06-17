import process from 'node:process'
import path from 'node:path'
import fs from 'node:fs/promises'

/**
 *  list up files which are having ext, in the file
 */
async function listFiles(file, ext) {
  let result = []
  const contents  = await fs.readFile(file, { encoding: 'utf8'})
  const regEx = new RegExp(`\"(.+\.${ext})\"`, 'g')

  const files = []
  while (true) {
    const matches = regEx.exec(contents)
    if (matches) {
      files.push(matches[1])
    } else {
      break
    }
  }
  result = files
  return result
}


/**
 * load key files
 * key file format.
 * each line has three fields with comma separaded.
 * fist element is key name
 * seconde element is the file to be scaned to list files
 * third element is extension to be matched
 * 
 * here is example.
 *
 * index.html, src/AppRoutes.tsx, html
 */
async function loadKeyEntries(file, defaultExt) {

  let fh

  const keyEntries = {}
  try {
    fh = await fs.open(file)
    for await (const ln of fh.readLines()) {
      const elems = ln.split(',')
      if (elems.length > 1) {
        const key = elems[0].trim()
        const entry = elems[1].trim()
        let ext = defaultExt
        if (elems.length > 2) {
          ext = elems[2].trim()
        }
   
        if (key && entry) {
          keyEntries[key] = [entry, ext]
        }
      }
    }
  } finally {
    if (fh) {
      await fh.close()
    }
  }
  return keyEntries
}


/**
 * show help message
 */
function showHelp() {
  const scriptName = path.basename(process.argv[1])
  
  process.stdout.write(`${scriptName} OPTION
-h,--help               Show this message.
-f,--file=[FILE]        Specify the key file to be scanned to list file names.
-e,--ext=[EXT]          Specify the matched extension. default html
`)
}


/**
 * parse option
 */
function parseOption() {

  const result = {
    ext: 'html'
  }

  for (let idx = 2; idx < process.argv.length; idx++) {
    const arg = process.argv[idx]

    if (/(-f|--file)$/.test(arg)) {
      if (idx < process.argv.length - 1) {
        result.file = process.argv[++idx]
      }
    } else if (/--file=(.+)/.test(arg)) {
      result.file = RegExp.$1
    } else if (/(-e|--ext)$/.test(arg)) {
      if (idx < process.argv.length - 1) {
        result.ext = process.argv[++idx]
      }
    } else if (/--ext=(.+)/.test(arg)) {
      result.ext = RegExp.$1
    } else if (/(-h|--help)$/.test(arg)) {
      result.showHelp = true
    }
  }

  return result
}

/**
 * main procedure
 */
async function mainProc(option) {
  if (option.file) {
    const keyEntries = await loadKeyEntries(option.file, option.ext) 

    const keyFiles = { }
    for (let key in keyEntries) {
      const [file, ext] = keyEntries[key]
      const files = await listFiles(file, ext) 
      keyFiles[key] = files
    }

    process.stdout.write(JSON.stringify(keyFiles, null, 2))

  } else if (option.showHelp) {
    showHelp()
  }
}


(async ()=>{
  const option = parseOption()
  await mainProc(option)
})()

// vi: se ts=2 sw=2 et:
