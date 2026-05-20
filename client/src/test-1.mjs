import { argv, stdout } from 'node:process'
import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'
import path from 'node:path'
import { 
  init, 
  createContent, 
  updateContentWithStr,
  updateContentWithBlob,
  getContent,
  updateContentHeader,
  getContentHeader,
  commit,
  getHistoryOids,
  listCommit,
  isEditing
}  from 'awblog-base'


const configPath = 'http://localhost:8000/awbconfig-t.json'

/**
 * show help
 */
function showHelp() {
  const cmdName = path.basename(import.meta.filename)
  stdout.write(`${cmdName} [COMMAND] [OPTIONS]
COMMAND
create                    create content
update                    update content
show                      show content
update-header             update content header
show-header               show content header
commit                    commit editting content
show-history              history about content id as object ids list 
list-commit               list commit
is-editing                query whether content id is editing.

OPTIONS
-h, --help                show this message
-i, --id=[CONTENT_ID]     the target content id
-c, --content=[CONTENT]   the contents for id
-f, --file=[FILE]         specified file contains the contents for id.  
-e, --edit                specify content type
-a, --author=[AUTHOR]     specify author to commit
-m, --email=[EMAIL]       specify email to commit
-d, --delete              specify the flag whether delete editing content.
`)
}

/**
 * create content
 */
async function doCreateContent(options) {

  await init(configPath)
  const res = await createContent()
  stdout.write(`content-id: ${res}
`)
}

/**
 * update content
 */
async function doUpdateContent(options) {
  if (options.contentId && (options.contents || options.file)) {
    await init(configPath)
    let res = false
    if (options.contents) {
      res = await updateContentWithStr(
        options.contentId, options.contents.join("\n"))
    } else if (options.file) {
      const blob = await fs.openAsBlob(options.file)
      res = await updateContentWithBlob(
        options.contentId, blob)
    }
    stdout.write(`result: ${res}
`)
  }
}


/**
 * update header
 */
async function doUpdateHeader(options) {
  let res = false
  if (options.contentId && options.file) {
    await init(configPath)
    const jsonStr = await fsPromises.readFile(options.file)
    res = await updateContentHeader(options.contentId, JSON.parse(jsonStr))
  }
    stdout.write(`result: ${res}
`)
}

async function show(options) {
  if (options.contentId) {
    await init(configPath)
    const res = await getContent(options.contentId, options.edit)
    let contentType = null
    if (res.headers.has('Content-Type')) {
      contentType = res.headers.get('Content-Type')   
    }
    if (contentType) {
      let contents = null
      if (contentType.indexOf('text') >= 0) {
        contents = await res.text()
      } else if (contentType.indexOf('json') >= 0) {
        contents = await res.json()
      }
      if (contents) {
        stdout.write(`${contents}`)
      } else {
        console.info(res)
      }
    }
  }
}

async function showHeader(options) {
  if (options.contentId) {
    await init(configPath)
    const res = await getContentHeader(options.contentId, options.edit)
    let contentType = null
    if (res.headers.has('Content-Type')) {
      contentType = res.headers.get('Content-Type')   
    }
    if (contentType) {
      let contents = null
      if (contentType.indexOf('text') >= 0) {
        contents = await res.text()
      } else if (contentType.indexOf('json') >= 0) {
        contents = await res.text()
      }
      if (contents) {
        stdout.write(`${contents}`)
      } else {
        console.info(res)
      }
    }
  }
}


/**
 * commit editing content
 */
async function doCommit(options) {
  if (options.contentId && options.author && options.email) {
    await init(configPath)
    const res = await commit(
      options.contentId, options.author, options.email, options.deleteEditing)
    let contentType = null
    if (res.headers.has('Content-Type')) {
      contentType = res.headers.get('Content-Type')   
    }
    if (contentType) {
      let contents = null
      if (contentType.indexOf('text') >= 0) {
        contents = await res.text()
      } else if (contentType.indexOf('json') >= 0) {
        contents = await res.text()
      }
      if (contents) {
        stdout.write(`${contents}`)
      } else {
        console.info(res)
      }
    }
  }
}

/**
 * show content id history as object id list:
 */
async function showHistory(options) {
  if (options.contentId) {
    await init(configPath)
    const res = await getHistoryOids(options.contentId)
    let contentType = null
    if (res.headers.has('Content-Type')) {
      contentType = res.headers.get('Content-Type')   
    }
    if (contentType) {
      let contents = null
      if (contentType.indexOf('text') >= 0) {
        contents = await res.text()
      } else if (contentType.indexOf('json') >= 0) {
        contents = await res.text()
      }
      if (contents) {
        stdout.write(`${contents}`)
      } else {
        console.info(res)
      }
    }
  }
}

/**
 * show list commited content id 
 */
async function doListCommit(options) {
  await init(configPath)
  const res = await listCommit()
  let contentType = null
  if (res.headers.has('Content-Type')) {
    contentType = res.headers.get('Content-Type')   
  }
  if (contentType) {
    let contents = null
    if (contentType.indexOf('text') >= 0) {
      contents = await res.text()
    } else if (contentType.indexOf('json') >= 0) {
      contents = await res.text()
    }
    if (contents) {
      stdout.write(`${contents}`)
    } else {
      console.info(res)
    }
  }
}

/**
 * query id is editing.
 */
async function doCheckEditing(options) {
  if (options.contentId) {
    await init(configPath)
    const res = await isEditing(options.contentId)
    let contentType = null
    if (res.headers.has('Content-Type')) {
      contentType = res.headers.get('Content-Type')   
    }
    if (contentType) {
      let contents = null
      if (contentType.indexOf('text') >= 0) {
        contents = await res.text()
      } else if (contentType.indexOf('json') >= 0) {
        contents = await res.text()
      }
      if (contents) {
        stdout.write(`${contents}`)
      } else {
        console.info(res)
      }
    }
  }
}



/**
 * parse option
 */
function parseOption() {
  const result = {}

  for (let idx = 0; idx < argv.length; idx++) {
    const arg = argv[idx]
    if ('create' == arg)  {
      result.proc = doCreateContent
    } else if ('update' == arg) {
      result.proc = doUpdateContent
    } else if ('show' == arg) {
      result.proc = show
    } else if ('update-header' == arg) {
      result.proc = doUpdateHeader
    } else if ('show-header' == arg) {
      result.proc = showHeader
    } else if ('commit' == arg) {
      result.proc = doCommit
    } else if ('show-history' == arg) {
      result.proc = showHistory
    } else if ('list-commit' == arg) {
      result.proc = doListCommit
    } else if ('is-editing' == arg) {
      result.proc = doCheckEditing
    }
  }
  for (let idx = 0; idx < argv.length; idx++) {
    const arg = argv[idx]
    if (/(-h|--help|help)$/.test(arg)) {
      result.proc = showHelp
    }
    if (/^(-i|--id)$/.test(arg)) {
      if (idx < argv.length - 1) {
        let contentId = parseInt(argv[++idx])
        if (!isNaN(contentId)) {
          result.contentId = contentId
        } else {
          result.proc = showHelp
          break
        }
      }
    } else if (/^--id=(\d+)$/.test(arg)) {
      result.contentId = parseInt(RegExp.$1)
    }
    if (/^(-c|--content)$/.test(arg)) {
      if (idx < argv.length - 1) {
        const content = argv[++idx]
        if (!result.contents) {
          result.contents = []
        }
        result.contents.push(content)
      }
    } else if (/^--content=(.+)/.test(arg)) {
      const content = RegExp.$1
      if (!result.contents) {
        result.contents = []
      }
      result.contents.push(content)
    }
    if (/^(-f|--file)$/.test(arg)) {
      if (idx < argv.length - 1) {
        result.file = argv[++idx]
      }
    } else if (/--file=(.+)/.test(arg)) {
      result.file = RegExp.$1
    }
    if (/^(-e|--edit)$/.test(arg)) {
      result.edit = true
    }
    if (/^(-m|--email)$/.test(arg)) {
      if (idx < argv.length - 1) {
        result.email = argv[++idx]
      }
    } else if (/--email=(.+)/.test(arg)) {
      result.email = RegExp.$1
    }
    if (/^(-a|--author)$/.test(arg)) {
      if (idx < argv.length - 1) {
        result.author = argv[++idx]
      }
    } else if (/--email=(.+)/.test(arg)) {
      result.author = RegExp.$1
    }
    if (/^(-d|--delete)$/.test(arg)) {
      result.deleteEditing = true
    }
  }
  return result
}



/**
 * main procedure
 */
async function mainProc() {

  const opt = parseOption()

  if (opt.proc) {
    await opt.proc(opt)
  }
}


await mainProc()

// vi: se ts=2 sw=2 et:
