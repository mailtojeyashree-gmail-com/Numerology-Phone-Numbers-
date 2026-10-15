import { useMemo, useState } from 'react'
import './Name2NumberPage.css'
import { carRegLetterValueMap, carRegLetterValues } from './numerologyLetterValues'
import RasiChart from './RasiChart'
import { getRasiBhavam, rasiChartStartingSigns } from './rasiChartData'

const letterRows = Array.from({ length: 8 }, (_, index) => ({
  digit: index + 1,
  letters: carRegLetterValues
    .filter(([, value]) => value === index + 1)
    .map(([letter]) => letter),
}))

function xmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[character])
}

function getNameResult(name) {
  const letterValues = [...name.toUpperCase()]
    .filter((letter) => carRegLetterValueMap.has(letter))
    .map((letter) => ({ letter, value: carRegLetterValueMap.get(letter) }))
  const total = letterValues.reduce((sum, entry) => sum + entry.value, 0)

  return {
    name,
    letterValues,
    total,
    st: letterValues.length > 0
      ? `${letterValues[0].value}${letterValues[letterValues.length - 1].value}`
      : '',
    name2number: Array.from(
      { length: Math.ceil(letterValues.length / 2) },
      (_, index) => letterValues.slice(index * 2, index * 2 + 2)
        .map(({ value }) => value)
        .join(''),
    ).join(','),
    sum: letterValues.map(({ value }) => value).join('+'),
  }
}

export default function Name2NumberPage() {
  const [name, setName] = useState('')
  const [generatedNames, setGeneratedNames] = useState(null)
  const [selectedInitials, setSelectedInitials] = useState('MJ')
  const results = useMemo(
    () => (generatedNames ?? []).map(getNameResult),
    [generatedNames],
  )
  const validResults = results.filter(({ letterValues }) => letterValues.length > 0)
  const hasInvalidNames = results.some(({ letterValues }) => letterValues.length === 0)
    || (generatedNames !== null && generatedNames.length === 0)

  function downloadExcel() {
    const style = (id, { background, bold = false, size = 11 }) => (
      `<Style ss:ID="${id}"><Alignment ss:Vertical="Center" ss:WrapText="1"/>`
      + `<Font ss:FontName="Calibri" ss:Size="${size}"${bold ? ' ss:Bold="1"' : ''}/>`
      + (background ? `<Interior ss:Color="${background}" ss:Pattern="Solid"/>` : '')
      + '<Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D8D4C8"/>'
      + '<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D8D4C8"/>'
      + '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D8D4C8"/>'
      + '<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D8D4C8"/></Borders></Style>'
    )
    const workbookStyles = `<Styles>
      <Style ss:ID="Default"><Alignment ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#26332C"/></Style>
      ${style('Header', { background: '#E9E5D9', bold: true })}
      ${style('Body', { bold: true, size: 12 })}
    </Styles>`
    const headers = ['Name', 'st', 'total', 'name2numb', 'sum', 'bhavam']
    const row = (items, styleId, height) => (
      `<Row ss:AutoFitHeight="0" ss:Height="${height}">${items.map((value) => (
        `<Cell ss:StyleID="${styleId}"><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`
      )).join('')}</Row>`
    )
    const dataRows = validResults.map(({ name: resultName, st, total, name2number, sum }) => (
      row([resultName, st, total, name2number, `${sum}=${total}`, getRasiBhavam(name2number, selectedInitials)], 'Body', 32)
    ))
    const workbook = `<?xml version="1.0"?>
      <?mso-application progid="Excel.Sheet"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
        ${workbookStyles}
        <Worksheet ss:Name="Name2Number">
          <Table>
            <Column ss:Width="120"/><Column ss:Width="60"/><Column ss:Width="70"/><Column ss:Width="140"/><Column ss:Width="230"/><Column ss:Width="100"/>
            ${row(headers, 'Header', 24)}
            ${dataRows.join('')}
          </Table>
        </Worksheet>
      </Workbook>`
    const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `name2number-${new Date().toISOString().slice(0, 10)}.xls`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
  }

  return (
    <section className="name2number-page" aria-labelledby="name2number-title">
      <div className="page-heading">
        <p className="eyebrow"><span>01</span>NAME NUMBER CONVERTER</p>
        <h1 id="name2number-title">name2number</h1>
        <p className="intro-copy">Enter a name to generate its letter values and total.</p>
      </div>

      <form
        className="name2number-form"
        onSubmit={(event) => {
          event.preventDefault()
          setGeneratedNames(name.split(',').map((part) => part.trim()).filter(Boolean))
        }}
      >
        <label className="name2number-field" htmlFor="name2number-input">
          <span>ENTER A NAME</span>
          <input
            id="name2number-input"
            type="text"
            autoComplete="off"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setGeneratedNames(null)
            }}
            placeholder="For example: ANNA or ANNA, MARIA"
            aria-describedby="name2number-help"
          />
          <span id="name2number-help" className="name2number-help">
            Commas separate names; spaces within a name stay together. Other punctuation is ignored.
          </span>
        </label>
        <button className="name2number-button" type="submit" disabled={!name.trim()}>
          Generate
        </button>
        <button
          className="name2number-button name2number-download-button"
          type="button"
          onClick={downloadExcel}
          disabled={validResults.length === 0}
        >
          Download Excel
        </button>
      </form>

      <div id="name2number-output">
        {validResults.length > 0 ? (
          <section className="name2number-result" aria-live="polite" aria-label="Name number result">
            <div className="name2number-result-table-wrap">
              <table className="name2number-result-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">st</th>
                    <th scope="col">total</th>
                    <th scope="col">name2numb</th>
                    <th scope="col">sum</th>
                    <th scope="col">bhavam</th>
                  </tr>
                </thead>
                <tbody>
                  {validResults.map(({ name: resultName, st, total, name2number, sum }, index) => (
                    <tr key={`${resultName}-${index}`}>
                      <td>{resultName}</td>
                      <td>{st}</td>
                      <td>{total}</td>
                      <td>{name2number}</td>
                      <td>{sum}={total}</td>
                      <td>{getRasiBhavam(name2number, selectedInitials)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
        {hasInvalidNames ? (
          <p className="name2number-message" role="alert">
            Each comma-separated name must contain at least one English letter (A–Z).
          </p>
        ) : null}

        <label className="combination-profile-select name2number-initials" htmlFor="name2number-initials">
          <span>INITIALS</span>
          <select
            id="name2number-initials"
            value={selectedInitials}
            onChange={(event) => setSelectedInitials(event.target.value)}
          >
            {Object.keys(rasiChartStartingSigns)
              .filter((initials) => initials !== 'SM')
              .map((initials) => (
              <option value={initials} key={initials}>{initials}</option>
              ))}
          </select>
        </label>

        <div className="rasi-chart-layout">
          <RasiChart initials={selectedInitials} />
          <div className="name2number-map-wrap">
            <table className="name2number-map" aria-label="Number-to-letter chart">
              <tbody>
                {letterRows.map(({ digit, letters }) => (
                  <tr key={digit}>
                    <th className={`name2number-map-digit name2number-color-${digit}`} scope="row">
                      {digit}
                    </th>
                    {Array.from({ length: 5 }, (_, index) => (
                      <td
                        className={index < letters.length ? `name2number-color-${digit}` : ''}
                        key={index}
                      >
                        {letters[index] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
