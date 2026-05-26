// ======================================================
// ELEMENT CACHE
// ======================================================

const el = {
  canvas: document.getElementById('canvas'),
  hero: document.getElementById('heroImage'),
  overlay: document.getElementById('imageOverlay'),

  gridOpacity: document.getElementById('gridOpacity'),
  gridOpacityVal: document.getElementById('gridOpacityVal'),

  dropzone: document.getElementById('dropzone'),
  imageInput: document.getElementById('imageInput'),

  globalText: document.getElementById('globalText'),

  textColor: document.getElementById('textColor'),
  highlightColor: document.getElementById('highlightColor'),

  highlightOpacity: document.getElementById('highlightOpacity'),
  highlightOpacityVal: document.getElementById('highlightOpacityVal'),

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

  imageTarget: document.getElementById('imageTarget')
};

el.posX = document.getElementById('posX');
el.posY = document.getElementById('posY');

el.xVal = document.getElementById('xVal');
el.yVal = document.getElementById('yVal');

el.posR = document.getElementById('posR');
el.rVal = document.getElementById('rVal');


// ======================================================
// TEXT ELEMENTS
// ======================================================

const textMap = {
  magazineName: document.getElementById('magazineName'),
  issueText: document.getElementById('issueText'),
  headline: document.getElementById('headline'),
  subheadline: document.getElementById('subheadline'),
  sideText: document.getElementById('sideText'),
  descriptionText: document.getElementById('descriptionText'),
  helloworld: document.getElementById('helloworld')
};


// ======================================================
// STATE
// ======================================================

const state = {
  selected: new Set(),
  activeTarget: null,

  gridOpacity: 0.5,

  highlightPadding: {
    y: 0.2,
    x: 0.4
  },

  highlightMode: 'css',
  highlightOpacity: 1,

  rawText: {},

  position: {},

  imagePosition: {
    x: 0,
    y: 0,
    r: 0
  }
};


// ======================================================
// INIT STATE
// ======================================================

Object.keys(textMap).forEach(key => {

  state.position[key] = {
    x: 0,
    y: 0,
    r: 0
  };

  state.rawText[key] =
    textMap[key]?.textContent || '';

});


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
      `rotate(${pos.r}deg)`;

    return;

  }

  el.hero.style.objectPosition =
    'center center';

  el.hero.style.transform =
    `translate(${pos.x}px, ${pos.y}px) rotate(${pos.r}deg)`;

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
// GRID OPACITY
// ======================================================

el.gridOpacity.addEventListener(
  'input',
  e => {

    const value =
      e.target.value;

    el.gridOpacityVal.textContent =
      value;

    el.canvas.style.setProperty(
      '--grid-opacity',
      value
    );

  }
);


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