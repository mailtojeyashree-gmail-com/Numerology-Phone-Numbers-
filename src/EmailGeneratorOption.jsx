import { useState } from 'react'
import { generateEmails } from './manithaNaadiPasswords'

const tableHeaders = ['Initials', 'Pair values', 'Email', 'Digit sum', 'Bhavam']

export default function EmailGeneratorOption({
  initials,
  luckyNumbers,
  onGenerate,
  onClear,
}) {
  const [includeGmailInTotal, setIncludeGmailInTotal] = useState(false)

  return (
    <div className="email-generator-option">
      <button
        className="combination-generate-button"
        type="button"
        aria-label="Generate emails"
        title="Generate email addresses whose letter pair and total match the selected lucky numbers"
        onClick={() => onGenerate(generateEmails(initials, luckyNumbers, includeGmailInTotal), includeGmailInTotal)}
      >
        GEN-EMAIL
      </button>
      <label className="email-domain-option" title="Include the gmail letters in the lucky total">
        <input
          type="checkbox"
          checked={includeGmailInTotal}
          onChange={(event) => {
            setIncludeGmailInTotal(event.target.checked)
            onClear()
          }}
        />
        <span>gmail.com</span>
      </label>
    </div>
  )
}

export function EmailGeneratorResults({ initials, results, rasiChartNumbersByPair }) {
  if (!results) return null

  return (
    <section className="combination-results password-generator-results email-generator-results" aria-live="polite" aria-label={`Generated emails for ${initials}`}>
      <div className="workspace-results-heading">
        <div>
          <span className="results-kicker">GEN-EMAIL · {initials} VALUES</span>
          <h2>Generated email addresses</h2>
        </div>
        <span className="results-count" title="Names, suffix and optionally gmail.com letters match each lucky total">
          {results.matches.length} EMAILS · LUCKY TOTALS
        </span>
      </div>
      <p className="password-generator-note">
        Addresses use readable combinations of the provided names. The first two name letters must match a lucky pair, and the name and initials suffix are counted
        {results.includeGmailInTotal ? ' with gmail.com letters included' : '; gmail.com is excluded from the total'}.
        {results.unmatchedTargets.length > 0
          ? ` No matches for: ${results.unmatchedTargets.join(', ')}.`
          : ''}
        {results.shortfallTargets.length > 0
          ? ` Fewer than ten matches for: ${results.shortfallTargets
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
            {results.matches.map(({ email, initialPair, letterValues, total }, index) => (
              <tr key={`${email}-${index}`}>
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
                <td><strong>{email}</strong></td>
                <td><strong>{total}</strong></td>
                <td><strong>{rasiChartNumbersByPair.get(String(total).padStart(2, '0'))?.join('/') ?? '—'}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
