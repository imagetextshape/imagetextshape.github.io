// =====================
// DOM Elements
// =====================
const canvas = document.getElementById("textCanvas");
const ctx = canvas.getContext("2d");

// Text & font controls
const textInput = document.getElementById("textInput");
const fontSelect = document.getElementById("fontSelect");
const fontSizeInput = document.getElementById("fontSize");
const fontSizeLabel = document.getElementById("fontSizeLabel");
const lineHeightInput = document.getElementById("lineHeight");
const lineHeightLabel = document.getElementById("lineHeightLabel");
const letterSpacingInput = document.getElementById("letterSpacing");
const letterSpacingLabel = document.getElementById("letterSpacingLabel");

const textBlurInput = document.getElementById("textBlur");
const blurLabel = document.getElementById("blurLabel");
const outlineCheckbox = document.getElementById("outlineText");

const textColor = document.getElementById("textColor");
const bgColor = document.getElementById("bgColor");

// Texture 1 controls
const textureInput1 = document.getElementById("textureInput1");
const dropzone1 = document.getElementById("dropzone1");
const texture1XInput = document.getElementById("texture1X");
const texture1YInput = document.getElementById("texture1Y");
const texture1XLabel = document.getElementById("texture1XLabel");
const texture1YLabel = document.getElementById("texture1YLabel");
const blendModeSelect1 = document.getElementById("blendModeSelect1");
const blendToggle1 = document.getElementById("blendToggle1");
const doubleTexture1 = document.getElementById("doubleTexture1");

// Texture 2 controls
const textureInput2 = document.getElementById("textureInput2");
const dropzone2 = document.getElementById("dropzone2");
const texture2XInput = document.getElementById("texture2X");
const texture2YInput = document.getElementById("texture2Y");
const texture2XLabel = document.getElementById("texture2XLabel");
const texture2YLabel = document.getElementById("texture2YLabel");
const blendModeSelect2 = document.getElementById("blendModeSelect2");
const blendToggle2 = document.getElementById("blendToggle2");
const doubleTexture2 = document.getElementById("doubleTexture2");

// Texture 2 intensity slider
const textureBlendInput = document.getElementById("textureBlend");
const textureBlendLabel = document.getElementById("textureBlendLabel");

// Buttons
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");

// Textures
let textureImage1 = null;
let textureImage2 = null;

// =====================
// Canvas Resize
// =====================
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  drawCanvas();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// =====================
// Helper: Draw tiled texture
// =====================
function drawTiledTexture(texture, offsetX, offsetY) {
  if (!texture) return;
  const texWidth = texture.width;
  const texHeight = texture.height;
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const dpr = window.devicePixelRatio || 1;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const scaledOffsetX = offsetX * dpr;
  const scaledOffsetY = offsetY * dpr;

  for (let y = scaledOffsetY; y < canvasHeight; y += texHeight) {
    for (let x = scaledOffsetX; x < canvasWidth; x += texWidth) {
      ctx.drawImage(texture, x, y);
    }
  }

  ctx.restore();
}


// =====================
// Draw Canvas
// =====================
function drawCanvas() {
  const rect = canvas.getBoundingClientRect();

  const text = textInput.value;
  const font = fontSelect.value;
  const fontSize = parseInt(fontSizeInput.value, 10);
  const lineHeight = parseFloat(lineHeightInput.value);
  const letterSpacing = parseFloat(letterSpacingInput.value);
  const textCol = textColor.value;
  const bgCol = bgColor.value;

  const offset1X = parseFloat(texture1XInput.value);
  const offset1Y = parseFloat(texture1YInput.value);
  const offset2X = parseFloat(texture2XInput.value);
  const offset2Y = parseFloat(texture2YInput.value);
  const blendAmount = parseFloat(textureBlendInput.value) / 100; // 0–1

  ctx.save();
  ctx.fillStyle = bgCol;
  ctx.fillRect(0, 0, rect.width, rect.height);

  ctx.font = `${fontSize}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = textCol;

  const lines = text.split("\n");
  const totalHeight = lines.length * fontSize * lineHeight;
  let startY = rect.height / 2 - totalHeight / 2 + fontSize / 2;

  // Apply blur filter
ctx.filter = `blur(${parseFloat(textBlurInput.value)}px)`;

// Draw text
lines.forEach((line, index) => {
  const y = startY + index * fontSize * lineHeight;
  const xCenter = rect.width / 2;

  if (letterSpacing === 0) {
    if (outlineCheckbox.checked) {
      ctx.strokeStyle = textCol;
      ctx.lineWidth = 2;
      ctx.strokeText(line, xCenter, y);
    } else {
      ctx.fillStyle = textCol;
      ctx.fillText(line, xCenter, y);
    }
  } else {
    const chars = line.split("");
    let totalWidth =
      chars.reduce((acc, c) => acc + ctx.measureText(c).width, 0) +
      (chars.length - 1) * letterSpacing;
    let startX = xCenter - totalWidth / 2;
    for (let char of chars) {
      if (outlineCheckbox.checked) {
        ctx.strokeStyle = textCol;
        ctx.lineWidth = 2;
        ctx.strokeText(char, startX, y);
      } else {
        ctx.fillStyle = textCol;
        ctx.fillText(char, startX, y);
      }
      startX += ctx.measureText(char).width + letterSpacing;
    }
  }
});

// Reset filter for textures
ctx.filter = 'none';


  // --- Apply Texture 1 (always 100%) ---
if (textureImage1) {
  ctx.save();
  ctx.globalAlpha = 1; // always full
  ctx.globalCompositeOperation = blendToggle1.checked
    ? blendModeSelect1.value
    : "source-in";
  drawTiledTexture(textureImage1, offset1X, offset1Y);
  if (doubleTexture1?.checked)
    drawTiledTexture(textureImage1, offset1X + 0.5, offset1Y + 0.5);
  ctx.restore();
}

// --- Apply Texture 2 (slider-controlled opacity) ---
if (textureImage2) {
  const blendAmount = parseFloat(textureBlendInput.value) / 100; // 0..1
  ctx.save();
  ctx.globalAlpha = blendAmount; // only Texture 2 opacity is affected
  ctx.globalCompositeOperation = blendToggle2.checked
    ? blendModeSelect2.value
    : "source-in";
  drawTiledTexture(textureImage2, offset2X, offset2Y);
  if (doubleTexture2?.checked)
    drawTiledTexture(textureImage2, offset2X + 0.5, offset2Y + 0.5);
  ctx.restore();
}




  ctx.restore();
}


// =====================
// Update & Draw
// =====================
function updateAndDraw() {
  fontSizeLabel.textContent = fontSizeInput.value;
  lineHeightLabel.textContent = lineHeightInput.value;
  letterSpacingLabel.textContent = letterSpacingInput.value;
  texture1XLabel.textContent = texture1XInput.value;
  texture1YLabel.textContent = texture1YInput.value;
  texture2XLabel.textContent = texture2XInput.value;
  texture2YLabel.textContent = texture2YInput.value;
  textureBlendLabel.textContent = textureBlendInput.value + "%";
  blurLabel.textContent = textBlurInput.value;
  drawCanvas();
}




// =====================
// Event Listeners
// =====================
[textInput, fontSelect, textColor, bgColor,
 fontSizeInput, lineHeightInput, letterSpacingInput,
 texture1XInput, texture1YInput, blendModeSelect1, blendToggle1, doubleTexture1,
 texture2XInput, texture2YInput, blendModeSelect2, blendToggle2, doubleTexture2,
 textureBlendInput, textBlurInput, outlineCheckbox // new
].forEach(el => el?.addEventListener("input", updateAndDraw));


// =====================
// Texture Upload Setup
// =====================
function setupDropzone(dropzone, input, assignTexture) {
  if (!dropzone || !input) return;
  dropzone.addEventListener("click", () => input.click());
  dropzone.addEventListener("dragover", e => {
    e.preventDefault();
    dropzone.classList.add("bg-gray-100");
  });
  dropzone.addEventListener("dragleave", () =>
    dropzone.classList.remove("bg-gray-100")
  );
  dropzone.addEventListener("drop", e => {
    e.preventDefault();
    dropzone.classList.remove("bg-gray-100");
    handleTexture(e.dataTransfer.files[0], assignTexture);
  });
  input.addEventListener("change", e =>
    handleTexture(e.target.files[0], assignTexture)
  );
}

function handleTexture(file, assignTexture) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      assignTexture(img);
      drawCanvas();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

setupDropzone(dropzone1, textureInput1, img => (textureImage1 = img));
setupDropzone(dropzone2, textureInput2, img => (textureImage2 = img));

// =====================
// Save & Clear
// =====================
saveBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "text_texture.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  textInput.value = "";
  textureImage1 = null;
  textureImage2 = null;
  drawCanvas();
});

// Initial draw
drawCanvas();
