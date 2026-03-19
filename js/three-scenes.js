/**
 * three-scenes.js
 * Three.js 3D visualizations:
 *   1. Hero – Research collaboration particle network
 *   2. Network canvas – 3D research globe
 *   3. Phlegraean Fields – Interactive caldera terrain
 *   4. Kilimanjaro – Mountain with animated glacier retreat
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ═══════════════════════════════════════════════════════════
   Shared noise utilities
   ═══════════════════════════════════════════════════════════ */

function hash(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothNoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix,        fy = y - iy;
  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);
  const a = hash(ix,   iy),   b = hash(ix+1, iy);
  const c = hash(ix,   iy+1), d = hash(ix+1, iy+1);
  return a + (b-a)*ux + (c-a)*uy + (a-b-c+d)*ux*uy;
}

function fbm(x, y, octaves = 5) {
  let v = 0, amp = 1.0, freq = 1.0, max = 0;
  for (let i = 0; i < octaves; i++) {
    v   += smoothNoise(x * freq, y * freq) * amp;
    max += amp;
    amp  *= 0.5;
    freq *= 2.1;
  }
  return v / max;
}

/* Linear interpolation helpers */
function lerp(a, b, t) { return a + (b - a) * t; }

function colorFromGradient(stops, t) {
  t = Math.max(0, Math.min(1, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, r0, g0, b0] = stops[i];
    const [t1, r1, g1, b1] = stops[i+1];
    if (t >= t0 && t <= t1) {
      const f = (t - t0) / (t1 - t0);
      return new THREE.Color(lerp(r0,r1,f)/255, lerp(g0,g1,f)/255, lerp(b0,b1,f)/255);
    }
  }
  const last = stops[stops.length - 1];
  return new THREE.Color(last[1]/255, last[2]/255, last[3]/255);
}

/* ═══════════════════════════════════════════════════════════
   1. HERO – Research Particle Network
   ═══════════════════════════════════════════════════════════ */

function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 55;

  /* -- Ambient + subtle point lights -- */
  scene.add(new THREE.AmbientLight(0x112244, 3));
  const pl1 = new THREE.PointLight(0x00d4ff, 80, 120);
  pl1.position.set(30, 30, 20);
  scene.add(pl1);
  const pl2 = new THREE.PointLight(0x00ff88, 50, 100);
  pl2.position.set(-30, -20, 15);
  scene.add(pl2);

  /* -- Node types & colours -- */
  const nodeTypes = [
    { color: 0x00d4ff, emissive: 0x006688, label: 'institution' },  // cyan – institutions
    { color: 0x00ff88, emissive: 0x008844, label: 'paper'        },  // green – papers
    { color: 0xff6200, emissive: 0x882200, label: 'dataset'      },  // orange – datasets
  ];

  const NODES = 90;
  const nodes = [];
  const radius = 28;

  /* Create nodes as glowing spheres */
  for (let i = 0; i < NODES; i++) {
    const t  = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
    const r  = 0.3 + Math.random() * 0.55;
    const geo = new THREE.SphereGeometry(r, 8, 8);
    const mat = new THREE.MeshStandardMaterial({
      color:     t.color,
      emissive:  t.emissive,
      emissiveIntensity: 0.8,
      roughness: 0.4,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geo, mat);

    /* Distribute on/inside a sphere */
    const phi   = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const dist  = radius * (0.4 + 0.6 * Math.random());
    mesh.position.set(
      dist * Math.sin(phi) * Math.cos(theta),
      dist * Math.sin(phi) * Math.sin(theta),
      dist * Math.cos(phi)
    );

    /* Random initial velocity for gentle drift */
    mesh.userData = {
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.008
      ),
      originalPos: mesh.position.clone(),
      phase: Math.random() * Math.PI * 2,
    };

    scene.add(mesh);
    nodes.push(mesh);
  }

  /* Create connection lines between nearby nodes */
  const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.35 });
  const linePositions = [];
  const lineColors    = [];
  const MAX_DIST = 15;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = nodes[i].position.distanceTo(nodes[j].position);
      if (d < MAX_DIST) {
        const alpha = 1 - d / MAX_DIST;
        linePositions.push(...nodes[i].position.toArray(), ...nodes[j].position.toArray());
        const c = new THREE.Color(nodes[i].material.color);
        lineColors.push(c.r * alpha, c.g * alpha, c.b * alpha,
                        c.r * alpha, c.g * alpha, c.b * alpha);
      }
    }
  }

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color',    new THREE.Float32BufferAttribute(lineColors,    3));
  scene.add(new THREE.LineSegments(lineGeo, lineMat));

  /* Mouse parallax */
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.6;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  });

  /* Resize */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* Animation */
  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame++;
    const t = frame * 0.005;

    /* Gentle node drift + breathing */
    nodes.forEach(n => {
      const ud = n.userData;
      n.position.x = ud.originalPos.x + Math.sin(t + ud.phase)         * 1.2;
      n.position.y = ud.originalPos.y + Math.cos(t + ud.phase * 1.3)   * 0.9;
      n.position.z = ud.originalPos.z + Math.sin(t * 0.7 + ud.phase)   * 0.8;
      /* Pulse emissive */
      n.material.emissiveIntensity = 0.5 + 0.4 * Math.sin(t * 1.5 + ud.phase);
    });

    /* Slow camera orbit + mouse parallax */
    camera.position.x = Math.sin(t * 0.15) * 5 + mouseX * 8;
    camera.position.y = Math.cos(t * 0.1)  * 3 - mouseY * 6;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
}

/* ═══════════════════════════════════════════════════════════
   2. NETWORK CANVAS – Research Collaboration Globe
   ═══════════════════════════════════════════════════════════ */

function initNetworkScene() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;

  const w = canvas.parentElement.clientWidth;
  const h = 500;
  canvas.style.height = h + 'px';

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 500);
  camera.position.z = 38;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate    = true;
  controls.autoRotateSpeed = 0.4;
  controls.enableZoom    = true;
  controls.minDistance   = 20;
  controls.maxDistance   = 80;

  scene.add(new THREE.AmbientLight(0x1a2a44, 5));
  const dl = new THREE.DirectionalLight(0xffffff, 1.5);
  dl.position.set(5, 10, 5);
  scene.add(dl);

  /* Globe wireframe */
  const globeGeo = new THREE.SphereGeometry(12, 48, 32);
  const globeMat = new THREE.MeshStandardMaterial({
    color:       0x0a1a2e,
    wireframe:   false,
    roughness:   0.9,
    transparent: true,
    opacity:     0.6,
  });
  scene.add(new THREE.Mesh(globeGeo, globeMat));

  /* Globe grid lines */
  const wireGeo = new THREE.SphereGeometry(12.05, 24, 16);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x1e3a55, wireframe: true, transparent: true, opacity: 0.25 });
  scene.add(new THREE.Mesh(wireGeo, wireMat));

  /* Glow shell */
  const glowGeo = new THREE.SphereGeometry(12.6, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.05,
  });
  scene.add(new THREE.Mesh(glowGeo, glowMat));

  /* Research institutions (lat/lon → 3D point) */
  function latLonTo3D(lat, lon, r) {
    const phi   = (90 - lat)  * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  const institutions = [
    /* name, lat, lon, type */
    ['MIT',          42.36,  -71.09, 0],
    ['Harvard',      42.37,  -71.12, 0],
    ['Stanford',     37.43, -122.17, 0],
    ['Oxford',       51.76,   -1.26, 0],
    ['Cambridge',    52.21,    0.12, 0],
    ['ETH Zürich',   47.38,    8.55, 0],
    ['TU München',   48.15,   11.57, 0],
    ['Univ. Tokyo',  35.71,  139.76, 0],
    ['Peking Univ.', 39.99,  116.31, 0],
    ['Univ. Sydney', -33.89, 151.19, 0],
    ['INGV Roma',    41.90,   12.50, 0],
    ['Univ. Cape T.',-33.96,  18.46, 0],
    ['Univ. Nairobi',-1.28,   36.82, 0],
    ['IIT Delhi',    28.55,   77.19, 0],
    ['UNAM Mexico',  19.33,  -99.18, 0],
    ['Fiocruz BR',   -22.90, -43.17, 0],
    ['CSIRO AU',     -35.28, 149.12, 0],
    ['CNRS Paris',   48.85,    2.35, 0],
    ['NASA Goddard', 38.99,  -76.85, 0],
    ['ESA ESAC',     40.44,   -3.95, 0],
    /* open-access datasets */
    ['arXiv',        42.45,  -76.48, 1],
    ['Zenodo',       46.23,    6.05, 1],
    ['OSF',          38.03,  -78.50, 1],
    ['PubMed',       39.00,  -77.10, 1],
    ['PANGAEA',      53.10,    8.85, 1],
    /* volcanic datasets */
    ['GVP',          38.89,  -77.02, 2],
    ['IRIS',         47.65, -122.31, 2],
    ['Copernicus',   52.37,    4.90, 2],
  ];

  const nodeColors = [0x00d4ff, 0x00ff88, 0xff6200];
  const nodePoints = [];

  institutions.forEach(([,lat, lon, type]) => {
    const pos  = latLonTo3D(lat, lon, 12.3);
    const geo  = new THREE.SphereGeometry(0.22, 8, 8);
    const mat  = new THREE.MeshStandardMaterial({
      color:    nodeColors[type],
      emissive: nodeColors[type],
      emissiveIntensity: 0.8,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    scene.add(mesh);
    nodePoints.push({ mesh, type, phase: Math.random() * Math.PI * 2 });
  });

  /* Draw arcs between some pairs */
  function drawArc(p1, p2, color, opacity = 0.5) {
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(mid.length() * 1.3);
    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const pts   = curve.getPoints(30);
    const geo   = new THREE.BufferGeometry().setFromPoints(pts);
    const mat   = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    scene.add(new THREE.Line(geo, mat));
  }

  const connections = [
    [0,1,0x00d4ff],[0,2,0x00d4ff],[1,3,0x00d4ff],[2,4,0x00d4ff],
    [3,5,0x00ff88],[4,6,0x00ff88],[5,7,0x00ff88],[6,8,0x00ff88],
    [9,10,0x00d4ff],[10,11,0x00ff88],[11,12,0x00ff88],
    [0,20,0x00ff88],[3,21,0x00ff88],[4,22,0x00ff88],
    [10,25,0xff6200],[18,26,0xff6200],[19,27,0xff6200],
    [13,8,0x00d4ff],[14,0,0x00d4ff],[15,17,0x00ff88],
    [16,9,0x00d4ff],[0,18,0x00ff88],[3,19,0x00ff88],
  ];

  connections.forEach(([i, j, col]) => {
    if (nodePoints[i] && nodePoints[j]) {
      drawArc(
        nodePoints[i].mesh.position,
        nodePoints[j].mesh.position,
        col, 0.45
      );
    }
  });

  /* Resize */
  window.addEventListener('resize', () => {
    const nw = canvas.parentElement.clientWidth;
    renderer.setSize(nw, h);
    camera.aspect = nw / h;
    camera.updateProjectionMatrix();
  });

  /* Animation */
  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame++;
    const t = frame * 0.016;
    nodePoints.forEach(n => {
      n.mesh.material.emissiveIntensity = 0.5 + 0.4 * Math.sin(t + n.phase);
    });
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

/* ═══════════════════════════════════════════════════════════
   3. PHLEGRAEAN FIELDS – Interactive Caldera Terrain
   ═══════════════════════════════════════════════════════════ */

function initPhlegraeanScene() {
  const canvas = document.getElementById('phlegraean-canvas');
  if (!canvas) return;

  const w = canvas.parentElement.clientWidth;
  const h = 380;
  canvas.style.height = h + 'px';

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x030610, 1);

  const scene  = new THREE.Scene();
  scene.fog    = new THREE.FogExp2(0x030610, 0.022);
  const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 300);
  camera.position.set(0, 18, 28);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping    = true;
  controls.dampingFactor    = 0.06;
  controls.minDistance      = 10;
  controls.maxDistance      = 60;
  controls.maxPolarAngle    = Math.PI * 0.48;
  controls.autoRotate       = true;
  controls.autoRotateSpeed  = 0.3;

  /* Lighting */
  scene.add(new THREE.AmbientLight(0x1a1030, 4));
  const sun = new THREE.DirectionalLight(0xffcc88, 1.5);
  sun.position.set(10, 20, 5);
  scene.add(sun);
  const lavaPt = new THREE.PointLight(0xff4400, 30, 25);
  lavaPt.position.set(2, 2, -1);
  scene.add(lavaPt);
  const solfPt = new THREE.PointLight(0xffaa00, 20, 20);
  solfPt.position.set(4, 3, 2);
  scene.add(solfPt);

  /* Terrain grid */
  const SEGS  = 120;
  const SIZE  = 40;
  const HALF  = SIZE / 2;

  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGS, SEGS);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;

  /* Colour gradient stops: [t, R, G, B] */
  const terrainGrad = [
    [0.00,   2,  18,  60],  // deep sea
    [0.10,   4,  30, 80],   // sea
    [0.25,  22,  80,  38],  // coast
    [0.42,  55, 100,  30],  // lowland
    [0.55,  90, 120,  40],  // mid
    [0.65, 130,  80,  20],  // brown upland
    [0.75, 180,  80,  10],  // volcanic brown
    [0.88, 220,  50,   5],  // active zone
    [1.00, 255, 140,   0],  // fumarole
  ];

  const colors = new Float32Array(pos.count * 3);

  /* Height data stored for animation */
  const baseHeights = new Float32Array(pos.count);

  for (let i = 0; i < pos.count; i++) {
    const x  = pos.getX(i);
    const z  = pos.getZ(i);
    const nx = (x + HALF) / SIZE;
    const nz = (z + HALF) / SIZE;

    /* Base terrain noise */
    let h2 = fbm(nx * 4.5, nz * 4.5, 6) * 0.5
            + fbm(nx * 2.2, nz * 2.2, 4) * 0.35
            + fbm(nx * 1.0, nz * 1.0, 3) * 0.15;

    /* Caldera: inverted gaussian centred near (0.45, 0.52) */
    const caldX = 0.45, caldZ = 0.52;
    const caldR  = Math.sqrt((nx - caldX)**2 + (nz - caldZ)**2);
    const caldera = Math.exp(-caldR * caldR * 18) * 0.6;
    h2 -= caldera;

    /* Sea level baseline */
    h2 = h2 * 12 - 2.5;

    /* Secondary smaller craters */
    const cr1 = Math.exp(-((nx-0.65)**2 + (nz-0.40)**2) * 60) * 1.8; // Solfatara
    const cr2 = Math.exp(-((nx-0.30)**2 + (nz-0.60)**2) * 45) * 1.2;
    const cr3 = Math.exp(-((nx-0.72)**2 + (nz-0.62)**2) * 80) * 0.9;
    h2 += cr1 + cr2 + cr3;

    pos.setY(i, h2);
    baseHeights[i] = h2;

    /* Colour based on normalised height */
    const hn = (h2 + 3) / 15;  // normalise to 0-1
    const col = colorFromGradient(terrainGrad, hn);
    colors[i*3]   = col.r;
    colors[i*3+1] = col.g;
    colors[i*3+2] = col.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshPhongMaterial({
    vertexColors: true,
    shininess: 18,
    flatShading: false,
  });

  const terrain = new THREE.Mesh(geo, mat);
  scene.add(terrain);

  /* Fumarole particles (Solfatara area) */
  const fParticles = 120;
  const fGeo = new THREE.BufferGeometry();
  const fPos = new Float32Array(fParticles * 3);
  const fVel = new Float32Array(fParticles * 3);

  for (let i = 0; i < fParticles; i++) {
    fPos[i*3]   = 3.5 + (Math.random() - 0.5) * 2;
    fPos[i*3+1] = 2 + Math.random() * 0.3;
    fPos[i*3+2] = 1.5 + (Math.random() - 0.5) * 2;
    fVel[i*3]   = (Math.random() - 0.5) * 0.02;
    fVel[i*3+1] = 0.015 + Math.random() * 0.025;
    fVel[i*3+2] = (Math.random() - 0.5) * 0.015;
  }

  fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
  const fMat = new THREE.PointsMaterial({ color: 0xffa040, size: 0.18, transparent: true, opacity: 0.65, sizeAttenuation: true });
  const fumaroles = new THREE.Points(fGeo, fMat);
  scene.add(fumaroles);

  /* Resize */
  window.addEventListener('resize', () => {
    const nw = canvas.parentElement.clientWidth;
    renderer.setSize(nw, h);
    camera.aspect = nw / h;
    camera.updateProjectionMatrix();
  });

  /* Animation */
  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame++;
    const t = frame * 0.005;

    /* Bradyseism – slow sine uplift at caldera centre */
    const uplift = Math.sin(t * 0.4) * 0.45;
    const pfp = geo.attributes.position;
    for (let i = 0; i < pfp.count; i++) {
      const x  = pfp.getX(i);
      const z  = pfp.getZ(i);
      const nx = (x + HALF) / SIZE;
      const nz = (z + HALF) / SIZE;
      const caldR  = Math.sqrt((nx - 0.45)**2 + (nz - 0.52)**2);
      const weight = Math.exp(-caldR * caldR * 18);
      pfp.setY(i, baseHeights[i] + uplift * weight);
    }
    pfp.needsUpdate = true;
    geo.computeVertexNormals();

    /* Animate fumarole particles */
    const fp = fumaroles.geometry.attributes.position;
    for (let i = 0; i < fParticles; i++) {
      let py = fp.getY(i);
      py += fVel[i*3+1];
      if (py > 8) { py = 2 + Math.random() * 0.5; }
      fp.setX(i, fp.getX(i) + fVel[i*3]);
      fp.setY(i, py);
      fp.setZ(i, fp.getZ(i) + fVel[i*3+2]);
    }
    fp.needsUpdate = true;

    /* Pulsing lava glow */
    lavaPt.intensity = 20 + 15 * Math.sin(t * 1.8);

    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

/* ═══════════════════════════════════════════════════════════
   4. KILIMANJARO – Mountain with Animated Glacier Retreat
   ═══════════════════════════════════════════════════════════ */

/* Glacier data: [year, fraction of glacier remaining] */
const GLACIER_STEPS = [
  { year: 1912, fraction: 1.000 },
  { year: 1953, fraction: 0.588 },
  { year: 1976, fraction: 0.368 },
  { year: 1989, fraction: 0.289 },
  { year: 2000, fraction: 0.220 },
  { year: 2007, fraction: 0.162 },
  { year: 2011, fraction: 0.157 },
  { year: 2020, fraction: 0.152 },
];

function initKilimanjaroScene() {
  const canvas = document.getElementById('kilimanjaro-canvas');
  if (!canvas) return;

  const w = canvas.parentElement.clientWidth;
  const h = 380;
  canvas.style.height = h + 'px';

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x050d1e, 1);

  const scene  = new THREE.Scene();
  scene.fog    = new THREE.FogExp2(0x050d1e, 0.018);
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 300);
  camera.position.set(0, 14, 32);
  camera.lookAt(0, 4, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping    = true;
  controls.dampingFactor    = 0.05;
  controls.minDistance      = 14;
  controls.maxDistance      = 60;
  controls.maxPolarAngle    = Math.PI * 0.5;
  controls.autoRotate       = true;
  controls.autoRotateSpeed  = 0.25;
  controls.target.set(0, 4, 0);

  /* Lighting */
  scene.add(new THREE.AmbientLight(0x203040, 4));
  const sun = new THREE.DirectionalLight(0xfff8e8, 2.5);
  sun.position.set(15, 25, 10);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x6090b0, 0.8);
  fill.position.set(-10, 5, -5);
  scene.add(fill);

  const SEGS  = 110;
  const SIZE  = 38;
  const HALF  = SIZE / 2;
  const PEAK  = 18;   // height of Uhuru Peak in world units

  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGS, SEGS);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;

  /* Terrain colour gradient: savanna → rock → glacier */
  const kiliGrad = [
    [0.00,  18, 60,  10],   // savanna base
    [0.18,  55, 95,  20],   // grassland
    [0.32,  80, 88,  38],   // heath
    [0.46,  90, 70,  30],   // moorland
    [0.58, 110, 85,  42],   // rock band
    [0.68, 130, 110, 80],   // scree
    [0.76, 170, 155, 140],  // grey rock
    [0.84, 210, 205, 195],  // snow fringe
    [1.00, 245, 248, 255],  // glacier / ice
  ];

  const colors    = new Float32Array(pos.count * 3);
  const heights   = new Float32Array(pos.count);
  /* Each vertex: normalized height at which glacier starts */

  for (let i = 0; i < pos.count; i++) {
    const x  = pos.getX(i);
    const z  = pos.getZ(i);
    const nx = (x + HALF) / SIZE;
    const nz = (z + HALF) / SIZE;
    const cx = nx - 0.5, cz = nz - 0.5;

    /* Cone base + fractal noise */
    const distFromCentre = Math.sqrt(cx*cx + cz*cz);
    let h2 = Math.max(0, PEAK * (1 - distFromCentre * 2.2));

    /* Add bumpy detail */
    h2 += fbm(nx * 6, nz * 6, 5) * 1.8 * Math.max(0, 1 - distFromCentre * 3);
    h2 += fbm(nx * 2.5, nz * 2.5, 3) * 0.8;

    /* Kibo caldera slight depression at very top */
    const caldR = Math.sqrt(cx*cx + cz*cz);
    h2 -= Math.exp(-caldR * caldR * 120) * 0.8;

    /* Mawenzi secondary peak (east) */
    const mawX = 0.5 + 0.32, mawZ = 0.5;
    const mawR = Math.sqrt((nx - mawX)**2 + (nz - mawZ)**2);
    h2 += Math.exp(-mawR * mawR * 30) * 6.5;

    /* Shira platform (west) */
    const shiX = 0.5 - 0.28, shiZ = 0.5 - 0.05;
    const shiR = Math.sqrt((nx - shiX)**2 + (nz - shiZ)**2);
    h2 += Math.exp(-shiR * shiR * 18) * 3.5;

    pos.setY(i, h2);
    heights[i] = h2;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshPhongMaterial({
    vertexColors: true,
    shininess: 40,
    flatShading: false,
  });
  const mountain = new THREE.Mesh(geo, mat);
  scene.add(mountain);

  /* Colour terrain with glacier threshold */
  function updateGlacierColors(fraction) {
    /* Glacier starts at this world-height fraction */
    const glacierThreshold = PEAK * (0.58 + 0.42 * (1 - fraction * 0.82));
    const col = geo.attributes.color;

    for (let i = 0; i < pos.count; i++) {
      const h2 = heights[i];
      let hn = h2 / PEAK;

      /* If above glacier threshold, show white ice; else terrain colour */
      let c;
      if (h2 >= glacierThreshold) {
        /* Show glacier (white-blue) */
        const glacFrac = Math.min(1, (h2 - glacierThreshold) / (PEAK - glacierThreshold));
        c = colorFromGradient([
          [0, 200, 215, 230],
          [1, 245, 248, 255],
        ], glacFrac);
      } else {
        hn = Math.min(0.83, hn); // clamp so highest terrain stays rock, not glacier
        c = colorFromGradient(kiliGrad, hn);
      }

      col.setXYZ(i, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  }

  /* Initial render at step 0 (1912) */
  updateGlacierColors(GLACIER_STEPS[0].fraction);

  /* Expose updater globally so slider can call it */
  window._kiliSetGlacierStep = function(stepIndex) {
    const step = GLACIER_STEPS[Math.min(stepIndex, GLACIER_STEPS.length - 1)];
    updateGlacierColors(step.fraction);
    document.getElementById('glacier-year-label').textContent = step.year;
  };

  /* Resize */
  window.addEventListener('resize', () => {
    const nw = canvas.parentElement.clientWidth;
    renderer.setSize(nw, h);
    camera.aspect = nw / h;
    camera.updateProjectionMatrix();
  });

  /* Animation */
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

/* ═══════════════════════════════════════════════════════════
   Bootstrap all scenes when DOM is ready
   ═══════════════════════════════════════════════════════════ */

function initAll() {
  initHeroScene();
  initNetworkScene();
  initPhlegraeanScene();
  initKilimanjaroScene();

  /* Wire up glacier slider */
  const slider = document.getElementById('glacier-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      if (window._kiliSetGlacierStep) {
        window._kiliSetGlacierStep(parseInt(slider.value));
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
