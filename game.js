
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ===================== SAHNA =====================

const scene = new THREE.Scene();
scene.background = new THREE.Color('#080b20');
scene.fog = new THREE.Fog('#080b20', 100, 350);

const camera = new THREE.PerspectiveCamera(
  65, innerWidth / innerHeight, 0.1, 1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.getElementById('game').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x8caaff, 0x202034, 2));

const sunlight = new THREE.DirectionalLight(0xffffff, 2.5);
sunlight.position.set(-30, 70, 40);
sunlight.castShadow = true;
scene.add(sunlight);

function makeMaterial(color, glow = '#000000', intensity = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: glow,
    emissiveIntensity: intensity,
    roughness: 0.55
  });
}

function addBox(w, h, d, color, x, y, z, glow = '#000000') {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    makeMaterial(color, glow)
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  scene.add(mesh);
  return mesh;
}

// ===================== YO'L =====================

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 2000),
  makeMaterial('#10172a')
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.15;
scene.add(ground);

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 1200),
  makeMaterial('#292d39')
);

road.rotation.x = -Math.PI / 2;
road.position.y = 0;
scene.add(road);

const roadEdges = [];

for (const x of [-12, 12]) {
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.12, 1200),
    new THREE.MeshBasicMaterial({ color: '#00d9ff' })
  );

  edge.position.set(x, 0.08, 0);
  scene.add(edge);
  roadEdges.push(edge);
}

const roadDashes = [];

for (let z = -580; z < 600; z += 18) {
  roadDashes.push(
    addBox(0.18, 0.045, 8, '#f1f5ff', 0, 0.06, z)
  );
}

// ===================== NEON SHAHAR =====================

const buildings = [];

for (let i = 0; i < 100; i++) {
  const side = Math.random() > 0.5 ? 1 : -1;
  const x = side * (19 + Math.random() * 55);
  const z = -550 + Math.random() * 1100;
  const w = 5 + Math.random() * 9;
  const h = 10 + Math.random() * 35;

  const building = addBox(
    w, h, w,
    '#141d35',
    x, h / 2 - 0.15, z
  );

  buildings.push(building);

  const windowColor = Math.random() > 0.5
    ? '#00d9ff'
    : '#ff36cb';

  for (let y = 3; y < h - 2; y += 5) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.6, 0.35, 0.08),
      new THREE.MeshBasicMaterial({
        color: windowColor
      })
    );

    win.position.set(x, y, z + w / 2 + 0.06);
    scene.add(win);

    buildings.push(win);
    win.userData.windowLight = true;
  }
}

// ===================== MASHINA =====================

function makeCar(color, isPlayer = false) {
  const car = new THREE.Group();

  const paint = makeMaterial(color, color, 0.12);
  const glass = makeMaterial('#15354c');
  const black = makeMaterial('#090b12');
  const wheels = [];
  const brakeLights = [];
  const flames = [];

  function part(w, h, d, mat, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d), mat
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    car.add(mesh);

    return mesh;
  }

  // Kuzov va kapot
  part(2.1, 0.58, 4.0, paint, 0, 0.7, 0);
  part(1.55, 0.65, 1.8, glass, 0, 1.22, -0.15);
  part(1.85, 0.13, 1.0, paint, 0, 0.98, 1.25);

  // Sport spoyler
  part(1.65, 0.1, 0.28, black, 0, 1.15, -1.8);
  part(0.12, 0.3, 0.12, black, -0.55, 1.0, -1.8);
  part(0.12, 0.3, 0.12, black, 0.55, 1.0, -1.8);

  // Old chiroqlar
  const headlights = makeMaterial('#dfffff', '#00d9ff', 3);

  part(0.4, 0.16, 0.08, headlights, -0.65, 0.86, 2.03);
  part(0.4, 0.16, 0.08, headlights, 0.65, 0.86, 2.03);

  // Orqa stop-chiroqlar
  const rearLight = makeMaterial('#7d1025', '#ff001e', 1);

  for (const x of [-0.65, 0.65]) {
    const lamp = part(
      0.4, 0.16, 0.08, rearLight, x, 0.85, -2.03
    );

    brakeLights.push(lamp);
  }

  // G'ildiraklar
  for (const x of [-1.05, 1.05]) {
    for (const z of [-1.3, 1.3]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.28, 16),
        black
      );

      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.42, z);
      wheel.castShadow = true;
      car.add(wheel);
      wheels.push(wheel);
    }
  }

  // Nitro olovi: mashinaning orqa qismida
  for (const x of [-0.55, 0.55]) {
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.23, 1.1, 10),
      new THREE.MeshBasicMaterial({
        color: '#00e5ff',
        transparent: true,
        opacity: 0.9
      })
    );

    flame.rotation.x = Math.PI / 2;
    flame.position.set(x, 0.55, -2.55);
    flame.visible = false;

    car.add(flame);
    flames.push(flame);
  }

  // Neon pastki chiroqlar
  const underglow = new THREE.PointLight(color, 1.8, 7);
  underglow.position.set(0, 0.15, 0);
  car.add(underglow);

  car.userData.wheels = wheels;
  car.userData.brakeLights = brakeLights;
  car.userData.flames = flames;

  scene.add(car);
  return car;
}

// ===================== O'YIN HOLATI =====================

const player = {
  car: makeCar('#ff2855', true),
  x: 0,
  z: 0,
  speed: 0,
  nitro: 100,
  elapsed: 0,
  started: false,
  finished: false,
  laps: 0
};

const bots = [
  { car: makeCar('#00d9ff'), x: -4, z: 35, speed: 31 },
  { car: makeCar('#b94dff'), x: 4, z: 60, speed: 35 },
  { car: makeCar('#b6ff00'), x: -4, z: 90, speed: 29 }
];

const keys = {};
let paused = false;
let lastTime = performance.now();

addEventListener('keydown', e => {
  keys[e.code] = true;

  if (
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']
      .includes(e.code)
  ) {
    e.preventDefault();
  }

  if (e.code === 'KeyR') resetCar();
});

addEventListener('keyup', e => {
  keys[e.code] = false;
});

addEventListener('blur', () => {
  for (const key in keys) keys[key] = false;
});

// ===================== START / RESET =====================

function resetCar() {
  player.x = 0;
  player.speed = 0;
  player.car.position.set(player.x, 0, player.z);
}

document.getElementById('start').onclick = () => {
  player.car.traverse(obj => {
    if (obj.isMesh && obj.material.color) {
      // Rang faqat kuzovga tegishli bo'lishi kerak.
    }
  });

  const selectedColor = document.getElementById('color').value;

  // Kuzov rangini yangilash
  player.car.children.forEach(obj => {
    if (obj.isMesh && obj.material.emissiveIntensity === 0.12) {
      obj.material.color.set(selectedColor);
      obj.material.emissive.set(selectedColor);
    }
  });

  player.x = 0;
  player.z = 0;
  player.speed = 0;
  player.nitro = 100;
  player.elapsed = 0;
  player.finished = false;
  player.started = true;
  player.car.position.set(0, 0, 0);

  bots.forEach((bot, i) => {
    bot.x = i % 2 === 0 ? -4 : 4;
    bot.z = 35 + i * 30;
    bot.speed = 29 + Math.random() * 7;
    bot.car.position.set(bot.x, 0, bot.z);
  });

  document.getElementById('menu').style.display = 'none';
  document.getElementById('notice').style.display = 'none';
  paused = false;
};

document.getElementById('pause').onclick = () => {
  if (!player.started || player.finished) return;

  paused = !paused;

  const notice = document.getElementById('notice');
  notice.textContent = paused ? 'PAUZA' : '';
  notice.style.display = paused ? 'block' : 'none';
};

// ===================== ANIMATSIYALAR =====================

function update(dt) {
  if (!player.started || player.finished || paused) return;

  player.elapsed += dt;

  const accelerating = keys.KeyW || keys.ArrowUp;
  const braking = keys.KeyS || keys.ArrowDown;

  const turning =
    (keys.KeyD || keys.ArrowRight ? 1 : 0) -
    (keys.KeyA || keys.ArrowLeft ? 1 : 0);

  const boost =
    keys.Space && player.nitro > 0 && accelerating;

  // Tezlanish va tormoz
  if (accelerating) {
    player.speed += (boost ? 34 : 20) * dt;
  } else {
    player.speed -= 7 * dt;
  }

  if (braking) player.speed -= 32 * dt;

  player.speed = THREE.MathUtils.clamp(
    player.speed, 0, boost ? 65 : 45
  );

  // Nitro energiyasi
  player.nitro += boost ? -35 * dt : 8 * dt;
  player.nitro = THREE.MathUtils.clamp(
    player.nitro, 0, 100
  );

  // Mashina haqiqatan oldinga siljiydi
  const oldZ = player.z;
  player.z += player.speed * dt;

  // Chap va o'ngga burilish
  player.x += turning * (2.5 + player.speed * 0.11) * dt;
  player.x = THREE.MathUtils.clamp(player.x, -10, 10);

  // Yo'l chetidan chiqqanda sekinlashadi
  if (Math.abs(player.x) > 9) {
    player.speed = Math.min(player.speed, 12);
  }

  // Kuzov animatsiyasi
  player.car.position.set(
    player.x,
    Math.abs(Math.sin(player.elapsed * 18)) *
      (player.speed / 45) * 0.055,
    player.z
  );

  player.car.rotation.z = -turning * 0.12;
  player.car.rotation.y = turning * 0.025;

  // G'ildiraklar
  player.car.userData.wheels.forEach(wheel => {
    wheel.rotation.x += player.speed * dt * 1.8;
  });

  // Nitro olovi
  player.car.userData.flames.forEach(flame => {
    flame.visible = boost;

    if (boost) {
      flame.scale.set(
        0.8 + Math.random() * 0.4,
        0.7 + Math.random() * 0.8,
        0.8 + Math.random() * 0.4
      );
    }
  });

  // Stop chiroqlari
  player.car.userData.brakeLights.forEach(lamp => {
    lamp.material.emissive.set(
      braking ? '#ff0000' : '#000000'
    );

    lamp.material.emissiveIntensity = braking ? 4 : 0;
  });

  // Yo'l mashinaga nisbatan siljiydi
  road.position.z = player.z;
  roadEdges.forEach(edge => edge.position.z = player.z);

  roadDashes.forEach(dash => {
    const relative = dash.position.z - player.z;

    if (relative < -580) {
      dash.position.z += 1180;
    }
  });

  // Binolar orqada qolsa, oldinga qaytariladi
  buildings.forEach(obj => {
    if (obj.userData.windowLight) return;

    if (obj.position.z - player.z < -580) {
      obj.position.z += 1100;
    }
  });

  // Binolarning derazalarini ham birga siljitish
  // Derazalar qayta joylanadi, shahar uzluksiz ko'rinadi.
  scene.children.forEach(obj => {
    if (obj.userData.windowLight &&
        obj.position.z - player.z < -580) {
      obj.position.z += 1100;
    }
  });

  // Botlar harakati
  bots.forEach(bot => {
    bot.z += bot.speed * dt;
    bot.car.position.set(bot.x, 0, bot.z);

    bot.car.userData.wheels.forEach(wheel => {
      wheel.rotation.x += bot.speed * dt * 1.8;
    });

    // Raqib ortda qolsa, yangi masofada paydo bo'ladi
    if (bot.z - player.z < -15) {
      bot.z = player.z + 100 + Math.random() * 70;
      bot.x = Math.random() > 0.5 ? -4 : 4;
      bot.speed = 28 + Math.random() * 9;
    }

    // To'qnashuv
    const distanceZ = Math.abs(bot.z - player.z);
    const distanceX = Math.abs(bot.x - player.x);

    if (distanceZ < 3.5 && distanceX < 2.2) {
      player.speed *= 0.94;
    }
  });

  // Kamera mashina bilan birga yuradi
  const targetCameraX = player.x * 0.65;
  const targetCameraY = 6.5 + (boost ? 0.2 : 0);

  camera.position.x +=
    (targetCameraX - camera.position.x) * Math.min(1, dt * 4);

  camera.position.y +=
    (targetCameraY - camera.position.y) * Math.min(1, dt * 3);

  camera.position.z +=
    (player.z - 12 - camera.position.z) * Math.min(1, dt * 5);

  camera.lookAt(player.x, 1, player.z + 12);

  // HUD
  const kmh = Math.round(player.speed * 3.6);

  document.getElementById('speed').textContent = kmh;
  document.getElementById('bigSpeed').textContent =
    String(kmh).padStart(3, '0');

  document.getElementById('speedBar').style.width =
    Math.min(kmh / 270 * 100, 100) + '%';

  document.getElementById('nitroBar').style.width =
    player.nitro + '%';

  const ahead = bots.filter(bot => bot.z > player.z).length;

  document.getElementById('position').textContent =
    `${ahead + 1}/4`;

  // Yengil kamera tebranishi
  if (boost) {
    camera.position.y += Math.sin(player.elapsed * 35) * 0.035;
  }

  // Har 1000 metrda shartli checkpoint
  const checkpoint = Math.floor(player.z / 1000);

  if (checkpoint > player.laps) {
    player.laps = checkpoint;
    if (player.laps >= 3) {
      player.finished = true;
      player.speed = 0;

      const notice = document.getElementById('notice');
      notice.textContent = 'RACE FINISHED!';
      notice.style.display = 'block';

      setTimeout(() => {
        document.getElementById('menu').style.display = 'flex';
      }, 2500);
    }
  }
}

// ===================== GAME LOOP =====================

function animate(now) {
  requestAnimationFrame(animate);

  const dt = Math.min((now - lastTime) / 1000, 0.04);
  lastTime = now;

  update(dt);
  renderer.render(scene, camera);
}

camera.position.set(0, 6.5, -12);
camera.lookAt(0, 1, 12);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

animate(performance.now());
