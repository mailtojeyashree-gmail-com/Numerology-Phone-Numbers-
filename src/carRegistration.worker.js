import { generateManithaNaadiCarRegistrations } from './carRegistrationGenerator'

self.onmessage = (event) => {
  try {
    const { luckyNumbers, rasiChartEntries } = event.data
    const results = generateManithaNaadiCarRegistrations(
      luckyNumbers,
      new Map(rasiChartEntries),
    )
    self.postMessage({ results })
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : 'Car-registration generation failed.',
    })
  }
}
