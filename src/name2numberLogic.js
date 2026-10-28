import { carRegLetterValueMap } from './numerologyLetterValues.js'

export const defaultRajanilaiNumbers = '2, 4, 6, 8, 10, 12, 14, 16, 20, 22, 26, 32, 33, 39, 41, 42, 45, 51, 52, 54, 56, 64, 66, 68, 72, 73, 74, 77, 79, 80, 84, 85, 87, 88, 89, 92, 93, 95, 97, 99'

export function parseRajanilaiNumbers(value) {
  return new Set(
    value
      .split(/[,\s]+/)
      .filter((number) => /^\d+$/.test(number))
      .map((number) => number.replace(/^0+(?=\d)/, '')),
  )
}

export function getNameResult(name, rajanilaiSet) {
  const characterValues = [...name.toUpperCase()].flatMap((character) => {
    if (carRegLetterValueMap.has(character)) {
      return [{ character, value: carRegLetterValueMap.get(character) }]
    }
    if (/^\d$/.test(character)) {
      return [{ character, value: Number(character) }]
    }
    return []
  })
  const total = characterValues.reduce((sum, entry) => sum + entry.value, 0)
  const pairIndexes = characterValues.length === 3
    ? [[0, 1], [1, 2]]
    : characterValues.length % 2 === 0
      ? Array.from({ length: characterValues.length / 2 }, (_, index) => [index * 2, index * 2 + 1])
      : characterValues.length >= 5
        ? [
          ...Array.from({ length: Math.floor(characterValues.length / 2) }, (_, index) => [index * 2, index * 2 + 1]),
          [characterValues.length - 2, characterValues.length - 1],
        ]
        : []
  const rajanilaiPairs = pairIndexes.map(([firstIndex, secondIndex]) => {
    const number = characterValues[firstIndex].value * 10 + characterValues[secondIndex].value
    return { number, matches: rajanilaiSet.has(String(number)) }
  })

  return {
    name,
    characterValues,
    total,
    st: characterValues.length > 1
      ? `${characterValues[0].value}${characterValues[1].value}`
      : characterValues[0]?.value ?? '',
    name2number: Array.from(
      { length: Math.ceil(characterValues.length / 2) },
      (_, index) => characterValues.slice(index * 2, index * 2 + 2)
        .map(({ value }) => value)
        .join(''),
    ).join(','),
    sum: characterValues.map(({ value }) => value).join('+'),
    rajanilaiPairs,
    rajanilaiMatch: rajanilaiSet.has(String(total)),
  }
}
