const $ = id => document.getElementById(id);
const canvas = $("canvas");
const ctx = canvas.getContext("2d");
let img = null;

/* ---------- Helpers ---------- */

function resolveColor(mode, picker) {
  if ($(mode).value === "white") return "#fff";
  if ($(mode).value === "custom") return $(picker).value;
  return "#000";
}

function bindColor(mode, picker) {
  $(mode).onchange = () => {
    $(picker).classList.toggle("hidden", $(mode).value !== "custom");
    render();
  };
  $(picker).oninput = render;
}

function getHalftoneShape() {
  return document.querySelector('input[name="htShape"]:checked').value;
}

/* ---------- Image ---------- */

$("dropzone").onclick = () => $("fileInput").click();
$("dropzone").ondragover = e => e.preventDefault();
$("dropzone").ondrop = e => {
  e.preventDefault();
  loadFile(e.dataTransfer.files[0]);
};
$("fileInput").onchange = e => loadFile(e.target.files[0]);

function loadFile(file) {
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    img = new Image();
    img.onload = render;
    img.src = r.result;
  };
  r.readAsDataURL(file);
}

/* ---------- Render ---------- */

function render() {
  if (!img) return;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img,0,0);

  const src = ctx.getImageData(0,0,canvas.width,canvas.height);

  if ($("dcEnabled")?.checked) applyEarlyDigitalCamera();
  if ($("htEnabled").checked) drawHalftone(src);
  if ($("chEnabled").checked) drawCrossHatch(src);
  if ($("rsEnabled").checked) drawRaster(src);
}

/* ---------- Effects ---------- */

function applyEarlyDigitalCamera() {
  const scale  = +$("dcScale").value;
  const bits   = +$("dcBits").value;
  const noise  = +$("dcNoise").value;
  const brightness = +$("dcBrightness").value;
  const gamma  = +$("dcGamma").value;
  const clip   = +$("dcClip").value;

  const contrast = +$("dcContrast").value / 100; // -1 … +1

  const blur   = +$("dcBlur").value;
  const temp   = +$("dcTemp").value;
  const tint   = +$("dcTint").value;
  const hueDeg = +$("dcHue").value * Math.PI / 180;
  const sat    = +$("dcSat").value;

  const w = Math.max(1, Math.floor(canvas.width * scale));
  const h = Math.max(1, Math.floor(canvas.height * scale));

  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const octx = off.getContext("2d");
  octx.imageSmoothingEnabled = false;

  /* =====================
     DOWNSAMPLE
  ===================== */

  octx.drawImage(canvas, 0, 0, w, h);

  /* =====================
     SENSOR BLUR
  ===================== */

  if (blur > 0) {
    octx.filter = `blur(${blur}px)`;
    octx.drawImage(off, 0, 0);
    octx.filter = "none";
  }

  const imgData = octx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const levels = (1 << bits) - 1;

  const cosH = Math.cos(hueDeg);
  const sinH = Math.sin(hueDeg);

  function applyContrast(v) {
    v = (v - 0.5) * (1 + contrast) + 0.5;
    return Math.max(0, Math.min(1, v));
  }

  /* =====================
     SENSOR PIPELINE
  ===================== */

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i]   / 255;
    let g = d[i+1] / 255;
    let b = d[i+2] / 255;

    // exposure / gain
    r += brightness;
    g += brightness;
    b += brightness;

    // sensor-domain contrast (NEW)
    r = applyContrast(r);
    g = applyContrast(g);
    b = applyContrast(b);

    // highlight knee / CCD clipping
    if (clip > 0) {
      const knee = 1 - clip * 0.5;
      r = r > knee ? knee + (r - knee) * 0.1 : r;
      g = g > knee ? knee + (g - knee) * 0.1 : g;
      b = b > knee ? knee + (b - knee) * 0.1 : b;
    }

    // incorrect early-digital gamma
    r = Math.pow(r, gamma);
    g = Math.pow(g, gamma);
    b = Math.pow(b, gamma);

    // white balance drift
    r += temp;
    b -= temp;
    g += tint;

    // hue rotation (YIQ)
    const y  = 0.299*r + 0.587*g + 0.114*b;
    const iC = 0.596*r - 0.275*g - 0.321*b;
    const qC = 0.212*r - 0.523*g + 0.311*b;

    const i2 = iC * cosH - qC * sinH;
    const q2 = iC * sinH + qC * cosH;

    r = y + 0.956*i2 + 0.621*q2;
    g = y - 0.272*i2 - 0.647*q2;
    b = y - 1.106*i2 + 1.703*q2;

    // saturation
    const l = (r + g + b) / 3;
    r = l + (r - l) * sat;
    g = l + (g - l) * sat;
    b = l + (b - l) * sat;

    // quantisation + sensor noise
    r = Math.round(r * levels) / levels + (Math.random() - 0.5) * (noise / 255);
    g = Math.round(g * levels) / levels + (Math.random() - 0.5) * (noise / 255);
    b = Math.round(b * levels) / levels + (Math.random() - 0.5) * (noise / 255);

    d[i]   = Math.max(0, Math.min(255, r * 255));
    d[i+1] = Math.max(0, Math.min(255, g * 255));
    d[i+2] = Math.max(0, Math.min(255, b * 255));
  }

  octx.putImageData(imgData, 0, 0);

  /* =====================
     UPSCALE
  ===================== */

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
}


function drawHalftone(src) {
  ctx.save();
  ctx.globalCompositeOperation = $("htBlend").value;

  const angle = +$("htAngle").value * Math.PI / 180;
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.rotate(angle);
  ctx.translate(-canvas.width/2, -canvas.height/2);

  ctx.fillStyle = resolveColor("htColorMode","htColor");
  ctx.strokeStyle = ctx.fillStyle;

  const spacing = +$("htSpacing").value;
  const size = +$("htDotSize").value;
  const intensity = +$("htIntensity").value;
  const shape = getHalftoneShape();

  for (let y = 0; y < canvas.height; y += spacing) {
    for (let x = 0; x < canvas.width; x += spacing) {
      const p = (y * canvas.width + x) * 4;
      const lum = (0.2126 * src.data[p] +
                   0.7152 * src.data[p+1] +
                   0.0722 * src.data[p+2]) / 255;

      const v = size * (1 - lum) * intensity;
      if (v <= 0) continue;

      ctx.beginPath();

      switch (shape) {
        case "round":
          ctx.arc(x, y, v, 0, Math.PI * 2);
          ctx.fill();
          break;

        case "square":
          ctx.fillRect(x - v, y - v, v * 2, v * 2);
          break;

        case "triangle":
          ctx.moveTo(x, y - v);
          ctx.lineTo(x - v, y + v);
          ctx.lineTo(x + v, y + v);
          ctx.closePath();
          ctx.fill();
          break;

        case "line":
          ctx.lineWidth = Math.max(1, v * 0.6);
          ctx.moveTo(x, y - v);
          ctx.lineTo(x, y + v);
          ctx.stroke();
          break;
      }
    }
  }

  ctx.restore();
}

function drawCrossHatch(src) {
  ctx.save();
  ctx.globalCompositeOperation = $("chBlend").value;
  ctx.strokeStyle = resolveColor("chColorMode","chColor");
  ctx.globalAlpha = +$("chStrength").value;

  const step = +$("chDensity").value;

  for (let y=0;y<canvas.height;y+=step) {
    for (let x=0;x<canvas.width;x+=step) {
      const p=(y*canvas.width+x)*4;
      const lum=(src.data[p]+src.data[p+1]+src.data[p+2])/(3*255);
      if (lum<0.6) { ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+step,y+step); ctx.stroke(); }
      if (lum<0.3) { ctx.beginPath(); ctx.moveTo(x+step,y); ctx.lineTo(x,y+step); ctx.stroke(); }
    }
  }

  ctx.restore();
}

function drawRaster(src) {
  ctx.save();
  ctx.globalCompositeOperation = $("rsBlend").value;
  ctx.fillStyle = resolveColor("rsColorMode","rsColor");

  const scale = +$("rsScale").value;
  const strength = +$("rsStrength").value;

  for (let y=0;y<canvas.height;y+=scale) {
    for (let x=0;x<canvas.width;x+=scale) {
      const p=(y*canvas.width+x)*4;
      const lum=(0.2126*src.data[p]+0.7152*src.data[p+1]+0.0722*src.data[p+2])/255;
      const r=scale*0.5*(1-lum)*strength;
      if (r>0) {
        ctx.beginPath();
        ctx.arc(x+scale/2,y+scale/2,r,0,Math.PI*2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

/* ---------- UI ---------- */

document.querySelectorAll("input,select").forEach(el => el.oninput = render);
bindColor("htColorMode","htColor");
bindColor("chColorMode","chColor");
bindColor("rsColorMode","rsColor");

/* ---------- Download ---------- */

$("downloadBtn").onclick = () => {
  if (!img) return;
  canvas.toBlob(b=>{
    const a=document.createElement("a");
    a.href=URL.createObjectURL(b);
    a.download="effects.png";
    a.click();
    URL.revokeObjectURL(a.href);
  });
};