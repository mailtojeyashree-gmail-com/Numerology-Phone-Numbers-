import { useEffect, useMemo, useState } from 'react'
import './Name2NumberPage.css'
import CopyTextButton from './CopyTextButton'
import TextareaLineCount from './TextareaLineCount'
import { carRegLetterValues } from './numerologyLetterValues'
import { defaultRajanilaiNumbers, getNameResult, parseRajanilaiNumbers } from './name2numberLogic'
import RasiChart from './RasiChart'
import { getRasiBhavam, rasiChartStartingSigns } from './rasiChartData'

const letterRows = Array.from({ length: 8 }, (_, index) => ({
  digit: index + 1,
  letters: carRegLetterValues
    .filter(([, value]) => value === index + 1)
    .map(([letter]) => letter),
}))

const excludedUkRegistrationLetters = new Set(['I', 'Q', 'Z'])
const excludedUkRegistrationStartingLetters = new Set(['I', 'O', 'Q', 'U', 'Z'])

function getPossibleUkRegistrationPlates(number) {
  if (!/^\d{7}$/.test(number) || number.slice(2, 4) === '00') return []

  const lettersByDigit = new Map()
  for (const [letter, value] of carRegLetterValues) {
    if (excludedUkRegistrationLetters.has(letter)) continue
    const digit = String(value)
    const letters = lettersByDigit.get(digit) ?? []
    letters.push(letter)
    lettersByDigit.set(digit, letters)
  }

  const firstLetters = (lettersByDigit.get(number[0]) ?? [])
    .filter((letter) => !excludedUkRegistrationStartingLetters.has(letter))
  const secondLetters = lettersByDigit.get(number[1]) ?? []
  const suffixLetters = [...number.slice(4)].map((digit) => lettersByDigit.get(digit) ?? [])
  if (firstLetters.length === 0 || secondLetters.length === 0 || suffixLetters.some((letters) => letters.length === 0)) {
    return []
  }

  const plates = []
  for (const first of firstLetters) {
    for (const second of secondLetters) {
      for (const third of suffixLetters[0]) {
        for (const fourth of suffixLetters[1]) {
          for (const fifth of suffixLetters[2]) {
            plates.push(`${first}${second} ${number.slice(2, 4)} ${third}${fourth}${fifth}`)
          }
        }
      }
    }
  }

  return plates
}

function getCarRegSearchUrl(plate) {
  return `https://www.carreg.co.uk/reg-search/${plate.replaceAll(' ', '+')}`
}

function Gen7PlateResults({ plates, label }) {
  const alphabetCounts = new Map()
  plates.forEach((plate) => {
    const firstLetter = plate[0]
    alphabetCounts.set(firstLetter, (alphabetCounts.get(firstLetter) ?? 0) + 1)
  })
  const availableLetters = [...alphabetCounts.keys()].sort()
  const [selectedLetter, setSelectedLetter] = useState(() => availableLetters[0] ?? 'all')
  const [selectedPrefix, setSelectedPrefix] = useState('all')
  const activeLetter = selectedLetter !== 'all' && !alphabetCounts.has(selectedLetter)
    ? availableLetters[0] ?? 'all'
    : selectedLetter
  const prefixCounts = new Map()
  if (activeLetter !== 'all') {
    plates
      .filter((plate) => plate.startsWith(activeLetter))
      .forEach((plate) => {
        const prefix = plate.slice(0, 2)
        prefixCounts.set(prefix, (prefixCounts.get(prefix) ?? 0) + 1)
      })
  }
  const availablePrefixes = [...prefixCounts.keys()].sort()
  const activePrefix = selectedPrefix !== 'all' && !prefixCounts.has(selectedPrefix)
    ? 'all'
    : selectedPrefix
  const visiblePlates = activeLetter === 'all'
    ? plates
    : plates.filter((plate) => (
      activePrefix === 'all'
        ? plate.startsWith(activeLetter)
        : plate.startsWith(activePrefix)
    ))
  const selectedCount = activePrefix !== 'all'
    ? prefixCounts.get(activePrefix) ?? 0
    : activeLetter === 'all'
    ? plates.length
    : alphabetCounts.get(activeLetter) ?? 0

  return (
    <>
      <div className="name2number-gen7-alphabet-toolbar">
        <div
          className="name2number-gen7-alphabet-pages"
          role="group"
          aria-label="Filter plates by first letter"
        >
          <button
            type="button"
            className={activeLetter === 'all' && activePrefix === 'all' ? 'is-active' : ''}
            aria-pressed={activeLetter === 'all' && activePrefix === 'all'}
            onClick={() => {
              setSelectedLetter('all')
              setSelectedPrefix('all')
            }}
          >
            All <span>{plates.length}</span>
          </button>
          {availableLetters.map((letter) => (
            <button
              key={letter}
              type="button"
              className={activeLetter === letter && activePrefix === 'all' ? 'is-active' : ''}
              aria-pressed={activeLetter === letter && activePrefix === 'all'}
              onClick={() => {
                setSelectedLetter(letter)
                setSelectedPrefix('all')
              }}
            >
              {letter} <span>{alphabetCounts.get(letter)}</span>
            </button>
          ))}
        </div>
        <span className="name2number-gen7-alphabet-count">
          {activePrefix !== 'all'
            ? `Plates starting with ${activePrefix}`
            : activeLetter === 'all' ? 'All plates' : `Plates starting with ${activeLetter}`} · {selectedCount}
        </span>
        <CopyTextButton
          label={label}
          text={visiblePlates.join('\n')}
        />
      </div>
      {activeLetter !== 'all' ? (
        <div
          className="name2number-gen7-subalphabet-pages"
          role="group"
          aria-label={`Filter plates starting with ${activeLetter} by second letter`}
        >
          <button
            type="button"
            className={activePrefix === 'all' ? 'is-active' : ''}
            aria-pressed={activePrefix === 'all'}
            onClick={() => setSelectedPrefix('all')}
          >
            All {activeLetter} <span>{alphabetCounts.get(activeLetter)}</span>
          </button>
          {availablePrefixes.map((prefix) => (
            <button
              key={prefix}
              type="button"
              className={activePrefix === prefix ? 'is-active' : ''}
              aria-pressed={activePrefix === prefix}
              onClick={() => setSelectedPrefix(prefix)}
            >
              {prefix.toLowerCase()} <span>{prefixCounts.get(prefix)}</span>
            </button>
          ))}
        </div>
      ) : null}
      {visiblePlates.length > 0 ? (
        <ul className="name2number-gen7-plates-list">
          {visiblePlates.map((plate) => {
            const [area, age, suffix] = plate.split(' ')

            return (
              <li key={plate}>
                <span className="name2number-gen7-plate">
                  <span className="name2number-gen7-plate-country">GB</span>
                  <span>{area}</span>
                  <span>{age}</span>
                  <span>{suffix}</span>
                </span>
                <a
                  className="name2number-gen7-carreg-link"
                  href={getCarRegSearchUrl(plate)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Check availability on CarReg
                </a>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="name2number-gen7-plates-empty">
          No format-valid plate combinations were generated.
        </p>
      )}
    </>
  )
}

function getUkAgeIdentifierOrder(value) {
  if (!/^(?:0[1-9]|[1-4]\d|5[1-9]|[6-9]\d)$/.test(value)) return null
  const ageIdentifier = Number(value)
  const yearWithinCycle = ageIdentifier >= 51 ? ageIdentifier - 50 : ageIdentifier
  const secondHalfOfYear = ageIdentifier >= 51 ? 1 : 0
  return yearWithinCycle * 2 + secondHalfOfYear
}

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

function parseNamesOrNumberPairs(value) {
  return value
    .split(/\r?\n/)
    .flatMap((line) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return []
      if (/^\d{2}(?:\s*,\s*\d{2})+$/.test(trimmedLine)) {
        return [trimmedLine.replace(/[,\s]/g, '')]
      }
      return trimmedLine.split(',').map((part) => part.trim()).filter(Boolean)
    })
}

function generateFinalRegistrations(value) {
  const lettersByDigit = new Map(
    Array.from({ length: 8 }, (_, index) => {
      const digit = String(index + 1)
      return [
        digit,
        carRegLetterValues
          .filter(([, letterValue]) => String(letterValue) === digit)
          .map(([letter]) => letter),
      ]
    }),
  )
  const registrations = []
  const seen = new Set()
  const invalidLines = []
  const unmappableLines = []

  value.split(/\r?\n/).forEach((line, index) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    const digits = /^\d{6}$/.test(trimmedLine)
      ? trimmedLine
      : /^\d{2}\s*,\s*\d{2}\s*,\s*\d{2}$/.test(trimmedLine)
        ? trimmedLine.replace(/[,\s]/g, '')
        : null
    if (!digits) {
      invalidLines.push(index + 1)
      return
    }

    const lastPairLetters = [...digits.slice(4)].map((digit) => lettersByDigit.get(digit) ?? [])
    if (lastPairLetters.some((letters) => letters.length === 0)) {
      unmappableLines.push(index + 1)
      return
    }

    for (const firstLetter of lastPairLetters[0]) {
      for (const secondLetter of lastPairLetters[1]) {
        const registration = `${digits.slice(0, 4)} ${firstLetter}${secondLetter}`
        if (seen.has(registration)) continue
        seen.add(registration)
        registrations.push(registration)
      }
    }
  })

  return { registrations, invalidLines, unmappableLines }
}

function findRajanilaiSumCombinations(target, rajanilaiSet, combinationLength) {
  const numbers = [...rajanilaiSet]
    .map(Number)
    .filter((number) => Number.isSafeInteger(number) && number > 0)
    .sort((first, second) => first - second)
    .map((number) => ({
      value: number,
      digitSum: [...String(number)].reduce((sum, digit) => sum + Number(digit), 0),
    }))
    .filter(({ digitSum }) => digitSum <= target)
  const combinations = []
  const selectedNumbers = []

  function visit(startIndex, remaining) {
    if (selectedNumbers.length === combinationLength) {
      if (remaining !== 0) return false
      if (combinations.length === MAX_RAJANILAI_SUM_COMBINATIONS) return true
      const values = selectedNumbers.map((number) => String(number).padStart(2, '0'))
      combinations.push({ values, digitSum: target })
      return false
    }

    for (let index = startIndex; index < numbers.length; index += 1) {
      const { value, digitSum } = numbers[index]
      if (digitSum > remaining) continue
      selectedNumbers.push(value)
      const exceededLimit = visit(index, remaining - digitSum)
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

function getGen7RegistrationNumber(number, checks, rajanilaiSet) {
  const isMappable = (candidate) => (
    [...candidate.slice(0, 2), ...candidate.slice(4)].every((digit) => digit >= '1' && digit <= '8')
  )
  const candidates = [number]
  const middlePair = number.slice(2, 4)
  const firstPair = number.slice(0, 2)

  if (checks.includes(firstPair) && rajanilaiSet.has(String(Number(firstPair)))) {
    candidates.push(`${middlePair}${firstPair}${number.slice(4)}`)
  }

  const leadingTailPair = number.slice(4, 6)
  if (checks.includes(leadingTailPair) && rajanilaiSet.has(String(Number(leadingTailPair)))) {
    candidates.push(`${number.slice(0, 2)}${leadingTailPair}${middlePair}${number.slice(6)}`)
  }

  const endingPair = number.slice(5, 7)
  if (checks.includes(endingPair) && rajanilaiSet.has(String(Number(endingPair)))) {
    candidates.push(`${number.slice(0, 2)}${endingPair}${middlePair}${number.slice(4, 5)}`)
  }

  for (const candidate of candidates) {
    if (!isMappable(candidate)) continue
    const candidateChecks = [
      candidate.slice(0, 2),
      candidate.slice(2, 4),
      candidate.slice(4, 6),
      candidate.slice(-2),
    ]
    if (!candidateChecks.every((check) => rajanilaiSet.has(String(Number(check))))) continue
    return { number: candidate, checks: candidateChecks }
  }

  return null
}

function findRajanilaiNumberMatches(target, rajanilaiSet, pairCount, uniqueNumbers = false) {
  const pairs = [...rajanilaiSet]
    .map(Number)
    .filter((number) => Number.isSafeInteger(number) && number > 0)
    .sort((first, second) => first - second)
    .map((number) => String(number).padStart(2, '0'))
  const combinations = []
  const selectedPairs = []
  const seenNumbers = new Set()

  function visit(startIndex) {
    if (selectedPairs.length === pairCount) {
      const number = `${selectedPairs.slice(0, -1).join('')}${selectedPairs.at(-1)[1]}`
      const checks = [
        ...selectedPairs.slice(0, -1),
        number.slice(-2),
      ]
      const digitSum = [...number].reduce((sum, digit) => sum + Number(digit), 0)
      if (digitSum !== target || !checks.every((check) => rajanilaiSet.has(String(Number(check))))) {
        return false
      }
      const registration = uniqueNumbers
        ? getGen7RegistrationNumber(number, checks, rajanilaiSet)
        : { number, checks }
      if (!registration) return false

      const registrations = [registration]
      if (uniqueNumbers && registration.number.startsWith('14')) {
        registrations.push({
          number: `41${registration.number.slice(2)}`,
          checks: ['41', ...registration.checks.slice(1)],
        })
      }

      for (const candidate of registrations) {
        if (uniqueNumbers && seenNumbers.has(candidate.number)) continue
        if (combinations.length === MAX_RAJANILAI_SUM_COMBINATIONS) return true
        combinations.push({
          values: uniqueNumbers ? candidate.checks : [...selectedPairs],
          number: candidate.number,
          checks: candidate.checks,
          digitSum,
        })
        if (uniqueNumbers) seenNumbers.add(candidate.number)
      }
      return false
    }

    for (let index = startIndex; index < pairs.length; index += 1) {
      selectedPairs.push(pairs[index])
      const exceededLimit = visit(index)
      selectedPairs.pop()
      if (exceededLimit) return true
    }

    return false
  }

  return {
    combinations,
    exceededLimit: visit(0),
  }
}

function getGen6ExampleOrders(values, rajanilaiSet) {
  const orders = []
  const seenOrders = new Set()

  for (let firstIndex = 0; firstIndex < values.length; firstIndex += 1) {
    for (let secondIndex = 0; secondIndex < values.length; secondIndex += 1) {
      if (firstIndex === secondIndex) continue
      const lastIndex = values.findIndex(
        (_, index) => index !== firstIndex && index !== secondIndex,
      )
      const orderedValues = [values[firstIndex], values[secondIndex], values[lastIndex]]
      if (/[09]/.test(orderedValues[2])) continue
      const orderKey = orderedValues.join(',')
      if (seenOrders.has(orderKey)) continue

      const firstTwoPairDigitSum = [...orderedValues[0], ...orderedValues[1]]
        .reduce((sum, digit) => sum + Number(digit), 0)
      if (!rajanilaiSet.has(String(firstTwoPairDigitSum))) continue

      seenOrders.add(orderKey)
      orders.push({ values: orderedValues, firstTwoPairDigitSum })
    }
  }

  return orders
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

    const key = trimmedLine.replace(/[,\s]/g, '').toUpperCase()
    if (!/^[A-Z0-9]+$/.test(key)) {
      invalidLines.push(index + 1)
      return
    }

    if (seen.has(key)) return
    seen.add(key)
    registrations.push({
      key,
      value: /^\d{6}$/.test(key) ? key.match(/\d{2}/g).join(',') : key,
    })
  })

  return { registrations, invalidLines }
}

function compareRegistrationLists(textA, textB) {
  const parsedA = parseRegistrationList(textA)
  const parsedB = parseRegistrationList(textB)
  const isRepresented = (registration, otherRegistrations) => otherRegistrations.some(
    (other) => registration.key.startsWith(other.key) || other.key.startsWith(registration.key),
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

function findMatchedRegistrationNumbers(textA, textB) {
  function parseEntries(text) {
    const entries = []
    const invalidLines = []
    const seen = new Set()

    text.split(/\r?\n/).forEach((line, index) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return

      const digits = trimmedLine.replace(/[,\s]/g, '')
      if (!/^\d{6}$/.test(digits)) {
        invalidLines.push(index + 1)
        return
      }

      if (seen.has(digits)) return
      seen.add(digits)
      entries.push({
        digits,
        digitSum: [...digits].reduce((sum, digit) => sum + Number(digit), 0),
      })
    })

    return { entries, invalidLines }
  }

  const parsedA = parseEntries(textA)
  const parsedB = parseEntries(textB)
  const digitSumsInA = new Set(parsedA.entries.map(({ digitSum }) => digitSum))

  return {
    matches: parsedB.entries
      .filter(({ digitSum }) => digitSumsInA.has(digitSum))
      .map(({ digits }) => digits.match(/\d{2}/g).join(',')),
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
  const [gen7ExcludedPairsInput, setGen7ExcludedPairsInput] = useState('')
  const [gen7SecondPairFilter, setGen7SecondPairFilter] = useState('all')
  const [kuberNumberInput, setKuberNumberInput] = useState('')
  const [excludedRajanilaiPairsInput, setExcludedRajanilaiPairsInput] = useState('')
  const [rajanilaiSumResults, setRajanilaiSumResults] = useState(null)
  const [rajanilaiSumError, setRajanilaiSumError] = useState('')
  const [selectedGen7PlateNumber, setSelectedGen7PlateNumber] = useState('')
  const [matchedNumberInputA, setMatchedNumberInputA] = useState('')
  const [matchedNumberInputB, setMatchedNumberInputB] = useState('')
  const [matchedNumbers, setMatchedNumbers] = useState(null)
  const [finalRegistrationInput, setFinalRegistrationInput] = useState('')
  const [finalRegistrationResults, setFinalRegistrationResults] = useState(null)
  const [gen7FinalRegistrationInput, setGen7FinalRegistrationInput] = useState('')
  const [gen7FinalRegistrationResults, setGen7FinalRegistrationResults] = useState(null)
  const [isGeneratingGen7FinalRegistrations, setIsGeneratingGen7FinalRegistrations] = useState(false)
  const [rajanilaiSubtractInput, setRajanilaiSubtractInput] = useState('')
  const [rajanilaiSubtractResults, setRajanilaiSubtractResults] = useState(null)
  const [rajanilaiSubtractError, setRajanilaiSubtractError] = useState('')
  const [rajanilaiMatchInputA, setRajanilaiMatchInputA] = useState('')
  const [rajanilaiMatchInputC, setRajanilaiMatchInputC] = useState('')
  const [rajanilaiMatchResults, setRajanilaiMatchResults] = useState(null)
  const [rajanilaiMatchError, setRajanilaiMatchError] = useState('')
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
  const gen7FilteredCombinations = useMemo(() => {
    if (rajanilaiSumResults?.generator !== 'GEN-7') return []
    const kuberNumber = kuberNumberInput.trim()
    const kuberPair = /^\d{2}$/.test(kuberNumber) ? kuberNumber : ''
    const vehicleAgeOrder = getUkAgeIdentifierOrder('73')
    const excludedPairs = gen7ExcludedPairsInput
      .split(/[,\s]+/)
      .map((pair) => pair.trim())
      .filter((pair) => /^\d{2}$/.test(pair))

    return rajanilaiSumResults.combinations.filter(({ number, values }) => {
      const ageIdentifierOrder = getUkAgeIdentifierOrder(number.slice(2, 4))
      return (
        ageIdentifierOrder !== null
        && ageIdentifierOrder <= vehicleAgeOrder
        && (!kuberPair || values.includes(kuberPair))
        && ![number.slice(0, 2), number.slice(2, 4), number.slice(4, 6)]
          .some((pair) => excludedPairs.includes(pair))
      )
    })
  }, [gen7ExcludedPairsInput, kuberNumberInput, rajanilaiSumResults])
  const gen7SecondPairOptions = useMemo(
    () => [...new Set(gen7FilteredCombinations.map(({ number }) => number.slice(2, 4)))]
      .sort((first, second) => Number(first) - Number(second)),
    [gen7FilteredCombinations],
  )
  const displayedRajanilaiSumCombinations = useMemo(() => {
    if (!rajanilaiSumResults) return []
    const kuberNumber = kuberNumberInput.trim()
    const excludedPairs = excludedRajanilaiPairsInput
      .split(',')
      .map((pair) => pair.trim())
      .filter(Boolean)
    if (rajanilaiSumResults.generator !== 'GEN-6-EXAMPLE') {
      if (rajanilaiSumResults.generator === 'GEN-7') {
        const selectedSecondPair = gen7SecondPairOptions.includes(gen7SecondPairFilter)
          ? gen7SecondPairFilter
          : 'all'
        return gen7FilteredCombinations.filter(({ number }) => (
          selectedSecondPair === 'all' || number.slice(2, 4) === selectedSecondPair
        ))
      }
      return rajanilaiSumResults.combinations
    }

    return rajanilaiSumResults.combinations.filter(({ values }) => (
      (!kuberNumber || values.includes(kuberNumber))
      && !excludedPairs.some((pair) => values.includes(pair))
    ))
  }, [excludedRajanilaiPairsInput, gen7FilteredCombinations, gen7SecondPairFilter, gen7SecondPairOptions, kuberNumberInput, rajanilaiSumResults])
  const invalidExcludedRajanilaiPairs = excludedRajanilaiPairsInput
    .split(',')
    .map((pair) => pair.trim())
    .filter((pair) => pair && !/^\d{2}$/.test(pair))
  const possibleUkRegistrationPlates = useMemo(
    () => getPossibleUkRegistrationPlates(selectedGen7PlateNumber),
    [selectedGen7PlateNumber],
  )

  useEffect(() => {
    if (!selectedGen7PlateNumber) return undefined

    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleEscape(event) {
      if (event.key === 'Escape') setSelectedGen7PlateNumber('')
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousBodyOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [selectedGen7PlateNumber])

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

    const usesNumberChecks = ['GEN-5', 'GEN-7'].includes(generator)
    const combinationLength = generator === 'GEN-4'
      ? 2
      : ['GEN-5', 'GEN-6', 'GEN-6-EXAMPLE'].includes(generator)
        ? 3
        : 4
    const { combinations: matchingCombinations, exceededLimit } = usesNumberChecks
      ? findRajanilaiNumberMatches(target, rajanilaiSet, generator === 'GEN-5' ? 3 : 4, generator === 'GEN-7')
      : findRajanilaiSumCombinations(target, rajanilaiSet, combinationLength)
    if (exceededLimit) {
      setRajanilaiSumError(
        `More than ${MAX_RAJANILAI_SUM_COMBINATIONS.toLocaleString()} combinations match. Enter a lower sum to show all results.`,
      )
      setRajanilaiSumResults(null)
      return
    }

    let combinations = matchingCombinations
    if (generator === 'GEN-6-EXAMPLE') {
      combinations = []
      for (const combination of matchingCombinations) {
        for (const exampleOrder of getGen6ExampleOrders(combination.values, rajanilaiSet)) {
          if (combinations.length === MAX_RAJANILAI_SUM_COMBINATIONS) {
            setRajanilaiSumError(
              `More than ${MAX_RAJANILAI_SUM_COMBINATIONS.toLocaleString()} valid pair orders match. Enter a lower sum to show all results.`,
            )
            setRajanilaiSumResults(null)
            return
          }
          combinations.push({
            ...combination,
            exampleOrder: exampleOrder.values,
            firstTwoPairDigitSum: exampleOrder.firstTwoPairDigitSum,
          })
        }
      }
    }

    setRajanilaiSumError('')
    setRajanilaiSumResults({ generator, combinations })
  }

  function findMatchedNumbers() {
    setMatchedNumbers(findMatchedRegistrationNumbers(matchedNumberInputA, matchedNumberInputB))
  }

  function findFinalRegistrations() {
    setFinalRegistrationResults(generateFinalRegistrations(finalRegistrationInput))
  }

  async function findGen7FinalRegistrations() {
    const lines = gen7FinalRegistrationInput.split(/\r?\n/)
    const registrations = new Set()
    const invalidLines = []
    const unmappableLines = []

    setIsGeneratingGen7FinalRegistrations(true)
    setGen7FinalRegistrationResults(null)
    await new Promise((resolve) => window.setTimeout(resolve, 0))

    try {
      for (const [index, line] of lines.entries()) {
        if (index > 0 && index % 5 === 0) {
          await new Promise((resolve) => window.setTimeout(resolve, 0))
        }

        const digits = line.trim().replace(/[\s,]/g, '')
        if (!digits) continue
        if (!/^\d{7}$/.test(digits)) {
          invalidLines.push(index + 1)
          continue
        }

        const plates = getPossibleUkRegistrationPlates(digits)
        if (plates.length === 0) {
          unmappableLines.push(index + 1)
        } else {
          plates.forEach((plate) => registrations.add(plate))
        }
      }

      setGen7FinalRegistrationResults({
        registrations: [...registrations],
        invalidLines,
        unmappableLines,
      })
    } finally {
      setIsGeneratingGen7FinalRegistrations(false)
    }
  }

  function findRajanilaiSubtractions(event) {
    event.preventDefault()
    const input = rajanilaiSubtractInput.trim()
    const minuend = Number(input)
    if (!/^\d+$/.test(input) || !Number.isSafeInteger(minuend) || minuend < 1) {
      setRajanilaiSubtractError('Enter a positive whole-number Rajanilai number.')
      setRajanilaiSubtractResults(null)
      return
    }

    const results = [...rajanilaiSet]
      .map(Number)
      .filter((rajanilaiNumber) => {
        const difference = rajanilaiNumber - minuend
        return rajanilaiNumber > minuend && rajanilaiSet.has(String(difference))
      })
      .map((rajanilaiNumber) => ({
        rajanilaiNumber,
        subtractedNumber: minuend,
        resultantRajanilai: rajanilaiNumber - minuend,
      }))

    setRajanilaiSubtractError('')
    setRajanilaiSubtractResults(results)
  }

  function findRajanilaiMatches(event) {
    event.preventDefault()
    const inputA = rajanilaiMatchInputA.trim()
    const inputC = rajanilaiMatchInputC.trim()
    const valueA = Number(inputA)
    const valueC = Number(inputC)
    if (![inputA, inputC].every((value) => /^\d+$/.test(value))
      || !Number.isSafeInteger(valueA)
      || !Number.isSafeInteger(valueC)
      || !rajanilaiSet.has(String(valueC))) {
      setRajanilaiMatchError(
        'Enter a positive whole number in Box A and a configured Rajanilai number in Box C.',
      )
      setRajanilaiMatchResults(null)
      return
    }

    const results = [...rajanilaiSet]
      .map(Number)
      .sort((first, second) => first - second)
      .flatMap((firstResult) => {
        const valueB = firstResult - valueA
        if (valueB <= 0) return []
        const finalResult = firstResult + valueC
        if (!rajanilaiSet.has(String(finalResult))) return []
        return [{ valueB, firstResult, finalResult }]
      })

    setRajanilaiMatchError('')
    setRajanilaiMatchResults(results)
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
    const text = unusedRegNumbers?.[listKey].map(({ value }) => value).join('\n') ?? ''
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
            setRajanilaiSubtractResults(null)
            setRajanilaiSubtractError('')
            setRajanilaiMatchResults(null)
            setRajanilaiMatchError('')
          }}
          autoComplete="off"
          spellCheck="false"
        />
      </label>

      <form
        className="name2number-form"
        onSubmit={(event) => {
          event.preventDefault()
          setGeneratedNames(parseNamesOrNumberPairs(name))
        }}
      >
        <label className="name2number-field" htmlFor="name2number-input">
          <span>ENTER A NAME</span>
          <TextareaLineCount value={name} />
          <textarea
            id="name2number-input"
            autoComplete="off"
            value={name}
            rows={3}
            onChange={(event) => {
              setName(event.target.value)
              setGeneratedNames(null)
            }}
            placeholder="For example: ANNA, MARIA or 32,52,22"
            aria-describedby="name2number-help"
            spellCheck="false"
          />
          <span id="name2number-help" className="name2number-help">
            New lines separate entries. Commas separate names, but two-digit comma-separated pairs stay together as one number.
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
                <TextareaLineCount value={customListA} />
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
                <TextareaLineCount value={customListB} />
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
          <TextareaLineCount value={digitSumInput} />
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
            <TextareaLineCount value={regNumberInputA} />
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
            <TextareaLineCount value={regNumberInputB} />
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
                Use letters and digits, one registration per line. For six-digit numbers, commas between pairs are optional.
              </p>
            ) : null}
            <div className="name2number-unused-regnumber-results name2number-matched-number-results" aria-live="polite">
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
                <pre>{unusedRegNumbers.unusedA.length > 0
                  ? unusedRegNumbers.unusedA.map(({ value }) => value).join('\n')
                  : 'None'}</pre>
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
                <pre>{unusedRegNumbers.unusedB.length > 0
                  ? unusedRegNumbers.unusedB.map(({ value }) => value).join('\n')
                  : 'None'}</pre>
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
        <h2 id="name2number-rajanilai-sum-title">Find combination for Digit Sum</h2>
        <form
          className="name2number-rajanilai-sum-form"
          onSubmit={(event) => matchRajanilaiSum(
            event,
            event.nativeEvent.submitter?.value ?? 'GEN-4',
          )}
        >
          <label htmlFor="name2number-rajanilai-sum-input">
            <span>Digit sum</span>
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
            {['GEN-4', 'GEN-5', 'GEN-6', 'GEN-6-EXAMPLE', 'GEN-7', 'GEN-8'].map((generator) => {
              const button = (
                <button
                  className={`name2number-button name2number-rajanilai-generator-button${rajanilaiSumResults?.generator === generator ? ' name2number-rajanilai-generator-button-active' : ''}`}
                  key={generator}
                  type="submit"
                  value={generator}
                >
                  {generator}
                </button>
              )

              return generator === 'GEN-6-EXAMPLE' ? (
                <div className="name2number-kuber-generator" key={generator}>
                  <label className="name2number-kuber-number-label" htmlFor="name2number-kuber-number-input">
                    <span>Kuber number</span>
                    <input
                      id="name2number-kuber-number-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={kuberNumberInput}
                      onChange={(event) => {
                        if (/^\d{0,2}$/.test(event.target.value)) {
                          setKuberNumberInput(event.target.value)
                        }
                      }}
                    />
                  </label>
                  <label className="name2number-kuber-number-label" htmlFor="name2number-excluded-rajanilai-pairs">
                    <span>Exclude numbers</span>
                    <input
                      id="name2number-excluded-rajanilai-pairs"
                      type="text"
                      inputMode="numeric"
                      value={excludedRajanilaiPairsInput}
                      placeholder="14, 33"
                      onChange={(event) => setExcludedRajanilaiPairsInput(event.target.value)}
                    />
                  </label>
                  {button}
                </div>
              ) : generator === 'GEN-7' ? (
                <div className="name2number-gen7-filter" key={generator}>
                  <label className="name2number-kuber-number-label" htmlFor="name2number-gen7-kuber-number-input">
                    <span>Kuber number</span>
                    <input
                      id="name2number-gen7-kuber-number-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={kuberNumberInput}
                      onChange={(event) => {
                        if (/^\d{0,2}$/.test(event.target.value)) {
                          setKuberNumberInput(event.target.value)
                        }
                      }}
                    />
                  </label>
                  <label htmlFor="name2number-gen7-excluded-pairs">
                    <span>Exclude numbers</span>
                    <input
                      id="name2number-gen7-excluded-pairs"
                      type="text"
                      inputMode="text"
                      placeholder="12, 34"
                      value={gen7ExcludedPairsInput}
                      onChange={(event) => setGen7ExcludedPairsInput(event.target.value)}
                    />
                  </label>
                  {button}
                </div>
              ) : button
            })}
          </div>
        </form>
        {rajanilaiSumError ? (
          <p className="name2number-message" role="alert">{rajanilaiSumError}</p>
        ) : null}
        {rajanilaiSumResults ? (
          <div className="name2number-rajanilai-sum-results" aria-live="polite">
            <h3>{rajanilaiSumResults.generator} combinations · {displayedRajanilaiSumCombinations.length}</h3>
            {rajanilaiSumResults.generator === 'GEN-6-EXAMPLE' ? (
              <p>Only orders with a mappable final pair (no 0 or 9) and a first-two-pair digit sum in the Rajanilai list are shown.</p>
            ) : null}
            {['GEN-5', 'GEN-7'].includes(rajanilaiSumResults.generator) ? (
              <p>
                Pair sequences form a {rajanilaiSumResults.generator === 'GEN-5' ? 'five' : 'seven'}-digit number.
                Every pair check must be in the Rajanilai list, and the number&apos;s digit sum must equal the entered sum.
              </p>
            ) : null}
            {rajanilaiSumResults.generator === 'GEN-7' ? (
              <p className="name2number-gen7-age-note">
                For vehicle WN73JZJ (73 plate), newer age identifiers (24, 74, 25, 75, continuing through 49, 99) and invalid 00/50 are excluded.
              </p>
            ) : null}
            {rajanilaiSumResults.generator === 'GEN-6-EXAMPLE' && invalidExcludedRajanilaiPairs.length > 0 ? (
              <p className="name2number-message" role="alert">
                Excluded entries must be two-digit pairs: {invalidExcludedRajanilaiPairs.join(', ')}.
              </p>
            ) : null}
            {displayedRajanilaiSumCombinations.length > 0
              ? (
                <div className="name2number-rajanilai-combination-results">
                  <div className={`name2number-rajanilai-combination-row name2number-rajanilai-combination-heading${rajanilaiSumResults.generator === 'GEN-6-EXAMPLE' ? ' name2number-rajanilai-example-row' : ''}${['GEN-5', 'GEN-7'].includes(rajanilaiSumResults.generator) ? ' name2number-rajanilai-number-row' : ''}${rajanilaiSumResults.generator === 'GEN-7' ? ' name2number-rajanilai-gen7-row' : ''}`}>
                    {rajanilaiSumResults.generator === 'GEN-6-EXAMPLE' ? (
                      <>
                        <div className="name2number-rajanilai-example-first-column">
                          <CopyTextButton
                            label="valid pair orders"
                            text={displayedRajanilaiSumCombinations.map(
                              ({ exampleOrder }) => exampleOrder.join(', '),
                            ).join('\n')}
                          />
                          <span>Valid pair order</span>
                        </div>
                        <span>Combination</span>
                        <span>First two-pair digit sum</span>
                      </>
                    ) : ['GEN-5', 'GEN-7'].includes(rajanilaiSumResults.generator) ? (
                      <>
                        <span>Combination</span>
                        <span className="name2number-rajanilai-number-heading">
                          Number
                          {rajanilaiSumResults.generator === 'GEN-7' ? (
                            <>
                              <CopyTextButton
                                label="GEN-7 number list"
                                text={displayedRajanilaiSumCombinations.map(({ number }) => number).join('\n')}
                              />
                              <select
                                aria-label="Filter by second pair"
                                value={gen7SecondPairOptions.includes(gen7SecondPairFilter)
                                  ? gen7SecondPairFilter
                                  : 'all'}
                                onChange={(event) => setGen7SecondPairFilter(event.target.value)}
                              >
                                <option value="all">All</option>
                                {gen7SecondPairOptions.map((pair) => (
                                  <option key={pair} value={pair}>{pair}</option>
                                ))}
                              </select>
                            </>
                          ) : null}
                        </span>
                        <span>Pair checks</span>
                        {rajanilaiSumResults.generator === 'GEN-7' ? <span>Rajanilai check</span> : null}
                      </>
                    ) : <span>Combination</span>}
                    <span>Digit sum</span>
                  </div>
                  {displayedRajanilaiSumCombinations.map(({
                    values,
                    number,
                    checks,
                    digitSum,
                    exampleOrder,
                    firstTwoPairDigitSum,
                  }) => {
                    const isExample = rajanilaiSumResults.generator === 'GEN-6-EXAMPLE'
                    const hasNumberChecks = ['GEN-5', 'GEN-7'].includes(rajanilaiSumResults.generator)
                    const hasGen7Checks = rajanilaiSumResults.generator === 'GEN-7'
                    return (
                      <div
                        className={`name2number-rajanilai-combination-row${isExample ? ' name2number-rajanilai-example-row' : ''}${hasNumberChecks ? ' name2number-rajanilai-number-row' : ''}${hasGen7Checks ? ' name2number-rajanilai-gen7-row' : ''}`}
                        key={`${values.join(',')}-${exampleOrder?.join(',') ?? ''}`}
                      >
                        {isExample ? (
                          <>
                            <span>{exampleOrder.join(', ')}</span>
                            <span>{values.join(', ')}</span>
                            <span>{firstTwoPairDigitSum}</span>
                          </>
                        ) : hasNumberChecks ? (
                          <>
                            <span>{values.join(', ')}</span>
                            <span className="name2number-gen7-number-cell">
                              <span>{number}</span>
                              {hasGen7Checks ? (
                                <button
                                  className="name2number-gen7-plates-button"
                                  type="button"
                                  aria-label={`Show possible UK registration plates for ${number}`}
                                  title="Show possible UK registration plates"
                                  onClick={() => setSelectedGen7PlateNumber(number)}
                                >
                                  <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <circle cx="12" cy="12" r="9" />
                                    <circle cx="12" cy="12" r="2.3" />
                                    <path d="M12 3v6.7M4.2 7.5l5.8 3.3m9.8-3.3L14 10.8M5.2 17l5.1-3m8.5 3-5.1-3" />
                                  </svg>
                                </button>
                              ) : null}
                            </span>
                            <span>{checks.join(', ')}</span>
                            {hasGen7Checks ? (
                              <span className="name2number-rajanilai-gen7-checks">
                                {values.slice(0, -1).map((pair, index) => (
                                  <span className="name2number-rajanilai-gen7-check" key={`${pair}-${index}`}>
                                    <span className="name2number-rajanilai-gen7-tick">✓✓</span>
                                    <span className="name2number-rajanilai-gen7-badge">{pair}</span>
                                  </span>
                                ))}
                                <span className="name2number-rajanilai-gen7-final-check">
                                  <span className="name2number-rajanilai-gen7-check">
                                    <span className="name2number-rajanilai-gen7-tick">✓✓</span>
                                    <span className="name2number-rajanilai-gen7-badge">{number.slice(-1)}</span>
                                  </span>
                                  <span className="name2number-rajanilai-gen7-ending-check">
                                    <span>(</span>
                                    <span className="name2number-rajanilai-gen7-check">
                                      <span className="name2number-rajanilai-gen7-tick">✓✓</span>
                                      <span className="name2number-rajanilai-gen7-badge">{number.slice(-2)}</span>
                                    </span>
                                    <span>)</span>
                                  </span>
                                </span>
                              </span>
                            ) : null}
                          </>
                        ) : <span>{values.join(', ')}</span>}
                        <span>{digitSum}</span>
                      </div>
                    )
                  })}
                </div>
              )
              : <p>
                {rajanilaiSumResults.generator === 'GEN-7'
                  && gen7ExcludedPairsInput.split(/[,\s]+/).some((pair) => /^\d{2}$/.test(pair.trim()))
                  ? `No GEN-7 combinations remain after excluding ${gen7ExcludedPairsInput.trim()}.`
                  : rajanilaiSumResults.generator === 'GEN-6-EXAMPLE' && kuberNumberInput.trim()
                  ? `No combinations containing Kuber number ${kuberNumberInput.trim()} match this sum.`
                  : `No ${rajanilaiSumResults.generator} combinations match this sum.`}
              </p>}
          </div>
        ) : null}
        {selectedGen7PlateNumber ? (
          <div
            className="name2number-gen7-plates-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedGen7PlateNumber('')
            }}
          >
            <section
              className="name2number-gen7-plates-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="name2number-gen7-plates-title"
            >
              <div className="name2number-gen7-plates-heading">
                <div>
                  <p>GEN-7 number · {selectedGen7PlateNumber}</p>
                  <h3 id="name2number-gen7-plates-title">Possible UK registration plates</h3>
                </div>
                <button
                  className="name2number-gen7-plates-close"
                  type="button"
                  aria-label="Close registration plates"
                  autoFocus
                  onClick={() => setSelectedGen7PlateNumber('')}
                >
                  ×
                </button>
              </div>
              <p className="name2number-gen7-plates-note">
                Combinations use the number-to-letter chart and the standard UK two-letter, two-digit, three-letter format.
                Use the alphabet buttons to browse plates by their first letter. CarReg opens separately to show current listings and prices.
              </p>
              {possibleUkRegistrationPlates.length > 0 ? (
                <Gen7PlateResults
                  plates={possibleUkRegistrationPlates}
                  label="visible possible UK registration plates"
                />
              ) : (
                <p className="name2number-gen7-plates-empty">
                  No format-valid plate combinations can be made from this number using the chart.
                </p>
              )}
            </section>
          </div>
        ) : null}
      </section>
      <section className="name2number-unused-regnumbers" aria-labelledby="name2number-final-registration-title">
        <h2 id="name2number-final-registration-title">Generate Final Registration</h2>
        <p className="name2number-non-rajanilai-help">
          Enter three pairs per line, with or without commas. The first two pairs become four digits;
          the last pair maps to two letters using the number-to-letter chart.
        </p>
        <label className="name2number-final-registration-field" htmlFor="name2number-final-registration-input">
          <span>Pair combinations</span>
          <TextareaLineCount value={finalRegistrationInput} />
          <textarea
            id="name2number-final-registration-input"
            value={finalRegistrationInput}
            onChange={(event) => {
              setFinalRegistrationInput(event.target.value)
              setFinalRegistrationResults(null)
            }}
            placeholder={'10, 32, 64\n32, 10, 64\n103264'}
            rows={8}
            spellCheck="false"
          />
        </label>
        <button
          className="name2number-button name2number-unused-regnumber-button"
          type="button"
          onClick={findFinalRegistrations}
          disabled={!finalRegistrationInput.trim()}
        >
          Generate Final Registration
        </button>
        {finalRegistrationResults ? (
          <>
            {finalRegistrationResults.invalidLines.length > 0
              || finalRegistrationResults.unmappableLines.length > 0 ? (
                <p className="name2number-message" role="alert">
                  {finalRegistrationResults.invalidLines.length > 0
                    ? `Invalid entries on lines ${finalRegistrationResults.invalidLines.join(', ')}. Enter exactly three two-digit pairs. `
                    : ''}
                  {finalRegistrationResults.unmappableLines.length > 0
                    ? `No registration generated for lines ${finalRegistrationResults.unmappableLines.join(', ')} because the final pair contains a digit without a letter mapping.`
                    : ''}
                </p>
              ) : null}
            <div className="name2number-unused-regnumber-results name2number-matched-number-results" aria-live="polite">
              <section aria-labelledby="name2number-final-registration-results-title">
                <div className="name2number-regnumber-result-heading">
                  <h3 id="name2number-final-registration-results-title">
                    Final registrations · {finalRegistrationResults.registrations.length}
                  </h3>
                  <CopyTextButton
                    label="final registrations"
                    text={finalRegistrationResults.registrations.join('\n')}
                  />
                </div>
                <pre>
                  {finalRegistrationResults.registrations.length > 0
                    ? finalRegistrationResults.registrations.join('\n')
                    : 'None'}
                </pre>
              </section>
            </div>
          </>
        ) : null}
      </section>
      <section
        className="name2number-unused-regnumbers"
        aria-labelledby="name2number-gen7-final-registration-title"
        aria-busy={isGeneratingGen7FinalRegistrations}
      >
        <h2 id="name2number-gen7-final-registration-title">Generate Final Registration - GEN-7</h2>
        <p className="name2number-non-rajanilai-help">
          Enter one seven-digit GEN-7 number per line, such as 1202164. Spaces or commas between its digits are ignored.
          Possible plates are generated in the AA 00 AAA format.
        </p>
        <label
          className="name2number-final-registration-field"
          htmlFor="name2number-gen7-final-registration-input"
        >
          <span>GEN-7 numbers</span>
          <TextareaLineCount value={gen7FinalRegistrationInput} />
          <textarea
            id="name2number-gen7-final-registration-input"
            value={gen7FinalRegistrationInput}
            disabled={isGeneratingGen7FinalRegistrations}
            onChange={(event) => {
              setGen7FinalRegistrationInput(event.target.value)
              setGen7FinalRegistrationResults(null)
            }}
            placeholder={'1202164\n1202326'}
            rows={8}
            spellCheck="false"
          />
        </label>
        <button
          className="name2number-button name2number-unused-regnumber-button"
          type="button"
          onClick={findGen7FinalRegistrations}
          disabled={!gen7FinalRegistrationInput.trim() || isGeneratingGen7FinalRegistrations}
        >
          {isGeneratingGen7FinalRegistrations ? (
            <span className="car-reg-filter-loading" role="status">
              <span className="car-reg-filter-spinner" aria-hidden="true" />
              Generating registrations…
            </span>
          ) : 'Generate Final Registration - GEN-7'}
        </button>
        {gen7FinalRegistrationResults ? (
          <>
            {gen7FinalRegistrationResults.invalidLines.length > 0
              || gen7FinalRegistrationResults.unmappableLines.length > 0 ? (
                <p className="name2number-message" role="alert">
                  {gen7FinalRegistrationResults.invalidLines.length > 0
                    ? `Invalid entries on lines ${gen7FinalRegistrationResults.invalidLines.join(', ')}. Enter one seven-digit number per line. `
                    : ''}
                  {gen7FinalRegistrationResults.unmappableLines.length > 0
                    ? `No format-valid plates could be generated from lines ${gen7FinalRegistrationResults.unmappableLines.join(', ')}.`
                    : ''}
                </p>
              ) : null}
            <div
              className="name2number-gen7-final-registration-results"
              aria-live="polite"
              aria-busy={isGeneratingGen7FinalRegistrations}
            >
              <div className="name2number-regnumber-result-heading">
                <h3>
                  Possible UK registration plates · {gen7FinalRegistrationResults.registrations.length}
                </h3>
              </div>
              {gen7FinalRegistrationResults.registrations.length > 0 ? (
                <Gen7PlateResults
                  plates={gen7FinalRegistrationResults.registrations}
                  label="visible GEN-7 possible UK registration plates"
                />
              ) : (
                <p className="name2number-gen7-plates-empty">
                  No format-valid plate combinations were generated.
                </p>
              )}
              <p className="name2number-gen7-plates-note">
                These match the number-to-letter chart and AA 00 AAA format. Use the alphabet buttons to browse plates by their first letter. CarReg opens separately to show current listings and prices.
              </p>
            </div>
          </>
        ) : null}
      </section>
      <section className="name2number-unused-regnumbers" aria-labelledby="name2number-matched-numbers-title">
        <h2 id="name2number-matched-numbers-title">Matched numbers</h2>
        <p className="name2number-non-rajanilai-help">
          Enter one six-digit number per line as three pairs (for example, 10,32,44 or 103244).
          Input B numbers are shown when their digit sum matches an Input A number.
        </p>
        <div className="name2number-regnumber-fields">
          <label className="name2number-regnumber-field" htmlFor="name2number-matched-input-a">
            <span>Input A</span>
            <TextareaLineCount value={matchedNumberInputA} />
            <textarea
              id="name2number-matched-input-a"
              value={matchedNumberInputA}
              onChange={(event) => {
                setMatchedNumberInputA(event.target.value)
                setMatchedNumbers(null)
              }}
              placeholder={'10,32,44\n103244'}
              rows={8}
              spellCheck="false"
            />
          </label>
          <label className="name2number-regnumber-field" htmlFor="name2number-matched-input-b">
            <span>Input B</span>
            <TextareaLineCount value={matchedNumberInputB} />
            <textarea
              id="name2number-matched-input-b"
              value={matchedNumberInputB}
              onChange={(event) => {
                setMatchedNumberInputB(event.target.value)
                setMatchedNumbers(null)
              }}
              placeholder={'10,33,43\n103343'}
              rows={8}
              spellCheck="false"
            />
          </label>
        </div>
        <button
          className="name2number-button name2number-unused-regnumber-button"
          type="button"
          onClick={findMatchedNumbers}
          disabled={!matchedNumberInputA.trim() && !matchedNumberInputB.trim()}
        >
          Find matched numbers
        </button>
        {matchedNumbers ? (
          <>
            {matchedNumbers.invalidA.length > 0 || matchedNumbers.invalidB.length > 0 ? (
              <p className="name2number-message" role="alert">
                Invalid entries were skipped
                {matchedNumbers.invalidA.length > 0
                  ? ` in Input A on lines ${matchedNumbers.invalidA.join(', ')}` : ''}
                {matchedNumbers.invalidB.length > 0
                  ? ` in Input B on lines ${matchedNumbers.invalidB.join(', ')}` : ''}.
                Enter exactly six digits, with or without commas.
              </p>
            ) : null}
            <div className="name2number-unused-regnumber-results" aria-live="polite">
              <section aria-labelledby="name2number-matched-results-title">
                <div className="name2number-regnumber-result-heading">
                  <h3 id="name2number-matched-results-title">
                    Matched numbers · {matchedNumbers.matches.length}
                  </h3>
                </div>
                <pre>{matchedNumbers.matches.length > 0 ? matchedNumbers.matches.join('\n') : 'None'}</pre>
              </section>
            </div>
          </>
        ) : null}
      </section>
      <section
        className="name2number-rajanilai-sum"
        aria-labelledby="name2number-rajanilai-subtract-title"
      >
        <h2 id="name2number-rajanilai-subtract-title">Subtract and Resultant Rajanilai</h2>
        <form className="name2number-rajanilai-sum-form" onSubmit={findRajanilaiSubtractions}>
          <label htmlFor="name2number-rajanilai-subtract-input">
            <span>Input Rajanilai number</span>
            <input
              id="name2number-rajanilai-subtract-input"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={rajanilaiSubtractInput}
              onChange={(event) => {
                setRajanilaiSubtractInput(event.target.value)
                setRajanilaiSubtractResults(null)
                setRajanilaiSubtractError('')
              }}
            />
          </label>
          <button className="name2number-button" type="submit">
            Find Rajanilai Subtractions
          </button>
        </form>
        {rajanilaiSubtractError ? (
          <p className="name2number-message" role="alert">{rajanilaiSubtractError}</p>
        ) : null}
        {rajanilaiSubtractResults ? (
          <div className="name2number-rajanilai-sum-results" aria-live="polite">
            {rajanilaiSubtractResults.length > 0
              ? (
                <div className="name2number-rajanilai-subtract-results">
                  <div className="name2number-rajanilai-subtract-row name2number-rajanilai-subtract-heading">
                    <span>Rajanilai number</span>
                    <span>Subtracted number</span>
                    <span>Resultant Rajanilai</span>
                  </div>
                  {rajanilaiSubtractResults.map((result) => (
                    <div className="name2number-rajanilai-subtract-row" key={result.rajanilaiNumber}>
                      <span>{result.rajanilaiNumber}</span>
                      <span>{result.subtractedNumber}</span>
                      <span>{result.resultantRajanilai}</span>
                    </div>
                  ))}
                </div>
              )
              : <p>No subtractions result in a configured Rajanilai number.</p>}
          </div>
        ) : null}
      </section>
      <section
        className="name2number-rajanilai-sum"
        aria-labelledby="name2number-rajanilai-match-title"
      >
        <h2 id="name2number-rajanilai-match-title">Match Rajanilai Gmail</h2>
        <form className="name2number-rajanilai-match-form" onSubmit={findRajanilaiMatches}>
          <label htmlFor="name2number-rajanilai-match-a">
            <span>Box A</span>
            <input
              id="name2number-rajanilai-match-a"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={rajanilaiMatchInputA}
              onChange={(event) => {
                setRajanilaiMatchInputA(event.target.value)
                setRajanilaiMatchResults(null)
                setRajanilaiMatchError('')
              }}
            />
          </label>
          <label htmlFor="name2number-rajanilai-match-c">
            <span>Box C</span>
            <input
              id="name2number-rajanilai-match-c"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={rajanilaiMatchInputC}
              onChange={(event) => {
                setRajanilaiMatchInputC(event.target.value)
                setRajanilaiMatchResults(null)
                setRajanilaiMatchError('')
              }}
            />
          </label>
          <button className="name2number-button" type="submit">Find Rajanilai Matches</button>
        </form>
        {rajanilaiMatchError ? (
          <p className="name2number-message" role="alert">{rajanilaiMatchError}</p>
        ) : null}
        {rajanilaiMatchResults ? (
          <div className="name2number-rajanilai-sum-results" aria-live="polite">
            {rajanilaiMatchResults.length > 0
              ? (
                <div className="name2number-rajanilai-match-results">
                  <div className="name2number-rajanilai-match-row name2number-rajanilai-match-heading">
                    <span>Box A</span>
                    <span>Box B</span>
                    <span>First matched Rajanilai</span>
                    <span>Box C</span>
                    <span>New matched Rajanilai</span>
                  </div>
                  {rajanilaiMatchResults.map(({ valueB, firstResult, finalResult }) => (
                    <div className="name2number-rajanilai-match-row" key={valueB}>
                      <span>{rajanilaiMatchInputA}</span>
                      <span>{String(valueB).padStart(2, '0')}</span>
                      <span>{firstResult}</span>
                      <span>{rajanilaiMatchInputC}</span>
                      <span>{finalResult}</span>
                    </div>
                  ))}
                </div>
              )
              : <p>No Box B value makes both sums a configured Rajanilai number.</p>}
          </div>
        ) : null}
      </section>
    </section>
  )
}
