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
// POSITION HELPERS
// ======================================================

function applyPosition(node, key) {
  const pos = state.position[key];

  node.style.transform =
    `translate(${pos.x}px, ${pos.y}px) rotate(${pos.r}deg)`;
}


function applyImagePosition() {

  const pos = state.imagePosition;

  // COVER MODE
  if (
    el.hero.classList.contains('object-cover')
  ) {

    el.hero.style.objectPosition =
      `calc(50% + ${pos.x}px) calc(50% + ${pos.y}px)`;

    el.hero.style.transform =
      `rotate(${pos.r}deg)`;

    return;
  }

  // CONTAIN MODE

  el.hero.style.objectPosition =
    'center center';

  el.hero.style.transform =
    `
      translate(${pos.x}px, ${pos.y}px)
      rotate(${pos.r}deg)
    `;
}


function updatePositionFromSliders() {
  const x = parseInt(el.posX.value, 10);
  const y = parseInt(el.posY.value, 10);
  const r = parseInt(el.posR.value, 10);

  el.xVal.textContent = x;
  el.yVal.textContent = y;
  el.rVal.textContent = r;


  // ====================================================
  // IMAGE TARGET
  // ====================================================

  if (el.imageTarget.checked) {

    state.imagePosition.x = x;
    state.imagePosition.y = y;
    state.imagePosition.r = r;

    applyImagePosition();

    return;
  }


  // ====================================================
  // TEXT TARGETS
  // ====================================================

  applyToSelected(node => {
    const key = Object.keys(textMap).find(k => textMap[k] === node);

    if (!key) return;

    state.position[key].x = x;
    state.position[key].y = y;
    state.position[key].r = r;

    applyPosition(node, key);
  });
}


el.posX.addEventListener('input', updatePositionFromSliders);
el.posY.addEventListener('input', updatePositionFromSliders);
el.posR.addEventListener('input', updatePositionFromSliders);


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

  position: {
    magazineName: { x: 0, y: 0, r: 0 },
    issueText: { x: 0, y: 0, r: 0 },
    headline: { x: 0, y: 0, r: 0 },
    subheadline: { x: 0, y: 0, r: 0 },
    sideText: { x: 0, y: 0, r: 0 },
    descriptionText: { x: 0, y: 0, r: 0 },
    helloworld: { x: 0, y: 0, r: 0 }
  },

  imagePosition: {
    x: 0,
    y: 0,
    r: 0
  }
};


// ======================================================
// HELPERS
// ======================================================

function applyToSelected(fn) {
  state.selected.forEach(key => {
    const node = textMap[key];
    if (node) fn(node);
  });
}


function setActiveTarget(key) {
  state.activeTarget = key;

  const node = textMap[key];
  if (!node) return;

  const clean = (node.textContent || '').trim();

  el.globalText.value = clean;

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
    btn.className = 'px-3 py-2 rounded bg-neutral-800';
  });

  activeButton.className = 'px-3 py-2 rounded bg-white text-black';
}


// ======================================================
// POSITION SYSTEM INIT
// ======================================================

Object.keys(textMap).forEach(key => {
  state.position[key] = { x: 0, y: 0, r: 0 };

  applyPosition(textMap[key], key);
});

applyImagePosition();


// ======================================================
// TARGETS
// ======================================================

document.querySelectorAll('.tgt').forEach(cb => {
  cb.addEventListener('change', () => {

    if (cb.checked) {

      el.imageTarget.checked = false;

      state.selected.add(cb.value);

      setActiveTarget(cb.value);

    } else {

      state.selected.delete(cb.value);

      if (state.activeTarget === cb.value) {
        state.activeTarget = null;
      }
    }
  });
});


// ======================================================
// IMAGE TARGET
// ======================================================

// ======================================================
// IMAGE TARGET
// ======================================================

if (el.imageTarget) {

  el.imageTarget.addEventListener('change', () => {

    if (!el.imageTarget.checked) return;

    // deselect text targets

    state.selected.clear();

    state.activeTarget = null;

    document.querySelectorAll('.tgt').forEach(cb => {
      cb.checked = false;
    });

    const pos = state.imagePosition;

    el.posX.value = pos.x;
    el.posY.value = pos.y;
    el.posR.value = pos.r;

    el.xVal.textContent = pos.x;
    el.yVal.textContent = pos.y;
    el.rVal.textContent = pos.r;

  });

}


// ======================================================
// LIVE TEXT EDITING
// ======================================================

el.globalText.addEventListener('input', e => {
  if (!state.activeTarget) return;

  const node = textMap[state.activeTarget];
  if (!node) return;

  const value = e.target.value;

node.textContent = value;

  // keep highlight consistent on edits
  applyHighlight(node);
});


// ======================================================
// TYPOGRAPHY
// ======================================================

el.textColor.addEventListener('input', e => {
  applyToSelected(node => {
    node.style.color = e.target.value;
  });
});


// ======================================================
// HIGHLIGHT SYSTEM
// ======================================================

function stripHighlightHTML(html) {
  return html
    .replace(/<\/?span[^>]*>/g, '')
    .replace(/<br\s*\/?>/gi, '\n');
}


function applyHighlight(node) {
  const text = node.textContent || '';

  const rgb = hexToRgb(el.highlightColor.value);
  const a = Math.max(0, Math.min(1, state.highlightOpacity));

  const color = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;

  if (state.highlightMode === 'css') {

    node.style.background = color;
node.style.display = 'inline-block';
node.style.padding =
  `${state.highlightPadding.y}em ${state.highlightPadding.x}em`;

node.textContent = text;

    return;
  }

  // LINE MODE


  const lines = text.split('\n');

node.style.background = 'transparent';
node.style.padding = '0';
node.style.display = 'block';

node.innerHTML = lines
  .map(line => `
    <span style="
      background:${color};
      padding:${state.highlightPadding.y}em ${state.highlightPadding.x}em;
      display:inline-block;
      margin:2px 0;
    ">${line}</span>
  `)
  .join('');
}

el.gridOpacity.addEventListener('input', e => {
  const value = e.target.value;

  el.gridOpacityVal.textContent = value;

  el.canvas.style.setProperty('--grid-opacity', value);
});

el.highlightColor.addEventListener('input', () => {
  applyToSelected(applyHighlight);
});

el.highlightModeBtn.addEventListener('click', () => {

  state.highlightMode =
    state.highlightMode === 'css'
      ? 'line'
      : 'css';

  el.highlightModeBtn.textContent =
    state.highlightMode.toUpperCase();

  applyToSelected(node => {

    resetHighlight(node);

    applyHighlight(node);

  });
});


function resetHighlight(node) {
  node.textContent = node.textContent;

  node.style.background = '';
  node.style.display = '';
  node.style.padding = '';
}

el.highlightOpacity.addEventListener('input', e => {

  el.highlightOpacityVal.textContent =
    e.target.value;

  state.highlightOpacity = parseFloat(e.target.value);

  applyToSelected(applyHighlight);
});

// ======================================================
// FONT SIZE
// ======================================================

el.fontSize.addEventListener('input', e => {

  el.sizeVal.textContent = e.target.value;

  applyToSelected(node => {

    node.style.fontSize =
      `${e.target.value}px`;

  });

});


// ======================================================
// LINE HEIGHT
// ======================================================

el.lineHeight.addEventListener('input', e => {

  el.lhVal.textContent =
    e.target.value;

  applyToSelected(node => {

    node.style.lineHeight =
      e.target.value;

  });

});


// ======================================================
// LETTER SPACING
// ======================================================

el.letterSpacing.addEventListener('input', e => {

  el.lsVal.textContent =
    e.target.value;

  applyToSelected(node => {

    node.style.letterSpacing =
      `${e.target.value}em`;

  });

});


// ======================================================
// WORD SPACING
// ======================================================

el.wordSpacing.addEventListener('input', e => {

  el.wsVal.textContent =
    e.target.value;

  applyToSelected(node => {

    node.style.wordSpacing =
      `${e.target.value}em`;

  });

});


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
      italic ? 'italic' : 'normal';

    node.style.textDecoration =
      underline ? 'underline' : 'none';

  });

}


[
  el.bold,
  el.italic,
  el.underline
].forEach(elm =>
  elm.addEventListener(
    'change',
    updateFontStyles
  )
);


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

  reader.onload = e =>
    (el.hero.src = e.target.result);

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

el.coverBtn.addEventListener('click', () => {

  el.hero.className =
    'absolute inset-0 w-full h-full object-cover';

  updateButtonGroup(
    [el.coverBtn, el.containBtn],
    el.coverBtn
  );

});


el.containBtn.addEventListener('click', () => {

  el.hero.className =
    'absolute inset-0 w-full h-full object-contain';

  updateButtonGroup(
    [el.coverBtn, el.containBtn],
    el.containBtn
  );

});


el.leftBtn.addEventListener('click', () => {

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

});


el.centerBtn.addEventListener('click', () => {

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

});


el.rightBtn.addEventListener('click', () => {

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

});


// ======================================================
// OVERLAY + BACKGROUND
// ======================================================

el.overlayColor.addEventListener('input', e => {

  el.overlay.style.background =
    e.target.value;

});


el.overlayOpacity.addEventListener('input', e => {

  el.overlayOpacityVal.textContent =
    e.target.value;

  el.overlay.style.opacity =
    e.target.value;

});


el.bgPicker.addEventListener('input', e => {

  el.canvas.style.background =
    e.target.value;

});



function hexToRgb(hex) {
  const v = hex.replace('#', '');
  const bigint = parseInt(v, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}