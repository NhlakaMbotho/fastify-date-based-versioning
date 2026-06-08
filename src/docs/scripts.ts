import fs from 'fs'
import path from 'path'

function read(filename: string): string {
  return fs.readFileSync(path.join(__dirname, '../public', filename), 'utf-8')
}

export const operationVersionSelectorJs = read('operation-version-selector.js')
export const schemaBadgesJs = read('schema-badges.js')
