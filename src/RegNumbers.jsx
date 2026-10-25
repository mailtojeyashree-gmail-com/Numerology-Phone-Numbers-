import { useMemo, useState } from 'react'
import LuckyNumbersOverview from './LuckyNumbersOverview'
import { getRasiBhavam } from './rasiChartData'
import { manithaNaadiRajanilaiNumbers } from './manithaNaadiRajanilai'

const VIP_NUMBER_PAGE_SIZE = 100

function getUniquePairs(values) {
  return [...new Set(values)].sort((first, second) => Number(first) - Number(second))
}

function getCanonicalPairs(values) {
  return [...values].sort((first, second) => Number(first) - Number(second)).join(',')
}

export default function RegNumbersPage(props) {
  const registrationLayout = props.registrationLayout ?? false
  const prefixLength = props.prefixLength ?? 3
  const initials = props.initials
  const luckyNumbers = props.luckyNumbers
  const toCalculationDigits = props.toCalculationDigits
  const pairStartIndex = props.pairStartIndex ?? 3
  const [phoneNumbers, setPhoneNumbers] = useState(null)
  const [isLoadingPhoneNumbers, setIsLoadingPhoneNumbers] = useState(false)
  const [phoneNumbersError, setPhoneNumbersError] = useState('')
  const [showPhoneNumbers, setShowPhoneNumbers] = useState(false)
  const [page, setPage] = useState(0)
  const [digitSumFilters, setDigitSumFilters] = useState([])
  const [numberPrefixFilters, setNumberPrefixFilters] = useState([])
  const [allPairChecksFilter, setAllPairChecksFilter] = useState(false)
  const [allRajanilaiCalculationsFilter, setAllRajanilaiCalculationsFilter] = useState(false)
  const [uniquePairFilters, setUniquePairFilters] = useState([])
  const [uniquePairFilterDraft, setUniquePairFilterDraft] = useState('')
  const [uniquePairFilterError, setUniquePairFilterError] = useState('')
  const [isUniquePairFilterOpen, setIsUniquePairFilterOpen] = useState(false)
  const [pairCheckFilters, setPairCheckFilters] = useState([])
  const [pairCheckFilterDraft, setPairCheckFilterDraft] = useState('')
  const [pairCheckFilterError, setPairCheckFilterError] = useState('')
  const [isPairCheckFilterOpen, setIsPairCheckFilterOpen] = useState(false)
  const [registrationSortDirection, setRegistrationSortDirection] = useState('asc')
  const [copyFeedback, setCopyFeedback] = useState({})

  const tableRows = useMemo(() => {
    if (!phoneNumbers) return []
    const luckyPairs = new Set(
      String(luckyNumbers ?? '')
        .split(/[\s,]+/)
        .filter((pair) => /^\d{2}$/.test(pair)),
    )

    return phoneNumbers.map((number) => {
      const calculationDigits = toCalculationDigits
        ? toCalculationDigits(number)
        : number
      const digitPairs = calculationDigits.slice(pairStartIndex).match(/\d{2}/g) ?? []
      const uniquePairs = registrationLayout
        ? [...digitPairs].sort((first, second) => Number(first) - Number(second))
        : getUniquePairs(digitPairs)
      const digitSum = [...calculationDigits].reduce((total, digit) => total + Number(digit), 0)
      const pairBhavams = digitPairs.map((pair) => getRasiBhavam(pair, initials)
        .split(',').map((bhavam) => bhavam.trim()))
      const sumBhavams = getRasiBhavam(String(digitSum).padStart(2, '0'), initials)
        .split(',').map((bhavam) => bhavam.trim())
      return {
        number,
        pairs: digitPairs.join(', '),
        pairChecks: digitPairs.map((pair) => ({
          pair,
          matches: luckyPairs.has(pair),
        })),
        digitPairs,
        uniquePairs,
        pairBhavams,
        digitSum,
        rajanilaiCalculation: digitPairs.map((pair) => ({
          pair,
          matches: manithaNaadiRajanilaiNumbers.has(Number(pair)),
        })),
        rajanilaiMatch: manithaNaadiRajanilaiNumbers.has(digitSum),
        sumBhavams,
      }
    })
  }, [
    phoneNumbers,
    initials,
    luckyNumbers,
    toCalculationDigits,
    pairStartIndex,
    registrationLayout,
  ])

  const digitSums = useMemo(
    () => [...new Set(tableRows.map((row) => row.digitSum))].sort((first, second) => first - second),
    [tableRows],
  )
  const numberPrefixes = useMemo(
    () => [...new Set(tableRows.map((row) => row.number.slice(0, prefixLength)))]
      .sort((first, second) => (
        /^\d+$/.test(first) && /^\d+$/.test(second)
          ? Number(first) - Number(second)
          : first.localeCompare(second)
      )),
    [tableRows, prefixLength],
  )

  const visibleRows = tableRows
    .filter((row) => (
      (digitSumFilters.length === 0 || digitSumFilters.includes(String(row.digitSum)))
      && (numberPrefixFilters.length === 0
        || numberPrefixFilters.includes(row.number.slice(0, prefixLength)))
      && (uniquePairFilters.length === 0
        || uniquePairFilters.includes(row.uniquePairs.join(',')))
      && (pairCheckFilters.length === 0
        || pairCheckFilters.includes(getCanonicalPairs(row.digitPairs)))
      && (!allPairChecksFilter || row.pairChecks.every(({ matches }) => matches))
      && (!allRajanilaiCalculationsFilter
        || row.rajanilaiCalculation.every(({ matches }) => matches))
    ))
    .sort((first, second) => {
      if (registrationLayout) {
        const order = first.number.localeCompare(second.number)
        return registrationSortDirection === 'asc' ? order : -order
      }
      const firstPassesAllChecks = first.rajanilaiMatch
        && first.pairChecks.every(({ matches }) => matches)
      const secondPassesAllChecks = second.rajanilaiMatch
        && second.pairChecks.every(({ matches }) => matches)
      return Number(secondPassesAllChecks) - Number(firstPassesAllChecks)
    })

  const pagedRows = visibleRows.slice(
    page * VIP_NUMBER_PAGE_SIZE,
    (page + 1) * VIP_NUMBER_PAGE_SIZE,
  )
  const selectedUniquePairs = [...new Set(visibleRows.flatMap((row) => row.digitPairs))]
  const selectedCombinations = new Map()
  const pairChecksCombinations = new Map()
  visibleRows.forEach((row) => {
    const combination = getCanonicalPairs(row.digitPairs).replaceAll(',', '')
    selectedCombinations.set(combination, (selectedCombinations.get(combination) ?? 0) + 1)
    const pairChecksCombination = row.digitPairs.join('')
    pairChecksCombinations.set(
      pairChecksCombination,
      (pairChecksCombinations.get(pairChecksCombination) ?? 0) + 1,
    )
  })
  const combinationText = [...selectedCombinations.keys()].join('\n')
  const pairChecksCombinationText = [...pairChecksCombinations.keys()].join('\n')
  const filteredRegistrations = [...new Set(visibleRows.map((row) => row.number))]
  const hasRegistrationFilters = registrationLayout && (
    digitSumFilters.length > 0
    || numberPrefixFilters.length > 0
    || uniquePairFilters.length > 0
    || pairCheckFilters.length > 0
    || allPairChecksFilter
    || allRajanilaiCalculationsFilter
  )

  async function copyList(copyKey, text) {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable in this browser.')
      }
      await navigator.clipboard.writeText(text)
      setCopyFeedback((current) => ({
        ...current,
        [copyKey]: { success: true, message: 'Copied to clipboard.' },
      }))
    } catch (error) {
      setCopyFeedback((current) => ({
        ...current,
        [copyKey]: {
          success: false,
          message: `Copy failed: ${error instanceof Error ? error.message : 'Clipboard access was denied.'}`,
        },
      }))
    }
  }

  function downloadFilteredRegistrations() {
    const xmlEscape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    })[character])
    const rows = [
      '<Row><Cell><Data ss:Type="String">Registration</Data></Cell></Row>',
      ...filteredRegistrations.map((registration) => (
        `<Row><Cell><Data ss:Type="String">${xmlEscape(registration)}</Data></Cell></Row>`
      )),
    ].join('')
    const workbook = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Registrations"><Table>${rows}</Table></Worksheet></Workbook>`
    const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `filtered-registrations-${initials}-${new Date().toISOString().slice(0, 10)}.xls`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
  }

  async function togglePhoneNumbers() {
    if (props.inputNumbers) {
      setPhoneNumbersError('')
      const inputLines = String(props.inputNumbersText ?? '').split(/\r?\n/)
      const entries = inputLines
        .map((line) => line.trim())
        .filter(Boolean)
      const invalidLines = inputLines.flatMap((line, index) => {
        const value = line.trim()
        return value && !(props.numberPattern ?? /^07\d{9}$/).test(value) ? [index + 1] : []
      })

      if (entries.length === 0) {
        setPhoneNumbersError('Paste one or more UK mobile numbers, one number per line.')
        setShowPhoneNumbers(false)
        return
      }
      if (invalidLines.length > 0) {
        setPhoneNumbersError(
          `Enter one 11-digit UK mobile number starting with 07 per line. Check line${invalidLines.length === 1 ? '' : 's'} ${invalidLines.join(', ')}.`,
        )
        setShowPhoneNumbers(false)
        return
      }

      setPhoneNumbers(entries)
      setShowPhoneNumbers(true)
      setPage(0)
      setDigitSumFilters([])
      setNumberPrefixFilters([])
      setAllPairChecksFilter(false)
      setAllRajanilaiCalculationsFilter(false)
      setUniquePairFilters([])
      setPairCheckFilters([])
      return
    }

    if (showPhoneNumbers) {
      setShowPhoneNumbers(false)
      return
    }

    if (phoneNumbers) {
      setShowPhoneNumbers(true)
      return
    }

    setIsLoadingPhoneNumbers(true)
    setPhoneNumbersError('')
    try {
      const savedNumbers = props.loadNumbers
        ? await props.loadNumbers()
        : (await import('../available-mobile-numbers.json')).default
      if (
        !Array.isArray(savedNumbers)
        || !savedNumbers.every((number) => (
          typeof number === 'string'
          && (props.numberPattern ?? /^07\d{9}$/).test(number)
        ))
      ) {
        throw new Error(`The saved file does not contain a valid ${props.itemName ?? 'phone number'} list.`)
      }
      setPhoneNumbers(savedNumbers)
      setShowPhoneNumbers(true)
      setPage(0)
      setDigitSumFilters([])
      setNumberPrefixFilters([])
      setAllPairChecksFilter(false)
      setAllRajanilaiCalculationsFilter(false)
      setUniquePairFilters([])
      setPairCheckFilters([])
      setRegistrationSortDirection('asc')
    } catch {
      setPhoneNumbersError(`Could not load the saved ${props.itemName ?? 'phone numbers'}. Check the JSON file and try again.`)
    } finally {
      setIsLoadingPhoneNumbers(false)
    }
  }

  function applyUniquePairFilter(event) {
    if (registrationLayout) {
      applyPairFilter(event, 'unique')
      return
    }
    event.preventDefault()
    const filters = []
    const invalidLines = []
    const lines = uniquePairFilterDraft.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)

    lines.forEach((line, index) => {
      const pairs = line.includes(',')
        ? line.split(',').map((pair) => pair.trim())
        : line.replace(/\s/g, '').match(/\d{2}/g) ?? []
      if (
        pairs.length === 0
        || pairs.length > 4
        || pairs.some((pair) => !/^\d{2}$/.test(pair))
      ) {
        invalidLines.push(index + 1)
        return
      }
      const filter = getUniquePairs(pairs).join(',')
      if (!filters.includes(filter)) filters.push(filter)
    })

    if (invalidLines.length > 0) {
      setUniquePairFilterError(
        `Enter one to four two-digit pairs per line. Check line${invalidLines.length === 1 ? '' : 's'} ${invalidLines.join(', ')}.`,
      )
      return
    }

    setUniquePairFilters(filters)
    setUniquePairFilterDraft(filters.map((filter) => filter.replaceAll(',', ', ')).join('\n'))
    setPage(0)
    setUniquePairFilterError('')
    setIsUniquePairFilterOpen(false)
  }

  function applyPairFilter(event, filterType) {
    event.preventDefault()
    const isUniquePairFilter = filterType === 'unique'
    const draft = isUniquePairFilter ? uniquePairFilterDraft : pairCheckFilterDraft
    const setFilterError = isUniquePairFilter ? setUniquePairFilterError : setPairCheckFilterError
    const setFilters = isUniquePairFilter ? setUniquePairFilters : setPairCheckFilters
    const setFilterDraft = isUniquePairFilter ? setUniquePairFilterDraft : setPairCheckFilterDraft
    const setFilterOpen = isUniquePairFilter ? setIsUniquePairFilterOpen : setIsPairCheckFilterOpen
    const filters = []
    const invalidLines = []

    draft.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).forEach((line, index) => {
      const pairs = line.includes(',')
        ? line.split(',').map((pair) => pair.trim())
        : line.replace(/\s/g, '').match(/\d{2}/g) ?? []
      if (pairs.length !== 3 || pairs.some((pair) => !/^\d{2}$/.test(pair))) {
        invalidLines.push(index + 1)
        return
      }
      const filter = getCanonicalPairs(pairs)
      if (!filters.includes(filter)) filters.push(filter)
    })

    if (invalidLines.length > 0) {
      setFilterError(
        `Enter exactly three two-digit pairs per line, separated by commas or entered together. Check line${invalidLines.length === 1 ? '' : 's'} ${invalidLines.join(', ')}.`,
      )
      return
    }

    setFilters(filters)
    setFilterDraft(filters.map((filter) => filter.replaceAll(',', ', ')).join('\n'))
    setPage(0)
    setFilterError('')
    setFilterOpen(false)
  }

  return (
    <section
      className="matching-numbers-page"
      id={props.pageId ?? 'vipnumbers'}
      aria-labelledby={props.titleId ?? 'vipnumbers-title'}
    >
      <LuckyNumbersOverview {...props} />
      <div className="vip-phone-numbers">
        {props.inputNumbers ? (
          <div className="vip-number-input">
            <label htmlFor="input-mobile-numbers">
              Paste UK mobile numbers, one number per line (11 digits, starting with 07).
            </label>
            <textarea
              id="input-mobile-numbers"
              aria-label="Paste mobile numbers"
              rows={8}
              placeholder={'07123456789\n07987654321'}
              value={props.inputNumbersText ?? ''}
              onChange={(event) => {
                props.onInputNumbersTextChange(event.target.value)
                setPhoneNumbersError('')
                setShowPhoneNumbers(false)
              }}
            />
          </div>
        ) : null}
        <button
          className="combination-generate-button vip-phone-numbers-toggle"
          type="button"
          onClick={togglePhoneNumbers}
          disabled={isLoadingPhoneNumbers}
        >
          {props.inputNumbers
            ? 'Analyze numbers'
            : isLoadingPhoneNumbers
            ? `Loading ${props.itemName ?? 'phone numbers'}...`
            : showPhoneNumbers
              ? `Hide ${props.buttonName ?? 'Phone numbers'}`
              : `Show ${props.buttonName ?? 'Phone numbers'}`}
        </button>
        {phoneNumbersError ? <p className="vip-phone-numbers-error" role="alert">{phoneNumbersError}</p> : null}
        {showPhoneNumbers && phoneNumbers ? (
          <section className="vip-phone-numbers-list" aria-label={`Saved ${props.itemName ?? 'phone numbers'}`}>
            <div className="workspace-results-heading">
              <div>
                <span className="results-kicker">{props.brandName ?? 'phoneovernet'} · {props.initials}</span>
                <h2>{registrationLayout ? 'Generated registrations' : `Saved ${props.headingItemName ?? 'phone numbers'}`}</h2>
              </div>
              <span className="results-count">{visibleRows.length.toLocaleString()} / {phoneNumbers.length.toLocaleString()} {props.countLabel ?? 'NUMBERS'}</span>
            </div>
            {!registrationLayout ? <div className="vip-result-check-filters" role="group" aria-label="Filter numbers by pair match results">
              <label>
                <input
                  type="checkbox"
                  checked={allPairChecksFilter}
                  onChange={(event) => {
                    setAllPairChecksFilter(event.target.checked)
                    setPage(0)
                  }}
                />
                All Pair checks match · {props.initials} lucky numbers
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={allRajanilaiCalculationsFilter}
                  onChange={(event) => {
                    setAllRajanilaiCalculationsFilter(event.target.checked)
                    setPage(0)
                  }}
                />
                All Rajanilai calculations match
              </label>
            </div> : null}
            <div className="manitha-results-table-wrap">
              <table className="manitha-results-table">
                <thead>
                  <tr>
                    {registrationLayout ? (
                      <th
                        scope="col"
                        aria-sort={registrationSortDirection === 'asc' ? 'ascending' : 'descending'}
                      >
                        <button
                          className="car-reg-sort-button"
                          type="button"
                          onClick={() => {
                            setRegistrationSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
                            setPage(0)
                          }}
                        >
                          Registration
                          <span aria-hidden="true">{registrationSortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                        </button>
                      </th>
                    ) : <th scope="col">Initials</th>}
                    <th scope="col">
                      {registrationLayout ? (
                        <div className="car-reg-pair-checks-heading">
                          <span>Pair checks</span>
                          <button
                            className="car-reg-pair-filter-button"
                            type="button"
                            aria-label="Filter registrations by pair checks"
                            onClick={() => {
                              setPairCheckFilterDraft(
                                pairCheckFilters.map((filter) => filter.replaceAll(',', ', ')).join('\n'),
                              )
                              setPairCheckFilterError('')
                              setIsPairCheckFilterOpen(true)
                            }}
                          >
                            {pairCheckFilters.length > 0
                              ? `Filter (${pairCheckFilters.length})`
                              : 'Filter'}
                          </button>
                        </div>
                      ) : `Pair checks · ${props.initials} lucky numbers`}
                    </th>
                    <th scope="col">
                      <div className="car-reg-pair-checks-heading">
                        <span>Unique pairs</span>
                        <button
                          className="car-reg-pair-filter-button"
                          type="button"
                          onClick={() => {
                            setUniquePairFilterDraft(
                              uniquePairFilters.map((filter) => filter.replaceAll(',', ', ')).join('\n'),
                            )
                            setUniquePairFilterError('')
                            setIsUniquePairFilterOpen(true)
                          }}
                        >
                          {uniquePairFilters.length > 0
                            ? `Filter (${uniquePairFilters.length})`
                            : 'Filter'}
                        </button>
                      </div>
                    </th>
                    {!registrationLayout ? <th scope="col">
                      <div className="car-reg-digit-sum-filter" role="group" aria-label={`Filter saved ${props.itemName ?? 'phone numbers'} by prefix`}>
                        <span>Number</span>
                        <div className="car-reg-digit-sum-options vip-number-prefix-options">
                          {numberPrefixes.map((prefix) => (
                            <label key={prefix}>
                              <input
                                type="checkbox"
                                checked={numberPrefixFilters.includes(prefix)}
                                onChange={(event) => {
                                  setNumberPrefixFilters((selected) => (
                                    event.target.checked
                                      ? [...selected, prefix]
                                      : selected.filter((selectedPrefix) => selectedPrefix !== prefix)
                                  ))
                                  setPage(0)
                                }}
                              />
                              {prefix}
                            </label>
                          ))}
                        </div>
                      </div>
                    </th> : null}
                    <th scope="col">Rajanilai calculation</th>
                    <th scope="col">Rajanilai match</th>
                    <th scope="col">Pair bhavam</th>
                    <th scope="col">
                      <div className="car-reg-digit-sum-filter" role="group" aria-label={`Filter saved ${props.itemName ?? 'phone numbers'} by digit sum`}>
                        <span>Digit sum</span>
                        <div className="car-reg-digit-sum-options">
                          {digitSums.map((digitSum) => {
                            const value = String(digitSum)
                            return (
                              <label key={value}>
                                <input
                                  type="checkbox"
                                  checked={digitSumFilters.includes(value)}
                                  onChange={(event) => {
                                    setDigitSumFilters((selected) => (
                                      event.target.checked
                                        ? [...selected, value]
                                        : selected.filter((selectedValue) => selectedValue !== value)
                                    ))
                                    setPage(0)
                                  }}
                                />
                                {digitSum}
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    </th>
                    <th scope="col">Sum bhavam</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.length === 0 ? (
                    <tr><td colSpan={registrationLayout ? 8 : 9}>No {registrationLayout ? 'registrations' : 'numbers'} match the selected filters.</td></tr>
                  ) : pagedRows.map((row) => (
                    <tr key={row.number}>
                      {registrationLayout
                        ? <td><strong>{row.number}</strong></td>
                        : <td>{props.initials}</td>}
                      <td>
                        {registrationLayout
                          ? (
                            <div className="car-reg-rajanilai-calculation">
                              {row.pairChecks.map(({ pair, matches }, index) => (
                                <span
                                  className={matches ? 'car-reg-rajanilai-pair-match' : 'car-reg-rajanilai-pair-miss'}
                                  key={`${pair}-${index}`}
                                >
                                  {pair} {matches ? '✓' : '✗'}
                                </span>
                              ))}
                            </div>
                          )
                          : (
                            <div className="car-reg-rajanilai-calculation">
                              {row.pairChecks.map(({ pair, matches }, index) => (
                                <span
                                  className={matches ? 'car-reg-rajanilai-pair-match' : 'car-reg-rajanilai-pair-miss'}
                                  key={`${pair}-${index}`}
                                >
                                  {pair} {matches ? '✓' : '✗'}
                                </span>
                              ))}
                            </div>
                          )}
                      </td>
                      <td>{row.uniquePairs.join(', ')}</td>
                      {!registrationLayout ? <td>{row.number}</td> : null}
                      <td>
                        <div className="car-reg-rajanilai-calculation">
                          {row.rajanilaiCalculation.map(({ pair, matches }, index) => (
                            <span
                              className={matches ? 'car-reg-rajanilai-pair-match' : 'car-reg-rajanilai-pair-miss'}
                              key={`${pair}-${index}`}
                            >
                              {pair} {matches ? '✓' : '✗'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className={row.rajanilaiMatch ? 'car-reg-rajanilai-match' : 'car-reg-rajanilai-miss'}>
                        {row.digitSum} {row.rajanilaiMatch ? '✓✓' : '✗✗'}
                      </td>
                      <td>
                        <div
                          className="car-reg-pair-bhavams"
                          aria-label={`Pair bhavam: ${row.pairBhavams.map((bhavams) => bhavams.join('/')).join(', ')}`}
                        >
                          {row.pairBhavams.map((bhavams, pairIndex) => (
                            <span className="car-reg-pair-bhavam" key={`${row.digitPairs[pairIndex]}-${pairIndex}`}>
                              {bhavams[0] && bhavams[0] !== '—'
                                ? bhavams.map((bhavam, bhavamIndex) => (
                                  <span className="rasi-chart-sign-badge" key={`${bhavam}-${bhavamIndex}`}>
                                    {bhavam}
                                  </span>
                                ))
                                : '—'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{row.digitSum}</td>
                      <td>
                        <div
                          className="car-reg-pair-bhavams"
                          aria-label={`Sum bhavam: ${row.sumBhavams.join('/')}`}
                        >
                          {row.sumBhavams[0] && row.sumBhavams[0] !== '—'
                            ? row.sumBhavams.map((bhavam, index) => (
                              <span className="rasi-chart-sign-badge" key={`${bhavam}-${index}`}>
                                {bhavam}
                              </span>
                            ))
                            : '—'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {visibleRows.length > VIP_NUMBER_PAGE_SIZE ? (
              <nav className="car-reg-pagination" aria-label={`Saved ${props.itemName ?? 'phone number'} pages`}>
                <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  Previous
                </button>
                <span>Page {page + 1} of {Math.ceil(visibleRows.length / VIP_NUMBER_PAGE_SIZE)} · {visibleRows.length.toLocaleString()} rows</span>
                <button
                  type="button"
                  disabled={page >= Math.ceil(visibleRows.length / VIP_NUMBER_PAGE_SIZE) - 1}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </nav>
            ) : null}
            {registrationLayout && visibleRows.length > 0 ? (
              <section className="car-reg-selected-combinations" aria-label="Selected registration combinations">
                <h3>Selected combinations</h3>
                <div className="car-reg-combinations-copy-field">
                  <div className="car-reg-copy-field-heading">
                    <span>Unique pairs</span>
                    <div className="car-reg-copy-action">
                      <button
                        className="combination-generate-button car-reg-copy-button"
                        type="button"
                        disabled={selectedUniquePairs.length === 0}
                        onClick={() => copyList('uniquePairs', selectedUniquePairs.join(', '))}
                      >
                        {copyFeedback.uniquePairs?.success ? 'Copied' : copyFeedback.uniquePairs ? 'Copy failed' : 'Copy list'}
                      </button>
                      {copyFeedback.uniquePairs ? (
                        <span
                          className={copyFeedback.uniquePairs.success ? 'car-reg-copy-success' : 'car-reg-copy-error'}
                          role="status"
                        >
                          {copyFeedback.uniquePairs.message}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <textarea
                    aria-label="Unique pairs"
                    rows={4}
                    readOnly
                    value={selectedUniquePairs.join(', ')}
                  />
                </div>
                <div className="car-reg-combinations-copy-field">
                  <div className="car-reg-copy-field-heading">
                    <span>Unique pairs Combination ({selectedCombinations.size})</span>
                    <div className="car-reg-copy-action">
                      <button
                        className="combination-generate-button car-reg-copy-button"
                        type="button"
                        disabled={!combinationText}
                        onClick={() => copyList('combinations', combinationText)}
                      >
                        {copyFeedback.combinations?.success ? 'Copied' : copyFeedback.combinations ? 'Copy failed' : 'Copy list'}
                      </button>
                      {copyFeedback.combinations ? (
                        <span
                          className={copyFeedback.combinations.success ? 'car-reg-copy-success' : 'car-reg-copy-error'}
                          role="status"
                        >
                          {copyFeedback.combinations.message}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <textarea
                    aria-label="Combination list"
                    rows={Math.min(12, Math.max(4, selectedCombinations.size))}
                    readOnly
                    value={combinationText}
                  />
                </div>
              </section>
            ) : null}
            {registrationLayout ? (
              <section className="car-reg-selected-combinations" aria-label="Pair checks combination">
                <div className="car-reg-combinations-copy-field">
                  <div className="car-reg-copy-field-heading">
                    <span>Pair checks combination ({pairChecksCombinations.size})</span>
                    <div className="car-reg-copy-action">
                      <button
                        className="combination-generate-button car-reg-copy-button"
                        type="button"
                        disabled={!pairChecksCombinationText}
                        onClick={() => copyList('pairChecksCombination', pairChecksCombinationText)}
                      >
                        {copyFeedback.pairChecksCombination?.success
                          ? 'Copied'
                          : copyFeedback.pairChecksCombination ? 'Copy failed' : 'Copy list'}
                      </button>
                      {copyFeedback.pairChecksCombination ? (
                        <span
                          className={copyFeedback.pairChecksCombination.success
                            ? 'car-reg-copy-success'
                            : 'car-reg-copy-error'}
                          role="status"
                        >
                          {copyFeedback.pairChecksCombination.message}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <textarea
                    aria-label="Pair checks combination"
                    rows={Math.min(12, Math.max(4, pairChecksCombinations.size))}
                    readOnly
                    value={pairChecksCombinationText}
                  />
                </div>
              </section>
            ) : null}
            {hasRegistrationFilters ? (
              <section className="car-reg-filtered-registrations" aria-label="Filtered registrations">
                <div className="workspace-results-heading">
                  <h2>Filtered registrations</h2>
                  <div className="car-reg-filtered-actions">
                    <div className="car-reg-copy-action">
                      <button
                        className="combination-generate-button car-reg-copy-button"
                        type="button"
                        disabled={filteredRegistrations.length === 0}
                        onClick={() => copyList('filteredRegistrations', filteredRegistrations.join('\n'))}
                      >
                        {copyFeedback.filteredRegistrations?.success
                          ? 'Copied'
                          : copyFeedback.filteredRegistrations ? 'Copy failed' : 'Copy list'}
                      </button>
                      {copyFeedback.filteredRegistrations ? (
                        <span
                          className={copyFeedback.filteredRegistrations.success
                            ? 'car-reg-copy-success'
                            : 'car-reg-copy-error'}
                          role="status"
                        >
                          {copyFeedback.filteredRegistrations.message}
                        </span>
                      ) : null}
                    </div>
                    <button
                      className="combination-generate-button"
                      type="button"
                      onClick={downloadFilteredRegistrations}
                      disabled={filteredRegistrations.length === 0}
                    >
                      Download as Excel
                    </button>
                  </div>
                </div>
                <div className="car-reg-selected-table-wrap">
                  <table className="car-reg-selected-table">
                    <thead>
                      <tr><th scope="col">Registration</th></tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map((registration) => (
                        <tr key={registration}><td>{registration}</td></tr>
                      ))}
                      {filteredRegistrations.length === 0 ? (
                        <tr><td>No registrations match the selected filters.</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}
            {isUniquePairFilterOpen ? (
              <div className="car-reg-pair-filter-backdrop">
                <section
                  className="car-reg-pair-filter-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="vip-unique-pair-filter-title"
                >
                  <div className="car-reg-pair-filter-dialog-heading">
                    <h3 id="vip-unique-pair-filter-title">Filter by unique pairs</h3>
                    <button
                      className="car-reg-pair-filter-close"
                      type="button"
                      aria-label="Close unique pairs filter"
                      onClick={() => setIsUniquePairFilterOpen(false)}
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={applyUniquePairFilter}>
                    <label htmlFor="vip-unique-pair-filter-input">
                      {registrationLayout
                        ? 'Enter exactly three pairs per line, separated by commas or entered together.'
                        : 'Enter one to four pairs per line, separated by commas or entered together.'}
                    </label>
                    <textarea
                      id="vip-unique-pair-filter-input"
                      rows={5}
                      placeholder={registrationLayout ? '88, 88, 54' : '14, 41, 64, 85'}
                      value={uniquePairFilterDraft}
                      onChange={(event) => {
                        setUniquePairFilterDraft(event.target.value)
                        setUniquePairFilterError('')
                      }}
                    />
                    {uniquePairFilterError ? (
                      <p className="car-reg-pair-filter-error" role="alert">{uniquePairFilterError}</p>
                    ) : null}
                    <div className="car-reg-pair-filter-actions">
                      <button className="combination-generate-button" type="submit">Apply filter</button>
                      <button
                        className="car-reg-pair-filter-clear"
                        type="button"
                        onClick={() => {
                          setUniquePairFilters([])
                          setUniquePairFilterDraft('')
                          setUniquePairFilterError('')
                          setPage(0)
                          setIsUniquePairFilterOpen(false)
                        }}
                      >
                        Clear filter
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            ) : null}
            {isPairCheckFilterOpen ? (
              <div className="car-reg-pair-filter-backdrop">
                <section
                  className="car-reg-pair-filter-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="regnumber-pair-filter-title"
                >
                  <div className="car-reg-pair-filter-dialog-heading">
                    <h3 id="regnumber-pair-filter-title">Filter by pair checks</h3>
                    <button
                      className="car-reg-pair-filter-close"
                      type="button"
                      aria-label="Close pair checks filter"
                      onClick={() => setIsPairCheckFilterOpen(false)}
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={(event) => applyPairFilter(event, 'checks')}>
                    <label htmlFor="regnumber-pair-filter-input">
                      Enter exactly three pairs per line, separated by commas or entered together.
                    </label>
                    <textarea
                      id="regnumber-pair-filter-input"
                      rows={5}
                      placeholder={'88, 88, 54\n85, 68, 68'}
                      value={pairCheckFilterDraft}
                      onChange={(event) => {
                        setPairCheckFilterDraft(event.target.value)
                        setPairCheckFilterError('')
                      }}
                    />
                    {pairCheckFilterError ? (
                      <p className="car-reg-pair-filter-error" role="alert">{pairCheckFilterError}</p>
                    ) : null}
                    <div className="car-reg-pair-filter-actions">
                      <button className="combination-generate-button" type="submit">Apply filter</button>
                      <button
                        className="car-reg-pair-filter-clear"
                        type="button"
                        onClick={() => {
                          setPairCheckFilters([])
                          setPairCheckFilterDraft('')
                          setPairCheckFilterError('')
                          setPage(0)
                          setIsPairCheckFilterOpen(false)
                        }}
                      >
                        Clear filter
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </section>
  )
}
