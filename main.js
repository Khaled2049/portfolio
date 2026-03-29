/* ============================================================
   SECTION LOADER
============================================================ */
const SECTIONS = [
  "sections/hero.html",
  "sections/work-experience.html",
  "sections/projects.html",
  "sections/education.html",
  "sections/about.html",
];

async function loadSections() {
  const container = document.getElementById("page-content");
  const responses = await Promise.all(
    SECTIONS.map(function (url) {
      return fetch(url);
    }),
  );
  const htmlFragments = await Promise.all(
    responses.map(function (res) {
      if (!res.ok) throw new Error("Failed to load: " + res.url);
      return res.text();
    }),
  );
  const temp = document.createElement("div");
  htmlFragments.forEach(function (html) {
    temp.innerHTML = html;
    while (temp.firstChild) {
      container.appendChild(temp.firstChild);
    }
  });
  // Scripts injected via innerHTML are inert — re-create them so they execute
  container.querySelectorAll("script").forEach(function (oldScript) {
    const newScript = document.createElement("script");
    if (oldScript.type) newScript.type = oldScript.type;
    if (oldScript.src) {
      newScript.src = oldScript.src;
    } else {
      newScript.textContent = oldScript.textContent;
    }
    oldScript.replaceWith(newScript);
  });
}

/* ============================================================
   PERLIN NOISE
============================================================ */
(function () {
  const perm = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
    36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120,
    234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71,
    134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133,
    230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
    1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130,
    116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250,
    124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227,
    47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
    154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98,
    108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34,
    242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14,
    239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
    50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243,
    141, 128, 195, 78, 66, 215, 61, 156, 180,
  ];
  const p = new Array(512);
  for (let i = 0; i < 256; i++) p[256 + i] = p[i] = perm[i];

  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  function lerp(a, b, t) {
    return a + t * (b - a);
  }
  function grad(h, x, y, z) {
    h &= 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return (h & 1 ? -u : u) + (h & 2 ? -v : v);
  }

  window.perlinNoise = function (x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x),
      v = fade(y),
      w = fade(z);
    const A = p[X] + Y,
      AA = p[A] + Z,
      AB = p[A + 1] + Z;
    const B = p[X + 1] + Y,
      BA = p[B] + Z,
      BB = p[B + 1] + Z;
    return lerp(
      lerp(
        lerp(grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z), u),
        lerp(grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z), u),
        v,
      ),
      lerp(
        lerp(grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1), u),
        lerp(
          grad(p[AB + 1], x, y - 1, z - 1),
          grad(p[BB + 1], x - 1, y - 1, z - 1),
          u,
        ),
        v,
      ),
      w,
    );
  };
})();

/* ============================================================
   MOUNTAIN HEIGHT CONSTANTS
   ── Particle silhouette peaks (mountainProfile gaussians)
      PEAK_*  = height of each gaussian summit
   ── Ridge silhouettes (dark layered shapes behind terrain)
      RIDGE_HEIGHT_BASE  = minimum peak height
      RIDGE_HEIGHT_RANGE = random height added on top of base
      RIDGE_JITTER       = extra midpoint jitter between peaks
   ── Terrain mesh noise amplitude
      TERRAIN_AMP_LARGE  = large-scale rolling hills amplitude
      TERRAIN_AMP_DETAIL = fine-detail noise amplitude
============================================================ */
const PEAK_DOMINANT = 40.0; // tallest centre peak (particle silhouette)
const PEAK_RIGHT = 32.0; // secondary peak to the right
const PEAK_LEFT = 8.0; // secondary peak to the left
const PEAK_FAR_RIGHT = 4.5; // distant foothill right
const PEAK_FAR_LEFT = 2.5; // distant foothill left

const RIDGE_HEIGHT_BASE = 3; // shortest possible ridge peak
const RIDGE_HEIGHT_RANGE = 32; // random height added on top of base
const RIDGE_JITTER = 6.0; // midpoint curve jitter between peaks

const TERRAIN_AMP_LARGE = 2.0; // large rolling waves
const TERRAIN_AMP_DETAIL = 5.5; // fine surface detail

/* ============================================================
   MOUNTAIN PROFILE
   Returns the height (Y) of the ridge silhouette at a given
   world X position. Models a Colorado-style range: one dominant
   peak, two secondaries, two distant foothills.
============================================================ */
function mountainProfile(x) {
  return (
    PEAK_DOMINANT * Math.exp(-0.5 * Math.pow((x + 1.0) / 5.5, 2)) +
    PEAK_RIGHT * Math.exp(-0.5 * Math.pow((x - 9.5) / 4.0, 2)) +
    PEAK_LEFT * Math.exp(-0.5 * Math.pow((x + 13.0) / 4.5, 2)) +
    PEAK_FAR_RIGHT * Math.exp(-0.5 * Math.pow((x - 19.0) / 3.5, 2)) +
    PEAK_FAR_LEFT * Math.exp(-0.5 * Math.pow((x + 22.0) / 3.5, 2))
  );
}

/* ============================================================
   PARTICLE SCROLL STATE
   Updated by a scroll listener added after sections load.
============================================================ */
let particleScrollT = 0;

/* ============================================================
   THREE.JS — TERRAIN + PARTICLE CONSTELLATION
   Both systems share one renderer / scene / camera / RAF loop.
============================================================ */
function initThreeEffects() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (typeof THREE === "undefined") return;

  const canvas = document.getElementById("terrain-canvas");
  const heroSection = document.getElementById("hero");
  if (!canvas || !heroSection) return;

  /* ---- Renderer ---- */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(heroSection.offsetWidth, heroSection.offsetHeight);
  renderer.setClearColor(0x000000, 0);

  /* ---- Scene + Camera ---- */
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x1d2021, 38, 105);

  const camera = new THREE.PerspectiveCamera(
    52,
    heroSection.offsetWidth / heroSection.offsetHeight,
    0.1,
    200,
  );
  camera.position.set(0, 30, 55);
  camera.lookAt(0, -3, 0);

  /* ----------------------------------------------------------
     TERRAIN MESH
  ---------------------------------------------------------- */
  const SEG = 58;
  const TERRAIN_WIDTH = 220; // horizontal span of the mesh
  const TERRAIN_DEPTH = 120; // front-to-back span of the mesh
  const terrGeo = new THREE.PlaneGeometry(TERRAIN_WIDTH, TERRAIN_DEPTH, SEG, SEG);
  terrGeo.rotateX(-Math.PI / 2);

  const terrPos = terrGeo.attributes.position;
  const baseXZ = new Float32Array(terrPos.count * 2);
  for (let i = 0; i < terrPos.count; i++) {
    baseXZ[i * 2] = terrPos.getX(i);
    baseXZ[i * 2 + 1] = terrPos.getZ(i);
  }

  function applyTerrainNoise(t) {
    for (let i = 0; i < terrPos.count; i++) {
      const x = baseXZ[i * 2];
      const z = baseXZ[i * 2 + 1];
      terrPos.setY(
        i,
        perlinNoise(x * 0.038, z * 0.038, t * 0.45) * TERRAIN_AMP_LARGE +
          perlinNoise(x * 0.09, z * 0.09, t * 0.25) * TERRAIN_AMP_DETAIL,
      );
    }
    terrPos.needsUpdate = true;
  }

  applyTerrainNoise(0);

  const terrainMat = new THREE.MeshBasicMaterial({
    color: 0x427b58,
    wireframe: true,
  });
  const terrainMesh = new THREE.Mesh(terrGeo, terrainMat);

  /* ----------------------------------------------------------
     SILHOUETTE MOUNTAIN RIDGES (ShapeGeometry, behind terrain)
  ---------------------------------------------------------- */
  function buildRidgeShape(width, yBottom, peakCount) {
    const shape = new THREE.Shape();
    const half = width * 0.5;
    const n = Math.max(2, peakCount);
    const peaks = [];
    for (let i = 0; i < n; i++) {
      const t = n <= 1 ? 0 : i / (n - 1);
      const x = -half + t * width;
      const h =
        RIDGE_HEIGHT_BASE +
        Math.random() * RIDGE_HEIGHT_RANGE +
        Math.sin(t * Math.PI * 2.4 + Math.random()) * 8 +
        Math.sin(t * Math.PI * 5 + Math.random() * 2) * 4;
      peaks.push({ x, y: yBottom + h });
    }
    shape.moveTo(-half, yBottom);
    shape.lineTo(peaks[0].x, peaks[0].y);
    for (let i = 0; i < n - 1; i++) {
      const p0 = peaks[i];
      const p1 = peaks[i + 1];
      const mx = (p0.x + p1.x) * 0.5;
      const my = (p0.y + p1.y) * 0.5 + (Math.random() - 0.5) * RIDGE_JITTER;
      shape.quadraticCurveTo(mx, my, p1.x, p1.y);
    }
    shape.lineTo(half, yBottom);
    shape.lineTo(-half, yBottom);
    return shape;
  }

  function frustumWorldWidthAtZ(camera, planeZ) {
    const camZ = camera.position.z;
    const dist = Math.abs(camZ - planeZ);
    const vFOV = (camera.fov * Math.PI) / 180;
    const h = 2 * Math.tan(vFOV * 0.5) * dist;
    return h * camera.aspect;
  }

  const ridgeZ = [-18, -13, -8];
  const ridgeColors = [0x2a3728, 0x2e3d2b, 0x344535];
  const ridgeParallaxK = [0.04, 0.07, 0.12];
  const ridgeGroups = [];

  for (let r = 0; r < 3; r++) {
    const w = frustumWorldWidthAtZ(camera, ridgeZ[r]) * 1.08;
    const yBottom = 2.5 + r * 0.6;
    const peakCount = 12 + Math.floor(Math.random() * 7);
    const geo = new THREE.ShapeGeometry(buildRidgeShape(w, yBottom, peakCount));
    const mat = new THREE.MeshBasicMaterial({
      color: ridgeColors[r],
      side: THREE.DoubleSide,
      depthWrite: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.ridgeBaseW = w;
    const grp = new THREE.Group();
    grp.add(mesh);
    grp.position.set(0, 0, ridgeZ[r]);
    scene.add(grp);
    ridgeGroups.push({ group: grp, k: ridgeParallaxK[r] });
  }

  scene.add(terrainMesh);

  /* ----------------------------------------------------------
     LOW-POLY PINE TREES (raycast to terrain)
  ---------------------------------------------------------- */
  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  const trees = [];
  const MAX_TREE_TRIES = 20000;
  let treeTries = 0;

  while (trees.length < 90 && treeTries < MAX_TREE_TRIES) {
    treeTries++;
    const tx = (Math.random() - 0.5) * 110;
    const tz = (Math.random() - 0.5) * 110;
    raycaster.set(new THREE.Vector3(tx, 120, tz), down);
    const hit = raycaster.intersectObject(terrainMesh, false);
    if (!hit.length) continue;
    const yHit = hit[0].point.y;
    if (yHit <= 0.8) continue;

    const coneH = 0.9 + Math.random() * 0.5;
    const coneR = 0.25 + Math.random() * 0.1;
    const coneSeg = 6;
    const u = Math.random();
    const cr = Math.round(0x3a + (0x4a - 0x3a) * u);
    const cg = Math.round(0x4f + (0x66 - 0x4f) * u);
    const cb = Math.round(0x35 + (0x45 - 0x35) * u);
    const canopyColor = (cr << 16) | (cg << 8) | cb;

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(coneR, coneH, coneSeg),
      new THREE.MeshBasicMaterial({ color: canopyColor }),
    );
    cone.position.set(0, 0.25 + coneH * 0.5, 0);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.06, 0.25, 5),
      new THREE.MeshBasicMaterial({ color: 0x2c1f14 }),
    );
    trunk.position.set(0, 0.125, 0);

    const treeGroup = new THREE.Group();
    treeGroup.add(trunk);
    treeGroup.add(cone);
    treeGroup.position.set(tx, yHit, tz);

    const tiltX = (Math.random() - 0.5) * 2 * 0.04;
    const tiltZ = (Math.random() - 0.5) * 2 * 0.04;
    treeGroup.rotation.x = tiltX;
    treeGroup.rotation.z = tiltZ;

    scene.add(treeGroup);
    trees.push({
      group: treeGroup,
      x: tx,
      z: tz,
      tiltX: tiltX,
      tiltZ: tiltZ,
      index: trees.length,
    });
  }

  /* ----------------------------------------------------------
     MINI SKIERS
  ---------------------------------------------------------- */
  const SKIER_SIZE = 2.0; // scale multiplier for all skier geometry
  const SKIER_SPEED_MIN = 0.75; // slowest skier speed
  const SKIER_SPEED_MAX = 1.25; // fastest skier speed

  function createSkierMesh(jacketColor) {
    const g = new THREE.Group();
    const s = SKIER_SIZE;

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045 * s, 0.06 * s, 0.22 * s, 5),
      new THREE.MeshBasicMaterial({ color: jacketColor }),
    );
    body.position.set(0, 0.11 * s, 0);

    const head = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.075 * s, 0),
      new THREE.MeshBasicMaterial({ color: 0xd5c4a1 }),
    );
    head.position.set(0, 0.3 * s, 0);

    const skiMat = new THREE.MeshBasicMaterial({ color: 0x8ec07c });
    const skiL = new THREE.Mesh(
      new THREE.BoxGeometry(0.06 * s, 0.018 * s, 0.38 * s),
      skiMat,
    );
    skiL.position.set(-0.07 * s, -0.14 * s, 0);
    const skiR = new THREE.Mesh(
      new THREE.BoxGeometry(0.06 * s, 0.018 * s, 0.38 * s),
      skiMat,
    );
    skiR.position.set(0.07 * s, -0.14 * s, 0);

    const poleMat = new THREE.MeshBasicMaterial({ color: 0x928374 });
    const poleL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008 * s, 0.008 * s, 0.28 * s, 3),
      poleMat,
    );
    poleL.position.set(-0.12 * s, 0.04 * s, 0.06 * s);
    poleL.rotation.z = 0.45;
    poleL.rotation.x = -0.3;
    const poleR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008 * s, 0.008 * s, 0.28 * s, 3),
      poleMat,
    );
    poleR.position.set(0.12 * s, 0.04 * s, 0.06 * s);
    poleR.rotation.z = -0.45;
    poleR.rotation.x = -0.3;

    g.add(body, head, skiL, skiR, poleL, poleR);
    return g;
  }

  const SKIER_COUNT = 15;
  const skiers = [];
  const jacketColors = [
    0xd5c4a1, 0xb8bb26, 0x8ec07c, 0xe06c75, 0xd3869b, 0xfe8019, 0x83a598,
    0xfabd2f,
  ];

  for (let i = 0; i < SKIER_COUNT; i++) {
    const group = createSkierMesh(jacketColors[i]);
    // spread across different Z depths, all close enough to be clearly visible
    const fixedZ = -5 + (i % 4) * 8;
    // stagger starting X so they enter the scene at different times
    const startX = -58 + i * 14;
    const speed =
      SKIER_SPEED_MIN + Math.random() * (SKIER_SPEED_MAX - SKIER_SPEED_MIN);
    const wobble = Math.random() * Math.PI * 2;

    raycaster.set(new THREE.Vector3(startX, 140, fixedZ), down);
    const sh = raycaster.intersectObject(terrainMesh, false);
    const startY = sh.length ? sh[0].point.y : 0;
    group.position.set(startX, startY, fixedZ);
    // face right (+X direction); skis are along local Z so rotate -90° around Y
    group.rotation.y = -Math.PI / 2;

    scene.add(group);
    skiers.push({ group, x: startX, z: fixedZ, speed, wobble });
  }

  /* ----------------------------------------------------------
     PARTICLE CONSTELLATION
  ---------------------------------------------------------- */
  const N = 2000;

  /* Soft circular glow texture drawn on a scratch canvas */
  const ptCanvas = document.createElement("canvas");
  ptCanvas.width = ptCanvas.height = 64;
  const ptCtx = ptCanvas.getContext("2d");
  const grd = ptCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1.0)");
  grd.addColorStop(0.35, "rgba(255,255,255,0.7)");
  grd.addColorStop(1, "rgba(255,255,255,0.0)");
  ptCtx.fillStyle = grd;
  ptCtx.fillRect(0, 0, 64, 64);

  const ptPositions = new Float32Array(N * 3);
  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPositions, 3));

  const ptMat = new THREE.PointsMaterial({
    color: 0x8ec07c,
    size: 0.42,
    map: new THREE.CanvasTexture(ptCanvas),
    transparent: true,
    opacity: 0.68,
    alphaTest: 0.005,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  scene.add(new THREE.Points(ptGeo, ptMat));

  /* Per-particle state (typed arrays for speed) */
  const driftPos = new Float32Array(N * 3);
  const driftVel = new Float32Array(N * 3);
  const targetPos = new Float32Array(N * 3);

  /* Initialise drift — particles fill a wide 3D volume */
  for (let i = 0; i < N; i++) {
    const x = (Math.random() - 0.5) * 90;
    const y = (Math.random() - 0.5) * 55 + 10;
    const z = (Math.random() - 0.5) * 65;
    driftPos[i * 3] = x;
    driftPos[i * 3 + 1] = y;
    driftPos[i * 3 + 2] = z;
    driftVel[i * 3] = (Math.random() - 0.5) * 0.026;
    driftVel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    driftVel[i * 3 + 2] = (Math.random() - 0.5) * 0.016;
    ptPositions[i * 3] = x;
    ptPositions[i * 3 + 1] = y;
    ptPositions[i * 3 + 2] = z;
  }

  /* Initialise target — mountain ridge silhouette
     85 % of particles cluster along the profile curve (±0.8 units),
     15 % scatter loosely above as atmospheric haze. */
  const RIDGE_COUNT = Math.floor(N * 0.85);
  for (let i = 0; i < N; i++) {
    if (i < RIDGE_COUNT) {
      const x = (Math.random() - 0.5) * 52;
      targetPos[i * 3] = x;
      targetPos[i * 3 + 1] =
        mountainProfile(x) + 7.0 + (Math.random() - 0.5) * 1.6;
      targetPos[i * 3 + 2] = (Math.random() - 0.5) * 9;
    } else {
      targetPos[i * 3] = (Math.random() - 0.5) * 70;
      targetPos[i * 3 + 1] = Math.random() * 28 + 4;
      targetPos[i * 3 + 2] = (Math.random() - 0.5) * 28;
    }
  }

  /* Per-frame particle update */
  function updateParticles(rawT) {
    /* Smoothstep easing on the scroll factor */
    const t = rawT * rawT * (3.0 - 2.0 * rawT);
    /* Drift slows almost to a stop as particles converge */
    const driftScale = 1.0 - t * 0.94;

    for (let i = 0; i < N; i++) {
      const xi = i * 3,
        yi = xi + 1,
        zi = xi + 2;

      driftPos[xi] += driftVel[xi] * driftScale;
      driftPos[yi] += driftVel[yi] * driftScale;
      driftPos[zi] += driftVel[zi] * driftScale;

      /* Soft bounce at volume boundary */
      if (Math.abs(driftPos[xi]) > 48) driftVel[xi] *= -1;
      if (Math.abs(driftPos[yi]) > 32) driftVel[yi] *= -1;
      if (Math.abs(driftPos[zi]) > 36) driftVel[zi] *= -1;

      /* Lerp rendered position between drift and target */
      const s = 1.0 - t;
      ptPositions[xi] = driftPos[xi] * s + targetPos[xi] * t;
      ptPositions[yi] = driftPos[yi] * s + targetPos[yi] * t;
      ptPositions[zi] = driftPos[zi] * s + targetPos[zi] * t;
    }
    ptGeo.attributes.position.needsUpdate = true;
  }

  /* ----------------------------------------------------------
     ANIMATION LOOP
  ---------------------------------------------------------- */
  let rafId = null;
  let running = false;
  let timeOff = 0;

  function animate() {
    rafId = requestAnimationFrame(animate);
    timeOff += 0.004;

    applyTerrainNoise(timeOff);
    terrGeo.computeBoundingSphere();
    updateParticles(particleScrollT);

    for (let ti = 0; ti < trees.length; ti++) {
      const tr = trees[ti];
      raycaster.set(new THREE.Vector3(tr.x, 140, tr.z), down);
      const th = raycaster.intersectObject(terrainMesh, false);
      if (th.length) {
        tr.group.position.y = th[0].point.y;
      }
      tr.group.rotation.x = tr.tiltX;
      tr.group.rotation.z =
        tr.tiltZ + Math.sin(timeOff * 0.6 + tr.index * 0.9) * 0.018;
    }

    for (let si = 0; si < skiers.length; si++) {
      const sk = skiers[si];

      // move left → right
      sk.x += 0.12 * sk.speed;
      // slalom: gentle Z wobble
      sk.z += Math.sin(timeOff * 0.55 + sk.wobble) * 0.014;

      // loop back to left when off screen right
      if (sk.x > 58) sk.x = -58;

      // raycast current height
      raycaster.set(new THREE.Vector3(sk.x, 140, sk.z), down);
      const sh = raycaster.intersectObject(terrainMesh, false);
      if (sh.length) {
        sk.group.position.set(sk.x, sh[0].point.y, sk.z);
      }

      // slope pitch in X direction → tilt around Z
      raycaster.set(new THREE.Vector3(sk.x + 0.4, 140, sk.z), down);
      const sa = raycaster.intersectObject(terrainMesh, false);
      const slopeTilt =
        sa.length && sh.length
          ? Math.atan2(sa[0].point.y - sh[0].point.y, 0.4)
          : 0;

      sk.group.rotation.y = -Math.PI / 2; // always face right
      sk.group.rotation.z = slopeTilt; // lean with terrain slope
      sk.group.rotation.x = Math.sin(timeOff * 0.55 + sk.wobble) * 0.12; // slalom lean
    }

    camera.position.x = 0;
    camera.position.y = 30;
    camera.position.z = 55;
    camera.lookAt(0, -3, 0);

    renderer.render(scene, camera);
  }

  function start() {
    if (!running) {
      running = true;
      animate();
    }
  }
  function stop() {
    if (running) {
      cancelAnimationFrame(rafId);
      running = false;
    }
  }

  document.addEventListener("visibilitychange", function () {
    document.hidden ? stop() : start();
  });

  new IntersectionObserver(
    function (entries) {
      entries[0].isIntersecting ? start() : stop();
    },
    { threshold: 0.01 },
  ).observe(heroSection);

  window.addEventListener("resize", function () {
    const w = heroSection.offsetWidth;
    const h = heroSection.offsetHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    for (let ri = 0; ri < ridgeGroups.length; ri++) {
      const mesh = ridgeGroups[ri].group.children[0];
      if (mesh && mesh.userData.ridgeBaseW) {
        const wNew = frustumWorldWidthAtZ(camera, ridgeZ[ri]) * 1.08;
        mesh.scale.x = wNew / mesh.userData.ridgeBaseW;
      }
    }
  });

  start();
}

/* ============================================================
   NAVIGATION SCROLL BEHAVIOUR
============================================================ */
function initNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  window.addEventListener(
    "scroll",
    function () {
      nav.classList.toggle("scrolled", window.scrollY > 60);
    },
    { passive: true },
  );
}

/* ============================================================
   SCROLL REVEAL
============================================================ */
function initScrollReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );

  document.querySelectorAll(".reveal").forEach(function (el) {
    observer.observe(el);
  });
}

/* ============================================================
   BOOT
============================================================ */
loadSections()
  .then(function () {
    /* Track scroll progress for particle convergence.
       Particles fully form by the time the user has scrolled
       65 % of the hero height. */
    window.addEventListener(
      "scroll",
      function () {
        particleScrollT = Math.min(
          window.scrollY / (window.innerHeight * 0.65),
          1.0,
        );
      },
      { passive: true },
    );

    initThreeEffects();
    initNav();
    initScrollReveal();
  })
  .catch(function (err) {
    console.error("Section load failed:", err);
  });
