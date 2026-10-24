import { useMemo, useState } from 'react'
import LuckyNumbersOverview from './LuckyNumbersOverview'
import { getRasiBhavam } from './rasiChartData'
import { manithaNaadiRajanilaiNumbers } from './manithaNaadiRajanilai'

const VIP_NUMBER_PAGE_SIZE = 100

function getUniquePairs(values) {
  return [...new Set(values)].sort((first, second) => Number(first) - Number(second))
}

export default function VipNumbersPage(props) {
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

  const tableRows = useMemo(() => {
    if (!phoneNumbers) return []
    const luckyPairs = new Set(
      String(props.luckyNumbers ?? '')
        .split(/[\s,]+/)
        .filter((pair) => /^\d{2}$/.test(pair)),
    )

    return phoneNumbers.map((number) => {
      const digitPairs = number.slice(3).match(/\d{2}/g) ?? []
      const uniquePairs = getUniquePairs(digitPairs)
      const digitSum = [...number].reduce((total, digit) => total + Number(digit), 0)
      const pairBhavams = digitPairs.map((pair) => getRasiBhavam(pair, props.initials)
        .split(',').map((bhavam) => bhavam.trim()))
      const sumBhavams = getRasiBhavam(String(digitSum).padStart(2, '0'), props.initials)
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
  }, [phoneNumbers, props.initials, props.luckyNumbers])

  const digitSums = useMemo(
    () => [...new Set(tableRows.map((row) => row.digitSum))].sort((first, second) => first - second),
    [tableRows],
  )
  const numberPrefixes = useMemo(
    () => [...new Set(tableRows.map((row) => row.number.slice(0, 3)))]
      .sort((first, second) => Number(first) - Number(second)),
    [tableRows],
  )

  const visibleRows = tableRows
    .filter((row) => (
      (digitSumFilters.length === 0 || digitSumFilters.includes(String(row.digitSum)))
      && (numberPrefixFilters.length === 0
        || numberPrefixFilters.includes(row.number.slice(0, 3)))
      && (uniquePairFilters.length === 0
        || uniquePairFilters.includes(row.uniquePairs.join(',')))
      && (!allPairChecksFilter || row.pairChecks.every(({ matches }) => matches))
      && (!allRajanilaiCalculationsFilter
        || row.rajanilaiCalculation.every(({ matches }) => matches))
    ))
    .sort((first, second) => {
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

  async function togglePhoneNumbers() {
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
      const { default: savedNumbers } = await import('../available-mobile-numbers.json')
      if (
        !Array.isArray(savedNumbers)
        || !savedNumbers.every((number) => typeof number === 'string' && /^07\d{9}$/.test(number))
      ) {
        throw new Error('The saved file does not contain a valid phone-number list.')
      }
      setPhoneNumbers(savedNumbers)
      setShowPhoneNumbers(true)
      setPage(0)
      setDigitSumFilters([])
      setNumberPrefixFilters([])
      setAllPairChecksFilter(false)
      setAllRajanilaiCalculationsFilter(false)
      setUniquePairFilters([])
    } catch {
      setPhoneNumbersError('Could not load the saved phone numbers. Check available-mobile-numbers.json and try again.')
    } finally {
      setIsLoadingPhoneNumbers(false)
    }
  }

  function applyUniquePairFilter(event) {
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

  return (
    <section className="matching-numbers-page" id="vipnumbers" aria-labelledby="vipnumbers-title">
      <LuckyNumbersOverview {...props} />
      <div className="vip-phone-numbers">
        <button
          className="combination-generate-button vip-phone-numbers-toggle"
          type="button"
          onClick={togglePhoneNumbers}
          disabled={isLoadingPhoneNumbers}
        >
          {isLoadingPhoneNumbers
            ? 'Loading phone numbers...'
            : showPhoneNumbers
              ? 'Hide Phone numbers'
              : 'Show Phone numbers'}
        </button>
        {phoneNumbersError ? <p className="vip-phone-numbers-error" role="alert">{phoneNumbersError}</p> : null}
        {showPhoneNumbers && phoneNumbers ? (
          <section className="vip-phone-numbers-list" aria-label="Saved phone numbers">
            <div className="workspace-results-heading">
              <div>
                <span className="results-kicker">phoneovernet · {props.initials}</span>
                <h2>Saved phone numbers</h2>
              </div>
              <span className="results-count">{visibleRows.length.toLocaleString()} / {phoneNumbers.length.toLocaleString()} NUMBERS</span>
            </div>
            <div className="vip-result-check-filters" role="group" aria-label="Filter numbers by pair match results">
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
            </div>
            <div className="manitha-results-table-wrap">
              <table className="manitha-results-table">
                <thead>
                  <tr>
                    <th scope="col">Initials</th>
                    <th scope="col">Pair checks · {props.initials} lucky numbers</th>
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
                    <th scope="col">
                      <div className="car-reg-digit-sum-filter" role="group" aria-label="Filter saved phone numbers by prefix">
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
                    </th>
                    <th scope="col">Rajanilai calculation</th>
                    <th scope="col">Rajanilai match</th>
                    <th scope="col">Pair bhavam</th>
                    <th scope="col">
                      <div className="car-reg-digit-sum-filter" role="group" aria-label="Filter saved phone numbers by digit sum">
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
                    <tr><td colSpan={9}>No numbers match the selected filters.</td></tr>
                  ) : pagedRows.map((row) => (
                    <tr key={row.number}>
                      <td>{props.initials}</td>
                      <td>
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
                      </td>
                      <td>{row.uniquePairs.join(', ')}</td>
                      <td>{row.number}</td>
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
              <nav className="car-reg-pagination" aria-label="Saved phone number pages">
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
                      Enter one to four pairs per line, separated by commas or entered together.
                    </label>
                    <textarea
                      id="vip-unique-pair-filter-input"
                      rows={5}
                      placeholder="14, 41, 64, 85"
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
          </section>
        ) : null}
      </div>
    </section>
  )
}
