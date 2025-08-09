<template>
  <q-page>
    <div class="container">
      <PageTitle title="Редактирование ценника" />
      <div
        id="editor"
        class="draggable-parent price-label_editor full-width flex flex-center"
        :class="{ 'price-label_editor--lock': locked }"
      >
        <q-icon v-if="locked" name="mdi-lock-outline" color="grey" class="absolute-center" />
        <canvas
          ref="canvas"
          @mousedown="selectElement"
          @mousemove="dragElement"
          @mouseup="stopDragging"
          @touchstart="selectTouchElement"
          @touchmove="touchElement"
          @touchend="stopDragging"
          @click="clickCanvas"
        >
          Your browser does not support the canvas element.
        </canvas>
      </div>
      <div class="flex items-center full-width no-wrap q-mt-md">
        <PriceLabelControls :locked="locked" @move="moveElement" />
        <q-btn round push size="md" class="q-ml-auto" @click="lockHandler">
          <q-icon :name="locked ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline'" color="deep-orange" />
        </q-btn>
      </div>
      <div class="price-label_elements flex column full-width bg-white q-mt-md q-pa-md">
        <div class="flex items-center q-gap-md justify-between q-mb-sm">
          <span class="text-subtitle2">Слои</span>
          <q-btn push color="primary" round icon="mdi-plus">
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 100px">
                <q-item clickable v-close-popup @click="addText">
                  <q-item-section>Добавить текст</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
        <q-separator />
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="type"
          separator="cell"
          class="full-width table block-bg border-radius-sm"
          hide-pagination
          no-data-label="Список пуст"
        >
          <template #body="props">
            <q-tr :props="props">
              <q-td class="text-left">
                {{ props.row.type }}
              </q-td>
              <q-td class="text-left">
                {{ props.row.text }}
              </q-td>
              <q-td class="text-right">
                <div class="flex justify-end">
                  <BasicDialog width="400px" title="Редактировать элемент">
                    <q-btn
                      icon="mdi-pencil"
                      round
                      size="sm"
                      color="primary"
                      class="q-mr-md"
                    />
                    <template #content>
                      <div class="flex column items-center">
                        <strong>Selected Element</strong>
                        <div v-if="ctx.selectedElement.type === 'text'">
                          <label>Text:</label>
                          <input type="text" v-model="ctx.selectedElement.text" />
                        </div>
                        <div v-if="ctx.selectedElement.type === 'barcode'">
                          <label>Barcode:</label>
                          <input type="text" v-model="ctx.selectedElement.barcode" />
                        </div>
                        <label>X:</label>
                        <input type="number" v-model="ctx.selectedElement.x" />
                        <label>Y:</label>
                        <input type="number" v-model="ctx.selectedElement.y" />
                        <label>Width:</label>
                        <input type="number" v-model="ctx.selectedElement.width" />
                        <label>Height:</label>
                        <input type="number" v-model="ctx.selectedElement.height" />
                        <label>Font Size:</label>
                        <input type="number" v-model="ctx.selectedElement.fontSize" />
  
                        <div class="flex items-center q-gap-md">
                          <q-btn push color="white" round @click="resizeElement('decrease')">
                            <q-icon name="mdi-minus" color="primary" />
                          </q-btn>
                          <q-btn push color="white" round @click="resizeElement('increase')">
                            <q-icon name="mdi-plus" color="primary" />
                          </q-btn>
                        </div>
                      </div>
                    </template>
                  </BasicDialog>
                  <q-btn
                    icon="mdi-trash-can-outline"
                    round
                    size="sm"
                    color="deep-orange"
                    @click="removeElement"
                  />
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
      <div class="flex full-width q-pt-lg q-mt-auto">
        <q-btn
          :label="$t('common.delete')"
          color="deep-orange"
          outline
          class="q-mr-auto"
        />
        <q-btn
          :label="$t('common.save')"
          push
          color="primary"
          class="q-ml-auto"
          tabindex="8"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, reactive, onMounted, defineComponent, computed } from 'vue';
import PageTitle from 'src/components/PageTitle.vue';
import PriceLabelControls from 'src/components/PriceLabels/PriceLabelControls.vue';
import BasicDialog from 'src/components/Dialogs/BasicDialog.vue';
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'PriceLabelEditor',
  components: {
    BasicDialog,
    PageTitle,
    PriceLabelControls,
  },
  setup() {
    const locked = ref(true)
    const canvas = ref(null);
    const ctx = reactive({
      canvas: null,
      width: 0,
      height: 0,
      elements: [],
      selectedElement: null,
      isDragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0
    });

    const { t: $t } = useI18n()

    const addText = () => {
      const textElement = {
        type: 'text',
        text: 'Sample Text',
        x: 50,
        y: 50,
        width: 100,
        height: 18,
        fontSize: 18
      };
      ctx.elements.push(textElement);
      ctx.selectedElement = textElement;
      drawElements();
    };

    const addBarcode = () => {
      const barcodeElement = {
        type: 'barcode',
        barcode: '123456789',
        x: 50,
        y: 50,
        width: 200,
        height: 50,
      };
      ctx.elements.push(barcodeElement);
      ctx.selectedElement = barcodeElement;
      drawElements();
    };

    const printLabel = () => {
      const labelData = generateZPLCode(ctx.elements);
      console.log(labelData);
      // Send the label data to a ZPL-compatible printer for printing
    };

    const selectElement = (event) => {
      const rect = canvas.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      for (const element of ctx.elements) {
        if (
          x >= element.x &&
          x <= element.x + element.width &&
          y >= element.y &&
          y <= element.y + element.height
        ) {
          ctx.selectedElement = element;
          ctx.isDragging = true;
          ctx.dragOffsetX = x - element.x;
          ctx.dragOffsetY = y - element.y;
          break;
        }
      }
    };

    const selectTouchElement = (event) => {
      const rect = canvas.value.getBoundingClientRect();
      const x = event.touches[0].clientX - rect.left;
      const y = event.touches[0].clientY - rect.top;

      for (const element of ctx.elements) {
        if (
          x >= element.x &&
          x <= element.x + element.width &&
          y >= element.y &&
          y <= element.y + element.height
        ) {
          ctx.selectedElement = element;
          ctx.isDragging = true;
          ctx.dragOffsetX = x - element.x;
          ctx.dragOffsetY = y - element.y;
          break;
        }
      }
    };


    const resizeElement = (action) => {
      const step = 10; // Шаг изменения размера
      const maxCanvasWidth = ctx.width;
      const maxCanvasHeight = ctx.height;
      const ratio = ctx.selectedElement.width / ctx.selectedElement.height;

      if (action === 'increase') {
        const newWidth = ctx.selectedElement.width + step;
        const newHeight = newWidth / ratio;
        const scaleFactor = newWidth / ctx.selectedElement.width;

        if (
          newWidth <= maxCanvasWidth &&
          newHeight <= maxCanvasHeight
        ) {
          ctx.selectedElement.width = newWidth;
          ctx.selectedElement.height = newHeight;
          ctx.selectedElement.fontSize *= scaleFactor;
        }
      } else if (action === 'decrease') {
        const newWidth = ctx.selectedElement.width - step;
        const newHeight = newWidth / ratio;
        const scaleFactor = newWidth / ctx.selectedElement.width;

        if (
          newWidth >= 0 &&
          newHeight >= 0
        ) {
          ctx.selectedElement.width = newWidth;
          ctx.selectedElement.height = newHeight;
          ctx.selectedElement.fontSize *= scaleFactor;
        }
      }

      drawElements();
    };

    const moveElement = (direction) => {
      const step = 10; // Шаг перемещения элемента

      const minX = 0;
      const minY = 0;
      const maxX = ctx.width - ctx.selectedElement.width;
      const maxY = ctx.height - ctx.selectedElement.height;

      switch (direction) {
        case 'left':
          ctx.selectedElement.x = Math.max(minX, ctx.selectedElement.x - step);
          break;
        case 'up':
          ctx.selectedElement.y = Math.max(minY, ctx.selectedElement.y - step);
          break;
        case 'down':
          ctx.selectedElement.y = Math.min(maxY, ctx.selectedElement.y + step);
          break;
        case 'right':
          ctx.selectedElement.x = Math.min(maxX, ctx.selectedElement.x + step);
          break;
      }

      drawElements();
    };

    function clickCanvas(event) {
      const { offsetX, offsetY } = event;
      ctx.elements.forEach(element => {
        if (
          offsetX >= element.x &&
          offsetX <= element.x + element.width &&
          offsetY >= element.y &&
          offsetY <= element.y + element.height
        ) {
          ctx.selectedElement = element;
        }
      });
      drawElements();
    }

    const removeElement = () => {
      if (ctx.selectedElement) {
        const index = ctx.elements.indexOf(ctx.selectedElement);
        if (index > -1) {
          ctx.elements.splice(index, 1);
          ctx.selectedElement = null;
          drawElements();
        }
      }
    };

    const dragElement = (event) => {
      if (ctx.isDragging) {
        const rect = canvas.value.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Ограничить перемещение элементов внутри границ канваса
        const minX = 0;
        const minY = 0;
        const maxX = ctx.width - ctx.selectedElement.width;
        const maxY = ctx.height - ctx.selectedElement.height;

        // Вычислить новые координаты элемента с учетом ограничений
        let newX = x - ctx.dragOffsetX;
        let newY = y - ctx.dragOffsetY;

        // Определение шагов для перемещения элементов
        const stepX = 10; // Шаг по оси X
        const stepY = 10; // Шаг по оси Y

        // Применение шагов
        newX = Math.round(newX / stepX) * stepX;
        newY = Math.round(newY / stepY) * stepY;

        // Проверить, не выходят ли новые координаты за границы канваса
        newX = Math.max(minX, Math.min(newX, maxX));
        newY = Math.max(minY, Math.min(newY, maxY));

        // Применить новые координаты элемента
        ctx.selectedElement.x = newX;
        ctx.selectedElement.y = newY;

        drawElements();
      }
    };

    const touchElement = (event) => {
      if (ctx.isDragging) {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = canvas.value.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Ограничить перемещение элементов внутри границ канваса
        const minX = 0;
        const minY = 0;
        const maxX = ctx.width - ctx.selectedElement.width;
        const maxY = ctx.height - ctx.selectedElement.height;

        // Вычислить новые координаты элемента с учетом ограничений
        let newX = x - ctx.dragOffsetX;
        let newY = y - ctx.dragOffsetY;

        // Определение шагов для перемещения элементов
        const stepX = 10; // Шаг по оси X
        const stepY = 10; // Шаг по оси Y

        // Применение шагов
        newX = Math.round(newX / stepX) * stepX;
        newY = Math.round(newY / stepY) * stepY;

        // Проверить, не выходят ли новые координаты за границы канваса
        newX = Math.max(minX, Math.min(newX, maxX));
        newY = Math.max(minY, Math.min(newY, maxY));

        // Применить новые координаты элемента
        ctx.selectedElement.x = newX;
        ctx.selectedElement.y = newY;

        drawElements();
      }
    };

    const stopDragging = () => {
      ctx.isDragging = false;
    };

    const drawGrid = () => {
      const gridSize = 10; // Размер сетки (количество пикселей между линиями)
      const gridColor = '#e0e0e0'; // Цвет сетки
      const { canvas } = ctx;
      const context = canvas.getContext('2d');

      // Отрисовка вертикальных линий сетки
      for (let x = 0; x <= ctx.width; x += gridSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, ctx.height);
        context.strokeStyle = gridColor;
        context.stroke();
      }

      // Отрисовка горизонтальных линий сетки
      for (let y = 0; y <= ctx.height; y += gridSize) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(ctx.width, y);
        context.strokeStyle = gridColor;
        context.stroke();
      }
    };

    const drawElements = () => {
      const { canvas } = ctx;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);

      // drawGrid();

      for (const element of ctx.elements) {
        context.beginPath();
        context.rect(element.x, element.y, element.width, element.height);

        if (element === ctx.selectedElement) {
          context.strokeStyle = 'red'; // Цвет подсветки для выбранного элемента
          context.lineWidth = 2; // Толщина линии подсветки
        } else {
          context.strokeStyle = 'black';
          context.lineWidth = 1;
        }

        context.stroke();

        if (element.type === 'text') {
          context.font = `${element.fontSize}px Arial`;
          context.fillText(element.text, element.x, element.y);
        } else if (element.type === 'barcode') {
          context.fillText(`[Barcode: ${element.barcode}]`, element.x, element.y);
        }
      }
    };


    const generateZPLCode = (elements) => {
      let zplCode = '^XA\n^LL200\n';

      for (const element of elements) {
        if (element.type === 'text') {
          zplCode += `^FO${element.x},${element.y}^A0N,18,18^FD${element.text}^FS\n`;
        } else if (element.type === 'barcode') {
          zplCode += `^FO${element.x},${element.y}^BY2^BCN,100,N,N^FD${element.barcode}^FS\n`;
        }
      }

      zplCode += '^XZ\n';
      return zplCode;
    };

    function getCanvasSize() {
      const dpi = 203; // DPI (dots per inch)
      const widthInMM = 58; // Ширина канваса в миллиметрах
      const heightInMM = 40; // Высота канваса в миллиметрах
      const widthInPixels = Math.round((widthInMM / 25.4) * dpi);
      const heightInPixels = Math.round((heightInMM / 25.4) * dpi);
      return {
        width: widthInPixels / 2,
        height: heightInPixels / 2
      }
    }

    const initializeCanvas = () => {
      const canvasSize = getCanvasSize()
      
      const canvasElement = canvas.value;
      const context = canvasElement.getContext('2d');
      ctx.canvas = canvasElement;
      ctx.canvas.width = canvasSize.width;
      ctx.canvas.height = canvasSize.height;
      ctx.width = canvasSize.width;
      ctx.height = canvasSize.height;
      context.textBaseline = 'top';

      drawElements();
    };

    function lockHandler() {
      if (locked.value) {
        locked.value = false;
      } else {
        locked.value = true;
      }
    }

    function lock() {
      locked.value = true;
    }

    const columns = computed(() => {
      return [
        {
          name: 'type',
          label: 'Тип',
          align: 'left',
          field: 'type'
        },
        {
          name: 'text',
          label: 'Текст',
          align: 'left',
          field: 'text'
        },
        {
          name: 'action',
          label: 'Действия',
          align: 'right',
          field: 'action'
        },
      ]
    })

    const rows = computed(() => {
      return ctx.elements.map(e => ({
        type: e.type,
        text: e.text,
      }));
    })

    onMounted(() => {
      initializeCanvas();
    });

    return {
      canvas,
      ctx,
      addText,
      addBarcode,
      printLabel,
      selectElement,
      dragElement,
      stopDragging,
      moveElement,
      resizeElement,
      clickCanvas,
      removeElement,
      touchElement,
      selectTouchElement,
      columns,
      rows,
      locked,
      lockHandler,
      lock,
    };
  }
});
</script>

<style lang="scss" scoped>
.price-label_editor {
  position: relative;

  canvas {
    border-radius: 10px;
    box-shadow: var(--box-shadow);
    background: #fff;
  }

  >* {
    cursor: grab;
  }

  &:active {
    user-select: none;
    cursor: grabbing;
  }

  &--lock {
    user-select: none;
    pointer-events: none;
    opacity: 0.3;

    i {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 50px;
      z-index: 1;
    }
  }
}
:deep(.table) {
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    background-color: #e8e8e8;
  }

  .q-table__top,
  thead tr:first-child th {
    font-weight: bold;
  }
}

.price-label_elements {
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
}

.slide-down-enter-active {
  transition: all .3s ease;
}

.slide-down-leave-active {
  transition: all .5s ease;
}

.slide-down-enter,
.slide-down-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.slide-down-enter-from {
  transform: translateY(20px);
  opacity: 0;
}
</style>