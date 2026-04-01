import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const container = document.getElementById("hero3d");
const intro3d = document.getElementById("intro3d");

if (container && intro3d) {
  document.body.classList.add("intro3d-active");

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050816, 8, 22);

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
  });
  renderer.setClearColor(0x050816, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const blockScroll = (event) => {
    if (!document.body.classList.contains("intro3d-active")) return;
    event.preventDefault();
    };

    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });

  const world = new THREE.Group();
  scene.add(world);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.07,
  });

  const panelMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.045,
    side: THREE.DoubleSide,
  });

  function createPanel(width, height, x, y, z, rx = 0, ry = 0) {
    const group = new THREE.Group();

    const planeGeometry = new THREE.PlaneGeometry(width, height);
    const plane = new THREE.Mesh(planeGeometry, panelMaterial);
    group.add(plane);

    const edges = new THREE.EdgesGeometry(planeGeometry);
    const lines = new THREE.LineSegments(edges, lineMaterial);
    group.add(lines);

    group.position.set(x, y, z);
    group.rotation.set(rx, ry, 0);

    world.add(group);
  }

  createPanel(6.8, 4.3, -1.8, 0.6, -2.5, -0.08, 0.22);
  createPanel(7.5, 4.4, 2.8, 0.3, -4.2, 0.12, -0.34);
  createPanel(5.2, 3.2, 1.3, -1.6, -1.2, -0.18, 0.14);
  createPanel(4.2, 2.6, -3.5, -0.8, -5.3, 0.2, 0.28);

  function createRandomLine() {
    const points = [
      new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ),
      new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ),
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);
    world.add(line);
  }

  for (let i = 0; i < 28; i++) {
    createRandomLine();
  }

  function createWireBox(w, h, d, x, y, z, rx = 0, ry = 0) {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const edges = new THREE.EdgesGeometry(geometry);
    const box = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.12,
      })
    );

    box.position.set(x, y, z);
    box.rotation.set(rx, ry, 0);
    world.add(box);
  }

  createWireBox(1.2, 0.8, 0.4, 2.2, 0.2, -1.4, 0.2, 0.42);
  createWireBox(1.8, 1.1, 0.5, 1.0, -0.5, -2.6, -0.1, -0.25);
  createWireBox(0.9, 0.9, 0.9, -0.6, -1.4, -0.8, 0.35, 0.15);

  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  window.addEventListener("mousemove", (event) => {
    target.x = (event.clientX / window.innerWidth) * 2 - 1;
    target.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  let hasEntered = false;
  const clock = new THREE.Clock();

    function enterSite() {
        if (hasEntered) return;
        hasEntered = true;

        document.body.classList.add("intro3d-entered");
        document.body.classList.remove("intro3d-active");

        intro3d.classList.add("is-hidden");
    }

  intro3d.addEventListener("click", enterSite);

  function animate() {
    const elapsed = clock.getElapsedTime();

    pointer.x += (target.x - pointer.x) * 0.035;
    pointer.y += (target.y - pointer.y) * 0.035;

    world.rotation.y = pointer.x * 0.28;
    world.rotation.x = pointer.y * 0.16;
    world.rotation.z = Math.sin(elapsed * 0.3) * 0.025;

    world.position.x = pointer.x * 0.28;
    world.position.y = pointer.y * 0.18;

    camera.position.x = pointer.x * 0.55;
    camera.position.y = pointer.y * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}