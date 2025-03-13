//@ts-ignore
import prototypeDevToolsOptions from 'virtual:prototype-devtools-options'
import { setDevToolsClientUrl } from '@prototype/devtools-core'

function normalizeUrl(url: string) {
  return new URL(
    `${prototypeDevToolsOptions.base || '/'}${url}`,
    import.meta.url,
  ).toString()
}

const overlayDir = normalizeUrl(`@id/virtual:prototype-devtools-path:overlay`)
const body = document.getElementsByTagName('body')[0]
const head = document.getElementsByTagName('head')[0]

const devtoolsClientUrl = normalizeUrl(`__devtools__/`)
setDevToolsClientUrl(devtoolsClientUrl)

// create link stylesheet
const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = `${overlayDir}/devtools-overlay.css`

// create script
const script = document.createElement('script')
script.src = `${overlayDir}/devtools-overlay.mjs`
script.type = 'module'

// append to head
head.appendChild(link)

// append to body
body.appendChild(script)
