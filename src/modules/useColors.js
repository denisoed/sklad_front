const WHITE = {
  color: '#FFFFFF',
  name: 'белый'
}
const BLACK = {
  color: '#000000',
  name: 'черный'
}
const GREEN = {
  color: '#008000',
  name: 'зеленый'
}
const BLUE = {
  color: '#0000FF',
  name: 'синий'
}
const YELLOW = {
  color: '#FFFF00',
  name: 'желтый'
}
const SILVER = {
  color: '#C0C0C0',
  name: 'серебристый'
}
const BROWN = {
  color: '#800000',
  name: 'коричневый'
}
const PINK = {
  color: '#FF1493',
  name: 'розовый'
}
const RED = {
  color: '#FF0000',
  name: 'красный'
}
const MAGENTA = {
  color: '#FF00FF',
  name: 'пурпурный'
}
const CYAN = {
  color: '#00FFFF',
  name: 'голубой'
}
const ORANGE = {
  color: '#FFA500',
  name: 'оранжевый'
}
const PURPLE = {
  color: '#800080',
  name: 'фиолетовый'
}
const GRAY = {
  color: '#808080',
  name: 'серый'
}
const TEAL = {
  color: '#008080',
  name: 'бирюзовый'
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