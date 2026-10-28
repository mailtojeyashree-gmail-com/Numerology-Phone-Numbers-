import { carRegLetterValueMap } from './numerologyLetterValues.js'
import { meaningfulWords } from './manithaNaadiPasswords.js'

let englishWordsPromise

export function loadEnglishWords(assetUrl) {
  if (!englishWordsPromise) {
    englishWordsPromise = fetch(assetUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load the English word list (${response.status}).`)
        }
        return response.text()
      })
      .then((text) => {
        const words = [...new Set(text.split(/\s+/).filter((word) => /^[a-z]+$/i.test(word)))]
        if (words.length === 0) throw new Error('The English word list contains no usable words.')
        return words
      })
      .catch((error) => {
        englishWordsPromise = undefined
        throw error
      })
  }
  return englishWordsPromise
}

export const digitLetterRows = [
  { digit: '1', letters: ['A', 'I', 'J', 'Y', 'Q'], color: 'pink' },
  { digit: '2', letters: ['B', 'K', 'R'], color: 'blue' },
  { digit: '3', letters: ['C', 'G', 'L', 'S'], color: 'yellow' },
  { digit: '4', letters: ['D', 'M', 'T'], color: 'orange' },
  { digit: '5', letters: ['E', 'H', 'N', 'X'], color: 'green' },
  { digit: '6', letters: ['U', 'V', 'W'], color: 'peach' },
  { digit: '7', letters: ['Z', 'O'], color: 'cream' },
  { digit: '8', letters: ['F', 'P'], color: 'lavender' },
]

const lettersByDigit = new Map(digitLetterRows.map(({ digit, letters }) => [digit, letters]))
const vowels = new Set(['A', 'E', 'I', 'O', 'U'])
const MAX_SEARCH_NODES = 50000
const MAX_PRONOUNCEABLE_NAMES = 30

export function generatePasswordNameSuggestions(digits, englishWords) {
  const allowedLetters = [...digits].map((digit) => lettersByDigit.get(digit) ?? [])
  const matchesNumber = (word) => {
    const letters = [...word.toUpperCase()]
    return letters.length === digits.length && letters.every((letter, index) => (
      carRegLetterValueMap.get(letter) === Number(digits[index])
    ))
  }
  const dictionaryMatches = [...new Set(englishWords)]
    .filter(matchesNumber)
    .sort((first, second) => first.localeCompare(second))
  const dictionaryWordSet = new Set(dictionaryMatches.map((word) => word.toUpperCase()))
  const curatedMatches = [...new Set(meaningfulWords)]
    .filter(matchesNumber)
    .filter((word) => !dictionaryWordSet.has(word.toUpperCase()))
    .sort((first, second) => first.localeCompare(second))
  const excludedWords = new Set([
    ...dictionaryWordSet,
    ...curatedMatches.map((word) => word.toUpperCase()),
  ])
  const pronounceable = []
  let visitedNodes = 0

  function visit(position, letters, vowelCount, consonantRun, longestConsonantRun) {
    if (visitedNodes >= MAX_SEARCH_NODES) return
    visitedNodes += 1

    if (position === allowedLetters.length) {
      if (letters.length < 3 || vowelCount === 0 || vowelCount / letters.length > 0.6
        || consonantRun > 3) return
      const name = letters.join('')
      if (excludedWords.has(name)) return
      const vowelRatio = vowelCount / letters.length
      const score = Math.abs(vowelRatio - 0.35) * 10
        + longestConsonantRun * 0.8
        + letters.reduce((penalty, letter, index) => (
          penalty + (index > 0 && letter === letters[index - 1] ? 1.5 : 0)
        ), 0)
      pronounceable.push({ name, score })
      return
    }

    for (const letter of allowedLetters[position]) {
      const isVowel = vowels.has(letter)
      const nextConsonantRun = isVowel ? 0 : consonantRun + 1
      if (nextConsonantRun > 3) continue
      visit(
        position + 1,
        [...letters, letter],
        vowelCount + (isVowel ? 1 : 0),
        nextConsonantRun,
        Math.max(longestConsonantRun, nextConsonantRun),
      )
      if (visitedNodes >= MAX_SEARCH_NODES) break
    }
  }

  visit(0, [], 0, 0, 0)

  return {
    dictionaryMatches,
    curatedMatches,
    pronounceableNames: pronounceable
      .sort((first, second) => first.score - second.score || first.name.localeCompare(second.name))
      .slice(0, MAX_PRONOUNCEABLE_NAMES)
      .map(({ name }) => `${name[0]}${name.slice(1).toLowerCase()}`),
    letterOptions: [...digits].map((digit, index) => ({
      digit,
      letters: allowedLetters[index],
    })),
    searchLimited: visitedNodes >= MAX_SEARCH_NODES,
  }
}
