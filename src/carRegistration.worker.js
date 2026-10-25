import {
  generateManithaNaadiCarRegistrations,
  generateManithaNaadiFormattedCarRegistrations,
  generateManithaNaadiNumericFirstCarRegistrations,
} from './carRegistrationGenerator'

let cachedMatches = []

function getCanonicalPairChecks(checks) {
  return [...checks]
    .sort((first, second) => Number(first) - Number(second))
    .join(',')
}

function filterCarRegistrations({
  excludedStartingLetters,
  excludedAnywhereLetters,
  digitSumFilters,
  luckyPairFilters,
  pairFilters,
  uniquePairFilters,
  sortDirection,
  page,
  pageSize,
}) {
  const startingLetters = new Set(excludedStartingLetters)
  const anywhereLetters = new Set(excludedAnywhereLetters)
  const digitSumsFilters = new Set(digitSumFilters)
  const luckyPairsFilters = new Set(luckyPairFilters)
  const checksFilters = new Set(pairFilters)
  const uniqueChecksFilters = new Set(uniquePairFilters)

  const matchingIndices = []
  const canonicalChecksByIndex = new Array(cachedMatches.length)
  const digitSums = new Set()
  const luckyPairs = new Set()
  for (let index = 0; index < cachedMatches.length; index += 1) {
    const match = cachedMatches[index]
    const registration = match.registration.toUpperCase()
    if (startingLetters.has(registration[0])) continue
    let containsExcludedLetter = false
    for (const letter of anywhereLetters) {
      if (registration.includes(letter)) {
        containsExcludedLetter = true
        break
      }
    }
    if (containsExcludedLetter) continue
    matchingIndices.push(index)
    digitSums.add(match.digitSum)
    luckyPairs.add(match.pair)
    canonicalChecksByIndex[index] = getCanonicalPairChecks(match.checks)
  }

  const visibleIndices = []
  const uniquePairs = new Set()
  const combinationCounts = new Map()
  const pairChecksCombinationCounts = new Map()
  const filteredRegistrations = new Set()

  for (const index of matchingIndices) {
    const match = cachedMatches[index]
    if (
      (digitSumsFilters.size > 0 && !digitSumsFilters.has(String(match.digitSum)))
      || (luckyPairsFilters.size > 0 && !luckyPairsFilters.has(match.pair))
    ) continue

    const canonicalChecks = canonicalChecksByIndex[index]
    if (checksFilters.size > 0 && !checksFilters.has(canonicalChecks)) continue
    if (uniqueChecksFilters.size > 0 && !uniqueChecksFilters.has(canonicalChecks)) continue

    visibleIndices.push(index)
    match.checks.forEach((check) => uniquePairs.add(check))
    const combination = canonicalChecks.replaceAll(',', '')
    combinationCounts.set(combination, (combinationCounts.get(combination) ?? 0) + 1)
    const pairChecksCombination = match.checks.join('')
    pairChecksCombinationCounts.set(
      pairChecksCombination,
      (pairChecksCombinationCounts.get(pairChecksCombination) ?? 0) + 1,
    )
    filteredRegistrations.add(match.registration)
  }

  const alphabeticalLetterCounts = new Map()
  for (const index of visibleIndices) {
    const letter = cachedMatches[index].registration[0]?.toUpperCase()
    if (letter) {
      alphabeticalLetterCounts.set(
        letter,
        (alphabeticalLetterCounts.get(letter) ?? 0) + 1,
      )
    }
  }
  const alphabetStarts = new Map()
  let alphabeticalOffset = 0
  for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    if (!alphabeticalLetterCounts.has(letter)) continue
    alphabetStarts.set(letter, alphabeticalOffset)
    alphabeticalOffset += alphabeticalLetterCounts.get(letter)
  }

  const sortedIndices = [...visibleIndices].sort((firstIndex, secondIndex) => {
    const firstChecks = canonicalChecksByIndex[firstIndex]
    const secondChecks = canonicalChecksByIndex[secondIndex]
    const checksComparison = firstChecks < secondChecks ? -1 : firstChecks > secondChecks ? 1 : 0
    if (checksComparison !== 0) return checksComparison
    if (!sortDirection) return 0
    const firstRegistration = cachedMatches[firstIndex].registration
    const secondRegistration = cachedMatches[secondIndex].registration
    const registrationComparison = firstRegistration < secondRegistration
      ? -1
      : firstRegistration > secondRegistration ? 1 : 0
    return registrationComparison * (sortDirection === 'asc' ? 1 : -1)
  })

  return {
    matchesCount: matchingIndices.length,
    digitSums: [...digitSums].sort((first, second) => first - second),
    luckyPairs: [...luckyPairs].sort((first, second) => Number(first) - Number(second)),
    visibleCount: visibleIndices.length,
    pageMatches: sortedIndices
      .slice(page * pageSize, (page + 1) * pageSize)
      .map((index) => cachedMatches[index]),
    alphabetStarts: [...alphabetStarts],
    uniquePairs: [...uniquePairs],
    combinationEntries: [...combinationCounts],
    pairChecksCombinationEntries: [...pairChecksCombinationCounts],
    filteredRegistrations: [...filteredRegistrations],
  }
}

self.onmessage = (event) => {
  try {
    if (event.data.type === 'set-data') {
      cachedMatches = event.data.matches
      return
    }
    if (event.data.type === 'filter') {
      const { requestId, filters } = event.data
      self.postMessage({
        type: 'filtered',
        requestId,
        data: filterCarRegistrations(filters),
      })
      return
    }

    const { luckyNumbers, rasiChartEntries, registrationFormat } = event.data
    const generateRegistrations = registrationFormat === 'AB12CD'
      ? generateManithaNaadiFormattedCarRegistrations
      : registrationFormat === '1234AB'
        ? generateManithaNaadiNumericFirstCarRegistrations
        : generateManithaNaadiCarRegistrations
    const results = generateRegistrations(
      luckyNumbers,
      new Map(rasiChartEntries),
    )
    self.postMessage({ results })
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Car-registration generation failed.',
    })
  }
}
