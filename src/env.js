import { readFileSync } from 'fs'
import { resolve } from 'path'

const notCommentedOut = x => x.charAt() !== `#`
const splitAndSetEnvVars = x => {
  // split on first "=" strip "quotes" if present, only return first 2
  const [key, val] = x.split(/="?(.+)"?/, 2)
  process.env[key] = val
}

if (!process.env.GAIAMA_SERVICE_NAME) {
  const content = readFileSync(resolve(__dirname, `../../.env`), `utf8`)
  content
    .split(`\n`)
    .filter(notCommentedOut)
    .map(splitAndSetEnvVars)
}
