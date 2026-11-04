
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { savePrecedent } from './precedents.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const opinionPath = path.join(
  __dirname,
  'data',
  'granberry.txt'
)

if (!fs.existsSync(opinionPath)) {
  throw new Error('Create data/granberry.txt with the actual opinion text first')
}

const text = fs.readFileSync(opinionPath, 'utf8').trim()

if (text.length < 1000) {
  throw new Error('Opinion text appears incomplete; check granberry.txt')
}

const record = savePrecedent({
  id: randomUUID(),
  title: 'Granberry v. Islay Investments',
  citation: '9 Cal.4th 738',
  court: 'Supreme Court of California',
  date: '1995-03-06',
  url: 'https://scocal.stanford.edu/opinion/granberry-v-islay-investments-31631/',
  publicationStatus: 'published',
  text,
  importedAt: new Date().toISOString(),
  sourceReviewed: false
})

console.log('Imported:', record.title)
console.log('Citation:', record.citation)
console.log('Characters:', text.length)
