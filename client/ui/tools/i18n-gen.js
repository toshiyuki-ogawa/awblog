import { promisify } from 'node:util'
import child_process from 'node:child_process'
import process from 'node:process'
import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * parse option
 */
function parseOption(options) {
  const result = { ...options } 
  let idx
  for (idx = 2; idx < process.argv.length; idx++) {
    const arg = process.argv[idx]
    if ('--source' == arg || '-s' == arg && idx < process.argv.length - 1) {
      result.sourceDirs.push(process.argv[++idx])
    } else if (/--source=(.+)/.test(arg)) {
      result.sourceDirs.push(RegExp.$1)
    } else if (('--dest' == arg || '-d' == arg)
      && idx < process.argv.length - 1) {
      result.destDir = process.argv[++idx]
    } else if (/--dest=(.+)/.test(arg)) {
      result.destDir = RegExp.$1
    } else if (('--message-file' == arg || '-m' == arg)
      && idx < process.argv.length - 1) {
      result.domainMessageFile = process.argv[++idx]
    } else if (/--domain-message=(.+)/.test(arg)) {
      result.domainMessageFile = RegExp.$1
    }
  }
  return result
}

/**
 * create lang domain file mapping
 */
async function createLangDomainFile(options) {
  const langDomainFile = { }
  for (const sourceDir of options.sourceDirs) {
    let i18nDir
    try {
      i18nDir = await fs.opendir(sourceDir)
      while (true) {
        const i18nDirEnt = await i18nDir.read()
        if (i18nDirEnt) {
          if (i18nDirEnt.isDirectory()) {
            const langName = i18nDirEnt.name
            let langDir
            try {
              langDir = await fs.opendir(
                path.join(i18nDirEnt.parentPath, i18nDirEnt.name))
              while (true) {
                const langDirEnt = await langDir.read()
                if (langDirEnt) {
                  if (langDirEnt.isFile()) {

                    if (/(.+)\.po/.test(langDirEnt.name)) {

                      const domain = RegExp.$1
                      let domainFile = langDomainFile[langName]
                      if (!domainFile) {
                        domainFile = {} 
                        langDomainFile[langName] = domainFile
                      }
                      if (!domainFile[domain]) {
                        domainFile[domain] = []
                      }
                      domainFile[domain].push(path.join(
                        langDirEnt.parentPath, langDirEnt.name))
                    }
                  }
                } else {
                  break
                }
              } 
            } catch (err) {
              console.error(err)
            } finally {
              if (langDir) {
                await langDir.close()
              }
            }
          }
        } else {
          break
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      if (i18nDir) {
        await i18nDir.close()
      }
    }
  }
  const result = langDomainFile
  return result
}

/**
 * get l10n.js path
 */
function getl10nPath() {
  const scriptDir = path.dirname(process.argv[1])
  return path.join(scriptDir, 'l10n.js')
}

/**
 * create domain message json object
 */
async function createDomainMessages(domainFiles) {

  let domainKey
  const domainMessages = { }
  for (domainKey in domainFiles) {
    let fh
    try {
      fh = await fs.open(domainFiles[domainKey])
      const msgObj = JSON.parse(await fh.readFile({ encoding: 'utf8' }))
      domainMessages[domainKey] = msgObj
    } catch (err) {
    } finally {
      fh?.close()
    }
  }
  const result = domainMessages
  return result
}


/**
 * main procedure
 */
async function mainProc(options) {
  const langDomainFile = await createLangDomainFile(options)
  for (const lang in langDomainFile) {
    const domainFile = langDomainFile[lang]
    const domainOutputs = {}
    
    for (const domain in domainFile) {
      const poFiles = domainFile[domain] 
      const destDir = options.destDir
      if (destDir) {
        let doProcess = true
        let dirExists = false
        const outputDir = path.join(destDir, lang)
        try {
          const stat = await fs.stat(outputDir)
          dirExists = stat.isDirectory()
          doProcess = dirExists
        } catch (err) {
        }
        if (doProcess && !dirExists) {
          try {
            dirExists = await fs.mkdir(outputDir, { recursive: true })
          } catch (err) {
          }
        }
        if (doProcess && dirExists) {
          const exec = promisify(child_process.execFile)
          const outputFile = path.join(outputDir, `${domain}.json`)
          await fs.rm(outputFile, {
            force: true
          }) 
          
          for (let poFile of poFiles) { 
            const jsonProcessing = exec(
              process.argv0,
              [
                getl10nPath(),
                '-i', poFile,
                '-j', outputFile
              ])
            await jsonProcessing
          }
          domainOutputs[domain] = outputFile
        }
      }
    }

    const domainMessages = await createDomainMessages(domainOutputs) 
    const domainMsgOutputFile = path.join(
      options.destDir, lang, options.domainMessageFile)
    
    let fh  
    try {
      fh = await fs.open(domainMsgOutputFile, 'w')
      await fh.write(JSON.stringify(domainMessages))
    } catch (err) {
      console.info(err)
    } finally {
      fh?.close()
    }
  }
}


(async ()=>{

  const sourceDirs = ['i18n-build']
  if (process.env.SOURCE_DIRS) {
    sourceDirs.push(...process.env.SOURCE_DIRS.split(path.delimiter))
  }
  let options = {
    sourceDirs,
    destDir: 'i18n-dist',
    domainMessageFile: 'awblog.json'
  }
  options = parseOption(options)
  await mainProc(options)
})()

// vi: se ts=2 sw=2 et:
