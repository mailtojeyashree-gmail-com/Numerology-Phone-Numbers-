import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import EmailGeneratorOption, { EmailGeneratorResults } from './EmailGeneratorOption'
import ManithaNaadiDogNameGenerator from './ManithaNaadiDogNameGenerator'
import ManithaNaadiGen8Generator from './ManithaNaadiGen8Generator'
import { calculateGen8Matches } from './manithaNaadiGen8Logic'
import ManithaNaadiPasswordGenerator from './ManithaNaadiPasswordGenerator'
import PanjaPatchiPage from './PanjaPatchiPage'
import Name2NumberPage from './Name2NumberPage'
import PasswordPage from './PasswordPage'
import LuckyNumbersOverview from './LuckyNumbersOverview'
import RegNumbersPage from './RegNumbers'
import { manithaNaadiRajanilaiNumbers } from './manithaNaadiRajanilai'
import { carRegLetterValueMap } from './numerologyLetterValues'
import {
  rasiChartClockwiseOrder,
  rasiChartSigns,
  rasiChartStartingSigns,
} from './rasiChartData'

const CAR_REGISTRATION_PAGE_SIZE = 100
const toRegNumberCalculationDigits = (number) => [...number].map((character) => (
  /\d/.test(character)
    ? character
    : carRegLetterValueMap.get(character)
)).join('')
const getCanonicalPairChecks = (checks) => [...checks]
  .sort((first, second) => Number(first) - Number(second))
  .join(',')
const parsePairFilterLine = (line, pairCount) => {
  if (line.includes(',')) {
    const pairs = line.split(',').map((pair) => pair.trim())
    return pairs.length === pairCount && pairs.every((pair) => /^\d{2}$/.test(pair))
      ? pairs
      : null
  }

  const digits = line.replace(/\s/g, '')
  if (!new RegExp(`^\\d{${pairCount * 2}}$`).test(digits)) return null
  return digits.match(/\d{2}/g)
}
const CAR_REGISTRATION_GENERATORS = new Set([
  'GEN-CAR-REG',
  'GEN-AB12CD-REG-FORMAT',
  'GEN-1234AB-REG-FORMAT',
])
const isCarRegistrationGenerator = (generator) => CAR_REGISTRATION_GENERATORS.has(generator)

function ResultPagination({ page, pageSize, totalItems, onPageChange, label }) {
  const pageCount = Math.ceil(totalItems / pageSize)
  if (pageCount < 2) return null

  return (
    <nav className="car-reg-pagination" aria-label={`${label} pages`}>
      <button type="button" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span>Page {page + 1} of {pageCount} · {totalItems.toLocaleString()} rows</span>
      <button type="button" disabled={page >= pageCount - 1} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  )
}

function CopyListButton({ copyKey, label, status, text, onCopy }) {
  return (
    <div className="car-reg-copy-action">
      <button
        className="combination-generate-button car-reg-copy-button"
        type="button"
        aria-label={`Copy ${label.toLowerCase()}`}
        disabled={!text}
        onClick={() => onCopy(copyKey, text)}
      >
        {status?.success ? 'Copied' : status ? 'Copy failed' : 'Copy list'}
      </button>
      {status && (
        <span className={status.success ? 'car-reg-copy-success' : 'car-reg-copy-error'} role="status">
          {status.message}
        </span>
      )}
    </div>
  )
}

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

function App() {
  const [isButtonActionLoading, setIsButtonActionLoading] = useState(false)
  const isButtonActionLoadingRef = useRef(false)
  const allowButtonActionRef = useRef(false)
  const keepButtonActionLoadingRef = useRef(false)
  const carRegistrationWorkerRef = useRef(null)
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
  const [mobileDigitSumFilters, setMobileDigitSumFilters] = useState([])
  const [manithaNaadiUniqueDigitSumSelection, setManithaNaadiUniqueDigitSumSelection] = useState('')
  const [carRegistrationDigitSumFilters, setCarRegistrationDigitSumFilters] = useState([])
  const [carRegistrationLuckyPairFilters, setCarRegistrationLuckyPairFilters] = useState([])
  const [carRegistrationPage, setCarRegistrationPage] = useState(0)
  const [carRegistrationSortDirection, setCarRegistrationSortDirection] = useState(null)
  const [carRegistrationCombinationPage, setCarRegistrationCombinationPage] = useState(0)
  const [filteredCarRegistrationPage, setFilteredCarRegistrationPage] = useState(0)
  const [mobileNumberPage, setMobileNumberPage] = useState(0)
  const [mobileUniqueCombinationPage, setMobileUniqueCombinationPage] = useState(0)
  const [mobileUniquePairFilterOpen, setMobileUniquePairFilterOpen] = useState(false)
  const [mobileUniquePairFilterDraft, setMobileUniquePairFilterDraft] = useState('')
  const [mobileUniquePairFilters, setMobileUniquePairFilters] = useState([])
  const [mobileUniquePairFilterError, setMobileUniquePairFilterError] = useState('')
  const [carRegistrationGenerationError, setCarRegistrationGenerationError] = useState('')
  const [carRegistrationPairFilterOpen, setCarRegistrationPairFilterOpen] = useState(false)
  const [carRegistrationPairFilterDraft, setCarRegistrationPairFilterDraft] = useState('')
  const [carRegistrationPairFilters, setCarRegistrationPairFilters] = useState([])
  const [carRegistrationPairFilterError, setCarRegistrationPairFilterError] = useState('')
  const [carRegistrationUniquePairFilterOpen, setCarRegistrationUniquePairFilterOpen] = useState(false)
  const [carRegistrationUniquePairFilterDraft, setCarRegistrationUniquePairFilterDraft] = useState('')
  const [carRegistrationUniquePairFilters, setCarRegistrationUniquePairFilters] = useState([])
  const [carRegistrationUniquePairFilterError, setCarRegistrationUniquePairFilterError] = useState('')
  const [carRegistrationCopyFeedback, setCarRegistrationCopyFeedback] = useState({})
  const [includeMjMobile85, setIncludeMjMobile85] = useState(true)
  const [manualCombinationTarget, setManualCombinationTarget] = useState('')
  const [manualCombinationResults, setManualCombinationResults] = useState(null)
  const [manualCombinationError, setManualCombinationError] = useState('')

  useEffect(() => () => carRegistrationWorkerRef.current?.terminate(), [])

  function finishGeneratorWorker() {
    keepButtonActionLoadingRef.current = false
    carRegistrationWorkerRef.current?.terminate()
    carRegistrationWorkerRef.current = null
    isButtonActionLoadingRef.current = false
    setIsButtonActionLoading(false)
  }

  function generateInWorker(generator, luckyNumbers, profile, include85 = true) {
    setCarRegistrationGenerationError('')
    setManithaNaadiCombinationResults(null)
    keepButtonActionLoadingRef.current = true
    isButtonActionLoadingRef.current = true
    setIsButtonActionLoading(true)
    carRegistrationWorkerRef.current?.terminate()

    try {
      const worker = generator === 'GEN-MOBILE-NUMBERS'
        ? new Worker(new URL('./mobileNumber.worker.js', import.meta.url), { type: 'module' })
        : new Worker(new URL('./carRegistration.worker.js', import.meta.url), { type: 'module' })
      carRegistrationWorkerRef.current = worker
      worker.onmessage = (event) => {
        if (carRegistrationWorkerRef.current !== worker) return
        if (event.data.error) {
          setCarRegistrationGenerationError(event.data.error)
          finishGeneratorWorker()
          return
        }
        const generatorResults = event.data.results
        if (generator !== 'GEN-MOBILE-NUMBERS') {
          generatorResults.generatedNumbers = [...new Set(
            [...generatorResults.matches, ...generatorResults.repeatedMatches]
              .map((result) => result.number ?? result.registration ?? result.values.join('')),
          )]
        }
        setManithaNaadiCombinationResults({
          generator,
          profile,
          ...generatorResults,
        })
        finishGeneratorWorker()
      }
      worker.onerror = (event) => {
        event.preventDefault()
        if (carRegistrationWorkerRef.current !== worker) return
        setCarRegistrationGenerationError(
          event.message || `${generator} generation failed. Please try again.`,
        )
        finishGeneratorWorker()
      }
      worker.onmessageerror = () => {
        if (carRegistrationWorkerRef.current !== worker) return
        setCarRegistrationGenerationError(`Could not read the ${generator} generation results.`)
        finishGeneratorWorker()
      }
      worker.postMessage({
        profile,
        luckyNumbers,
        rasiChartEntries: [...rasiChartNumbersByPair],
        include85,
        registrationFormat: generator === 'GEN-AB12CD-REG-FORMAT'
          ? 'AB12CD'
          : generator === 'GEN-1234AB-REG-FORMAT' ? '1234AB' : 'A12BCD',
      })
    } catch (error) {
      setCarRegistrationGenerationError(
        error instanceof Error ? error.message : `Could not start ${generator} generation.`,
      )
      finishGeneratorWorker()
    }
  }

  function generateManualCombinations(event) {
    event.preventDefault()
    const targets = manualCombinationTarget.trim().split(/[\s,]+/)
    if (!manualCombinationTarget.trim() || targets.some((target) => !/^\d{2}$/.test(target))) {
      setManualCombinationError('Enter one or more two-digit values, separated by commas or spaces.')
      setManualCombinationResults(null)
      return
    }

    const luckyNumbers = manithaNaadiLuckyNumbers[selectedManithaNaadiInitials]
    const excludedNumbers = manithaNaadiGen8ExcludedNumbers[selectedManithaNaadiInitials]
    const excludedPairs = new Set(parseEntries(excludedNumbers, true))
    const availableNumbers = parseEntries(luckyNumbers, true)
      .filter((number) => !excludedPairs.has(number))
      .join(', ')
    const gen6Results = calculateCombinationMatches(availableNumbers, targets.join(', '), 3, true, true)
    const gen8Results = calculateGen8Matches(luckyNumbers, excludedNumbers, targets)
    const toRows = (results) => [...results.matches, ...results.repeatedMatches].map((combination) => {
      const number = combination.number ?? combination.values.join('')
      const digitSum = sumDigits(number)
      return [
        combination.values.join(', '),
        number,
        digitSum,
        combination.values.map((value) => rasiChartNumbersByPair.get(value)?.join('/') ?? '—').join('-'),
        rasiChartNumbersByPair.get(String(digitSum).padStart(2, '0'))?.join('/') ?? '—',
      ]
    })

    setManualCombinationResults({
      profile: selectedManithaNaadiInitials,
      targets,
      gen6: toRows(gen6Results),
      gen8: toRows(gen8Results),
    })
    setManualCombinationError('')
  }

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
      ${style('RajanilaiMatchLeft', { color: '#1D6B43', bold: true })}
      ${style('RajanilaiMissLeft', { color: '#C62828', bold: true })}
    </Styles>`
    const isCarRegistration = isCarRegistrationGenerator(manithaNaadiCombinationResults.generator)
    const exportRows = isCarRegistration
      ? [
        ['Initials', 'Lucky pair', 'Registration', 'Pair checks', 'Rajanilai calculation', 'Rajanilai match', 'Pair bhavam', 'Digit sum', 'Sum bhavam'],
        ...manithaNaadiCombinationResults.matches.map((match) => [
          manithaNaadiCombinationResults.profile,
          match.pair,
          match.registration,
          match.checks.join(', '),
          match.checks.map((check) => `${check} ${manithaNaadiRajanilaiNumbers.has(Number(check)) ? '✓' : '✗'}`).join(' '),
          `${match.digitSum} ${manithaNaadiRajanilaiNumbers.has(match.digitSum) ? '✓✓' : '✗✗'}`,
          match.checks.map((check) => rasiChartNumbersByPair.get(check)?.join('/') ?? '—').join(', '),
          match.digitSum,
          rasiChartNumbersByPair.get(String(match.digitSum).padStart(2, '0'))?.join('/') ?? '—',
        ]),
      ]
      : manithaNaadiCombinationResults.generator === 'GEN-MOBILE-NUMBERS'
        ? [
          [...manithaNaadiTableHeaders, 'Unique pairs'],
          ...getManithaNaadiTableRows(),
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
      const isRightAligned = (isCarRegistration ? [1, 7] : [1, 2, 3, 5]).includes(index)
      return `<Cell ss:StyleID="${isRightAligned ? 'HeaderRight' : 'HeaderLeft'}"><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`
    }).join('')
    const dataRows = exportRows.slice(1).map((row) => {
      const isHighlighted = !isCarRegistration && highlightedNumbers?.has(row[2])
      const cells = row.map((value, index) => {
        const isRightAligned = (isCarRegistration ? [1, 7] : [1, 2, 3, 5]).includes(index)
        const isBold = isCarRegistration
          ? index === 2 || index === 8
          : index === 4 || index === 5 || (isHighlighted && [1, 2].includes(index))
        const styleId = isCarRegistration && index === 5
          ? manithaNaadiRajanilaiNumbers.has(Number(row[7]))
            ? 'RajanilaiMatchLeft'
            : 'RajanilaiMissLeft'
          : isHighlighted
          ? [1, 2].includes(index)
            ? 'HighlightPair'
            : isBold ? 'HighlightBold' : 'Highlight'
          : isCarRegistration
            ? isBold ? 'CarBold' : 'Body'
            : isBold ? 'BodyBold' : 'Body'
        const alignment = isRightAligned ? 'Right' : 'Left'
        const cellStyleId = isCarRegistration && index === 5 ? styleId : `${styleId}${alignment}`
        return `<Cell ss:StyleID="${cellStyleId}"><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`
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

  function exportFilteredCarRegistrations() {
    const registrations = [...new Set(
      visibleCarRegistrationMatches.map((match) => match.registration),
    )]
    const xmlEscape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    })[character])
    const rows = [
      '<Row><Cell><Data ss:Type="String">Registration</Data></Cell></Row>',
      ...registrations.map((registration) => (
        `<Row><Cell><Data ss:Type="String">${xmlEscape(registration)}</Data></Cell></Row>`
      )),
    ].join('')
    const workbook = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Registrations"><Table>${rows}</Table></Worksheet></Workbook>`
    const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `filtered-registrations-${selectedManithaNaadiInitials}-${new Date().toISOString().slice(0, 10)}.xls`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
  }

  async function copyCarRegistrationList(copyKey, text) {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable in this browser.')
      }
      await navigator.clipboard.writeText(text)
      setCarRegistrationCopyFeedback((feedback) => ({
        ...feedback,
        [copyKey]: { success: true, message: 'Copied to clipboard.' },
      }))
    } catch (error) {
      setCarRegistrationCopyFeedback((feedback) => ({
        ...feedback,
        [copyKey]: {
          success: false,
          message: `Copy failed: ${error instanceof Error ? error.message : 'Clipboard access was denied.'}`,
        },
      }))
    }
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
    if (!manithaNaadiCombinationResults || isCarRegistrationGenerator(manithaNaadiCombinationResults.generator)) return []

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

      const row = [
        manithaNaadiCombinationResults.profile,
        values.join(', '),
        number,
        digitSum,
        values.map((value) => rasiChartNumbersByPair.get(value)?.join('/') ?? '—').join('-'),
        rasiChartNumbersByPair.get(String(sumLookup).padStart(2, '0'))?.join('/') ?? '—',
      ]
      return isMobile
        ? [...row, getCanonicalPairChecks(values).replaceAll(',', ', ')]
        : row
    })
  }
  const manithaNaadiTableRows = getManithaNaadiTableRows()
  const visibleManithaNaadiTableRows = manithaNaadiTableRows.filter((row) => (
    (manithaNaadiCombinationResults?.generator === 'GEN-MOBILE-NUMBERS'
      ? mobileDigitSumFilters.length === 0
        || mobileDigitSumFilters.includes(String(row[3]))
      : !manithaNaadiDigitSumFilter.trim()
        || String(row[3]) === manithaNaadiDigitSumFilter.trim())
    && (manithaNaadiCombinationResults?.generator !== 'GEN-MOBILE-NUMBERS'
      || mobileUniquePairFilters.length === 0
      || mobileUniquePairFilters.includes(getCanonicalPairChecks(
        row[6].split(',').map((pair) => pair.trim()),
      )))
  ))
  const pagedManithaNaadiTableRows = manithaNaadiCombinationResults?.generator === 'GEN-MOBILE-NUMBERS'
    ? visibleManithaNaadiTableRows.slice(
      mobileNumberPage * CAR_REGISTRATION_PAGE_SIZE,
      (mobileNumberPage + 1) * CAR_REGISTRATION_PAGE_SIZE,
    )
    : visibleManithaNaadiTableRows
  const manithaNaadiUniqueDigitSums = [...new Set(manithaNaadiTableRows.map((row) => row[3]))]
    .sort((first, second) => first - second)
  const generatedNumberSet = new Set(manithaNaadiCombinationResults?.generatedNumbers ?? [])
  const uniqueGeneratedCombinations = [...new Set(
    visibleManithaNaadiTableRows
      .filter((row) => !['GEN-4', 'GEN-5', 'GEN-6', 'GEN-8'].includes(manithaNaadiCombinationResults?.generator)
        || !manithaNaadiUniqueDigitSumSelection
        || String(row[3]) === manithaNaadiUniqueDigitSumSelection)
      .filter((row) => manithaNaadiCombinationResults?.generator === 'GEN-MOBILE-NUMBERS'
        || generatedNumberSet.has(row[2]))
      .map((row) => {
        if (manithaNaadiCombinationResults?.generator === 'GEN-MOBILE-NUMBERS') {
          return row[6].split(',').map((pair) => pair.trim()).join('')
        }
        const pairs = row[1]
          .split(',')
          .map((pair) => pair.trim())
          .sort((first, second) => Number(first) - Number(second))
        return pairs.join(', ')
      }),
  )]
  
  const pagedUniqueGeneratedCombinations = manithaNaadiCombinationResults?.generator === 'GEN-MOBILE-NUMBERS'
    ? uniqueGeneratedCombinations.slice(
      mobileUniqueCombinationPage * CAR_REGISTRATION_PAGE_SIZE,
      (mobileUniqueCombinationPage + 1) * CAR_REGISTRATION_PAGE_SIZE,
    )
    : uniqueGeneratedCombinations
  const carRegistrationData = useMemo(() => {
    const matches = isCarRegistrationGenerator(manithaNaadiCombinationResults?.generator)
      ? manithaNaadiCombinationResults.matches
      : []
    const digitSums = [...new Set(matches.map((match) => match.digitSum))]
      .sort((first, second) => first - second)
    const luckyPairs = [...new Set(matches.map((match) => match.pair))]
      .sort((first, second) => Number(first) - Number(second))
    const visibleMatches = matches.filter((match) => {
      if (
        (carRegistrationDigitSumFilters.length > 0
          && !carRegistrationDigitSumFilters.includes(String(match.digitSum)))
        || (carRegistrationLuckyPairFilters.length > 0
          && !carRegistrationLuckyPairFilters.includes(match.pair))
        || (carRegistrationPairFilters.length > 0
          && !carRegistrationPairFilters.includes(getCanonicalPairChecks(match.checks)))
        || (carRegistrationUniquePairFilters.length > 0
          && !carRegistrationUniquePairFilters.includes(getCanonicalPairChecks(match.checks)))
      ) return false

      return true
    })
    const pairSortedMatches = [...visibleMatches].sort((first, second) => (
      getCanonicalPairChecks(first.checks).localeCompare(
        getCanonicalPairChecks(second.checks),
        undefined,
        { numeric: true },
      )
    ))
    const alphabeticalMatches = [...visibleMatches].sort((first, second) => (
      first.registration.localeCompare(second.registration, undefined, { numeric: true, sensitivity: 'base' })
    ))
    const sortedMatches = carRegistrationSortDirection
      ? [...pairSortedMatches].sort((first, second) => (
        getCanonicalPairChecks(first.checks).localeCompare(
          getCanonicalPairChecks(second.checks),
          undefined,
          { numeric: true },
        )
        || first.registration.localeCompare(
          second.registration,
          undefined,
          { numeric: true, sensitivity: 'base' },
        ) * (carRegistrationSortDirection === 'asc' ? 1 : -1)
      ))
      : pairSortedMatches
    const alphabetStarts = new Map()
    alphabeticalMatches.forEach((match, index) => {
      const letter = match.registration[0]?.toUpperCase()
      if (letter && !alphabetStarts.has(letter)) alphabetStarts.set(letter, index)
    })
    const uniquePairs = [...new Set(visibleMatches.flatMap((match) => match.checks))]
    const combinationCounts = new Map()
    visibleMatches.forEach((match) => {
      const combination = getCanonicalPairChecks(match.checks).replaceAll(',', '')
      combinationCounts.set(combination, (combinationCounts.get(combination) ?? 0) + 1)
    })

    return {
      matches,
      digitSums,
      luckyPairs,
      visibleMatches,
      sortedMatches,
      alphabetStarts,
      uniquePairs,
      combinationCounts,
      combinationEntries: [...combinationCounts],
      filteredRegistrations: [...new Set(visibleMatches.map((match) => match.registration))],
    }
  }, [
    manithaNaadiCombinationResults,
    carRegistrationDigitSumFilters,
    carRegistrationLuckyPairFilters,
    carRegistrationPairFilters,
    carRegistrationUniquePairFilters,
    carRegistrationSortDirection,
  ])
  const {
    matches: carRegistrationMatches,
    digitSums: carRegistrationDigitSums,
    luckyPairs: carRegistrationLuckyPairs,
    visibleMatches: visibleCarRegistrationMatches,
    sortedMatches: sortedCarRegistrationMatches,
    alphabetStarts: carRegistrationAlphabetStarts,
    uniquePairs: carRegistrationUniquePairs,
    combinationCounts: carRegistrationCombinationCounts,
    combinationEntries: carRegistrationCombinationEntries,
    filteredRegistrations: filteredCarRegistrations,
  } = carRegistrationData
  const pagedCarRegistrationMatches = sortedCarRegistrationMatches.slice(
    carRegistrationPage * CAR_REGISTRATION_PAGE_SIZE,
    (carRegistrationPage + 1) * CAR_REGISTRATION_PAGE_SIZE,
  )
  const pagedCarRegistrationCombinationEntries = carRegistrationCombinationEntries.slice(
    carRegistrationCombinationPage * CAR_REGISTRATION_PAGE_SIZE,
    (carRegistrationCombinationPage + 1) * CAR_REGISTRATION_PAGE_SIZE,
  )
  const pagedFilteredCarRegistrations = filteredCarRegistrations.slice(
    filteredCarRegistrationPage * CAR_REGISTRATION_PAGE_SIZE,
    (filteredCarRegistrationPage + 1) * CAR_REGISTRATION_PAGE_SIZE,
  )

  function deferButtonAction(event) {
    if (allowButtonActionRef.current) return

    const button = event.target instanceof Element ? event.target.closest('button') : null
    if (!button) return

    event.preventDefault()
    event.stopPropagation()
    if (isButtonActionLoadingRef.current) return

    isButtonActionLoadingRef.current = true
    setIsButtonActionLoading(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        allowButtonActionRef.current = true
        button.click()
        allowButtonActionRef.current = false
        window.setTimeout(() => {
          if (keepButtonActionLoadingRef.current) return
          isButtonActionLoadingRef.current = false
          setIsButtonActionLoading(false)
        }, 300)
      })
    })
  }

  function deferCarRegistrationFilterUpdate(updateFilter) {
    if (isButtonActionLoadingRef.current) return

    isButtonActionLoadingRef.current = true
    setIsButtonActionLoading(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateFilter()
        setCarRegistrationPage(0)
        setCarRegistrationCombinationPage(0)
        setFilteredCarRegistrationPage(0)
        window.setTimeout(() => {
          isButtonActionLoadingRef.current = false
          setIsButtonActionLoading(false)
        }, 300)
      })
    })
  }

  function applyCarRegistrationPairFilter(event, filterType = 'checks') {
    event.preventDefault()
    const isUniquePairFilter = filterType === 'unique'
    const draft = isUniquePairFilter
      ? carRegistrationUniquePairFilterDraft
      : carRegistrationPairFilterDraft
    const lines = draft
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
    const parsedFilters = []
    const invalidLines = []

    lines.forEach((line, index) => {
      const pairs = parsePairFilterLine(line, 3)
      if (!pairs) {
        invalidLines.push(index + 1)
        return
      }
      const filter = getCanonicalPairChecks(pairs)
      if (!parsedFilters.includes(filter)) parsedFilters.push(filter)
    })

    if (invalidLines.length > 0) {
      const setFilterError = isUniquePairFilter
        ? setCarRegistrationUniquePairFilterError
        : setCarRegistrationPairFilterError
      setFilterError(
        `Enter exactly three two-digit pairs per line, separated by commas or entered together. Check line${invalidLines.length === 1 ? '' : 's'} ${invalidLines.join(', ')}.`,
      )
      return
    }

    const setFilters = isUniquePairFilter
      ? setCarRegistrationUniquePairFilters
      : setCarRegistrationPairFilters
    const setFilterError = isUniquePairFilter
      ? setCarRegistrationUniquePairFilterError
      : setCarRegistrationPairFilterError
    const setFilterDraft = isUniquePairFilter
      ? setCarRegistrationUniquePairFilterDraft
      : setCarRegistrationPairFilterDraft
    const setFilterOpen = isUniquePairFilter
      ? setCarRegistrationUniquePairFilterOpen
      : setCarRegistrationPairFilterOpen
    setFilters(parsedFilters)
    setCarRegistrationPage(0)
    setCarRegistrationCombinationPage(0)
    setFilteredCarRegistrationPage(0)
    setFilterDraft(parsedFilters.map((filter) => filter.replaceAll(',', ', ')).join('\n'))
    setFilterError('')
    setFilterOpen(false)
  }

  function applyMobileUniquePairFilter(event) {
    event.preventDefault()
    const lines = mobileUniquePairFilterDraft
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
    const parsedFilters = []
    const invalidLines = []

    lines.forEach((line, index) => {
      const pairs = parsePairFilterLine(line, 4)
      if (!pairs) {
        invalidLines.push(index + 1)
        return
      }
      const filter = getCanonicalPairChecks(pairs)
      if (!parsedFilters.includes(filter)) parsedFilters.push(filter)
    })

    if (invalidLines.length > 0) {
      setMobileUniquePairFilterError(
        `Enter exactly four two-digit pairs per line, separated by commas or entered together. Check line${invalidLines.length === 1 ? '' : 's'} ${invalidLines.join(', ')}.`,
      )
      return
    }

    setMobileUniquePairFilters(parsedFilters)
    setMobileUniquePairFilterDraft(parsedFilters.map((filter) => filter.replaceAll(',', ', ')).join('\n'))
    setMobileNumberPage(0)
    setMobileUniqueCombinationPage(0)
    setMobileUniquePairFilterError('')
    setMobileUniquePairFilterOpen(false)
  }

  return (
    <main className="app-shell" onClickCapture={deferButtonAction}>
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
          <a
            className={`page-switch page-switch-link${activePage === 'vipnumbers' ? ' page-switch-active' : ''}`}
            href="#vipnumbers"
            aria-current={activePage === 'vipnumbers' ? 'page' : undefined}
            onClick={() => setActivePage('vipnumbers')}
          >
            phoneovernet
          </a>
          <a
            className={`page-switch page-switch-link${activePage === 'regnumbers' ? ' page-switch-active' : ''}`}
            href="#regnumbers"
            aria-current={activePage === 'regnumbers' ? 'page' : undefined}
            onClick={() => setActivePage('regnumbers')}
          >
            REGNUMBERS
          </a>
        </nav>
      </header>
      <section className="workspace" id="top">
        {activePage === 'manitha-naadi' ? (
          <section className="matching-numbers-page" aria-labelledby="manitha-naadi-title">
            <LuckyNumbersOverview
              heading={<><span id="manitha-naadi-title">மனித நாடி </span><em>lucky numbers</em></>}
              profiles={Object.keys(manithaNaadiLuckyNumberDefaults)}
              initials={selectedManithaNaadiInitials}
              onInitialsChange={setSelectedManithaNaadiInitials}
              luckyNumbers={manithaNaadiLuckyNumbers[selectedManithaNaadiInitials]}
              onLuckyNumbersChange={(value) => setManithaNaadiLuckyNumbers((currentValues) => ({
                ...currentValues,
                [selectedManithaNaadiInitials]: value,
              }))}
              excludedNumbers={manithaNaadiGen8ExcludedNumbers[selectedManithaNaadiInitials]}
              onExcludedNumbersChange={(value) => setManithaNaadiGen8ExcludedNumbers((currentValues) => ({
                ...currentValues,
                [selectedManithaNaadiInitials]: value,
              }))}
            />
            <div className="combination-generate">
              <span className="column-selection-label">GENERATE COMBINATIONS (MOBILE STARTS 074; EVERY PAIR AND THE DIGIT TOTAL MUST MATCH LUCKY NUMBERS)</span>
              <div className="combination-generate-buttons">
                {['GEN-4', 'GEN-5', 'GEN-6', 'GEN-8', 'GEN-MOBILE-NUMBERS', 'GEN-CAR-REG', 'GEN-AB12CD-REG-FORMAT', 'GEN-1234AB-REG-FORMAT', 'GEN-PASSWORD', 'GEN-EMAIL', 'GEN-DOG-NAMES'].map((generator) => (
                  generator === 'GEN-8' ? (
                    <ManithaNaadiGen8Generator
                      key={generator}
                      luckyNumbers={manithaNaadiLuckyNumbers[selectedManithaNaadiInitials]}
                      excludedNumbers={manithaNaadiGen8ExcludedNumbers[selectedManithaNaadiInitials]}
                      activeGenerator={activeManithaNaadiGenerator}
                      onGenerate={(generatorResults) => {
                        setActiveManithaNaadiGenerator('GEN-8')
                        setManithaNaadiUniqueDigitSumSelection('')
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
                        : isCarRegistrationGenerator(generator)
                          ? 'Generate car registrations'
                          : generator === 'GEN-5' ? 'Run GEN-5 three-pair checks' : `Run ${generator} with ${generator === 'GEN-6' ? 'three' : 'two'} values`}
                      title={generator === 'GEN-MOBILE-NUMBERS'
                        ? 'Generate UK mobile numbers from the selected initials lucky pairs'
                        : generator === 'GEN-CAR-REG'
                          ? 'Generate A12BCD car registrations from the selected initials lucky numbers'
                          : generator === 'GEN-AB12CD-REG-FORMAT'
                            ? 'Generate AB12CD car registrations from the selected initials lucky numbers'
                            : generator === 'GEN-1234AB-REG-FORMAT'
                              ? 'Generate 1234AB car registrations from the selected initials lucky numbers'
                            : generator === 'GEN-5'
                              ? 'Generate three-pair checks'
                              : `Generate sums from ${generator === 'GEN-6' ? 'three' : 'two'} values`}
                      onClick={() => {
                        setActiveManithaNaadiGenerator(generator)
                        if (!isCarRegistrationGenerator(generator)) setCarRegistrationGenerationError('')
                        if (isCarRegistrationGenerator(generator)) {
                          setCarRegistrationDigitSumFilters([])
                          setCarRegistrationLuckyPairFilters([])
                          setCarRegistrationPairFilters([])
                          setCarRegistrationUniquePairFilters([])
                          setCarRegistrationPairFilterDraft('')
                          setCarRegistrationUniquePairFilterDraft('')
                          setCarRegistrationPairFilterError('')
                          setCarRegistrationUniquePairFilterError('')
                          setCarRegistrationPage(0)
                          setCarRegistrationCombinationPage(0)
                          setFilteredCarRegistrationPage(0)
                        }
                        setManithaNaadiUniqueDigitSumSelection('')
                        setManithaNaadiEmailResults(null)
                        const luckyNumbers = manithaNaadiLuckyNumbers[selectedManithaNaadiInitials]
                        const excludedNumbers = new Set(parseEntries(
                          manithaNaadiGen8ExcludedNumbers[selectedManithaNaadiInitials],
                          true,
                        ))
                        const calculationLuckyNumbers = parseEntries(luckyNumbers, true)
                          .filter((number) => !excludedNumbers.has(number))
                          .join(', ')
                        if (isCarRegistrationGenerator(generator)) {
                          generateInWorker(
                            generator,
                            calculationLuckyNumbers,
                            selectedManithaNaadiInitials,
                          )
                          return
                        }
                        if (generator === 'GEN-MOBILE-NUMBERS') {
                          setMobileNumberPage(0)
                          generateInWorker(
                            generator,
                            calculationLuckyNumbers,
                            selectedManithaNaadiInitials,
                            includeMjMobile85,
                          )
                          return
                        }
                        const generatorResults = generator === 'GEN-5'
                          ? calculateGen5Matches(calculationLuckyNumbers, calculationLuckyNumbers)
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
                            .map((result) => result.number ?? result.registration ?? result.values.join('')),
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
                              setMobileNumberPage(0)
                              generateInWorker(
                                'GEN-MOBILE-NUMBERS',
                                manithaNaadiLuckyNumbers.MJ,
                                'MJ',
                                include85,
                              )
                            }
                          }}
                        />
                        <span>85</span>
                      </label>
                    )}
                    </div>
                  )
                ))}
                {isCarRegistrationGenerator(manithaNaadiCombinationResults?.generator) && (
                  <button
                    className="combination-generate-button car-reg-toolbar-download"
                    type="button"
                    onClick={exportManithaNaadiResults}
                  >
                    Download as Excel
                  </button>
                )}
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
            {carRegistrationGenerationError && (
              <p className="car-reg-generation-error" role="alert">
                {carRegistrationGenerationError}
              </p>
            )}
            {manithaNaadiCombinationResults && (
              <section className="combination-results" aria-live="polite" aria-label={`${manithaNaadiCombinationResults.generator} results`}>
                <div className="workspace-results-heading">
                  <div>
                    <span className="results-kicker">{manithaNaadiCombinationResults.generator} · {manithaNaadiCombinationResults.profile} VALUES</span>
                    <h2>{['GEN-5', 'GEN-MOBILE-NUMBERS'].includes(manithaNaadiCombinationResults.generator)
                      || isCarRegistrationGenerator(manithaNaadiCombinationResults.generator)
                      ? isCarRegistrationGenerator(manithaNaadiCombinationResults.generator) ? 'Generated registrations' : 'Generated numbers'
                      : 'Combination sum results'}</h2>
                  </div>
                  <span className="results-count" title={manithaNaadiCombinationResults.generator === 'GEN-5'
                    ? 'Numbers matching the selected-initial pair and shared-pool checks'
                    : manithaNaadiCombinationResults.generator === 'GEN-MOBILE-NUMBERS'
                      ? 'Every number starts with 074; all four following pairs and the digit total must be in the selected initials lucky numbers'
                      : isCarRegistrationGenerator(manithaNaadiCombinationResults.generator)
                        ? 'Registrations matching the active filters'
                      : 'Total includes combinations with repeated values; distinct count excludes repeats'}>
                    {manithaNaadiCombinationResults.generator === 'GEN-5'
                      ? `${manithaNaadiCombinationResults.matches.length} NUMBERS`
                      : manithaNaadiCombinationResults.generator === 'GEN-MOBILE-NUMBERS'
                        ? `${manithaNaadiCombinationResults.matches.length} MATCHES`
                        : isCarRegistrationGenerator(manithaNaadiCombinationResults.generator)
                          ? `${visibleCarRegistrationMatches.length.toLocaleString()} REGISTRATIONS`
                          : `${manithaNaadiCombinationResults.possibleCombinationsWithRepetition.toLocaleString()} POSSIBLE WITH REPEATS · ${manithaNaadiCombinationResults.combinationsChecked.toLocaleString()} DISTINCT${manithaNaadiCombinationResults.generator === 'GEN-4' && manithaNaadiGen4NumerologistNumbers[manithaNaadiCombinationResults.profile] ? ` · ${manithaNaadiGen4NumerologistNumbers[manithaNaadiCombinationResults.profile].size} GIVEN INCLUDED` : manithaNaadiCombinationResults.generator === 'GEN-6' && manithaNaadiGen6NumerologistNumbers[manithaNaadiCombinationResults.profile] ? ` · ${manithaNaadiGen6NumerologistNumbers[manithaNaadiCombinationResults.profile].size} GIVEN INCLUDED` : ''}`}
                  </span>
                </div>
                {['GEN-4', 'GEN-5', 'GEN-6', 'GEN-8', 'GEN-MOBILE-NUMBERS'].includes(manithaNaadiCombinationResults.generator) ? (
                  <>
                    <div className="manitha-results-table-wrap">
                      <table className="manitha-results-table">
                        <thead>
                          <tr>
                            {(manithaNaadiCombinationResults.generator === 'GEN-MOBILE-NUMBERS'
                              ? [
                                ...manithaNaadiTableHeaders.slice(0, 2),
                                'Unique pairs',
                                ...manithaNaadiTableHeaders.slice(2),
                              ]
                              : manithaNaadiTableHeaders).map((heading) => (
                              <th scope="col" key={heading}>
                                {heading === 'Unique pairs' ? (
                                  <div className="car-reg-pair-checks-heading">
                                    <span>{heading}</span>
                                    <button
                                      className="car-reg-pair-filter-button"
                                      type="button"
                                      aria-label="Filter mobile numbers by unique pairs"
                                      onClick={() => {
                                        setMobileUniquePairFilterDraft(
                                          mobileUniquePairFilters
                                            .map((filter) => filter.replaceAll(',', ', '))
                                            .join('\n'),
                                        )
                                        setMobileUniquePairFilterError('')
                                        setMobileUniquePairFilterOpen(true)
                                      }}
                                    >
                                      {mobileUniquePairFilters.length > 0
                                        ? `Filter (${mobileUniquePairFilters.length})`
                                        : 'Filter'}
                                    </button>
                                  </div>
                                ) : heading === 'Digit sum'
                                  && manithaNaadiCombinationResults.generator === 'GEN-MOBILE-NUMBERS' ? (
                                  <div className="car-reg-digit-sum-filter" role="group" aria-label="Filter mobile numbers by digit sum">
                                    <span>{heading}</span>
                                    <div className="car-reg-digit-sum-options">
                                      {manithaNaadiUniqueDigitSums.map((digitSum) => {
                                        const value = String(digitSum)
                                        return (
                                          <label key={value}>
                                            <input
                                              type="checkbox"
                                              checked={mobileDigitSumFilters.includes(value)}
                                              onChange={(event) => {
                                                const { checked } = event.target
                                                setMobileDigitSumFilters((selected) => (
                                                  checked
                                                    ? [...selected, value]
                                                    : selected.filter((selectedValue) => selectedValue !== value)
                                                ))
                                                setMobileNumberPage(0)
                                                setMobileUniqueCombinationPage(0)
                                              }}
                                            />
                                            {digitSum}
                                          </label>
                                        )
                                      })}
                                    </div>
                                  </div>
                                ) : heading === 'Digit sum' ? (
                                  <span className="digit-sum-filter-heading">
                                    <span>{heading}</span>
                                    <input
                                      className="digit-sum-filter-input"
                                      type="search"
                                      inputMode="numeric"
                                      aria-label="Filter results by digit sum"
                                      placeholder="Filter"
                                      value={manithaNaadiDigitSumFilter}
                                      onChange={(event) => {
                                        setManithaNaadiDigitSumFilter(event.target.value)
                                        if (manithaNaadiCombinationResults.generator === 'GEN-MOBILE-NUMBERS') {
                                          setMobileNumberPage(0)
                                          setMobileUniqueCombinationPage(0)
                                        }
                                      }}
                                    />
                                  </span>
                                ) : heading}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {visibleManithaNaadiTableRows.length === 0 ? (
                            <tr>
                              <td colSpan={manithaNaadiTableHeaders.length
                                + (manithaNaadiCombinationResults.generator === 'GEN-MOBILE-NUMBERS' ? 1 : 0)}>
                                {manithaNaadiDigitSumFilter.trim()
                                  || mobileDigitSumFilters.length > 0
                                  || mobileUniquePairFilters.length > 0
                                  ? 'No results match the selected filters.'
                                  : 'No results to display.'}
                              </td>
                            </tr>
                          ) : pagedManithaNaadiTableRows.map((row, index) => (
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
                                {manithaNaadiCombinationResults.generator === 'GEN-MOBILE-NUMBERS' && (
                                  <td>{row[6]}</td>
                                )}
                                <td>{row[2]}</td>
                                <td>{row[3]}</td>
                                <td><strong>{row[4]}</strong></td>
                                <td><strong>{row[5]}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {mobileUniquePairFilterOpen && (
                      <div className="car-reg-pair-filter-backdrop">
                        <section
                          className="car-reg-pair-filter-dialog"
                          role="dialog"
                          aria-modal="true"
                          aria-labelledby="mobile-unique-pair-filter-title"
                        >
                          <div className="car-reg-pair-filter-dialog-heading">
                            <h3 id="mobile-unique-pair-filter-title">Filter by unique pairs</h3>
                            <button
                              className="car-reg-pair-filter-close"
                              type="button"
                              aria-label="Close unique pairs filter"
                              onClick={() => setMobileUniquePairFilterOpen(false)}
                            >
                              ×
                            </button>
                          </div>
                          <form onSubmit={applyMobileUniquePairFilter}>
                            <label htmlFor="mobile-unique-pair-filter-input">
                              Enter four pairs per line, separated by commas or entered together.
                            </label>
                            <textarea
                              id="mobile-unique-pair-filter-input"
                              rows={5}
                              placeholder={'14, 41, 64, 85'}
                              value={mobileUniquePairFilterDraft}
                              onChange={(event) => {
                                setMobileUniquePairFilterDraft(event.target.value)
                                setMobileUniquePairFilterError('')
                              }}
                            />
                            {mobileUniquePairFilterError && (
                              <p className="car-reg-pair-filter-error" role="alert">
                                {mobileUniquePairFilterError}
                              </p>
                            )}
                            <div className="car-reg-pair-filter-actions">
                              <button className="combination-generate-button" type="submit">
                                Apply filter
                              </button>
                              <button
                                className="car-reg-pair-filter-clear"
                                type="button"
                                onClick={() => {
                                  setMobileUniquePairFilters([])
                                  setMobileNumberPage(0)
                                  setMobileUniqueCombinationPage(0)
                                  setMobileUniquePairFilterDraft('')
                                  setMobileUniquePairFilterError('')
                                  setMobileUniquePairFilterOpen(false)
                                }}
                              >
                                Clear filter
                              </button>
                            </div>
                          </form>
                        </section>
                      </div>
                    )}
                    {manithaNaadiCombinationResults.generator === 'GEN-MOBILE-NUMBERS' && (
                      <ResultPagination
                        page={mobileNumberPage}
                        pageSize={CAR_REGISTRATION_PAGE_SIZE}
                        totalItems={visibleManithaNaadiTableRows.length}
                        onPageChange={setMobileNumberPage}
                        label="Mobile numbers"
                      />
                    )}
                    <div className="unique-combination-numbers" aria-live="polite">
                      {['GEN-4', 'GEN-5', 'GEN-6', 'GEN-8'].includes(manithaNaadiCombinationResults.generator) && (
                        <label className="unique-digit-sum-select" htmlFor="unique-digit-sum-select">
                          <span>DIGIT SUM</span>
                          <select
                            id="unique-digit-sum-select"
                            value={manithaNaadiUniqueDigitSumSelection}
                            onChange={(event) => setManithaNaadiUniqueDigitSumSelection(event.target.value)}
                          >
                            <option value="">All digit sums</option>
                            {manithaNaadiUniqueDigitSums.map((digitSum) => (
                              <option value={digitSum} key={digitSum}>{digitSum}</option>
                            ))}
                          </select>
                        </label>
                      )}
                      <span className="results-kicker">
                        UNIQUE COMBINATIONS · {uniqueGeneratedCombinations.length}
                      </span>
                      <p>
                        {pagedUniqueGeneratedCombinations.length > 0
                          ? pagedUniqueGeneratedCombinations.join('\n')
                          : 'No combinations to display.'}
                      </p>
                    </div>
                    {manithaNaadiCombinationResults.generator === 'GEN-MOBILE-NUMBERS' && (
                      <ResultPagination
                        page={mobileUniqueCombinationPage}
                        pageSize={CAR_REGISTRATION_PAGE_SIZE}
                        totalItems={uniqueGeneratedCombinations.length}
                        onPageChange={setMobileUniqueCombinationPage}
                        label="Unique mobile-number combinations"
                      />
                    )}
                    <button
                      className="combination-generate-button manitha-results-download"
                      type="button"
                      onClick={exportManithaNaadiResults}
                    >
                      Download as Excel
                    </button>
                  </>
                ) : isCarRegistrationGenerator(manithaNaadiCombinationResults.generator) ? (
                  <>
                    <div className="manitha-results-table-wrap">
                      <table className="manitha-results-table manitha-car-reg-results-table">
                        <thead>
                          <tr>
                            <th scope="col">Initials</th>
                            <th scope="col">
                              <div className="car-reg-digit-sum-filter" role="group" aria-label="Filter car registrations by lucky pair">
                                <span>Lucky pair</span>
                                <div className="car-reg-digit-sum-options">
                                  {carRegistrationLuckyPairs.map((pair) => {
                                    const value = String(pair)
                                    return (
                                      <label key={pair}>
                                        <input
                                          type="checkbox"
                                          checked={carRegistrationLuckyPairFilters.includes(value)}
                                          onChange={(event) => {
                                            const { checked } = event.target
                                            deferCarRegistrationFilterUpdate(() => {
                                              setCarRegistrationLuckyPairFilters((selected) => (
                                                checked
                                                  ? [...selected, value]
                                                  : selected.filter((selectedValue) => selectedValue !== value)
                                              ))
                                            })
                                          }}
                                        />
                                        {pair}
                                      </label>
                                    )
                                  })}
                                </div>
                              </div>
                            </th>
                            <th
                              scope="col"
                              aria-sort={carRegistrationSortDirection === 'asc'
                                ? 'ascending'
                                : carRegistrationSortDirection === 'desc' ? 'descending' : 'none'}
                            >
                              <button
                                className="car-reg-sort-button"
                                type="button"
                                onClick={() => {
                                  setCarRegistrationSortDirection((direction) => (
                                    direction === 'asc' ? 'desc' : 'asc'
                                  ))
                                  setCarRegistrationPage(0)
                                }}
                              >
                                Registration
                                <span aria-hidden="true">
                                  {carRegistrationSortDirection === 'asc'
                                    ? ' ↑'
                                    : carRegistrationSortDirection === 'desc' ? ' ↓' : ' ↕'}
                                </span>
                              </button>
                            </th>
                            <th scope="col">
                              <div className="car-reg-pair-checks-heading">
                                <span>Pair checks</span>
                                <button
                                  className="car-reg-pair-filter-button"
                                  type="button"
                                  aria-label="Filter car registrations by pair checks"
                                  onClick={() => {
                                    setCarRegistrationPairFilterDraft(
                                      carRegistrationPairFilters.map((filter) => filter.replaceAll(',', ', ')).join('\n'),
                                    )
                                    setCarRegistrationPairFilterError('')
                                    setCarRegistrationPairFilterOpen(true)
                                  }}
                                >
                                  {carRegistrationPairFilters.length > 0
                                    ? `Filter (${carRegistrationPairFilters.length})`
                                    : 'Filter'}
                                </button>
                              </div>
                            </th>
                            <th scope="col">
                              <div className="car-reg-pair-checks-heading">
                                <span>Unique pairs</span>
                                <button
                                  className="car-reg-pair-filter-button"
                                  type="button"
                                  aria-label="Filter car registrations by unique pairs"
                                  onClick={() => {
                                    setCarRegistrationUniquePairFilterDraft(
                                      carRegistrationUniquePairFilters
                                        .map((filter) => filter.replaceAll(',', ', '))
                                        .join('\n'),
                                    )
                                    setCarRegistrationUniquePairFilterError('')
                                    setCarRegistrationUniquePairFilterOpen(true)
                                  }}
                                >
                                  {carRegistrationUniquePairFilters.length > 0
                                    ? `Filter (${carRegistrationUniquePairFilters.length})`
                                    : 'Filter'}
                                </button>
                              </div>
                            </th>
                            <th scope="col">Rajanilai calculation</th>
                            <th scope="col">Rajanilai match</th>
                            <th scope="col">Pair bhavam</th>
                            <th scope="col">
                              <div className="car-reg-digit-sum-filter" role="group" aria-label="Filter car registrations by digit sum">
                                <span>Digit sum</span>
                                <div className="car-reg-digit-sum-options">
                                  {carRegistrationDigitSums.map((digitSum) => {
                                    const value = String(digitSum)
                                    return (
                                      <label key={digitSum}>
                                        <input
                                          type="checkbox"
                                          checked={carRegistrationDigitSumFilters.includes(value)}
                                          onChange={(event) => {
                                            const { checked } = event.target
                                            deferCarRegistrationFilterUpdate(() => {
                                              setCarRegistrationDigitSumFilters((selected) => (
                                                checked
                                                  ? [...selected, value]
                                                  : selected.filter((selectedValue) => selectedValue !== value)
                                              ))
                                            })
                                          }}
                                        />
                                        {digitSum}
                                      </label>
                                    )
                                  })}
                                </div>
                              </div>
                            </th>
                            <th scope="col">Sum bhavam</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedCarRegistrationMatches.map((match, index) => (
                            <tr key={`${match.registration}-${index}`}>
                              <td>{manithaNaadiCombinationResults.profile}</td>
                              <td>{match.pair}</td>
                              <td><strong>{match.registration}</strong></td>
                              <td>{match.checks.join(', ')}</td>
                              <td>{getCanonicalPairChecks(match.checks).replaceAll(',', ', ')}</td>
                              <td>
                                <div className="car-reg-rajanilai-calculation">
                                  {match.checks.map((check, checkIndex) => {
                                    const isMatch = manithaNaadiRajanilaiNumbers.has(Number(check))
                                    return (
                                      <span
                                        className={isMatch ? 'car-reg-rajanilai-pair-match' : 'car-reg-rajanilai-pair-miss'}
                                        key={`${check}-${checkIndex}`}
                                      >
                                        {check} {isMatch ? '✓' : '✗'}
                                      </span>
                                    )
                                  })}
                                </div>
                              </td>
                              <td className={manithaNaadiRajanilaiNumbers.has(match.digitSum) ? 'car-reg-rajanilai-match' : 'car-reg-rajanilai-miss'}>
                                {match.digitSum} {manithaNaadiRajanilaiNumbers.has(match.digitSum) ? '✓✓' : '✗✗'}
                              </td>
                              <td>
                                <div className="car-reg-pair-bhavams" aria-label={`Pair bhavam: ${match.checks.map((check) => rasiChartNumbersByPair.get(check)?.join('/') ?? '—').join(', ')}`}>
                                  {match.checks.map((check, checkIndex) => (
                                    <span className="car-reg-pair-bhavam" key={`${check}-${checkIndex}`}>
                                      {rasiChartNumbersByPair.get(check)?.length
                                        ? rasiChartNumbersByPair.get(check).map((bhavam, bhavamIndex) => (
                                          <span className="rasi-chart-sign-badge" key={`${bhavam}-${bhavamIndex}`}>
                                            {bhavam}
                                          </span>
                                        ))
                                        : '—'}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td>{match.digitSum}</td>
                              <td>
                                <div
                                  className="car-reg-pair-bhavams"
                                  aria-label={`Sum bhavam: ${rasiChartNumbersByPair.get(String(match.digitSum).padStart(2, '0'))?.join('/') ?? '—'}`}
                                >
                                  {rasiChartNumbersByPair.get(String(match.digitSum).padStart(2, '0'))?.length
                                    ? rasiChartNumbersByPair.get(String(match.digitSum).padStart(2, '0')).map((bhavam, bhavamIndex) => (
                                      <span className="rasi-chart-sign-badge" key={`${bhavam}-${bhavamIndex}`}>
                                        {bhavam}
                                      </span>
                                    ))
                                    : '—'}
                                </div>
                              </td>
                            </tr>
                          ))}
                          {visibleCarRegistrationMatches.length === 0 ? (
                            <tr>
                              <td colSpan={9}>
                                {carRegistrationMatches.length === 0
                                  ? 'No registrations were generated.'
                                  : 'No registrations match the selected digit sums.'}
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                    <ResultPagination
                      page={carRegistrationPage}
                      pageSize={CAR_REGISTRATION_PAGE_SIZE}
                      totalItems={visibleCarRegistrationMatches.length}
                      onPageChange={setCarRegistrationPage}
                      label="Car registrations"
                    />
                    {visibleCarRegistrationMatches.length > 0 && (
                      <nav className="car-reg-alphabet-pagination" aria-label="Jump to registrations by starting letter">
                        <span>Start at letter</span>
                        <div>
                          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => {
                            const firstMatchIndex = carRegistrationAlphabetStarts.get(letter)
                            return (
                              <button
                                type="button"
                                key={letter}
                                disabled={firstMatchIndex === undefined}
                                title={firstMatchIndex === undefined
                                  ? `No registrations starting with ${letter}`
                                  : `Go to page ${Math.floor(firstMatchIndex / CAR_REGISTRATION_PAGE_SIZE) + 1}, starting with ${letter}`}
                                aria-label={`Go to registrations starting with ${letter}`}
                                onClick={() => {
                                  if (firstMatchIndex === undefined) return
                                  setCarRegistrationSortDirection('asc')
                                  setCarRegistrationPage(Math.floor(firstMatchIndex / CAR_REGISTRATION_PAGE_SIZE))
                                }}
                              >
                                {letter}
                              </button>
                            )
                          })}
                        </div>
                      </nav>
                    )}
                    {carRegistrationPairFilterOpen && (
                      <div className="car-reg-pair-filter-backdrop">
                        <section
                          className="car-reg-pair-filter-dialog"
                          role="dialog"
                          aria-modal="true"
                          aria-labelledby="car-reg-pair-filter-title"
                        >
                          <div className="car-reg-pair-filter-dialog-heading">
                            <h3 id="car-reg-pair-filter-title">Filter by pair checks</h3>
                            <button
                              className="car-reg-pair-filter-close"
                              type="button"
                              aria-label="Close pair checks filter"
                              onClick={() => setCarRegistrationPairFilterOpen(false)}
                            >
                              ×
                            </button>
                          </div>
                          <form onSubmit={applyCarRegistrationPairFilter}>
                            <label htmlFor="car-reg-pair-filter-input">
                              Enter three pairs per line, separated by commas or entered together.
                            </label>
                            <textarea
                              id="car-reg-pair-filter-input"
                              rows={5}
                              placeholder={'32, 64, 14\n85, 68, 68'}
                              value={carRegistrationPairFilterDraft}
                              onChange={(event) => {
                                setCarRegistrationPairFilterDraft(event.target.value)
                                setCarRegistrationPairFilterError('')
                              }}
                            />
                            {carRegistrationPairFilterError && (
                              <p className="car-reg-pair-filter-error" role="alert">
                                {carRegistrationPairFilterError}
                              </p>
                            )}
                            <div className="car-reg-pair-filter-actions">
                              <button className="combination-generate-button" type="submit">
                                Apply filter
                              </button>
                              <button
                                className="car-reg-pair-filter-clear"
                                type="button"
                                onClick={() => {
                                  setCarRegistrationPairFilters([])
                                  setCarRegistrationPage(0)
                                  setCarRegistrationCombinationPage(0)
                                  setFilteredCarRegistrationPage(0)
                                  setCarRegistrationPairFilterDraft('')
                                  setCarRegistrationPairFilterError('')
                                  setCarRegistrationPairFilterOpen(false)
                                }}
                              >
                                Clear filter
                              </button>
                            </div>
                          </form>
                        </section>
                      </div>
                    )}
                    {carRegistrationUniquePairFilterOpen && (
                      <div className="car-reg-pair-filter-backdrop">
                        <section
                          className="car-reg-pair-filter-dialog"
                          role="dialog"
                          aria-modal="true"
                          aria-labelledby="car-reg-unique-pair-filter-title"
                        >
                          <div className="car-reg-pair-filter-dialog-heading">
                            <h3 id="car-reg-unique-pair-filter-title">Filter by unique pairs</h3>
                            <button
                              className="car-reg-pair-filter-close"
                              type="button"
                              aria-label="Close unique pairs filter"
                              onClick={() => setCarRegistrationUniquePairFilterOpen(false)}
                            >
                              ×
                            </button>
                          </div>
                          <form onSubmit={(event) => applyCarRegistrationPairFilter(event, 'unique')}>
                            <label htmlFor="car-reg-unique-pair-filter-input">
                              Enter three pairs per line, separated by commas or entered together.
                            </label>
                            <textarea
                              id="car-reg-unique-pair-filter-input"
                              rows={5}
                              placeholder={'32, 64, 14\n85, 68, 68'}
                              value={carRegistrationUniquePairFilterDraft}
                              onChange={(event) => {
                                setCarRegistrationUniquePairFilterDraft(event.target.value)
                                setCarRegistrationUniquePairFilterError('')
                              }}
                            />
                            {carRegistrationUniquePairFilterError && (
                              <p className="car-reg-pair-filter-error" role="alert">
                                {carRegistrationUniquePairFilterError}
                              </p>
                            )}
                            <div className="car-reg-pair-filter-actions">
                              <button className="combination-generate-button" type="submit">
                                Apply filter
                              </button>
                              <button
                                className="car-reg-pair-filter-clear"
                                type="button"
                                onClick={() => {
                                  setCarRegistrationUniquePairFilters([])
                                  setCarRegistrationPage(0)
                                  setCarRegistrationCombinationPage(0)
                                  setFilteredCarRegistrationPage(0)
                                  setCarRegistrationUniquePairFilterDraft('')
                                  setCarRegistrationUniquePairFilterError('')
                                  setCarRegistrationUniquePairFilterOpen(false)
                                }}
                              >
                                Clear filter
                              </button>
                            </div>
                          </form>
                        </section>
                      </div>
                    )}
                    {visibleCarRegistrationMatches.length > 0 && (
                      <section className="car-reg-selected-combinations" aria-label="Selected registration combinations">
                        <h3>Selected combinations</h3>
                        <div className="car-reg-combinations-copy-field">
                          <div className="car-reg-copy-field-heading">
                            <span>Unique pairs</span>
                            <CopyListButton
                              copyKey="uniquePairs"
                              label="unique pairs"
                              status={carRegistrationCopyFeedback.uniquePairs}
                              text={carRegistrationUniquePairs.join(', ')}
                              onCopy={copyCarRegistrationList}
                            />
                          </div>
                          <textarea
                            id="car-reg-unique-pairs-copy"
                            aria-label="Unique pairs"
                            rows={4}
                            readOnly
                            value={carRegistrationUniquePairs.join(', ')}
                          />
                        </div>
                        <div className="car-reg-combinations-copy-field">
                          <div className="car-reg-copy-field-heading">
                            <span>Combination ({carRegistrationCombinationCounts.size})</span>
                            <CopyListButton
                              copyKey="combinations"
                              label="all combinations"
                              status={carRegistrationCopyFeedback.combinations}
                              text={carRegistrationCombinationEntries
                                .map(([combination]) => combination)
                                .join('\n')}
                              onCopy={copyCarRegistrationList}
                            />
                          </div>
                          <textarea
                            id="car-reg-combinations-list"
                            aria-label="Combination list"
                            rows={Math.min(12, Math.max(4, pagedCarRegistrationCombinationEntries.length))}
                            readOnly
                            value={pagedCarRegistrationCombinationEntries
                              .map(([combination]) => combination)
                              .join('\n')}
                          />
                        </div>
                        <ResultPagination
                          page={carRegistrationCombinationPage}
                          pageSize={CAR_REGISTRATION_PAGE_SIZE}
                          totalItems={carRegistrationCombinationEntries.length}
                          onPageChange={setCarRegistrationCombinationPage}
                          label="Registration combinations"
                        />
                      </section>
                    )}
                    {(carRegistrationPairFilters.length > 0
                      || carRegistrationUniquePairFilters.length > 0
                      || carRegistrationLuckyPairFilters.length > 0) && (
                      <section className="car-reg-filtered-registrations" aria-label="Filtered registrations">
                        <div className="workspace-results-heading">
                          <h2>Filtered registrations</h2>
                          <div className="car-reg-filtered-actions">
                            <CopyListButton
                              copyKey="filteredRegistrations"
                              label="filtered registrations"
                              status={carRegistrationCopyFeedback.filteredRegistrations}
                              text={filteredCarRegistrations.join('\n')}
                              onCopy={copyCarRegistrationList}
                            />
                            <button
                              className="combination-generate-button"
                              type="button"
                              onClick={exportFilteredCarRegistrations}
                              disabled={visibleCarRegistrationMatches.length === 0}
                            >
                              Download as Excel
                            </button>
                          </div>
                        </div>
                        <div className="car-reg-selected-table-wrap">
                          <table className="car-reg-selected-table">
                            <thead>
                              <tr><th scope="col">Registration</th></tr>
                            </thead>
                            <tbody>
                              {pagedFilteredCarRegistrations.map((registration) => (
                                <tr key={registration}><td>{registration}</td></tr>
                              ))}
                              {visibleCarRegistrationMatches.length === 0 && (
                                <tr><td>No registrations match the selected filters.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <ResultPagination
                          page={filteredCarRegistrationPage}
                          pageSize={CAR_REGISTRATION_PAGE_SIZE}
                          totalItems={filteredCarRegistrations.length}
                          onPageChange={setFilteredCarRegistrationPage}
                          label="Filtered registrations"
                        />
                      </section>
                    )}
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
            <section className="manual-combination-generator" aria-labelledby="manual-combination-generator-title">
              <div className="workspace-results-heading">
                <div>
                  <span className="results-kicker">
                    {(manualCombinationResults?.profile ?? selectedManithaNaadiInitials)} LUCKY NUMBERS
                  </span>
                  <h2 id="manual-combination-generator-title">Generate number combinations</h2>
                </div>
              </div>
              <form className="manual-combination-form" onSubmit={generateManualCombinations}>
                <label htmlFor="manual-combination-target">
                  <span>Number to match</span>
                  <input
                    id="manual-combination-target"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="64"
                    value={manualCombinationTarget}
                    onChange={(event) => setManualCombinationTarget(event.target.value)}
                  />
                </label>
                <button className="combination-generate-button" type="submit">Generate</button>
              </form>
              {manualCombinationError ? (
                <p className="manual-combination-error" role="alert">{manualCombinationError}</p>
              ) : null}
              {manualCombinationResults ? (
                <div className="manual-combination-results" aria-live="polite">
                  {[
                    { title: '6 combo', rows: manualCombinationResults.gen6 },
                    { title: '8 combo', rows: manualCombinationResults.gen8 },
                  ].map(({ title, rows }) => (
                    <section className="workspace-result-group" key={title}>
                      <h3>{title}<span>{rows.length} combinations</span></h3>
                      <div className="manitha-results-table-wrap">
                        <table className="manitha-results-table" aria-label={`${title} results`}>
                          <thead>
                            <tr>
                              {manithaNaadiTableHeaders.slice(1).map((heading) => (
                                <th scope="col" key={heading}>{heading}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.length === 0 ? (
                              <tr><td colSpan={5}>No combinations found for {manualCombinationResults.targets.join(', ')}.</td></tr>
                            ) : rows.map((row, index) => (
                              <tr key={`${row[1]}-${index}`}>
                                {row.map((value, columnIndex) => (
                                  <td key={`${columnIndex}-${value}`}>{value}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  ))}
                </div>
              ) : null}
            </section>
          </section>
        ) : activePage === 'vipnumbers' ? (
          <RegNumbersPage
            heading={<span id="vipnumbers-title">phoneovernet</span>}
            profiles={Object.keys(manithaNaadiLuckyNumberDefaults)}
            initials={selectedManithaNaadiInitials}
            onInitialsChange={setSelectedManithaNaadiInitials}
            luckyNumbers={manithaNaadiLuckyNumbers[selectedManithaNaadiInitials]}
            onLuckyNumbersChange={(value) => setManithaNaadiLuckyNumbers((currentValues) => ({
              ...currentValues,
              [selectedManithaNaadiInitials]: value,
            }))}
            excludedNumbers={manithaNaadiGen8ExcludedNumbers[selectedManithaNaadiInitials]}
            onExcludedNumbersChange={(value) => setManithaNaadiGen8ExcludedNumbers((currentValues) => ({
              ...currentValues,
              [selectedManithaNaadiInitials]: value,
            }))}
          />
        ) : activePage === 'regnumbers' ? (
          <RegNumbersPage
            pageId="regnumbers"
            titleId="regnumbers-title"
            heading={<span id="regnumbers-title">REGNUMBERS</span>}
            loadNumbers={async () => (await import('../regnumbers.json')).default}
            numberPattern={/^P88[A-Z]{3}$/}
            toCalculationDigits={toRegNumberCalculationDigits}
            pairStartIndex={0}
            registrationLayout
            prefixLength={4}
            brandName="REGNUMBERS"
            itemName="registration numbers"
            buttonName="RegNumbers"
            headingItemName="RegNumbers"
            countLabel="REGNUMBERS"
            profiles={Object.keys(manithaNaadiLuckyNumberDefaults)}
            initials={selectedManithaNaadiInitials}
            onInitialsChange={setSelectedManithaNaadiInitials}
            luckyNumbers={manithaNaadiLuckyNumbers[selectedManithaNaadiInitials]}
            onLuckyNumbersChange={(value) => setManithaNaadiLuckyNumbers((currentValues) => ({
              ...currentValues,
              [selectedManithaNaadiInitials]: value,
            }))}
            excludedNumbers={manithaNaadiGen8ExcludedNumbers[selectedManithaNaadiInitials]}
            onExcludedNumbersChange={(value) => setManithaNaadiGen8ExcludedNumbers((currentValues) => ({
              ...currentValues,
              [selectedManithaNaadiInitials]: value,
            }))}
          />
        ) : activePage === 'password' ? (
          <PasswordPage />
        ) : activePage === 'name2number' ? (
          <Name2NumberPage />
        ) : (
          <PanjaPatchiPage />
        )}
      </section>

      <footer className="page-footer">
        <span>NUMBER SIGNAL <span className="footer-separator">/</span> {activePage === 'manitha-naadi' ? 'மனித நாடி LUCKY NUMBERS' : activePage === 'password' ? 'PASSWORD GENERATOR' : activePage === 'panja-patchi' ? 'பஞ்ச பட்சி' : activePage === 'name2number' ? 'NAME2NUMBER' : activePage === 'vipnumbers' ? 'PHONEOVERNET' : activePage === 'regnumbers' ? 'REGNUMBERS' : 'மனித நாடி LUCKY NUMBERS'}</span>
        <span>EDITABLE IN THIS BROWSER</span>
      </footer>
      {isButtonActionLoading && (
        <div className="button-action-loading-overlay" role="status" aria-live="polite" aria-label="Loading">
          <div className="button-action-loading-content">
            <span className="button-action-loading-logo" aria-hidden="true">n.</span>
            <span>Loading, please wait...</span>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
