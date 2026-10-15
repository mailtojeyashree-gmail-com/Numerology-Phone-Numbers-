import { rasiChartClockwiseOrder, rasiChartSigns, rasiChartStartingSigns } from './rasiChartData'

export default function RasiChart({ initials }) {
  const chartStartIndex = rasiChartClockwiseOrder.indexOf(rasiChartStartingSigns[initials])
  const badgeNumbers = new Map(rasiChartClockwiseOrder.map((sign, index) => [
    sign,
    (index - chartStartIndex + rasiChartClockwiseOrder.length) % rasiChartClockwiseOrder.length + 1,
  ]))

  return (
    <div className="rasi-chart" role="img" aria-label={`தமிழ் ராசிக் கட்டம் · ${initials}`}>
      {rasiChartSigns.map((sign) => (
        <div
          className="rasi-chart-sign"
          key={sign.name}
          style={{ gridColumn: sign.column, gridRow: sign.row }}
        >
          <span className="rasi-chart-sign-name">{sign.name}</span>
          <span className="rasi-chart-sign-badge">{badgeNumbers.get(sign.name)}</span>
          <span className="rasi-chart-sign-values">{sign.values.join(', ')}</span>
        </div>
      ))}
      <div className="rasi-chart-center">ராசி</div>
    </div>
  )
}
