import { useMemo, useState } from 'react'
import './PasswordPage.css'
import CopyTextButton from './CopyTextButton'

const digitLetterRows = [
  { digit: '1', letters: ['A', 'I', 'J', 'Y', 'Q'], color: 'pink' },
  { digit: '2', letters: ['B', 'K', 'R'], color: 'blue' },
  { digit: '3', letters: ['C', 'G', 'L', 'S'], color: 'yellow' },
  { digit: '4', letters: ['D', 'M', 'T'], color: 'orange' },
  { digit: '5', letters: ['E', 'H', 'N', 'X'], color: 'green' },
  { digit: '6', letters: ['U', 'V', 'W'], color: 'peach' },
  { digit: '7', letters: ['Z', 'O'], color: 'cream' },
  { digit: '8', letters: ['F', 'P'], color: 'lavender' },
]
function getFirstLetterForDigit(digit) {
  return digitLetterRows.find((row) => row.digit === digit)?.letters[0] ?? ''
}

export default function PasswordPage() {
  const [digits, setDigits] = useState('')
  const [submittedDigits, setSubmittedDigits] = useState(null)
  const invalidDigits = submittedDigits !== null && /[^1-8]/.test(submittedDigits)
  const passwordLetters = useMemo(
    () => submittedDigits && !invalidDigits
      ? [...submittedDigits].map((digit) => ({
        digit,
        letter: getFirstLetterForDigit(digit),
      }))
      : [],
    [invalidDigits, submittedDigits],
  )
  const generatedPassword = passwordLetters.map(({ letter }) => letter).join('')

  return (
    <section className="password-page" aria-labelledby="password-page-title">
      <div className="page-heading">
        <h1 id="password-page-title">Password</h1>
      </div>
      <form
        className="password-number-form"
        onSubmit={(event) => {
          event.preventDefault()
          setSubmittedDigits(digits.trim())
        }}
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
              setDigits(event.target.value)
              setSubmittedDigits(null)
            }}
            placeholder="For example: 111"
            aria-describedby="password-number-help"
          />
          <span id="password-number-help" className="password-number-help">
            Enter digits from 1 to 8. Each digit can be replaced by any letter in its row.
          </span>
        </label>
        <button className="password-generate-button" type="submit" disabled={!digits.trim()}>
          Generate passwords
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
              <h2 id="password-results-title">Generated password</h2>
              <span>One letter per digit</span>
              <CopyTextButton label="generated password" text={generatedPassword} />
            </div>
            <p className="password-page-message">
              Each digit uses the first letter in its row, in the same order as entered.
            </p>
            <p className="password-generated-value"><code>{generatedPassword}</code></p>
            <div className="password-result-table-wrap">
              <table className="password-result-table">
                <thead>
                  <tr>
                    <th scope="col">Position</th>
                    <th scope="col">Digit</th>
                    <th scope="col">Letter</th>
                  </tr>
                </thead>
                <tbody>
                  {passwordLetters.map(({ digit, letter }, index) => (
                    <tr key={`${index}-${digit}`}>
                      <td>{index + 1}</td>
                      <td>{digit}</td>
                      <td><strong>{letter}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      ) : null}
    </section>
  )
}
