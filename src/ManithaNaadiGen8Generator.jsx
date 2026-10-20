import { calculateGen8Matches } from './manithaNaadiGen8Logic'

export default function ManithaNaadiGen8Generator({
  luckyNumbers,
  excludedNumbers,
  activeGenerator,
  onGenerate,
}) {
  return (
    <button
      className={`combination-generate-button${activeGenerator === 'GEN-8' ? ' combination-generate-button-active' : ''}`}
      type="button"
      aria-label="Run GEN-8 with four values"
      title="Generate 8-digit numbers from four lucky-number pairs whose digit sum matches a lucky number"
      onClick={() => onGenerate(calculateGen8Matches(luckyNumbers, excludedNumbers))}
    >
      GEN-8
    </button>
  )
}
