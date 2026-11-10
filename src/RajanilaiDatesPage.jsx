import { useId, useMemo, useState } from 'react'
import TextareaLineCount from './TextareaLineCount'
import './RajanilaiDatesPage.css'
import { parseRajanilaiNumbers } from './name2numberLogic'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function getYearDigitSum(year) {
  return [...String(year)].reduce((sum, digit) => sum + Number(digit), 0)
}

function getDateMatchDetails(day, month, year, rajanilaiSet, includeMonth, includeYear) {
  const dateDigits = `${String(day).padStart(2, '0')}${String(month + 1).padStart(2, '0')}${year}`
  const dateDigitSum = [...dateDigits].reduce((sum, digit) => sum + Number(digit), 0)
  const yearDigitSum = getYearDigitSum(year)
  const dayMatches = rajanilaiSet.has(String(day))
  const sumMatches = rajanilaiSet.has(String(dateDigitSum))
  const monthMatches = rajanilaiSet.has(String(month + 1))
  const yearMatches = rajanilaiSet.has(String(yearDigitSum))

  return {
    dateDigits,
    dateDigitSum,
    dayMatches,
    sumMatches,
    monthMatches,
    yearDigitSum,
    yearMatches,
    matches: dayMatches
      && sumMatches
      && (!includeMonth || monthMatches)
      && (!includeYear || yearMatches),
  }
}

function findUpcomingFullyMatchedDates(today, rajanilaiSet, includeMonth, includeYear) {
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const endDate = new Date(today.getFullYear() + 5, today.getMonth(), today.getDate())
  const matches = []

  for (let date = startDate; date < endDate && matches.length < 20; date = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
  )) {
    const details = getDateMatchDetails(
      date.getDate(),
      date.getMonth(),
      date.getFullYear(),
      rajanilaiSet,
      includeMonth,
      includeYear,
    )
    if (details.matches) {
      matches.push({
        date: new Date(date),
        ...details,
      })
    }
  }

  return matches
}

function getStarPoints(centerX, centerY, outerRadius, innerRadius) {
  return Array.from({ length: 10 }, (_, index) => {
    const angle = (Math.PI * index) / 5 - Math.PI / 2
    const radius = index % 2 === 0 ? outerRadius : innerRadius
    return `${centerX + Math.cos(angle) * radius},${centerY + Math.sin(angle) * radius}`
  }).join(' ')
}

function RajanilaiSeal({ small = false }) {
  const sealId = useId().replaceAll(':', '')
  const stars = Array.from({ length: 24 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 24 - Math.PI / 2
    return {
      x: 50 + Math.cos(angle) * 39,
      y: 50 + Math.sin(angle) * 39,
      color: index % 2 === 0 ? '#f5d34f' : '#d9e0e5',
    }
  })

  return (
    <svg
      className={`rajanilai-calendar-seal${small ? ' rajanilai-calendar-seal--small' : ''}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Red, yellow, and silver Rajanilai seal"
    >
      <defs>
        <radialGradient id={`${sealId}-red`} cx="35%" cy="28%">
          <stop offset="0" stopColor="#d20d0d" />
          <stop offset="0.72" stopColor="#a90000" />
          <stop offset="1" stopColor="#720000" />
        </radialGradient>
        <radialGradient id={`${sealId}-metal`} cx="35%" cy="25%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.55" stopColor="#d9e0e5" />
          <stop offset="1" stopColor="#929ca8" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#d9aa20" stroke="#9e0000" strokeWidth="2" />
      <circle cx="50" cy="50" r="43" fill={`url(#${sealId}-red)`} stroke="#f8d64f" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="35.5" fill="none" stroke="#d9e0e5" strokeOpacity="0.55" strokeWidth="0.7" />
      {stars.map(({ x, y, color }, index) => (
        <polygon
          key={index}
          points={getStarPoints(x, y, 2.5, 1)}
          fill={color}
          stroke="#9e0000"
          strokeWidth="0.35"
        />
      ))}
      {Array.from({ length: 17 }, (_, index) => {
        const x = 20 + index * 3.75
        const height = 22 + Math.sin((index / 16) * Math.PI) * 18
        return (
          <path
            key={index}
            d={`M50 68 Q${(50 + x) / 2} ${69 - height * 0.7} ${x} ${68 - height}`}
            fill="none"
            stroke={index % 2 === 0 ? '#e5c4d0' : '#f3c83f'}
            strokeLinecap="round"
            strokeWidth={index % 3 === 0 ? '1.1' : '0.65'}
            opacity="0.9"
          />
        )
      })}
      <path d="M50 68 Q43 54 38 44M50 68 Q46 53 47 39M50 68 Q54 53 53 39M50 68 Q59 54 64 44" fill="none" stroke={`url(#${sealId}-metal)`} strokeLinecap="round" strokeWidth="1.5" />
      <path d="M50 66 C45 62 43 58 45 55 C49 56 51 60 50 66M50 66 C55 62 57 58 55 55 C51 56 49 60 50 66" fill="#f3d54e" stroke="#d9e0e5" strokeWidth="0.7" />
      <circle cx="50" cy="68" r="3.2" fill={`url(#${sealId}-metal)`} stroke="#f5d34f" strokeWidth="1" />
      <path d="M50 71v5" stroke="#f5d34f" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function RajanilaiDatesPage({ rajanilaiNumbers, onRajanilaiNumbersChange }) {
  const today = new Date()
  const [visibleMonth, setVisibleMonth] = useState(() => ({
    month: today.getMonth(),
    year: today.getFullYear(),
  }))
  const [includeMonthInMatch, setIncludeMonthInMatch] = useState(false)
  const [includeYearInMatch, setIncludeYearInMatch] = useState(false)
  const rajanilaiSet = useMemo(
    () => parseRajanilaiNumbers(rajanilaiNumbers),
    [rajanilaiNumbers],
  )
  const daysInMonth = new Date(visibleMonth.year, visibleMonth.month + 1, 0).getDate()
  const firstDayOffset = (new Date(visibleMonth.year, visibleMonth.month, 1).getDay() + 6) % 7
  const calendarCells = [
    ...Array.from({ length: firstDayOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]
  const matchingDateCount = calendarCells.filter((day) => {
    if (day === null) return false
    return getDateMatchDetails(
      day,
      visibleMonth.month,
      visibleMonth.year,
      rajanilaiSet,
      includeMonthInMatch,
      includeYearInMatch,
    ).matches
  }).length
  const upcomingFullyMatchedDates = findUpcomingFullyMatchedDates(
    today,
    rajanilaiSet,
    includeMonthInMatch,
    includeYearInMatch,
  )
  const selectableYears = Array.from({ length: 201 }, (_, index) => 1900 + index)

  function moveMonth(amount) {
    setVisibleMonth(({ month, year }) => {
      const newDate = new Date(year, month + amount, 1)
      return { month: newDate.getMonth(), year: newDate.getFullYear() }
    })
  }

  return (
    <section className="rajanilai-dates-page" aria-labelledby="rajanilai-dates-title">
      <header className="rajanilai-dates-heading">
        <div>
          <span className="results-kicker">MANITHA NAADI</span>
          <h1 id="rajanilai-dates-title">Rajanilai dates</h1>
          <p>Find dates whose day and full-date digit sum match Rajanilai numbers. Add month and year checks if needed.</p>
        </div>
      </header>

      <section className="rajanilai-dates-numbers" aria-labelledby="rajanilai-dates-numbers-title">
        <label id="rajanilai-dates-numbers-title" htmlFor="rajanilai-dates-numbers">
          Rajanilai numbers
        </label>
        <TextareaLineCount value={rajanilaiNumbers} />
        <textarea
          id="rajanilai-dates-numbers"
          rows={3}
          value={rajanilaiNumbers}
          onChange={(event) => onRajanilaiNumbersChange(event.target.value)}
          aria-label="Rajanilai numbers used by the calendar"
        />
      </section>

      <section className="rajanilai-calendar" aria-label={`${MONTHS[visibleMonth.month]} ${visibleMonth.year} calendar`}>
        <div className="rajanilai-calendar-toolbar">
          <label
            className="rajanilai-calendar-option"
            title="Require the month number to match a Rajanilai number"
          >
            <input
              type="checkbox"
              checked={includeMonthInMatch}
              onChange={(event) => setIncludeMonthInMatch(event.target.checked)}
            />
            <span>Month match</span>
          </label>
          <div className="rajanilai-calendar-navigation">
            <button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month">
              ‹
            </button>
            <div className="rajanilai-calendar-date-selectors">
              <label>
                <span className="visually-hidden">Select month</span>
                <select
                  value={visibleMonth.month}
                  onChange={(event) => setVisibleMonth((current) => ({
                    ...current,
                    month: Number(event.target.value),
                  }))}
                  aria-label="Select month"
                >
                  {MONTHS.map((month, index) => (
                    <option value={index} key={month}>{month}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="visually-hidden">Select year</span>
                <select
                  value={visibleMonth.year}
                  onChange={(event) => setVisibleMonth((current) => ({
                    ...current,
                    year: Number(event.target.value),
                  }))}
                  aria-label="Select year"
                >
                  {selectableYears.map((year) => (
                    <option value={year} key={year}>{year}</option>
                  ))}
                </select>
              </label>
            </div>
            <button type="button" onClick={() => moveMonth(1)} aria-label="Next month">
              ›
            </button>
          </div>
          <label
            className="rajanilai-calendar-option rajanilai-calendar-option--year"
            title="Require the sum of the year digits to match a Rajanilai number"
          >
            <input
              type="checkbox"
              checked={includeYearInMatch}
              onChange={(event) => setIncludeYearInMatch(event.target.checked)}
            />
            <span>Year sum match</span>
          </label>
        </div>
        <p className="rajanilai-calendar-summary">
          {matchingDateCount} dates match all selected Rajanilai checks this month.
        </p>
        <div className="rajanilai-calendar-viewport">
          <div className="rajanilai-calendar-grid" role="group" aria-label={`${MONTHS[visibleMonth.month]} ${visibleMonth.year}`}>
            {WEEKDAYS.map((weekday) => (
              <div className="rajanilai-calendar-weekday" key={weekday}>
                {weekday}
              </div>
            ))}
            {calendarCells.map((day, index) => {
              if (day === null) {
                return <div className="rajanilai-calendar-empty" aria-hidden="true" key={`empty-${index}`} />
              }

              const details = getDateMatchDetails(
                day,
                visibleMonth.month,
                visibleMonth.year,
                rajanilaiSet,
                includeMonthInMatch,
                includeYearInMatch,
              )
              const {
                dateDigitSum,
                dateDigits,
                dayMatches,
                sumMatches,
                monthMatches,
                yearDigitSum,
                yearMatches,
                matches,
              } = details
              const digitCalculation = [...dateDigits].join(' + ')
              const isToday = day === today.getDate()
                && visibleMonth.month === today.getMonth()
                && visibleMonth.year === today.getFullYear()
              const dateText = `${String(day).padStart(2, '0')}-${String(visibleMonth.month + 1).padStart(2, '0')}-${visibleMonth.year}`
              const markerLabel = matches
                ? 'all selected Rajanilai checks match'
                : 'one or more selected Rajanilai checks do not match'

              return (
                <div
                  className={`rajanilai-calendar-day${matches ? ' rajanilai-calendar-day--both' : ''}${includeMonthInMatch || includeYearInMatch ? ' rajanilai-calendar-day--extended' : ''}`}
                  role="group"
                  key={day}
                  aria-label={`${dateText}: digit sum ${dateDigitSum}; ${markerLabel}`}
                  aria-current={isToday ? 'date' : undefined}
                >
                  <span className={`rajanilai-calendar-day-number${isToday ? ' rajanilai-calendar-day-number--today' : ''}`}>
                    {day}
                  </span>
                  <span className="rajanilai-calendar-check">
                    <span>Day {String(day).padStart(2, '0')}</span>
                    <strong className={dayMatches ? 'rajanilai-calendar-match' : 'rajanilai-calendar-miss'}>
                      {dayMatches ? '✓✓' : '✗✗'}
                    </strong>
                  </span>
                  <span className="rajanilai-calendar-calculation" aria-label={`${dateText}: ${digitCalculation} equals ${dateDigitSum}`}>
                    {digitCalculation} = {dateDigitSum}
                  </span>
                  <span className="rajanilai-calendar-check">
                    <span>Date sum {dateDigitSum}</span>
                    <strong className={sumMatches ? 'rajanilai-calendar-match' : 'rajanilai-calendar-miss'}>
                      {sumMatches ? '✓✓' : '✗✗'}
                    </strong>
                  </span>
                  <span className="rajanilai-calendar-check">
                    <span>Month {String(visibleMonth.month + 1).padStart(2, '0')}</span>
                    <strong className={monthMatches ? 'rajanilai-calendar-match' : 'rajanilai-calendar-miss'}>
                      {monthMatches ? '✓✓' : '✗✗'}
                    </strong>
                  </span>
                  {includeYearInMatch ? (
                    <span className="rajanilai-calendar-check">
                      <span>Year sum {yearDigitSum}</span>
                      <strong className={yearMatches ? 'rajanilai-calendar-match' : 'rajanilai-calendar-miss'}>
                        {yearMatches ? '✓✓' : '✗✗'}
                      </strong>
                    </span>
                  ) : null}
                  {matches ? (
                    <RajanilaiSeal />
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
        <ul className="rajanilai-calendar-legend" aria-label="Calendar marker legend">
          <li><RajanilaiSeal small /> Red, yellow, and silver seal: all required checks match</li>
        </ul>
        <section className="rajanilai-upcoming-dates" aria-labelledby="rajanilai-upcoming-dates-title">
          <div className="rajanilai-upcoming-dates-heading">
            <div>
              <span className="results-kicker">NEXT FIVE YEARS</span>
              <h3 id="rajanilai-upcoming-dates-title">Upcoming Fully Matched Rajanilai Dates</h3>
            </div>
            <span>{upcomingFullyMatchedDates.length} dates</span>
          </div>
          {upcomingFullyMatchedDates.length > 0 ? (
            <ol className="rajanilai-upcoming-dates-list">
              {upcomingFullyMatchedDates.map(({ date, dateDigits, dateDigitSum, monthMatches, yearDigitSum, yearMatches }) => (
                <li key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}>
                  <strong>
                    {date.toLocaleDateString(undefined, {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </strong>
                  <span>{[...dateDigits].join(' + ')} = {dateDigitSum} ✓✓</span>
                  {includeMonthInMatch ? (
                    <span>Month {String(date.getMonth() + 1).padStart(2, '0')} {monthMatches ? '✓✓' : '✗✗'}</span>
                  ) : null}
                  {includeYearInMatch ? (
                    <span>Year digit sum {yearDigitSum} {yearMatches ? '✓✓' : '✗✗'}</span>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="rajanilai-upcoming-dates-empty">
              No fully matched dates found in the next five years with the selected Rajanilai rules.
            </p>
          )}
        </section>
      </section>
    </section>
  )
}
