const WHITE = {
  color: '#FFFFFF',
  nameKey: 'colors.names.white'
}
const BLACK = {
  color: '#000000',
  nameKey: 'colors.names.black'
}
const GREEN = {
  color: '#008000',
  nameKey: 'colors.names.green'
}
const BLUE = {
  color: '#0000FF',
  nameKey: 'colors.names.blue'
}
const YELLOW = {
  color: '#FFFF00',
  nameKey: 'colors.names.yellow'
}
const SILVER = {
  color: '#C0C0C0',
  nameKey: 'colors.names.silver'
}
const BROWN = {
  color: '#800000',
  nameKey: 'colors.names.brown'
}
const PINK = {
  color: '#FF1493',
  nameKey: 'colors.names.pink'
}
const RED = {
  color: '#FF0000',
  nameKey: 'colors.names.red'
}
const MAGENTA = {
  color: '#FF00FF',
  nameKey: 'colors.names.magenta'
}
const CYAN = {
  color: '#00FFFF',
  nameKey: 'colors.names.cyan'
}
const ORANGE = {
  color: '#FFA500',
  nameKey: 'colors.names.orange'
}
const PURPLE = {
  color: '#800080',
  nameKey: 'colors.names.purple'
}
const GRAY = {
  color: '#808080',
  nameKey: 'colors.names.gray'
}
const TEAL = {
  color: '#008080',
  nameKey: 'colors.names.teal'
}
export const COLORS = [
  WHITE, BLACK, RED,
  BLUE, YELLOW, ORANGE, PURPLE,
  GRAY, CYAN,
  TEAL, SILVER, BROWN, PINK,
  MAGENTA, GREEN,
]

// Color mapping utility
const COLOR_MAPPINGS = {
  'зелен': GREEN.color,
  'розов': PINK.color,
  'оранжев': ORANGE.color,
  'серы': GRAY.color,
  'сера': GRAY.color,
  'серо': GRAY.color,
  'голуб': CYAN.color,
  'пурпурн': MAGENTA.color,
  'бирюзов': TEAL.color,
  'серебрист': SILVER.color,
  'коричн': BROWN.color,
  'бордов': BROWN.color,
  'красн': RED.color,
  'синя': BLUE.color,
  'сини': BLUE.color,
  'сине': BLUE.color,
  'желт': YELLOW.color,
  'фиолетов': PURPLE.color,
  'черн': BLACK.color,
  'бела': WHITE.color,
  'белы': WHITE.color,
}

const useColors = () => {
  // Function to get all available colors
  const getAvailableColors = () => {
    return Object.values(COLOR_MAPPINGS).filter((value, index, self) => self.indexOf(value) === index)
  }

  const replaceTextToHex = (text) => {
    if (!text) return text
    
    // Create a copy of text to modify
    let resultText = text.toLowerCase().replace(/ё/gi, 'е')
    
    // Split text into words
    const words = resultText.split(/\s+/)
    
    // Process each word
    const processedWords = words.map(word => {
      // Sort color names by length (longest first) to prioritize more specific matches
      const sortedColorEntries = Object.entries(COLOR_MAPPINGS)
        .sort(([a], [b]) => b.length - a.length)
      
      // Check if the word contains any color name from COLOR_MAPPINGS
      for (const [colorName, colorHex] of sortedColorEntries) {
        if (word.includes(colorName) || colorName.includes(word)) {
          return colorHex
        }
      }
      return word
    })
    
    return processedWords.join(' ')
  }

  const findColorByHex = (hex) => {
    return COLORS.find(color => color.color === hex)
  }

  return {
    getAvailableColors,
    COLOR_MAPPINGS,
    replaceTextToHex,
    findColorByHex
  }
}

export default useColors 