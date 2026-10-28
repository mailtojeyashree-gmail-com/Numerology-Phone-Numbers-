import { calculateGen12Matches } from './manithaNaadiGen8Logic'

export default function ManithaNaadiGen12Generator({
  luckyNumbers,
  excludedNumbers,
  activeGenerator,
  onGenerate,
}) {
  return (
    <button
      className={`combination-generate-button${activeGenerator === 'GEN-12' ? ' combination-generate-button-active' : ''}`}
      type="button"
      aria-label="Run GEN-12 with six values"
      title="Generate 12-digit numbers from six lucky-number pairs whose digit sum matches a lucky number"
      onClick={() => onGenerate(calculateGen12Matches(luckyNumbers, excludedNumbers))}
    >
      GEN-12
    </button>
  )
}
