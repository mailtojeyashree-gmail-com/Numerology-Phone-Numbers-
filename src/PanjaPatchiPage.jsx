import { useState } from 'react'
import './PanjaPatchiPage.css'

const weekdays = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி']
const periods = ['வளர்', 'தேய்']
const timeSlots = [
  '6 to 8:30',
  '8:30 to 10:45',
  '10:45 to 1:15',
  '1:15 to 3:30',
  '3:30 to 6:00',
  '6:00 to 8:30',
  '8:30 to 10:45',
  '10:45 to 1:15',
  '1:15 to 3:30',
  '3:30 to 6:00',
]
const timeSlotDurations = [150, 135, 150, 135, 150, 150, 135, 150, 135, 150]

function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function getSunriseTimeRanges(sunriseTime) {
  if (!sunriseTime) return []

  const [hours, minutes] = sunriseTime.split(':').map(Number)
  let startMinutes = hours * 60 + minutes

  return timeSlotDurations.map((duration) => {
    const endMinutes = (startMinutes + duration) % (24 * 60)
    const range = `${formatTime(startMinutes)} to ${formatTime(endMinutes)}`
    startMinutes = endMinutes
    return range
  })
}

const calendars = {
  1: [
    [80, 50, 100, 40, 30, 30, 50, 40, 80, 100],
    [50, 80, 30, 40, 100, 80, 40, 50, 30, 100],
    [30, 80, 50, 100, 40, 50, 40, 80, 100, 30],
    [40, 100, 50, 80, 30, 30, 100, 80, 40, 50],
    [80, 50, 100, 40, 30, 30, 50, 40, 80, 100],
    [50, 80, 30, 40, 100, 80, 40, 50, 30, 100],
    [30, 80, 50, 100, 40, 50, 40, 80, 100, 30],
    [30, 40, 100, 50, 80, 40, 50, 30, 100, 80],
    [40, 30, 80, 50, 100, 40, 80, 100, 30, 50],
    [100, 50, 80, 30, 40, 50, 30, 100, 80, 40],
    [100, 40, 30, 80, 50, 80, 100, 30, 50, 40],
    [80, 30, 40, 100, 50, 100, 80, 40, 50, 30],
    [50, 100, 40, 30, 80, 100, 30, 50, 40, 80],
    [40, 100, 50, 80, 30, 30, 100, 80, 40, 50],
  ],
  2: [
    [50, 100, 40, 30, 80, 100, 30, 50, 40, 80],
    [30, 40, 100, 50, 80, 100, 80, 40, 50, 30],
    [80, 50, 100, 40, 30, 30, 50, 40, 80, 100],
    [50, 80, 30, 40, 100, 50, 30, 100, 80, 40],
    [50, 100, 40, 30, 80, 100, 30, 50, 40, 80],
    [30, 40, 100, 50, 80, 100, 80, 40, 50, 30],
    [80, 50, 100, 40, 30, 80, 50, 40, 80, 100],
    [100, 50, 80, 30, 40, 80, 40, 50, 30, 100],
    [30, 80, 50, 100, 40, 50, 40, 80, 100, 30],
    [80, 30, 40, 100, 50, 40, 50, 30, 100, 30],
    [40, 30, 80, 50, 100, 40, 80, 100, 30, 50],
    [40, 100, 50, 80, 30, 30, 100, 80, 40, 50],
    [100, 40, 30, 80, 80, 80, 100, 30, 60, 40],
    [50, 80, 30, 40, 50, 50, 30, 100, 80, 40],
  ],
  3: [
    [100, 40, 30, 80, 50, 80, 100, 30, 50, 40],
    [100, 50, 80, 30, 40, 30, 100, 80, 40, 50],
    [50, 100, 40, 30, 80, 100, 30, 60, 40, 80],
    [30, 40, 100, 50, 80, 40, 50, 30, 100, 80],
    [100, 40, 30, 80, 50, 80, 100, 30, 50, 40],
    [100, 50, 80, 30, 40, 30, 100, 80, 40, 50],
    [50, 100, 40, 30, 80, 100, 30, 80, 40, 50],
    [80, 30, 40, 100, 50, 100, 80, 40, 50, 30],
    [80, 50, 100, 40, 30, 30, 50, 40, 80, 100],
    [40, 100, 50, 80, 30, 80, 40, 50, 30, 100],
    [30, 80, 50, 100, 40, 50, 40, 80, 100, 30],
    [50, 80, 30, 40, 100, 50, 30, 100, 80, 40],
    [40, 30, 80, 50, 100, 40, 80, 100, 30, 50],
    [30, 40, 100, 50, 80, 40, 50, 30, 100, 80],
  ],
  4: [
    [40, 30, 80, 50, 100, 40, 80, 100, 30, 50],
    [80, 30, 40, 100, 50, 50, 30, 100, 80, 40],
    [100, 40, 30, 80, 50, 80, 100, 30, 50, 40],
    [100, 60, 80, 30, 40, 80, 40, 50, 30, 100],
    [40, 30, 80, 50, 100, 40, 80, 100, 30, 50],
    [80, 30, 40, 100, 50, 50, 30, 100, 80, 40],
    [100, 40, 30, 80, 40, 80, 100, 30, 50, 40],
    [40, 100, 50, 80, 30, 30, 100, 80, 40, 50],
    [50, 100, 40, 30, 80, 100, 30, 50, 40, 80],
    [50, 80, 30, 40, 100, 100, 80, 40, 50, 30],
    [80, 50, 100, 40, 30, 30, 50, 40, 80, 100],
    [30, 40, 100, 50, 40, 40, 50, 30, 100, 80],
    [30, 80, 50, 100, 50, 50, 40, 80, 100, 30],
    [100, 50, 80, 30, 80, 80, 40, 50, 30, 100],
  ],
  5: [
    [30, 80, 50, 100, 40, 50, 40, 80, 100, 30],
    [40, 100, 50, 80, 30, 40, 50, 30, 100, 80],
    [40, 30, 80, 50, 100, 40, 80, 100, 30, 50],
    [80, 30, 40, 100, 50, 100, 80, 40, 50, 30],
    [30, 80, 50, 100, 40, 50, 40, 80, 100, 30],
    [40, 100, 50, 80, 30, 50, 50, 30, 100, 80],
    [40, 30, 80, 50, 100, 40, 80, 100, 30, 50],
    [50, 80, 30, 40, 100, 50, 30, 100, 80, 40],
    [100, 40, 30, 80, 50, 80, 100, 30, 50, 40],
    [30, 40, 100, 50, 80, 30, 100, 80, 40, 50],
    [50, 100, 40, 30, 80, 100, 30, 50, 40, 80],
    [100, 50, 80, 30, 40, 80, 40, 50, 30, 100],
    [80, 50, 100, 40, 30, 30, 50, 40, 80, 100],
    [80, 30, 40, 100, 50, 100, 80, 40, 50, 30],
  ],
}

function PanjaPatchiPage() {
  const [selectedCalendar, setSelectedCalendar] = useState('4')
  const [sunriseTime, setSunriseTime] = useState('06:00')
  const sunriseTimeRanges = getSunriseTimeRanges(sunriseTime)

  return (
    <section className="panja-patchi-page" aria-labelledby="panja-patchi-title">
      <div className="page-heading">
        <h1 id="panja-patchi-title">பஞ்ச பட்சி</h1>
      </div>
      <div className="panja-calendar-controls">
        <label className="panja-calendar-select" htmlFor="panja-patchi-calendar">
          <span>Calendar</span>
          <select
            id="panja-patchi-calendar"
            value={selectedCalendar}
            onChange={(event) => setSelectedCalendar(event.target.value)}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </label>
        <label className="panja-sunrise-select" htmlFor="panja-patchi-sunrise">
          <span>Sun rise</span>
          <input
            id="panja-patchi-sunrise"
            type="time"
            value={sunriseTime}
            onChange={(event) => setSunriseTime(event.target.value)}
          />
        </label>
      </div>
      <div className="panja-calendar-scroll">
        <table className="panja-calendar" aria-label={`பஞ்ச பட்சி நாட்காட்டி ${selectedCalendar}`}>
          <thead>
            <tr>
              <th className="panja-calendar-weekday-heading" scope="col">
                <span>கிழமை</span>
                <strong>{selectedCalendar}</strong>
              </th>
              <th className="panja-calendar-period-heading" scope="col">காலம்</th>
              {timeSlots.map((time, index) => (
                <th className="panja-calendar-time-heading" scope="col" key={time}>
                  <div className={`panja-calendar-time-labels${sunriseTimeRanges[index]
                    ? ' panja-calendar-time-labels-with-sunrise'
                    : ''}`}
                  >
                    <span className="panja-calendar-time-label">{time}</span>
                    {sunriseTimeRanges[index] && (
                      <span className="panja-calendar-sunrise-range">
                        {sunriseTimeRanges[index]}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekdays.flatMap((weekday, weekdayIndex) => periods.map((period, periodIndex) => {
              const rowIndex = weekdayIndex * periods.length + periodIndex
              return (
                <tr key={`${weekday}-${period}`}>
                  {periodIndex === 0 && (
                    <th className="panja-calendar-weekday" scope="rowgroup" rowSpan={periods.length}>
                      {weekday}
                    </th>
                  )}
                  <th className="panja-calendar-period" scope="row">{period}</th>
                  {calendars[selectedCalendar][rowIndex].map((value, index) => (
                    <td
                      className={periodIndex === 0 && (value === 80 || value === 100)
                        ? 'panja-calendar-highlighted-growth'
                        : periodIndex === 1 && value === 80
                          ? 'panja-calendar-highlighted-waning'
                          : undefined}
                      key={`${weekday}-${period}-${index}`}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              )
            }))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default PanjaPatchiPage
