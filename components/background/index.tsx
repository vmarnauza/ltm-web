import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
} from "postprocessing";

export default function Background() {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstRenderDone = useRef(false);

  useEffect(() => {
    if (containerRef.current && !firstRenderDone.current) {
      initBackground(containerRef.current);
      firstRenderDone.current = true;
    }
  });

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen fixed left-0 top-0 -z-10 overflow-hidden"
    ></div>
  );
}

function initBackground(container: HTMLDivElement) {
  const { innerHeight, innerWidth, devicePixelRatio } = window;
  const moonSize = 8;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.001);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(scene.fog.color);
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(innerWidth, innerHeight);
  // light setup
  const pointLight = new THREE.PointLight(0x404040, 70, 0, 0.01);
  pointLight.position.set(-20, 10, 20);
  pointLight.castShadow = true;
  scene.add(pointLight);

  // const ambientLight = new THREE.AmbientLight(0x404040, 10);
  // scene.add(ambientLight);

  // const directionalLight = new THREE.DirectionalLight(0xff8c19, 0.5);
  // directionalLight.position.set(0, 0, 1);
  // scene.add(directionalLight);
  // const pointLightHelper = new THREE.PointLightHelper(pointLight, 10, 0xffff00);
  // scene.add(pointLightHelper);

  const fov = 45;
  const aspect = innerWidth / innerHeight;
  const near = 1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 50;
  camera.position.y = 0;

  var texloader = new THREE.TextureLoader();
  let sphere: THREE.Mesh;
  let composer: EffectComposer;
  texloader.load(
    "/images/moon-texture.png",
    (tex) => {
      const geometry = new THREE.SphereGeometry(moonSize, 22, 22);
      const material = new THREE.MeshPhongMaterial({
        color: 0xb2b2b2,
        normalMap: tex,
        shininess: 0,
      });

      sphere = new THREE.Mesh(geometry, material);
      sphere.rotation.z = 0.5;
      scene.add(sphere);

      // const bloomEffect = new BloomEffect({
      //   blendFunction: BlendFunction.COLOR_DODGE,
      //   kernelSize: KernelSize.SMALL,
      //   luminanceThreshold: 0.3,
      //   luminanceSmoothing: 0.75,
      // });
      // bloomEffect.blendMode.opacity.value = 1.5;
      // const glitchEffect = new GlitchEffect();
      // glitchEffect.minStrength = 0.015;
      // glitchEffect.maxStrength = 0.1;
      // glitchEffect.columns = 0;
      // glitchEffect.ratio = 0.85;
      // glitchEffect.minDuration = 0.5;
      // glitchEffect.maxDuration = 2;
      // glitchEffect.minDelay = 8;
      // glitchEffect.maxDelay = 20;
      // glitchEffect.mode = GlitchMode.SPORADIC;

      // const godRaysEffect = new GodRaysEffect(camera, sphere, {
      //   height: 480,
      //   kernelSize: 2,
      //   density: 1,
      //   decay: 0.9,
      //   weight: 0.5,
      //   exposure: 0.3,
      //   samples: 20,
      //   clampMax: 0.95,
      // });

      const noiseEffect = new NoiseEffect();
      noiseEffect.premultiply = true;

      const effectPass = new EffectPass(camera, noiseEffect);
      effectPass.renderToScreen = true;

      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(effectPass);
    },
    (error) => {
      console.error("Error loading texture:", error);
    }
  );

  const cloudParticles: THREE.Mesh[] = [];
  texloader.load("/images/cloud-particle.png", (tex) => {
    const cloudGeometry = new THREE.PlaneGeometry(22, 22);
    const cloudMaterial = new THREE.MeshLambertMaterial({
      map: tex,
      transparent: true,
    });

    const maxClouds = innerWidth > 768 ? 120 : 20;
    for (let i = 0; i < maxClouds; i++) {
      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
      const positionOffset = moonSize;
      const maxOffset =
        innerWidth > 768 ? 100 - positionOffset : 40 - positionOffset;
      const randomX = (Math.random() - 0.5) * maxOffset;
      const randomY = (Math.random() - 0.5) * maxOffset;
      const randomZ = (Math.random() - 0.5) * maxOffset;

      cloud.position.set(
        randomX > 0 ? randomX + positionOffset : randomX - positionOffset,
        randomY > 0 ? randomY + positionOffset : randomY - positionOffset,
        randomZ > 0 ? randomZ + positionOffset : randomZ - positionOffset
      );

      cloud.material.opacity = 0.5;
      cloudParticles.push(cloud);
      scene.add(cloud);
    }
  });

  function render() {
    // renderer.render(scene, camera);
    composer?.render();

    if (sphere) {
      sphere.rotation.y += 0.0005;
    }
    cloudParticles.forEach((cloud) => {
      cloud.rotation.z -= 0.0002;
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  window.addEventListener("mousemove", (event) => {
    const posX = event.clientX;
    const posY = event.clientY;

    pointLight.position.x = ((posX / window.innerWidth) * 2 - 1) * 20;
    pointLight.position.y = ((posY / window.innerHeight) * 2 - 1) * 20 * -0.1;
  });

  window.addEventListener(
    "resize",
    () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    },
    false
  );

  container.appendChild(renderer.domElement);
}
