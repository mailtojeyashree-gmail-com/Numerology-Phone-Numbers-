import { useMemo } from 'react'
import TextareaLineCount from './TextareaLineCount'
import './RajanilaiTimesPage.css'
import { parseRajanilaiNumbers } from './name2numberLogic'

function getMatchingTimes(rajanilaiSet) {
  return Array.from({ length: 12 * 60 }, (_, minuteOffset) => {
    const hour = String(Math.floor(minuteOffset / 60) + 1).padStart(2, '0')
    const minute = String(minuteOffset % 60).padStart(2, '0')
    const digits = `${hour}${minute}`
    const digitSum = [...digits].reduce((sum, digit) => sum + Number(digit), 0)

    if (!rajanilaiSet.has(String(digitSum)) || !rajanilaiSet.has(String(Number(minute)))) {
      return null
    }
    return {
      key: minuteOffset,
      time: `${hour}:${minute}`,
      digitSum,
      calculation: [...digits].join(' + '),
      minute,
    }
  }).filter(Boolean)
}

export default function RajanilaiTimesPage({ rajanilaiNumbers, onRajanilaiNumbersChange }) {
  const rajanilaiSet = useMemo(
    () => parseRajanilaiNumbers(rajanilaiNumbers),
    [rajanilaiNumbers],
  )
  const matchingTimes = useMemo(
    () => getMatchingTimes(rajanilaiSet),
    [rajanilaiSet],
  )

  return (
    <section className="rajanilai-times-page" aria-labelledby="rajanilai-times-title">
      <header className="rajanilai-times-heading">
        <div>
          <span className="results-kicker">MANITHA NAADI</span>
          <h1 id="rajanilai-times-title">Rajanilai times</h1>
          <p>See every time from 01:00 to 12:59 that matches both Rajanilai rules. Each result applies to both AM and PM.</p>
        </div>
      </header>

      <section className="rajanilai-dates-numbers" aria-labelledby="rajanilai-times-numbers-title">
        <label id="rajanilai-times-numbers-title" htmlFor="rajanilai-times-numbers">
          Rajanilai numbers
        </label>
        <TextareaLineCount value={rajanilaiNumbers} />
        <textarea
          id="rajanilai-times-numbers"
          rows={3}
          value={rajanilaiNumbers}
          onChange={(event) => onRajanilaiNumbersChange(event.target.value)}
          aria-label="Rajanilai numbers used by the time chart"
        />
      </section>

      <section className="rajanilai-times-results" aria-labelledby="rajanilai-times-results-title">
        <div className="rajanilai-times-results-heading">
          <div>
            <span className="results-kicker">01:00 AM/PM — 12:59 AM/PM</span>
            <h2 id="rajanilai-times-results-title">Matching times</h2>
          </div>
          <span className="rajanilai-times-count">{matchingTimes.length} matches</span>
        </div>
        <p className="rajanilai-times-rules">
          Both checks must match: the digit sum of HH:MM and the two-digit minute value. Each listed time occurs twice daily.
        </p>
        {matchingTimes.length > 0 ? (
          <div className="rajanilai-times-grid">
            {matchingTimes.map(({ key, time, digitSum, calculation, minute }) => (
              <article className="rajanilai-time-card" key={key}>
                <time className="rajanilai-time-card-time">{time}</time>
                <span className="rajanilai-time-card-date">AM and PM</span>
                <div className="rajanilai-time-card-checks">
                  <span>{calculation} = {digitSum}</span>
                  <span>{minute} ✓</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rajanilai-times-empty">
            No times from 01:00 to 12:59 match both rules and the current Rajanilai numbers.
          </p>
        )}
      </section>
    </section>
  )
}
