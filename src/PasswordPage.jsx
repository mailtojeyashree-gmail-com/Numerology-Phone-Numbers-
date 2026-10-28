import { useMemo, useRef, useState } from 'react'
import './PasswordPage.css'
import CopyTextButton from './CopyTextButton'
import {
  digitLetterRows,
  generatePasswordNameSuggestions,
  loadEnglishWords,
} from './passwordNameGenerator'
import { defaultRajanilaiNumbers, getNameResult, parseRajanilaiNumbers } from './name2numberLogic'
import { getRasiBhavam } from './rasiChartData'

export default function PasswordPage({ initials = 'MJ' }) {
  const [digits, setDigits] = useState('')
  const [submittedDigits, setSubmittedDigits] = useState(null)
  const [dictionaryResult, setDictionaryResult] = useState(null)
  const [dictionaryLoading, setDictionaryLoading] = useState(false)
  const [dictionaryError, setDictionaryError] = useState('')
  const dictionaryRequestRef = useRef(0)
  const invalidDigits = submittedDigits !== null && /[^1-8]/.test(submittedDigits)

  async function handleSubmit(event) {
    event.preventDefault()
    const nextDigits = digits.trim()
    const requestId = dictionaryRequestRef.current + 1
    dictionaryRequestRef.current = requestId
    setSubmittedDigits(nextDigits)
    setDictionaryResult(null)
    setDictionaryError('')
    if (/[^1-8]/.test(nextDigits)) {
      setDictionaryLoading(false)
      return
    }

    setDictionaryLoading(true)
    try {
      const words = await loadEnglishWords(`${import.meta.env.BASE_URL}english-words.txt`)
      if (requestId === dictionaryRequestRef.current) {
        setDictionaryResult({ digits: nextDigits, words })
      }
    } catch (error) {
      if (requestId === dictionaryRequestRef.current) {
        setDictionaryError(error instanceof Error
          ? error.message
          : 'Could not load the English word list.')
      }
    } finally {
      if (requestId === dictionaryRequestRef.current) setDictionaryLoading(false)
    }
  }
  const generatedNames = useMemo(
    () => dictionaryResult?.digits === submittedDigits
      ? generatePasswordNameSuggestions(submittedDigits, dictionaryResult.words)
      : null,
    [dictionaryResult, submittedDigits],
  )
  const allNames = useMemo(() => generatedNames
    ? [...new Set([
      ...generatedNames.dictionaryMatches,
      ...generatedNames.curatedMatches,
      ...generatedNames.pronounceableNames,
    ])]
    : [], [generatedNames])
  const nameResults = useMemo(() => {
    const rajanilaiSet = parseRajanilaiNumbers(defaultRajanilaiNumbers)
    return allNames.map((name) => getNameResult(name, rajanilaiSet))
  }, [allNames])

  return (
    <section className="password-page" aria-labelledby="password-page-title">
      <div className="page-heading">
        <h1 id="password-page-title">Password</h1>
      </div>
      <form
        className="password-number-form"
        onSubmit={handleSubmit}
      >
        <label className="password-number-field" htmlFor="password-number-input">
          <span>ENTER NUMBERS</span>
          <input
            id="password-number-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={digits}
            onChange={(event) => {
              dictionaryRequestRef.current += 1
              setDigits(event.target.value)
              setSubmittedDigits(null)
              setDictionaryResult(null)
              setDictionaryLoading(false)
              setDictionaryError('')
            }}
            placeholder="For example: 111"
            aria-describedby="password-number-help"
          />
          <span id="password-number-help" className="password-number-help">
            Enter digits from 1 to 8. Every letter in each digit’s row is considered.
          </span>
        </label>
        <button className="password-generate-button" type="submit" disabled={!digits.trim()}>
          Generate names
        </button>
      </form>

      <div className="password-map-wrap">
        <table className="password-map" aria-label="Number-to-letter table">
          <tbody>
            {digitLetterRows.map(({ digit, letters, color }) => (
              <tr key={digit}>
                <th className={`password-map-digit password-map-${color}`} scope="row">{digit}</th>
                {Array.from({ length: 5 }, (_, index) => (
                  <td
                    className={index < letters.length ? `password-map-${color}` : ''}
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

      {invalidDigits ? (
        <p className="password-page-message" role="alert">Use only digits 1 through 8.</p>
      ) : submittedDigits ? (
        <section className="password-page-results" aria-live="polite">
          <section aria-labelledby="password-results-title">
            <div className="password-page-results-heading">
              <h2 id="password-results-title">Generated names and words</h2>
              <span>All letters per digit</span>
              <CopyTextButton label="generated names and words" text={allNames.join('\n')} />
            </div>
            <p className="password-page-message">
              English words, curated names, and pronounceable suggestions are listed with their number and Rajanilai calculations.
            </p>
            {dictionaryLoading && <p role="status">Loading the local English dictionary…</p>}
            {dictionaryError && <p className="password-page-message" role="alert">{dictionaryError}</p>}
            {generatedNames && (
              <>
                <div className="password-result-table-wrap">
                  <table className="password-result-table">
                    <thead>
                      <tr>
                        <th scope="col">Position</th>
                        <th scope="col">Digit</th>
                        <th scope="col">Letters considered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedNames.letterOptions.map(({ digit, letters }, index) => (
                        <tr key={`${index}-${digit}`}>
                          <td>{index + 1}</td>
                          <td>{digit}</td>
                          <td><strong>{letters.join(', ')}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <section className="password-name-results" aria-label="Name and word suggestions">
                  <h3>All suggestions · {nameResults.length}</h3>
                  {nameResults.length > 0 ? (
                    <div className="name2number-result-table-wrap">
                      <table className="name2number-result-table">
                        <thead>
                          <tr>
                            <th scope="col">Name</th>
                            <th scope="col">st</th>
                            <th scope="col">total</th>
                            <th scope="col">name2numb</th>
                            <th scope="col">sum</th>
                            <th scope="col">bhavam</th>
                            <th scope="col">Rajanilai calculation</th>
                            <th scope="col">Rajanilai match</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nameResults.map((result, index) => (
                            <tr key={`${result.name}-${index}`}>
                              <td>{result.name}</td>
                              <td>{result.st}</td>
                              <td>{result.total}</td>
                              <td>{result.name2number}</td>
                              <td>{result.sum}={result.total}</td>
                              <td>{getRasiBhavam(result.name2number, initials)}</td>
                              <td className="name2number-rajanilai-calculation">
                                {result.rajanilaiPairs.length > 0
                                  ? result.rajanilaiPairs.map(({ number, matches }, pairIndex) => (
                                    <span
                                      className={matches
                                        ? 'name2number-rajanilai-pair-match'
                                        : 'name2number-rajanilai-pair-miss'}
                                      key={`${number}-${pairIndex}`}
                                    >
                                      {number} {matches ? '✓' : '✗'}
                                    </span>
                                  ))
                                  : '—'}
                              </td>
                              <td className={result.rajanilaiMatch
                                ? 'name2number-rajanilai-match'
                                : 'name2number-rajanilai-miss'}
                              >
                                {result.total} {result.rajanilaiMatch ? '✓✓' : '✗✗'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p>No candidates were generated for this number.</p>}
                  {generatedNames.searchLimited && (
                    <p>Pronounceable suggestions are based on the first 50,000 search steps.</p>
                  )}
                </section>
              </>
            )}
          </section>
        </section>
      ) : null}
    </section>
  )
}
