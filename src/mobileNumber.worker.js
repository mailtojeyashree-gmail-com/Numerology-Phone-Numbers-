import { calculateManithaNaadiMobileMatches } from './mobileNumberGenerator'

self.onmessage = (event) => {
  try {
    const {
      profile,
      luckyNumbers,
      rasiChartEntries,
      include85,
    } = event.data
    const results = calculateManithaNaadiMobileMatches(
      profile,
      luckyNumbers,
      new Map(rasiChartEntries),
      include85,
    )
    self.postMessage({ results })
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : 'Mobile-number generation failed.',
    })
  }
}
