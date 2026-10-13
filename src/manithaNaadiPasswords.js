import { carRegLetterValueMap } from './numerologyLetterValues'

const meaningfulWords = [
  'Abigail', 'Adam', 'Alexander', 'Alice', 'Alex', 'Al', 'Amelia', 'Ama',
  'Ami', 'Amy', 'Ana', 'Anna', 'Anthony', 'Apple', 'Autumn', 'Ava', 'Aiya',
  'Ari', 'Aja', 'Aya', 'Baba', 'Bella', 'Ben', 'Benjamin',
  'Berry', 'Bird', 'Blue', 'Brave', 'Bright', 'Calm', 'Candy', 'Cherry',
  'Cloud', 'Clara', 'Coffee', 'Coral', 'Daisy', 'Dan', 'Daniel', 'Dance', 'David',
  'Dream', 'Earth', 'Eleanor', 'Eli', 'Ella', 'Elizabeth', 'Ember', 'Emily',
  'Emma', 'Ethan', 'Eva', 'Family',
  'Felix', 'Field', 'Finn', 'Fire', 'Flower', 'Forest', 'Friend', 'Garden',
  'Frances', 'Gabriella', 'Gentle', 'Glow', 'Gold', 'Grace', 'Green', 'Happy',
  'Hannah', 'Heart', 'Henry', 'Honey', 'Hope', 'Island', 'Ivy', 'Jack', 'Jade',
  'James', 'Jolly', 'Jonathan', 'Joseph', 'Julia', 'Katherine', 'Kind', 'Kitten',
  'Leo', 'Liam', 'Light', 'Lily', 'Lilac', 'Lemon', 'Lucky', 'Lucas', 'Luna',
  'Magic', 'Maple', 'Maya', 'Margaret', 'Matthew', 'Max', 'Meadow', 'Melody',
  'Kai', 'Kay', 'Kia', 'Ira', 'Jai', 'Jay', 'Mae', 'May', 'Mia', 'Mya', 'Mint',
  'Moon', 'Morning', 'Music', 'Nathaniel', 'Nicholas', 'Nina',
  'Noah', 'Nora', 'Ocean',
  'Olive', 'Oliver', 'Orange', 'Owen', 'Panda', 'Paper', 'Peace', 'Peach',
  'Pearl', 'Piano', 'Planet', 'Quiet', 'Rain', 'Rainbow', 'River', 'Rose',
  'Rebecca',   'Raj', 'Rai', 'Ria', 'Ruby', 'Sadie', 'Sam', 'Sebastian', 'Sid', 'Silver', 'Smile', 'Snow',
  'Sophie', 'Spring', 'Star', 'Stella', 'Stone', 'Summer', 'Sun', 'Sunny',
  'Sunrise', 'Sunset', 'Theo', 'Theodore', 'Tiger', 'Tulip', 'Vera', 'Victoria',
  'Val', 'Water', 'William', 'Winter', 'Wonder', 'Zachary', 'Zoe',
]
const passwordsPerLuckyNumber = 10
const maximumPasswordLength = 22
const emailDomain = 'gmail.com'
const passwordSuffixes = {
  MA: '42',
  MJ: '54',
  M: '41',
}
const emailNameParts = {
  MJ: ['Jeyashree', 'Murugan'],
  M: ['Sivganesh', 'Mukundan'],
  MA: ['Murugan', 'Amir'],
}
const emailNameInitials = {
  MJ: ['C', 'S'],
  M: ['M', 'J'],
  MA: ['J', 'A'],
}
const emailNameShortForms = {
  MJ: ['Jey', 'Jeya', 'Jeyash', 'Shree', 'Muru', 'Murug', 'Muruga'],
  M: ['Siv', 'Siva', 'Ganesh', 'Mukund', 'Kundan'],
  MA: [],
}
const maMuruganPrefixes = ['Sri', 'Shri', 'Shree', 'Sree']

function capitalizeWord(word) {
  return `${word[0].toUpperCase()}${word.slice(1)}`
}

function addCandidate(candidates, password, luckyPairs) {
  if (password.length < 2 || password.length > maximumPasswordLength) return

  const firstValue = carRegLetterValueMap.get(password[0].toUpperCase())
  const secondValue = carRegLetterValueMap.get(password[1].toUpperCase())
  if (!luckyPairs.has(`${firstValue}${secondValue}`)) return

  candidates.add(password)
}

function generateNameMatches(initials, luckyNumbers) {
  const suffix = passwordSuffixes[initials]
  if (!suffix) return { matches: [], unmatchedTargets: [] }

  const words = [...new Set(meaningfulWords.map((word) => word.toLowerCase()))].map((word) => ({
    word,
    total: [...word.toUpperCase()].reduce((sum, letter) => sum + carRegLetterValueMap.get(letter), 0),
  }))
  const targets = [...new Set(luckyNumbers.split(/[\s,]+/).filter((value) => /^\d{2}$/.test(value)))]
  const luckyPairs = new Set(targets)
  const suffixValues = [...suffix].map(Number)
  const suffixTotal = suffixValues.reduce((sum, value) => sum + value, 0)
  const passwordLimit = passwordsPerLuckyNumber
  const wordPairsByTotal = new Map()

  for (let firstIndex = 0; firstIndex < words.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < words.length; secondIndex += 1) {
      const first = words[firstIndex]
      const second = words[secondIndex]
      const pairTotal = first.total + second.total
      const wordPairs = wordPairsByTotal.get(pairTotal) ?? []
      wordPairs.push({ firstIndex, secondIndex, totalLength: first.word.length + second.word.length })
      wordPairsByTotal.set(pairTotal, wordPairs)
    }
  }

  const matches = []
  const unmatchedTargets = []
  const shortfallTargets = []

  for (const luckyNumber of targets) {
    const target = Number(luckyNumber)
    const nameTarget = target - suffixTotal
    const candidates = new Set()

    for (const entry of words) {
      if (entry.total === nameTarget) addCandidate(candidates, capitalizeWord(entry.word), luckyPairs)
    }
    for (let firstIndex = 0; firstIndex < words.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < words.length; secondIndex += 1) {
        const first = words[firstIndex]
        const second = words[secondIndex]
        if (first.total + second.total === nameTarget) {
          addCandidate(
            candidates,
            `${capitalizeWord(first.word)}${capitalizeWord(second.word)}`,
            luckyPairs,
          )
        }
      }
    }

    if (candidates.size < passwordLimit) {
      for (let firstIndex = 0; firstIndex < words.length && candidates.size < passwordLimit; firstIndex += 1) {
        const first = words[firstIndex]
        const pairs = wordPairsByTotal.get(nameTarget - first.total) ?? []
        for (const pair of pairs) {
          if (pair.firstIndex <= firstIndex) continue
          const second = words[pair.firstIndex]
          const third = words[pair.secondIndex]
          if (first.word.length + pair.totalLength > maximumPasswordLength) continue
          addCandidate(
            candidates,
            `${capitalizeWord(first.word)}${capitalizeWord(second.word)}${capitalizeWord(third.word)}`,
            luckyPairs,
          )
          if (candidates.size >= passwordLimit) break
        }
      }
    }

    if (candidates.size < passwordLimit) {
      for (const [firstTotal, firstPairs] of wordPairsByTotal) {
        const secondPairs = wordPairsByTotal.get(nameTarget - firstTotal) ?? []
        for (const firstPair of firstPairs) {
          for (const secondPair of secondPairs) {
            if (firstPair.secondIndex >= secondPair.firstIndex) continue
            const first = words[firstPair.firstIndex]
            const second = words[firstPair.secondIndex]
            const third = words[secondPair.firstIndex]
            const fourth = words[secondPair.secondIndex]
            if (firstPair.totalLength + secondPair.totalLength > maximumPasswordLength) continue
            addCandidate(
              candidates,
              `${capitalizeWord(first.word)}${capitalizeWord(second.word)}${capitalizeWord(third.word)}${capitalizeWord(fourth.word)}`,
              luckyPairs,
            )
            if (candidates.size >= passwordLimit) break
          }
          if (candidates.size >= passwordLimit) break
        }
        if (candidates.size >= passwordLimit) break
      }
    }

    if (candidates.size === 0) {
      unmatchedTargets.push(luckyNumber)
      continue
    }

    const selectedCandidates = [...candidates].sort((first, second) => (
      first.length - second.length || first.localeCompare(second)
    )).slice(0, passwordLimit)
    if (selectedCandidates.length < passwordLimit) {
      shortfallTargets.push({ luckyNumber, count: selectedCandidates.length })
    }

    for (const password of selectedCandidates) {
      const letterValues = [...password.toUpperCase()].map((letter) => ({
        letter,
        value: carRegLetterValueMap.get(letter),
      })).concat(suffixValues.map((value, index) => ({
        letter: suffix[index],
        value,
      })))
      const initialPair = `${letterValues[0].value}${letterValues[1].value}`
      const username = `${password}${suffix}`
      matches.push({
        password: username,
        email: `${username}@${emailDomain}`,
        initialPair,
        letterValues,
        total: letterValues.reduce((sum, entry) => sum + entry.value, 0),
      })
    }
  }

  return { matches, unmatchedTargets, shortfallTargets }
}

export function generatePasswords(initials, luckyNumbers) {
  return generateNameMatches(initials, luckyNumbers)
}

export function generateEmails(initials, luckyNumbers, includeGmailInTotal) {
  const suffix = passwordSuffixes[initials]
  const parts = emailNameParts[initials]
  if (!suffix || !parts) return { matches: [], unmatchedTargets: [], shortfallTargets: [] }

  const targets = [...new Set(luckyNumbers.split(/[\s,]+/).filter((value) => /^\d{2}$/.test(value)))]
  const luckyPairs = new Set(targets)
  const suffixValues = [...suffix].map(Number)
  const domainValues = includeGmailInTotal
    ? [...emailDomain.replace('.', '').toUpperCase()].map((letter) => ({
      letter,
      value: carRegLetterValueMap.get(letter),
    }))
    : []
  const sourceLetters = [...new Set(parts.join('').toUpperCase())]
  const initialPair = initials.length === 2
    ? `${carRegLetterValueMap.get(initials[0])}${carRegLetterValueMap.get(initials[1])}`
    : ''
  const prefixes = [...new Set([
    ...(luckyPairs.has(initialPair) ? [initials] : []),
    ...sourceLetters
      .filter((letter) => luckyPairs.has(`${carRegLetterValueMap.get(initials[0])}${carRegLetterValueMap.get(letter)}`))
      .map((letter) => `${initials[0]}${letter}`),
  ])]
  const nameVariants = new Map()

  function addNameVariant(prefix, orderedParts, fullNameCount) {
    const names = [orderedParts]
    if (initials === 'MA') {
      for (let index = 0; index < orderedParts.length; index += 1) {
        if (orderedParts[index] !== 'Murugan') continue
        for (const muruganPrefix of maMuruganPrefixes) {
          names.push([
            ...orderedParts.slice(0, index),
            `${muruganPrefix}Murugan`,
            ...orderedParts.slice(index + 1),
          ])
        }
      }
    }
    for (const nameParts of names) {
      const name = `${prefix}${nameParts.join('')}`
      nameVariants.set(name, Math.max(nameVariants.get(name) ?? 0, fullNameCount))
    }
  }

  function addPartOrders(remaining, orderedParts) {
    if (orderedParts.length > 0) {
      for (const prefix of prefixes) {
        addNameVariant(prefix, orderedParts, orderedParts.length)
      }
    }
    for (let index = 0; index < remaining.length; index += 1) {
      addPartOrders(
        remaining.filter((_, partIndex) => partIndex !== index),
        [...orderedParts, remaining[index]],
      )
    }
  }

  addPartOrders(parts, [])

  if (emailNameInitials[initials]) {
    function addOrders(remaining, orderedParts, fullNameCount) {
      if (orderedParts.length > 0) {
        for (const prefix of prefixes) {
          addNameVariant(prefix, orderedParts, fullNameCount)
        }
      }
      for (let index = 0; index < remaining.length; index += 1) {
        addOrders(
          remaining.filter((_, partIndex) => partIndex !== index),
          [...orderedParts, remaining[index]],
          fullNameCount,
        )
      }
    }

    function addParentInitialOrders(remaining, orderedParts, fullNameCount) {
      addOrders([...orderedParts, ...remaining], [], fullNameCount)
      for (let index = 0; index < remaining.length; index += 1) {
        addParentInitialOrders(
          remaining.filter((_, partIndex) => partIndex !== index),
          orderedParts,
          fullNameCount,
        )
      }
    }

    function addFamilyNameOptions(personIndex, orderedParts, fullNameCount) {
      if (personIndex === parts.length) {
        if (orderedParts.length > 0) {
          addParentInitialOrders(emailNameInitials[initials], orderedParts, fullNameCount)
        }
        return
      }

      const person = parts[personIndex]
      addFamilyNameOptions(personIndex + 1, orderedParts, fullNameCount)
      const nameOptions = [
        person[0],
        person,
        ...emailNameShortForms[initials].filter((shortForm) => (
          person.toLowerCase().includes(shortForm.toLowerCase())
        )),
      ]
      for (const nameOption of nameOptions) {
        addFamilyNameOptions(
          personIndex + 1,
          [...orderedParts, nameOption],
          fullNameCount + (nameOption === person ? 1 : 0),
        )
      }
    }

    addFamilyNameOptions(0, [], 0)
  }

  const matches = []
  const unmatchedTargets = []
  const shortfallTargets = []

  for (const luckyNumber of targets) {
    const target = Number(luckyNumber)
    const candidates = []
    for (const [name, fullNameCount] of nameVariants) {
      if (initials === 'MA' && /velayu/i.test(name)) continue
      if (
        initials === 'MJ' &&
        /mur(u|ug)/i.test(name) &&
        !/Jeyashree/i.test(name)
      ) continue

      const letterValues = [...name.toUpperCase()].map((letter) => ({
        letter,
        value: carRegLetterValueMap.get(letter),
      })).concat(suffixValues.map((value, index) => ({
        letter: suffix[index],
        value,
      })), domainValues)
      const initialPair = `${letterValues[0].value}${letterValues[1].value}`
      const total = letterValues.reduce((sum, entry) => sum + entry.value, 0)
      if (luckyPairs.has(initialPair) && total === target) {
        candidates.push({ name, initialPair, letterValues, total, fullNameCount })
      }
    }

    const selectedCandidates = candidates
      .sort((first, second) => (
        second.fullNameCount - first.fullNameCount ||
        first.name.length - second.name.length ||
        first.name.localeCompare(second.name)
      ))
      .slice(0, passwordsPerLuckyNumber)
    if (selectedCandidates.length === 0) {
      unmatchedTargets.push(luckyNumber)
      continue
    }
    if (selectedCandidates.length < passwordsPerLuckyNumber) {
      shortfallTargets.push({ luckyNumber, count: selectedCandidates.length })
    }

    for (const { name, ...match } of selectedCandidates) {
      const username = `${name}${suffix}`
      matches.push({
        ...match,
        password: username,
        email: `${username}@${emailDomain}`,
      })
    }
  }

  return { matches, unmatchedTargets, shortfallTargets }
}
