// ======================================================
// ELEMENT CACHE
// ======================================================

const el = {
  canvas: document.getElementById('canvas'),
  hero: document.getElementById('heroImage'),
  overlay: document.getElementById('imageOverlay'),
  toggleCanvasSize: document.getElementById("toggleCanvasSize"),

  gridStyle: document.getElementById('gridStyle'),
  gridOpacity: document.getElementById('gridOpacity'),
  gridOpacityVal: document.getElementById('gridOpacityVal'),

  dropzone: document.getElementById('dropzone'),
  imageInput: document.getElementById('imageInput'),

  imageBlendMode: document.getElementById("imageBlendMode"),

  globalText: document.getElementById('globalText'),

  textColor: document.getElementById('textColor'),
  highlightColor: document.getElementById('highlightColor'),

  highlightOpacity: document.getElementById('highlightOpacity'),
  highlightOpacityVal: document.getElementById('highlightOpacityVal'),

fontFamily: document.getElementById("fontFamily"),
  fontSize: document.getElementById('fontSize'),
  sizeVal: document.getElementById('sizeVal'),

  lineHeight: document.getElementById('lineHeight'),
  lhVal: document.getElementById('lhVal'),

  letterSpacing: document.getElementById('letterSpacing'),
  lsVal: document.getElementById('lsVal'),

  wordSpacing: document.getElementById('wordSpacing'),
  wsVal: document.getElementById('wsVal'),

  bold: document.getElementById('bold'),
  italic: document.getElementById('italic'),
  underline: document.getElementById('underline'),

  coverBtn: document.getElementById('coverBtn'),
  containBtn: document.getElementById('containBtn'),

  leftBtn: document.getElementById('leftBtn'),
  centerBtn: document.getElementById('centerBtn'),
  rightBtn: document.getElementById('rightBtn'),

  bgPicker: document.getElementById('bgPicker'),

  overlayColor: document.getElementById('overlayColor'),
  overlayOpacity: document.getElementById('overlayOpacity'),
  overlayOpacityVal: document.getElementById('overlayOpacityVal'),

  highlightModeBtn: document.getElementById('highlightModeBtn'),

  imageTarget: document.getElementById('imageTarget'),

  imageScale: document.getElementById("imageScale"),
  scaleVal: document.getElementById("scaleVal"),
};

// cache

el.posX = document.getElementById('posX');
el.posY = document.getElementById('posY');

el.xVal = document.getElementById('xVal');
el.yVal = document.getElementById('yVal');

el.posR = document.getElementById('posR');
el.rVal = document.getElementById('rVal');


el.svgW = document.getElementById("svgW");
el.svgH = document.getElementById("svgH");

el.svgX1 = document.getElementById("svgX1");
el.svgX2 = document.getElementById("svgX2");

el.svgY1 = document.getElementById("svgY1");
el.svgY2 = document.getElementById("svgY2");

el.svgRotation = document.getElementById("svgRotation");

el.svgStrokeWidth = document.getElementById("svgStrokeWidth");

el.svgOpacity = document.getElementById("svgOpacity");

el.customSvgControls = document.getElementById("customSvgControls");
// ======================================================
// TEXT ELEMENTS
// ======================================================

const textMap = {
  ec: document.getElementById('ec'),
  subheadline: document.getElementById('subheadline'),
  issue: document.getElementById('issue'),
  headline: document.getElementById('headline'),
  editorial: document.getElementById('editorial'),
  description: document.getElementById('description'),
  helloworld: document.getElementById('helloworld')
};

const targetLabels = {};

document.querySelectorAll(".tgt").forEach(cb => {

    const label =
        cb.parentElement.querySelector(".target-label");

    if (label) {
        targetLabels[cb.value] = label;
    }

});

function updateTargetLabels() {

    Object.keys(targetLabels).forEach(key => {

        const text =
            state.rawText[key] || "";

        const label =
            text
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 12);

        targetLabels[key].textContent =
            label || key;

    });

}
// ======================================================
// STATE
// ======================================================

const state = {
  selected: new Set(),
  activeTarget: null,

  gridOpacity: 0.5,

  highlightPadding: {
    y: 0.0,
    x: 0.1
  },

  highlightMode: 'css',
  highlightOpacity: 0,

  rawText: {},

  position: {},

  imagePosition: {
    x: 0,
    y: 0,
    r: 0,
    scale: 1,
    blendMode: "normal"
  },

  fontFamily: {}
};


// toggle canvas size
const canvasSizes = {
    portrait: {
        width: "540px",
        height: "960px"
    },
    landscape: {
        width: "1920px",
        height: "1080px"
    }
};

el.canvas.style.width = canvasSizes.portrait.width;
el.canvas.style.height = canvasSizes.portrait.height;
el.canvas.style.background = "#111";

let mode = "portrait";

function updateCanvasSize() {

    const size = canvasSizes[mode];

    el.canvas.style.width = size.width;
    el.canvas.style.height = size.height;

     el.toggleCanvasSize.textContent =
        mode === "portrait"
            ? "Landscape (1920x1080px)"
            : "Portrait (540x960px)";

}

el.toggleCanvasSize.addEventListener("click", () => {

    mode = mode === "portrait"
        ? "landscape"
        : "portrait";

    updateCanvasSize();

});
// ======================================================
// INIT STATE
// ======================================================

Object.keys(textMap).forEach(key => {

  state.position[key] = {
    x: 0,
    y: 0,
    r: 0
  };
  
  state.fontFamily[key] = "Helvetica";

  state.rawText[key] =
    (textMap[key]?.textContent || '').trim();

});

updateTargetLabels();

// ======================================================
// HELPERS
// ======================================================

function applyToSelected(fn) {

  state.selected.forEach(key => {

    const node = textMap[key];

    if (node) fn(node, key);

  });

}


function setActiveTarget(key) {

  state.activeTarget = key;

  const node = textMap[key];

  if (!node) return;

el.fontFamily.value =
    state.fontFamily[key];

  el.globalText.value =
    state.rawText[key] || '';

  const pos = state.position[key];

  el.posX.value = pos.x;
  el.posY.value = pos.y;
  el.posR.value = pos.r;

  el.xVal.textContent = pos.x;
  el.yVal.textContent = pos.y;
  el.rVal.textContent = pos.r;

}


function updateButtonGroup(buttons, activeButton) {

  buttons.forEach(btn => {
    btn.className =
      'px-3 py-2 rounded bg-neutral-800';
  });

  activeButton.className =
    'px-3 py-2 rounded bg-white text-black';

}


function hexToRgb(hex) {

  const v = hex.replace('#', '');

  const bigint = parseInt(v, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };

}


function getHighlightColor() {

  const rgb =
    hexToRgb(el.highlightColor.value);

  const a =
    Math.max(
      0,
      Math.min(1, state.highlightOpacity)
    );

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;

}


// ======================================================
// POSITION HELPERS
// ======================================================

function applyPosition(node, key) {

  const pos = state.position[key];

  node.style.transform =
    `translate(${pos.x}px, ${pos.y}px) rotate(${pos.r}deg)`;

}


function applyImagePosition() {

  const pos =
    state.imagePosition;

  if (
    el.hero.classList.contains('object-cover')
  ) {

    el.hero.style.objectPosition =
      `calc(50% + ${pos.x}px) calc(50% + ${pos.y}px)`;

    el.hero.style.transform =
    `scale(${pos.scale}) rotate(${pos.r}deg)`;

    return;

  }

  el.hero.style.objectPosition =
    'center center';

  el.hero.style.transform =
    `translate(${pos.x}px, ${pos.y}px)
     scale(${pos.scale})
     rotate(${pos.r}deg)`;

  el.hero.style.mixBlendMode =
    state.imagePosition.blendMode;
}


function updatePositionFromSliders() {

  const x =
    parseInt(el.posX.value, 10);

  const y =
    parseInt(el.posY.value, 10);

  const r =
    parseInt(el.posR.value, 10);

  el.xVal.textContent = x;
  el.yVal.textContent = y;
  el.rVal.textContent = r;

  // IMAGE TARGET

  if (el.imageTarget.checked) {

    state.imagePosition.x = x;
    state.imagePosition.y = y;
    state.imagePosition.r = r;

    applyImagePosition();

    return;

  }

  // TEXT TARGETS

  applyToSelected((node, key) => {

    state.position[key].x = x;
    state.position[key].y = y;
    state.position[key].r = r;

    applyPosition(node, key);

  });

}


el.posX.addEventListener(
  'input',
  updatePositionFromSliders
);

el.posY.addEventListener(
  'input',
  updatePositionFromSliders
);

el.posR.addEventListener(
  'input',
  updatePositionFromSliders
);


// ======================================================
// HIGHLIGHT SYSTEM
// ======================================================

function resetHighlight(node) {

  node.replaceChildren();

  node.style.background = '';
  node.style.display = '';
  node.style.padding = '';

}


function buildLineHighlight(node, text) {

  const lines =
    text.split('\n');

  const frag =
    document.createDocumentFragment();

  lines.forEach((line, index) => {

    const span =
      document.createElement('span');

    span.className =
      'line-highlight';

    span.textContent =
      line || ' ';

    span.style.display =
      'inline-block';

    span.style.padding =
      `${state.highlightPadding.y}em ${state.highlightPadding.x}em`;

    span.style.margin =
      '2px 0';

    span.style.background =
      'var(--highlight-color)';

    frag.appendChild(span);

    if (index < lines.length - 1) {
      frag.appendChild(
        document.createElement('br')
      );
    }

  });

  node.replaceChildren(frag);

}


function buildCssHighlight(node, text) {

  node.textContent = text;

  node.style.background =
    'var(--highlight-color)';

  node.style.display =
    'inline-block';

  node.style.padding =
    `${state.highlightPadding.y}em ${state.highlightPadding.x}em`;

}


function applyHighlight(node, key) {

  const text =
    state.rawText[key] || '';

  const color =
    getHighlightColor();

  node.style.setProperty(
    '--highlight-color',
    color
  );

  if (state.highlightMode === 'css') {

    buildCssHighlight(node, text);

    return;

  }

  node.style.background =
    'transparent';

  node.style.display =
    'block';

  node.style.padding =
    '0';

  buildLineHighlight(node, text);

}


function refreshHighlights() {

  applyToSelected((node, key) => {
    applyHighlight(node, key);
  });

}


// ======================================================
// RAF THROTTLING
// ======================================================

let highlightFrame = null;

function scheduleHighlightRefresh() {

  if (highlightFrame) return;

  highlightFrame =
    requestAnimationFrame(() => {

      refreshHighlights();

      highlightFrame = null;

    });

}


// ======================================================
// POSITION SYSTEM INIT
// ======================================================

Object.keys(textMap).forEach(key => {

  applyPosition(
    textMap[key],
    key
  );

});

applyImagePosition();


// ======================================================
// TARGETS
// ======================================================

document.querySelectorAll('.tgt').forEach(cb => {

  cb.addEventListener('change', () => {

    if (cb.checked) {

      el.imageTarget.checked =
        false;

      state.selected.add(cb.value);

      setActiveTarget(cb.value);

    } else {

      state.selected.delete(cb.value);

      if (
        state.activeTarget === cb.value
      ) {
        state.activeTarget = null;
      }

    }

  });

});


// ======================================================
// IMAGE TARGET
// ======================================================

if (el.imageTarget) {

  el.imageTarget.addEventListener(
    'change',
    () => {

      if (!el.imageTarget.checked)
        return;

      state.selected.clear();

      state.activeTarget =
        null;

      document
        .querySelectorAll('.tgt')
        .forEach(cb => {
          cb.checked = false;
        });

      const pos =
        state.imagePosition;

      el.posX.value = pos.x;
      el.posY.value = pos.y;
      el.posR.value = pos.r;

      // Scale
el.imageScale.value = pos.scale * 100;
el.scaleVal.textContent = `${el.imageScale.value}%`;

// Blend mode
el.imageBlendMode.value =
    state.imagePosition.blendMode;

      el.xVal.textContent =
        pos.x;

      el.yVal.textContent =
        pos.y;

      el.rVal.textContent =
        pos.r;

    }
  );

}


// ======================================================
// LIVE TEXT EDITING
// ======================================================

el.globalText.addEventListener(
  'input',
  e => {

    if (!state.activeTarget)
      return;


    state.rawText[
      state.activeTarget
    ] = e.target.value;


    const node =
      textMap[state.activeTarget];


    if (!node) return;


    applyHighlight(
      node,
      state.activeTarget
    );


    updateTargetLabels();

  }
);

// ======================================================
// TYPOGRAPHY
// ======================================================

el.textColor.addEventListener(
  'input',
  e => {

    applyToSelected(node => {

      node.style.color =
        e.target.value;

    });

  }
);


// ======================================================
// FONT FAMILY
// ======================================================

el.fontFamily.addEventListener(
  "change",
  e => {

    applyToSelected((node, key) => {

      state.fontFamily[key] =
        e.target.value;

      node.style.fontFamily =
        e.target.value;

    });

  }
);

// ======================================================
// HIGHLIGHT CONTROLS
// ======================================================

el.highlightColor.addEventListener(
  'input',
  scheduleHighlightRefresh
);


el.highlightOpacity.addEventListener(
  'input',
  e => {

    el.highlightOpacityVal.textContent =
      e.target.value;

    state.highlightOpacity =
      parseFloat(e.target.value);

    scheduleHighlightRefresh();

  }
);


el.highlightModeBtn.addEventListener(
  'click',
  () => {

    state.highlightMode =
      state.highlightMode === 'css'
        ? 'line'
        : 'css';

    el.highlightModeBtn.textContent =
      state.highlightMode.toUpperCase();

    scheduleHighlightRefresh();

  }
);


// ======================================================
// GRID STYLES
// ======================================================

// ======================================================
// CUSTOM SVG GRID
// ======================================================

function updateCustomSVGGrid(){

    const w =
        el.svgW.value;

    const h =
        el.svgH.value;

    const x1 =
        el.svgX1.value;

    const x2 =
        el.svgX2.value;

    const y1 =
        el.svgY1.value;

    const y2 =
        el.svgY2.value;

    const strokeWidth =
        el.svgStrokeWidth.value;

    const opacity =
        el.svgOpacity.value;

    const rotation =
        el.svgRotation.value;


    const cx = w / 2;
    const cy = h / 2;


    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="${w}"
         height="${h}">

        <g transform="rotate(${rotation} ${cx} ${cy})">

            <line
                x1="${x1}"
                y1="${cy}"
                x2="${x2}"
                y2="${cy}"
                stroke="white"
                stroke-opacity="${opacity}"
                stroke-width="${strokeWidth}"
            />

            <line
                x1="${cx}"
                y1="${y1}"
                x2="${cx}"
                y2="${y2}"
                stroke="white"
                stroke-opacity="${opacity}"
                stroke-width="${strokeWidth}"
            />

        </g>

    </svg>
    `;


    el.canvas.style.setProperty(
        "--custom-grid-svg",
        `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
    );

}


[
    el.svgW,
    el.svgH,
    el.svgX1,
    el.svgX2,
    el.svgY1,
    el.svgY2,
    el.svgStrokeWidth,
    el.svgOpacity,
    el.svgRotation

].forEach(input => {

    input.addEventListener(
        "input",
        updateCustomSVGGrid
    );

});


updateCustomSVGGrid();


// ======================================================
// GRID STYLES
// ======================================================

const gridClasses = [
    "grid-lines",
    "grid-dots",
    "grid-lines-dots",
    "grid-crosses",
    "grid-crosses-12",
    "grid-crosses-12-thick",
    "grid-crosses-large",
    "grid-crosses-xl",
    "grid-crosses-2xl",
    "grid-crosses-spaced",
    "grid-thirds",
    "grid-golden",
    "grid-diagonals",
    "grid-baseline",
    "grid-columns",
    "custom-svg-grid"
];


const svgGridClasses = [
    "grid-crosses",
    "grid-crosses-12",
    "grid-crosses-12-thick",
    "grid-crosses-large",
    "grid-crosses-xl",
    "grid-crosses-2xl",
    "grid-crosses-spaced"
];


function updateGridStyle(){

    el.canvas.classList.remove(
        ...gridClasses
    );


    const style =
        el.gridStyle.value;


    if(style){

        el.canvas.classList.add(
            style
        );

    }


    // Fixed SVG grids
    const isFixedSVG =
        svgGridClasses.includes(style);


    el.gridOpacity.disabled =
        isFixedSVG;


    el.gridOpacity.classList.toggle(
        "opacity-40",
        isFixedSVG
    );

    el.gridOpacity.classList.toggle(
        "cursor-not-allowed",
        isFixedSVG
    );


    // Custom SVG controls
    const isCustomSVG =
        style === "custom-svg-grid";


    el.customSvgControls.classList.toggle(
        "hidden",
        !isCustomSVG
    );


    if(isCustomSVG){

        updateCustomSVGGrid();

    }

}


el.gridStyle.addEventListener(
    "change",
    updateGridStyle
);


updateGridStyle();


// ======================================================
// GRID OPACITY
// ======================================================

el.gridOpacity.addEventListener("input", e => {

    const value = e.target.value;

    el.gridOpacityVal.textContent = value;

    el.canvas.style.setProperty(
        "--grid-opacity",
        value
    );

});


// ======================================================
// FONT SIZE
// ======================================================

el.fontSize.addEventListener(
  'input',
  e => {

    el.sizeVal.textContent =
      e.target.value;

    applyToSelected(node => {

      node.style.fontSize =
        `${e.target.value}px`;

    });

  }
);


// ======================================================
// LINE HEIGHT
// ======================================================

el.lineHeight.addEventListener(
  'input',
  e => {

    el.lhVal.textContent =
      e.target.value;

    applyToSelected(node => {

      node.style.lineHeight =
        e.target.value;

    });

  }
);


// ======================================================
// LETTER SPACING
// ======================================================

el.letterSpacing.addEventListener(
  'input',
  e => {

    el.lsVal.textContent =
      e.target.value;

    applyToSelected(node => {

      node.style.letterSpacing =
        `${e.target.value}em`;

    });

  }
);


// ======================================================
// WORD SPACING
// ======================================================

el.wordSpacing.addEventListener(
  'input',
  e => {

    el.wsVal.textContent =
      e.target.value;

    applyToSelected(node => {

      node.style.wordSpacing =
        `${e.target.value}em`;

    });

  }
);


// ======================================================
// FONT STYLE
// ======================================================

function updateFontStyles() {

  const bold =
    el.bold.checked;

  const italic =
    el.italic.checked;

  const underline =
    el.underline.checked;

  applyToSelected(node => {

    node.style.fontWeight =
      bold ? '800' : '400';

    node.style.fontStyle =
      italic
        ? 'italic'
        : 'normal';

    node.style.textDecoration =
      underline
        ? 'underline'
        : 'none';

  });

}


[
  el.bold,
  el.italic,
  el.underline
].forEach(elm => {

  elm.addEventListener(
    'change',
    updateFontStyles
  );

});


// ======================================================
// IMAGE LOADING
// ======================================================

function loadImage(file) {

  if (
    !file ||
    !file.type.startsWith('image/')
  ) return;

  const reader =
    new FileReader();

  reader.onload = e => {

    el.hero.src =
      e.target.result;

  };

  reader.readAsDataURL(file);

}


el.dropzone.addEventListener(
  'click',
  () => el.imageInput.click()
);


el.imageInput.addEventListener(
  'change',
  e => {

    loadImage(
      e.target.files?.[0]
    );

  }
);

el.imageScale.addEventListener("input", e => {

    // Automatically select image target
    if (!el.imageTarget.checked) {

        el.imageTarget.checked = true;

        state.selected.clear();

        state.activeTarget = null;

        document
            .querySelectorAll('.tgt')
            .forEach(cb => {
                cb.checked = false;
            });

    }


    const scale =
        e.target.value / 100;


    state.imagePosition.scale =
        scale;


    el.scaleVal.textContent =
        `${e.target.value}%`;


    applyImagePosition();

});

el.imageBlendMode.addEventListener("change", e => {

    state.imagePosition.blendMode =
        e.target.value;

    el.hero.style.mixBlendMode =
        e.target.value;

});

document.addEventListener(
  'dragover',
  e => e.preventDefault()
);


document.addEventListener(
  'drop',
  e => {

    e.preventDefault();

    loadImage(
      e.dataTransfer?.files?.[0]
    );

  }
);


// ======================================================
// IMAGE FIT + ALIGNMENT
// ======================================================

el.coverBtn.addEventListener(
  'click',
  () => {

    el.hero.className =
      'absolute inset-0 w-full h-full object-cover';

    updateButtonGroup(
      [
        el.coverBtn,
        el.containBtn
      ],
      el.coverBtn
    );

    applyImagePosition();

  }
);


el.containBtn.addEventListener(
  'click',
  () => {

    el.hero.className =
      'absolute inset-0 w-full h-full object-contain';

    updateButtonGroup(
      [
        el.coverBtn,
        el.containBtn
      ],
      el.containBtn
    );

    applyImagePosition();

  }
);


el.leftBtn.addEventListener(
  'click',
  () => {

    el.hero.style.objectPosition =
      'left center';

    updateButtonGroup(
      [
        el.leftBtn,
        el.centerBtn,
        el.rightBtn
      ],
      el.leftBtn
    );

  }
);


el.centerBtn.addEventListener(
  'click',
  () => {

    el.hero.style.objectPosition =
      'center center';

    updateButtonGroup(
      [
        el.leftBtn,
        el.centerBtn,
        el.rightBtn
      ],
      el.centerBtn
    );

  }
);


el.rightBtn.addEventListener(
  'click',
  () => {

    el.hero.style.objectPosition =
      'right center';

    updateButtonGroup(
      [
        el.leftBtn,
        el.centerBtn,
        el.rightBtn
      ],
      el.rightBtn
    );

  }
);


// ======================================================
// OVERLAY + BACKGROUND
// ======================================================

el.overlayColor.addEventListener(
  'input',
  e => {

    el.overlay.style.background =
      e.target.value;

  }
);


el.overlayOpacity.addEventListener(
  'input',
  e => {

    el.overlayOpacityVal.textContent =
      e.target.value;

    el.overlay.style.opacity =
      e.target.value;

  }
);


el.bgPicker.addEventListener(
  'input',
  e => {

    el.canvas.style.background =
      e.target.value;

  }
);