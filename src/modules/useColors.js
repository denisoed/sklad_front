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

const useColors = () => {
  const findColorByHex = (hex) => {
    return COLORS.find(color => color.color === hex)
  }

  return {
    findColorByHex
  }
}

export default useColors 