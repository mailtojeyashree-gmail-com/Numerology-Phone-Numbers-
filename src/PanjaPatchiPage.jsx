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

const calendars = {
  4: [
    [40, 30, 80, 50, 100, 40, 80, 100, 30, 50],
    [80, 30, 40, 100, 50, 50, 30, 100, 80, 40],
    [100, 40, 30, 80, 50, 80, 100, 30, 50, 40],
    [100, 60, 80, 30, 40, 80, 40, 50, 30, 40],
    [40, 30, 50, 50, 100, 40, 80, 100, 30, 100],
    [80, 30, 40, 100, 50, 50, 30, 100, 50, 50],
    [100, 40, 30, 80, 40, 100, 100, 30, 50, 40],
    [40, 100, 50, 30, 30, 30, 50, 30, 50, 40],
    [50, 100, 40, 30, 80, 100, 80, 40, 50, 50],
    [50, 80, 30, 40, 100, 100, 80, 40, 50, 30],
    [30, 40, 100, 50, 40, 40, 50, 30, 100, 80],
    [30, 80, 50, 100, 50, 40, 50, 100, 30, 100],
    [30, 80, 50, 100, 50, 40, 40, 50, 30, 100],
    [100, 50, 80, 30, 80, 50, 40, 100, 30, 100],
  ],
  5: [
    [30, 80, 50, 100, 40, 50, 40, 80, 100, 30],
    [40, 100, 50, 80, 30, 40, 50, 30, 100, 80],
    [40, 30, 80, 50, 100, 40, 50, 30, 100, 80],
    [80, 30, 50, 100, 50, 100, 80, 40, 50, 30],
    [30, 80, 50, 100, 40, 50, 40, 80, 100, 30],
    [40, 100, 50, 80, 30, 40, 50, 30, 100, 30],
    [40, 30, 80, 50, 100, 40, 80, 100, 30, 80],
    [50, 80, 30, 40, 100, 50, 30, 50, 30, 50],
    [100, 40, 30, 80, 50, 50, 100, 30, 50, 40],
    [30, 40, 100, 50, 30, 30, 50, 30, 50, 40],
    [50, 100, 40, 30, 80, 100, 80, 40, 50, 50],
    [100, 50, 80, 30, 40, 80, 100, 50, 40, 80],
    [80, 50, 100, 40, 30, 30, 50, 40, 50, 100],
    [80, 30, 40, 100, 50, 100, 80, 40, 50, 30],
  ],
}

function PanjaPatchiPage() {
  const [selectedCalendar, setSelectedCalendar] = useState('4')

  return (
    <section className="panja-patchi-page" aria-labelledby="panja-patchi-title">
      <div className="page-heading">
        <h1 id="panja-patchi-title">பஞ்ச பட்சி</h1>
      </div>
      <label className="panja-calendar-select" htmlFor="panja-patchi-calendar">
        <span>Calendar</span>
        <select
          id="panja-patchi-calendar"
          value={selectedCalendar}
          onChange={(event) => setSelectedCalendar(event.target.value)}
        >
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </label>
      <div className="panja-calendar-scroll">
        <table className="panja-calendar" aria-label={`பஞ்ச பட்சி நாட்காட்டி ${selectedCalendar}`}>
          <thead>
            <tr>
              <th className="panja-calendar-weekday-heading" scope="col">
                <span>கிழமை</span>
                <strong>{selectedCalendar}</strong>
              </th>
              <th className="panja-calendar-period-heading" scope="col">காலம்</th>
              {timeSlots.map((time) => (
                <th className="panja-calendar-time-heading" scope="col" key={time}>
                  <span>{time}</span>
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
                    <td key={`${weekday}-${period}-${index}`}>{value}</td>
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
