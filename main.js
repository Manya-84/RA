import { MindARThree } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";

const targetUrl = "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind";
const modelUrl = "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Duck/glTF/Duck.gltf";

async function loadModel(anchor) {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.4, 0.4, 0.4);
        model.position.set(0, -0.25, 0);
        model.rotation.set(THREE.MathUtils.degToRad(90), 0, 0);
        anchor.group.add(model);
        resolve(model);
      },
      undefined,
      (err) => reject(err)
    );
  });
}

async function setupAR() {
  const container = document.querySelector("#ar-container");

  const mindarThree = new MindARThree({
    container,
    imageTargetSrc: targetUrl,
    uiScanning: true,
    uiLoading: "Cargando cámara...",
  });

  const { renderer, scene, camera } = mindarThree;

  // Luces
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 1.1);
  scene.add(hemiLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(0, 1, 1);
  scene.add(dirLight);

  const anchor = mindarThree.addAnchor(0);

  await loadModel(anchor);

  const clock = new THREE.Clock();

  const start = async () => {
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      anchor.group.rotation.z += delta * 0.5; // ligera animación
      renderer.render(scene, camera);
    });
  };

  // Manejo de visibilidad del target
  anchor.onTargetFound = () => {
    container.classList.add("found");
  };
  anchor.onTargetLost = () => {
    container.classList.remove("found");
  };

  start();
}

setupAR().catch((err) => {
  console.error("Fallo inicializando AR", err);
  const hint = document.querySelector(".hud__hint");
  if (hint) {
    hint.textContent = "Error: revisa permisos de cámara o abre sobre HTTPS.";
    hint.style.color = "#ff9c9c";
  }
});
