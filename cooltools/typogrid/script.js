// ======================================================
// STATE
// ======================================================
let globalIndex = 0;

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const state = {
  text: "",

  grid: {
    cols: 24,
    rows: 12,
    cellW: CANVAS_WIDTH / 24,
    cellH: CANVAS_HEIGHT / 12
  },

  letters: [],

  style: {
    fontFamily: "Inter",
    fontSize: 64,
    tracking: 0,
    leading: 1,
    color: "#000000",
    
    renderMode: "fill", // "fill" | "stroke" | "fill+stroke"
    strokeColor: "#000000",
    strokeWidth: 2,

    fontWeight: "normal",   // "normal" | "bold"
    fontStyle: "normal",    // "normal" | "italic"
    
    align: "center"
  }
};

state.debug = {
  showPath: false,
  pathStyle: "solid",
  showGrid: true
};

state.overlay = {
  img: null,
  opacity: 1,
  blend: "source-over" // default normal
};
// ======================================================
// CANVAS
// ======================================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");

// ======================================================
// GRID HELPERS
// ======================================================

function handleFile(file) {
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    state.overlay.img = img;
    draw();
  };

  img.src = URL.createObjectURL(file);

  URL.revokeObjectURL(img.src);
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function updateGridMetrics() {
  state.grid.cellW = CANVAS_WIDTH / state.grid.cols;
  state.grid.cellH = CANVAS_HEIGHT / state.grid.rows;
}

function drawOverlay() {
  const { img, opacity, blend } = state.overlay;
  if (!img) return;

  ctx.save();

  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = blend;

  const iw = img.width;
  const ih = img.height;

  // if smaller than canvas → tile
  if (iw < CANVAS_WIDTH || ih < CANVAS_HEIGHT) {
    const pattern = ctx.createPattern(img, "repeat");
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  } else {
    // otherwise just draw normally (no distortion)
    ctx.drawImage(img, 0, 0);
  }

  ctx.restore();
}

function drawPathLine() {
  if (state.letters.length < 2) return;

  const { cellW, cellH } = state.grid;

  ctx.beginPath();

  state.letters.forEach((l, i) => {
    const x = l.gridX * cellW + cellW / 2 + l.offsetX;
    const y = l.gridY * cellH + cellH / 2 + l.offsetY;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  // style switch
  switch (state.debug.pathStyle) {
    case "dashed":
      ctx.setLineDash([6, 4]);
      ctx.lineCap = "butt";
      break;

    case "dotted":
      ctx.setLineDash([1, 6]);
      ctx.lineCap = "round";
      break;

    default: // solid
      ctx.setLineDash([]);
      ctx.lineCap = "butt";
  }

  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.stroke();

  // reset so other draws aren’t affected
  ctx.setLineDash([]);
  ctx.lineCap = "butt";
}

// ======================================================
// LETTER GENERATION
// ======================================================

function generateLetters(text) {
  if (!text || !text.trim()) return [];

  const letters = [];

  let x = 0;
  let y = 0;

  const { cols, rows } = state.grid;

  const tokens = text.split(" ");

  tokens.forEach((word, wIndex) => {

    [...word].forEach((char, cIndex) => {

      if (x >= cols) {
        x = 0;
        y++;
      }

      if (y >= rows) return;

      letters.push({
        char,
        wordIndex: wIndex,
        charIndex: cIndex,

        gridX: x,
        gridY: y,

        offsetX: 0,
        offsetY: 0
      });

      x += 1; // fixed unit step ONLY
    });

    x += 1; // word spacing
  });

  return letters;
}

// ======================================================
// DRAWING
// ======================================================

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const { cellW, cellH } = state.grid;

  if (state.debug.showGrid) {
  drawGrid();
}

  ctx.fillStyle = state.style.color;
  ctx.textAlign = state.style.align;
  ctx.textBaseline = "middle";
  ctx.font = [
  state.style.fontStyle,
  state.style.fontWeight,
  `${state.style.fontSize}px`,
  state.style.fontFamily
].join(" ");

  state.letters.forEach(l => {
  const trackingOffset = l.charIndex * state.style.tracking;
  const leadingOffset = l.charIndex * state.style.leading;

  const x = l.gridX * cellW + cellW / 2 + l.offsetX + trackingOffset;
  const y = l.gridY * cellH + cellH / 2 + l.offsetY + leadingOffset;

  switch (state.style.renderMode) {

    case "stroke":
      ctx.strokeStyle = state.style.strokeColor;
      ctx.lineWidth = state.style.strokeWidth;
      ctx.strokeText(l.char, x, y);
      break;

    case "fill+stroke":
      ctx.fillStyle = state.style.color;
      ctx.fillText(l.char, x, y);

      ctx.strokeStyle = state.style.strokeColor;
      ctx.lineWidth = state.style.strokeWidth;
      ctx.strokeText(l.char, x, y);
      break;

    default: // fill
      ctx.fillStyle = state.style.color;
      ctx.fillText(l.char, x, y);
  }
});

  if (state.debug.showPath) {
  drawPathLine();

}
   drawOverlay();
}

// ======================================================
// GRID 
// ======================================================

const dotSizeInput =
  document.getElementById(
    'dotSizeInput'
  );

state.grid.dotSize = 1.3;

dotSizeInput.addEventListener(
  'input',
  () => {

    state.grid.dotSize =
      parseFloat(
        dotSizeInput.value
      ) || 1;

    draw();
  }
);

function drawGrid() {

  const {
    cols,
    rows,
    cellW,
    cellH,
    dotSize
  } = state.grid;

  ctx.fillStyle =
    "rgba(0,0,0,0.75)";

  for (
    let i = 0;
    i <= cols;
    i++
  ) {

    for (
      let j = 0;
      j <= rows;
      j++
    ) {

      const x =
        i * cellW;

      const y =
        j * cellH;

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        dotSize,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }
  }
}


// ======================================================
// RANDOMIZATION (NON-DESTRUCTIVE)
// ======================================================

function randomizeLayout() {
  const { cols, rows } = state.grid;
  const maxIndex = cols * rows;

  // group letters by word
  const words = [];

  state.letters.forEach(l => {
    if (!words[l.wordIndex]) words[l.wordIndex] = [];
    words[l.wordIndex].push(l);
  });

  let currentIndex = Math.floor(Math.random() * (cols)); 
  // start somewhere near top row for stability

  words.forEach(wordLetters => {

    const length = wordLetters.length;

    // ensure space for the whole word
    const remaining = maxIndex - currentIndex;
    if (remaining <= length) {
      currentIndex = Math.floor(Math.random() * (cols)); // fallback reset
    }

    // choose direction
    const directions = [
      [1, 0],   // horizontal
      [0, 1],   // vertical
      [1, 1],   // diagonal
      [1, -1]   // upward diagonal
    ];

    const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];

    // convert index → grid origin
    let originX = currentIndex % cols;
    let originY = Math.floor(currentIndex / cols);

    wordLetters.forEach((l, i) => {
      const x = originX + i * dx;
      const y = originY + i * dy;

      l.gridX = clamp(x, 0, cols - 1);
      l.gridY = clamp(y, 0, rows - 1);
    });

    // advance index AFTER this word
    currentIndex += length + Math.floor(Math.random() * 5); // spacing randomness
  });

  draw();
}
// ======================================================
// RESET
// ======================================================

function resetLayout() {
  state.letters = generateLetters(state.text);

  draw();
}

function clearOverlay() {
  state.overlay.img = null;
  draw();
}


// ======================================================
// EVENTS
// ======================================================

document.getElementById("textInput").addEventListener("input", e => {
  state.text = e.target.value;
  resetLayout();
});

document.getElementById("fontSelect").addEventListener("change", e => {
  state.style.fontFamily = e.target.value;

  document.fonts.load(`64px "${state.style.fontFamily}"`).then(() => {
    draw();
  });
});

document.getElementById("fontSize").addEventListener("input", e => {
  state.style.fontSize = parseInt(e.target.value, 10);
  draw();
});

document.getElementById("randomizeBtn").onclick = randomizeLayout;
document.getElementById("resetBtn").onclick = resetLayout;

document.getElementById("trackingInput").addEventListener("input", e => {
  state.style.tracking = parseFloat(e.target.value);
  draw();
});

document.getElementById("leadingInput").addEventListener("input", e => {
  state.style.leading = parseFloat(e.target.value);
  draw();
});


document.getElementById("pathToggle").addEventListener("change", e => {
  state.debug.showPath = e.target.checked;
  draw();
});

document.getElementById("gridToggle").addEventListener("change", e => {
  state.debug.showGrid = e.target.checked;
  draw();
});


document.getElementById("pathStyleSelect").addEventListener("change", e => {
  state.debug.pathStyle = e.target.value;
  draw();
});



dropzone.onclick = () => fileInput.click();

dropzone.addEventListener("dragover", e => {
  e.preventDefault();
});

dropzone.addEventListener("drop", e => {
  e.preventDefault();
  handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener("change", e => {
  handleFile(e.target.files[0]);
});

document.getElementById("blendMode").addEventListener("change", e => {
  state.overlay.blend = e.target.value;
  draw();
});

document.getElementById("opacitySlider").addEventListener("input", e => {
  state.overlay.opacity = parseFloat(e.target.value);
  draw();
});

document.getElementById("renderMode").addEventListener("change", e => {
  state.style.renderMode = e.target.value;
  draw();
});

document.getElementById("fontColor").addEventListener("input", e => {
  state.style.color = e.target.value;
  draw();
});

document.getElementById("strokeColor").addEventListener("input", e => {
  state.style.strokeColor = e.target.value;
  draw();
});

document.getElementById("strokeWidth").addEventListener("input", e => {
  state.style.strokeWidth = parseInt(e.target.value, 10);
  draw();
});

document.getElementById("fontVariant").addEventListener("change", e => {
  const [style, weight] = e.target.value.split("-");

  state.style.fontStyle = style;
  state.style.fontWeight = weight;

  // ensure font is loaded with this variant
  document.fonts.load(
    `${style} ${weight} ${state.style.fontSize}px "${state.style.fontFamily}"`
  ).then(draw);
});

document.getElementById("clearOverlayBtn").onclick = clearOverlay;
// 
// 
// 
// ======================================================
// EXPORT
// ======================================================

document.getElementById("exportBtn").onclick = exportCanvas;

function exportCanvas() {

  const useWhiteBackground = window.confirm(
    "Export with white background?\n\nOK = White Background\nCancel = Transparent"
  );

  const exportCanvasEl = document.createElement("canvas");
  const exportCtx = exportCanvasEl.getContext("2d");

  exportCanvasEl.width = CANVAS_WIDTH;
  exportCanvasEl.height = CANVAS_HEIGHT;

  // optional white background
  if (useWhiteBackground) {
    exportCtx.fillStyle = "#ffffff";
    exportCtx.fillRect(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );
  }

  // draw current canvas onto export canvas
  exportCtx.drawImage(canvas, 0, 0);

  const link = document.createElement("a");

  link.download = useWhiteBackground
    ? "typography-white.png"
    : "typography-transparent.png";

  link.href =
    exportCanvasEl.toDataURL("image/png");

  link.click();
}


// toggle checkboxes using spacebar
const toggles = document.querySelectorAll('[data-toggle]');


document.addEventListener("keydown", e => {
  const tag = e.target.tagName;

  // ignore when typing in inputs/textareas/contenteditable
  if (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    e.target.isContentEditable
  ) return;

  const key = e.key.toLowerCase();

  switch (key) {
    case "s":
      e.preventDefault(); // prevent browser "save page"
      exportCanvas();
      break;

    case "r":
      e.preventDefault();
      randomizeLayout();
      break;
  }
});
// ======================================================
// INIT
// ======================================================

updateGridMetrics();
resetLayout();