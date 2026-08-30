/* ============================================================
   THREE.JS — TERRAIN + PARTICLE CONSTELLATION
   Both systems share one renderer / scene / camera / RAF loop.
============================================================ */
import * as THREE from "three";
import { perlinNoise } from "./perlin.js";
import {
  RIDGE_HEIGHT_BASE,
  RIDGE_HEIGHT_RANGE,
  RIDGE_WAVE_AMP1,
  RIDGE_WAVE_AMP2,
  RIDGE_JITTER,
  RIDGE_Y_OFFSET,
  TERRAIN_AMP_LARGE,
  TERRAIN_AMP_DETAIL,
  MOON_RADIUS,
  MOON_X,
  MOON_Y,
  MOON_Z,
  MOON_COLOR,
  MOON_HALO_SCALE,
  MOON_ORBIT_RANGE,
  MOON_ORBIT_SPEED,
  MOON_BEHIND_DIP,
  MOON_BEHIND_Z_PULL,
  SUN_COLOR,
  mountainProfile,
} from "./constants.js";

/* `onReady` fires once the hero is done settling — after the first rendered
   frame, or immediately when the scene is skipped. The caller uses it to
   drop the boot overlay. */
export function initThreeEffects(scrollState, onReady) {
  let readyFired = false;
  function signalReady() {
    if (readyFired) return;
    readyFired = true;
    if (typeof onReady === "function") onReady();
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    signalReady();
    return;
  }

  const canvas = document.getElementById("terrain-canvas");
  const heroSection = document.getElementById("hero");
  if (!canvas || !heroSection) {
    signalReady();
    return;
  }

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
  const terrGeo = new THREE.PlaneGeometry(
    TERRAIN_WIDTH,
    TERRAIN_DEPTH,
    SEG,
    SEG,
  );
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
        Math.sin(t * Math.PI * 2.4 + Math.random()) * RIDGE_WAVE_AMP1 +
        Math.sin(t * Math.PI * 5 + Math.random() * 2) * RIDGE_WAVE_AMP2;
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
    const yBottom = RIDGE_Y_OFFSET + r * 0.6;
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
     MOON
  ---------------------------------------------------------- */
  const moonGroup = new THREE.Group();

  // soft halo behind the disc
  const haloMat = new THREE.MeshBasicMaterial({
    color: MOON_COLOR,
    transparent: true,
    opacity: 0.12,
    fog: false,
    depthWrite: false,
  });
  const haloMesh = new THREE.Mesh(
    new THREE.CircleGeometry(MOON_RADIUS * MOON_HALO_SCALE, 48),
    haloMat,
  );
  haloMesh.position.z = -0.1;

  // solid moon disc
  const moonMat = new THREE.MeshBasicMaterial({
    color: MOON_COLOR,
    fog: false,
  });
  const moonMesh = new THREE.Mesh(
    new THREE.CircleGeometry(MOON_RADIUS, 48),
    moonMat,
  );

  // sun rays (hidden until toggled)
  const rayCount = 12;
  const rayVerts = [];
  for (let i = 0; i < rayCount; i++) {
    const a = (i / rayCount) * Math.PI * 2;
    rayVerts.push(
      Math.cos(a) * MOON_RADIUS * 1.35,
      Math.sin(a) * MOON_RADIUS * 1.35,
      0,
      Math.cos(a) * MOON_RADIUS * 2.2,
      Math.sin(a) * MOON_RADIUS * 2.2,
      0,
    );
  }
  const rayGeo = new THREE.BufferGeometry();
  rayGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(rayVerts), 3),
  );
  const rayMat = new THREE.LineBasicMaterial({
    color: SUN_COLOR,
    fog: false,
    transparent: true,
    opacity: 0,
  });
  const sunRays = new THREE.LineSegments(rayGeo, rayMat);
  moonGroup.add(sunRays);

  moonGroup.add(haloMesh);
  moonGroup.add(moonMesh);
  moonGroup.position.set(MOON_X, MOON_Y, MOON_Z);
  scene.add(moonGroup);

  const moonClickTargets = [moonMesh, haloMesh];

  let isSun = false;
  let lastOrbitCycle = 0;

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
    skiers.push({
      group,
      x: startX,
      z: fixedZ,
      speed,
      wobble,
      vx: 0.12 * speed, // initial velocity: moving right
      vz: 0,
      // each skier targets a slightly different point around the mouse so they spread out
      offsetX: (Math.random() - 0.5) * 10,
      offsetZ: (Math.random() - 0.5) * 8,
    });
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
     MOUSE TARGET — skiers steer toward mouse position on terrain
  ---------------------------------------------------------- */
  let mouseTarget = null;
  const _mouseNDC = new THREE.Vector2();

  canvas.addEventListener("mousemove", function (e) {
    const rect = canvas.getBoundingClientRect();
    _mouseNDC.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(_mouseNDC, camera);
    const moonHover = raycaster.intersectObjects(moonClickTargets, false);
    canvas.style.cursor = moonHover.length ? "pointer" : "default";
    const hits = raycaster.intersectObject(terrainMesh, false);
    mouseTarget = hits.length
      ? { x: hits[0].point.x, z: hits[0].point.z }
      : null;
  });

  canvas.addEventListener("mouseleave", function () {
    mouseTarget = null;
  });

  /* ----------------------------------------------------------
     FIREWORKS
  ---------------------------------------------------------- */
  const fireworks = [];
  const FW_PARTICLE_COUNT = 90;
  const FW_COLORS = [
    0xfabd2f, 0xfe8019, 0xfb4934, 0xb8bb26, 0x8ec07c, 0x83a598, 0xd3869b,
    0xebdbb2,
  ];

  /* shared soft-circle glow texture (same technique as particle constellation) */
  const fwGlowCanvas = document.createElement("canvas");
  fwGlowCanvas.width = fwGlowCanvas.height = 32;
  const fwGlowCtx = fwGlowCanvas.getContext("2d");
  const fwGrd = fwGlowCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  fwGrd.addColorStop(0, "rgba(255,255,255,1.0)");
  fwGrd.addColorStop(0.4, "rgba(255,255,255,0.6)");
  fwGrd.addColorStop(1, "rgba(255,255,255,0.0)");
  fwGlowCtx.fillStyle = fwGrd;
  fwGlowCtx.fillRect(0, 0, 32, 32);
  const fwGlowTex = new THREE.CanvasTexture(fwGlowCanvas);

  function launchFirework(x, y, z) {
    const color = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];
    const positions = new Float32Array(FW_PARTICLE_COUNT * 3);
    const particles = [];

    for (let i = 0; i < FW_PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const spd = 0.18 + Math.random() * 0.28;
      particles.push({
        x,
        y,
        z,
        vx: Math.sin(phi) * Math.cos(theta) * spd,
        vy: Math.abs(Math.sin(phi) * Math.sin(theta)) * spd + 0.08, // bias upward on burst
        vz: Math.cos(phi) * spd,
      });
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color,
      size: 0.55,
      map: fwGlowTex,
      transparent: true,
      opacity: 1.0,
      alphaTest: 0.005,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);
    fireworks.push({ points, geo, mat, particles, life: 1.0 });
  }

  canvas.addEventListener("click", function (e) {
    const rect = canvas.getBoundingClientRect();
    _mouseNDC.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(_mouseNDC, camera);

    // moon/sun toggle takes priority (halo included — easier to hit than the disc alone)
    const moonHits = raycaster.intersectObjects(moonClickTargets, false);
    if (moonHits.length) {
      isSun = !isSun;
      const c = isSun ? SUN_COLOR : MOON_COLOR;
      moonMat.color.setHex(c);
      haloMat.color.setHex(c);
      haloMat.opacity = isSun ? 0.28 : 0.12;
      rayMat.opacity = isSun ? 0.85 : 0;
      return;
    }

    // otherwise launch a firework on the terrain
    const hits = raycaster.intersectObject(terrainMesh, false);
    if (hits.length) {
      const p = hits[0].point;
      launchFirework(p.x, p.y + 2, p.z);
    }
  });

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
    updateParticles(scrollState.value);

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
      const spd = 0.12 * sk.speed;

      if (mouseTarget) {
        // steer toward mouse target + per-skier scatter offset
        const tx = mouseTarget.x + sk.offsetX;
        const tz = mouseTarget.z + sk.offsetZ;
        const dx = tx - sk.x;
        const dz = tz - sk.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 1.0) {
          const desiredVx = (dx / dist) * spd;
          const desiredVz = (dz / dist) * spd;
          sk.vx += (desiredVx - sk.vx) * 0.06;
          sk.vz += (desiredVz - sk.vz) * 0.06;
        } else {
          // at the target: slow down and circle gently
          sk.vx *= 0.92;
          sk.vz *= 0.92;
        }
      } else {
        // no mouse: steer back to default rightward movement
        const defaultVx = spd;
        const defaultVz = Math.sin(timeOff * 0.55 + sk.wobble) * 0.014;
        sk.vx += (defaultVx - sk.vx) * 0.04;
        sk.vz += (defaultVz - sk.vz) * 0.04;
      }

      sk.x += sk.vx;
      sk.z += sk.vz;

      // wrap when drifting off the terrain edges
      if (sk.x > 62) sk.x = -62;
      if (sk.x < -62) sk.x = 62;
      sk.z = Math.max(-58, Math.min(58, sk.z));

      // raycast current height
      raycaster.set(new THREE.Vector3(sk.x, 140, sk.z), down);
      const sh = raycaster.intersectObject(terrainMesh, false);
      if (sh.length) {
        sk.group.position.set(sk.x, sh[0].point.y, sk.z);
      }

      // slope pitch along direction of travel
      const stepLen = Math.sqrt(sk.vx * sk.vx + sk.vz * sk.vz) * 4 + 0.3;
      const nx = sk.x + (sk.vx / (stepLen || 1)) * stepLen;
      const nz = sk.z + (sk.vz / (stepLen || 1)) * stepLen;
      raycaster.set(new THREE.Vector3(nx, 140, nz), down);
      const sa = raycaster.intersectObject(terrainMesh, false);
      const slopeTilt =
        sa.length && sh.length
          ? Math.atan2(sa[0].point.y - sh[0].point.y, stepLen)
          : 0;

      // face direction of travel
      sk.group.rotation.y = Math.atan2(sk.vx, sk.vz) - Math.PI / 2;
      sk.group.rotation.z = slopeTilt;
      sk.group.rotation.x = Math.sin(timeOff * 0.55 + sk.wobble) * 0.12;
    }

    for (let fi = fireworks.length - 1; fi >= 0; fi--) {
      const fw = fireworks[fi];
      fw.life -= 0.016;
      if (fw.life <= 0) {
        scene.remove(fw.points);
        fw.geo.dispose();
        fw.mat.dispose();
        fireworks.splice(fi, 1);
        continue;
      }
      fw.mat.opacity = fw.life * fw.life; // quadratic fade
      const pos = fw.geo.attributes.position.array;
      for (let i = 0; i < fw.particles.length; i++) {
        const p = fw.particles[i];
        p.vy -= 0.012; // gravity
        p.vx *= 0.97; // drag
        p.vz *= 0.97;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        pos[i * 3] = p.x;
        pos[i * 3 + 1] = p.y;
        pos[i * 3 + 2] = p.z;
      }
      fw.geo.attributes.position.needsUpdate = true;
    }

    // Orbit: high near left/right horizons, dips behind ridge silhouettes at center, then rises again
    const orbitPhase = timeOff * MOON_ORBIT_SPEED;
    const behind = Math.pow(Math.cos(orbitPhase), 2);
    moonGroup.position.x =
      MOON_X + Math.sin(orbitPhase) * MOON_ORBIT_RANGE;
    moonGroup.position.y = MOON_Y - behind * MOON_BEHIND_DIP;
    moonGroup.position.z = MOON_Z - behind * MOON_BEHIND_Z_PULL;
    // toggle moon/sun after each completed orbit
    const currentCycle = Math.floor(orbitPhase / (2 * Math.PI));
    if (currentCycle !== lastOrbitCycle) {
      lastOrbitCycle = currentCycle;
      isSun = !isSun;
      const c = isSun ? SUN_COLOR : MOON_COLOR;
      moonMat.color.setHex(c);
      haloMat.color.setHex(c);
      haloMat.opacity = isSun ? 0.28 : 0.12;
      rayMat.opacity = isSun ? 0.85 : 0;
    }
    // slowly rotate sun rays
    if (isSun) sunRays.rotation.z += 0.003;

    camera.position.x = 0;
    camera.position.y = 30;
    camera.position.z = 55;
    camera.lookAt(0, -3, 0);

    renderer.render(scene, camera);
    signalReady();
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
