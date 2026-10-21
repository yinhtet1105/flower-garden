
const svg = document.getElementById("gardenSvg");
const plantLayer = document.getElementById("plantLayer");
const garden = document.getElementById("garden");
const ripples = document.getElementById("ripples");
const stars = document.getElementById("stars");

const NS = "http://www.w3.org/2000/svg";

const flowerColors = [
  "url(#pinkPetal)",
  "url(#purplePetal)",
  "url(#peachPetal)",
  "url(#whitePetal)"
];

let flowerCount = 0;

// SVG element helper
function svgElement(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);

  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });

  return el;
}

// Background stars
function createStars() {
  stars.replaceChildren();

  for (let i = 0; i < 65; i++) {
    const star = document.createElement("span");

    star.className = "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty(
      "--duration",
      `${2 + Math.random() * 4}s`
    );
    star.style.setProperty(
      "--delay",
      `${Math.random() * -5}s`
    );

    stars.appendChild(star);
  }
}

// Flower with three layers of petals
function createFlower(x, y, color, size) {
  // This group keeps the flower permanently at (x, y).
  const flowerAnchor = svgElement("g", {
    transform: `translate(${x} ${y})`
  });

  const flower = svgElement("g", {
    class: "flower"
  });

  // Soft glow behind the petals
  const glow = svgElement("circle", {
    class: "flower-glow",
    cx: 0,
    cy: 0,
    r: 48 * size,
    fill: color
  });

  glow.style.filter = "blur(10px)";
  flower.appendChild(glow);

  // Outer layer
  const outer = svgElement("g");

  for (let i = 0; i < 28; i++) {
    const angle = (360 / 28) * i;

    const holder = svgElement("g", {
      transform: `rotate(${angle})`
    });

    holder.appendChild(svgElement("ellipse", {
      cx: 0,
      cy: -22 * size,
      rx: 9 * size,
      ry: 28 * size,
      fill: color,
      stroke: "#fff7fb",
      "stroke-width": 0.7,
      "stroke-opacity": 0.35
    }));

    outer.appendChild(holder);
  }

  flower.appendChild(outer);

  // Middle layer
  const middle = svgElement("g", {
    transform: "rotate(8)"
  });

  for (let i = 0; i < 22; i++) {
    const angle = (360 / 22) * i;

    const holder = svgElement("g", {
      transform: `rotate(${angle})`
    });

    holder.appendChild(svgElement("ellipse", {
      cx: 0,
      cy: -15 * size,
      rx: 8 * size,
      ry: 21 * size,
      fill: color,
      stroke: "#ffffff",
      "stroke-width": 0.6,
      "stroke-opacity": 0.4
    }));

    middle.appendChild(holder);
  }

  flower.appendChild(middle);

  // Inner layer
  const inner = svgElement("g", {
    transform: "rotate(16)"
  });

  for (let i = 0; i < 14; i++) {
    const angle = (360 / 14) * i;

    const holder = svgElement("g", {
      transform: `rotate(${angle})`
    });

    holder.appendChild(svgElement("ellipse", {
      cx: 0,
      cy: -9 * size,
      rx: 6 * size,
      ry: 13 * size,
      fill: color,
      stroke: "#ffffff",
      "stroke-width": 0.5,
      "stroke-opacity": 0.4
    }));

    inner.appendChild(holder);
  }

  flower.appendChild(inner);

  // Flower center
  const center = svgElement("g", {
    class: "flower-center"
  });

  center.appendChild(svgElement("circle", {
    cx: 0,
    cy: 0,
    r: 8 * size,
    fill: "url(#flowerCenter)"
  }));

  // Pollen details
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const radius = 4.8 * size;

    center.appendChild(svgElement("circle", {
      cx: Math.cos(angle) * radius,
      cy: Math.sin(angle) * radius,
      r: 1.1 * size,
      fill: "#fff9d1"
    }));
  }

  flower.appendChild(center);
  flowerAnchor.appendChild(flower);

  return flowerAnchor;
}

// Leaves positioned using the actual curved stem geometry
function createLeaves(group, stem, length, size) {
  const fractions = [0.24, 0.39, 0.54, 0.69, 0.82];

  fractions.forEach((fraction, index) => {
    // Get a real point on the curved stem.
    const point = stem.getPointAtLength(length * fraction);

    // Get the direction of the stem at that point.
    const before = stem.getPointAtLength(
      Math.max(0, length * fraction - 1)
    );

    const after = stem.getPointAtLength(
      Math.min(length, length * fraction + 1)
    );

    const tangentAngle = Math.atan2(
      after.y - before.y,
      after.x - before.x
    ) * 180 / Math.PI;

    // Alternate leaves on each side of the stem.
    const side = index % 2 === 0 ? -1 : 1;
    const leafAngle = tangentAngle + side * 52;

    // Local group follows the stem point.
    const leafGroup = svgElement("g", {
      transform:
        `translate(${point.x} ${point.y}) rotate(${leafAngle})`,
      style: `--leaf-delay:${index * 0.17}s`
    });

    const leaf = svgElement("path", {
      class: "leaf",
      d: `
        M 0 0
        C ${-9 * size} ${-6 * size},
          ${-25 * size} ${-22 * size},
          ${-8 * size} ${-32 * size}
        C ${8 * size} ${-27 * size},
          ${12 * size} ${-10 * size},
          0 0 Z
      `,
      fill: index % 2 === 0 ? "#70bd82" : "#9bdba0",
      stroke: "#4f9868",
      "stroke-width": 0.8
    });

    const vein = svgElement("path", {
      class: "leaf-vein",
      d: `M 0 0 Q ${-3 * size} ${-17 * size} ${-8 * size} ${-29 * size}`
    });

    leafGroup.appendChild(leaf);
    leafGroup.appendChild(vein);

    group.appendChild(leafGroup);
  });
}

// Click ripple
function createRipple(clientX, clientY) {
  const ripple = document.createElement("span");

  ripple.className = "ripple";
  ripple.style.left = `${clientX}px`;
  ripple.style.top = `${clientY}px`;

  ripples.appendChild(ripple);

  ripple.addEventListener("animationend", () => {
    ripple.remove();
  }, { once: true });
}

// Create one flower for each screen click
function growFlower(clientX, clientY) {
  const rect = svg.getBoundingClientRect();

  // Convert screen position into SVG viewBox coordinates.
  const x = (clientX - rect.left) / rect.width * 900;
  const y = (clientY - rect.top) / rect.height * 600;

  // Keep the flower away from the very top and bottom edges.
  const flowerX = Math.max(35, Math.min(865, x));
  const flowerY = Math.max(100, Math.min(550, y));

  // Stem starts near the ground, beneath the flower.
  const baseX = Math.max(
    15,
    Math.min(885, flowerX + (Math.random() - 0.5) * 150)
  );

  const baseY = 610;
  const dx = flowerX - baseX;
  const height = baseY - flowerY;

  // Curved stem ends exactly at the flower center.
  const control1X = baseX + dx * 0.15
    + (Math.random() - 0.5) * 60;

  const control1Y = baseY - height * 0.32;

  const control2X = flowerX - dx * 0.12
    + (Math.random() - 0.5) * 50;

  const control2Y = flowerY + height * 0.28;

  const pathData = `
    M ${baseX} ${baseY}
    C ${control1X} ${control1Y},
      ${control2X} ${control2Y},
      ${flowerX} ${flowerY}
  `;

  const plant = svgElement("g", {
    class: "plant"
  });

  // 1. Stem
  const stem = svgElement("path", {
    class: "stem",
    d: pathData
  });

  plant.appendChild(stem);

  // Measure the real curve before placing leaves.
  const stemLength = stem.getTotalLength();

  stem.style.setProperty("--length", stemLength);
  stem.style.strokeDasharray = stemLength;
  stem.style.strokeDashoffset = stemLength;

  const size = 0.7 + Math.random() * 0.4;

  const color = flowerColors[
    Math.floor(Math.random() * flowerColors.length)
  ];

  // 2. Leaves are anchored to points on this exact stem.
  createLeaves(plant, stem, stemLength, size);

  // 3. Flower center is anchored to the end of the stem.
  const flowerAnchor = createFlower(
    flowerX,
    flowerY,
    color,
    size
  );

  plant.appendChild(flowerAnchor);

  // Add this plant without changing existing plants.
  plantLayer.appendChild(plant);

  flowerCount++;

  // Stage 1: grow the stem.
  requestAnimationFrame(() => {
    plant.classList.add("growing");
  });

  // Stage 2: open the flower.
  setTimeout(() => {
    plant.classList.add("bloomed");
  }, 1250);

  // Stage 3: show leaves. Flower remains visible.
  setTimeout(() => {
    plant.classList.add("leaves-on");
  }, 2450);
}

// One click or tap = exactly one flower.
garden.addEventListener("pointerdown", (event) => {
  if (event.button !== undefined && event.button !== 0) {
    return;
  }

  createRipple(event.clientX, event.clientY);
  growFlower(event.clientX, event.clientY);
});

// Initialize background stars.
createStars();
