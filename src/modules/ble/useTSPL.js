import CodepageEncoder from 'codepage-encoder';

// Documentation for TSPL language
// https://fs.tscprinters.com/system/files/31-0000001-00_tspl_tspl2_programming_b.pdf

const DOTS_IN_MM = 8;
// In TSPL (TSC Printer Language), the value 25.4 represents the conversion factor for converting inches to millimeters.
const CONVERSION_FACTOR_INCHE = 25.4;
// In TSPL (TSC Printer Language), the value 4.5 typically represents the conversion factor for converting millimeters to dots.
const CONVERSION_FACTOR_MM = 4.5;

const useTSPL = ({ dpi = 203, width = 0, height = 0, offset = 0 }) => {
  const commands = [];

  function convertDotsToMM(dots) {
    return Math.ceil(dots / (dpi / CONVERSION_FACTOR_INCHE))
  }

  function convertMMToDots(mm) {
    return Math.ceil(mm * (dpi / CONVERSION_FACTOR_INCHE))
  }

  function getLabelCenter(size) {
    const inches = (size - offset) / CONVERSION_FACTOR_INCHE;
    const dots = inches * dpi;
    return Math.ceil(dots / 2);
  }

  function calculateTextXCenter(width) {
    const inches = (width - offset) / CONVERSION_FACTOR_INCHE;
    const dots = inches * dpi;
    return Math.ceil(dots / 2);
  }

  function getQrCodeWidthInDots(size) {
    const cellWidth = 4;
    const mm = Math.ceil(size * cellWidth);
    const dots = convertMMToDots(mm);
    return dots;
  }

  function addCommand(command) {
    commands.push(command);
  }

  function addTextField({
    data,
    positionX = 0,
    positionY = 0,
    font = 3,
    xScale = 1,
    yScale = 1,
    align = 1
  }) {
    const posX = align === 2 ? calculateTextXCenter(width) : positionX;
    const command = `TEXT ${posX},${positionY},"${font}",0,${xScale},${yScale},${align},"${data}"`;
    addCommand(command);
  }

  function addBarcode({
    data,
    positionX = 0,
    positionY = 0,
    barcodeType = '128',
    height = 50
  }) {
    const command = `BARCODE ${positionX},${positionY},"${barcodeType}",${height},1,0,2,2,"${data}"`;
    addCommand(command);
  }

  function addQrCode({
    data,
    positionX = 0,
    positionY = 0,
    size = 4,
    align = 1
  }) {
    let command = null;
    if (align === 2) {
      const posX = getLabelCenter(width) - (getQrCodeWidthInDots(size) / 2);
      command = `QRCODE ${posX},${positionY},H,${size},A,0,"${data}"`;
    } else {
      command = `QRCODE ${positionX},${positionY},H,${size},A,0,"${data}"`;
    }
    addCommand(command);
  }

  function addPrintQuantity(quantity = 1) {
    const command = `PRINT ${quantity}`;
    addCommand(command);
  }

  function clearCommands() {
    commands.length = [];
  }
  
  function buildTsplMarkup() {
    try {
      const cmds = [
        `SIZE ${width} mm,${height} mm`,
        'DIRECTION 0',
        'CLS',
        ...commands,
        'END',
      ];
      const tsplMarkup = cmds.join('\r\n');
      const result = CodepageEncoder.encode(tsplMarkup, 'cp866');
      return result.buffer
    } finally {
      clearCommands();
    }
  }

  return {
    addTextField,
    addBarcode,
    addQrCode,
    addPrintQuantity,
    buildTsplMarkup
  }
}

export default useTSPL;

// https://hackernoon.com/how-to-print-labels-with-tspl-and-javascript

// // ----- Example usage ----- //
// addTextField('Welcome',5, 5);
// addBarcode('https://www.google.com', 10, 60);
// addPrintQuantity(1);

// const tsplMarkup = buildTsplMarkup();
