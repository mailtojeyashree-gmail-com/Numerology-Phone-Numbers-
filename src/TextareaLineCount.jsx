import { memo } from 'react'

function TextareaLineCount({ value }) {
  const lineCount = value.split(/\r?\n/).filter((line) => line.trim()).length

  return (
    <span className="textarea-line-count">
      {lineCount} {lineCount === 1 ? 'line' : 'lines'}
    </span>
  )
}

export default memo(TextareaLineCount)
