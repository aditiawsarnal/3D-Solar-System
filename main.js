import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let infoBox;

const planets = [];
const planetNames = [
  "Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"
];

const orbitRadii = [
  0, 50, 60, 70, 80, 100, 120, 140, 160
];

const orbitSpeeds = [
  0, 2, 1.5, 1, 0.8, 0.7, 0.6, 0.5, 0.4
];

let speedMultiplier = 1;
let isPaused = false;

function createSkybox() {
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    "img/skybox/space_ft.png",
    "img/skybox/space_bk.png",
    "img/skybox/space_up.png",
    "img/skybox/space_dn.png",
    "img/skybox/space_rt.png",
    "img/skybox/space_lf.png"
  ]);
  scene.background = texture;
}

function addStars() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = THREE.MathUtils.randFloatSpread(2000);
    const y = THREE.MathUtils.randFloatSpread(2000);
    const z = THREE.MathUtils.randFloatSpread(2000);
    vertices.push(x, y, z);
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}

function loadPlanet(texturePath, size) {
  const geometry = new THREE.SphereGeometry(size, 64, 64);
  const texture = new THREE.TextureLoader().load(texturePath);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  return new THREE.Mesh(geometry, material);
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 50, 150);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;

  const ambientLight = new THREE.AmbientLight(0xaaaaaa);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  scene.add(pointLight);

  createSkybox();
  addStars();

  planet_sun = loadPlanet("img/sun_hd.jpg", 20);
  planet_mercury = loadPlanet("img/mercury_hd.jpg", 2);
  planet_venus = loadPlanet("img/venus_hd.jpg", 3);
  planet_earth = loadPlanet("img/earth_hd.jpg", 4);
  planet_mars = loadPlanet("img/mars_hd.jpg", 3.5);
  planet_jupiter = loadPlanet("img/jupiter_hd.jpg", 10);
  planet_saturn = loadPlanet("img/saturn_hd.jpg", 8);
  planet_uranus = loadPlanet("img/uranus_hd.jpg", 6);
  planet_neptune = loadPlanet("img/neptune_hd.jpg", 5);

  planets.push(
    planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars,
    planet_jupiter, planet_saturn, planet_uranus, planet_neptune
  );

  planets.forEach(p => scene.add(p));

  createRings();
  setupUI();

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("click", onMouseClick);
}

function createRings() {
  orbitRadii.slice(1).forEach(radius => {
    const ringGeo = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
  });
}

function setupUI() {
  const pauseBtn = document.createElement("button");
  pauseBtn.innerText = "Pause";
  pauseBtn.onclick = () => {
    isPaused = !isPaused;
    pauseBtn.innerText = isPaused ? "Resume" : "Pause";
  };
  document.body.appendChild(pauseBtn);

  const speedSlider = document.createElement("input");
  speedSlider.type = "range";
  speedSlider.min = 0.1;
  speedSlider.max = 5;
  speedSlider.step = 0.1;
  speedSlider.value = 1;
  speedSlider.oninput = () => speedMultiplier = parseFloat(speedSlider.value);
  document.body.appendChild(speedSlider);

  infoBox = document.createElement("div");
  infoBox.style.cssText = "position: fixed; bottom: 10px; left: 10px; padding: 8px; background: #222; color: #fff; display: none";
  document.body.appendChild(infoBox);
}

function animate(time) {
  requestAnimationFrame(animate);
  if (!isPaused) {
    planets.forEach((planet, i) => {
      planet.rotation.y += 0.005;
      if (i > 0) {
        const angle = time * 0.001 * orbitSpeeds[i] * speedMultiplier;
        planet.position.x = orbitRadii[i] * Math.cos(angle);
        planet.position.z = orbitRadii[i] * Math.sin(angle);
      }
    });
  }
  controls.update();
  renderer.render(scene, camera);
}

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);
  if (intersects.length > 0) {
    const planet = intersects[0].object;
    const index = planets.indexOf(planet);
    infoBox.innerText = planetNames[index];
    infoBox.style.display = "block";
  } else {
    infoBox.style.display = "none";
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
animate();
