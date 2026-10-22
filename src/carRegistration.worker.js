import {
  generateManithaNaadiCarRegistrations,
  generateManithaNaadiFormattedCarRegistrations,
  generateManithaNaadiNumericFirstCarRegistrations,
} from './carRegistrationGenerator'

self.onmessage = (event) => {
  try {
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
      error: error instanceof Error ? error.message : 'Car-registration generation failed.',
    })
  }
}
