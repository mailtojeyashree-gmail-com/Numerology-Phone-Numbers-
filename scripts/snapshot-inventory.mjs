import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const siteUrl = 'https://dummy/mobile-numbers/'
const apiUrl = 'https:/dummy/rest/v1/mobile_numbers'
const pageSize = 100
const concurrency = 12

async function fetchText(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${url}`)
  return response.text()
}

async function getPublicApiKey() {
  const html = await fetchText(siteUrl)
  const bundlePath = html.match(/src=["']([^"']*\/assets\/main-[^"']+\.js)["']/)?.[1]
  if (!bundlePath) throw new Error('Could not locate the website frontend bundle.')

  const bundle = await fetchText(new URL(bundlePath, siteUrl))
  const apiKey = bundle.match(/apiKey:"([^"]+)"/)?.[1]
  if (!apiKey) throw new Error('Could not locate the public inventory API key.')
  return apiKey
}

async function fetchPage(offset, apiKey) {
  const query = new URLSearchParams({
    select: 'number,price,price_friendly',
    available: 'eq.true',
    order: 'number.asc',
    offset: String(offset),
    limit: String(pageSize),
  })
  const response = await fetch(`${apiUrl}?${query}`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      Prefer: 'count=exact',
    },
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Inventory page at offset ${offset} failed (${response.status}): ${detail}`)
  }

  const total = Number(response.headers.get('content-range')?.split('/')[1])
  if (!Number.isFinite(total)) throw new Error('Inventory response omitted its total row count.')
  return { rows: await response.json(), total }
}

const apiKey = await getPublicApiKey()
const firstPage = await fetchPage(0, apiKey)
const rows = [...firstPage.rows]
console.log(`Downloading ${firstPage.total.toLocaleString()} available numbers...`)

for (let offset = pageSize; offset < firstPage.total; offset += pageSize * concurrency) {
  const offsets = Array.from(
    { length: Math.min(concurrency, Math.ceil((firstPage.total - offset) / pageSize)) },
    (_, index) => offset + index * pageSize,
  )
  const pages = await Promise.all(offsets.map((pageOffset) => fetchPage(pageOffset, apiKey)))
  for (const page of pages) rows.push(...page.rows)
  console.log(`Fetched ${Math.min(rows.length, firstPage.total).toLocaleString()} / ${firstPage.total.toLocaleString()}`)
}

const uniqueRows = new Map(rows.map((row) => [String(row.number), row]))
const numbers = [...uniqueRows.values()]
  .map((row) => [String(row.number), Number(row.price), row.price_friendly || ''])
  .sort((first, second) => first[1] - second[1] || first[0].localeCompare(second[0]))

await mkdir('public', { recursive: true })
await writeFile(
  join('public', 'available-numbers.json'),
  JSON.stringify({ updatedAt: new Date().toISOString(), numbers }),
)
console.log(`Saved ${numbers.length.toLocaleString()} unique numbers to public/available-numbers.json`)