import { carRegNumberChart } from './carRegistrationGenerator'
import RasiChart from './RasiChart'
import TextareaLineCount from './TextareaLineCount'

export default function LuckyNumbersOverview({
  heading,
  profiles,
  initials,
  onInitialsChange,
  luckyNumbers,
  onLuckyNumbersChange,
  excludedNumbers,
  onExcludedNumbersChange,
  mobileCalculationPending = false,
  mobileCalculationError = '',
}) {
  return (
    <>
      <div className="page-heading">
        <h1>{heading}</h1>
      </div>
      <label className="combination-profile-select" htmlFor="manitha-naadi-initials">
        <span>INITIALS</span>
        <select
          id="manitha-naadi-initials"
          value={initials}
          onChange={(event) => onInitialsChange(event.target.value)}
        >
          {profiles.map((profile) => (
            <option value={profile} key={profile}>{profile}</option>
          ))}
        </select>
      </label>
      <div className="column-field matching-phone-field">
        <span className="column-title">LUCKY NUMBERS · {initials}</span>
        <TextareaLineCount value={luckyNumbers} />
        <textarea
          id="manitha-naadi-lucky-numbers"
          aria-label={`Lucky numbers · ${initials}`}
          value={luckyNumbers}
          onChange={(event) => onLuckyNumbersChange(event.target.value)}
          rows={4}
          spellCheck="false"
        />
        <label className="gen8-exclude-field" htmlFor="gen8-exclude-numbers">
          <span>Exclude from lucky numbers</span>
          <input
            id="gen8-exclude-numbers"
            type="text"
            value={excludedNumbers}
            onChange={(event) => onExcludedNumbersChange(event.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
        </label>
      </div>
      {mobileCalculationPending ? (
        <p className="mobile-calculation-status" role="status" aria-live="polite">
          <span className="mobile-calculation-spinner" aria-hidden="true" />
          Updating mobile-number calculations…
        </p>
      ) : null}
      {mobileCalculationError ? (
        <p className="vip-phone-numbers-error" role="alert">{mobileCalculationError}</p>
      ) : null}
      <div className="rasi-chart-layout">
        <RasiChart initials={initials} />
        <div className="car-reg-chart-wrap">
          <table className="car-reg-chart" aria-label="Number to letter chart">
            <tbody>
              {carRegNumberChart.map((row) => (
                <tr className={`car-reg-chart-row car-reg-chart-row-${row.value}`} key={row.value}>
                  <th scope="row">{row.value}</th>
                  {Array.from({ length: 5 }, (_, index) => (
                    <td key={index}>{row.letters[index] ?? ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
