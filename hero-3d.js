import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const container = document.getElementById("hero3d");
const intro3d = document.getElementById("intro3d");

if (container && intro3d) {
  document.body.classList.add("intro3d-active");

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050816, 10, 26);

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.2, 10);

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

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.45);
  directionalLight.position.set(4, 5, 6);
  scene.add(directionalLight);

  function createLine(x1, y1, z1, x2, y2, z2, opacity = 0.08) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, y1, z1),
      new THREE.Vector3(x2, y2, z2),
    ]);

    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity,
    });

    const line = new THREE.Line(geometry, material);
    world.add(line);
    return line;
  }

  function createWirePlane(
    width,
    height,
    x,
    y,
    z,
    rx = 0,
    ry = 0,
    opacity = 0.08,
    fillOpacity = 0.02
  ) {
    const group = new THREE.Group();
    const planeGeometry = new THREE.PlaneGeometry(width, height);

    const plane = new THREE.Mesh(
      planeGeometry,
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: fillOpacity,
        side: THREE.DoubleSide,
      })
    );

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(planeGeometry),
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity,
      })
    );

    group.add(plane);
    group.add(edges);
    group.position.set(x, y, z);
    group.rotation.set(rx, ry, 0);

    world.add(group);
    return group;
  }

  function createWireBox(
    width,
    height,
    depth,
    x,
    y,
    z,
    rx = 0,
    ry = 0,
    rz = 0,
    opacity = 0.12
  ) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const edges = new THREE.EdgesGeometry(geometry);

    const box = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity,
      })
    );

    box.position.set(x, y, z);
    box.rotation.set(rx, ry, rz);
    world.add(box);
    return box;
  }

  function createCanvasTexture(drawFn, width = 1400, height = 900) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    drawFn(ctx, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    return texture;
  }

  const emailTexture = createCanvasTexture((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "600 34px Arial";
    ctx.fillText("From: admin@bellika.pt", 70, 90);

    ctx.font = "500 28px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText("To: nexorteksolutions@gmail.com", 70, 135);
    ctx.fillText("Subject: Novo website para o nosso negócio", 70, 180);

    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "28px Arial";

    const lines = [
      "Olá equipa Nexortek,",
      "",
      "Estamos à procura de um parceiro para renovar a nossa",
      "presença digital e criar um website mais moderno,",
      "rápido e alinhado com a nossa marca.",
      "",
      "Queremos também melhorar a visibilidade no Google",
      "e perceber como podemos comunicar melhor online.",
      "",
      "Podemos falar esta semana?",
      "",
      "Obrigado,",
      "Miguel Ferreira",
    ];

    let y = 270;
    for (const line of lines) {
      ctx.fillText(line, 70, y);
      y += 46;
    }
  }, 1200, 900);

  function createImagePanel({
    width,
    height,
    x,
    y,
    z,
    rx = 0,
    ry = 0,
    rz = 0,
    texture,
    opacity = 1,
  }) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );

    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);

    world.add(mesh);
    return mesh;
  }

  function createTextPanel({
    width,
    height,
    x,
    y,
    z,
    rx = 0,
    ry = 0,
    rz = 0,
    texture,
    opacity = 0.95,
    frameOpacity = 0.08,
  }) {
    const group = new THREE.Group();
    const geometry = new THREE.PlaneGeometry(width, height);

    const plane = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );

    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: frameOpacity,
        depthWrite: false,
      })
    );

    group.add(plane);
    group.add(frame);
    group.position.set(x, y, z);
    group.rotation.set(rx, ry, rz);

    world.add(group);
    return group;
  }

  function createMonitor(x, y, z, ry = 0) {
    createWireBox(1.45, 0.88, 0.06, x, y, z, -0.06, ry, 0, 0.18);
    createWireBox(0.08, 0.52, 0.08, x, y - 0.56, z, 0, ry, 0, 0.12);
    createWireBox(0.48, 0.04, 0.24, x, y - 0.82, z, 0, ry, 0, 0.1);
  }

  function createDesk() {
    createWireBox(4.4, 0.16, 1.9, 0, -1.35, -3.5, 0, 0.04, 0, 0.16);

    createWireBox(0.14, 1.45, 0.14, -1.85, -2.1, -2.85, 0, 0, 0, 0.12);
    createWireBox(0.14, 1.45, 0.14, 1.85, -2.1, -2.85, 0, 0, 0, 0.12);
    createWireBox(0.14, 1.45, 0.14, -1.85, -2.1, -4.15, 0, 0, 0, 0.12);
    createWireBox(0.14, 1.45, 0.14, 1.85, -2.1, -4.15, 0, 0, 0, 0.12);

    createMonitor(-0.95, -0.48, -3.28, 0.08);
    createMonitor(0.95, -0.48, -3.3, -0.08);

    createWireBox(0.95, 0.12, 0.34, 0, -1.18, -2.95, 0, 0, 0, 0.08);
    createWireBox(0.18, 0.06, 0.26, 1.15, -1.18, -2.85, 0, 0, 0, 0.07);

    createWireBox(0.95, 0.9, 0.95, 0, -2.25, -1.95, 0, 0.15, 0, 0.1);
    createWireBox(0.85, 1.0, 0.1, 0, -1.65, -1.45, -0.14, 0, 0, 0.1);
  }

  createWirePlane(18, 11, 0, -3.3, -5.4, -Math.PI / 2, 0, 0.08, 0.012);
  createWirePlane(15, 7.6, 0, 0.4, -9.5, 0, 0, 0.08, 0.012);

  createWirePlane(11, 7.2, 6.8, 0.45, -6.7, 0, -Math.PI / 2.75, 0.07, 0.01);
  createWirePlane(9.4, 6.8, -6.9, 0.4, -6.4, 0, Math.PI / 2.95, 0.04, 0.008);
  createWirePlane(7.2, 4.8, 0, 0.8, -6.3, 0.02, 0, 0.08, 0.016);

  createWirePlane(4.1, 2.5, -2.9, 1.45, -5.2, -0.04, 0.18, 0.1, 0.018);
  createWirePlane(4.8, 2.8, 3.8, 1.2, -6.9, 0.08, -0.22, 0.1, 0.018);
  createWirePlane(2.9, 1.85, 2.3, -0.75, -2.2, -0.18, 0.12, 0.08, 0.014);

  createDesk();

  createWireBox(1.3, 1.0, 0.7, 3.2, -2.35, -5.2, 0, 0.12, 0, 0.1);
  createWireBox(0.9, 1.8, 0.9, 4.8, -1.95, -6.4, 0, -0.08, 0, 0.08);
  createWireBox(1.1, 0.9, 0.9, -4.6, -2.4, -5.8, 0, 0.16, 0, 0.07);

  createLine(-9, 3.6, -4.3, 8.2, 2.4, -7.2, 0.05);
  createLine(-8.2, -3.2, -3.4, 7.4, -3.5, -7.4, 0.05);
  createLine(-5.8, 3.9, -2.8, -2.9, -3.4, -5.9, 0.04);
  createLine(2.2, 4.1, -3.1, 6.9, -2.8, -5.5, 0.04);
  createLine(-8.4, 0.2, -9.25, 8.2, 0.2, -9.25, 0.03);
  createLine(-6.7, 4.2, -6.1, -6.7, -3.2, -6.1, 0.035);
  createLine(6.7, 4.2, -6.3, 6.7, -3.2, -6.3, 0.035);

  createLine(-8.5, 4.8, -8.8, 8.5, 4.8, -8.8, 0.025);
  createLine(-8.5, 4.8, -8.8, -8.5, -3.2, -8.8, 0.025);
  createLine(8.5, 4.8, -8.8, 8.5, -3.2, -8.8, 0.025);

  createTextPanel({
    width: 3.4,
    height: 2.35,
    x: -4.9,
    y: 0.9,
    z: -5.8,
    rx: 0.03,
    ry: 0.95,
    rz: 0,
    texture: emailTexture,
    opacity: 0.9,
    frameOpacity: 0.08,
  });

  const textureLoader = new THREE.TextureLoader();

  textureLoader.load("/assets/logo-web.png", (logoTexture) => {
    logoTexture.colorSpace = THREE.SRGBColorSpace;
    logoTexture.minFilter = THREE.LinearFilter;
    logoTexture.magFilter = THREE.LinearFilter;
    logoTexture.generateMipmaps = false;

    const img = logoTexture.image;
    const aspect = img.width / img.height;

    const logoWidth = 4.2;
    const logoHeight = logoWidth / aspect;

    createImagePanel({
      width: logoWidth,
      height: logoHeight,
      x: 4.2,
      y: 1.55,
      z: -5.0,
      rx: 0.01,
      ry: -0.28,
      rz: 0,
      texture: logoTexture,
      opacity: 1,
    });
  });

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

    world.rotation.y = pointer.x * 0.16;
    world.rotation.x = pointer.y * 0.08;
    world.rotation.z = Math.sin(elapsed * 0.22) * 0.01;

    world.position.x = pointer.x * 0.16;
    world.position.y = pointer.y * 0.1;

    camera.position.x = pointer.x * 0.32;
    camera.position.y = 0.2 + pointer.y * 0.18;
    camera.lookAt(0, -0.4, -4.8);

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