import { useMemo, useState } from 'react'
import './Name2NumberPage.css'
import CopyTextButton from './CopyTextButton'
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

const defaultRajanilaiNumbers = '2, 4, 6, 8, 10, 12, 14, 16, 20, 22, 26, 32, 33, 39, 41, 42, 45, 51, 52, 54, 56, 64, 66, 68, 72, 73, 74, 77, 79, 80, 84, 85, 87, 88, 89, 92, 93, 95, 97, 99'
const MAX_RAJANILAI_SUM = 999
const MAX_RAJANILAI_SUM_COMBINATIONS = 10000

function xmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[character])
}

function getNameResult(name, rajanilaiSet) {
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
  const pairIndexes = characterValues.length === 3
    ? [[0, 1], [1, 2]]
    : characterValues.length % 2 === 0
      ? Array.from({ length: characterValues.length / 2 }, (_, index) => [index * 2, index * 2 + 1])
      : characterValues.length >= 5
        ? [
          ...Array.from({ length: Math.floor(characterValues.length / 2) }, (_, index) => [index * 2, index * 2 + 1]),
          [characterValues.length - 2, characterValues.length - 1],
        ]
        : []
  const rajanilaiPairs = pairIndexes.map(([firstIndex, secondIndex]) => {
    const number = characterValues[firstIndex].value * 10 + characterValues[secondIndex].value
    return { number, matches: rajanilaiSet.has(String(number)) }
  })

  return {
    name,
    characterValues,
    total,
    st: characterValues.length > 1
      ? `${characterValues[0].value}${characterValues[1].value}`
      : characterValues[0]?.value ?? '',
    name2number: Array.from(
      { length: Math.ceil(characterValues.length / 2) },
      (_, index) => characterValues.slice(index * 2, index * 2 + 2)
        .map(({ value }) => value)
        .join(''),
    ).join(','),
    sum: characterValues.map(({ value }) => value).join('+'),
    rajanilaiPairs,
    rajanilaiMatch: rajanilaiPairs.length > 0 && rajanilaiPairs.every(({ matches }) => matches),
  }
}

function parseRajanilaiNumbers(value) {
  return new Set(
    value
      .split(/[,\s]+/)
      .filter((number) => /^\d+$/.test(number))
      .map((number) => number.replace(/^0+(?=\d)/, '')),
  )
}

function findRajanilaiSumCombinations(target, rajanilaiSet, combinationLength) {
  const numbers = [...rajanilaiSet]
    .map(Number)
    .filter((number) => Number.isSafeInteger(number) && number > 0 && number <= target)
    .sort((first, second) => first - second)
  const combinations = []
  const selectedNumbers = []

  function visit(startIndex, remaining) {
    if (selectedNumbers.length === combinationLength) {
      if (remaining !== 0) return false
      if (combinations.length === MAX_RAJANILAI_SUM_COMBINATIONS) return true
      combinations.push(selectedNumbers.map((number) => String(number).padStart(2, '0')).join(', '))
      return false
    }

    for (let index = startIndex; index < numbers.length; index += 1) {
      const number = numbers[index]
      if (number > remaining) break
      selectedNumbers.push(number)
      const exceededLimit = visit(index, remaining - number)
      selectedNumbers.pop()
      if (exceededLimit) return true
    }

    return false
  }

  return {
    combinations,
    exceededLimit: visit(0, target),
  }
}

function generateNonRajanilaiNumbers(prefix, rajanilaiSet) {
  const excludedLowPairs = new Set(['00', '01', '02', '03', '05', '07', '09'])
  const allowedPairs = Array.from({ length: 100 }, (_, value) => String(value).padStart(2, '0'))
    .filter((pair) => !excludedLowPairs.has(pair) && !rajanilaiSet.has(String(Number(pair))))
  const prefixDigitSum = [...prefix].reduce((sum, digit) => sum + Number(digit), 0)
  let validNumberCount = 0

  function visitValidNumbers(onNumber) {
    function visitPairs(selectedPairs, digitSum) {
      if (selectedPairs.length === 4) {
        if (!rajanilaiSet.has(String(digitSum))) {
          return onNumber(`${prefix}${selectedPairs.join('')}`, digitSum)
        }
        return false
      }

      for (const pair of allowedPairs) {
        if (pair === prefix || selectedPairs.includes(pair)) continue
        const pairDigitSum = Number(pair[0]) + Number(pair[1])
        if (visitPairs([...selectedPairs, pair], digitSum + pairDigitSum)) return true
      }

      return false
    }

    return visitPairs([], prefixDigitSum)
  }

  visitValidNumbers(() => {
    validNumberCount += 1
    return false
  })
  const sampleCount = Math.min(10, validNumberCount)
  const targetIndexes = new Set(Array.from(
    { length: sampleCount },
    (_, index) => sampleCount === 1
      ? 0
      : Math.floor(index * (validNumberCount - 1) / (sampleCount - 1)),
  ))
  const numbers = []
  let currentIndex = 0

  visitValidNumbers((number, digitSum) => {
    if (targetIndexes.has(currentIndex)) {
      numbers.push({
        number,
        digitSum,
        digitSumCalculation: `${[...number].join('+')}=${digitSum}`,
      })
    }
    currentIndex += 1
    return numbers.length === sampleCount
  })

  return numbers
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

function parseRegistrationList(text) {
  const registrations = []
  const invalidLines = []
  const seen = new Set()

  text.split(/\r?\n/).forEach((line, index) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    const entries = trimmedLine.split(',').map((entry) => entry.replace(/\s/g, '').toUpperCase())
    if (entries.some((entry) => !/^[A-Z0-9]+$/.test(entry))) {
      invalidLines.push(index + 1)
      return
    }

    entries.forEach((entry) => {
      if (seen.has(entry)) return
      seen.add(entry)
      registrations.push(entry)
    })
  })

  return { registrations, invalidLines }
}

function compareRegistrationLists(textA, textB) {
  const parsedA = parseRegistrationList(textA)
  const parsedB = parseRegistrationList(textB)
  const isRepresented = (registration, otherRegistrations) => otherRegistrations.some(
    (other) => registration.startsWith(other) || other.startsWith(registration),
  )

  return {
    unusedA: parsedA.registrations
      .filter((registration) => !isRepresented(registration, parsedB.registrations)),
    unusedB: parsedB.registrations
      .filter((registration) => !isRepresented(registration, parsedA.registrations)),
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

function getCombinationPairOrderKey(combination) {
  const compactCombination = combination.replace(/\s/g, '')
  if (/^\d+$/.test(compactCombination) && compactCombination.length >= 4 && compactCombination.length % 2 === 0) {
    return compactCombination.match(/\d{2}/g).sort().join('')
  }

  return combination
    .split(',')
    .map((value) => value.trim().replace(/^0+(?=\d)/, ''))
    .sort((first, second) => {
      const firstValue = BigInt(first)
      const secondValue = BigInt(second)
      return firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0
    })
    .join(',')
}

function getUniqueCombinationPairs(combinations) {
  return [...new Set(combinations.flatMap((combination) => {
    const values = combination.split(',').map((value) => value.trim())
    return values.every((value) => /^\d{2}$/.test(value))
      ? values
      : (combination.replace(/\D/g, '').match(/\d{2}/g) ?? [])
  }))]
}

export default function Name2NumberPage() {
  const [name, setName] = useState('')
  const [rajanilaiNumbers, setRajanilaiNumbers] = useState(defaultRajanilaiNumbers)
  const rajanilaiSet = useMemo(() => parseRajanilaiNumbers(rajanilaiNumbers), [rajanilaiNumbers])
  const [rajanilaiSumInput, setRajanilaiSumInput] = useState('')
  const [rajanilaiSumResults, setRajanilaiSumResults] = useState(null)
  const [rajanilaiSumError, setRajanilaiSumError] = useState('')
  const [nonRajanilaiPrefix, setNonRajanilaiPrefix] = useState('')
  const [nonRajanilaiResults, setNonRajanilaiResults] = useState(null)
  const [digitSumInput, setDigitSumInput] = useState('')
  const [digitSumResults, setDigitSumResults] = useState(null)
  const [invalidDigitSumEntries, setInvalidDigitSumEntries] = useState([])
  const [regNumberInputA, setRegNumberInputA] = useState('')
  const [regNumberInputB, setRegNumberInputB] = useState('')
  const [unusedRegNumbers, setUnusedRegNumbers] = useState(null)
  const [unusedRegNumberCopyStatus, setUnusedRegNumberCopyStatus] = useState({})
  const [generatedNames, setGeneratedNames] = useState(null)
  const [selectedInitials, setSelectedInitials] = useState('MJ')
  const [bhavamFilter, setBhavamFilter] = useState('')
  const [combinationList, setCombinationList] = useState('')
  const [numberToInclude, setNumberToInclude] = useState('')
  const [excludeFromCombinations, setExcludeFromCombinations] = useState('')
  const [excludedNumbers, setExcludedNumbers] = useState('')
  const [uniqueCombinations, setUniqueCombinations] = useState(null)
  const [invalidCombinationLines, setInvalidCombinationLines] = useState([])
  const [selectedIncludingNumberTotals, setSelectedIncludingNumberTotals] = useState([])
  const includedNumberDigitSum = /^\d+$/.test(numberToInclude)
    ? [...numberToInclude].reduce((sum, digit) => sum + Number(digit), 0)
    : null
  const mobileListA = defaultMobileListA
  const mobileListB = defaultMobileListB
  const [unusedMobileNumbers, setUnusedMobileNumbers] = useState(null)
  const [customListA, setCustomListA] = useState('')
  const [customListB, setCustomListB] = useState('')
  const [unusedCustomNumbers, setUnusedCustomNumbers] = useState(null)
  const combinationRowCount = combinationList.split(/\r?\n/).filter((line) => line.trim()).length
  const excludedRowCount = excludedNumbers.split(/\r?\n/).filter((line) => line.trim()).length
  const results = useMemo(
    () => (generatedNames ?? []).map((generatedName) => getNameResult(generatedName, rajanilaiSet)),
    [generatedNames, rajanilaiSet],
  )

  function matchRajanilaiSum(event, generator) {
    event.preventDefault()
    const input = rajanilaiSumInput.trim()
    const target = Number(input)
    if (!/^\d+$/.test(input) || !Number.isSafeInteger(target) || target < 2) {
      setRajanilaiSumError('Enter a whole-number Rajanilai sum of at least 2.')
      setRajanilaiSumResults(null)
      return
    }
    if (target > MAX_RAJANILAI_SUM) {
      setRajanilaiSumError(`Enter a Rajanilai sum no greater than ${MAX_RAJANILAI_SUM}.`)
      setRajanilaiSumResults(null)
      return
    }

    const combinationLength = generator === 'GEN-4' ? 2 : generator === 'GEN-6' ? 3 : 4
    const { combinations, exceededLimit } = findRajanilaiSumCombinations(
      target,
      rajanilaiSet,
      combinationLength,
    )
    if (exceededLimit) {
      setRajanilaiSumError(
        `More than ${MAX_RAJANILAI_SUM_COMBINATIONS.toLocaleString()} combinations match. Enter a lower sum to show all results.`,
      )
      setRajanilaiSumResults(null)
      return
    }

    setRajanilaiSumError('')
    setRajanilaiSumResults({ generator, combinations })
  }
  const validResults = results.filter(({ characterValues }) => characterValues.length > 0)
  const filteredValidResults = validResults.filter((result) => {
    const filters = bhavamFilter.split(',').map((value) => value.trim()).filter(Boolean)
    if (filters.length === 0) return true

    const bhavams = getRasiBhavam(result.name2number, selectedInitials)
      .split(',')
      .map((value) => value.trim())
    return !filters.some((filter) => bhavams.includes(filter))
  })
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
      totalWithIncludedNumber: includedNumberDigitSum === null ? null : digitSum + includedNumberDigitSum,
    }
  }) ?? []
  const uniqueIncludingNumberTotals = [...new Set(
    uniqueCombinationsWithSums
      .map(({ totalWithIncludedNumber }) => totalWithIncludedNumber)
      .filter((total) => total !== null),
  )].sort((first, second) => first - second)
  const selectedCombinations = uniqueCombinationsWithSums.reduce((selected, entry) => {
    if (!selectedIncludingNumberTotals.includes(String(entry.totalWithIncludedNumber))) return selected

    const key = getCombinationPairOrderKey(entry.combination)
    if (selected.some(({ key: selectedKey }) => selectedKey === key)) return selected
    selected.push({ ...entry, key })
    return selected
  }, [])

  function findUniqueCombinations(event) {
    event.preventDefault()
    setSelectedIncludingNumberTotals([])
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

  function findUnusedRegNumbers() {
    setUnusedRegNumbers(compareRegistrationLists(regNumberInputA, regNumberInputB))
    setUnusedRegNumberCopyStatus({})
  }

  async function copyUnusedRegNumbers(listKey) {
    const text = unusedRegNumbers?.[listKey].join('\n') ?? ''
    if (!text) return

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable in this browser.')
      }
      await navigator.clipboard.writeText(text)
      setUnusedRegNumberCopyStatus((current) => ({
        ...current,
        [listKey]: { success: true, message: 'List copied to clipboard.' },
      }))
    } catch (error) {
      setUnusedRegNumberCopyStatus((current) => ({
        ...current,
        [listKey]: {
          success: false,
          message: error instanceof Error ? error.message : 'Could not copy the list.',
        },
      }))
    }
  }

  function downloadExcel() {
    const style = (id, { background, bold = false, size = 11, color }) => (
      `<Style ss:ID="${id}"><Alignment ss:Vertical="Center" ss:WrapText="1"/>`
      + `<Font ss:FontName="Calibri" ss:Size="${size}"${bold ? ' ss:Bold="1"' : ''}${color ? ` ss:Color="${color}"` : ''}/>`
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
      ${style('Match', { bold: true, size: 12, color: '#1D6B43' })}
      ${style('NoMatch', { bold: true, size: 12, color: '#C62828' })}
    </Styles>`
    const headers = ['Name', 'st', 'total', 'name2numb', 'sum', 'bhavam', 'Rajanilai calculation', 'Rajanilai match']
    const row = (items, styleId, height, cellStyles = []) => (
      `<Row ss:AutoFitHeight="0" ss:Height="${height}">${items.map((value, index) => (
        `<Cell ss:StyleID="${cellStyles[index] ?? styleId}"><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`
      )).join('')}</Row>`
    )
    const dataRows = validResults.map(({ name: resultName, st, total, name2number, sum, rajanilaiPairs, rajanilaiMatch }) => (
      row([
        resultName,
        st,
        total,
        name2number,
        `${sum}=${total}`,
        getRasiBhavam(name2number, selectedInitials),
        rajanilaiPairs.map(({ number, matches }) => `${number} ${matches ? '✓' : '✗'}`).join(', ') || '—',
        `${total} ${rajanilaiMatch ? '✓✓' : '✗✗'}`,
      ], 'Body', 32, Array(7).fill('Body').concat(rajanilaiMatch ? 'Match' : 'NoMatch'))
    ))
    const workbook = `<?xml version="1.0"?>
      <?mso-application progid="Excel.Sheet"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
        ${workbookStyles}
        <Worksheet ss:Name="Name2Number">
          <Table>
            <Column ss:Width="120"/><Column ss:Width="60"/><Column ss:Width="70"/><Column ss:Width="140"/><Column ss:Width="230"/><Column ss:Width="100"/><Column ss:Width="180"/><Column ss:Width="90"/>
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

      <label className="name2number-rajanilai-field" htmlFor="name2number-rajanilai-numbers">
        <span>Rajanilai Numbers</span>
        <input
          id="name2number-rajanilai-numbers"
          type="text"
          value={rajanilaiNumbers}
          onChange={(event) => {
            setRajanilaiNumbers(event.target.value)
            setNonRajanilaiResults(null)
            setRajanilaiSumResults(null)
            setRajanilaiSumError('')
          }}
          autoComplete="off"
          spellCheck="false"
        />
      </label>

      <form
        className="name2number-form"
        onSubmit={(event) => {
          event.preventDefault()
          setGeneratedNames(name.split(/[,\r\n]+/).map((part) => part.trim()).filter(Boolean))
        }}
      >
        <label className="name2number-field" htmlFor="name2number-input">
          <span>ENTER A NAME</span>
          <textarea
            id="name2number-input"
            autoComplete="off"
            value={name}
            rows={3}
            onChange={(event) => {
              setName(event.target.value)
              setGeneratedNames(null)
            }}
            placeholder="For example: ANNA or ANNA, MARIA"
            aria-describedby="name2number-help"
            spellCheck="false"
          />
          <span id="name2number-help" className="name2number-help">
            Commas or new lines separate names; spaces within a name stay together. Other punctuation is ignored.
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
            <CopyTextButton
              label="name number results"
              text={filteredValidResults.map(({ name: resultName, name2number }) => `${resultName}\t${name2number}`).join('\n')}
            />
            <div className="name2number-result-table-wrap">
              <table className="name2number-result-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">st</th>
                    <th scope="col">total</th>
                    <th scope="col">name2numb</th>
                    <th scope="col">sum</th>
                    <th scope="col">
                      <label className="name2number-bhavam-filter">
                        <span>bhavam</span>
                        <input
                          type="search"
                          aria-label="Filter results by Bhavam"
                          placeholder="e.g. 10, 1"
                          value={bhavamFilter}
                          onChange={(event) => setBhavamFilter(event.target.value)}
                        />
                      </label>
                    </th>
                    <th scope="col">Rajanilai calculation</th>
                    <th scope="col">Rajanilai match</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredValidResults.map(({ name: resultName, st, total, name2number, sum, rajanilaiPairs, rajanilaiMatch }, index) => (
                    <tr key={`${resultName}-${index}`}>
                      <td>{resultName}</td>
                      <td>{st}</td>
                      <td>{total}</td>
                      <td>{name2number}</td>
                      <td>{sum}={total}</td>
                      <td>{getRasiBhavam(name2number, selectedInitials)}</td>
                      <td className="name2number-rajanilai-calculation">
                        {rajanilaiPairs.length > 0
                          ? rajanilaiPairs.map(({ number, matches }, pairIndex) => (
                            <span className={matches ? 'name2number-rajanilai-pair-match' : 'name2number-rajanilai-pair-miss'} key={`${number}-${pairIndex}`}>
                              {number} {matches ? '✓' : '✗'}
                            </span>
                          ))
                          : '—'}
                      </td>
                      <td className={rajanilaiMatch ? 'name2number-rajanilai-match' : 'name2number-rajanilai-miss'}>
                        {total} {rajanilaiMatch ? '✓✓' : '✗✗'}
                      </td>
                    </tr>
                  ))}
                  {filteredValidResults.length === 0 ? (
                    <tr><td colSpan={8}>No results match this Bhavam filter.</td></tr>
                  ) : null}
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
                  setSelectedIncludingNumberTotals([])
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
                  setSelectedIncludingNumberTotals([])
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
                  setSelectedIncludingNumberTotals([])
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
                    <CopyTextButton
                      label="unique combinations"
                      text={uniqueCombinationsWithSums.map(({ combination }) => combination).join('\n')}
                    />
                    <div className="name2number-unique-table-wrap">
                      <table className="name2number-unique-table">
                        <thead>
                          <tr>
                            <th scope="col">Combination</th>
                            <th scope="col">Total digit sum</th>
                            <th className="name2number-included-number-heading" scope="col">
                              <span>Including</span>
                              <label className="name2number-included-number-label" htmlFor="name2number-include-number">
                                <span className="visually-hidden">Number to include in total</span>
                                <input
                                  id="name2number-include-number"
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={4}
                                  value={numberToInclude}
                                  placeholder="Number"
                                  onChange={(event) => {
                                    setNumberToInclude(event.target.value.replace(/\D/g, '').slice(0, 4))
                                    setSelectedIncludingNumberTotals([])
                                  }}
                                />
                              </label>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {uniqueCombinationsWithSums.map(({ combination, digitSum, totalWithIncludedNumber }) => (
                            <tr key={combination}>
                              <td>{combination}</td>
                              <td>{digitSum}</td>
                              <td>{totalWithIncludedNumber ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="name2number-unique-number-list" aria-label="Unique numbers">
                      <strong>Unique numbers:</strong> {uniqueNumbers.join(', ')}
                    </p>
                    <CopyTextButton label="unique numbers" text={uniqueNumbers.join('\n')} />
                    <div className="name2number-including-number-filter">
                      <span>Filter by “Including {numberToInclude || 'number'}” total</span>
                      <details
                        className="name2number-including-number-dropdown"
                        aria-describedby="name2number-including-number-help"
                      >
                        <summary>
                          {selectedIncludingNumberTotals.length > 0
                            ? `${selectedIncludingNumberTotals.length} total${selectedIncludingNumberTotals.length === 1 ? '' : 's'} selected`
                            : 'Select totals'}
                        </summary>
                        <div className="name2number-including-number-options" role="group" aria-label={`Including ${numberToInclude || 'number'} totals`}>
                          {uniqueIncludingNumberTotals.map((total) => {
                            const value = String(total)
                            const inputId = `name2number-including-number-${value}`
                            return (
                              <label htmlFor={inputId} key={total}>
                                <input
                                  id={inputId}
                                  type="checkbox"
                                  checked={selectedIncludingNumberTotals.includes(value)}
                                  onChange={(event) => {
                                    setSelectedIncludingNumberTotals((selected) => (
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
                      <span id="name2number-including-number-help" className="name2number-unique-help">
                        Select one or more totals to show their matching combinations.
                      </span>
                    </div>
                    {selectedIncludingNumberTotals.length > 0 ? (
                      <div className="name2number-selected-combinations">
                        <p>Selected combinations</p>
                        <CopyTextButton
                          label="selected combinations"
                          text={selectedCombinations.map(({ combination }) => combination).join('\n')}
                        />
                        <div className="name2number-unique-table-wrap">
                          <table className="name2number-unique-table">
                            <thead>
                              <tr>
                                <th scope="col">Combination</th>
                                <th scope="col">Unique pairs</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedCombinations.length > 0 ? selectedCombinations.map(({ combination }, index) => (
                                <tr key={combination}>
                                  <td>{combination}</td>
                                  {index === 0 ? (
                                    <td rowSpan={selectedCombinations.length}>
                                      {getUniqueCombinationPairs(selectedCombinations.map(({ combination: value }) => value)).join(', ')}
                                    </td>
                                  ) : null}
                                </tr>
                              )) : (
                                <tr><td colSpan={2}>No combinations match the selected totals.</td></tr>
                              )}
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
      <section className="name2number-non-rajanilai" aria-labelledby="name2number-non-rajanilai-title">
        <h2 id="name2number-non-rajanilai-title">Generate Non-Rajanilai Numbers</h2>
        <p className="name2number-non-rajanilai-help">
          Keep your first pair and generate four more distinct pairs. Every generated pair and the full digit sum must be absent from the Rajanilai list.
        </p>
        <form
          className="name2number-non-rajanilai-form"
          onSubmit={(event) => {
            event.preventDefault()
            setNonRajanilaiResults(generateNonRajanilaiNumbers(nonRajanilaiPrefix, rajanilaiSet))
          }}
        >
          <label htmlFor="name2number-non-rajanilai-prefix">First pair (generates 10-digit numbers)</label>
          <input
            id="name2number-non-rajanilai-prefix"
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={nonRajanilaiPrefix}
            placeholder="e.g. 74"
            onChange={(event) => {
              setNonRajanilaiPrefix(event.target.value.replace(/\D/g, '').slice(0, 2))
              setNonRajanilaiResults(null)
            }}
            required
          />
          <button className="name2number-button" type="submit" disabled={nonRajanilaiPrefix.length !== 2}>
            gen-non-rajanilai-numbers
          </button>
        </form>
        {nonRajanilaiResults !== null ? (
          <div className="name2number-non-rajanilai-results" aria-live="polite">
            <p>{nonRajanilaiResults.length.toLocaleString()} matching numbers (up to 10)</p>
            {nonRajanilaiResults.length > 0 ? (
              <>
                <CopyTextButton
                  label="generated numbers"
                  text={nonRajanilaiResults.map(({ number }) => number).join('\n')}
                />
                <div className="name2number-non-rajanilai-table-wrap">
                  <table className="name2number-non-rajanilai-table">
                    <thead>
                      <tr>
                        <th scope="col">Number</th>
                        <th scope="col">Digit sum calculation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nonRajanilaiResults.map(({ number, digitSumCalculation }) => (
                        <tr key={number}>
                          <td>{number}</td>
                          <td>{digitSumCalculation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p>No valid numbers were found for this first pair and Rajanilai list.</p>
            )}
          </div>
        ) : null}
      </section>
      <section className="name2number-non-rajanilai" aria-labelledby="name2number-generate-digitsum-title">
        <h2 id="name2number-generate-digitsum-title">Generate Digitsum</h2>
        <p className="name2number-non-rajanilai-help">
          Enter comma-separated number groups, one group per line, to calculate each digit sum.
        </p>
        <form
          className="name2number-non-rajanilai-form name2number-digit-sum-form"
          onSubmit={(event) => {
            event.preventDefault()
            const inputGroups = digitSumInput.split(/\r?\n/).map((group) => group.trim()).filter(Boolean)
            const validGroups = []
            const invalidGroups = []

            inputGroups.forEach((group) => {
              const numberValues = group.split(',').map((number) => number.trim())
              if (numberValues.some((number) => !/^\d+$/.test(number))) {
                invalidGroups.push(group)
                return
              }

              const digits = numberValues.flatMap((number) => [...number])
              const digitSum = digits.reduce((total, digit) => total + Number(digit), 0)
              validGroups.push({
                number: numberValues.join(', '),
                digitSumCalculation: `${digits.join(' + ')} = ${digitSum}`,
                digitSum,
              })
            })

            setDigitSumResults(validGroups)
            setInvalidDigitSumEntries(invalidGroups)
          }}
        >
          <label htmlFor="name2number-digit-sum-input">Numbers</label>
          <textarea
            id="name2number-digit-sum-input"
            className="name2number-digit-sum-input"
            value={digitSumInput}
            onChange={(event) => {
              setDigitSumInput(event.target.value)
              setDigitSumResults(null)
              setInvalidDigitSumEntries([])
            }}
            placeholder="e.g. 04, 39, 68, 88"
            rows={3}
            required
          />
          <button className="name2number-button" type="submit" disabled={!digitSumInput.trim()}>
            Generate Digitsum
          </button>
        </form>
        {digitSumResults !== null ? (
          <div className="name2number-non-rajanilai-results" aria-live="polite">
            {invalidDigitSumEntries.length > 0 && (
              <p className="name2number-message" role="alert">
                Invalid entries were skipped: {invalidDigitSumEntries.join(', ')}.
              </p>
            )}
            {digitSumResults.length > 0 ? (
              <>
                <CopyTextButton
                  label="digit sum results"
                  text={digitSumResults.map(({ number, digitSumCalculation, digitSum }) => `${number}\t${digitSumCalculation}\t${digitSum}`).join('\n')}
                />
                <div className="name2number-non-rajanilai-table-wrap">
                  <table className="name2number-non-rajanilai-table">
                    <thead>
                      <tr>
                        <th scope="col">Number</th>
                        <th scope="col">Digit sum calculation</th>
                        <th scope="col">Digit sum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {digitSumResults.map(({ number, digitSumCalculation, digitSum }, index) => (
                        <tr key={`${number}-${index}`}>
                          <td>{number}</td>
                          <td>{digitSumCalculation}</td>
                          <td>{digitSum}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p>No valid whole numbers were entered.</p>
            )}
          </div>
        ) : null}
      </section>
      <section className="name2number-unused-regnumbers" aria-labelledby="name2number-unused-regnumbers-title">
        <h2 id="name2number-unused-regnumbers-title">Unused RegNumber</h2>
        <div className="name2number-regnumber-fields">
          <label className="name2number-regnumber-field" htmlFor="name2number-regnumber-a">
            <span>Input A</span>
            <textarea
              id="name2number-regnumber-a"
              value={regNumberInputA}
              onChange={(event) => {
                setRegNumberInputA(event.target.value)
                setUnusedRegNumbers(null)
              }}
              rows={8}
              spellCheck="false"
            />
          </label>
          <label className="name2number-regnumber-field" htmlFor="name2number-regnumber-b">
            <span>Input B</span>
            <textarea
              id="name2number-regnumber-b"
              value={regNumberInputB}
              onChange={(event) => {
                setRegNumberInputB(event.target.value)
                setUnusedRegNumbers(null)
              }}
              rows={8}
              spellCheck="false"
            />
          </label>
        </div>
        <button
          className="name2number-button name2number-unused-regnumber-button"
          type="button"
          onClick={findUnusedRegNumbers}
          disabled={!regNumberInputA.trim() && !regNumberInputB.trim()}
        >
          Custom unused numbers
        </button>
        {unusedRegNumbers ? (
          <>
            {unusedRegNumbers.invalidA.length > 0 || unusedRegNumbers.invalidB.length > 0 ? (
              <p className="name2number-message" role="alert">
                Invalid registrations were skipped
                {unusedRegNumbers.invalidA.length > 0
                  ? ` in Input A on lines ${unusedRegNumbers.invalidA.join(', ')}` : ''}
                {unusedRegNumbers.invalidB.length > 0
                  ? ` in Input B on lines ${unusedRegNumbers.invalidB.join(', ')}` : ''}.
                Use letters and digits, one registration per line or comma-separated.
              </p>
            ) : null}
            <div className="name2number-unused-regnumber-results" aria-live="polite">
              <section aria-labelledby="name2number-unused-regnumber-not-in-b-title">
                <div className="name2number-regnumber-result-heading">
                  <h3 id="name2number-unused-regnumber-not-in-b-title">Unused RegNumber not in B</h3>
                  <button
                    className="name2number-button name2number-regnumber-copy-button"
                    type="button"
                    disabled={unusedRegNumbers.unusedA.length === 0}
                    onClick={() => copyUnusedRegNumbers('unusedA')}
                  >
                    {unusedRegNumberCopyStatus.unusedA?.success ? 'Copied' : 'Copy list'}
                  </button>
                </div>
                <pre>{unusedRegNumbers.unusedA.length > 0 ? unusedRegNumbers.unusedA.join('\n') : 'None'}</pre>
                <div className="name2number-regnumber-copy-action">
                  {unusedRegNumberCopyStatus.unusedA ? (
                    <span
                      className={unusedRegNumberCopyStatus.unusedA.success
                        ? 'name2number-copy-success'
                        : 'name2number-copy-error'}
                      role="status"
                    >
                      {unusedRegNumberCopyStatus.unusedA.message}
                    </span>
                  ) : null}
                </div>
              </section>
              <section aria-labelledby="name2number-unused-regnumber-not-in-a-title">
                <div className="name2number-regnumber-result-heading">
                  <h3 id="name2number-unused-regnumber-not-in-a-title">Unused RegNumber not in A</h3>
                  <button
                    className="name2number-button name2number-regnumber-copy-button"
                    type="button"
                    disabled={unusedRegNumbers.unusedB.length === 0}
                    onClick={() => copyUnusedRegNumbers('unusedB')}
                  >
                    {unusedRegNumberCopyStatus.unusedB?.success ? 'Copied' : 'Copy list'}
                  </button>
                </div>
                <pre>{unusedRegNumbers.unusedB.length > 0 ? unusedRegNumbers.unusedB.join('\n') : 'None'}</pre>
                <div className="name2number-regnumber-copy-action">
                  {unusedRegNumberCopyStatus.unusedB ? (
                    <span
                      className={unusedRegNumberCopyStatus.unusedB.success
                        ? 'name2number-copy-success'
                        : 'name2number-copy-error'}
                      role="status"
                    >
                      {unusedRegNumberCopyStatus.unusedB.message}
                    </span>
                  ) : null}
                </div>
              </section>
            </div>
          </>
        ) : null}
      </section>
      <section className="name2number-rajanilai-sum" aria-labelledby="name2number-rajanilai-sum-title">
        <h2 id="name2number-rajanilai-sum-title">Find combination for Rajanilai Sum</h2>
        <form
          className="name2number-rajanilai-sum-form"
          onSubmit={(event) => matchRajanilaiSum(
            event,
            event.nativeEvent.submitter?.value ?? 'GEN-4',
          )}
        >
          <label htmlFor="name2number-rajanilai-sum-input">
            <span>Rajanilai sum</span>
            <input
              id="name2number-rajanilai-sum-input"
              type="number"
              min="2"
              max={MAX_RAJANILAI_SUM}
              step="1"
              inputMode="numeric"
              value={rajanilaiSumInput}
              onChange={(event) => {
                setRajanilaiSumInput(event.target.value)
                setRajanilaiSumResults(null)
                setRajanilaiSumError('')
              }}
            />
          </label>
          <div className="name2number-rajanilai-sum-buttons">
            {['GEN-4', 'GEN-6', 'GEN-8'].map((generator) => (
              <button
                className={`name2number-button name2number-rajanilai-generator-button${rajanilaiSumResults?.generator === generator ? ' name2number-rajanilai-generator-button-active' : ''}`}
                key={generator}
                type="submit"
                value={generator}
              >
                {generator}
              </button>
            ))}
          </div>
        </form>
        {rajanilaiSumError ? (
          <p className="name2number-message" role="alert">{rajanilaiSumError}</p>
        ) : null}
        {rajanilaiSumResults ? (
          <div className="name2number-rajanilai-sum-results" aria-live="polite">
            <h3>{rajanilaiSumResults.generator} combinations · {rajanilaiSumResults.combinations.length}</h3>
            {rajanilaiSumResults.combinations.length > 0
              ? <pre>{rajanilaiSumResults.combinations.join('\n')}</pre>
              : <p>No {rajanilaiSumResults.generator} combinations match this sum.</p>}
          </div>
        ) : null}
      </section>
    </section>
  )
}
