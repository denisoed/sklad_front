const WHITE = {
  color: '#FFFFFF',
  name: 'белый'
}
const BLACK = {
  color: '#000000',
  name: 'черный'
}
const DARK_GREEN = {
  color: '#008000',
  name: 'темно-зеленый'
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
const TOMATO = {
  color: '#FF6347',
  name: 'томатный'
}
const CRIMSON = {
  color: '#DC143C',
  name: 'малиновый'
}
const INDIGO = {
  color: '#4B0082',
  name: 'индиго'
}
const DEEP_PINK = {
  color: '#FF1493',
  name: 'темно-розовый'
}
const RED = {
  color: '#FF0000',
  name: 'красный'
}
const GREEN = {
  color: '#00FF00',
  name: 'зеленый'
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
const PINK = {
  color: '#FFC0CB',
  name: 'розовый'
}
const GRAY = {
  color: '#808080',
  name: 'серый'
}
const MAROON = {
  color: '#800000',
  name: 'бордовый'
}
const TEAL = {
  color: '#008080',
  name: 'бирюзовый'
}

export const COLORS = [
  WHITE, BLACK, RED, GREEN,
  BLUE, YELLOW, ORANGE, PURPLE,
  PINK, GRAY, CYAN, MAROON,
  TEAL, SILVER, TOMATO, DEEP_PINK,
  CRIMSON, INDIGO, MAGENTA, DARK_GREEN,
]

// Color mapping utility
const COLOR_MAPPINGS = {
  'зелен': GREEN.color,
  'темно-зелен': DARK_GREEN.color,
  'розов': PINK.color,
  'темно-розов': DEEP_PINK.color,
  'оранжев': ORANGE.color,
  'серы': GRAY.color,
  'сера': GRAY.color,
  'серо': GRAY.color,
  'голуб': CYAN.color,
  'пурпурн': MAGENTA.color,
  'бордов': MAROON.color,
  'бирюзов': TEAL.color,
  'серебрист': SILVER.color,
  'томатн': TOMATO.color,
  'малинов': CRIMSON.color,
  'индиго': INDIGO.color,
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

const useColorMatcher = () => {
  // Function to find colors in text and return matched colors
  const findColorsInText = (text) => {
    if (!text) return []
    
    // Replace "ё" with "е" in the input text
    const normalizedText = text.toLowerCase().replace(/ё/g, 'е')
    const words = normalizedText.split(/\s+/)
    const foundColors = []

    words.forEach(word => {      
      // Sort color names by length (longest first) to prioritize more specific matches
      const sortedColorEntries = Object.entries(COLOR_MAPPINGS)
        .sort(([a], [b]) => b.length - a.length)
      
      // Check if the word contains any color name from COLOR_MAPPINGS
      for (const [colorName, colorHex] of sortedColorEntries) {
        if (word.includes(colorName) || colorName.includes(word)) {
          foundColors.push({
            hex: colorHex
          })
          break
        }
      }
    })
    
    return foundColors
  }

  // Function to get all available colors
  const getAvailableColors = () => {
    return Object.values(COLOR_MAPPINGS).filter((value, index, self) => self.indexOf(value) === index)
  }

  return {
    findColorsInText,
    getAvailableColors,
    COLOR_MAPPINGS
  }
}

export default useColorMatcher 