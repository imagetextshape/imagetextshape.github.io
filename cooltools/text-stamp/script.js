document.addEventListener(
  'DOMContentLoaded',
  async () => {

    //
    // ELEMENTS
    //

    const canvas =
      document.getElementById('canvas');

    const ctx =
      canvas.getContext('2d');

    const paragraphLeftInput =
      document.getElementById('paragraphLeftInput');

    const highlightParagraphLeftCheckbox =
      document.getElementById('invert-paragraph-left-checkbox');

    const invLeftParagraphLeftCheckbox =
      document.getElementById('trans-bg-left-paragraph-left-checkbox');

    const textLeftColorPicker =
      document.getElementById('text-left-color-picker');

    //
    // SAFETY
    //

    if (!canvas || !paragraphLeftInput) {
      console.error('Required DOM elements missing');
      return;
    }

    //
    // CANVAS
    //

    canvas.width = 800;
    canvas.height = 1080;

    //
    // FONT
    //

    const FONT_FAMILY = "Nineteen Forty Two";
    const FONT_SIZE = 22;
    const getLineHeight = () =>
      state.bwMode || state.yellowMode
        ? FONT_SIZE + 20
        : FONT_SIZE + 6;

    const CHAR_SPACING = -1.1;
    const BLUR = "blur(0.5px)";

    const BW = {
      xPad: 8,
      yPad: 4,
      widthPad: 7,
      heightPad: 12
    };

    const YELLOW = {
      padX: 10,
      padY: 6
    };

    //
    // STATE
    //

    const state = {
      text: '',
      textColor: '#1d1d1d',
      bwMode: true,
      yellowMode: false
    };


    highlightParagraphLeftCheckbox.checked = false;
    invLeftParagraphLeftCheckbox.checked = true;

    //
    // FONT LOADING
    //

    async function loadFonts() {
      await document.fonts.load(`${FONT_SIZE}px ${FONT_FAMILY}`);
      await document.fonts.ready;
    }

    //
    // HELPERS
    //

    function setBlur(on) {
      ctx.filter = on ? BLUR : "none";
    }

    function measureSpacedWidth(line) {
      let total = 0;

      for (let i = 0; i < line.length; i++) {
        total += ctx.measureText(line[i]).width + CHAR_SPACING;
      }

      return total;
    }

    function drawSpacedText(line, x, y) {
      let cursorX = x;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        ctx.fillText(char, cursorX, y);
        cursorX += ctx.measureText(char).width + CHAR_SPACING;
      }
    }

    function drawBackground(x, y, width, padX, padY, color) {
      ctx.fillStyle = color;

      ctx.fillRect(
        x - padX,
        y - padY,
        width + padX * 2,
        FONT_SIZE + padY * 2
      );
    }

    //
    // MODE RENDERERS
    //

    function renderBW(line, y, width) {

      ctx.fillStyle = 'black';

      ctx.fillRect(
        0 - BW.xPad,
        y - BW.yPad,
        width + BW.widthPad,
        FONT_SIZE + BW.heightPad
      );

      ctx.fillStyle = 'white';

      setBlur(true);
      drawSpacedText(line, 0, y);
      setBlur(false);
    }

    function renderYellow(line, x, y, width) {

      ctx.fillStyle = 'yellow';

      ctx.fillRect(
        x - YELLOW.padX,
        y - YELLOW.padY,
        width + YELLOW.padX * 2,
        FONT_SIZE + YELLOW.padY * 2
      );

      ctx.fillStyle = 'black';

      setBlur(true);
      drawSpacedText(line, x, y);
      setBlur(false);
    }

    function renderDefault(line, y) {

      ctx.fillStyle = state.textColor;

      setBlur(true);
      drawSpacedText(line, 0, y);
      setBlur(false);
    }

    //
    // DRAW
    //

    function drawCanvasText() {

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
      ctx.textBaseline = 'top';

      const lines = state.text.split('\n');

      const startX = 0;
      const startY = 120;

      lines.forEach((line, index) => {

        if (!line.trim()) return;

        const y = startY + index * getLineHeight();

        const contentX = startX + YELLOW.padX;

        const width = measureSpacedWidth(line);

        //
        // ROUTING
        //

        if (state.bwMode) {
          renderBW(line, y, width);
          return;
        }

        if (state.yellowMode) {
          renderYellow(line, contentX, y, width);
          return;
        }

        renderDefault(line, y);
      });
    }

    //
    // UPDATE
    //

    function updateAll() {
      drawCanvasText();
    }

    //
    // EVENTS
    //

    paragraphLeftInput.addEventListener('input', e => {
      state.text = e.target.value;
      updateAll();
    });

    invLeftParagraphLeftCheckbox.addEventListener('change', e => {

      state.bwMode = e.target.checked;

      if (state.bwMode) {
        state.yellowMode = false;
        highlightParagraphLeftCheckbox.checked = false;
      }

      updateAll();
    });

    highlightParagraphLeftCheckbox.addEventListener('change', e => {

      state.yellowMode = e.target.checked;

      if (state.yellowMode) {
        state.bwMode = false;
        invLeftParagraphLeftCheckbox.checked = false;
      }

      updateAll();
    });

    textLeftColorPicker.addEventListener('input', e => {
      state.textColor = e.target.value;
      updateAll();
    });

    //
    // INIT
    //

    await loadFonts();
    updateAll();
  }
);