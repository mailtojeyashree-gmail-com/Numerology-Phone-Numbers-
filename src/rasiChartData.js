export const rasiChartStartingSigns = {
  MA: 'மேஷம்',
  M: 'கன்னி',
  MJ: 'மகரம்',
  SM: 'ரிஷபம்',
}

export const rasiChartClockwiseOrder = ['மீனம்', 'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்']

export const rasiChartSigns = [
  { name: 'மீனம்', row: 1, column: 1, values: ['80', '89', '77', '95'] },
  { name: 'மேஷம்', row: 1, column: 2, values: ['16', '06', '33'] },
  { name: 'ரிஷபம்', row: 1, column: 3, values: ['02', '20', '29', '10'] },
  { name: 'மிதுனம்', row: 1, column: 4, values: ['22', '04', '12'] },
  { name: 'கும்பம்', row: 2, column: 1, values: ['99', '85', '93'] },
  { name: 'கடகம்', row: 2, column: 4, values: ['08', '26', '32', '14'] },
  { name: 'மகரம்', row: 3, column: 1, values: ['92', '74', '90', '100'] },
  { name: 'சிம்மம்', row: 3, column: 4, values: ['52', '42', '51', '37'] },
  { name: 'தனுசு', row: 4, column: 1, values: ['88', '79', '97', '87', '73'] },
  { name: 'விருச்சிகம்', row: 4, column: 2, values: ['66', '41', '68'] },
  { name: 'துலாம்', row: 4, column: 3, values: ['72', '84'] },
  { name: 'கன்னி', row: 4, column: 4, values: ['64', '56', '54', '45'] },
]

export function getRasiBhavam(pairValues, initials) {
  const chartStartIndex = rasiChartClockwiseOrder.indexOf(rasiChartStartingSigns[initials])
  const bhavamByPair = new Map()

  for (const [index, sign] of rasiChartClockwiseOrder.entries()) {
    const bhavam = (index - chartStartIndex + rasiChartClockwiseOrder.length)
      % rasiChartClockwiseOrder.length + 1
    const chartSign = rasiChartSigns.find((entry) => entry.name === sign)

    for (const pair of chartSign.values) {
      const bhavams = bhavamByPair.get(pair) ?? []
      bhavams.push(bhavam)
      bhavamByPair.set(pair, bhavams)
    }
  }

  return pairValues.split(',').map((value) => (
    bhavamByPair.get(value.padStart(2, '0'))?.join('/') ?? '—'
  )).join(', ')
}
