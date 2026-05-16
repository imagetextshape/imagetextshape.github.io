const TOTAL_LAYERS = 8;

const audioDropzone =
  document.getElementById(
    'audioDropzone'
  );

const timerEl =
  document.getElementById(
    'audioTimer'
  );

const timerColorCheckbox =
  document.getElementById(
    'timerColorCheckbox'
  );

const audioInput =
  document.createElement(
    'input'
  );

audioInput.type = 'file';

audioInput.accept =
  'audio/mpeg,audio/mp3';

audioInput.className =
  'hidden';

document.body.appendChild(
  audioInput
);

const audio =
  new Audio();

let audioLoaded = false;

const stage =
  document.getElementById('stage');

const layerButtons =
  document.getElementById(
    'layerButtons'
  );

const activeLayerLabel =
  document.getElementById(
    'activeLayerLabel'
  );

const blendLabel =
  document.getElementById(
    'blendLabel'
  );
const imageSizeLabel =
  document.getElementById(
    'imageSizeLabel'
  );

const sliders = {

  
  zoomSpeed:
    document.getElementById(
      'zoomSpeedSlider'
    ),
  
  jitterSpeed:
    document.getElementById(
      'jitterSpeedSlider'
    ),

  opacity:
    document.getElementById(
      'opacitySlider'
    ),

  saturation:
    document.getElementById(
      'saturationSlider'
    ),

  blur:
    document.getElementById(
      'blurSlider'
    ),

  contrast:
    document.getElementById(
      'contrastSlider'
    ),

  brightness:
    document.getElementById(
      'brightnessSlider'
    ),

  rotation:
    document.getElementById(
      'rotationSlider'
    ),

  threshold:
    document.getElementById(
      'thresholdSlider'
    )
};

const sliderValues = {

  zoomSpeed:
    document.getElementById(
      'zoomSpeedValue'
    ),

  jitterSpeed:
    document.getElementById(
      'jitterSpeedValue'
    ),

  opacity:
    document.getElementById(
      'opacityValue'
    ),

  saturation:
    document.getElementById(
      'saturationValue'
    ),

  blur:
    document.getElementById(
      'blurValue'
    ),

  contrast:
    document.getElementById(
      'contrastValue'
    ),

  brightness:
    document.getElementById(
      'brightnessValue'
    ),

  rotation:
    document.getElementById(
      'rotationValue'
    ),

  threshold:
    document.getElementById(
      'thresholdValue'
    )
};

const jitterAnimateCheckbox =
  document.getElementById(
    'jitterAnimateCheckbox'
  );

const zoomAnimateCheckbox =
  document.getElementById(
    'zoomAnimateCheckbox'
  );

const fitModes = [
  'cover',
  'contain',
  '100%',
  'tile'
];

const blendModes = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'difference',
  'exclusion',
  'hard-light',
  'soft-light',
  'color-dodge',
  'color-burn'
];

let activeSlot = 0;

const slots = [];

//
// SVG THRESHOLD FILTERS
//

const svgNS =
  'http://www.w3.org/2000/svg';

const svg =
  document.createElementNS(
    svgNS,
    'svg'
  );

svg.setAttribute('width', '0');
svg.setAttribute('height', '0');

svg.style.position =
  'absolute';

document.body.appendChild(svg);


function loadAudio(file) {

  if (!file) return;

  if (
    !file.type.startsWith(
      'audio/'
    )
  ) {
    return;
  }

  audio.src =
    URL.createObjectURL(
      file
    );

  audioLoaded = true;

  audioDropzone.textContent = file.name
  
}

audioDropzone.addEventListener(
  'click',
  () => {

    audioInput.click();
  }
);

audioInput.addEventListener(
  'change',
  (e) => {

    loadAudio(
      e.target.files[0]
    );
  }
);

audioDropzone.addEventListener(
  'dragover',
  (e) => {

    e.preventDefault();

    audioDropzone.classList.add(
      'ring',
      'ring-white'
    );
  }
);

audioDropzone.addEventListener(
  'dragleave',
  () => {

    audioDropzone.classList.remove(
      'ring',
      'ring-white'
    );
  }
);

audioDropzone.addEventListener(
  'drop',
  (e) => {

    e.preventDefault();

    audioDropzone.classList.remove(
      'ring',
      'ring-white'
    );

    loadAudio(
      e.dataTransfer.files[0]
    );
  }
);


timerColorCheckbox.addEventListener(
  'change',
  () => {

    timerEl.classList.toggle(
      'text-black',
      timerColorCheckbox.checked
    );

    timerEl.classList.toggle(
      'text-white',
      !timerColorCheckbox.checked
    );
  }
);

function createThresholdFilter(id) {

  const filter =
    document.createElementNS(
      svgNS,
      'filter'
    );

  filter.setAttribute(
    'id',
    `thresholdFilter${id}`
  );

  //
  // grayscale
  //

  const matrix =
    document.createElementNS(
      svgNS,
      'feColorMatrix'
    );

  matrix.setAttribute(
    'type',
    'matrix'
  );

  matrix.setAttribute(
    'values',
    `
      0.2126 0.7152 0.0722 0 0
      0.2126 0.7152 0.0722 0 0
      0.2126 0.7152 0.0722 0 0
      0       0       0      1 0
    `
  );

  filter.appendChild(matrix);

  //
  // threshold transfer
  //

  const transfer =
    document.createElementNS(
      svgNS,
      'feComponentTransfer'
    );

  const channels = [
    'R',
    'G',
    'B'
  ];

  channels.forEach((channel) => {

    const fn =
      document.createElementNS(
        svgNS,
        `feFunc${channel}`
      );

    fn.setAttribute(
      'id',
      `threshold${channel}${id}`
    );

    fn.setAttribute(
      'type',
      'discrete'
    );

    fn.setAttribute(
      'tableValues',
      '0 1'
    );

    transfer.appendChild(fn);
  });

  filter.appendChild(transfer);

  svg.appendChild(filter);
}

function updateThresholdFilter(
  id,
  value
) {

  const steps = 256;

  const threshold =
    Math.floor(value);

  const table = [];

  for (
    let i = 0;
    i < steps;
    i++
  ) {

    table.push(
      i < threshold
        ? 0
        : 1
    );
  }

  const tableValues =
    table.join(' ');

  ['R', 'G', 'B']
    .forEach((channel) => {

      document
        .getElementById(
          `threshold${channel}${id}`
        )
        .setAttribute(
          'tableValues',
          tableValues
        );
    });
}



function updateLayerButton(
  slot
) {

  const nameEl =
    slot.button.querySelector(
      '.layerName'
    );

  if (!nameEl) return;

  nameEl.textContent =
    slot.filename;
}
//
// CREATE LAYERS
//

for (
  let i = 0;
  i < TOTAL_LAYERS;
  i++
) {

  createThresholdFilter(i);

  const img =
    document.createElement('img');

  const tile =
  document.createElement('div');

tile.className =
  'tileLayer hidden';

tile.style.zIndex = i;

stage.appendChild(tile);

  img.className = 'layer';

  img.style.mixBlendMode =
    'difference';

  img.style.zIndex = i;

  stage.appendChild(img);

  const fileInput =
    document.createElement('input');

  fileInput.type = 'file';

  fileInput.accept =
    'image/*';

  fileInput.className =
    'hidden';

  document.body.appendChild(
    fileInput
  );

  const slot = {

    id: i,

    img,
    tile,
    fileInput,

    filename: `L ${i + 1}`,

    hasImage: false,

    visible: true,
    
    blendIndex: 6,

    blendMode:
      'difference',

    invert: false,

    zoomAnimate: false,
    zoomSpeed: 100,
    jitterAnimate: false,
    jitterSpeed: 0.4,

    opacity: 100,

    saturation: 100,

    blur: 0,

    contrast: 100,

    brightness: 100,

    rotation: 0,

    threshold: 0,
    
    fitIndex: 0,
    fitMode: 'cover',

    zIndex: i
  };

  slots.push(slot);

  //
  // FILE LOAD
  //

fileInput.addEventListener(
  'change',
  (e) => {

    const file =
      e.target.files[0];

    if (!file) return;

    img.src =
      URL.createObjectURL(
        file
      );

    slot.filename = file.name


slot.hasImage = true;

slot.visible = true;

slot.img.classList.remove(
  'hidden-layer'
);

updateLayerButton(slot);

updateLayerButtonState(slot);
  }
);

function updateLayerButtonState(slot) {

  //
  // image loaded
  //

  slot.button.classList.toggle(
    'toggle-active',
    slot.hasImage &&
    slot.visible
  );

  //
  // hidden but loaded
  //

  slot.button.classList.toggle(
    'opacity-40',
    slot.hasImage &&
    !slot.visible
  );
}

  // LAYER BUTTON

const button =
  document.createElement('button');

button.type = 'button';

button.className = `
  layerButton
  relative
  overflow-hidden
  border
  border-zinc-700
  bg-zinc-950
  hover:bg-zinc-800
  rounded
  p-1
  text-left
  transition
`;

button.innerHTML = `
  <div
    class="
      layerName
      font-bold
      text-sm
      h-12
    "
  >
    ${slot.filename}
  </div>

  <div
    class="
      dropHint
      absolute
      inset-0
      hidden
      items-center
      justify-center
      text-xs
      font-bold
      bg-white/10
      backdrop-blur-sm
      pointer-events-none
    "
  >
    Drop Image
  </div>
`;

layerButtons.appendChild(button);

slot.button = button;

const dropHint =
  button.querySelector(
    '.dropHint'
  );

//
// CLICK = select layer
//

button.addEventListener(
  'click',
  () => {

    setActiveSlot(i);
  }
);

//
// DOUBLE CLICK = upload
//

button.addEventListener(
  'dblclick',
  () => {

    setActiveSlot(i);

    slot.fileInput.click();
  }
);

//
// DRAG ENTER
//

button.addEventListener(
  'dragenter',
  (e) => {

    e.preventDefault();

    button.classList.add(
      'ring',
      'ring-white'
    );

    dropHint.classList.remove(
      'hidden'
    );

    dropHint.classList.add(
      'flex'
    );
  }
);

//
// DRAG OVER
//

button.addEventListener(
  'dragover',
  (e) => {

    e.preventDefault();
  }
);

//
// DRAG LEAVE
//

button.addEventListener(
  'dragleave',
  () => {

    button.classList.remove(
      'ring',
      'ring-white'
    );

    dropHint.classList.remove(
      'flex'
    );

    dropHint.classList.add(
      'hidden'
    );
  }
);

//
// DROP
//

button.addEventListener(
  'drop',
  (e) => {

    e.preventDefault();

    button.classList.remove(
      'ring',
      'ring-white'
    );

    dropHint.classList.remove(
      'flex'
    );

    dropHint.classList.add(
      'hidden'
    );

    const file =
  e.dataTransfer.files[0];

if (!file) return;

if (
  !file.type.startsWith(
    'image/'
  )
) {
  return;
}

setActiveSlot(i);

img.src =
  URL.createObjectURL(
    file
  );

slot.filename = file.name


slot.hasImage = true;

slot.visible = true;

slot.img.classList.remove(
  'hidden-layer'
);

updateLayerButton(slot);

updateLayerButtonState(slot);
  }
);
}

//
// ACTIVE SLOT
//

function setActiveSlot(index) {

  activeSlot = index;

  const slot =
    slots[activeSlot];
  
 slots.forEach((s, i) => {

  s.button.classList.toggle(
    'slot-active',
    i === activeSlot
  );

    updateLayerButtonState(s);
  });

  activeLayerLabel.textContent =
    `L ${activeSlot + 1}`;

  blendLabel.textContent =
    slot.invert
      ? `${slot.blendMode} + inv`
      : slot.blendMode;

  imageSizeLabel.textContent =
  slot.fitMode;
  
  sliders.zoomSpeed.value =
    slot.zoomSpeed;

  sliders.jitterSpeed.value =
    slot.jitterSpeed;

  zoomAnimateCheckbox.checked =
    slot.zoomAnimate;

  jitterAnimateCheckbox.checked =
    slot.jitterAnimate;

  sliders.opacity.value =
    slot.opacity;

  sliders.saturation.value =
    slot.saturation;

  sliders.blur.value =
    slot.blur;

  sliders.contrast.value =
    slot.contrast;

  sliders.brightness.value =
    slot.brightness;

  sliders.rotation.value =
    slot.rotation;

  sliders.threshold.value =
    slot.threshold;

  thresholdValue.textContent =
    slot.threshold;

  zoomAnimateCheckbox.checked =
    slot.zoomAnimate;

    Object.entries(sliderValues)
  .forEach(([key, el]) => {

    if (
      slot[key] !== undefined
    ) {

      el.textContent =
        slot[key];
    }
  });
}

setActiveSlot(0);

//
// PANEL CONTROLS
//


function bindSlider(
  key,
  element
) {

  element.addEventListener(
    'input',
    (e) => {

      const value =
        Number(e.target.value);

      const slot =
        slots[activeSlot];

      slot[key] = value;

      //
      // update ui values
      //

      if (
        sliderValues[key]
      ) {

        sliderValues[
          key
        ].textContent =
          value;
      }

      //
      // threshold updates
      //

      if (
        key === 'threshold'
      ) {

        updateThresholdFilter(
          slot.id,
          value
        );
      }

       //
    // AUTO-ENABLE ANIMATIONS
    //

    if (key === 'zoomSpeed') {

      slot.zoomAnimate = true;
      zoomAnimateCheckbox.checked = true;
    }

    if (key === 'jitterSpeed') {

      slot.jitterAnimate = true;
      jitterAnimateCheckbox.checked = true;
    }
    }
  );
}


bindSlider(
  'zoomSpeed',
  sliders.zoomSpeed
);


bindSlider(
  'jitterSpeed',
  sliders.jitterSpeed
);


bindSlider(
  'opacity',
  sliders.opacity
);

bindSlider(
  'saturation',
  sliders.saturation
);

bindSlider(
  'blur',
  sliders.blur
);

bindSlider(
  'contrast',
  sliders.contrast
);

bindSlider(
  'brightness',
  sliders.brightness
);

bindSlider(
  'rotation',
  sliders.rotation
);

bindSlider(
  'threshold',
  sliders.threshold
);

zoomAnimateCheckbox
  .addEventListener(
    'change',
    (e) => {

      slots[
        activeSlot
      ].zoomAnimate =
        e.target.checked;
    }
  );

jitterAnimateCheckbox
  .addEventListener(
    'change',
    (e) => {

      slots[
        activeSlot
      ].jitterAnimate =
        e.target.checked;
    }
  );

//
// KEYBOARD
//

document.addEventListener(
  'keydown',
  (e) => {

    const key = e.key;

    const numpad =
      e.code.replace(
        'Numpad',
        ''
      );

    let index = null;

    //
// SPACEBAR AUDIO TOGGLE
//

if (
  e.key.toLowerCase() === 'p'
) {

  e.preventDefault();

  if (!audioLoaded) {
    return;
  }

  if (audio.paused) {

    audio.play();

  } else {

    audio.pause();
  }

  return;
}

    if (
      [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6'
      ].includes(key)
    ) {

      index =
        Number(key) - 1;
    }

    if (
      [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6'
      ].includes(numpad)
    ) {

      index =
        Number(numpad) - 1;
    }

    //
    // SHIFT + NUMBER
    //

    if (
      e.shiftKey &&
      index !== null
    ) {

      e.preventDefault();

      setActiveSlot(index);

      slots[index]
        .fileInput
        .click();

      return;
    }

    //
    // SELECT + TOGGLE
    //

    if (index !== null) {

      e.preventDefault();

      setActiveSlot(index);

      const slot =
        slots[index];

      slot.visible =
  !slot.visible;

slot.img.classList.toggle(
  'hidden-layer',
  !slot.visible
);

updateLayerButtonState(
  slot
);

      return;
    }


//
// IMAGE FIT MODE
//

if (
  e.key.toLowerCase() === 'c'
) {

  e.preventDefault();

  const slot =
    slots[activeSlot];

  slot.fitIndex++;

  if (
    slot.fitIndex >=
    fitModes.length
  ) {

    slot.fitIndex = 0;
  }

  slot.fitMode =
    fitModes[
      slot.fitIndex
    ];

  imageSizeLabel.textContent =
  slot.fitMode;
}

    //
// BLEND MODE
//

if (
  e.key.toLowerCase() === 'b'
) {

  e.preventDefault();

  const slot =
    slots[activeSlot];

  //
  // SHIFT + B
  // reverse cycle
  //

  if (e.shiftKey) {

    slot.blendIndex--;

    if (
      slot.blendIndex < 0
    ) {

      slot.blendIndex =
        blendModes.length - 1;
    }

  } else {

    //
    // normal forward cycle
    //

    slot.blendIndex++;

    if (
      slot.blendIndex >=
      blendModes.length
    ) {

      slot.blendIndex = 0;
    }
  }

  slot.blendMode =
    blendModes[
      slot.blendIndex
    ];

  blendLabel.textContent =
    slot.invert
      ? `${slot.blendMode} + inv`
      : slot.blendMode;
}

    //
    // TOGGLE INVERT
    //

    if (
      e.key.toLowerCase() === 'i'
    ) {

      const slot =
        slots[activeSlot];

      slot.invert =
        !slot.invert;

      blendLabel.textContent =
        slot.invert
          ? `${slot.blendMode} + inv`
          : slot.blendMode;
    }

    //
    // Z ORDER
    //

    if (
      e.key.toLowerCase() === 'z'
    ) {

      const slot =
        slots[activeSlot];

      slot.zIndex++;

      if (
        slot.zIndex >
        TOTAL_LAYERS
      ) {

        slot.zIndex = 1;
      }

      slot.img.style.zIndex =
        slot.zIndex;

      zLabel.textContent =
        `Z: ${slot.zIndex}`;
    }
  }
);


function formatTime(
  seconds
) {

  seconds =
    Math.max(
      0,
      Math.floor(seconds)
    );

  const mins =
    Math.floor(
      seconds / 60
    );

  const secs =
    seconds % 60;

  return `
    ${String(mins).padStart(2, '0')}
    :
    ${String(secs).padStart(2, '0')}
  `.replace(/\s/g, '');
}
//
// RENDER LOOP
//

function render() {

  slots.forEach((slot) => {

    //
    // SHARED VALUES
    //

    const opacity =
      slot.opacity / 100;

    //
    // TRANSFORM
    //

    const transform =
      `
        rotate(${slot.rotation}deg)
      `;

    //
    // ANIMATIONS
    //

    const animations = [];

    if (slot.zoomAnimate) {

      animations.push(
        `
          zoom
          ${slot.zoomSpeed}s
          linear
          infinite
        `
      );
    }

    if (slot.jitterAnimate) {

      animations.push(
        `
          jitter
          ${slot.jitterSpeed}s
          linear
          infinite
        `
      );
    }

    const animation =
      animations.join(',');

    //
    // FILTERS
    //

    let filters = `
      saturate(${slot.saturation}%)
      blur(${slot.blur}px)
      contrast(${slot.contrast}%)
      brightness(${slot.brightness}%)
    `;

    //
    // INVERT
    //

    if (slot.invert) {

      filters +=
        ' invert(1)';
    }

    //
    // THRESHOLD
    //

    if (
      slot.threshold > 0
    ) {

      filters += `
        contrast(400%)
        brightness(120%)
        url(#thresholdFilter${slot.id})
      `;
    }

    //
    // RESET IMAGE
    //

    slot.img.classList.remove(
      'hidden'
    );

    slot.img.style.objectFit =
      'cover';

    slot.img.style.width =
      '100%';

    slot.img.style.height =
      '100%';

    slot.img.style.maxWidth =
      '';

    slot.img.style.maxHeight =
      '';

    //
    // SHARED IMAGE STYLES
    //

    slot.img.style.opacity =
      opacity;

    slot.img.style.zIndex =
      slot.zIndex;

    slot.img.style.mixBlendMode =
      slot.blendMode;

    slot.img.style.transform =
      transform;

    slot.img.style.animation =
      animation;

    slot.img.style.filter =
      filters;

    //
    // RESET TILE
    //

    slot.tile.classList.add(
      'hidden'
    );

// prevent center offset leakage
slot.img.style.left =
  '';

slot.img.style.top =
  '';

    //
    // FIT MODES
    //

    switch (slot.fitMode) {

      //
      // COVER
      //

      case 'cover':

        slot.img.style.objectFit =
          'cover';

        break;

      //
      // CONTAIN
      //

      case 'contain':

        slot.img.style.objectFit =
          'contain';

        break;

      //
      // 100%
      // native dimensions
      //

      case '100%':

  slot.img.style.objectFit =
    'none';

  slot.img.style.width =
    'auto';

  slot.img.style.height =
    'auto';

  //
  // center native-size image
  //

  slot.img.style.left =
    '50%';

  slot.img.style.top =
    '50%';

  slot.img.style.transform =
    `
      translate(-50%, -50%)
      rotate(${slot.rotation}deg)
    `;

  break;

      //
      // TILE
      //

      case 'tile':

        //
        // hide normal image
        //

        slot.img.classList.add(
          'hidden'
        );

        //
        // show tile surface
        //

        slot.tile.classList.remove(
          'hidden'
        );

        //
        // tile visuals
        //

        slot.tile.style.opacity =
          opacity;

        slot.tile.style.zIndex =
          slot.zIndex;

        slot.tile.style.mixBlendMode =
          slot.blendMode;

        slot.tile.style.transform =
          transform;

        slot.tile.style.animation =
          animation;

        slot.tile.style.filter =
          filters;

        //
        // texture
        //

        slot.tile.style.backgroundImage =
          `url(${slot.img.src})`;

        //
        // native image size
        //

        slot.tile.style.backgroundSize =
          'auto';

        slot.tile.style.backgroundRepeat =
          'repeat';

        break;
    }
  });

  //
  // AUDIO TIMER
  //

  if (audioLoaded) {

    const remaining =
      audio.duration -
      audio.currentTime;

    timerEl.textContent =
      formatTime(
        remaining
      );

  } else {

    timerEl.textContent =
      '00:00';
  }

  requestAnimationFrame(
    render
  );
}

render();