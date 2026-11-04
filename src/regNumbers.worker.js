import { getRasiBhavam } from './rasiChartData'
import { manithaNaadiRajanilaiNumbers } from './manithaNaadiRajanilai'

function getUniquePairs(values) {
  return [...new Set(values)].sort((first, second) => Number(first) - Number(second))
}

self.onmessage = (event) => {
  const { requestId, phoneNumbers, initials, luckyNumbers, excludedNumbers } = event.data

  try {
    const luckyPairs = new Set(
      String(luckyNumbers ?? '')
        .split(/[\s,]+/)
        .filter((pair) => /^\d{2}$/.test(pair)),
    )
    const excludedPairs = new Set(
      String(excludedNumbers ?? '')
        .split(/[\s,]+/)
        .filter((pair) => /^\d{2}$/.test(pair)),
    )
    excludedPairs.forEach((pair) => luckyPairs.delete(pair))

    const pairBhavamsByValue = new Map(
      Array.from({ length: 100 }, (_, value) => {
        const pair = String(value).padStart(2, '0')
        return [pair, getRasiBhavam(pair, initials).split(',').map((bhavam) => bhavam.trim())]
      }),
    )
    const rows = []

    phoneNumbers.forEach((number, sourceIndex) => {
      const digitPairs = number.slice(3).match(/\d{2}/g) ?? []
      if (digitPairs.some((pair) => excludedPairs.has(pair))) return

      const digitSum = [...number].reduce((total, digit) => total + Number(digit), 0)
      rows.push({
        number,
        sourceIndex,
        pairs: digitPairs.join(', '),
        pairChecks: digitPairs.map((pair) => ({
          pair,
          matches: luckyPairs.has(pair),
        })),
        digitPairs,
        uniquePairs: getUniquePairs(digitPairs),
        pairBhavams: digitPairs.map((pair) => pairBhavamsByValue.get(pair)),
        digitSum,
        rajanilaiCalculation: digitPairs.map((pair) => ({
          pair,
          matches: manithaNaadiRajanilaiNumbers.has(Number(pair)),
        })),
        rajanilaiMatch: manithaNaadiRajanilaiNumbers.has(digitSum),
        sumBhavams: pairBhavamsByValue.get(String(digitSum).padStart(2, '0')) ?? ['—'],
      })
    })

    self.postMessage({ requestId, rows })
  } catch (error) {
    self.postMessage({
      requestId,
      error: error instanceof Error ? error.message : 'Mobile-number calculation failed.',
    })
  }
}
