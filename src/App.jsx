import { useMemo, useRef, useState } from 'react'
import './App.css'
import ManithaNaadiPasswordGenerator from './ManithaNaadiPasswordGenerator'
import PanjaPatchiPage from './PanjaPatchiPage'
import { carRegLetterValues } from './numerologyLetterValues'

const columns = Array.from({ length: 6 }, (_, index) => index + 1)
const workspaceColumns = Array.from({ length: 12 }, (_, index) => index + 1)
const prefixes = ['72', '73', '74', '77', '79']
const resultsLimit = 5000
const pageSize = 50
const combinationProfiles = {
  MA: '16, 06, 33, 72, 84, 79, 87, 73, 92, 74, 85, 93, 04',
  MA_all: '08, 32, 14, 52, 42, 51, 72, 84, 92, 74, 99, 85, 93',
  MA5: '72, 84, 79, 87, 73, 92, 74, 85, 93',
  M_all: '64, 54, 45, 56, 72, 84, 79, 97, 87, 73, 92, 74',
  M_all_new: '64, 54, 45, 56, 72, 84, 92, 74, 20, 10, 14, 32, 08',
  MJ: '20, 41, 45, 54, 56, 64, 66, 68, 74, 85, 92',
  MJ_all: '20, 41, 45, 54, 56, 64, 66, 68, 74, 85, 92',
  SM: '64, 54, 72, 84, 79, 87, 73, 92, 74, 22, 04, 12',
}
const matchingPhoneNumbers = [
  '07442222414', '07442222432', '07442222441', '07442222477',
  '07464080808', '07464808080', '07468545454', '07493779999',
  '07489997999', '07442228999', '07442229777', '07442299999',
  '07442727777', '07442777277', '07442777772', '07442777774',
  '07442929999', '07442999299', '07442999929', '07442999992',
  '07464299999', '07464799999', '07464899999', '07464909999',
  '07464929999', '07464979999', '07468299999', '07468799999',
  '07468929999', '07468939999', '07468979999', '07493909999',
  '07493959999',
  '07979848484', '07999649999', '07979999904', '07979999906',
  '07979999914', '07979999922', '07979999932', '07979999941',
  '07979999942', '07979999945', '07979999954', '07979999972',
  '07979999974', '07979999984', '07920939999', '07920959999',
  '07979222022', '07979299999', '07979909999', '07979929999',
  '07979939999', '07979999299', '07979999399', '07979999992',
  '07979999997',
  '07379979706', '07379979904', '07379979942', '07379979984',
  '07379979795', '07341454545', '07341848484', '07341898989',
  '07341939393', '07342779999', '07345227777', '07345747474',
  '07345777722', '07345878787', '07345929292', '07351797979',
  '07351848484', '07351939393', '07351979797', '07379202020',
  '07379777799', '07379898989', '07379979797', '07379999229',
  '07384227777', '07384777722', '07384777799', '07384779999',
  '07384999977', '07385060606', '07387727272', '07387777226',
  '07387777332', '07387777990', '07389727272', '07389858585',
  '07389878787', '07392646464', '07392737373', '07392747474',
  '07392808080', '07392878787', '07393227777', '07393646464',
  '07393777799', '07393898989', '07393959595', '07384043210',
  '07379999904', '07379999906', '07379999920', '07379999922',
  '07379999942', '07379999964', '07379999973', '07379999974',
  '07379999984', '07379999987', '07387777710', '07387777729',
  '07387777785', '07387777792', '07342229999', '07342999777',
  '07345999222', '07351777999', '07379997773', '07379997777',
  '07379997779', '07379999777', '07387777222', '07387777999',
  '07387779990', '07387779992', '07387779997', '07387999777',
  '07389777222', '07392999222', '07393993993', '07341227222',
  '07341727777', '07341899999', '07342799999', '07342939999',
  '07342959999', '07342979999', '07342997999', '07342999399',
  '07342999599', '07342999799', '07342999979', '07342999993',
  '07342999995', '07342999997', '07345223222', '07345299999',
  '07345727777', '07345777277', '07345777772', '07345899999',
  '07345909999', '07345929999', '07345998999', '07345999299',
  '07345999929', '07345999989', '07345999990', '07345999992',
  '07351777377', '07351777773', '07351799999', '07351939999',
  '07351959999', '07351979999', '07379225222', '07379229222',
  '07379299999', '07379543210', '07379737777', '07379777377',
  '07379777773', '07379899999', '07379929999', '07379939999',
  '07379993999', '07379998999', '07379999299', '07379999399',
  '07379999929', '07379999989', '07384222022', '07384229222',
  '07384777779', '07384777797', '07384777977', '07384779777',
  '07384959999', '07384977777', '07384979999', '07384997999',
  '07384999599', '07384999799', '07384999979', '07384999995',
  '07384999997', '07385959999', '07387227222', '07387747777',
  '07387777477', '07387777787', '07387778777', '07387799999',
  '07387877777', '07387929999', '07387939999', '07387979999',
  '07387993999', '07387997999', '07387999299', '07387999399',
  '07387999799', '07387999929', '07387999979', '07387999992',
  '07387999993', '07387999997', '07389727777', '07389747777',
  '07389777277', '07389777477', '07389777772', '07389777774',
  '07389799999', '07389899999', '07392877777', '07392997999',
  '07392998999', '07392999299', '07392999799', '07392999929',
  '07392999979', '07392999989', '07392999990', '07392999992',
  '07392999997', '07393222022', '07393229222', '07393777779',
  '07393797777', '07393977777', '07393999995', '07393999997',
  '07379999992', '07379999993', '07387777774',
]
const manithaNaadiLuckyNumbers = {
  MJ: '20, 41, 45, 54, 56, 64, 66, 68, 74, 85, 92',
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

function calculateCarRegMatches(expectedValue) {
  const expectedValues = new Set(expectedValue
    .split(/[\s,]+/)
    .filter((entry) => /^\d{2}$/.test(entry)))
  const expectedTotals = new Set([...expectedValues].map(Number))
  const pairs = [...expectedValues]
  const matches = []

  for (const [firstLetter, firstDigit] of carRegLetterValues) {
    for (const pair of pairs) {
      const firstCheck = `${firstDigit}${pair[0]}`
      if (!expectedValues.has(firstCheck)) continue

      for (const [thirdLetter, thirdDigit] of carRegLetterValues) {
        const secondCheck = `${pair[1]}${thirdDigit}`
        if (!expectedValues.has(secondCheck)) continue

        for (const [fourthLetter, fourthDigit] of carRegLetterValues) {
          for (const [fifthLetter, fifthDigit] of carRegLetterValues) {
            const thirdCheck = `${fourthDigit}${fifthDigit}`
            if (!expectedValues.has(thirdCheck)) continue

            const digitSum = firstDigit + Number(pair[0]) + Number(pair[1])
              + thirdDigit + fourthDigit + fifthDigit
            if (!expectedTotals.has(digitSum)) continue

            const letters = [firstLetter, thirdLetter, fourthLetter, fifthLetter]
            const digits = [firstDigit, Number(pair[0]), Number(pair[1]), thirdDigit, fourthDigit, fifthDigit]
            matches.push({
              letters,
              pair,
              number: digits.join(''),
              letterValues: letters.map((letter, index) => `${letter}=${[firstDigit, thirdDigit, fourthDigit, fifthDigit][index]}`),
              checks: [firstCheck, secondCheck, thirdCheck],
              digits,
              digitSum,
            })
          }
        }
      }
    }
  }

  return {
    matches,
    repeatedMatches: [],
    nonMatches: [],
    combinationsChecked: pairs.length * carRegLetterValues.length ** 4,
    possibleCombinationsWithRepetition: pairs.length * carRegLetterValues.length ** 4,
  }
}

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

function calculateWorkspaceMatches(workspaceValues, expectedNumbers, selectedColumns) {
  const columnIndexes = [...selectedColumns].sort((first, second) => first - second)
  const result = {
    columnIndexes,
    matches: [],
    nonMatches: [],
    matchCount: 0,
    nonMatchCount: 0,
    combinationsChecked: 0,
    matchesTruncated: false,
    nonMatchesTruncated: false,
    scanLimitReached: false,
    state: 'ready',
  }

  if (columnIndexes.length === 0) return { ...result, state: 'no-columns' }

  const expectedTargets = new Set(expectedNumbers
    .split(/[\s,]+/)
    .filter((entry) => /^\d{1,2}$/.test(entry))
    .map(Number))

  if (expectedTargets.size === 0) return { ...result, state: 'empty-expected' }

  const columns = columnIndexes.map((index) => workspaceValues[index]
    .split(/[\s,]+/)
    .filter((entry) => /^\d{1,2}$/.test(entry))
    .map((entry) => ({ label: entry, value: Number(entry) })))

  if (columns.some((entries) => entries.length === 0)) {
    return { ...result, state: 'empty-column' }
  }

  const expectedLabels = new Map(expectedNumbers
    .split(/[\s,]+/)
    .filter((entry) => /^\d{1,2}$/.test(entry))
    .map((entry) => [Number(entry), entry]))
  const resultLimit = 200
  const combinationLimit = 50000
  const selectedValues = []

  function visit(columnIndex, currentSum) {
    if (result.combinationsChecked >= combinationLimit) {
      result.scanLimitReached = true
      return
    }

    if (columnIndex === columns.length) {
      result.combinationsChecked += 1
      const matchedNumber = currentSum > 100 ? Number(String(currentSum).slice(1)) : currentSum
      const matchedExpectedNumber = expectedTargets.has(matchedNumber)
      const combination = {
        values: [...selectedValues],
        actualTotal: currentSum,
        matchedNumber: matchedExpectedNumber ? expectedLabels.get(matchedNumber) : null,
      }

      if (matchedExpectedNumber) {
        result.matchCount += 1
        if (result.matches.length < resultLimit) result.matches.push(combination)
        else result.matchesTruncated = true
      } else {
        result.nonMatchCount += 1
        if (result.nonMatches.length < resultLimit) result.nonMatches.push(combination)
        else result.nonMatchesTruncated = true
      }
      return
    }

    for (const entry of columns[columnIndex]) {
      const nextSum = currentSum + entry.value
      selectedValues.push(entry.label)
      visit(columnIndex + 1, nextSum)
      selectedValues.pop()
      if (result.scanLimitReached) return
    }
  }

  visit(0, 0)
  return result
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
const rasiChartStartingSigns = {
  MA: 'மேஷம்',
  M: 'கன்னி',
  MJ: 'மகரம்',
  SM: 'ரிஷபம்',
}
const rasiChartClockwiseOrder = ['மீனம்', 'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்']
const rasiChartSigns = [
  { name: 'மீனம்', row: 1, column: 1, values: ['80', '89', '77', '95'] },
  { name: 'மேஷம்', row: 1, column: 2, values: ['16', '06', '33'] },
  { name: 'ரிஷபம்', row: 1, column: 3, values: ['02', '20', '29', '10'] },
  { name: 'மிதுனம்', row: 1, column: 4, values: ['22', '04', '12'] },
  { name: 'கும்பம்', row: 2, column: 1, values: ['99', '85', '93'] },
  { name: 'கடகம்', row: 2, column: 4, values: ['08', '26', '32', '14'] },
  { name: 'மகரம்', row: 3, column: 1, values: ['92', '74', '90', '100'] },
  { name: 'சிம்மம்', row: 3, column: 4, values: ['52', '42', '51', '37'] },
  { name: 'தனுசு', row: 4, column: 1, values: ['88', '79', '97', '87', '73'] },
  { name: 'விருச்சிகம்', row: 4, column: 2, values: ['66', '41', '68'] },
  { name: 'துலாம்', row: 4, column: 3, values: ['72', '84'] },
  { name: 'கன்னி', row: 4, column: 4, values: ['64', '56', '54', '45'] },
]

const matchingProfileDefaults = {
  MA: { '1': '', '2': '', '3': '', '4': '', '5': '', Total: '' },
  M: { '1': '', '2': '', '3': '', '4': '', '5': '', Total: '' },
  MJ: { '1': '', '2': '', '3': '', '4': '', '5': '', Total: '' },
  SM: { '1': '', '2': '', '3': '', '4': '', '5': '', Total: '' },
  AM: { '1': '', '2': '', '3': '', '4': '', '5': '', Total: '' },
}

const additionalMatchingProfileDefaults = {
  ...matchingProfileDefaults,
}

function generateNumbersFromStart(profileValues, prefix = '74') {
  const entries = ['1', '2', '3', '4', '5'].map((field) => parseEntries(profileValues?.[field] ?? ''))
  const totalTarget = Number((profileValues?.Total ?? '').toString().trim())
  if (entries.some((group) => group.length === 0) || !Number.isFinite(totalTarget)) {
    return { error: 'Enter valid values for fields 1–5 and a Total before generating numbers.', numbers: [], groups: [] }
  }

  const values = entries.flat()
  const numbers = []
  for (const value of values) {
    const number = `${prefix}${value}`
    const total = sumDigits(number)
    if (total === totalTarget) numbers.push({ number, total })
  }

  return {
    error: null,
    numbers,
    groups: [{ total: totalTarget, numbers }],
  }
}

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

function calculateManithaNaadiMobileMatches(profile, luckyNumbers, rasiChartNumbersByPair) {
  const luckyPairs = [...new Set(parseEntries(luckyNumbers, true))]
  const allowedValues = new Set(luckyPairs)
  const matches = []
  let combinationsChecked = 0
  const selectedPairs = []

  function generatePairCombinations() {
    if (selectedPairs.length === 4) {
      combinationsChecked += 1
      const number = `074${selectedPairs.join('')}`
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
  const [activePage, setActivePage] = useState('generator')
  const [selectedManithaNaadiInitials, setSelectedManithaNaadiInitials] = useState('MJ')
  const [selectedCombinationProfile, setSelectedCombinationProfile] = useState('MA')
  const [selectedMatchingProfile, setSelectedMatchingProfile] = useState('MA')
  const [selectedAdditionalMatchingProfile, setSelectedAdditionalMatchingProfile] = useState('AM')
  const [matchingProfileValues, setMatchingProfileValues] = useState(() => matchingProfileDefaults)
  const [additionalMatchingProfileValues, setAdditionalMatchingProfileValues] = useState(
    () => additionalMatchingProfileDefaults,
  )
  const [generatedNumbers, setGeneratedNumbers] = useState(null)
  const [additionalGeneratedNumbers, setAdditionalGeneratedNumbers] = useState(null)
  const [manithaNaadiCombinationResults, setManithaNaadiCombinationResults] = useState(null)
  const [combinationExpectedValues, setCombinationExpectedValues] = useState(combinationProfiles)
  const [carRegExpectedValues, setCarRegExpectedValues] = useState(() => ({
    ...combinationProfiles,
    MA_all: '08, 32, 14, 52, 42, 51, 72, 84, 92, 74, 99, 85, 93, 88',
  }))
  const [combinationResults, setCombinationResults] = useState(null)
  const [workspaceValues, setWorkspaceValues] = useState(() => [
    '32, 42, 51, 72, 74, 84, 85',
    '20, 10',
    '22, 04, 12',
    '08, 26, 32, 14',
    '32, 45, 54, 56, 64, 72, 74, 84, 85',
    '64, 56, 54, 45',
    '72, 84',
    '66, 41, 68',
    '32, 45, 54, 56, 64, 72, 74, 84',
    '92, 74, 90',
    '99, 85, 93',
    '80, 89, 77, 95',
  ])
  const [expectedNumbers, setExpectedNumbers] = useState(() => [
    '32', '42', '51', '88', '79', '97', '92', '99', '93', '80', '89', '74', '52', '73',
  ].join('\n'))
  const [selectedWorkspaceColumns, setSelectedWorkspaceColumns] = useState(() => new Set())
  const [values, setValues] = useState(() => [
    '72, 73, 74, 77, 79, 80, 84, 85, 87, 88, 89, 90, 92, 93, 95, 97, 99',
    '04, 06, 08, 10, 12, 14, 16, 20, 29, 32, 39, 41, 42, 45, 51, 52, 54, 56, 64, 68, 72, 73, 74, 77, 79, 80, 84, 85, 87, 89, 92, 93, 95, 97, 99',
    '04, 06, 08, 10, 14, 16, 20, 22, 26, 29, 32, 41, 42, 45, 54, 64, 68, 72, 73, 74, 77, 79, 80, 84, 85, 87, 88, 89, 90, 92, 93, 95, 97, 99',
    '04, 06, 08, 10, 12, 14, 16, 20, 24, 32, 39, 41, 42, 45, 51, 52, 54, 56, 64, 68, 72, 73, 74, 77, 79, 80, 84, 85, 87, 88, 89, 92, 93, 95, 97, 99',
    '04, 06, 08, 10, 14, 16, 20, 22, 26, 29, 32, 41, 42, 45, 54, 64, 68, 72, 73, 74, 77, 79, 80, 84, 85, 87, 89, 90, 92, 93, 95, 97, 99',
    '32, 41, 42, 45, 51, 52, 54, 56, 64, 66, 68, 72, 73, 74, 77, 79, 80, 84, 85, 87, 88',
  ])
  const [search, setSearch] = useState(null)
  const [selectedExpectedSum, setSelectedExpectedSum] = useState('')
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [exportState, setExportState] = useState(null)
  const requestId = useRef(0)
  const workspaceMatches = useMemo(() => calculateWorkspaceMatches(
    workspaceValues,
    expectedNumbers,
    selectedWorkspaceColumns,
  ), [workspaceValues, expectedNumbers, selectedWorkspaceColumns])

  function updateColumn(index, value) {
    const filteredValues = value
      .split(',')
      .map((number) => number.trim())
      .filter((number) => number && (index === 5 || (number !== '66' && number !== '88')))
      .join(', ')

    setValues((currentValues) => currentValues.map((currentValue, currentIndex) => (
      currentIndex === index ? filteredValues : currentValue
    )))
    requestId.current += 1
    setSearch(null)
    setSelectedExpectedSum('')
    setExportState(null)
  }

  async function findMatches(prefix, expectedSum = selectedExpectedSum) {
    const currentRequestId = ++requestId.current
    const inputColumns = values.slice(1, 5).map((value) => parseEntries(value))
    const expectedSums = new Set(parseEntries(values[5], true).map(Number))

    if (inputColumns.some((entries) => entries.length === 0) || expectedSums.size === 0) {
      setSearch({ prefix, expectedSum, matches: [], total: 0, invalid: true })
      setVisibleCount(pageSize)
      return
    }

    if (!expectedSum) {
      setSearch({ prefix, expectedSum: '', matches: [], total: 0, needsSum: true, invalid: false })
      setVisibleCount(pageSize)
      return
    }

    const maximumSum = sumDigits(prefix) + inputColumns.reduce((sum, entries) => (
      sum + Math.max(...entries.map(sumDigits))
    ), 0)
    if (expectedSum !== 'all' && Number(expectedSum) > maximumSum) {
      setSearch({ prefix, expectedSum, matches: [], total: 0, maximumSum, impossible: true, invalid: false })
      setVisibleCount(pageSize)
      return
    }

    setVisibleCount(pageSize)
    setSearch({ prefix, expectedSum, matches: [], total: 0, loading: true, invalid: false })

    try {
      const inventory = await loadLocalInventory()
      if (currentRequestId !== requestId.current) return

      const targetSum = expectedSum === 'all' ? null : Number(expectedSum)
      const matches = []
      let total = 0

      function visit(columnIndex, phoneNumber, currentSum) {
        if (columnIndex === inputColumns.length) {
          if ((targetSum !== null && currentSum !== targetSum) || !expectedSums.has(currentSum)) return
          const availableNumber = inventory.byNumber.get(`0${phoneNumber}`)
          if (!availableNumber) return

          total += 1
          if (matches.length < resultsLimit) matches.push({ ...availableNumber, sum: currentSum })
          return
        }

        for (const entry of inputColumns[columnIndex]) {
          visit(columnIndex + 1, phoneNumber + entry, currentSum + sumDigits(entry))
        }
      }

      visit(0, prefix, sumDigits(prefix))
      matches.sort((first, second) => first.price - second.price)

      if (currentRequestId !== requestId.current) return
      setSearch({
        prefix,
        expectedSum,
        total,
        truncated: total > resultsLimit,
        snapshotDate: inventory.updatedAt,
        invalid: false,
      })
    } catch (error) {
      if (currentRequestId !== requestId.current) return
      setSearch({ prefix, expectedSum, matches: [], total: 0, error: error.message, invalid: false })
    }
  }

  async function exportAllOptions(prefix) {
    if (!prefix) return

    const inputColumns = values.slice(1, 5).map((value) => parseEntries(value))
    if (inputColumns.some((entries) => entries.length === 0) || expectedSums.size === 0) {
      setExportState({ error: 'Enter two-digit values in Columns 2–5 and Expected Sum before exporting.' })
      return
    }

    setExportState({ loading: true })

    try {
      const inventory = await loadLocalInventory()
      const rows = []
      const seenNumbers = new Set()

      function visit(columnIndex, phoneNumber, currentSum) {
        if (columnIndex === inputColumns.length) {
          if (!expectedSums.has(currentSum)) return
          const availableNumber = inventory.byNumber.get(`0${phoneNumber}`)
          if (!availableNumber || seenNumbers.has(availableNumber.number)) return
          seenNumbers.add(availableNumber.number)
          rows.push({ ...availableNumber, sum: currentSum })
          return
        }

        for (const entry of inputColumns[columnIndex]) {
          visit(columnIndex + 1, phoneNumber + entry, currentSum + sumDigits(entry))
        }
      }

      visit(0, prefix, sumDigits(prefix))
      rows.sort((first, second) => first.price - second.price || first.number.localeCompare(second.number))

      if (rows.length === 0) {
        setExportState({ error: `No available local numbers matched prefix ${prefix} and the listed Expected Sum values.` })
        return
      }

      const xmlEscape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[character])
      const cell = (value, type = 'String') => `<Cell><Data ss:Type="${type}">${xmlEscape(value)}</Data></Cell>`
      const sheetRows = [
        ['Phone Number', 'Expected Sum', 'Price'],
        ...rows.map((row) => [row.number, row.sum, row.price]),
      ].map((row, rowIndex) => `<Row>${row.map((value, index) => cell(value, rowIndex > 0 && index === 2 ? 'Number' : 'String')).join('')}</Row>`)
      const workbook = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Prefix ${prefix}"><Table>${sheetRows.join('')}</Table></Worksheet></Workbook>`
      const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' })
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `available-${prefix}-all-sums-${new Date().toISOString().slice(0, 10)}.xls`
      link.click()
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      setExportState({ count: rows.length })
    } catch (error) {
      setExportState({ error: error.message })
    }
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

  const expectedSumOptions = [...new Set(parseEntries(values[5], true))]
    .sort((first, second) => Number(first) - Number(second))
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
    const isGen6 = manithaNaadiCombinationResults.generator === 'GEN-6'
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
        : isGen6 ? sumDigits(number) : combination.total
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Number Signal home" onClick={() => setActivePage('generator')}>
          <span className="wordmark-mark" aria-hidden="true">n.</span>
          <span>NUMBER<span className="wordmark-light">SIGNAL</span></span>
        </a>
        <span className="privacy-note"><span className="privacy-dot" />LOCAL EDITOR</span>
        <nav className="page-switches" aria-label="App pages">
          <button
            className={`page-switch${activePage === 'generator' ? ' page-switch-active' : ''}`}
            type="button"
            aria-pressed={activePage === 'generator'}
            onClick={() => setActivePage('generator')}
          >
            Number generator
          </button>
          <button
            className={`page-switch${activePage === 'workspace' ? ' page-switch-active' : ''}`}
            type="button"
            aria-pressed={activePage === 'workspace'}
            onClick={() => setActivePage('workspace')}
          >
            12-column
          </button>
          <button
            className={`page-switch${activePage === 'combinations' ? ' page-switch-active' : ''}`}
            type="button"
            aria-pressed={activePage === 'combinations'}
            onClick={() => setActivePage('combinations')}
          >
            456 combination first
          </button>
          <button
            className={`page-switch${activePage === 'matching-numbers' ? ' page-switch-active' : ''}`}
            type="button"
            aria-pressed={activePage === 'matching-numbers'}
            onClick={() => setActivePage('matching-numbers')}
          >
            Matching phone numbers
          </button>
          <button
            className={`page-switch${activePage === 'additional-matching-numbers' ? ' page-switch-active' : ''}`}
            type="button"
            aria-pressed={activePage === 'additional-matching-numbers'}
            onClick={() => setActivePage('additional-matching-numbers')}
          >
            74 initials
          </button>
          <button
            className={`page-switch${activePage === 'manitha-naadi' ? ' page-switch-active' : ''}`}
            type="button"
            aria-pressed={activePage === 'manitha-naadi'}
            onClick={() => setActivePage('manitha-naadi')}
          >
            மனித நாடி
          </button>
          <button
            className={`page-switch${activePage === 'panja-patchi' ? ' page-switch-active' : ''}`}
            type="button"
            aria-pressed={activePage === 'panja-patchi'}
            onClick={() => setActivePage('panja-patchi')}
          >
            பஞ்ச பட்சி
          </button>
        </nav>
      </header>
      <section className="workspace" id="top">
        {activePage === 'generator' ? (
          <>
        <div className="page-heading">
          <p className="eyebrow"><span>01</span>PHONE NUMBER GENERATOR</p>
        </div>

        <section className="column-grid" aria-label="Six number columns">
          {columns.map((column, index) => (
            <label className="column-field" htmlFor={`column-${column}`} key={column}>
              <span className="column-title"><span className="column-index">0{column}</span> {column === 6 ? 'EXPECTED SUM' : `COLUMN ${column}`}</span>
              <textarea
                id={`column-${column}`}
                value={values[index]}
                onChange={(event) => updateColumn(index, event.target.value)}
                placeholder="Comma-separated numbers"
                rows={5}
                spellCheck="false"
                aria-label={`Column ${column} pink numbers, comma separated`}
              />
            </label>
          ))}
        </section>

        <section className="prefix-search" aria-labelledby="prefix-heading">
          <div className="prefix-heading-row">
            <div>
              <p className="eyebrow"><span>02</span> UK PREFIX SEARCH</p>
              <h2 id="prefix-heading">Find matching numbers</h2>
            </div>
            <p className="prefix-instructions">Choose a starting pair to match combinations against Expected Sum.</p>
          </div>
          <div className="prefix-buttons" aria-label="UK starting prefixes">
            {prefixes.map((prefix) => (
              <button
                className={`prefix-button${search?.prefix === prefix ? ' prefix-button-active' : ''}`}
                type="button"
                key={prefix}
                aria-pressed={search?.prefix === prefix}
                onClick={() => findMatches(prefix)}
              >
                {prefix}
              </button>
            ))}
            <label className="sum-select-wrap" htmlFor="expected-sum-select">
              <span>EXPECTED SUM</span>
              <select
                id="expected-sum-select"
                value={selectedExpectedSum}
                onChange={(event) => {
                  const nextExpectedSum = event.target.value
                  setSelectedExpectedSum(nextExpectedSum)
                  if (search?.prefix) findMatches(search.prefix, nextExpectedSum)
                }}
              >
                <option value="">Choose a sum</option>
                <option value="all">All options</option>
                {expectedSumOptions.map((sum) => <option value={sum} key={sum}>{sum}</option>)}
              </select>
            </label>
            <button
              className="export-button"
              type="button"
              onClick={exportAllOptions}
              disabled={!search?.prefix || exportState?.loading}
              title="Download available numbers for this prefix across all Expected Sum options"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.75v9m0 0 3.5-3.5M10 11.75l-3.5-3.5M3.5 13v3.25h13V13" /></svg>
              {exportState?.loading ? 'Preparing Excel…' : 'Download all sums'}
            </button>
          </div>
          {exportState?.error && <p className="export-feedback export-error" role="alert">{exportState.error}</p>}
          {exportState?.count > 0 && <p className="export-feedback" role="status">Excel file downloaded with {exportState.count.toLocaleString()} available numbers for prefix {search?.prefix}.</p>}

          {search && (
            <section className="match-results" aria-live="polite" aria-label={`Search results for ${search.prefix}`}>
              <div className="results-heading">
                <div>
                  <span className="results-kicker">PREFIX {search.prefix}</span>
                  <h3>{search.invalid ? 'Check your number lists' : search.needsSum ? 'Choose an expected sum' : search.impossible ? 'Sum is not possible for this prefix' : search.loading ? 'Checking local inventory...' : search.error ? 'Local inventory could not be loaded' : `${search.total.toLocaleString()} available ${search.total === 1 ? 'number' : 'numbers'}`}</h3>
                </div>
                {!search.invalid && !search.needsSum && !search.impossible && !search.error && (
                  <span className="results-count">{search.expectedSum === 'all' ? 'ALL LISTED SUMS' : `SUM ${search.expectedSum}`}</span>
                )}
              </div>
              {search.invalid ? (
                <p className="results-message">Enter two-digit values in each of Columns 2–5 and Expected Sum.</p>
              ) : search.needsSum ? (
                <p className="results-message">Choose a number from the Expected Sum dropdown to filter the combinations.</p>
              ) : search.impossible ? (
                <p className="results-message">A digit sum of {search.expectedSum} is above the maximum possible sum of {search.maximumSum} for prefix {search.prefix} with these column values.</p>
              ) : search.loading ? (
                <p className="results-message">Checking all combinations against the local inventory snapshot...</p>
              ) : search.error ? (
                <p className="results-message">{search.error} Check your connection and try again.</p>
              ) : search.total === 0 ? (
                <p className="results-message">
                  {search.expectedSum === 'all'
                    ? 'No available stock numbers matched any sum listed in Column 6.'
                    : 'No available stock numbers matched these combinations in the local snapshot.'}
                </p>
              ) : (
                <>
                  <ol className="result-list">
                    {search.matches.slice(0, visibleCount).map((match, index) => (
                      <li className="result-item" key={`${match.number}-${index}`}>
                        <span className="result-number">{match.number}</span>
                        <span className="result-sum">SUM {match.sum} · {match.price_friendly || `£${match.price}`}</span>
                      </li>
                    ))}
                  </ol>
                  {search.truncated && (
                    <p className="results-message">Checked the first {resultsLimit.toLocaleString()} combinations out of a larger set.</p>
                  )}
                  <p className="results-message">Using local inventory snapshot from {new Date(search.snapshotDate).toLocaleDateString()}.</p>
                  {visibleCount < search.matches.length && (
                    <button className="show-more-button" type="button" onClick={() => setVisibleCount((count) => count + pageSize)}>
                      Show more numbers
                      <span>{Math.min(pageSize, search.matches.length - visibleCount)} more</span>
                    </button>
                  )}
                </>
              )}
            </section>
          )}
        </section>
          </>
        ) : activePage === 'workspace' ? (
          <section className="twelve-page" aria-labelledby="twelve-page-title">
            <div className="page-heading">
              <p className="eyebrow"><span>01</span>ADDITIONAL WORKSPACE</p>
              <h1 id="twelve-page-title">12-column <em>workspace</em></h1>
            </div>
            <div className="twelve-column-grid" aria-label="Twelve text columns">
              {workspaceColumns.map((column, index) => (
                <label className="column-field twelve-column-field" htmlFor={`workspace-column-${column}`} key={column}>
                  <span className="column-title"><span className="column-index">{String(column).padStart(2, '0')}</span> COLUMN {column}</span>
                  <textarea
                    id={`workspace-column-${column}`}
                    value={workspaceValues[index]}
                    onChange={(event) => setWorkspaceValues((currentValues) => currentValues.map((value, valueIndex) => (
                      valueIndex === index ? event.target.value : value
                    )))}
                    placeholder="Values will go here"
                    rows={6}
                    spellCheck="false"
                  />
                </label>
              ))}
            </div>
            <div className="column-selection">
              <span className="column-selection-label">SELECT COLUMNS TO COMBINE</span>
              <div className="column-jump-buttons" aria-label="Columns to include in combinations">
                {workspaceColumns.map((column) => (
                  <button
                    className={`column-jump-button${selectedWorkspaceColumns.has(column - 1) ? ' column-jump-button-active' : ''}`}
                    type="button"
                    key={column}
                    aria-label={`Toggle column ${column}`}
                    aria-pressed={selectedWorkspaceColumns.has(column - 1)}
                    onClick={() => setSelectedWorkspaceColumns((currentColumns) => {
                      const nextColumns = new Set(currentColumns)
                      if (nextColumns.has(column - 1)) nextColumns.delete(column - 1)
                      else nextColumns.add(column - 1)
                      return nextColumns
                    })}
                  >
                    {column}
                  </button>
                ))}
              </div>
            </div>
            <div className="workspace-analysis-row">
              <label className="column-field expected-numbers-field" htmlFor="expected-numbers">
                <span className="column-title">EXPECTED NUMBERS</span>
                <textarea
                  id="expected-numbers"
                  value={expectedNumbers}
                  onChange={(event) => setExpectedNumbers(event.target.value)}
                  rows={14}
                  spellCheck="false"
                />
              </label>
              <section className="workspace-results" aria-labelledby="workspace-results-title" aria-live="polite">
                <div className="workspace-results-heading">
                  <div>
                    <span className="results-kicker">COLUMN SUMS</span>
                    <h2 id="workspace-results-title">Matching combinations</h2>
                  </div>
                  {workspaceMatches.combinationsChecked > 0 && (
                    <span className="results-count">
                      {workspaceMatches.combinationsChecked.toLocaleString()} CHECKED
                    </span>
                  )}
                </div>
                {workspaceMatches.state === 'no-columns' ? (
                  <p className="workspace-results-message">Select one or more columns above.</p>
                ) : workspaceMatches.state === 'empty-expected' ? (
                  <p className="workspace-results-message">Enter numeric target sums in Expected Numbers.</p>
                ) : workspaceMatches.state === 'empty-column' ? (
                  <p className="workspace-results-message">Enter numeric values in each selected column.</p>
                ) : (
                  <>
                    {[
                      {
                        title: 'Matches',
                        combinations: workspaceMatches.matches,
                        total: workspaceMatches.matchCount,
                        truncated: workspaceMatches.matchesTruncated,
                        emptyMessage: 'No combinations match the expected numbers.',
                      },
                      {
                        title: 'Unmatched combinations',
                        combinations: workspaceMatches.nonMatches,
                        total: workspaceMatches.nonMatchCount,
                        truncated: workspaceMatches.nonMatchesTruncated,
                        emptyMessage: 'Every checked combination matched an expected number.',
                      },
                    ].map((group) => (
                      <section className="workspace-result-group" key={group.title}>
                        <h3>{group.title}<span>{group.total.toLocaleString()}</span></h3>
                        {group.combinations.length === 0 ? (
                          <p className="workspace-results-message">{group.emptyMessage}</p>
                        ) : (
                          <ol className="workspace-match-list">
                            {group.combinations.map((combination, combinationIndex) => (
                              <li key={`${combination.actualTotal}-${combination.values.join('-')}-${combinationIndex}`}>
                                <span className="workspace-match-equation">
                                  {combination.values.map((value, valueIndex) => (
                                    <span className="workspace-equation-part" key={`${valueIndex}-${value}`}>
                                      {valueIndex > 0 && <span className="workspace-equation-plus">+</span>}
                                      <span className="workspace-equation-term">
                                        <span>C{workspaceMatches.columnIndexes[valueIndex] + 1}:</span>
                                        <strong>{value}</strong>
                                      </span>
                                    </span>
                                  ))}
                                </span>
                                <span className="workspace-match-summary">
                                  <strong className="workspace-match-total">Actual total = {combination.actualTotal}</strong>
                                  <strong className={combination.matchedNumber ? 'workspace-match-number' : 'workspace-match-no-match'}>
                                    {combination.matchedNumber ? `Match = ${combination.matchedNumber}` : 'No expected match'}
                                  </strong>
                                </span>
                              </li>
                            ))}
                          </ol>
                        )}
                        {group.truncated && (
                          <p className="workspace-results-message">Showing the first 200 of {group.total.toLocaleString()} combinations.</p>
                        )}
                      </section>
                    ))}
                    {workspaceMatches.scanLimitReached && (
                      <p className="workspace-results-message">Stopped after checking 50,000 combinations. The counts and lists include only the combinations checked.</p>
                    )}
                  </>
                )}
              </section>
            </div>
          </section>
        ) : activePage === 'combinations' ? (
          <section className="combination-page" aria-labelledby="combination-page-title">
            <div className="page-heading">
              <p className="eyebrow"><span>03</span>PAIR SUM ANALYSIS</p>
              <h1 id="combination-page-title">456 combination <em>first</em></h1>
            </div>

            <section className="combination-controls" aria-label="Expected value profile">
              <label className="combination-profile-select" htmlFor="combination-profile">
                <span>VALUE GROUP</span>
                <select
                  id="combination-profile"
                  value={selectedCombinationProfile}
                  onChange={(event) => setSelectedCombinationProfile(event.target.value)}
                >
                  {Object.keys(combinationExpectedValues).map((profile) => (
                    <option value={profile} key={profile}>{profile}</option>
                  ))}
                </select>
              </label>
              <label className="column-field combination-expected-field" htmlFor="combination-expected-values">
                <span className="column-title"><span className="column-index">EV</span> EXPECTED VALUE · {selectedCombinationProfile}</span>
                <textarea
                  id="combination-expected-values"
                  value={combinationExpectedValues[selectedCombinationProfile]}
                  onChange={(event) => setCombinationExpectedValues((currentValues) => ({
                    ...currentValues,
                    [selectedCombinationProfile]: event.target.value,
                  }))}
                  rows={3}
                  spellCheck="false"
                />
              </label>
              <label className="column-field combination-expected-field" htmlFor="car-reg-expected-values">
                <span className="column-title"><span className="column-index">CR</span> CAR REG NUMBER EXPECTED VALUE · {selectedCombinationProfile}</span>
                <textarea
                  id="car-reg-expected-values"
                  value={carRegExpectedValues[selectedCombinationProfile]}
                  onChange={(event) => setCarRegExpectedValues((currentValues) => ({
                    ...currentValues,
                    [selectedCombinationProfile]: event.target.value,
                  }))}
                  rows={3}
                  spellCheck="false"
                />
              </label>
            </section>

            <div className="combination-generate">
              <span className="column-selection-label">GENERATE COMBINATIONS</span>
              <div className="combination-generate-buttons">
                {['GEN-4', 'GEN-5', 'GEN-6', 'CAR REG'].map((generator) => (
                  <button
                    className={`combination-generate-button${combinationResults?.generator === generator ? ' combination-generate-button-active' : ''}`}
                    type="button"
                    key={generator}
                    aria-label={generator === 'CAR REG' ? generator : `Run ${generator}${generator === 'GEN-5' ? '' : ` with ${generator === 'GEN-6' ? 'three' : 'two'} values`}`}
                    title={generator === 'CAR REG'
                      ? 'Generate registrations using the Expected Value checks'
                      : `Generate ${generator === 'GEN-5' ? 'three-pair checks' : `sums from ${generator === 'GEN-6' ? 'three' : 'two'} values`}`}
                    onClick={() => setCombinationResults(generator === 'GEN-5'
                        ? {
                        generator,
                        profile: selectedCombinationProfile,
                        ...calculateGen5Matches(
                          combinationExpectedValues[selectedCombinationProfile],
                          combinationExpectedValues[selectedCombinationProfile],
                        ),
                        }
                        : generator === 'CAR REG'
                          ? {
                            generator,
                            profile: selectedCombinationProfile,
                            ...calculateCarRegMatches(carRegExpectedValues[selectedCombinationProfile]),
                          }
                        : {
                          generator,
                          profile: selectedCombinationProfile,
                          ...calculateCombinationMatches(
                            combinationExpectedValues[selectedCombinationProfile],
                            combinationExpectedValues[selectedCombinationProfile],
                            generator === 'GEN-6' ? 3 : 2,
                            true,
                          ),
                        })}
                  >
                    {generator}
                  </button>
                ))}
              </div>
            </div>

            {combinationResults && (
              <section className="combination-results" aria-live="polite" aria-label={`${combinationResults.generator} results`}>
                <div className="workspace-results-heading">
                  <div>
                    <span className="results-kicker">{combinationResults.generator} · {combinationResults.profile} VALUES</span>
                    <h2>Combination sum results</h2>
                  </div>
                  {combinationResults.logicPending ? (
                    <span className="results-count">LOGIC NEEDED</span>
                  ) : combinationResults.generator === 'CAR REG' ? (
                    <span className="results-count">
                      {combinationResults.possibleCombinationsWithRepetition.toLocaleString()} CANDIDATES · {combinationResults.matches.length.toLocaleString()} MATCHES
                    </span>
                  ) : (
                    <span className="results-count" title="Total includes combinations with repeated values; distinct count excludes repeats">
                      {combinationResults.possibleCombinationsWithRepetition.toLocaleString()} POSSIBLE WITH REPEATS · {combinationResults.combinationsChecked.toLocaleString()} DISTINCT
                    </span>
                  )}
                </div>
                {combinationResults.logicPending ? (
                  <p className="workspace-results-message">CAR REG is selected. Provide its generation rules to enable results.</p>
                ) : [
                  { title: 'Matching', combinations: combinationResults.matches },
                  { title: 'Repeated digits match', combinations: combinationResults.repeatedMatches },
                  { title: 'Unmatched combinations', combinations: combinationResults.nonMatches },
                ].filter((group) => {
                  if (combinationResults.generator === 'CAR REG') return group.title === 'Matching'
                  return combinationResults.generator !== 'GEN-5' || group.title !== 'Unmatched combinations'
                }).map((group) => (
                  <section className="workspace-result-group" key={group.title}>
                    <h3>{group.title}<span>{group.combinations.length}</span></h3>
                    {group.combinations.length === 0 ? (
                      <p className="workspace-results-message">No combinations in this group.</p>
                    ) : (
                      <ol className="workspace-match-list workspace-match-list-grid">
                        {group.combinations.map((combination, index) => (
                            <li key={`${combination.number ?? combination.values.join('-')}-${index}`}>
                            {combinationResults.generator === 'CAR REG' ? (
                              <>
                                <span className="workspace-match-equation">
                                  <strong>{combination.letters[0]}{combination.pair}{combination.letters.slice(1).join('')} → {combination.number}</strong>
                                </span>
                                <span className="workspace-match-summary">
                                  <strong className="workspace-match-total">{combination.letterValues.join(' · ')}</strong>
                                  <strong className="workspace-match-total">
                                    {combination.checks.map((check, checkIndex) => `${['1–2', '3–4', '5–6'][checkIndex]}: ${check} ✓`).join(' · ')}
                                  </strong>
                                  <strong className="workspace-match-number">
                                    {combination.digits.join(' + ')} = {combination.digitSum} · Match
                                  </strong>
                                </span>
                              </>
                            ) : combinationResults.generator === 'GEN-5' ? (
                              <>
                                <span className="workspace-match-equation">
                                  <strong>{combination.number}</strong>
                                </span>
                                <span className="workspace-match-summary">
                                  <strong className="workspace-match-total">
                                    Pair checks: {combination.checks.map((value, checkIndex) => `${['1–2', '3–4', '4–5'][checkIndex]}: ${value}`).join(' · ')}
                                  </strong>
                                  <strong className="workspace-match-number">
                                    Digit sum = {combination.digitSum}
                                  </strong>
                                </span>
                              </>
                            ) : (
                              <>
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
                              </>
                            )}
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>
                ))}
              </section>
            )}
          </section>
        ) : activePage === 'matching-numbers' ? (
          <section className="matching-numbers-page" aria-labelledby="matching-numbers-title">
            <div className="page-heading">
              <p className="eyebrow"><span>04</span>CURATED NUMBER LIST</p>
              <h1 id="matching-numbers-title">Matching <em>phone numbers</em></h1>
            </div>
            <label className="combination-profile-select" htmlFor="matching-number-profile">
              <span>INITIALS</span>
              <select
                id="matching-number-profile"
                value={selectedMatchingProfile}
                onChange={(event) => {
                  setSelectedMatchingProfile(event.target.value)
                  setGeneratedNumbers(null)
                }}
              >
                {Object.keys(matchingProfileDefaults).map((profile) => (
                  <option value={profile} key={profile}>{profile}</option>
                ))}
              </select>
            </label>
            <div className="matching-profile-fields" aria-label={`Values for ${selectedMatchingProfile}`}>
              {['1', '2', '3', '4', '5', 'Total'].map((field) => (
                <label className="matching-profile-field" htmlFor={`matching-profile-${field.toLowerCase()}`} key={field}>
                  <span>{field}</span>
                  <input
                    id={`matching-profile-${field.toLowerCase()}`}
                    type="text"
                    value={matchingProfileValues[selectedMatchingProfile][field]}
                    onChange={(event) => setMatchingProfileValues((currentValues) => ({
                      ...currentValues,
                      [selectedMatchingProfile]: {
                        ...currentValues[selectedMatchingProfile],
                        [field]: event.target.value,
                      },
                    }))}
                    onChangeCapture={() => setGeneratedNumbers(null)}
                    onBlur={() => setGeneratedNumbers(null)}
                  />
                </label>
              ))}
            </div>
            <section className="matching-generator" aria-labelledby="matching-generator-title">
              <h2 id="matching-generator-title">Generate numbers</h2>
              <button
                className="matching-find-button"
                type="button"
                onClick={() => setGeneratedNumbers(generateNumbersFromStart(
                  matchingProfileValues[selectedMatchingProfile],
                  '74',
                ))}
              >
                Generate up to 100 per Total, starting with 74
              </button>
              {generatedNumbers && (
                <section className="column-field matching-results-field" aria-label={`Generated phone numbers for ${selectedMatchingProfile}`}>
                  <span className="column-title">
                    PHONE NUMBERS FOR {selectedMatchingProfile}{generatedNumbers.error ? '' : ` · ${generatedNumbers.numbers.length}`}
                  </span>
                  {generatedNumbers.error ? (
                    <p className="matching-results-message" role="status">{generatedNumbers.error}</p>
                  ) : generatedNumbers.numbers.length > 0 ? (
                    <div className="generated-number-groups">
                      {generatedNumbers.groups.map((group) => (
                        <section className="generated-number-group" key={group.total} aria-label={`Numbers with Total ${group.total}`}>
                          <h3>SUM {group.total}<span>{group.numbers.length}</span></h3>
                          {group.numbers.length > 0 ? (
                            <ol className="generated-number-grid">
                              {group.numbers.map(({ number, total }) => (
                                <li key={number}>
                                  <span><strong>{number}</strong> ({total})</span>
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <p className="matching-results-message">No combinations for this Total.</p>
                          )}
                        </section>
                      ))}
                    </div>
                  ) : (
                    <p className="matching-results-message" role="status">No generated numbers matched this profile Total.</p>
                  )}
                </section>
              )}
            </section>
            <label className="column-field matching-phone-field" htmlFor="matching-phone-numbers">
              <span className="column-title">PHONE NUMBERS</span>
              <textarea
                id="matching-phone-numbers"
                value={matchingPhoneNumbers.join('\n')}
                readOnly
                rows={matchingPhoneNumbers.length}
                spellCheck="false"
              />
            </label>
          </section>
        ) : activePage === 'additional-matching-numbers' ? (
          <section className="matching-numbers-page" aria-labelledby="additional-matching-title">
            <div className="page-heading">
              <p className="eyebrow"><span>05</span>INITIALS-BASED NUMBER LIST</p>
              <h1 id="additional-matching-title">74 phone numbers <em>by initials</em></h1>
            </div>
            <label className="combination-profile-select" htmlFor="additional-matching-profile">
              <span>INITIALS</span>
              <select
                id="additional-matching-profile"
                value={selectedAdditionalMatchingProfile}
                onChange={(event) => {
                  setSelectedAdditionalMatchingProfile(event.target.value)
                  setAdditionalGeneratedNumbers(null)
                }}
              >
                {Object.keys(additionalMatchingProfileDefaults).map((profile) => (
                  <option value={profile} key={profile}>{profile}</option>
                ))}
              </select>
            </label>
            <div className="matching-profile-fields" aria-label={`Values for ${selectedAdditionalMatchingProfile}`}>
              {['1', '2', '3', '4', '5', 'Total'].map((field) => (
                <label className="matching-profile-field" htmlFor={`additional-matching-${field.toLowerCase()}`} key={field}>
                  <span>{field}</span>
                  <input
                    id={`additional-matching-${field.toLowerCase()}`}
                    type="text"
                    value={additionalMatchingProfileValues[selectedAdditionalMatchingProfile][field]}
                    readOnly={field === '1'}
                    onChange={(event) => setAdditionalMatchingProfileValues((currentValues) => ({
                      ...currentValues,
                      [selectedAdditionalMatchingProfile]: {
                        ...currentValues[selectedAdditionalMatchingProfile],
                        [field]: event.target.value,
                      },
                    }))}
                    onBlur={() => setAdditionalGeneratedNumbers(null)}
                  />
                </label>
              ))}
            </div>
            <section className="matching-generator" aria-labelledby="additional-generator-title">
              <h2 id="additional-generator-title">Generate numbers</h2>
              <button
                className="matching-find-button"
                type="button"
                onClick={() => setAdditionalGeneratedNumbers(generateNumbersFromStart(
                  additionalMatchingProfileValues[selectedAdditionalMatchingProfile],
                  '74',
                ))}
              >
                Generate up to 100 per Total, starting with 74
              </button>
              {additionalGeneratedNumbers && (
                <section className="column-field matching-results-field" aria-label={`Generated phone numbers for ${selectedAdditionalMatchingProfile}`}>
                  <span className="column-title">
                    PHONE NUMBERS FOR {selectedAdditionalMatchingProfile}{additionalGeneratedNumbers.error ? '' : ` · ${additionalGeneratedNumbers.numbers.length}`}
                  </span>
                  {additionalGeneratedNumbers.error ? (
                    <p className="matching-results-message" role="status">{additionalGeneratedNumbers.error}</p>
                  ) : additionalGeneratedNumbers.numbers.length > 0 ? (
                    <div className="generated-number-groups">
                      {additionalGeneratedNumbers.groups.map((group) => (
                        <section className="generated-number-group" key={group.total} aria-label={`Numbers with Total ${group.total}`}>
                          <h3>SUM {group.total}<span>{group.numbers.length}</span></h3>
                          {group.numbers.length > 0 ? (
                            <ol className="generated-number-grid">
                              {group.numbers.map(({ number, total }) => (
                                <li key={number}><span><strong>{number}</strong> ({total})</span></li>
                              ))}
                            </ol>
                          ) : (
                            <p className="matching-results-message">No combinations for this Total.</p>
                          )}
                        </section>
                      ))}
                    </div>
                  ) : (
                    <p className="matching-results-message" role="status">No generated numbers matched this profile Total.</p>
                  )}
                </section>
              )}
            </section>
          </section>
        ) : activePage === 'manitha-naadi' ? (
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
                {Object.keys(manithaNaadiLuckyNumbers).map((initials) => (
                  <option value={initials} key={initials}>{initials}</option>
                ))}
              </select>
            </label>
            <label className="column-field matching-phone-field" htmlFor="manitha-naadi-lucky-numbers">
              <span className="column-title">LUCKY NUMBERS · {selectedManithaNaadiInitials}</span>
              <textarea
                id="manitha-naadi-lucky-numbers"
                value={manithaNaadiLuckyNumbers[selectedManithaNaadiInitials]}
                readOnly
                rows={4}
                spellCheck="false"
              />
            </label>
            <div className="rasi-chart-layout">
              <div className="rasi-chart" role="img" aria-label="தமிழ் ராசிக் கட்டம்">
                {rasiChartSigns.map((sign) => (
                  <div
                    className="rasi-chart-sign"
                    key={sign.name}
                    style={{ gridColumn: sign.column, gridRow: sign.row }}
                  >
                    <span className="rasi-chart-sign-name">{sign.name}</span>
                    <span className="rasi-chart-sign-badge">{rasiChartBadgeNumbers.get(sign.name)}</span>
                    <span className="rasi-chart-sign-values">{sign.values.join(', ')}</span>
                  </div>
                ))}
                <div className="rasi-chart-center">ராசி</div>
              </div>
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
                {['GEN-4', 'GEN-5', 'GEN-6', 'GEN-MOBILE-NUMBERS', 'GEN-CAR-REG', 'GEN-PASSWORD', 'GEN-EMAIL', 'GEN-DOG-NAMES'].map((generator) => (
                  generator === 'GEN-PASSWORD' ? (
                    <ManithaNaadiPasswordGenerator
                      key={selectedManithaNaadiInitials}
                      initials={selectedManithaNaadiInitials}
                      luckyNumbers={manithaNaadiLuckyNumbers[selectedManithaNaadiInitials]}
                      rasiChartNumbersByPair={rasiChartNumbersByPair}
                      activeGenerator={manithaNaadiCombinationResults?.generator}
                      onGenerate={() => setManithaNaadiCombinationResults(null)}
                    />
                  ) : (
                    <button
                      className={`combination-generate-button${manithaNaadiCombinationResults?.generator === generator ? ' combination-generate-button-active' : ''}`}
                      type="button"
                      key={generator}
                      disabled={['GEN-EMAIL', 'GEN-DOG-NAMES'].includes(generator)}
                      aria-label={['GEN-EMAIL', 'GEN-DOG-NAMES'].includes(generator)
                        ? `${generator} generation rules not configured`
                        : generator === 'GEN-MOBILE-NUMBERS'
                        ? 'Generate UK mobile numbers'
                        : generator === 'GEN-CAR-REG'
                          ? 'Generate car registrations'
                          : generator === 'GEN-5' ? 'Run GEN-5 three-pair checks' : `Run ${generator} with ${generator === 'GEN-6' ? 'three' : 'two'} values`}
                      title={['GEN-EMAIL', 'GEN-DOG-NAMES'].includes(generator)
                        ? 'Generation rules not configured yet'
                        : generator === 'GEN-MOBILE-NUMBERS'
                        ? 'Generate UK mobile numbers from the selected initials lucky pairs'
                        : generator === 'GEN-CAR-REG'
                          ? 'Generate car registrations from the selected initials lucky numbers'
                          : generator === 'GEN-5' ? 'Generate three-pair checks' : `Generate sums from ${generator === 'GEN-6' ? 'three' : 'two'} values`}
                      onClick={() => {
                        if (['GEN-EMAIL', 'GEN-DOG-NAMES'].includes(generator)) return

                        const luckyNumbers = manithaNaadiLuckyNumbers[selectedManithaNaadiInitials]
                        const generatorResults = generator === 'GEN-5'
                          ? calculateGen5Matches(luckyNumbers, luckyNumbers)
                          : generator === 'GEN-MOBILE-NUMBERS'
                            ? calculateManithaNaadiMobileMatches(
                              selectedManithaNaadiInitials,
                              luckyNumbers,
                              rasiChartNumbersByPair,
                            )
                            : generator === 'GEN-CAR-REG'
                              ? generateManithaNaadiCarRegistrations(luckyNumbers, rasiChartNumbersByPair)
                              : generator === 'GEN-4'
                                ? calculateGen4Matches(
                                  luckyNumbers,
                                  luckyNumbers,
                                )
                                : calculateCombinationMatches(
                                  luckyNumbers,
                                  luckyNumbers,
                                  generator === 'GEN-6' ? 3 : 2,
                                  true,
                                  generator === 'GEN-6',
                                )
                        const suppliedNumbers = generator === 'GEN-4'
                          ? manithaNaadiGen4NumerologistNumbers[selectedManithaNaadiInitials]
                          : generator === 'GEN-5'
                            ? manithaNaadiGen5NumerologistNumbers[selectedManithaNaadiInitials]
                            : generator === 'GEN-6'
                              ? manithaNaadiGen6NumerologistNumbers[selectedManithaNaadiInitials]
                              : null
                        if (suppliedNumbers) {
                          const pairCount = generator === 'GEN-4' ? 2 : 3
                          const suppliedResults = [...suppliedNumbers].map((number) => {
                            const pairValues = number.length === 5
                              ? [number.slice(0, 2), number.slice(2, 4), number.slice(3, 5)]
                              : Array.from({ length: pairCount }, (_, index) => (
                                number.slice(index * 2, index * 2 + 2)
                              ))
                            const total = sumDigits(number)
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
                  )
                ))}
              </div>
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
                {['GEN-4', 'GEN-5', 'GEN-6', 'GEN-MOBILE-NUMBERS'].includes(manithaNaadiCombinationResults.generator) ? (
                  <>
                    <div className="manitha-results-table-wrap">
                      <table className="manitha-results-table">
                        <thead>
                          <tr>
                            {manithaNaadiTableHeaders.map((heading) => (
                              <th scope="col" key={heading}>{heading}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {getManithaNaadiTableRows().map((row, index) => (
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
        ) : (
          <PanjaPatchiPage />
        )}
      </section>

      <footer className="page-footer">
        <span>NUMBER SIGNAL <span className="footer-separator">/</span> {activePage === 'generator' ? 'PHONE NUMBER NOTES' : activePage === 'workspace' ? '12-COLUMN WORKSPACE' : activePage === 'combinations' ? '456 COMBINATION FIRST' : activePage === 'additional-matching-numbers' ? '74 INITIALS' : activePage === 'manitha-naadi' ? 'மனித நாடி LUCKY NUMBERS' : activePage === 'panja-patchi' ? 'பஞ்ச பட்சி' : 'MATCHING PHONE NUMBERS'}</span>
        <span>EDITABLE IN THIS BROWSER</span>
      </footer>
    </main>
  )
}

export default App
