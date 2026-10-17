import { useState } from 'react'
import './App.css'
import EmailGeneratorOption, { EmailGeneratorResults } from './EmailGeneratorOption'
import ManithaNaadiDogNameGenerator from './ManithaNaadiDogNameGenerator'
import ManithaNaadiGen8Generator from './ManithaNaadiGen8Generator'
import ManithaNaadiPasswordGenerator from './ManithaNaadiPasswordGenerator'
import PanjaPatchiPage from './PanjaPatchiPage'
import Name2NumberPage from './Name2NumberPage'
import PasswordPage from './PasswordPage'
import { carRegLetterValues } from './numerologyLetterValues'
import RasiChart from './RasiChart'
import {
  rasiChartClockwiseOrder,
  rasiChartSigns,
  rasiChartStartingSigns,
} from './rasiChartData'

const manithaNaadiLuckyNumberDefaults = {
  MJ: '20, 41, 45, 54, 56, 64, 66, 68, 74, 85, 92, 32, 14',
  MA: '06, 16, 33, 42, 51, 52, 73, 79, 84, 85, 87, 88, 93, 97, 99, 92, 54',
  M: '10, 14, 20, 32, 45, 54, 56, 64, 74, 80, 89, 92, 95, 68, 41, 04, 08',
}
const manithaNaadiGen5NumerologistNumbers = {
  MA: new Set(['73887', '99887', '42887', '51887', '73797', '99797']),
  M: new Set(['68685', '95685', '89664', '32414', '29414', '89414']),
  MJ: new Set(['20297', '74297', '92297', '29297', '68297']),
}
const manithaNaadiGen6NumerologistNumbers = {
  MA: new Set([
    '163352', '335216', '521633', '737988', '798873', '887379', '848499', '849984',
    '998484', '999752', '975299', '529997', '737342', '734273', '427373', '939399',
    '939993', '999393', '858542', '854285', '428585', '878787', '999999',
  ]),
  M: new Set([
    '142610', '261014', '101426', '686841', '684168', '416868', '322041', '204132',
    '413220', '146868', '686814', '681468', '808089', '808980', '898080', '102029',
    '202910', '291020', '898989', '959595',
  ]),
  MJ: new Set([
    '102029', '202910', '291020', '455456', '545645', '564554', '647492', '749264',
    '926474', '416645', '664541', '454166', '204141', '414120', '412041', '292929',
    '565656', '747474', '929292',
  ]),
}
const manithaNaadiGen4NumerologistNumbers = {
  MA: new Set([
    '1616', '3333', '4242', '5151', '5252', '7373', '7979', '8888', '9797', '8585',
    '1652', '5216', '7342', '4273', '8799', '9987', '7333', '3373', '8833', '3388',
    '7988', '8879', '9788', '8897',
  ]),
  M: new Set([
    '1414', '3232', '4141', '6668', '6866', '8080', '1010', '2020', '2929', '1432',
    '3214', '4114', '1441', '2080', '8020', '2680', '8026', '9566', '6695', '1429',
    '2914', '4129', '2941', '3241', '4132',
  ]),
  MJ: new Set([
    '2020', '4556', '5645', '5456', '5654', '6464', '7474', '9092', '9290', '4141',
    '6668', '6866', '7492', '9274',
  ]),
}
function calculateGen4Matches(values, expectedValue, excludedPairs = new Set()) {
  const entries = [...new Set(values
    .split(/[\s,]+/)
    .filter((entry) => /^\d{2}$/.test(entry))
    .filter((entry) => !excludedPairs.has(entry)))]
  const expectedTargets = new Set(expectedValue
    .split(/[\s,]+/)
    .filter((entry) => /^\d{2}$/.test(entry))
    .map(Number))
  const matches = []
  const repeatedMatches = []

  for (const firstValue of entries) {
    for (const secondValue of entries) {
      const total = sumDigits(firstValue) + sumDigits(secondValue)
      const reducedTotal = total > 99 ? total % 100 : total
      if (!expectedTargets.has(reducedTotal)) continue

      const combination = {
        values: [firstValue, secondValue],
        total,
        reducedTotal,
        isMatch: true,
      }
      if (firstValue === secondValue) repeatedMatches.push(combination)
      else matches.push(combination)
    }
  }

  return {
    matches,
    nonMatches: [],
    repeatedMatches,
    combinationsChecked: entries.length * (entries.length - 1),
    possibleCombinationsWithRepetition: entries.length ** 2,
  }
}

function calculateGen5Matches(values, expectedValue) {
  const entries = [...new Set(values
    .split(/[\s,]+/)
    .filter((entry) => /^\d{2}$/.test(entry)))]
  const expectedValues = new Set(expectedValue
    .split(/[\s,]+/)
    .filter((entry) => /^\d{2}$/.test(entry)))
  const expectedTotals = new Set([...expectedValues].map(Number))
  const matches = []
  const repeatedMatches = []
  const selectedValues = []

  function visit(startIndex, allowRepeats) {
    if (selectedValues.length === 3) {
      const number = `${selectedValues[0]}${selectedValues[1]}${selectedValues[2][1]}`
      const checks = [number.slice(0, 2), number.slice(2, 4), number.slice(3, 5)]
      const digitSum = sumDigits(number)
      if (!checks.every((value) => expectedValues.has(value) && expectedTotals.has(digitSum))) return

      const combination = { values: [...selectedValues], number, checks, digitSum }
      if (allowRepeats) {
        if (new Set(selectedValues).size < selectedValues.length) repeatedMatches.push(combination)
      } else {
        matches.push(combination)
      }
      return
    }

    const lastIndex = allowRepeats ? entries.length - 1 : entries.length - (3 - selectedValues.length)
    for (let index = startIndex; index <= lastIndex; index += 1) {
      selectedValues.push(entries[index])
      visit(allowRepeats ? index : index + 1, allowRepeats)
      selectedValues.pop()
    }
  }

  visit(0, false)
  visit(0, true)

  const entryCount = entries.length
  return {
    matches,
    repeatedMatches,
    nonMatches: [],
    combinationsChecked: entryCount < 3 ? 0 : entryCount * (entryCount - 1) * (entryCount - 2) / 6,
    possibleCombinationsWithRepetition: countCombinationsWithRepetition(entryCount, 3),
  }
}

const carRegNumberChart = [
  { value: 1, letters: ['A', 'I', 'J', 'Y', 'Q'] },
  { value: 2, letters: ['B', 'K', 'R', '', ''] },
  { value: 3, letters: ['C', 'G', 'L', 'S', ''] },
  { value: 4, letters: ['D', 'M', 'T', '', ''] },
  { value: 5, letters: ['E', 'H', 'N', 'X', ''] },
  { value: 6, letters: ['U', 'V', 'W', '', ''] },
  { value: 7, letters: ['Z', 'O', '', '', ''] },
  { value: 8, letters: ['F', 'P', '', '', ''] },
]

function generateManithaNaadiCarRegistrations(luckyNumbers, rasiChartNumbersByPair, perBhavamLimit = 10) {
  const luckyPairs = parseEntries(luckyNumbers, true)
  const allowedValues = new Set(luckyPairs)
  const allowedDigitSums = new Set(luckyPairs.map(Number))
  const alphabet = [...new Set(carRegNumberChart.flatMap((row) => row.letters).filter(Boolean))]
  const letterDigitValues = new Map(carRegLetterValues)
  const digitValue = (digit) => digit === '0' ? 6 : Number(digit)
  const possibleCount = luckyPairs.length * alphabet.length ** 4
  const matchesByBhavam = new Map()
  let combinationsChecked = 0

  for (const digitSum of allowedDigitSums) {
    const digitSumKey = String(digitSum).padStart(2, '0')
    const digitBhavam = rasiChartNumbersByPair.get(digitSumKey)
    if (!digitBhavam) continue

    const bhavamKey = digitBhavam.join('/')
    const group = matchesByBhavam.get(bhavamKey) ?? []

    for (const pair of luckyPairs) {
      if (group.length >= perBhavamLimit) break

      const firstDigitValue = digitValue(pair[0])
      const secondDigitValue = digitValue(pair[1])
      const firstLetters = alphabet.filter((letter) => allowedValues.has(
        `${letterDigitValues.get(letter)}${firstDigitValue}`,
      ))
      const secondLetters = alphabet.filter((letter) => allowedValues.has(
        `${secondDigitValue}${letterDigitValues.get(letter)}`,
      ))

      for (const firstLetter of firstLetters) {
        for (const secondLetter of secondLetters) {
          for (const thirdLetter of alphabet) {
            for (const fourthLetter of alphabet) {
              if (group.length >= perBhavamLimit) break
              const thirdCheck = `${letterDigitValues.get(thirdLetter)}${letterDigitValues.get(fourthLetter)}`
              if (!allowedValues.has(thirdCheck)) continue

              const checks = [
                `${letterDigitValues.get(firstLetter)}${firstDigitValue}`,
                `${secondDigitValue}${letterDigitValues.get(secondLetter)}`,
                thirdCheck,
              ]
              if (!checks.every((check) => allowedValues.has(check))) continue

              const digitSumValues = [
                letterDigitValues.get(firstLetter),
                firstDigitValue,
                secondDigitValue,
                letterDigitValues.get(secondLetter),
                letterDigitValues.get(thirdLetter),
                letterDigitValues.get(fourthLetter),
              ]
              const candidateDigitSum = digitSumValues.reduce((sum, value) => sum + value, 0)
              combinationsChecked += 1
              if (candidateDigitSum !== digitSum || !allowedDigitSums.has(candidateDigitSum)) continue

              const letters = [firstLetter, secondLetter, thirdLetter, fourthLetter]
              group.push({
                pair,
                letters,
                checks,
                registration: `${firstLetter}${pair}${letters.slice(1).join('')}`,
                digitSum: candidateDigitSum,
                digitSumCalculation: `${digitSumValues.join(' + ')} = ${candidateDigitSum}`,
              })
            }
          }
        }
      }
    }

    if (group.length > 0) matchesByBhavam.set(bhavamKey, group)
  }

  const bhavamGroups = [...matchesByBhavam.values()]
  const matches = []
  let groupIndex = 0
  const totalLimit = perBhavamLimit * 12
  while (matches.length < totalLimit && bhavamGroups.some((group) => group.length > 0)) {
    const group = bhavamGroups[groupIndex % bhavamGroups.length]
    if (group.length > 0) matches.push(group.shift())
    groupIndex += 1
  }

  return {
    matches,
    repeatedMatches: [],
    nonMatches: [],
    combinationsChecked,
    possibleCombinationsWithRepetition: possibleCount,
  }
}

function parseEntries(value, keepPairs = false) {
  if (value === null || value === undefined || value === '') return []
  return String(value)
    .split(/[\s,]+/)
    .filter(Boolean)
    .filter((entry) => (
      keepPairs ? /^\d{2}$/.test(entry) : /^\d{1,2}$/.test(entry)
    ))
}

function sumDigits(value) {
  return String(value)
    .replace(/\D/g, '')
    .split('')
    .reduce((total, digit) => total + Number(digit || 0), 0)
}

function countCombinationsWithRepetition(count, length) {
  if (count <= 0 || length <= 0) return 0
  let total = 1
  for (let index = 1; index <= length; index += 1) {
    total = total * (count + index - 1) / index
  }
  return Math.floor(total)
}

const manithaNaadiTableHeaders = ['Initials', 'Pair values', 'Number', 'Digit sum', 'Rasi chart', 'Bhavam']
function calculateCombinationMatches(values, expectedValue, pairCount = 2, allowRepeats = false, matchByDigitSum = false) {
  const entries = [...new Set(parseEntries(values, true))]
  const expectedTotals = new Set(parseEntries(expectedValue, true).map(Number))
  const matches = []
  const repeatedMatches = []

  if (pairCount < 2 || entries.length === 0) {
    return {
      matches,
      repeatedMatches,
      nonMatches: [],
      combinationsChecked: 0,
      possibleCombinationsWithRepetition: 0,
    }
  }

  function collect(selected) {
    if (selected.length === pairCount) {
      const number = selected.join('')
      const total = matchByDigitSum
        ? sumDigits(number)
        : selected.reduce((sum, value) => sum + Number(value), 0)
      const combination = {
        values: [...selected],
        number,
        total,
        reducedTotal: total > 99 ? total % 100 : total,
        isMatch: expectedTotals.has(total),
      }
      if (combination.isMatch) {
        if (allowRepeats && new Set(selected).size < selected.length) repeatedMatches.push(combination)
        else matches.push(combination)
      }
      return
    }

    for (const entry of entries) {
      selected.push(entry)
      collect(selected)
      selected.pop()
    }
  }

  collect([])

  return {
    matches,
    repeatedMatches,
    nonMatches: [],
    combinationsChecked: matches.length + repeatedMatches.length,
    possibleCombinationsWithRepetition: countCombinationsWithRepetition(entries.length, pairCount),
  }
}

function calculateManithaNaadiMobileMatches(profile, luckyNumbers, rasiChartNumbersByPair, include85 = true) {
  const luckyPairs = [...new Set(parseEntries(luckyNumbers, true))]
  const allowedValues = new Set(luckyPairs)
  const matches = []
  let combinationsChecked = 0
  const selectedPairs = []

  function generatePairCombinations() {
    if (selectedPairs.length === 4) {
      combinationsChecked += 1
      const number = `074${selectedPairs.join('')}`
      if (profile === 'MJ' && !include85 && number.includes('85')) return
      const total = sumDigits(number)
      if (!allowedValues.has(String(total).padStart(2, '0'))) return

      matches.push({
        number,
        values: [...selectedPairs],
        total,
        reducedTotal: total,
        rasi: rasiChartNumbersByPair.get(String(total).padStart(2, '0'))?.join('/') ?? '—',
        profile,
      })
      return
    }

    for (const pair of luckyPairs) {
      if (selectedPairs.includes(pair)) continue
      selectedPairs.push(pair)
      generatePairCombinations()
      selectedPairs.pop()
    }
  }

  generatePairCombinations()

  return {
    matches,
    repeatedMatches: [],
    nonMatches: [],
    combinationsChecked,
    possibleCombinationsWithRepetition: luckyPairs.length ** 4,
  }
}

function App() {
  const [activePage, setActivePage] = useState('manitha-naadi')
  const [selectedManithaNaadiInitials, setSelectedManithaNaadiInitials] = useState('MJ')
  const [manithaNaadiLuckyNumbers, setManithaNaadiLuckyNumbers] = useState(
    () => ({ ...manithaNaadiLuckyNumberDefaults }),
  )
  const [manithaNaadiGen8ExcludedNumbers, setManithaNaadiGen8ExcludedNumbers] = useState(
    () => Object.fromEntries(Object.keys(manithaNaadiLuckyNumberDefaults).map((initials) => [initials, ''])),
  )
  const [manithaNaadiCombinationResults, setManithaNaadiCombinationResults] = useState(null)
  const [manithaNaadiEmailResults, setManithaNaadiEmailResults] = useState(null)
  const [activeManithaNaadiGenerator, setActiveManithaNaadiGenerator] = useState(null)
  const [manithaNaadiDigitSumFilter, setManithaNaadiDigitSumFilter] = useState('')
  const [includeMjMobile85, setIncludeMjMobile85] = useState(true)
  function exportManithaNaadiResults() {
    const xmlEscape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    })[character])
    const style = (id, { background, color, bold = false, alignment = 'Left', size = 11 }) => (
      `<Style ss:ID="${id}" ss:Parent="Default"><Alignment ss:Horizontal="${alignment}" ss:Vertical="Center"/>`
      + `<Font ss:FontName="Calibri" ss:Size="${size}" ss:Color="${color}"${bold ? ' ss:Bold="1"' : ''}/>`
      + (background ? `<Interior ss:Color="${background}" ss:Pattern="Solid"/>` : '')
      + '<Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D8D4C8"/></Borders></Style>'
    )
    const workbookStyles = `<Styles>
      <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="10" ss:Color="#26332C"/><Interior ss:Color="#F4F1E8" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D8D4C8"/></Borders></Style>
      ${style('HeaderLeft', { background: '#E9E5D9', color: '#74776C', bold: true, size: 9 })}
      ${style('HeaderRight', { background: '#E9E5D9', color: '#74776C', bold: true, alignment: 'Right', size: 9 })}
      ${style('BodyLeft', { color: '#26332C' })}
      ${style('BodyRight', { color: '#26332C', alignment: 'Right' })}
      ${style('BodyBoldLeft', { color: '#26332C', bold: true })}
      ${style('BodyBoldRight', { color: '#26332C', bold: true, alignment: 'Right' })}
      ${style('HighlightLeft', { background: '#DDEFE3', color: '#26332C' })}
      ${style('HighlightRight', { background: '#DDEFE3', color: '#26332C', alignment: 'Right' })}
      ${style('HighlightBoldLeft', { background: '#DDEFE3', color: '#26332C', bold: true })}
      ${style('HighlightBoldRight', { background: '#DDEFE3', color: '#26332C', bold: true, alignment: 'Right' })}
      ${style('HighlightPairLeft', { background: '#DDEFE3', color: '#1D6B43', bold: true })}
      ${style('HighlightPairRight', { background: '#DDEFE3', color: '#1D6B43', bold: true, alignment: 'Right' })}
      ${style('CarBoldLeft', { color: '#26332C', bold: true })}
      ${style('CarBoldRight', { color: '#26332C', bold: true, alignment: 'Right' })}
    </Styles>`
    const isCarRegistration = manithaNaadiCombinationResults.generator === 'GEN-CAR-REG'
    const exportRows = isCarRegistration
      ? [
        ['Initials', 'Lucky pair', 'Registration', 'Pair checks', 'Digit sum calculation', 'Digit sum', 'Digit Bhavam'],
        ...manithaNaadiCombinationResults.matches.map((match) => [
          manithaNaadiCombinationResults.profile,
          match.pair,
          match.registration,
          match.checks.join(', '),
          match.digitSumCalculation,
          match.digitSum,
          rasiChartNumbersByPair.get(String(match.digitSum).padStart(2, '0'))?.join('/') ?? '—',
        ]),
      ]
      : [manithaNaadiTableHeaders, ...getManithaNaadiTableRows()]
    const highlightedNumbers = manithaNaadiCombinationResults.generator === 'GEN-4'
      ? manithaNaadiGen4NumerologistNumbers[manithaNaadiCombinationResults.profile]
      : manithaNaadiCombinationResults.generator === 'GEN-5'
        ? manithaNaadiGen5NumerologistNumbers[manithaNaadiCombinationResults.profile]
        : manithaNaadiCombinationResults.generator === 'GEN-6'
          ? manithaNaadiGen6NumerologistNumbers[manithaNaadiCombinationResults.profile]
          : null
    const headerRow = exportRows[0].map((value, index) => {
      const isRightAligned = (isCarRegistration ? [1, 5] : [1, 2, 3, 5]).includes(index)
      return `<Cell ss:StyleID="${isRightAligned ? 'HeaderRight' : 'HeaderLeft'}"><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`
    }).join('')
    const dataRows = exportRows.slice(1).map((row) => {
      const isHighlighted = !isCarRegistration && highlightedNumbers?.has(row[2])
      const cells = row.map((value, index) => {
        const isRightAligned = (isCarRegistration ? [1, 5] : [1, 2, 3, 5]).includes(index)
        const isBold = isCarRegistration
          ? index === 2 || index === 6
          : index === 4 || index === 5 || (isHighlighted && [1, 2].includes(index))
        const styleId = isHighlighted
          ? [1, 2].includes(index)
            ? 'HighlightPair'
            : isBold ? 'HighlightBold' : 'Highlight'
          : isCarRegistration
            ? isBold ? 'CarBold' : 'Body'
            : isBold ? 'BodyBold' : 'Body'
        const alignment = isRightAligned ? 'Right' : 'Left'
        return `<Cell ss:StyleID="${styleId}${alignment}"><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`
      }).join('')
      return `<Row>${cells}</Row>`
    })
    const workbook = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${workbookStyles}<Worksheet ss:Name="${manithaNaadiCombinationResults.generator}"><Table><Row>${headerRow}</Row>${dataRows.join('')}</Table></Worksheet></Workbook>`
    const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `manitha-naadi-${manithaNaadiCombinationResults.generator.toLowerCase()}-${manithaNaadiCombinationResults.profile}-${new Date().toISOString().slice(0, 10)}.xls`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
  }

  const chartStartIndex = rasiChartClockwiseOrder.indexOf(rasiChartStartingSigns[selectedManithaNaadiInitials])
  const rasiChartBadgeNumbers = new Map(rasiChartClockwiseOrder.map((sign, index) => [
    sign,
    (index - chartStartIndex + rasiChartClockwiseOrder.length) % rasiChartClockwiseOrder.length + 1,
  ]))
  const rasiChartNumbersByPair = new Map()
  for (const sign of rasiChartSigns) {
    for (const pair of sign.values) {
      const signNumbers = rasiChartNumbersByPair.get(pair) ?? []
      signNumbers.push(rasiChartBadgeNumbers.get(sign.name))
      rasiChartNumbersByPair.set(pair, signNumbers)
    }
  }
  function getManithaNaadiTableRows() {
    if (!manithaNaadiCombinationResults) return []

    const isGen5 = manithaNaadiCombinationResults.generator === 'GEN-5'
    const isMobile = manithaNaadiCombinationResults.generator === 'GEN-MOBILE-NUMBERS'
    const isDigitSumGenerator = ['GEN-6', 'GEN-8'].includes(manithaNaadiCombinationResults.generator)
    const combinations = isGen5
      ? manithaNaadiCombinationResults.matches
      : [
        ...manithaNaadiCombinationResults.matches,
        ...manithaNaadiCombinationResults.repeatedMatches,
      ]

    return combinations.map((combination) => {
      const values = isGen5 ? combination.checks : combination.values
      const number = combination.number ?? values.join('')
      const digitSum = isGen5
        ? combination.digitSum
        : isDigitSumGenerator ? sumDigits(number) : combination.total
      const sumLookup = isGen5 ? combination.digitSum : isMobile ? combination.total : combination.reducedTotal

      return [
        manithaNaadiCombinationResults.profile,
        values.join(', '),
        number,
        digitSum,
        values.map((value) => rasiChartNumbersByPair.get(value)?.join('/') ?? '—').join('-'),
        rasiChartNumbersByPair.get(String(sumLookup).padStart(2, '0'))?.join('/') ?? '—',
      ]
    })
  }
  const manithaNaadiTableRows = getManithaNaadiTableRows()
  const visibleManithaNaadiTableRows = manithaNaadiDigitSumFilter.trim()
    ? manithaNaadiTableRows.filter((row) => String(row[3]) === manithaNaadiDigitSumFilter.trim())
    : manithaNaadiTableRows
  const generatedNumberSet = new Set(manithaNaadiCombinationResults?.generatedNumbers ?? [])
  const uniqueGeneratedCombinations = [...new Set(
    visibleManithaNaadiTableRows
      .filter((row) => generatedNumberSet.has(row[2]))
      .map((row) => row[1]
        .split(',')
        .map((pair) => pair.trim())
        .sort((first, second) => Number(first) - Number(second))
        .join(', ')),
  )]

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Number Signal home" onClick={() => setActivePage('manitha-naadi')}>
          <span className="wordmark-mark" aria-hidden="true">n.</span>
          <span>NUMBER<span className="wordmark-light">SIGNAL</span></span>
        </a>
        <span className="privacy-note"><span className="privacy-dot" />LOCAL EDITOR</span>
        <nav className="page-switches" aria-label="App pages">
          <button
            className={`page-switch${activePage === 'manitha-naadi' ? ' page-switch-active' : ''}`}
            type="button"
            aria-pressed={activePage === 'manitha-naadi'}
            onClick={() => setActivePage('manitha-naadi')}
          >
            மனித நாடி
          </button>
          <button
            className={`page-switch${activePage === 'password' ? ' page-switch-active' : ''}`}
            type="button"
            aria-pressed={activePage === 'password'}
            onClick={() => setActivePage('password')}
          >
            Password
          </button>
          <button
            className={`page-switch${activePage === 'panja-patchi' ? ' page-switch-active' : ''}`}
            type="button"
            aria-pressed={activePage === 'panja-patchi'}
            onClick={() => setActivePage('panja-patchi')}
          >
            பஞ்ச பட்சி
          </button>
          <button
            className={`page-switch${activePage === 'name2number' ? ' page-switch-active' : ''}`}
            type="button"
            aria-pressed={activePage === 'name2number'}
            onClick={() => setActivePage('name2number')}
          >
            name2number
          </button>
        </nav>
      </header>
      <section className="workspace" id="top">
        {activePage === 'manitha-naadi' ? (
          <section className="matching-numbers-page" aria-labelledby="manitha-naadi-title">
            <div className="page-heading">
              <h1 id="manitha-naadi-title">மனித நாடி <em>lucky numbers</em></h1>
            </div>
            <label className="combination-profile-select" htmlFor="manitha-naadi-initials">
              <span>INITIALS</span>
              <select
                id="manitha-naadi-initials"
                value={selectedManithaNaadiInitials}
                onChange={(event) => setSelectedManithaNaadiInitials(event.target.value)}
              >
                {Object.keys(manithaNaadiLuckyNumberDefaults).map((initials) => (
                  <option value={initials} key={initials}>{initials}</option>
                ))}
              </select>
            </label>
            <div className="column-field matching-phone-field">
              <span className="column-title">LUCKY NUMBERS · {selectedManithaNaadiInitials}</span>
              <textarea
                id="manitha-naadi-lucky-numbers"
                aria-label={`Lucky numbers · ${selectedManithaNaadiInitials}`}
                value={manithaNaadiLuckyNumbers[selectedManithaNaadiInitials]}
                onChange={(event) => setManithaNaadiLuckyNumbers((currentValues) => ({
                  ...currentValues,
                  [selectedManithaNaadiInitials]: event.target.value,
                }))}
                rows={4}
                spellCheck="false"
              />
              <label className="gen8-exclude-field" htmlFor="gen8-exclude-numbers">
                <span>Exclude from lucky numbers</span>
                <input
                  id="gen8-exclude-numbers"
                  type="text"
                  value={manithaNaadiGen8ExcludedNumbers[selectedManithaNaadiInitials]}
                  onChange={(event) => setManithaNaadiGen8ExcludedNumbers((currentValues) => ({
                    ...currentValues,
                    [selectedManithaNaadiInitials]: event.target.value,
                  }))}
                  autoComplete="off"
                  spellCheck="false"
                />
              </label>
            </div>
            <div className="rasi-chart-layout">
              <RasiChart initials={selectedManithaNaadiInitials} />
              <div className="car-reg-chart-wrap">
                <table className="car-reg-chart" aria-label="Number to letter chart">
                  <tbody>
                    {carRegNumberChart.map((row) => (
                      <tr className={`car-reg-chart-row car-reg-chart-row-${row.value}`} key={row.value}>
                        <th scope="row">{row.value}</th>
                        {Array.from({ length: 5 }, (_, index) => (
                          <td key={index}>{row.letters[index] ?? ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="combination-generate">
              <span className="column-selection-label">GENERATE COMBINATIONS (MOBILE STARTS 074; EVERY PAIR AND THE DIGIT TOTAL MUST MATCH LUCKY NUMBERS)</span>
              <div className="combination-generate-buttons">
                {['GEN-4', 'GEN-5', 'GEN-6', 'GEN-8', 'GEN-MOBILE-NUMBERS', 'GEN-CAR-REG', 'GEN-PASSWORD', 'GEN-EMAIL', 'GEN-DOG-NAMES'].map((generator) => (
                  generator === 'GEN-8' ? (
                    <ManithaNaadiGen8Generator
                      key={generator}
                      luckyNumbers={manithaNaadiLuckyNumbers[selectedManithaNaadiInitials]}
                      excludedNumbers={manithaNaadiGen8ExcludedNumbers[selectedManithaNaadiInitials]}
                      activeGenerator={activeManithaNaadiGenerator}
                      onGenerate={(generatorResults) => {
                        setActiveManithaNaadiGenerator('GEN-8')
                        setManithaNaadiEmailResults(null)
                        setManithaNaadiCombinationResults({
                          generator: 'GEN-8',
                          profile: selectedManithaNaadiInitials,
                          generatedNumbers: [...new Set(
                            [...generatorResults.matches, ...generatorResults.repeatedMatches]
                              .map((result) => result.number ?? result.values.join('')),
                          )],
                          ...generatorResults,
                        })
                      }}
                    />
                  ) : generator === 'GEN-DOG-NAMES' ? (
                    <ManithaNaadiDogNameGenerator
                      key={generator}
                      activeGenerator={activeManithaNaadiGenerator}
                      onGenerate={() => {
                        setActiveManithaNaadiGenerator('GEN-DOG-NAMES')
                        setManithaNaadiEmailResults(null)
                        setManithaNaadiCombinationResults(null)
                      }}
                    />
                  ) : generator === 'GEN-PASSWORD' ? (
                    <ManithaNaadiPasswordGenerator
                      key={`GEN-PASSWORD-${selectedManithaNaadiInitials}`}
                      initials={selectedManithaNaadiInitials}
                      luckyNumbers={manithaNaadiLuckyNumbers[selectedManithaNaadiInitials]}
                      rasiChartNumbersByPair={rasiChartNumbersByPair}
                      activeGenerator={activeManithaNaadiGenerator}
                      onGenerate={() => {
                        setActiveManithaNaadiGenerator('GEN-PASSWORD')
                        setManithaNaadiEmailResults(null)
                        setManithaNaadiCombinationResults(null)
                      }}
                    />
                  ) : generator === 'GEN-EMAIL' ? (
                    <EmailGeneratorOption
                      key={`GEN-EMAIL-${selectedManithaNaadiInitials}`}
                      initials={selectedManithaNaadiInitials}
                      luckyNumbers={manithaNaadiLuckyNumbers[selectedManithaNaadiInitials]}
                      onGenerate={(results, includeGmailInTotal) => {
                        setActiveManithaNaadiGenerator('GEN-EMAIL')
                        setManithaNaadiCombinationResults(null)
                        setManithaNaadiEmailResults({
                          ...results,
                          initials: selectedManithaNaadiInitials,
                          includeGmailInTotal,
                        })
                      }}
                      onClear={() => setManithaNaadiEmailResults(null)}
                    />
                  ) : (
                    <div
                      key={generator}
                      className={generator === 'GEN-MOBILE-NUMBERS'
                        ? 'mobile-number-generator-option'
                        : 'combination-generator-option'}
                    >
                    <button
                      className={`combination-generate-button${manithaNaadiCombinationResults?.generator === generator ? ' combination-generate-button-active' : ''}`}
                      type="button"
                      aria-label={generator === 'GEN-MOBILE-NUMBERS'
                        ? 'Generate UK mobile numbers'
                        : generator === 'GEN-CAR-REG'
                          ? 'Generate car registrations'
                          : generator === 'GEN-5' ? 'Run GEN-5 three-pair checks' : `Run ${generator} with ${generator === 'GEN-6' ? 'three' : 'two'} values`}
                      title={generator === 'GEN-MOBILE-NUMBERS'
                        ? 'Generate UK mobile numbers from the selected initials lucky pairs'
                        : generator === 'GEN-CAR-REG'
                          ? 'Generate car registrations from the selected initials lucky numbers'
                          : generator === 'GEN-5' ? 'Generate three-pair checks' : `Generate sums from ${generator === 'GEN-6' ? 'three' : 'two'} values`}
                      onClick={() => {
                        setActiveManithaNaadiGenerator(generator)
                        setManithaNaadiEmailResults(null)
                        const luckyNumbers = manithaNaadiLuckyNumbers[selectedManithaNaadiInitials]
                        const excludedNumbers = new Set(parseEntries(
                          manithaNaadiGen8ExcludedNumbers[selectedManithaNaadiInitials],
                          true,
                        ))
                        const calculationLuckyNumbers = parseEntries(luckyNumbers, true)
                          .filter((number) => !excludedNumbers.has(number))
                          .join(', ')
                        const generatorResults = generator === 'GEN-5'
                          ? calculateGen5Matches(calculationLuckyNumbers, calculationLuckyNumbers)
                          : generator === 'GEN-MOBILE-NUMBERS'
                            ? calculateManithaNaadiMobileMatches(
                              selectedManithaNaadiInitials,
                              luckyNumbers,
                              rasiChartNumbersByPair,
                              includeMjMobile85,
                            )
                            : generator === 'GEN-CAR-REG'
                              ? generateManithaNaadiCarRegistrations(luckyNumbers, rasiChartNumbersByPair)
                              : generator === 'GEN-4'
                                ? calculateGen4Matches(
                                  calculationLuckyNumbers,
                                  calculationLuckyNumbers,
                                )
                                : calculateCombinationMatches(
                                  calculationLuckyNumbers,
                                  calculationLuckyNumbers,
                                  generator === 'GEN-6' ? 3 : 2,
                                  true,
                                  generator === 'GEN-6',
                                )
                        generatorResults.generatedNumbers = [...new Set(
                          [...generatorResults.matches, ...generatorResults.repeatedMatches]
                            .map((result) => result.number ?? result.values.join('')),
                        )]
                        const suppliedNumbers = generator === 'GEN-4'
                          ? manithaNaadiGen4NumerologistNumbers[selectedManithaNaadiInitials]
                          : generator === 'GEN-5'
                            ? manithaNaadiGen5NumerologistNumbers[selectedManithaNaadiInitials]
                            : generator === 'GEN-6'
                              ? manithaNaadiGen6NumerologistNumbers[selectedManithaNaadiInitials]
                              : null
                        if (suppliedNumbers) {
                          const pairCount = generator === 'GEN-4' ? 2 : 3
                          const excludedTotals = new Set([...excludedNumbers].map(Number))
                          const suppliedResults = [...suppliedNumbers].flatMap((number) => {
                            const pairValues = number.length === 5
                              ? [number.slice(0, 2), number.slice(2, 4), number.slice(3, 5)]
                              : Array.from({ length: pairCount }, (_, index) => (
                                number.slice(index * 2, index * 2 + 2)
                              ))
                            const total = sumDigits(number)
                            const expectedTotal = generator === 'GEN-4' && total > 99 ? total % 100 : total
                            if (pairValues.some((pair) => excludedNumbers.has(pair))
                              || excludedTotals.has(expectedTotal)) return []
                            return {
                              values: pairValues,
                              checks: generator === 'GEN-5' ? pairValues : undefined,
                              total,
                              reducedTotal: total > 99 ? total % 100 : total,
                              number,
                              digitSum: total,
                              isMatch: true,
                            }
                          })
                          const uniqueResults = new Map(
                            [...generatorResults.matches, ...generatorResults.repeatedMatches, ...suppliedResults]
                              .map((result) => [result.number ?? result.values.join(''), result]),
                          )
                          generatorResults.matches = [...uniqueResults.values()]
                          generatorResults.repeatedMatches = []
                        }
                        setManithaNaadiCombinationResults({
                          generator,
                          profile: selectedManithaNaadiInitials,
                          ...generatorResults,
                        })
                      }}
                    >
                      {generator}
                    </button>
                    {generator === 'GEN-MOBILE-NUMBERS' && selectedManithaNaadiInitials === 'MJ' && (
                      <label className="mobile-number-85-option">
                        <input
                          type="checkbox"
                          checked={includeMjMobile85}
                          onChange={(event) => {
                            const include85 = event.target.checked
                            setIncludeMjMobile85(include85)
                            if (manithaNaadiCombinationResults?.generator === 'GEN-MOBILE-NUMBERS'
                              && manithaNaadiCombinationResults.profile === 'MJ') {
                              setManithaNaadiCombinationResults({
                                generator: 'GEN-MOBILE-NUMBERS',
                                profile: 'MJ',
                                ...calculateManithaNaadiMobileMatches(
                                  'MJ',
                                  manithaNaadiLuckyNumbers.MJ,
                                  rasiChartNumbersByPair,
                                  include85,
                                ),
                              })
                            }
                          }}
                        />
                        <span>85</span>
                      </label>
                    )}
                    </div>
                  )
                ))}
              </div>
              {activeManithaNaadiGenerator === 'GEN-EMAIL'
                && manithaNaadiEmailResults?.initials === selectedManithaNaadiInitials && (
                <EmailGeneratorResults
                  initials={selectedManithaNaadiInitials}
                  results={manithaNaadiEmailResults}
                  rasiChartNumbersByPair={rasiChartNumbersByPair}
                />
              )}
            </div>
            {manithaNaadiCombinationResults && (
              <section className="combination-results" aria-live="polite" aria-label={`${manithaNaadiCombinationResults.generator} results`}>
                <div className="workspace-results-heading">
                  <div>
                    <span className="results-kicker">{manithaNaadiCombinationResults.generator} · {manithaNaadiCombinationResults.profile} VALUES</span>
                    <h2>{['GEN-5', 'GEN-MOBILE-NUMBERS', 'GEN-CAR-REG'].includes(manithaNaadiCombinationResults.generator)
                      ? manithaNaadiCombinationResults.generator === 'GEN-CAR-REG' ? 'Generated registrations' : 'Generated numbers'
                      : 'Combination sum results'}</h2>
                  </div>
                  <span className="results-count" title={manithaNaadiCombinationResults.generator === 'GEN-5'
                    ? 'Numbers matching the selected-initial pair and shared-pool checks'
                    : manithaNaadiCombinationResults.generator === 'GEN-MOBILE-NUMBERS'
                      ? 'Every number starts with 074; all four following pairs and the digit total must be in the selected initials lucky numbers'
                      : manithaNaadiCombinationResults.generator === 'GEN-CAR-REG'
                        ? 'All three pair checks and the digit sum must match the selected initials lucky numbers; up to 10 registrations per reachable Bhavam'
                      : 'Total includes combinations with repeated values; distinct count excludes repeats'}>
                    {manithaNaadiCombinationResults.generator === 'GEN-5'
                      ? `${manithaNaadiCombinationResults.matches.length} NUMBERS`
                      : manithaNaadiCombinationResults.generator === 'GEN-MOBILE-NUMBERS'
                        ? `${manithaNaadiCombinationResults.matches.length} MATCHES`
                        : manithaNaadiCombinationResults.generator === 'GEN-CAR-REG'
                          ? `${manithaNaadiCombinationResults.matches.length.toLocaleString()} SHOWN · UP TO 120`
                          : `${manithaNaadiCombinationResults.possibleCombinationsWithRepetition.toLocaleString()} POSSIBLE WITH REPEATS · ${manithaNaadiCombinationResults.combinationsChecked.toLocaleString()} DISTINCT${manithaNaadiCombinationResults.generator === 'GEN-4' && manithaNaadiGen4NumerologistNumbers[manithaNaadiCombinationResults.profile] ? ` · ${manithaNaadiGen4NumerologistNumbers[manithaNaadiCombinationResults.profile].size} GIVEN INCLUDED` : manithaNaadiCombinationResults.generator === 'GEN-6' && manithaNaadiGen6NumerologistNumbers[manithaNaadiCombinationResults.profile] ? ` · ${manithaNaadiGen6NumerologistNumbers[manithaNaadiCombinationResults.profile].size} GIVEN INCLUDED` : ''}`}
                  </span>
                </div>
                {['GEN-4', 'GEN-5', 'GEN-6', 'GEN-8', 'GEN-MOBILE-NUMBERS'].includes(manithaNaadiCombinationResults.generator) ? (
                  <>
                    <div className="manitha-results-table-wrap">
                      <table className="manitha-results-table">
                        <thead>
                          <tr>
                            {manithaNaadiTableHeaders.map((heading) => (
                              <th scope="col" key={heading}>
                                {heading === 'Digit sum' ? (
                                  <span className="digit-sum-filter-heading">
                                    <span>{heading}</span>
                                    <input
                                      className="digit-sum-filter-input"
                                      type="search"
                                      inputMode="numeric"
                                      aria-label="Filter results by digit sum"
                                      placeholder="Filter"
                                      value={manithaNaadiDigitSumFilter}
                                      onChange={(event) => setManithaNaadiDigitSumFilter(event.target.value)}
                                    />
                                  </span>
                                ) : heading}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {visibleManithaNaadiTableRows.length === 0 && manithaNaadiDigitSumFilter.trim() ? (
                            <tr>
                              <td colSpan={manithaNaadiTableHeaders.length}>No results match this digit sum.</td>
                            </tr>
                          ) : visibleManithaNaadiTableRows.map((row, index) => (
                            <tr
                              className={(
                                manithaNaadiCombinationResults.generator === 'GEN-5'
                                  && manithaNaadiGen5NumerologistNumbers[manithaNaadiCombinationResults.profile]?.has(row[2])
                              ) || (
                                manithaNaadiCombinationResults.generator === 'GEN-4'
                                  && manithaNaadiGen4NumerologistNumbers[manithaNaadiCombinationResults.profile]?.has(row[2])
                              ) || (
                                manithaNaadiCombinationResults.generator === 'GEN-6'
                                  && manithaNaadiGen6NumerologistNumbers[manithaNaadiCombinationResults.profile]?.has(row[2])
                              ) ? 'manitha-curated-number-row' : ''}
                              key={`${row[2]}-${index}`}
                            >
                              <td>{row[0]}</td>
                              <td>{row[1]}</td>
                              <td>{row[2]}</td>
                              <td>{row[3]}</td>
                              <td><strong>{row[4]}</strong></td>
                              <td><strong>{row[5]}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="unique-combination-numbers" aria-live="polite">
                      <span className="results-kicker">
                        UNIQUE COMBINATIONS · {uniqueGeneratedCombinations.length}
                      </span>
                      <p>
                        {uniqueGeneratedCombinations.length > 0
                          ? uniqueGeneratedCombinations.join('\n')
                          : 'No combinations to display.'}
                      </p>
                    </div>
                    <button
                      className="combination-generate-button manitha-results-download"
                      type="button"
                      onClick={exportManithaNaadiResults}
                    >
                      Download as Excel
                    </button>
                  </>
                ) : manithaNaadiCombinationResults.generator === 'GEN-CAR-REG' ? (
                  <>
                    <div className="manitha-results-table-wrap">
                      <table className="manitha-results-table manitha-car-reg-results-table">
                        <thead>
                          <tr>
                            <th scope="col">Initials</th>
                            <th scope="col">Lucky pair</th>
                            <th scope="col">Registration</th>
                            <th scope="col">Pair checks</th>
                            <th scope="col">Digit sum calculation</th>
                            <th scope="col">Digit sum</th>
                            <th scope="col">Digit Bhavam</th>
                          </tr>
                        </thead>
                        <tbody>
                          {manithaNaadiCombinationResults.matches.map((match, index) => (
                            <tr key={`${match.registration}-${index}`}>
                              <td>{manithaNaadiCombinationResults.profile}</td>
                              <td>{match.pair}</td>
                              <td><strong>{match.registration}</strong></td>
                              <td>{match.checks.join(', ')}</td>
                              <td>{match.digitSumCalculation}</td>
                              <td>{match.digitSum}</td>
                              <td><strong>{rasiChartNumbersByPair.get(String(match.digitSum).padStart(2, '0'))?.join('/') ?? '—'}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      className="combination-generate-button manitha-results-download"
                      type="button"
                      onClick={exportManithaNaadiResults}
                    >
                      Download as Excel
                    </button>
                  </>
                ) : [
                  { title: 'Matching', combinations: manithaNaadiCombinationResults.matches },
                  { title: 'Repeated digits match', combinations: manithaNaadiCombinationResults.repeatedMatches },
                  { title: 'Unmatched combinations', combinations: manithaNaadiCombinationResults.nonMatches },
                ].map((group) => (
                  <section className="workspace-result-group" key={group.title}>
                    <h3>{group.title}<span>{group.combinations.length}</span></h3>
                    {group.combinations.length === 0 ? (
                      <p className="workspace-results-message">No combinations in this group.</p>
                    ) : (
                      <ol className="workspace-match-list workspace-match-list-grid">
                        {group.combinations.map((combination, index) => (
                          <li key={`${combination.values.join('-')}-${index}`}>
                            <span className="workspace-match-equation">
                              <strong>{combination.values.join(' + ')}</strong>
                            </span>
                            <span className="workspace-match-summary">
                              <strong className="workspace-match-total">Sum = {combination.total}</strong>
                              <strong className={combination.isMatch ? 'workspace-match-number' : 'workspace-match-no-match'}>
                                {combination.isMatch
                                  ? `Match · ${combination.reducedTotal}`
                                  : `No match · ${combination.reducedTotal}`}
                              </strong>
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>
                ))}
              </section>
            )}
          </section>
        ) : activePage === 'password' ? (
          <PasswordPage />
        ) : activePage === 'name2number' ? (
          <Name2NumberPage />
        ) : (
          <PanjaPatchiPage />
        )}
      </section>

      <footer className="page-footer">
        <span>NUMBER SIGNAL <span className="footer-separator">/</span> {activePage === 'manitha-naadi' ? 'மனித நாடி LUCKY NUMBERS' : activePage === 'password' ? 'PASSWORD GENERATOR' : activePage === 'panja-patchi' ? 'பஞ்ச பட்சி' : activePage === 'name2number' ? 'NAME2NUMBER' : 'மனித நாடி LUCKY NUMBERS'}</span>
        <span>EDITABLE IN THIS BROWSER</span>
      </footer>
    </main>
  )
}

export default App
