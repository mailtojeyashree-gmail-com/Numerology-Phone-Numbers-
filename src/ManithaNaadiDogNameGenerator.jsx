import { useMemo, useState } from 'react'
import { carRegLetterValueMap } from './numerologyLetterValues'

const defaultRajanilaiNumbers = `2
4
6
8
10
12
14
16
20
22
26
32
33
39
41
42
45
51
52
54
56
64
66
68
72
73
74
77
79
80
84
85
87
88
89
92
93
95
97
99`

const femaleDogNames = [
  'Abby', 'Ada', 'Addie', 'Alice', 'Allie', 'Amber', 'Angel', 'Annie', 'Ariel', 'Athena',
  'Bailey', 'Belle', 'Bella', 'Betsy', 'Birdie', 'Bonnie', 'Brandy', 'Brownie', 'Buffy',
  'Callie', 'Candy', 'Carly', 'Casey', 'Cassie', 'Chloe', 'Cinnamon', 'Cleo', 'Coco',
  'Cookie', 'Daisy', 'Dakota', 'Darla', 'Delilah', 'Dixie', 'Dolly', 'Dottie', 'Ellie',
  'Elsa', 'Emma', 'Faith', 'Fifi', 'Flora', 'Gigi', 'Ginger', 'Goldie', 'Gracie', 'Greta',
  'Gypsy', 'Hannah', 'Harper', 'Hazel', 'Heidi', 'Holly', 'Honey', 'Hope', 'Izzy',
  'Jackie', 'Jade', 'Jasmine', 'Josie', 'Joy', 'June', 'Kayla', 'Kelsey', 'Kiki', 'Kira',
  'Lady', 'Layla', 'Lexi', 'Lily', 'Lola', 'Lucy', 'Lulu', 'Luna', 'Maggie', 'Maisie',
  'Maple', 'Marley', 'Maya', 'Mia', 'Millie', 'Minnie', 'Missy', 'Molly', 'Nala', 'Nellie',
  'Nina', 'Nora', 'Olive', 'Paisley', 'Penny', 'Pepper', 'Phoebe', 'Piper', 'Pippa', 'Pixie',
  'Queenie', 'Riley', 'Roxy', 'Ruby', 'Sadie', 'Sasha', 'Shelby', 'Skye', 'Sophie', 'Stella',
  'Sugar', 'Sydney', 'Trixie', 'Winnie', 'Zoe',
  'Aaliyah', 'Adele', 'Agnes', 'Alana', 'Alisha', 'Amara', 'Amy', 'Angela', 'April', 'Ava',
  'Barbara', 'Beatrice', 'Beth', 'Bianca', 'Blair', 'Blossom', 'Brenda', 'Brianna', 'Bridget',
  'Brooklyn', 'Camila', 'Cara', 'Carmen', 'Caroline', 'Charlotte', 'Chelsea', 'Clara', 'Clover',
  'Crystal', 'Cynthia', 'Daphne', 'Daria', 'Destiny', 'Diana', 'Dora', 'Eden', 'Edith',
  'Elaine', 'Elena', 'Eliza', 'Elizabeth', 'Emily', 'Erin', 'Esme', 'Esther', 'Eva', 'Evelyn',
  'Fern', 'Fiona', 'Frances', 'Freya', 'Gemma', 'Georgia', 'Gloria', 'Grace', 'Gwen', 'Hallie',
  'Harmony', 'India', 'Irene', 'Iris', 'Isla', 'Ivy', 'Jane', 'Janet', 'Jenna', 'Jessica',
  'Jill', 'Joan', 'Juno', 'Karen', 'Kelly', 'Kenya', 'Kimberly', 'Kristen', 'Lana', 'Laura',
  'Leah', 'Lena', 'Leslie', 'Lexie', 'Lila', 'Lois', 'Louise', 'Macy', 'Margo', 'Martha',
  'Mary', 'Melody', 'Merida', 'Michelle', 'Misha', 'Naomi', 'Natasha', 'Noelle', 'Opal', 'Paris',
  'Pearl', 'Polly', 'Priscilla', 'Rachel', 'Raven', 'Rebecca', 'Regina', 'Rita', 'Rose', 'Rosie',
  'Samantha', 'Scarlett', 'Simone', 'Skylar', 'Sonia', 'Tara', 'Tasha', 'Thea', 'Tiffany', 'Tina',
  'Valerie', 'Vera', 'Violet', 'Vivian', 'Wendy', 'Willow', 'Yara', 'Zara',
]

const nameTotals = femaleDogNames.map((name) => {
  const letterValues = [...name.toUpperCase()].map((letter) => ({
    letter,
    value: carRegLetterValueMap.get(letter),
  }))

  return {
    name,
    letterValues,
    total: letterValues.reduce((sum, entry) => sum + entry.value, 0),
  }
})

function generateNamesForTotal(target) {
  return nameTotals.filter(({ total }) => total === target).slice(0, 10)
}

function getRajanilaiPairChecks(letterValues, rajanilaiSet) {
  const pairStarts = []
  for (let index = 0; index < letterValues.length - 1; index += 2) {
    pairStarts.push(index)
  }
  if (letterValues.length % 2 === 1 && letterValues.length > 1) {
    pairStarts.push(letterValues.length - 2)
  }

  return pairStarts.map((start) => {
    const pair = letterValues.slice(start, start + 2)
    const number = pair.map(({ value }) => value).join('')
    return {
      letters: pair.map(({ letter }) => letter).join(''),
      number,
      matches: rajanilaiSet.has(String(Number(number))),
    }
  })
}

export default function ManithaNaadiDogNameGenerator({
  activeGenerator,
  onGenerate,
}) {
  const [rajanilaiNumbers, setRajanilaiNumbers] = useState(defaultRajanilaiNumbers)
  const rajanilaiSet = new Set(
    rajanilaiNumbers
      .split(/[\s,]+/)
      .filter((number) => /^\d+$/.test(number))
      .map((number) => String(Number(number))),
  )
  const matchesByTotal = useMemo(() => {
    const totals = [...new Set(
      rajanilaiNumbers
        .split(/[\s,]+/)
        .filter((number) => /^\d+$/.test(number))
        .map(Number),
    )]
    return totals.map((total) => ({
      total,
      matches: generateNamesForTotal(total),
    }))
  }, [rajanilaiNumbers])
  const matchCount = matchesByTotal.reduce((sum, entry) => sum + entry.matches.length, 0)
  const isActive = activeGenerator === 'GEN-DOG-NAMES'

  return (
    <>
      <button
        className={`combination-generate-button${isActive ? ' combination-generate-button-active' : ''}`}
        type="button"
        aria-label="Generate female dog names"
        title="Find female dog names whose letter-value sum matches a Rajanilai number"
        onClick={onGenerate}
      >
        GEN-DOG-NAMES
      </button>
      {isActive && (
        <section className="combination-results dog-name-generator-results" aria-live="polite" aria-label="Female dog name results">
          <label className="dog-name-rajanilai-field">
            <span>Rajanilai numbers</span>
            <textarea
              value={rajanilaiNumbers}
              onChange={(event) => setRajanilaiNumbers(event.target.value)}
              rows={6}
              spellCheck="false"
            />
          </label>
          <div className="workspace-results-heading">
            <div>
              <span className="results-kicker">GEN-DOG-NAMES · LETTER-VALUE TOTALS</span>
              <h2>Female dog names</h2>
            </div>
            <span className="results-count">{matchCount} REAL NAMES · UP TO 10 PER TOTAL</span>
          </div>
          <div className="manitha-results-table-wrap">
            <table className="manitha-results-table">
              <thead>
                <tr>
                  <th scope="col">Rajanilai number</th>
                  <th scope="col">Name</th>
                  <th scope="col">Letter values</th>
                  <th scope="col">Sum</th>
                  <th scope="col">Rajanilam numbers</th>
                </tr>
              </thead>
              <tbody>
                {matchCount > 0
                  ? matchesByTotal.flatMap(({ total, matches }) => matches.map(({ name, letterValues }, index) => {
                      const pairChecks = getRajanilaiPairChecks(letterValues, rajanilaiSet)
                      const allPairsMatch = pairChecks.length > 0
                        && pairChecks.every(({ matches: pairMatches }) => pairMatches)
                      return (
                        <tr
                          className={allPairsMatch ? 'dog-name-rajanilai-match-row' : undefined}
                          key={`${total}-${name}`}
                        >
                          <td>{total} · {index + 1}</td>
                          <td><strong>{name}</strong></td>
                          <td className="dog-name-letter-values">
                            {letterValues.map(({ letter, value }) => `${letter}=${value}`).join(' + ')}
                          </td>
                          <td><strong>{total}</strong></td>
                          <td className="dog-name-rajanilai-checks">
                            {pairChecks.map(({ letters, number, matches: pairMatches }, pairIndex) => (
                              <span className={pairMatches ? 'dog-name-rajanilai-pair-match' : 'dog-name-rajanilai-pair-miss'} key={`${letters}-${pairIndex}`}>
                                {letters} = {number} {pairMatches ? '✓' : '✗'}
                              </span>
                            ))}
                            <strong
                              className={allPairsMatch ? 'dog-name-rajanilai-pair-match' : 'dog-name-rajanilai-pair-miss'}
                              aria-label={allPairsMatch ? 'All pairs match Rajanilai numbers' : 'One or more pairs do not match Rajanilai numbers'}
                            >
                              {allPairsMatch ? '✓' : '✗'}
                            </strong>
                          </td>
                        </tr>
                      )
                    }))
                  : (
                    <tr>
                      <td colSpan="5">No names match the entered Rajanilai numbers.</td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}
