function Gen8Button({ active, onGenerate }) {
  return (
    <button
      className={`combination-generate-button${active ? ' combination-generate-button-active' : ''}`}
      type="button"
      aria-label="Run GEN-8 with four values"
      title="Generate sums from four values"
      onClick={onGenerate}
    >
      GEN-8
    </button>
  )
}

export default Gen8Button
