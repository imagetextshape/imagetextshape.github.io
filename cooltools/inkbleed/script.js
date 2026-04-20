/* =====================
   CANVAS & STATE
===================== */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const state = {
  text: "electro",
  fontSize: 50,
  letterSpacing: 0,
  fontFamily: "monospace",
  textColor: "#ffffff",
  bgColor: "transparent",
  opacity: 1,
  overlayBlendMode: "difference",
  overlayAlpha: 0.8,
  overlayImage: null,
  driftX: 0,
  driftY: 0,
  rotation: 0
};

/* =====================
   IMAGE UPLOAD
===================== */
const imageInput = document.getElementById("imageInput");
const dropzone = document.getElementById("dropzone");

function loadImage(file) {
  const img = new Image();
  img.onload = () => { state.overlayImage = img; stamp(); };
  img.onerror = () => console.error("Overlay failed to load");
  img.src = file ? URL.createObjectURL(file) : "xerox_texture_1_low-res.png";
}

dropzone.addEventListener("dragover", e => { e.preventDefault(); dropzone.classList.add("border-white"); });
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("border-white"));
dropzone.addEventListener("drop", e => {
  e.preventDefault();
  dropzone.classList.remove("border-white");
  if (e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]);
});
imageInput.addEventListener("change", e => { if (e.target.files[0]) loadImage(e.target.files[0]); });

/* =====================
   CONTROLS
===================== */
const sliders = ["fontSize","letterSpacing","driftX","driftY","rotation","opacity"];
sliders.forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener("input", e => { state[id] = parseFloat(e.target.value); stamp(); });
});

// Individual controls
document.getElementById("textInput").addEventListener("input", e => { state.text = e.target.value; stamp(); });
document.getElementById("overlayBlendMode").addEventListener("change", e => { state.overlayBlendMode = e.target.value; stamp(); });

document.getElementById("textColor").addEventListener("input", e => { state.textColor = e.target.value; stamp(); });
document.getElementById("fontFamily").addEventListener("change", e => { state.fontFamily = e.target.value; stamp(); });

/* =====================
   DYNAMIC SLIDER RANGE
===================== */
function updateSlider(id){
  const min = parseFloat(document.getElementById(id+"Min").value);
  const max = parseFloat(document.getElementById(id+"Max").value);
  const step = parseFloat(document.getElementById(id+"Step").value);
  const slider = document.getElementById(id);
  slider.min = min;
  slider.max = max;
  slider.step = step;

  if(state[id] < min) state[id] = min;
  if(state[id] > max) state[id] = max;
  slider.value = state[id];
  stamp();
}

/* =====================
   DRAW FUNCTIONS
===================== */
function drawBackground() {
  if (state.bgColor) {
    ctx.fillStyle = state.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // Clear canvas for transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}


function drawTextFrame() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = state.opacity;
  ctx.fillStyle = state.textColor;
  ctx.font = `900 ${state.fontSize}px ${state.fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.rotate(state.rotation);

  if(state.letterSpacing===0){
    ctx.fillText(state.text, state.driftX, state.driftY);
  } else {
    let x = state.driftX - ((state.text.length-1)*state.letterSpacing)/2;
    for(const char of state.text){
      ctx.fillText(char, x, state.driftY);
      x+=state.letterSpacing;
    }
  }
  ctx.restore();
}

function drawOverlay(){
  if(!state.overlayImage) return;
  ctx.save();
  ctx.globalCompositeOperation = state.overlayBlendMode;
  ctx.globalAlpha = state.overlayAlpha;
  ctx.drawImage(state.overlayImage,0,0,canvas.width,canvas.height);
  ctx.restore();
}

function stamp(){
  drawTextFrame();
  drawOverlay();
}

/* =====================
   DOWNLOAD BUTTON
===================== */
document.getElementById("downloadBtn").addEventListener("click",()=>{
  const link=document.createElement("a");
  const randomId=Math.floor(Math.random()*1000000);
  link.download=`inksmear-${randomId}.png`;
  link.href=canvas.toDataURL("image/png");
  link.click();
});


/* =====================
   RESET BUTTON
===================== */
const resetBtn = document.getElementById("resetBtn");
resetBtn.addEventListener("click", () => {
  // Reset state values
  state.text = "electro";
  state.fontSize = 250;
  state.letterSpacing = 0;
  state.fontFamily = "monospace";
  state.textColor = "#ffffff";
  state.bgColor = "transparent";
  state.opacity = 1;
  state.overlayBlendMode = "difference";
  state.overlayAlpha = 0.8;
  state.overlayImage = null;
  state.driftX = 0;
  state.driftY = 0;
  state.rotation = 0;

  // Reset DOM inputs
  document.getElementById("textInput").value = state.text;
  document.getElementById("fontSize").value = state.fontSize;
  document.getElementById("letterSpacing").value = state.letterSpacing;
  document.getElementById("fontFamily").value = state.fontFamily;
  document.getElementById("textColor").value = state.textColor;
  document.getElementById("opacity").value = state.opacity;
  document.getElementById("overlayBlendMode").value = state.overlayBlendMode;
  document.getElementById("driftX").value = state.driftX;
  document.getElementById("driftY").value = state.driftY;
  document.getElementById("rotation").value = state.rotation;

  // Reset slider min/max/step inputs to defaults
  const sliderDefaults = {
    fontSize: [5, 400, 1],
    letterSpacing: [-50, 150, 1],
    driftX: [-20, 20, 0.1],
    driftY: [-20, 20, 0.1],
    rotation: [-0.5, 0.5, 0.001],
    opacity: [0.01, 0.3, 0.01]
  };
  for (const id in sliderDefaults) {
    const [min, max, step] = sliderDefaults[id];
    document.getElementById(id+"Min").value = min;
    document.getElementById(id+"Max").value = max;
    document.getElementById(id+"Step").value = step;
    updateSlider(id);
  }

  // Clear canvas and redraw
  drawBackground();
  loadImage();
  stamp();
});

/* =====================
   INIT
===================== */
drawBackground();
loadImage();
stamp();