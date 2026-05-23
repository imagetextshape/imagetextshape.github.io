// ======================================================
// CONFIG
// ======================================================

const TOTAL = 14;

const W = 1920;
const H = 1080;

let BORDER = 0;
let ROTATION = 0;

let LAYOUT_MODE =
  'original';

// ======================================================
// ELEMENTS
// ======================================================

const stage =
  document.getElementById(
    'stage'
  );

const folderBtn =
  document.getElementById(
    'folderBtn'
  );

const folderInput =
  document.getElementById(
    'folderInput'
  );

const slotsEl =
  document.getElementById(
    'slots'
  );

const clearBtn =
  document.getElementById(
    'clearBtn'
  );

const randomizeBtn =
  document.getElementById(
    'randomizeBtn'
  );

const borderSlider =
  document.getElementById(
    'borderSlider'
  );

const borderValue =
  document.getElementById(
    'borderValue'
  );

const layoutSelect =
  document.getElementById(
    'layoutSelect'
  );

const rotationSlider =
  document.getElementById(
    'rotationSlider'
  );

const rotationValue =
  document.getElementById(
    'rotationValue'
  );

// ======================================================
// STATE
// ======================================================

const images =
  Array(TOTAL).fill(
    null
  );

const slotRefs =
  [];

let seed =
  Math.random() * 999999;

let composition =
  [];

// ======================================================
// RNG
// ======================================================

function rand(
  min,
  max
) {

  seed +=
    0.61803398875;

  const x =
    Math.sin(
      seed * 9999
    ) * 10000;

  return (
    min +
    (
      x -
      Math.floor(x)
    ) *
    (
      max - min
    )
  );
}

// ======================================================
// SHUFFLE
// ======================================================

function shuffle(
  arr
) {

  const a =
    [...arr];

  for (
    let i = a.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        rand(
          0,
          i + 1
        )
      );

    [
      a[i],
      a[j]
    ] = [
      a[j],
      a[i]
    ];
  }

  return a;
}

// ======================================================
// SLOT PREVIEW
// ======================================================

function updateSlotPreview(
  slot,
  src
) {

  const label =
    slot.querySelector(
      '.slotLabel'
    );

  const deleteBtn =
    slot.querySelector(
      '.deleteBtn'
    );

  if (!src) {

    slot.style.backgroundImage =
      '';

    label.classList.remove(
      'hidden'
    );

    deleteBtn.classList.add(
      'hidden'
    );

    return;
  }

  slot.style.backgroundImage =
    `url(${src})`;

  slot.style.backgroundSize =
    'cover';

  slot.style.backgroundPosition =
    'center';

  slot.style.backgroundRepeat =
    'no-repeat';

  label.classList.add(
    'hidden'
  );

  deleteBtn.classList.remove(
    'hidden'
  );
}

// ======================================================
// IMAGE NORMALIZATION
// ======================================================

async function fileToDataUrl(
  file
) {

  try {

    const bitmap =
      await createImageBitmap(
        file
      );

    const canvas =
      document.createElement(
        'canvas'
      );

    canvas.width =
      bitmap.width;

    canvas.height =
      bitmap.height;

    const ctx =
      canvas.getContext(
        '2d'
      );

    ctx.drawImage(
      bitmap,
      0,
      0
    );

    return canvas.toDataURL(
      'image/jpeg',
      0.92
    );

  } catch (
    err
  ) {

    console.warn(
      'Decode failed:',
      file.name,
      err
    );

    return null;
  }
}

// ======================================================
// LOAD IMAGE
// ======================================================

async function loadImage(
  file,
  index
) {

  const dataUrl =
    await fileToDataUrl(
      file
    );

  if (!dataUrl) {
    return;
  }

  images[index] =
    dataUrl;

  updateSlotPreview(
    slotRefs[index],
    dataUrl
  );

  generateComposition();
}

// ======================================================
// DELETE IMAGE
// ======================================================

function deleteSlotImage(
  index
) {

  const ok =
    confirm(
      'Remove image?'
    );

  if (!ok) {
    return;
  }

  images[index] =
    null;

  updateSlotPreview(
    slotRefs[index],
    null
  );

  generateComposition();
}

// ======================================================
// SLOT SYSTEM
// ======================================================

for (
  let i = 0;
  i < TOTAL;
  i++
) {

  const slot =
    document.createElement(
      'div'
    );

  slot.className =
    `
    relative
    aspect-square
    rounded-xl
    border-2
    border-dashed
    border-zinc-700
    bg-zinc-950
    overflow-hidden
    cursor-pointer
    transition
    hover:border-white
    `;

  slot.innerHTML =
    `
    <div
      class="
        slotLabel
        absolute
        inset-0
        flex
        items-center
        justify-center
        text-xs
        text-zinc-500
      "
    >
      SLOT ${i + 1}
    </div>

    <button
      class="
        deleteBtn
        hidden
        absolute
        top-2
        right-2
        z-20
        w-7
        h-7
        rounded-full
        bg-red-600
        text-white
      "
    >
      ×
    </button>

    <input
      type="file"
      class="hidden"
      accept="image/*"
    />
    `;

  const input =
    slot.querySelector(
      'input'
    );

  const deleteBtn =
    slot.querySelector(
      '.deleteBtn'
    );

  slotRefs.push(
    slot
  );

  slot.addEventListener(
    'click',
    e => {

      if (
        e.target === deleteBtn
      ) {
        return;
      }

      input.value =
        '';

      input.click();
    }
  );

  deleteBtn.addEventListener(
    'click',
    e => {

      e.stopPropagation();

      deleteSlotImage(i);
    }
  );

  input.addEventListener(
    'change',
    e => {

      const file =
        e.target.files?.[0];

      if (!file) {
        return;
      }

      loadImage(
        file,
        i
      );
    }
  );

  slot.addEventListener(
    'dragover',
    e => {

      e.preventDefault();

      slot.classList.add(
        'border-white'
      );
    }
  );

  slot.addEventListener(
    'dragleave',
    () => {

      slot.classList.remove(
        'border-white'
      );
    }
  );

  slot.addEventListener(
    'drop',
    e => {

      e.preventDefault();

      slot.classList.remove(
        'border-white'
      );

      const file =
        e.dataTransfer?.files?.[0];

      if (!file) {
        return;
      }

      loadImage(
        file,
        i
      );
    }
  );

  slotsEl.appendChild(
    slot
  );
}


// ======================================================
// FOLDER IMPORT
// ======================================================

folderBtn.addEventListener(
  "click",
  () => {

    folderInput.value = "";
    folderInput.click();
  }
);

folderInput.addEventListener(
  "change",
  async e => {

    const files =
      [...e.target.files]
        .filter(
          file =>
            file.type.startsWith("image/") ||
            /\.(png|jpe?g|webp|gif|heic|avif)$/i.test(
              file.name
            )
        );

    if (!files.length) {
      return;
    }

    const hasExisting =
      images.some(Boolean);

    let replace = true;

    if (hasExisting) {

      replace = confirm(
        "Replace current images?\n\nCancel = append"
      );
    }

    if (replace) {

      images.fill(null);

      slotRefs.forEach(
        slot => {

          updateSlotPreview(
            slot,
            null
          );
        }
      );
    }

    let slotIndex =
      replace
        ? 0
        : images.findIndex(
            img => !img
          );

    if (slotIndex === -1) {
      slotIndex = TOTAL;
    }

    const loaded =
      await Promise.all(
        files.map(
          file =>
            fileToDataUrl(file)
        )
      );

    for (const dataUrl of loaded) {

      if (!dataUrl) {
        continue;
      }

      if (slotIndex >= TOTAL) {
        break;
      }

      images[slotIndex] = dataUrl;

      updateSlotPreview(
        slotRefs[slotIndex],
        dataUrl
      );

      slotIndex++;
    }

    generateComposition();

    folderInput.value = "";
  }
);
// ======================================================
// RECT SPLIT
// ======================================================

function splitRect(
  rect
) {

  const vertical =
    rand(
      0,
      1
    ) > 0.5;

  const split =
    rand(
      0.3,
      0.7
    );

  if (vertical) {

    return [

      {
        x: rect.x,
        y: rect.y,
        w: rect.w * split,
        h: rect.h
      },

      {
        x:
          rect.x +
          rect.w * split,

        y: rect.y,

        w:
          rect.w *
          (
            1 - split
          ),

        h: rect.h
      }
    ];
  }

  return [

    {
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h * split
    },

    {
      x: rect.x,

      y:
        rect.y +
        rect.h * split,

      w: rect.w,

      h:
        rect.h *
        (
          1 - split
        )
    }
  ];
}

// ======================================================
// LAYOUTS
// ======================================================

function layoutOriginal(
  count
) {

  const boxes =
    [];

  if (!count) {
    return boxes;
  }

  const baseCols =
    Math.ceil(
      Math.sqrt(
        count *
        rand(
          1.2,
          2.2
        )
      )
    );

  const baseRows =
    Math.ceil(
      count /
      baseCols
    );

  const cellW =
    W / baseCols;

  const cellH =
    H / baseRows;

  let index =
    0;

  for (
    let r = 0;
    r < baseRows;
    r++
  ) {

    for (
      let c = 0;
      c < baseCols;
      c++
    ) {

      if (
        index >= count
      ) {
        break;
      }

      const wScale =
        rand(
          0.6,
          1.8
        );

      const hScale =
        rand(
          0.6,
          1.8
        );

      const x =
        c * cellW;

      const y =
        r * cellH;

      let w =
        cellW *
        wScale;

      let h =
        cellH *
        hScale;

      if (
        x + w > W
      ) {
        w = W - x;
      }

      if (
        y + h > H
      ) {
        h = H - y;
      }

      boxes.push({
        x,
        y,
        w,
        h
      });

      index++;
    }
  }

  return shuffle(
    boxes
  );
}

function layoutPacked(
  count
) {

  if (!count) {
    return [];
  }

  let rects =
    [
      {
        x: 0,
        y: 0,
        w: W,
        h: H
      }
    ];

  while (
    rects.length < count
  ) {

    rects.sort(
      (
        a,
        b
      ) =>
        (
          b.w * b.h
        ) -
        (
          a.w * a.h
        )
    );

    const rect =
      rects.shift();

    if (!rect) {
      break;
    }

    rects.push(
      ...splitRect(rect)
    );
  }

  return shuffle(
    rects.slice(
      0,
      count
    )
  );
}

function layoutGrid(
  count
) {

  const boxes =
    [];

  const cols =
    Math.ceil(
      Math.sqrt(
        count
      )
    );

  const rows =
    Math.ceil(
      count / cols
    );

  const cellW =
    W / cols;

  const cellH =
    H / rows;

  let index =
    0;

  for (
    let r = 0;
    r < rows;
    r++
  ) {

    for (
      let c = 0;
      c < cols;
      c++
    ) {

      if (
        index >= count
      ) {
        break;
      }

      boxes.push({

        x:
          c * cellW,

        y:
          r * cellH,

        w:
          cellW,

        h:
          cellH
      });

      index++;
    }
  }

  return boxes;
}

function layoutScatter(
  count
) {

  return Array.from(
    {
      length: count
    },
    () => ({

      x:
        rand(
          0,
          W * 0.7
        ),

      y:
        rand(
          0,
          H * 0.7
        ),

      w:
        rand(
          200,
          500
        ),

      h:
        rand(
          200,
          500
        )
    })
  );
}

function layoutStrips(
  count
) {

  const stripH =
    H / count;

  return Array.from(
    {
      length: count
    },
    (
      _,
      i
    ) => ({

      x: 0,

      y:
        i * stripH,

      w: W,

      h: stripH
    })
  );
}

function layoutDiagonal(
  count
) {

  return Array.from(
    {
      length: count
    },
    (
      _,
      i
    ) => ({

      x:
        (
          W / count
        ) * i,

      y:
        (
          H / count
        ) * i,

      w:
        W / 3,

      h:
        H / 3
    })
  );
}

function layoutMosaic(
  count
) {

  return layoutGrid(
    count
  ).map(
    box => ({

      ...box,

      w:
        box.w *
        rand(
          0.7,
          1.3
        ),

      h:
        box.h *
        rand(
          0.7,
          1.3
        )
    })
  );
}

function layoutColumns(
  count
) {

  const colW =
    W / count;

  return Array.from(
    {
      length: count
    },
    (
      _,
      i
    ) => ({

      x:
        i * colW,

      y: 0,

      w:
        colW,

      h: H
    })
  );
}

function layoutRows(
  count
) {

  return layoutStrips(
    count
  );
}

function layoutRadial(
  count
) {

  const cx =
    W / 2;

  const cy =
    H / 2;

  const radius =
    Math.min(
      W,
      H
    ) * 0.3;

  return Array.from(
    {
      length: count
    },
    (
      _,
      i
    ) => {

      const angle =
        (
          Math.PI * 2 /
          count
        ) * i;

      return {

        x:
          cx +
          Math.cos(
            angle
          ) *
          radius -
          180,

        y:
          cy +
          Math.sin(
            angle
          ) *
          radius -
          180,

        w: 360,
        h: 360
      };
    }
  );
}

function layoutBigSmall(
  count
) {

  if (!count) {
    return [];
  }

  const boxes =
    [
      {
        x: 0,
        y: 0,
        w: W * 0.6,
        h: H
      }
    ];

  const remain =
    count - 1;

  if (
    remain <= 0
  ) {
    return boxes;
  }

  const smallH =
    H / remain;

  for (
    let i = 0;
    i < remain;
    i++
  ) {

    boxes.push({

      x:
        W * 0.6,

      y:
        i * smallH,

      w:
        W * 0.4,

      h:
        smallH
    });
  }

  return boxes;
}

function layoutFrame(
  count
) {

  return layoutPacked(
    count
  );
}

function layoutSpiral(
  count
) {

  return Array.from(
    {
      length: count
    },
    (
      _,
      i
    ) => {

      const angle =
        i * 0.7;

      const radius =
        i * 50;

      return {

        x:
          W / 2 +
          Math.cos(
            angle
          ) *
          radius,

        y:
          H / 2 +
          Math.sin(
            angle
          ) *
          radius,

        w: 320,
        h: 320
      };
    }
  );
}

function layoutQuilt(
  count
) {

  return layoutMosaic(
    count
  );
}

// ======================================================
// LAYOUT ROUTER
// ======================================================

function getLayout(
  count
) {

  switch (
    LAYOUT_MODE
  ) {

    case 'original':
      return layoutOriginal(
        count
      );

    case 'packed':
      return layoutPacked(
        count
      );

    case 'grid':
      return layoutGrid(
        count
      );

    case 'scatter':
      return layoutScatter(
        count
      );

    case 'strips':
      return layoutStrips(
        count
      );

    case 'diagonal':
      return layoutDiagonal(
        count
      );

    case 'mosaic':
      return layoutMosaic(
        count
      );

    case 'columns':
      return layoutColumns(
        count
      );

    case 'rows':
      return layoutRows(
        count
      );

    case 'radial':
      return layoutRadial(
        count
      );

    case 'bigsmall':
      return layoutBigSmall(
        count
      );

    case 'frame':
      return layoutFrame(
        count
      );

    case 'spiral':
      return layoutSpiral(
        count
      );

    case 'quilt':
      return layoutQuilt(
        count
      );

    default:
      return layoutOriginal(
        count
      );
  }
}

// ======================================================
// COMPOSITION
// ======================================================

function generateComposition() {

  const active =
    images.filter(
      Boolean
    );

  const layout =
    getLayout(
      active.length
    );

  const shuffled =
    shuffle(
      [...active]
    );

  composition =
    shuffled.map(
      (
        src,
        i
      ) => ({

        src,

        box:
          layout[i],

        rotSeed:
          rand(
            -1,
            1
          )
      })
    );

  render();
}

// ======================================================
// RENDER
// ======================================================

function render() {

  stage.innerHTML =
    '';

  for (
    const item of composition
  ) {

    if (
      !item.box
    ) {
      continue;
    }

    const {
      src,
      box,
      rotSeed
    } = item;

    const rotation =
      rotSeed *
      ROTATION;

    const frame =
      document.createElement(
        'div'
      );

    frame.className =
      `
      absolute
      overflow-hidden
      bg-white
      `;

    frame.style.left =
      box.x + 'px';

    frame.style.top =
      box.y + 'px';

    frame.style.width =
      box.w + 'px';

    frame.style.height =
      box.h + 'px';

    const inner =
      document.createElement(
        'div'
      );

    inner.className =
      `
      absolute
      overflow-hidden
      bg-black
      `;

    inner.style.left =
      BORDER + 'px';

    inner.style.top =
      BORDER + 'px';

    inner.style.right =
      BORDER + 'px';

    inner.style.bottom =
      BORDER + 'px';

    inner.style.transform =
      `rotate(${rotation}deg)`;

    const img =
      document.createElement(
        'img'
      );

    img.src =
      src;

    img.draggable =
      false;

    img.className =
      `
      absolute
      inset-0
      w-full
      h-full
      object-cover
      pointer-events-none
      select-none
      `;

    inner.appendChild(
      img
    );

    frame.appendChild(
      inner
    );

    stage.appendChild(
      frame
    );
  }
}

// ======================================================
// UI EVENTS
// ======================================================

layoutSelect?.addEventListener(
  'change',
  e => {

    LAYOUT_MODE =
      e.target.value;

    generateComposition();
  }
);

rotationSlider?.addEventListener(
  'input',
  e => {

    ROTATION =
      parseInt(
        e.target.value
      );

    rotationValue.textContent =
      ROTATION + '°';

    render();
  }
);

borderSlider?.addEventListener(
  'input',
  e => {

    BORDER =
      parseInt(
        e.target.value
      );

    borderValue.textContent =
      BORDER + 'px';

    render();
  }
);

randomizeBtn.onclick =
  () => {

    seed =
      Math.random() *
      999999;

    generateComposition();
  };

clearBtn.onclick =
  () => {

    const ok =
      confirm(
        'Clear all images?'
      );

    if (!ok) {
      return;
    }

    images.fill(
      null
    );

    composition =
      [];

    slotRefs.forEach(
      slot => {

        updateSlotPreview(
          slot,
          null
        );
      }
    );

    render();
  };