// ---------- DOM ELEMENTS ----------
const canvasContainer = document.getElementById("canvasContainer");
const addTextBtn = document.getElementById("addTextBtn");
const addImageBtn = document.getElementById("addImageBtn");
const bgColorPicker = document.getElementById("bgColorPicker");
const contextMenu = document.getElementById("contextMenu");

const imageAccordion = document.getElementById("imageAccordion");
const imageArrowIcon = document.getElementById("imageArrowIcon");
const toggleImageOptions = document.getElementById("toggleImageOptions");
const imageOptions = document.getElementById("imageOptions");

const brightnessInput = imageOptions.querySelector('[data-action="brightness"]');
const contrastInput = imageOptions.querySelector('[data-action="contrast"]');
const saturationInput = imageOptions.querySelector('[data-action="saturation"]');
const opacityInput = imageOptions.querySelector('[data-action="opacity"]');

const textAccordion = document.getElementById("textAccordion");
const toggleTextOptions = document.getElementById("toggleTextOptions");
const textOptions = document.getElementById("textOptions");
const arrowIcon = document.getElementById("arrowIcon");
const fontSelectMenu = document.getElementById("fontSelectMenu");
const lineHeightInput = document.getElementById("lineHeightInput");
const letterSpacingInput = document.getElementById("letterSpacingInput");
const blurInput = document.getElementById("blurInput");
const textColorPicker = document.getElementById("textColorPicker");
const textBgColorPicker = document.getElementById("textBgColorPicker");

const clearBtn = document.getElementById("clearBtn");
const toggleShapeOptions = document.getElementById("toggleShapeOptions");
const shapeOptions = document.getElementById("shapeOptions");
const shapeArrowIcon = document.getElementById("shapeArrowIcon");
const addShapeBtn = document.getElementById("addShapeBtn");
const shapeTypeSelect = document.getElementById("shapeTypeSelect");
const shapeColorPicker = document.getElementById("shapeColorPicker");

// ---------- GLOBAL STATE ----------

let selectedLayer = null; 
let selectedLayers = new Set();
let activeLayer = null;
let activeLayers = new Set(); //
let activeAction = null; // 'drag' | 'rotate' | 'scale'
let startMouse = { x: 0, y: 0 };
let startData = new Map(); 
let groupCenter = { x: 0, y: 0 }; 
let startAngle = 0;
let startDist = 0;
let blendOptionsOpen = false;
let textOptionsOpen = false;
let shapeOptionsOpen = false;

let isGroupActionActive = false;




// IMAGE FILTERS
const DEFAULT_FILTERS = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  opacity: 100,
};

function applyImageFilters(img, filters = {}) {
  const current = img.style.filter || "";

  // Merge defaults + existing values + new updates
  const finalFilters = { ...DEFAULT_FILTERS };

  for (const key in DEFAULT_FILTERS) {
    // If a value is provided in filters, use it
    if (filters[key] !== undefined) {
      finalFilters[key] = filters[key];
    } else {
      // Try to extract from current style if it exists
      if (key === "opacity") {
        finalFilters[key] = parseInt((parseFloat(img.style.opacity) || 1) * 100);
      } else {
        const match = current.match(new RegExp(`${key}\\((\\d+)%\\)`));
        finalFilters[key] = match ? parseInt(match[1]) : DEFAULT_FILTERS[key];
      }
    }
  }

  // Build filter string
  const filterString = Object.entries(finalFilters)
    .filter(([k]) => k !== "opacity") // opacity is set separately
    .map(([k, v]) => `${k}(${v}%)`)
    .join(" ");

  img.style.filter = filterString;
  img.style.opacity = finalFilters.opacity / 100;
}

// --- Event listeners for sliders ---
[brightnessInput, contrastInput, opacityInput, saturationInput].forEach(input => {
  ["pointerdown", "mousedown", "click"].forEach(ev => 
    input.addEventListener(ev, e => e.stopPropagation())
  );

  input.addEventListener("input", () => {
    if (!selectedLayer) return;
    const img = selectedLayer.querySelector("img, .image-layer");
    if (!img) return;

    applyImageFilters(img, {
      brightness: parseInt(brightnessInput.value),
      contrast: parseInt(contrastInput.value),
      opacity: parseInt(opacityInput.value),
      saturate: parseInt(saturationInput.value),
    });
  });

  //  Double-click resets slider to default
  input.addEventListener("dblclick", () => {
    const key = input.id.replace("Input", ""); // e.g., "brightnessInput" -> "brightness"
    input.value = DEFAULT_FILTERS[key];

    if (!selectedLayer) return;
    const img = selectedLayer.querySelector("img, .image-layer");
    if (!img) return;

    applyImageFilters(img, {
      brightness: parseInt(brightnessInput.value),
      contrast: parseInt(contrastInput.value),
      opacity: parseInt(opacityInput.value),
      saturate: parseInt(saturationInput.value),
    });
  });
});

// --- Update sliders when selecting a layer ---
function updateImageSliders(layer) {
  const img = layer.querySelector("img, .image-layer");
  if (!img) return;

  const filters = img.style.filter || "";

  for (const key in DEFAULT_FILTERS) {
    const input = document.getElementById(`${key}Input`);
    if (!input) continue;

    if (key === "opacity") {
      input.value = parseInt((parseFloat(img.style.opacity) || 1) * 100);
    } else {
      const match = filters.match(new RegExp(`${key}\\((\\d+)%\\)`));
      input.value = match ? parseInt(match[1]) : DEFAULT_FILTERS[key];
    }
  }
}






// ---------- HELPERS ----------
function setTransformData(layer, tx, ty, rot, scale) {
  layer.dataset.tx = tx;
  layer.dataset.ty = ty;
  layer.dataset.rot = rot;
  layer.dataset.scale = scale;
  layer.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`;
}

function createLayer(x = 50, y = 50) {
  const layer = document.createElement("div");
  layer.className = "layer";
  layer.style.left = "0px";
  layer.style.top = "0px";
  setTransformData(layer, x, y, 0, 1);
  layer.tabIndex = 0;
  return layer;
}

function getGroupBoundingBox() {
  if (selectedLayers.size === 0) return null;
  
  const containerRect = canvasContainer.getBoundingClientRect();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  selectedLayers.forEach(layer => {
    const rect = layer.getBoundingClientRect();
    minX = Math.min(minX, rect.left - containerRect.left);
    minY = Math.min(minY, rect.top - containerRect.top);
    maxX = Math.max(maxX, rect.right - containerRect.left);
    maxY = Math.max(maxY, rect.bottom - containerRect.top);
  });
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}


function getTransformData(layer) {
  return {
    tx: parseFloat(layer.dataset.tx || 0),
    ty: parseFloat(layer.dataset.ty || 0),
    rot: parseFloat(layer.dataset.rot || 0),
    scale: parseFloat(layer.dataset.scale || 1)
  };
}

function setTransformData(layer, tx, ty, rot, scale) {
  layer.dataset.tx = tx;
  layer.dataset.ty = ty;
  layer.dataset.rot = rot;
  layer.dataset.scale = scale;
  layer.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`;
}

function getGroupCenter() {
  const rects = [...selectedLayers].map(layer => layer.getBoundingClientRect());
  const minX = Math.min(...rects.map(r => r.left));
  const maxX = Math.max(...rects.map(r => r.right));
  const minY = Math.min(...rects.map(r => r.top));
  const maxY = Math.max(...rects.map(r => r.bottom));
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}


// ---------- SELECT / DESELECT ----------
function selectLayer(layer, addToSelection = false) {
  // If not additive, clear existing selection
  if (!addToSelection) {
    selectedLayers.forEach(l => {
      l.classList.remove("selected-outline");
      removeHandles(l);
    });
    selectedLayers.clear();
  }

  // Toggle selection for additive mode
  if (selectedLayers.has(layer)) {
    if (addToSelection) {
      layer.classList.remove("selected-outline");
      removeHandles(layer);
      selectedLayers.delete(layer);
    }
  } else {
    selectedLayers.add(layer);
    layer.classList.add("selected-outline");
  }

  // Now manage handles
  removeGroupHandles();

  if (selectedLayers.size === 1) {
    // Single selection → show handles on that layer
    const single = [...selectedLayers][0];
    addHandles(single);
    selectedLayer = single;
  } else if (selectedLayers.size > 1) {
    // Multi-selection → remove handles from all, show group handles
    selectedLayers.forEach(l => removeHandles(l));
    selectedLayer = null;
    createGroupHandles();
    groupCenter = getGroupCenter();
  } else {
    // No selection → clear all
    selectedLayer = null;
  }
}

function deselectAllLayers() {
  selectedLayers.forEach(layer => {
    layer.classList.remove("selected-outline");
    removeHandles(layer);
  });
  selectedLayers.clear();
  removeGroupHandles();
  selectedLayer = null;
}



// Click empty canvas → deselect all
canvasContainer.addEventListener("mousedown", (e) => {
  if (e.target === canvasContainer) {
    deselectAllLayers();
  }
});

// ---------- HANDLES ----------
function addHandles(layer) {
  if (layer.querySelector(".handle")) return;

  const rot = document.createElement("div");
  rot.className = "handle rotate";
  rot.title = "Rotate";
  layer.appendChild(rot);
  attachRotateHandle(rot, layer);

  const scale = document.createElement("div");
  scale.className = "handle scale";
  scale.title = "Scale";
  layer.appendChild(scale);
  attachScaleHandle(scale, layer);

  positionHandles(layer);
}

function positionHandles(layer) {
  const rot = layer.querySelector(".handle.rotate");
  const scale = layer.querySelector(".handle.scale");
  if (!rot || !scale) return;

  const handleSize = 14;
  Object.assign(rot.style, {
    position: "absolute",
    top: `-${handleSize + 2}px`,
    left: "50%",
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    transform: "translateX(-50%)",
    borderRadius: "50%",
    background: "transparent",
    border: "2px solid #2563eb",
    cursor: "grab",
    zIndex: "10",
  });

  Object.assign(scale.style, {
    position: "absolute",
    bottom: `-${handleSize + 2}px`,
    right: `-${handleSize + 2}px`,
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    background: "#16a34a",
    cursor: "nwse-resize",
    zIndex: "10",
  });

  const layerScale = parseFloat(layer.dataset.scale) || 1;
  rot.style.transform += ` scale(${1 / layerScale})`;
  scale.style.transform = `scale(${1 / layerScale})`;
}

function removeHandles(layer) {
  layer.querySelectorAll(".handle").forEach(h => h.remove());
}

// ---------- GROUP HANDLES ----------
// ---------- CREATE GROUP HANDLES ----------
function createGroupHandles() {
  removeGroupHandles();
  const groupBox = getGroupBoundingBox();
  if (!groupBox) return;

  groupCenter = getGroupCenter();

  const groupHandleContainer = document.createElement("div");
  groupHandleContainer.className = "group-handles";
  canvasContainer.appendChild(groupHandleContainer);

  const rot = document.createElement("div");
  rot.className = "handle rotate group-handle";
  rot.title = "Rotate Group";
  groupHandleContainer.appendChild(rot);
  attachGroupRotateHandle(rot);

  const scale = document.createElement("div");
  scale.className = "handle scale group-handle";
  scale.title = "Scale Group";
  groupHandleContainer.appendChild(scale);
  attachGroupScaleHandle(scale);

  const handleSize = 14;
  Object.assign(groupHandleContainer.style, {
    position: "absolute",
    left: `${groupBox.x}px`,
    top: `${groupBox.y}px`,
    width: `${groupBox.width}px`,
    height: `${groupBox.height}px`,
    pointerEvents: "auto",
    cursor: "grab"
  });

  Object.assign(rot.style, {
    position: "absolute",
    top: `-${handleSize + 2}px`,
    left: "50%",
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    transform: "translateX(-50%)",
    borderRadius: "50%",
    background: "transparent",
    border: "2px solid #2563eb",
    cursor: "grab",
    pointerEvents: "auto",
    zIndex: "20",
  });

  Object.assign(scale.style, {
    position: "absolute",
    bottom: `-${handleSize + 2}px`,
    right: `-${handleSize + 2}px`,
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    background: "#16a34a",
    cursor: "nwse-resize",
    pointerEvents: "auto",
    zIndex: "20",
  });

  enableGroupDragging(); //  activate drag behavior
}


// ---------- GROUP DRAG ----------
function enableGroupDragging() {
  const groupHandleContainer = document.querySelector(".group-handles");
  if (!groupHandleContainer) return;

  groupHandleContainer.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    if (e.target.classList.contains("handle")) return; // skip rotate/scale handles

    // Start group drag
    activeAction = "drag";
    startMouse = { x: e.clientX, y: e.clientY };
    startData.clear();

    selectedLayers.forEach(layer => {
      startData.set(layer, {
        tx: parseFloat(layer.dataset.tx) || 0,
        ty: parseFloat(layer.dataset.ty) || 0,
        rot: parseFloat(layer.dataset.rot) || 0,
        scale: parseFloat(layer.dataset.scale) || 1
      });
    });

    document.body.style.userSelect = "none";
  });
}


function removeGroupHandles() {
  const groupHandles = canvasContainer.querySelector(".group-handles");
  if (groupHandles) groupHandles.remove();
}

// ---------- LAYER INTERACTION ----------
function makeSelectable(layer) {
  layer.addEventListener("mousedown", (e) => {
    if (e.target.closest(".handle")) return; // skip handles
    if (!e.currentTarget.classList.contains("layer")) return; // ensure it's the layer

    if (e.target.classList.contains("handle")) return;
    const addToSelection = e.ctrlKey || e.metaKey || e.shiftKey;
    selectLayer(layer, addToSelection);

    // Start group or single drag
    startMouse.x = e.clientX;
    startMouse.y = e.clientY;
    let isDragging = false;

    function onMouseMove(ev) {
      if (!isDragging && (Math.abs(ev.clientX - startMouse.x) > 3 || Math.abs(ev.clientY - startMouse.y) > 3)) {
        isDragging = true;
        startLayerInteraction(layer, e); //  triggers group drag too
      }
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      if (isDragging) activeAction = null;
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}


function startLayerInteraction(layer, e) {
  // Always handle both single and multiple selection
  activeAction = "drag";
  activeLayers = new Set(selectedLayers.size > 0 ? selectedLayers : [layer]);
  startMouse = { x: e.clientX, y: e.clientY };
  startData = new Map();

  activeLayers.forEach(l => {
    const data = {
      tx: parseFloat(l.dataset.tx) || 0,
      ty: parseFloat(l.dataset.ty) || 0,
      rot: parseFloat(l.dataset.rot) || 0,
      scale: parseFloat(l.dataset.scale) || 1
    };
    startData.set(l, data);
  });

  if (activeLayers.size > 1) {
    groupCenter = getGroupCenter();
  }

  document.body.style.userSelect = "none";
  e.stopPropagation();
}



function makeLayerInteractive(layer, contentEl) {
  makeSelectable(layer);
  if (!contentEl) return;
  
  if (contentEl.classList.contains("text-layer")) {
    contentEl.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      contentEl.focus();
    });
    contentEl.style.cursor = "grab";
    contentEl.addEventListener("mousedown", (e) => {
      if (document.activeElement === contentEl) e.stopPropagation();
    });
  }

  if (contentEl.tagName === "IMG") {
    contentEl.addEventListener("dragstart", (e) => e.preventDefault());
  }
}

// ---------- ROTATE & SCALE HANDLES ----------
function attachRotateHandle(handle, layer) {
  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    activeLayer = layer;
    activeAction = "rotate";
    const rect = layer.getBoundingClientRect();
    groupCenter.x = rect.left + rect.width / 2;
    groupCenter.y = rect.top + rect.height / 2;
    startAngle = Math.atan2(e.clientY - groupCenter.y, e.clientX - groupCenter.x);
    startData.clear();
    startData.set(layer, {
      tx: parseFloat(layer.dataset.tx) || 0,
      ty: parseFloat(layer.dataset.ty) || 0,
      rot: parseFloat(layer.dataset.rot) || 0,
      scale: parseFloat(layer.dataset.scale) || 1,
    });
    document.body.style.userSelect = "none";
    layer.style.cursor = "grab";
    e.preventDefault();
  });
}

function attachScaleHandle(handle, layer) {
  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    activeLayer = layer;
    activeAction = "scale";
    const rect = layer.getBoundingClientRect();
    groupCenter.x = rect.left + rect.width / 2;
    groupCenter.y = rect.top + rect.height / 2;
    startDist = Math.hypot(e.clientX - groupCenter.x, e.clientY - groupCenter.y);
    startData.clear();
    startData.set(layer, {
      tx: parseFloat(layer.dataset.tx) || 0,
      ty: parseFloat(layer.dataset.ty) || 0,
      rot: parseFloat(layer.dataset.rot) || 0,
      scale: parseFloat(layer.dataset.scale) || 1,
      width: layer.querySelector(".content")?.offsetWidth || 0,
      height: layer.querySelector(".content")?.offsetHeight || 0,
    });
    document.body.style.userSelect = "none";
    layer.style.cursor = "grab";
    e.preventDefault();
  });
}

// ---------- GROUP ROTATE & SCALE HANDLES ----------
function attachGroupRotateHandle(handle) {
  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    activeAction = "rotate";
    groupCenter = getGroupCenter();

    startAngle = Math.atan2(e.clientY - groupCenter.y, e.clientX - groupCenter.x);
    startData.clear();
    selectedLayers.forEach(layer => {
      startData.set(layer, {
        tx: parseFloat(layer.dataset.tx) || 0,
        ty: parseFloat(layer.dataset.ty) || 0,
        rot: parseFloat(layer.dataset.rot) || 0,
        scale: parseFloat(layer.dataset.scale) || 1,
      });
    });
    document.body.style.userSelect = "none";
    e.preventDefault();
  });
}

function attachGroupScaleHandle(handle) {
  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    activeAction = "scale";
    groupCenter = getGroupCenter();

    startDist = Math.hypot(e.clientX - groupCenter.x, e.clientY - groupCenter.y);
    startData.clear();
    selectedLayers.forEach(layer => {
      startData.set(layer, {
        tx: parseFloat(layer.dataset.tx) || 0,
        ty: parseFloat(layer.dataset.ty) || 0,
        rot: parseFloat(layer.dataset.rot) || 0,
        scale: parseFloat(layer.dataset.scale) || 1,
        width: layer.querySelector(".content")?.offsetWidth || 0,
        height: layer.querySelector(".content")?.offsetHeight || 0,
      });
    });
    document.body.style.userSelect = "none";
    e.preventDefault();
  });
}

// ---------- GLOBAL MOUSE MOVE ----------
document.addEventListener("mousemove", (e) => {
  if (!activeAction) return;

  
  switch (activeAction) {
    case "drag":
  selectedLayers.forEach(layer => {
    const data = startData.get(layer);
    setTransformData(
      layer,
      data.tx + (e.clientX - startMouse.x),
      data.ty + (e.clientY - startMouse.y),
      data.rot,
      data.scale
    );
  });
  if (selectedLayers.size > 1) createGroupHandles();
  break;


   case "rotate":
  // Use locked groupCenter captured on mousedown
  const angle = Math.atan2(e.clientY - groupCenter.y, e.clientX - groupCenter.x);
  let deltaAngle = (angle - startAngle) * (180 / Math.PI);

  // Wraparound fix
  if (deltaAngle > 180) deltaAngle -= 360;
  if (deltaAngle < -180) deltaAngle += 360;

  selectedLayers.forEach(layer => {
    const data = startData.get(layer);
    let newRot = data.rot + deltaAngle;
    newRot = Math.round(newRot / 5) * 5; // Snap every 5°

    if (selectedLayers.size > 1) {
      const content = layer.querySelector(".content");
      const w = content?.offsetWidth || 0;
      const h = content?.offsetHeight || 0;

      const layerCenterX = data.tx + w / 2;
      const layerCenterY = data.ty + h / 2;

      const offsetX = layerCenterX - groupCenter.x;
      const offsetY = layerCenterY - groupCenter.y;

      const rad = deltaAngle * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const rotatedX = offsetX * cos - offsetY * sin;
      const rotatedY = offsetX * sin + offsetY * cos;

      const newTx = data.tx + (rotatedX - offsetX);
      const newTy = data.ty + (rotatedY - offsetY);

      setTransformData(layer, newTx, newTy, newRot, data.scale);
    } else {
      setTransformData(layer, data.tx, data.ty, newRot, data.scale);
    }
  });

  // Only reposition single layer handles during rotation
  if (selectedLayers.size === 1) positionHandles(activeLayer);
  break;



case "scale":
  const dist = Math.hypot(e.clientX - groupCenter.x, e.clientY - groupCenter.y);
  const factor = startDist > 0 ? dist / startDist : 1;

  selectedLayers.forEach(layer => {
    const data = startData.get(layer);
    const content = layer.querySelector(".content");
    const w = content?.offsetWidth || 0;
    const h = content?.offsetHeight || 0;

    if (e.shiftKey && selectedLayers.size === 1) {
      const newWidth = Math.max(10, data.width * factor);
      if(content) content.style.width = newWidth + "px";
    } else {
      let newScale = Math.max(0.1, data.scale * factor);
      let newTx = data.tx;
      let newTy = data.ty;

      if (selectedLayers.size > 1) {
        // Scale relative to group center (dataset-based)
        const layerCenterX = data.tx + w / 2;
        const layerCenterY = data.ty + h / 2;

        const offsetX = layerCenterX - groupCenter.x;
        const offsetY = layerCenterY - groupCenter.y;

        const newX = offsetX * factor;
        const newY = offsetY * factor;

        newTx = data.tx + (newX - offsetX);
        newTy = data.ty + (newY - offsetY);
      }

      setTransformData(layer, newTx, newTy, data.rot, newScale);
    }
  });

  if (selectedLayers.size > 1) {
    removeGroupHandles();
    createGroupHandles();
  }

  if (selectedLayers.size === 1) positionHandles(activeLayer);
  break;

  }
});

// ---------- GLOBAL MOUSE UP ----------
document.addEventListener("mouseup", () => {
  if (!activeLayer && !activeAction) return;
  selectedLayers.forEach(layer => layer.style.cursor = "grab");
  activeLayer = null;
  activeAction = null;
  document.body.style.userSelect = "";
});




































function wrapTextInSpans(container) {
  container.style.whiteSpace = "pre-wrap";
  container.style.wordWrap = "break-word";

  const font = container.style.fontFamily || "Arial";
  const color = container.style.color || "#000000";
  const bgColor = container.style.backgroundColor || "transparent";
  const lineHeight = container.style.lineHeight || "1";
  const letterSpacing = container.style.letterSpacing || "0px";
  const filter = container.style.filter || "";
  const match = filter.match(/blur\(([^)]+)\)/);
  const blur = match ? match[1] : "0px";

  const lines = container.innerText.split("\n");
  container.innerHTML = "";

  lines.forEach((line, lineIndex) => {
    for (let char of line) {
      const span = document.createElement("span");
      span.innerText = char;
      span.style.fontFamily = font;
      span.style.color = color;
      span.style.backgroundColor = bgColor;
      span.style.lineHeight = lineHeight;
      span.style.letterSpacing = letterSpacing;
      span.style.filter = `blur(${blur})`;

      //  Key change
      span.style.display = "inline";  
      container.appendChild(span);
    }
    if (lineIndex < lines.length - 1) {
      container.appendChild(document.createElement("br"));
    }
  });
}


function makeTextLayerInteractive(txt) {
  // Initially wrap existing text
  wrapTextInSpans(txt);

  txt.addEventListener("input", () => {
    wrapTextInSpans(txt);
  });
}
function updateTextStyle(property, value) {
  const textLayer = selectedLayer?.querySelector(".text-layer");
  if (!textLayer) return;

  if (property === "blur") {
    const existing = textLayer.style.filter.replace(/blur\([^)]*\)/, "").trim();
    textLayer.style.filter = `${existing} blur(${value}px)`.trim();
    wrapTextInSpans(textLayer);
    return;
  }

  switch (property) {
    case "color":
      textLayer.style.color = value;
      break;
    case "backgroundColor":
      textLayer.style.backgroundColor = value;
      break;
    case "fontFamily":
      textLayer.style.fontFamily = value;
      break;
    case "lineHeight":
      textLayer.style.lineHeight = value;
      break;
    case "letterSpacing":
      // Ensure proper unit and consistency
      const spacingValue = typeof value === "string" && value.includes("px")
        ? value
        : value + "px";
      textLayer.style.letterSpacing = spacingValue;
      break;
  }

  wrapTextInSpans(textLayer);
}







fontSelectMenu.addEventListener("change", () => {
  updateTextStyle("fontFamily", fontSelectMenu.value);
});

lineHeightInput.addEventListener("input", () => {
  updateTextStyle("lineHeight", lineHeightInput.value);
});
letterSpacingInput.addEventListener("input", () => {
  updateTextStyle("letterSpacing", letterSpacingInput.value);
});

blurInput.addEventListener("input", () => {
  updateTextStyle("blur", blurInput.value);
});




textColorPicker.addEventListener("input", () => {
  updateTextStyle("color", textColorPicker.value);
});

textBgColorPicker.addEventListener("input", () => {
  updateTextStyle("backgroundColor", textBgColorPicker.value);
});


// ---------- CREATE TEXT LAYER ----------
function createTextLayer(x = 100, y = 100, initialText = "Type here") {
  const layer = createLayer(x, y);
  const content = document.createElement("div");
  content.className = "content text-layer";
  content.contentEditable = true;
  content.innerText = initialText;
  content.style.fontFamily = "Arial";
  content.style.color = "#000000";
  content.style.backgroundColor = "transparent";
  content.style.lineHeight = "1";
  content.style.letterSpacing = "0px";
  content.style.filter = "blur(0px)";
  wrapTextInSpans(content);

  layer.appendChild(content);
  canvasContainer.appendChild(layer);
  makeLayerInteractive(layer, content);
  selectLayer(layer);
  content.focus();

  return layer;
}


addTextBtn.addEventListener("click", () => {
  createTextLayer();
});


// ---------- IMAGE HANDLING ----------
addImageBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 1 * 1024 * 1024; // 1MB

    // Create and show a temporary "processing" message
    const processingMsg = document.createElement("div");
    Object.assign(processingMsg.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "rgba(0,0,0,0.8)",
      color: "white",
      padding: "12px 20px",
      borderRadius: "8px",
      fontSize: "16px",
      zIndex: "9999",
      textAlign: "center",
      whiteSpace: "pre-line",
    });
    processingMsg.textContent = "Converting and compressing image, please wait...";
    document.body.appendChild(processingMsg);

    try {
      // Convert to PNG if needed (HEIC / WEBP)
      const convertedBase64 = await convertToPng(file);

      // Calculate converted size
      const convertedSizeMB = (
        convertedBase64.length * (3 / 4) / (1024 * 1024)
      ).toFixed(2);

      // Check size after conversion
      if (convertedSizeMB > 1) {
        // Compress the converted PNG itself
        compressBase64Image(
          convertedBase64,
          0.8,
          (compressedBase64, compressedSizeMB) => {
            createImageLayer(compressedBase64, compressedSizeMB);

            // Update message to show final size
            processingMsg.textContent = ` Done!\nFinal size: ${compressedSizeMB} MB`;
            setTimeout(() => processingMsg.remove(), 1500);
          }
        );
      } else {
        createImageLayer(convertedBase64, convertedSizeMB);

        // Update message to show final size
        processingMsg.textContent = ` Done!\nFinal size: ${convertedSizeMB} MB`;
        setTimeout(() => processingMsg.remove(), 1500);
      }
    } catch (err) {
      console.error("Image conversion or processing failed:", err);
      alert("Couldn't load image. Please try another format.");
      processingMsg.remove(); //  remove message even on error
    }
  };

  input.click();
});


// ---------- CREATE IMAGE LAYER ----------
function createImageLayer(base64, sizeMB) {
  const layer = createLayer(150, 150);
  const img = document.createElement("img");
  img.className = "content w-32";
  img.src = base64;
  img.draggable = false;
  layer.dataset.imageSizeMB = sizeMB;

  layer.appendChild(img);
  canvasContainer.appendChild(layer);

  makeLayerInteractive(layer, img);
  selectLayer(layer);
}


// ---------- CONVERSION HELPERS ----------
async function convertToPng(file) {
  const type = (file.type || "").toLowerCase();

  // --- Normal images (already compatible)
  if (!type.includes("heic") && !type.includes("webp")) {
    return await fileToDataURL(file);
  }

  // --- WEBP conversion
  if (type.includes("webp")) {
    const dataURL = await fileToDataURL(file);
    return await imageToPngDataURL(dataURL);
  }

  // --- HEIC conversion
  if (type.includes("heic")) {
    if (typeof heic2any === "undefined") {
      await loadHeic2Any();
    }

    try {
      let blob = await heic2any({ blob: file, toType: "image/png" });

      // 🩹 Normalize possible array response
      if (Array.isArray(blob)) blob = blob[0];

      if (!(blob instanceof Blob)) {
        throw new Error("Invalid HEIC conversion result");
      }

      //  Verify output is a valid image
      const testUrl = URL.createObjectURL(blob);
      const isValid = await validateImageBlob(testUrl);
      URL.revokeObjectURL(testUrl);

      if (!isValid) throw new Error("HEIC blob not a valid image");

      return await blobToDataURL(blob);
    } catch (err) {
      console.error("HEIC conversion failed:", err);
      throw err;
    }
  }

  // --- Fallback
  throw new Error("Unsupported image format");
}


// ---------- GENERIC HELPERS ----------
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function imageToPngDataURL(dataURL) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = dataURL;
  });
}

function validateImageBlob(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

function loadHeic2Any() {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/heic2any@0.0.3/dist/heic2any.min.js";
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}


// ---------- COMPRESS BASE64 IMAGE ----------
function compressBase64Image(base64, quality = 0.8, callback) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const maxDimension = 1280;
    let { width, height } = img;
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height *= maxDimension / width;
        width = maxDimension;
      } else {
        width *= maxDimension / height;
        height = maxDimension;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const compressedBase64 = canvas.toDataURL("image/png", quality);
    const compressedSizeMB = (
      compressedBase64.length * (3 / 4) / (1280 * 1280)
    ).toFixed(2);

    callback(compressedBase64, compressedSizeMB);
  };
  img.onerror = () => alert("Failed to load image for compression.");
  img.src = base64;
}


// ---------- BACKGROUND COLOR ----------
bgColorPicker.addEventListener("input", (e) => {
  canvasContainer.style.backgroundColor = e.target.value;
});








// ---------- KEYBOARD DELETE ----------
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Backspace' && e.key !== 'Delete') return;
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
  if (!selectedLayer) return;

  e.preventDefault();
  if (confirm('Delete the selected element?')) {
    removeHandles(selectedLayer);
    selectedLayer.remove();
    selectedLayer = null;

  }
});


// ---------- CONTEXT MENU ----------
// DOM references
const blendModeSelect = document.getElementById("blendModeSelect");
const blendModeArrowIcon = document.getElementById("blendModeArrowIcon");

// Rotate arrow when the select is focused (like opening accordion)
blendModeSelect.addEventListener("focus", () => {
  blendModeArrowIcon.classList.add("rotate-180");
});

blendModeSelect.addEventListener("blur", () => {
  blendModeArrowIcon.classList.remove("rotate-180");
});

// Update layer blend mode on change
blendModeSelect.addEventListener("change", (e) => {
  const selectedBlendMode = e.target.value;

  if (activeLayer) {
    activeLayer.style.mixBlendMode = selectedBlendMode;
    highlightActiveBlendMode(selectedBlendMode);
  }
});







toggleTextOptions.addEventListener("click", () => {
  textOptionsOpen = !textOptionsOpen;
  textOptions.style.maxHeight = textOptionsOpen ? textOptions.scrollHeight + "px" : "0";
  arrowIcon.style.transform = textOptionsOpen ? "rotate(180deg)" : "rotate(0)";
});

canvasContainer.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const layer = e.target.closest(".layer");
  if (!layer) {
    hideContextMenu();
    return;
  }
  // Force single selection for context menu
  selectLayer(layer, false);  

  positionContextMenu(e);
  updateContextMenuState(layer);
});

function positionContextMenu(e) {
  const menuWidth = 220, menuHeight = 260;
  let x = e.pageX, y = e.pageY;
  if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
  if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;
  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
  contextMenu.classList.remove("hidden");
}

function updateContextMenuState(layer) {
  if (!layer) return;

  activeLayer = layer; // store for later

  // --- Identify layer type ---
  const textLayer = layer.querySelector(".text-layer");
  const shapeLayer = layer.querySelector(".shape-layer");
  const imageLayer = layer.querySelector("img, .image-layer"); // generic image selector

  const layerTypes = {
    text: !!textLayer,
    shape: !!shapeLayer,
    image: !!imageLayer
  };

  // --- Context menu options ---
  contextMenu.querySelector('[data-action="edit"]').style.display = layerTypes.text ? "block" : "none";

  // --- Accordion visibility ---
  imageAccordion.classList.toggle("hidden", !layerTypes.image);
  textAccordion.classList.toggle("hidden", !layerTypes.text);
  shapeAccordion.classList.toggle("hidden", !layerTypes.shape);
  blendModeAccordion.classList.toggle("hidden", !(layerTypes.text || layerTypes.shape || layerTypes.image));

  // --- Reset accordions ---
  resetAccordion(imageOptions, imageArrowIcon);
  resetAccordion(textOptions, arrowIcon);
  resetAccordion(shapeOptions, shapeArrowIcon);

  // --- IMAGE ACCORDION ---
  if (layerTypes.image) {
    updateImageSliders(layer);
    imageAccordion.classList.remove("hidden");
    resetAccordion(imageOptions, imageArrowIcon);
  } else {
    imageAccordion.classList.add("hidden");
  }



  // --- TEXT SYNC ---
  if (layerTypes.text) {
    fontSelectMenu.value = textLayer.style.fontFamily?.replace(/['"]/g, "") || "Arial";
    textColorPicker.value = rgbToHex(textLayer.style.color || "#000000");
    textBgColorPicker.value = rgbToHex(textLayer.style.backgroundColor || "#ffffff");
  }

  // --- SHAPE SYNC ---
  if (layerTypes.shape) {
    const computed = getComputedStyle(shapeLayer);
    shapeTypeSelect.value =
      shapeLayer.classList.contains("circle")
        ? "circle"
        : shapeLayer.classList.contains("triangle")
        ? "triangle"
        : shapeLayer.offsetWidth === shapeLayer.offsetHeight
        ? "square"
        : "rectangle";
    shapeColorPicker.value = rgbToHex(computed.backgroundColor || "#2563eb");
  }

  // --- BLEND MODE SYNC (text, shape, image) ---
  if (layerTypes.text || layerTypes.shape || layerTypes.image) {
    const blendMode = layer.style.mixBlendMode || "normal";
    blendModeSelect.value = blendMode;
    highlightActiveBlendMode(blendMode);
  }
}


// Helper
function resetAccordion(optionsEl, arrowEl) {
  if (!optionsEl || !arrowEl) return;
  optionsEl.style.maxHeight = "0";
  arrowEl.style.transform = "rotate(0deg)";
}



document.addEventListener("click", (e) => {
  if (!contextMenu.contains(e.target)) hideContextMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideContextMenu();
});

function hideContextMenu() {
  contextMenu.classList.add("hidden");
}

contextMenu.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  if (!action || !selectedLayer) return;

  hideContextMenu();

  const txt = selectedLayer.querySelector(".text-layer");

  switch (action) {
    case "edit":
      txt?.focus();
      break;

    case "duplicate": {
      const clone = selectedLayer.cloneNode(true);
      const tx = (parseFloat(selectedLayer.dataset.tx) || 0) + 30;
      const ty = (parseFloat(selectedLayer.dataset.ty) || 0) + 30;
      setTransformData(clone, tx, ty, parseFloat(selectedLayer.dataset.rot), parseFloat(selectedLayer.dataset.scale));
      canvasContainer.appendChild(clone);
      makeLayerInteractive(clone, clone.querySelector(".content"));
      selectLayer(clone);
      break;
    }

    case "delete":
      selectedLayer.remove();
      selectedLayer = null;
      break;

    case "bringFront":
      canvasContainer.appendChild(selectedLayer);
      break;

    case "sendBack":
      canvasContainer.insertBefore(selectedLayer, canvasContainer.firstChild);
      break;

    case "textBgTransparent":
      if (txt) updateTextStyle("backgroundColor", "transparent");
      break;
  }
});


// ---------- TEXT STYLE CONTROLS ----------
fontSelectMenu.addEventListener("change", () => {
  const txt = selectedLayer?.querySelector(".text-layer");
  if (txt) txt.style.fontFamily = fontSelectMenu.value;
});
textColorPicker.addEventListener("input", () => {
  const txt = selectedLayer?.querySelector(".text-layer");
  if (txt) txt.style.color = textColorPicker.value;
});
textBgColorPicker.addEventListener("input", () => {
  const txt = selectedLayer?.querySelector(".text-layer");
  if (txt) txt.style.backgroundColor = textBgColorPicker.value;
});

[...fontSelectMenu.options].forEach((opt) => {
  opt.style.fontFamily = opt.value;
  opt.style.fontSize = "14px";
});

// ---------- UTILITIES ----------
function rgbToHex(rgb) {
  if (!rgb) return "#000000";
  const match = rgb.match(/\d+/g);
  if (!match) return rgb;
  return "#" + match.slice(0, 3).map(v => ("0" + parseInt(v).toString(16)).slice(-2)).join("");
}


toggleImageOptions.addEventListener("click", () => {
  const expanded = imageOptions.style.maxHeight && imageOptions.style.maxHeight !== "0px";
  imageOptions.style.maxHeight = expanded ? "0" : imageOptions.scrollHeight + "px";
  imageArrowIcon.style.transform = expanded ? "rotate(0deg)" : "rotate(180deg)";
});


toggleShapeOptions.addEventListener("click", () => {
  shapeOptionsOpen = !shapeOptionsOpen;
  shapeOptions.style.maxHeight = shapeOptionsOpen ? shapeOptions.scrollHeight + "px" : "0";
  shapeArrowIcon.style.transform = shapeOptionsOpen ? "rotate(180deg)" : "rotate(0)";
});


addShapeBtn.addEventListener("click", () => {
  createShapeLayer();
});

function createShapeLayer(x = 100, y = 100) {
  const layer = createLayer(x, y);
  const shape = document.createElement("div");
  shape.className = "content shape-layer";

  const type = shapeTypeSelect.value;
  const color = shapeColorPicker.value;

  // Default size
  let width = 120;
  let height = 80;

  switch (type) {
    case "square":
      width = height = 100;
      shape.style.width = `${width}px`;
      shape.style.height = `${height}px`;
      shape.style.backgroundColor = color;
      break;

    case "circle":
      width = height = 100;
      shape.style.width = `${width}px`;
      shape.style.height = `${height}px`;
      shape.style.borderRadius = "50%";
      shape.style.backgroundColor = color;
      break;

    case "triangle":
      width = 100;
      height = 100;
      shape.style.width = "0";
      shape.style.height = "0";
      shape.style.borderLeft = `${width / 2}px solid transparent`;
      shape.style.borderRight = `${width / 2}px solid transparent`;
      shape.style.borderBottom = `${height}px solid ${color}`;
      shape.style.background = "transparent";
      break;

    default: // rectangle
      shape.style.width = `${width}px`;
      shape.style.height = `${height}px`;
      shape.style.backgroundColor = color;
  }

  layer.appendChild(shape);
  canvasContainer.appendChild(layer);

  makeLayerInteractive(layer, shape);
  selectLayer(layer);

  return layer;
}

function updateShapeType(type) {
  if (!selectedLayer) return;
  const shape = selectedLayer.querySelector(".shape-layer");
  if (!shape) return;

  const color = shapeColorPicker.value;

  // Reset all styles
  shape.style.border = "";
  shape.style.width = "";
  shape.style.height = "";
  shape.style.borderRadius = "";
  shape.style.background = "";
  shape.style.backgroundColor = "";

  switch (type) {
    case "square":
      shape.style.width = "100px";
      shape.style.height = "100px";
      shape.style.backgroundColor = color;
      break;

    case "circle":
      shape.style.width = "100px";
      shape.style.height = "100px";
      shape.style.backgroundColor = color;
      shape.style.borderRadius = "50%";
      break;

    case "triangle":
      shape.style.width = "0";
      shape.style.height = "0";
      shape.style.borderLeft = "50px solid transparent";
      shape.style.borderRight = "50px solid transparent";
      shape.style.borderBottom = `100px solid ${color}`;
      shape.style.background = "transparent";
      break;

    default: // rectangle
      shape.style.width = "120px";
      shape.style.height = "80px";
      shape.style.backgroundColor = color;
  }
}

function updateShapeColor(color) {
  if (!selectedLayer) return;
  const shape = selectedLayer.querySelector(".shape-layer");
  if (!shape) return;

  if (shape.style.borderBottom.includes("solid") && shapeTypeSelect.value === "triangle") {
    shape.style.borderBottom = `${shape.offsetHeight}px solid ${color}`;
  } else {
    shape.style.backgroundColor = color;
  }
}

shapeTypeSelect.addEventListener("change", (e) => {
  updateShapeType(e.target.value);
});

shapeColorPicker.addEventListener("input", (e) => {
  updateShapeColor(e.target.value);
});

blendModeSelect.addEventListener("change", (e) => {
  if (!selectedLayer) return;
  const mode = e.target.value;
  selectedLayer.style.mixBlendMode = mode;
  highlightActiveBlendMode(mode);
});

function highlightActiveBlendMode(mode) {
  [...blendModeSelect.options].forEach(opt => {
    opt.style.fontWeight = opt.value === mode ? "bold" : "normal";
  });
}



// RELOADS PAGE
clearBtn.addEventListener("click", () => {
  const confirmClear = confirm("Are you sure you want to clear everything and reload?");
  if (confirmClear) {
    location.reload();
  }
});


