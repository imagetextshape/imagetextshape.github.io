const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

//
// EXPORT
// 

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
    ? "dots-white.png"
    : "dots-transparent.png";

  link.href =
    exportCanvasEl.toDataURL("image/png");

  link.click();
}


const controls = {
  dotSize: document.getElementById('dotSize'),
  cols: document.getElementById('cols'),
  rows: document.getElementById('rows'),
  falloff: document.getElementById('falloff'),
  centralMode: document.getElementById('centralMode'),
  centerSize: document.getElementById('centerSize'),
  blendMode: document.getElementById('blendMode'),
  pathCount: document.getElementById('pathCount'),
  lineWidth: document.getElementById('lineWidth'),
  pathStyle: document.getElementById('pathStyle'),
  invertLineColor: document.getElementById('invertLineColor'),
invertDotColor: document.getElementById('invertDotColor'),
  randomDotMode: document.getElementById('randomDotMode'),
  randomAmount: document.getElementById('randomAmount')
};


const valueDisplays = {
  dotSize: document.getElementById('dotSizeValue'),
  cols: document.getElementById('colsValue'),
  rows: document.getElementById('rowsValue'),
  falloff: document.getElementById('falloffValue'),
  centerSize: document.getElementById('centerSizeValue'),
  pathCount: document.getElementById('pathCountValue'),
  lineWidth: document.getElementById('lineWidthValue'),
  randomAmount: document.getElementById('randomAmountValue')
};

const buttons = {
  generatePaths: document.getElementById('generatePaths'),
  clearPaths: document.getElementById('clearPaths'),
  randomiseDots: document.getElementById('randomiseDots')
};

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');

let overlayImage = null;

let dotMap = [];
let pathLines = [];
let randomDotMultipliers = [];

function updateLabels() {

  Object.entries(valueDisplays).forEach(([key, el]) => {

    if (!controls[key]) return;

    el.textContent = controls[key].value;
  });
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function generateDotMultipliers(total) {

  randomDotMultipliers = [];

  const intensity = +controls.randomAmount.value;

  for (let i = 0; i < total; i++) {

    const scale = random(
      1 - intensity,
      1 + intensity
    );

    randomDotMultipliers.push(scale);
  }
}

function generateRandomPaths() {

  pathLines = [];

  const count = +controls.pathCount.value;

  if (!dotMap.length) return;

  for (let i = 0; i < count; i++) {

    const lineLength = Math.floor(random(3, 10));

    const line = [];

    for (let j = 0; j < lineLength; j++) {

      const point =
        dotMap[Math.floor(Math.random() * dotMap.length)];

      line.push(point);
    }

    pathLines.push(line);
  }

  draw();
}

function drawPaths() {

  if (!pathLines.length) return;

  ctx.save();

  ctx.strokeStyle = controls.invertLineColor.checked
    ? 'white'
    : 'black';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 1;

  const width = +controls.lineWidth.value;

  ctx.lineWidth = width;

  const style = controls.pathStyle.value;

  switch (style) {

    case 'dashed':
      ctx.setLineDash([20, 12]);
      break;

    case 'dotted':
      ctx.setLineDash([2, width * 3]);
      break;

    default:
      ctx.setLineDash([]);
      break;
  }

  pathLines.forEach(line => {

    if (line.length < 2) return;

    ctx.beginPath();

    ctx.moveTo(line[0].x, line[0].y);

    for (let i = 1; i < line.length; i++) {
      ctx.lineTo(line[i].x, line[i].y);
    }

    ctx.stroke();
  });

  ctx.restore();
}


function loadImage(file) {

  const img = new Image();

  img.onload = () => {
    overlayImage = img;
    draw();
  };

  img.src = URL.createObjectURL(file);
}

function buildDotMap() {

  dotMap = [];

  const cols = +controls.cols.value;
  const rows = +controls.rows.value;
  const centralMode = controls.centralMode.checked;
  const centerSize = +controls.centerSize.value;

  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  for (let y = 0; y < rows; y++) {

    for (let x = 0; x < cols; x++) {

      let px = x * cellW + cellW / 2;
      let py = y * cellH + cellH / 2;

      if (centralMode) {

  const gridCenterX = (cols - 1) / 2;
  const gridCenterY = (rows - 1) / 2;

  const offsetX = x - gridCenterX;
  const offsetY = y - gridCenterY;

  const angle = Math.atan2(offsetY, offsetX);

  const gridDistance = Math.sqrt(
    offsetX * offsetX +
    offsetY * offsetY
  );

  const maxGridDistance = Math.sqrt(
    gridCenterX * gridCenterX +
    gridCenterY * gridCenterY
  );

  const radius =
    (gridDistance / maxGridDistance) *
    centerSize;

  px = cx + Math.cos(angle) * radius;
  py = cy + Math.sin(angle) * radius;

  // exact center point
  if (
    Math.abs(offsetX) < 0.5 &&
    Math.abs(offsetY) < 0.5
  ) {
    px = cx;
    py = cy;
  }
}

      dotMap.push({
        x: px,
        y: py
      });
    }
  }
}

function drawDots() {

  const dotSize = +controls.dotSize.value;
  const falloff = +controls.falloff.value;

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  const maxDist = Math.sqrt(cx * cx + cy * cy);

  dotMap.forEach((dot, index) => {

    const dx = dot.x - cx;
    const dy = dot.y - cy;

    const dist = Math.sqrt(dx * dx + dy * dy);

    const fade =
      1 - (dist / maxDist) * falloff;

    let size = dotSize * fade;

    if (controls.randomDotMode.checked) {

      const multiplier =
        randomDotMultipliers[index] || 1;

      size *= multiplier;
    }

    ctx.globalAlpha = fade;

    ctx.beginPath();

    ctx.arc(
      dot.x,
      dot.y,
      Math.max(0.5, size),
      0,
      Math.PI * 2
    );

    ctx.fillStyle = controls.invertDotColor.checked
    ? 'white'
    : 'black';
    ctx.fill();
  });

  ctx.globalAlpha = 1;
}

function drawOverlay() {

  if (!overlayImage) return;

  ctx.save();

  ctx.globalCompositeOperation =
    controls.blendMode.value;

  const canvasRatio =
    canvas.width / canvas.height;

  const imageRatio =
    overlayImage.width / overlayImage.height;

  let drawWidth;
  let drawHeight;
  let offsetX;
  let offsetY;

  if (imageRatio > canvasRatio) {

    drawHeight = canvas.height;
    drawWidth = drawHeight * imageRatio;

    offsetX = (canvas.width - drawWidth) / 2;
    offsetY = 0;

  } else {

    drawWidth = canvas.width;
    drawHeight = drawWidth / imageRatio;

    offsetX = 0;
    offsetY = (canvas.height - drawHeight) / 2;
  }

  ctx.drawImage(
    overlayImage,
    offsetX,
    offsetY,
    drawWidth,
    drawHeight
  );

  ctx.restore();
}

function draw() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  buildDotMap();

  if (
    controls.randomDotMode.checked &&
    randomDotMultipliers.length !== dotMap.length
  ) {
    generateDotMultipliers(dotMap.length);
  }

  drawDots();

  drawPaths();

  drawOverlay();
}

function handleFiles(file) {

  if (!file) return;

  loadImage(file);
}

/* -----------------------------
   Events
----------------------------- */

Object.values(controls).forEach(control => {

  control.addEventListener('input', () => {

    updateLabels();

    if (
      control === controls.cols ||
      control === controls.rows
    ) {

      if (controls.randomDotMode.checked) {

        const total =
          +controls.cols.value *
          +controls.rows.value;

        generateDotMultipliers(total);
      }
    }

    draw();
  });
});

buttons.randomiseDots.addEventListener('click', () => {

  const total =
    +controls.cols.value *
    +controls.rows.value;

  generateDotMultipliers(total);

  controls.randomDotMode.checked = true;

  draw();
});

buttons.generatePaths.addEventListener('click', () => {
  generateRandomPaths();
});

buttons.clearPaths.addEventListener('click', () => {

  pathLines = [];

  draw();
});

/* -----------------------------
   Dropzone
----------------------------- */

dropzone.addEventListener('click', () => {
  fileInput.click();
});

dropzone.addEventListener('dragover', e => {

  e.preventDefault();

  dropzone.classList.add(
    'border-white'
  );
});

dropzone.addEventListener('dragleave', () => {

  dropzone.classList.remove(
    'border-white'
  );
});

dropzone.addEventListener('drop', e => {

  e.preventDefault();

  dropzone.classList.remove(
    'border-white'
  );

  const file = e.dataTransfer.files[0];

  handleFiles(file);
});

fileInput.addEventListener('change', e => {

  const file = e.target.files[0];

  handleFiles(file);
});

/* -----------------------------
   Init
----------------------------- */

updateLabels();

generateDotMultipliers(
  +controls.cols.value *
  +controls.rows.value
);

draw();


