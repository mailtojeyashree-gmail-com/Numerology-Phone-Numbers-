function parseLuckyPairs(value) {
  return String(value ?? '')
    .split(/[\s,]+/)
    .filter((entry) => /^\d{2}$/.test(entry))
}

function sumDigits(value) {
  return String(value)
    .replace(/\D/g, '')
    .split('')
    .reduce((total, digit) => total + Number(digit || 0), 0)
}

export function calculateManithaNaadiMobileMatches(profile, luckyNumbers, rasiChartNumbersByPair, include85 = true) {
  const luckyPairs = [...new Set(parseLuckyPairs(luckyNumbers))]
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
