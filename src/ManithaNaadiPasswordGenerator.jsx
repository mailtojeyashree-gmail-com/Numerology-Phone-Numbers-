import { useState } from 'react'
import { generatePasswords } from './manithaNaadiPasswords'
import CopyTextButton from './CopyTextButton'

const tableHeaders = ['Initials', 'Pair values', 'Number', 'Digit sum', 'Bhavam']

export default function ManithaNaadiPasswordGenerator({
  initials,
  luckyNumbers,
  rasiChartNumbersByPair,
  activeGenerator,
  onGenerate,
}) {
  const [passwords, setPasswords] = useState(null)
  const visiblePasswords = activeGenerator === 'GEN-PASSWORD' ? passwords : null

  return (
    <>
      <button
        className="combination-generate-button"
        type="button"
        aria-label="Generate memorable passwords"
        title="Generate name-and-number passwords that match the initials' lucky pair and total"
        onClick={() => {
          onGenerate()
          setPasswords(generatePasswords(initials, luckyNumbers))
        }}
      >
        GEN-PASSWORD
      </button>
      {visiblePasswords && (
        <section className="combination-results password-generator-results" aria-live="polite" aria-label={`Generated passwords for ${initials}`}>
          <div className="workspace-results-heading">
            <div>
              <span className="results-kicker">GEN-PASSWORD · {initials} VALUES</span>
              <h2>Generated passwords</h2>
            </div>
            <div className="workspace-results-actions">
              <span className="results-count" title="Each password's letter values add up to one of the selected lucky numbers">
                {visiblePasswords.matches.length} PASSWORDS · LUCKY TOTALS
              </span>
              <CopyTextButton
                label="passwords"
                text={visiblePasswords.matches.map(({ password }) => password).join('\n')}
              />
            </div>
          </div>
          <p className="password-generator-note">
            Each name starts with a letter pair that matches a lucky pair, then gets the initials-specific number suffix. The name and suffix values must total another lucky number. Ten names are shown per total where possible. These examples are not secure account passwords.
            {visiblePasswords.unmatchedTargets.length > 0
              ? ` No names meet both rules for: ${visiblePasswords.unmatchedTargets.join(', ')}.`
              : ''}
            {visiblePasswords.shortfallTargets.length > 0
              ? ` Fewer than ten matches for: ${visiblePasswords.shortfallTargets
                .filter(({ count }) => count > 0)
                .map(({ luckyNumber, count }) => `${luckyNumber} (${count})`)
                .join(', ')}.`
              : ''}
          </p>
          <div className="manitha-results-table-wrap">
            <table className="manitha-results-table">
              <thead>
                <tr>
                  {tableHeaders.map((heading) => (
                    <th scope="col" key={heading}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visiblePasswords.matches.map(({ password, initialPair, letterValues, total }, index) => (
                  <tr key={`${password}-${index}`}>
                    <td>{initials}</td>
                    <td className="password-letter-breakdown">
                      <strong className="password-initial-pair">
                        {letterValues.slice(0, 2).map(({ letter }) => letter).join('')} = {initialPair}
                      </strong>
                      <span className="password-letters">{letterValues.map(({ letter }) => letter).join(' ')}</span>
                      <span className="password-letter-values">
                        <strong className="password-matched-pair">{initialPair}</strong>
                        {letterValues.slice(2).map(({ value }) => ` ${value}`).join('')}
                      </span>
                    </td>
                    <td><strong>{password}</strong></td>
                    <td><strong>{total}</strong></td>
                    <td><strong>{rasiChartNumbersByPair.get(String(total).padStart(2, '0'))?.join('/') ?? '—'}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}
