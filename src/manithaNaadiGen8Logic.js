function parsePairs(value) {
  if (value === null || value === undefined || value === '') return []
  return [...new Set(String(value)
    .split(/[\s,]+/)
    .filter((entry) => /^\d{2}$/.test(entry)))]
}

function sumDigits(value) {
  return String(value)
    .split('')
    .reduce((total, digit) => total + Number(digit), 0)
}

function countCombinationsWithRepetition(count, length) {
  if (count <= 0 || length <= 0) return 0
  let total = 1
  for (let index = 1; index <= length; index += 1) {
    total = total * (count + index - 1) / index
  }
  return Math.floor(total)
}

function calculateCombinations(luckyNumbers, excludedNumbers, targetValues, pairCount) {
  const excludedPairs = new Set(parsePairs(excludedNumbers))
  const entries = parsePairs(luckyNumbers).filter((entry) => !excludedPairs.has(entry))
  const expectedTotals = [...new Set((targetValues ?? entries).map(Number))]
    .sort((first, second) => first - second)
  const entryDigitSums = entries.map(sumDigits)
  const suffixMinimumDigitSums = Array(entries.length)
  const suffixMaximumDigitSums = Array(entries.length)
  const matches = []
  const repeatedMatches = []
  const selectedValues = []

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    suffixMinimumDigitSums[index] = index === entries.length - 1
      ? entryDigitSums[index]
      : Math.min(entryDigitSums[index], suffixMinimumDigitSums[index + 1])
    suffixMaximumDigitSums[index] = index === entries.length - 1
      ? entryDigitSums[index]
      : Math.max(entryDigitSums[index], suffixMaximumDigitSums[index + 1])
  }

  function visit(startIndex, currentDigitSum) {
    const remaining = pairCount - selectedValues.length
    if (remaining === 0) {
      if (!expectedTotals.includes(currentDigitSum)) return

      const number = selectedValues.join('')
      const combination = {
        values: [...selectedValues],
        number,
        total: currentDigitSum,
        reducedTotal: currentDigitSum > 99 ? currentDigitSum % 100 : currentDigitSum,
        isMatch: true,
      }
      if (new Set(selectedValues).size < selectedValues.length) repeatedMatches.push(combination)
      else matches.push(combination)
      return
    }

    if (startIndex >= entries.length) return
    const minimumPossible = currentDigitSum + remaining * suffixMinimumDigitSums[startIndex]
    const maximumPossible = currentDigitSum + remaining * suffixMaximumDigitSums[startIndex]
    if (!expectedTotals.some((total) => total >= minimumPossible && total <= maximumPossible)) return

    for (let index = startIndex; index < entries.length; index += 1) {
      selectedValues.push(entries[index])
      visit(index, currentDigitSum + entryDigitSums[index])
      selectedValues.pop()
    }
  }

  visit(0, 0)

  return {
    matches,
    repeatedMatches,
    nonMatches: [],
    combinationsChecked: matches.length + repeatedMatches.length,
    possibleCombinationsWithRepetition: countCombinationsWithRepetition(entries.length, pairCount),
  }
}

export function calculateGen8Matches(luckyNumbers, excludedNumbers, targetValues = null) {
  return calculateCombinations(luckyNumbers, excludedNumbers, targetValues, 4)
}

export function calculateGen12Matches(luckyNumbers, excludedNumbers, targetValues = null) {
  return calculateCombinations(luckyNumbers, excludedNumbers, targetValues, 6)
}
