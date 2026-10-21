import { carRegLetterValues } from './numerologyLetterValues'

export const carRegNumberChart = [
  { value: 1, letters: ['A', 'I', 'J', 'Y', 'Q'] },
  { value: 2, letters: ['B', 'K', 'R', '', ''] },
  { value: 3, letters: ['C', 'G', 'L', 'S', ''] },
  { value: 4, letters: ['D', 'M', 'T', '', ''] },
  { value: 5, letters: ['E', 'H', 'N', 'X', ''] },
  { value: 6, letters: ['U', 'V', 'W', '', ''] },
  { value: 7, letters: ['Z', 'O', '', '', ''] },
  { value: 8, letters: ['F', 'P', '', '', ''] },
]

function parseLuckyPairs(value) {
  return String(value ?? '')
    .split(/[\s,]+/)
    .filter((entry) => /^\d{2}$/.test(entry))
}

export function generateManithaNaadiCarRegistrations(luckyNumbers, rasiChartNumbersByPair) {
  const luckyPairs = parseLuckyPairs(luckyNumbers)
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
    matchesByBhavam.set(bhavamKey, group)

    for (const pair of luckyPairs) {
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
  }

  const bhavamGroups = [...matchesByBhavam.values()]
  const groupOffsets = bhavamGroups.map(() => 0)
  const matches = []
  let remainingMatches = bhavamGroups.reduce((total, group) => total + group.length, 0)
  let groupIndex = 0
  while (remainingMatches > 0) {
    const group = bhavamGroups[groupIndex]
    const offset = groupOffsets[groupIndex]
    if (offset < group.length) {
      matches.push(group[offset])
      groupOffsets[groupIndex] += 1
      remainingMatches -= 1
    }
    groupIndex = (groupIndex + 1) % bhavamGroups.length
  }

  return {
    matches,
    repeatedMatches: [],
    nonMatches: [],
    combinationsChecked,
    possibleCombinationsWithRepetition: possibleCount,
  }
}
