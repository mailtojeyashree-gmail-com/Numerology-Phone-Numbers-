import { useMemo, useState } from 'react'
import './Name2NumberPage.css'
import { carRegLetterValueMap, carRegLetterValues } from './numerologyLetterValues'
import RasiChart from './RasiChart'
import { getRasiBhavam, rasiChartStartingSigns } from './rasiChartData'

const letterRows = Array.from({ length: 8 }, (_, index) => ({
  digit: index + 1,
  letters: carRegLetterValues
    .filter(([, value]) => value === index + 1)
    .map(([letter]) => letter),
}))

const defaultMobileListA = `04, 39, 68, 88
06, 41, 72, 89
08, 42, 73, 92
10, 45, 74, 93
12, 51, 77, 95
14, 52, 79, 97
16, 54, 80, 99
20, 56, 84
29, 64, 85
32, 66, 87`

const defaultMobileListB = `04, 32, 73, 90
06, 41, 74, 92
08, 42, 77, 93
10, 45, 79, 95
14, 54, 80, 97
16, 64, 84, 99
20, 66, 85
22, 68, 87
26, 72, 88
29, 73, 89`

function xmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[character])
}

function getNameResult(name) {
  const characterValues = [...name.toUpperCase()].flatMap((character) => {
    if (carRegLetterValueMap.has(character)) {
      return [{ character, value: carRegLetterValueMap.get(character) }]
    }
    if (/^\d$/.test(character)) {
      return [{ character, value: Number(character) }]
    }
    return []
  })
  const total = characterValues.reduce((sum, entry) => sum + entry.value, 0)

  return {
    name,
    characterValues,
    total,
    st: characterValues.length > 0
      ? `${characterValues[0].value}${characterValues[characterValues.length - 1].value}`
      : '',
    name2number: Array.from(
      { length: Math.ceil(characterValues.length / 2) },
      (_, index) => characterValues.slice(index * 2, index * 2 + 2)
        .map(({ value }) => value)
        .join(''),
    ).join(','),
    sum: characterValues.map(({ value }) => value).join('+'),
  }
}

function parseNumberList(text) {
  const numbers = []
  const invalidLines = []
  const seen = new Set()

  text.split(/\r?\n/).forEach((line, index) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    const entries = trimmedLine.split(',').map((entry) => entry.trim())
    if (entries.some((entry) => !/^\d+$/.test(entry))) {
      invalidLines.push(index + 1)
      return
    }

    entries.forEach((entry) => {
      const normalized = entry.replace(/^0+(?=\d)/, '')
      if (seen.has(normalized)) return
      seen.add(normalized)
      numbers.push({ key: normalized, value: entry })
    })
  })

  return { numbers, invalidLines }
}

function compareNumberLists(textA, textB) {
  const parsedA = parseNumberList(textA)
  const parsedB = parseNumberList(textB)
  const numbersInA = new Set(parsedA.numbers.map(({ key }) => key))
  const numbersInB = new Set(parsedB.numbers.map(({ key }) => key))

  return {
    unusedA: parsedA.numbers
      .filter(({ key }) => !numbersInB.has(key))
      .map(({ value }) => value),
    unusedB: parsedB.numbers
      .filter(({ key }) => !numbersInA.has(key))
      .map(({ value }) => value),
    invalidA: parsedA.invalidLines,
    invalidB: parsedB.invalidLines,
  }
}

function filterCombinationsByExcludedNumbers(combinationText, excludedText) {
  const excludedNumbers = new Set(
    excludedText
      .split(/[,\s]+/)
      .filter((value) => /^\d+$/.test(value))
      .map((value) => value.replace(/^0+(?=\d)/, '')),
  )

  if (excludedNumbers.size === 0) return ''

  return combinationText
    .split(/\r?\n/)
    .filter((line) => {
      const values = line.trim().split(',').map((value) => value.trim())
      if (!line.trim() || values.some((value) => !/^\d+$/.test(value))) return true
      return !values.some((value) => excludedNumbers.has(value.replace(/^0+(?=\d)/, '')))
    })
    .join('\n')
}

export default function Name2NumberPage() {
  const [name, setName] = useState('')
  const [generatedNames, setGeneratedNames] = useState(null)
  const [selectedInitials, setSelectedInitials] = useState('MJ')
  const [combinationList, setCombinationList] = useState('')
  const [excludeFromCombinations, setExcludeFromCombinations] = useState('')
  const [excludedNumbers, setExcludedNumbers] = useState('')
  const [uniqueCombinations, setUniqueCombinations] = useState(null)
  const [invalidCombinationLines, setInvalidCombinationLines] = useState([])
  const [selectedIncluding74Totals, setSelectedIncluding74Totals] = useState([])
  const mobileListA = defaultMobileListA
  const mobileListB = defaultMobileListB
  const [unusedMobileNumbers, setUnusedMobileNumbers] = useState(null)
  const [customListA, setCustomListA] = useState('')
  const [customListB, setCustomListB] = useState('')
  const [unusedCustomNumbers, setUnusedCustomNumbers] = useState(null)
  const combinationRowCount = combinationList.split(/\r?\n/).filter((line) => line.trim()).length
  const excludedRowCount = excludedNumbers.split(/\r?\n/).filter((line) => line.trim()).length
  const results = useMemo(
    () => (generatedNames ?? []).map(getNameResult),
    [generatedNames],
  )
  const validResults = results.filter(({ characterValues }) => characterValues.length > 0)
  const hasInvalidNames = results.some(({ characterValues }) => characterValues.length === 0)
    || (generatedNames !== null && generatedNames.length === 0)
  const uniqueNumbers = uniqueCombinations === null
    ? []
    : [...new Set(uniqueCombinations
      .flatMap((combination) => combination.split(','))
      .map((value) => value.trim().replace(/^0+(?=\d)/, '')))]
      .sort((first, second) => {
        const firstValue = BigInt(first)
        const secondValue = BigInt(second)
        return firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0
      })
  const uniqueCombinationsWithSums = uniqueCombinations?.map((combination) => {
    const digits = combination.match(/\d/g) ?? []
    const digitSum = digits.reduce((sum, digit) => sum + Number(digit), 0)
    return {
      combination,
      digitSum,
      totalWith74: digitSum + 11,
    }
  }) ?? []
  const uniqueIncluding74Totals = [...new Set(
    uniqueCombinationsWithSums.map(({ totalWith74 }) => totalWith74),
  )].sort((first, second) => first - second)
  const selectedCombinations = uniqueCombinationsWithSums.filter(({ totalWith74 }) => (
    selectedIncluding74Totals.includes(String(totalWith74))
  ))

  function findUniqueCombinations(event) {
    event.preventDefault()
    setSelectedIncluding74Totals([])
    const seen = new Set()
    const invalidLines = []
    const combinationsToProcess = excludeFromCombinations.trim()
      ? excludedNumbers
      : combinationList
    const unique = combinationsToProcess
      .split(/\r?\n/)
      .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
      .filter(({ line }) => line)
      .flatMap(({ line, lineNumber }) => {
        const values = line.split(',').map((value) => value.trim())
        if (values.some((value) => !/^\d+$/.test(value))) {
          invalidLines.push(lineNumber)
          return []
        }
        const sortedValues = [...values].sort((first, second) => {
          const firstValue = BigInt(first)
          const secondValue = BigInt(second)
          return firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0
        })
        const key = sortedValues.map((value) => value.replace(/^0+(?=\d)/, '')).join(',')
        if (seen.has(key)) return []
        seen.add(key)
        return [sortedValues.join(', ')]
      })
    setUniqueCombinations(unique)
    setInvalidCombinationLines(invalidLines)
  }

  function findUnusedMobileNumbers() {
    setUnusedMobileNumbers(compareNumberLists(mobileListA, mobileListB))
  }

  function findUnusedCustomNumbers() {
    setUnusedCustomNumbers(compareNumberLists(customListA, customListB))
  }

  function downloadExcel() {
    const style = (id, { background, bold = false, size = 11 }) => (
      `<Style ss:ID="${id}"><Alignment ss:Vertical="Center" ss:WrapText="1"/>`
      + `<Font ss:FontName="Calibri" ss:Size="${size}"${bold ? ' ss:Bold="1"' : ''}/>`
      + (background ? `<Interior ss:Color="${background}" ss:Pattern="Solid"/>` : '')
      + '<Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D8D4C8"/>'
      + '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D8D4C8"/>'
      + '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D8D4C8"/>'
      + '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D8D4C8"/></Borders></Style>'
    )
    const workbookStyles = `<Styles>
      <Style ss:ID="Default"><Alignment ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#26332C"/></Style>
      ${style('Header', { background: '#E9E5D9', bold: true })}
      ${style('Body', { bold: true, size: 12 })}
    </Styles>`
    const headers = ['Name', 'st', 'total', 'name2numb', 'sum', 'bhavam']
    const row = (items, styleId, height) => (
      `<Row ss:AutoFitHeight="0" ss:Height="${height}">${items.map((value) => (
        `<Cell ss:StyleID="${styleId}"><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`
      )).join('')}</Row>`
    )
    const dataRows = validResults.map(({ name: resultName, st, total, name2number, sum }) => (
      row([resultName, st, total, name2number, `${sum}=${total}`, getRasiBhavam(name2number, selectedInitials)], 'Body', 32)
    ))
    const workbook = `<?xml version="1.0"?>
      <?mso-application progid="Excel.Sheet"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
        ${workbookStyles}
        <Worksheet ss:Name="Name2Number">
          <Table>
            <Column ss:Width="120"/><Column ss:Width="60"/><Column ss:Width="70"/><Column ss:Width="140"/><Column ss:Width="230"/><Column ss:Width="100"/>
            ${row(headers, 'Header', 24)}
            ${dataRows.join('')}
          </Table>
        </Worksheet>
      </Workbook>`
    const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `name2number-${new Date().toISOString().slice(0, 10)}.xls`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
  }

  return (
    <section className="name2number-page" aria-labelledby="name2number-title">
      <div className="page-heading">
        <p className="eyebrow"><span>01</span>NAME NUMBER CONVERTER</p>
        <h1 id="name2number-title">name2number</h1>
        <p className="intro-copy">Enter a name to generate its letter values and total.</p>
      </div>

      <form
        className="name2number-form"
        onSubmit={(event) => {
          event.preventDefault()
          setGeneratedNames(name.split(',').map((part) => part.trim()).filter(Boolean))
        }}
      >
        <label className="name2number-field" htmlFor="name2number-input">
          <span>ENTER A NAME</span>
          <input
            id="name2number-input"
            type="text"
            autoComplete="off"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setGeneratedNames(null)
            }}
            placeholder="For example: ANNA or ANNA, MARIA"
            aria-describedby="name2number-help"
          />
          <span id="name2number-help" className="name2number-help">
            Commas separate names; spaces within a name stay together. Other punctuation is ignored.
          </span>
        </label>
        <button className="name2number-button" type="submit" disabled={!name.trim()}>
          Generate
        </button>
        <button
          className="name2number-button name2number-download-button"
          type="button"
          onClick={downloadExcel}
          disabled={validResults.length === 0}
        >
          Download Excel
        </button>
      </form>

      <div id="name2number-output">
        {validResults.length > 0 ? (
          <section className="name2number-result" aria-live="polite" aria-label="Name number result">
            <div className="name2number-result-table-wrap">
              <table className="name2number-result-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">st</th>
                    <th scope="col">total</th>
                    <th scope="col">name2numb</th>
                    <th scope="col">sum</th>
                    <th scope="col">bhavam</th>
                  </tr>
                </thead>
                <tbody>
                  {validResults.map(({ name: resultName, st, total, name2number, sum }, index) => (
                    <tr key={`${resultName}-${index}`}>
                      <td>{resultName}</td>
                      <td>{st}</td>
                      <td>{total}</td>
                      <td>{name2number}</td>
                      <td>{sum}={total}</td>
                      <td>{getRasiBhavam(name2number, selectedInitials)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
        {hasInvalidNames ? (
          <p className="name2number-message" role="alert">
            Each comma-separated name must contain at least one English letter (A–Z) or digit (0–9).
          </p>
        ) : null}

        <label className="combination-profile-select name2number-initials" htmlFor="name2number-initials">
          <span>INITIALS</span>
          <select
            id="name2number-initials"
            value={selectedInitials}
            onChange={(event) => setSelectedInitials(event.target.value)}
          >
            {Object.keys(rasiChartStartingSigns)
              .filter((initials) => initials !== 'SM')
              .map((initials) => (
              <option value={initials} key={initials}>{initials}</option>
              ))}
          </select>
        </label>

        <div className="rasi-chart-layout">
          <RasiChart initials={selectedInitials} />
          <div className="name2number-map-wrap">
            <table className="name2number-map" aria-label="Number-to-letter chart">
              <tbody>
                {letterRows.map(({ digit, letters }) => (
                  <tr key={digit}>
                    <th className={`name2number-map-digit name2number-color-${digit}`} scope="row">
                      {digit}
                    </th>
                    {Array.from({ length: 5 }, (_, index) => (
                      <td
                        className={index < letters.length ? `name2number-color-${digit}` : ''}
                        key={index}
                      >
                        {letters[index] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <section className="name2number-unique-list" aria-labelledby="name2number-unique-list-title">
          <h2 id="name2number-unique-list-title">Find unique list</h2>
          <form className="name2number-unique-form" onSubmit={findUniqueCombinations}>
            <label className="name2number-unique-field" htmlFor="name2number-combinations">
              <span>ENTER NUMBER COMBINATIONS</span>
              <textarea
                id="name2number-combinations"
                value={combinationList}
                onChange={(event) => {
                  const nextCombinationList = event.target.value
                  setCombinationList(nextCombinationList)
                  if (excludeFromCombinations.trim()) {
                    setExcludedNumbers(
                      filterCombinationsByExcludedNumbers(nextCombinationList, excludeFromCombinations),
                    )
                  }
                  setUniqueCombinations(null)
                  setInvalidCombinationLines([])
                  setSelectedIncluding74Totals([])
                }}
                placeholder={'Enter one combination per line, for example:\n15, 11, 35, 25, 5\n15, 11, 35, 25, 5'}
                rows={7}
                spellCheck="false"
                aria-describedby="name2number-combinations-help"
              />
              <span id="name2number-combinations-help" className="name2number-unique-help">
                Values on each line are sorted ascending; duplicate combinations are removed.
              </span>
              <span className={`name2number-row-count${combinationRowCount === 0 ? ' name2number-row-count-empty' : ''}`}>
                {combinationRowCount} {combinationRowCount === 1 ? 'row' : 'rows'}
              </span>
            </label>
            <label
              className="name2number-unique-field name2number-exclude-input-field"
              htmlFor="name2number-exclude-from-combinations"
            >
              <span>Want to exclude from above combinations?</span>
              <input
                id="name2number-exclude-from-combinations"
                type="text"
                value={excludeFromCombinations}
                onChange={(event) => {
                  const nextExcludedValues = event.target.value
                  setExcludeFromCombinations(nextExcludedValues)
                  setExcludedNumbers(
                    filterCombinationsByExcludedNumbers(combinationList, nextExcludedValues),
                  )
                  setUniqueCombinations(null)
                  setInvalidCombinationLines([])
                  setSelectedIncluding74Totals([])
                }}
              />
            </label>
            <label className="name2number-unique-field name2number-excluded-field" htmlFor="name2number-excluded-numbers">
              <span>Excluded numbers</span>
              <textarea
                id="name2number-excluded-numbers"
                value={excludedNumbers}
                onChange={(event) => {
                  setExcludedNumbers(event.target.value)
                  setUniqueCombinations(null)
                  setInvalidCombinationLines([])
                  setSelectedIncluding74Totals([])
                }}
                rows={4}
                spellCheck="false"
              />
              <span className={`name2number-row-count${excludedRowCount === 0 ? ' name2number-row-count-empty' : ''}`}>
                {excludedRowCount} {excludedRowCount === 1 ? 'row' : 'rows'}
              </span>
              {excludeFromCombinations.trim() && excludedRowCount === 0 ? (
                <span className="name2number-empty-exclusions">
                  No combinations remain after excluding these numbers.
                </span>
              ) : null}
            </label>
            <button
              className="name2number-button name2number-find-button"
              type="submit"
              disabled={!combinationList.trim() && !excludedNumbers.trim() && !excludeFromCombinations.trim()}
            >
              Find unique list
            </button>
            {uniqueCombinations !== null ? (
              <div className="name2number-unique-results" aria-live="polite">
                <p>{uniqueCombinations.length} unique {uniqueCombinations.length === 1 ? 'combination' : 'combinations'}</p>
                {invalidCombinationLines.length > 0 ? (
                  <p className="name2number-message" role="alert">
                    Skipped invalid number combinations on lines {invalidCombinationLines.join(', ')}. Use comma-separated whole numbers.
                  </p>
                ) : null}
                {uniqueCombinations.length > 0 ? (
                  <>
                    <div className="name2number-unique-table-wrap">
                      <table className="name2number-unique-table">
                        <thead>
                          <tr>
                            <th scope="col">Combination</th>
                            <th scope="col">Total digit sum</th>
                            <th scope="col">Including 74</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uniqueCombinationsWithSums.map(({ combination, digitSum, totalWith74 }) => (
                            <tr key={combination}>
                              <td>{combination}</td>
                              <td>{digitSum}</td>
                              <td>{totalWith74}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="name2number-unique-number-list" aria-label="Unique numbers">
                      <strong>Unique numbers:</strong> {uniqueNumbers.join(', ')}
                    </p>
                    <div className="name2number-including-74-filter">
                      <span>Filter by “Including 74” total</span>
                      <details
                        className="name2number-including-74-dropdown"
                        aria-describedby="name2number-including-74-help"
                      >
                        <summary>
                          {selectedIncluding74Totals.length > 0
                            ? `${selectedIncluding74Totals.length} total${selectedIncluding74Totals.length === 1 ? '' : 's'} selected`
                            : 'Select totals'}
                        </summary>
                        <div className="name2number-including-74-options" role="group" aria-label="Including 74 totals">
                          {uniqueIncluding74Totals.map((total) => {
                            const value = String(total)
                            const inputId = `name2number-including-74-${value}`
                            return (
                              <label htmlFor={inputId} key={total}>
                                <input
                                  id={inputId}
                                  type="checkbox"
                                  checked={selectedIncluding74Totals.includes(value)}
                                  onChange={(event) => {
                                    setSelectedIncluding74Totals((selected) => (
                                      event.target.checked
                                        ? [...selected, value]
                                        : selected.filter((selectedTotal) => selectedTotal !== value)
                                    ))
                                  }}
                                />
                                {total}
                              </label>
                            )
                          })}
                        </div>
                      </details>
                      <span id="name2number-including-74-help" className="name2number-unique-help">
                        Select one or more totals to show their matching combinations.
                      </span>
                    </div>
                    {selectedIncluding74Totals.length > 0 ? (
                      <div className="name2number-selected-combinations">
                        <p>Selected combinations</p>
                        <div className="name2number-unique-table-wrap">
                          <table className="name2number-unique-table">
                            <thead>
                              <tr><th scope="col">Combination</th></tr>
                            </thead>
                            <tbody>
                              {selectedCombinations.map(({ combination }) => (
                                <tr key={combination}><td>{combination}</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="name2number-message">
                    {excludeFromCombinations.trim() && !excludedNumbers.trim()
                      ? 'No match. Clear or add new data in the “Want to exclude from above combinations?” textbox.'
                      : 'Enter at least one number combination.'}
                  </p>
                )}
              </div>
            ) : null}
          </form>
          <section
            className="name2number-mobile-combinations"
            aria-labelledby="name2number-mobile-combinations-title"
          >
            <h3 id="name2number-mobile-combinations-title">Mobile number combination</h3>
            <div className="name2number-mobile-fields">
              <label className="name2number-unique-field name2number-mobile-field" htmlFor="name2number-mobile-a">
                <span>Second set</span>
                <textarea
                  id="name2number-mobile-a"
                  aria-label="Second set number list"
                  value={mobileListA}
                  readOnly
                  rows={6}
                />
              </label>
              <label className="name2number-unique-field name2number-mobile-field" htmlFor="name2number-mobile-b">
                <span>Third set</span>
                <textarea
                  id="name2number-mobile-b"
                  aria-label="Third set number list"
                  value={mobileListB}
                  readOnly
                  rows={6}
                />
              </label>
            </div>
            <button
              className="name2number-button name2number-unused-button"
              type="button"
              onClick={findUnusedMobileNumbers}
              disabled={!mobileListA.trim() && !mobileListB.trim()}
            >
              Unused numbers
            </button>
            {unusedMobileNumbers ? (
              <>
                {unusedMobileNumbers.invalidA.length > 0 || unusedMobileNumbers.invalidB.length > 0 ? (
                  <p className="name2number-message" role="alert">
                    Invalid entries were skipped
                    {unusedMobileNumbers.invalidA.length > 0
                      ? ` in A on lines ${unusedMobileNumbers.invalidA.join(', ')}` : ''}
                    {unusedMobileNumbers.invalidB.length > 0
                      ? ` in B on lines ${unusedMobileNumbers.invalidB.join(', ')}` : ''}.
                    Use comma-separated whole numbers.
                  </p>
                ) : null}
                <div className="name2number-unused-results" aria-live="polite">
                  <section aria-labelledby="name2number-unused-a-title">
                    <h4 id="name2number-unused-a-title">Unused A (not in B)</h4>
                    <p>{unusedMobileNumbers.unusedA.length > 0
                      ? unusedMobileNumbers.unusedA.join(', ')
                      : 'None'}</p>
                  </section>
                  <section aria-labelledby="name2number-unused-b-title">
                    <h4 id="name2number-unused-b-title">Unused B (not in A)</h4>
                    <p>{unusedMobileNumbers.unusedB.length > 0
                      ? unusedMobileNumbers.unusedB.join(', ')
                      : 'None'}</p>
                  </section>
                </div>
              </>
            ) : null}
            <div className="name2number-mobile-fields name2number-custom-fields">
              <label className="name2number-unique-field name2number-mobile-field" htmlFor="name2number-custom-a">
                <span>Input A</span>
                <textarea
                  id="name2number-custom-a"
                  aria-label="Custom input A number list"
                  value={customListA}
                  onChange={(event) => {
                    setCustomListA(event.target.value)
                    setUnusedCustomNumbers(null)
                  }}
                  placeholder="Enter numbers for input A"
                  rows={6}
                />
              </label>
              <label className="name2number-unique-field name2number-mobile-field" htmlFor="name2number-custom-b">
                <span>Input B</span>
                <textarea
                  id="name2number-custom-b"
                  aria-label="Custom input B number list"
                  value={customListB}
                  onChange={(event) => {
                    setCustomListB(event.target.value)
                    setUnusedCustomNumbers(null)
                  }}
                  placeholder="Enter numbers for input B"
                  rows={6}
                />
              </label>
            </div>
            <button
              className="name2number-button name2number-unused-button"
              type="button"
              onClick={findUnusedCustomNumbers}
              disabled={!customListA.trim() && !customListB.trim()}
            >
              Custom unused numbers
            </button>
            {unusedCustomNumbers ? (
              <>
                {unusedCustomNumbers.invalidA.length > 0 || unusedCustomNumbers.invalidB.length > 0 ? (
                  <p className="name2number-message" role="alert">
                    Invalid entries were skipped
                    {unusedCustomNumbers.invalidA.length > 0
                      ? ` in Input A on lines ${unusedCustomNumbers.invalidA.join(', ')}` : ''}
                    {unusedCustomNumbers.invalidB.length > 0
                      ? ` in Input B on lines ${unusedCustomNumbers.invalidB.join(', ')}` : ''}.
                    Use comma-separated whole numbers.
                  </p>
                ) : null}
                <div className="name2number-unused-results" aria-live="polite">
                  <section aria-labelledby="name2number-custom-unused-a-title">
                    <h4 id="name2number-custom-unused-a-title">Unused Input A (not in Input B)</h4>
                    <p>{unusedCustomNumbers.unusedA.length > 0
                      ? unusedCustomNumbers.unusedA.join(', ')
                      : 'None'}</p>
                  </section>
                  <section aria-labelledby="name2number-custom-unused-b-title">
                    <h4 id="name2number-custom-unused-b-title">Unused Input B (not in Input A)</h4>
                    <p>{unusedCustomNumbers.unusedB.length > 0
                      ? unusedCustomNumbers.unusedB.join(', ')
                      : 'None'}</p>
                  </section>
                </div>
              </>
            ) : null}
          </section>
        </section>
      </div>
    </section>
  )
}
