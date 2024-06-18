import { ref } from 'vue'

// DOC
https://www.zebra.com/content/dam/zebra_new_ia/en-us/manuals/printers/common/programming/zpl-zbi2-pm-en.pdf

// We use ZPL language for create commands
// https://supportcommunity.zebra.com/s/article/ZPL-Command-Information-and-DetailsV2?language=en_US

const useZPL = () => {
  const commands = ref([]);

  function addCommand(command) {
    commands.value.push(command);
  }

  function addTextCommand(data, positionX, positionY, font = 'D', fontSize = 30) {
    const command = `^FO${positionX},${positionY}^A${font},${fontSize},${fontSize}^FD${data}^FS^XZ`;
    addCommand(command);
  }

  function addBarcodeCommand(data, positionX, positionY, barcodeType = 'CODE128', height = 100, printInterpretationLine = false) {
    const interpretationLineCommand = printInterpretationLine ? '^CI0' : '^CI9';
    const command = `^FO${positionX},${positionY}^BCN,${height},${barcodeType}^FD${data}^FS${interpretationLineCommand}`;
    addCommand(command);
  }

  function addPrintCommand(quantity = 1) {
    const command = `^PQ${quantity},0,1,Y`;
    addCommand(command);
  }

  function addGraphicBoxCommand(positionX, positionY, width, height, borderThickness = 1, borderColor = 'B') {
    const command = `^FO${positionX},${positionY}^GB${width},${height},${borderThickness},${borderColor}^FS`;
    addCommand(command);
  }

  function buildCommands() {
    return commands.value.join('\n');
  }

  function clearCommands() {
    commands.value = [];
  }

  return {
    addTextCommand,
    addBarcodeCommand,
    addPrintCommand,
    addGraphicBoxCommand,
    buildCommands,
    clearCommands
  }
}

export default useZPL;

// -------- Example ---------- //
// import useZPL from 'useZPL'
// const {
//   addTextCommand,
//   addBarcodeCommand,
//   addGraphicBoxCommand,
//   addPrintCommand,
//   buildCommands,
// } = useZPL();

// // Add text field
// const textFieldData = 'Hello, World!';
// const textFieldX = 50;
// const textFieldY = 50;
// addTextCommand(textFieldData, textFieldX, textFieldY);

// // Add barcode
// const barcodeData = '123456789';
// const barcodeX = 100;
// const barcodeY = 150;
// addBarcodeCommand(barcodeData, barcodeX, barcodeY);

// // Add graphic box
// const boxX = 50;
// const boxY = 250;
// const boxWidth = 200;
// const boxHeight = 100;
// addGraphicBoxCommand(boxX, boxY, boxWidth, boxHeight);

// // Add print command
// const printQuantity = 1;
// addPrintCommand(printQuantity);

// // Generate ZPL markup
// const zplMarkup = buildCommands();
// console.log(zplMarkup);