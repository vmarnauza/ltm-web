import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  EffectComposer,
  // EffectPass,
  // GodRaysEffect,
  NoiseEffect,
  RenderPass,
  ShaderPass,
} from "postprocessing";
import { grainFrag, grainVert } from "./shaders/grain";
// import { starfieldFrag, starfieldVert } from "./shaders/starfield";

type CloudParticle = THREE.Mesh & {
  originalPosition?: THREE.Vector3;
};

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
  pointLight.position.set(-20, 2, 20);
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

  const texloader = new THREE.TextureLoader();
  let sphere: THREE.Mesh;
  let composer: EffectComposer;
  let grainMaterial: THREE.ShaderMaterial;

  // const skyDomeRadius = 500;
  // const sphereMaterial = new THREE.ShaderMaterial({
  //   uniforms: {
  //     skyRadius: { value: skyDomeRadius },
  //     env_c1: { value: new THREE.Color("#000000") },
  //     env_c2: { value: new THREE.Color("#000000") },
  //     noiseOffset: { value: new THREE.Vector3(100, 100.01, 100.01) },
  //     starSize: { value: 0.003 },
  //     starDensity: { value: 0.04 },
  //     clusterStrength: { value: 0.2 },
  //     clusterSize: { value: 0.1 },
  //   },
  //   vertexShader: starfieldVert,
  //   fragmentShader: starfieldFrag,
  //   side: THREE.DoubleSide,
  // });
  // const sphereGeometry = new THREE.SphereGeometry(skyDomeRadius, 20, 20);
  // const skyDome = new THREE.Mesh(sphereGeometry, sphereMaterial);
  // scene.add(skyDome);

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

      const noiseEffect = new NoiseEffect();
      noiseEffect.premultiply = true;

      grainMaterial = new THREE.ShaderMaterial({
        uniforms: {
          inputBuffer: { value: null },
          timer: { value: 1.0 },
          resolution: {
            value: new THREE.Vector2(innerWidth, innerHeight),
          },
          grainamount: { value: 0.05 },
          colored: { value: true },
          coloramount: { value: 0.8 },
          grainsize: { value: 2.2 },
          lumamount: { value: 0.8 },
          showBurns: { value: true },
        },
        vertexShader: grainVert,
        fragmentShader: grainFrag,
      });
      const grainPass = new ShaderPass(grainMaterial);
      grainPass.renderToScreen = true; // Make this the final pass for now

      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(grainPass);
    },
    (error) => {
      console.error("Error loading texture:", error);
    }
  );

  // Simple Perlin-like noise function (simplified for demo)
  function simpleNoise(x: number, y: number, scale: number = 1) {
    const scaledX = x * scale;
    const scaledY = y * scale;
    return (
      (Math.sin(scaledX * 0.1) * Math.cos(scaledY * 0.1) +
        Math.sin(scaledX * 0.2) * Math.cos(scaledY * 0.2) * 0.5 +
        Math.sin(scaledX * 0.4) * Math.cos(scaledY * 0.4) * 0.25) /
      1.75
    );
  }

  // Helper function to check if a position is too close to the moon
  function isPositionTooCloseToMoon(
    position: THREE.Vector3,
    moonSize: number
  ): boolean {
    const moonRadius = moonSize;
    const cloudRadius = 11; // Half of cloud geometry size (22/2)
    const minDistance = moonRadius + cloudRadius + 2; // Add small buffer

    // Calculate 3D distance from moon center (at origin)
    const distance = position.length();
    return distance < minDistance;
  }

  // Helper function to check if a cloud would block the view of the moon
  function isCloudBlockingMoonView(
    position: THREE.Vector3,
    moonSize: number
  ): boolean {
    const cameraZ = 50; // Camera position Z
    const moonZ = 0; // Moon is at origin

    // Only check clouds that are between the camera and the moon (positive Z)
    if (position.z <= moonZ) return false;

    // Calculate the projected position of the cloud on the moon's plane
    const rayDirection = position.clone().normalize();
    const t = -moonZ / rayDirection.z; // Parameter for ray intersection with moon plane
    const projectedX = rayDirection.x * t;
    const projectedY = rayDirection.y * t;

    // Check if the projected position is within the moon's radius (plus cloud radius for buffer)
    const moonRadius = moonSize;
    const cloudRadius = 11;
    const projectedDistance = Math.sqrt(
      projectedX * projectedX + projectedY * projectedY
    );

    return projectedDistance < moonRadius + cloudRadius;
  }

  // Helper function to push position away from moon in 3D space
  function adjustPositionAwayFromMoon(
    position: THREE.Vector3,
    moonSize: number
  ): THREE.Vector3 {
    const moonRadius = moonSize;
    const cloudRadius = 11;
    const minDistance = moonRadius + cloudRadius + 2;

    // Normalize the position vector and scale it to minimum distance
    const direction = position.clone().normalize();
    const adjustedPosition = direction.multiplyScalar(minDistance);

    return adjustedPosition;
  }

  // Helper function to adjust position to avoid blocking moon view
  function adjustPositionToAvoidBlockingMoon(
    position: THREE.Vector3,
    moonSize: number
  ): THREE.Vector3 {
    // If cloud is behind the moon, no adjustment needed
    if (position.z <= 0) return position;

    const moonRadius = moonSize;
    const cloudRadius = 11;
    const clearanceRadius = moonRadius + cloudRadius + 3; // Extra buffer for clear view

    // Calculate how far to move the cloud radially to clear the moon's view
    const xyDistance = Math.sqrt(
      position.x * position.x + position.y * position.y
    );

    if (xyDistance < clearanceRadius) {
      // Move the cloud radially outward to clear the moon's view
      const scaleFactor = clearanceRadius / xyDistance;
      return new THREE.Vector3(
        position.x * scaleFactor,
        position.y * scaleFactor,
        position.z
      );
    }

    return position;
  }

  // Helper function for better cloud distribution using grid + jitter
  function generateCloudPositions(
    numClouds: number,
    spaceSize: number,
    moonSize: number
  ) {
    const positions: THREE.Vector3[] = [];

    // Calculate grid dimensions - aim for roughly square grid
    const gridSize = Math.ceil(Math.sqrt(numClouds));
    const cellSize = spaceSize / gridSize;

    // Create grid-based positions with jitter
    for (let i = 0; i < numClouds; i++) {
      const gridX = i % gridSize;
      const gridY = Math.floor(i / gridSize);

      // Base position in grid cell
      const baseX = (gridX - gridSize / 2) * cellSize;
      const baseY = (gridY - gridSize / 2) * cellSize;

      // Add jitter within cell (up to 70% of cell size for natural look)
      const jitterAmount = cellSize * 0.7;
      const jitterX = (Math.random() - 0.5) * jitterAmount;
      const jitterY = (Math.random() - 0.5) * jitterAmount;

      // Create initial position
      const initialX = baseX + jitterX;
      const initialY = baseY + jitterY;
      const initialZ = (Math.random() - 0.5) * spaceSize;

      const initialPosition = new THREE.Vector3(initialX, initialY, initialZ);

      // Check if position needs adjustment for moon avoidance
      let finalPosition: THREE.Vector3;
      if (isPositionTooCloseToMoon(initialPosition, moonSize)) {
        finalPosition = adjustPositionAwayFromMoon(initialPosition, moonSize);
      } else {
        finalPosition = initialPosition;
      }

      // Additional check: ensure cloud doesn't block moon view
      if (isCloudBlockingMoonView(finalPosition, moonSize)) {
        finalPosition = adjustPositionToAvoidBlockingMoon(
          finalPosition,
          moonSize
        );
      }

      positions.push(finalPosition);
    }

    return positions;
  }

  const cloudParticles: CloudParticle[] = [];
  texloader.load("/images/cloud-particle.png", (tex) => {
    const cloudGeometry = new THREE.PlaneGeometry(22, 22);
    const cloudMaterial = new THREE.MeshLambertMaterial({
      map: tex,
      transparent: true,
    });

    const maxClouds = innerWidth > 768 ? 120 : 20;
    const spaceSize = innerWidth > 768 ? 100 : 40;

    // Generate better distributed positions
    const cloudPositions = generateCloudPositions(
      maxClouds,
      spaceSize,
      moonSize
    );

    cloudPositions.forEach((position) => {
      const cloud = new THREE.Mesh(
        cloudGeometry,
        cloudMaterial
      ) as CloudParticle;

      cloud.position.copy(position);
      cloud.originalPosition = cloud.position.clone();

      if (!Array.isArray(cloud.material)) {
        cloud.material.opacity = 0.4;
      }
      cloudParticles.push(cloud);
      scene.add(cloud);
    });
  });

  function render() {
    composer?.render();

    if (grainMaterial) {
      grainMaterial.uniforms.timer.value = performance.now() * 0.001;
    }

    if (sphere) {
      sphere.rotation.y += 0.0005;
    }
    cloudParticles.forEach((cloud) => {
      const rotationSpeed = 0.0001 + Math.random() * 0.0003;
      cloud.rotation.z -= rotationSpeed;
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  function handleMove(posX: number, posY: number) {
    const relativeX = (posX / window.innerWidth) * 2 - 1;
    const relativeY = (posY / window.innerHeight) * 2 - 1;
    const minDistance = -55;
    const maxDistance = 55;
    const distanceRange = maxDistance - minDistance;

    pointLight.position.x = relativeX * 20;
    pointLight.position.y = relativeY * 20 * -0.1;

    // parallax effect
    if (sphere) {
      sphere.position.x = relativeX * -0.5;
      sphere.position.y = relativeY * 0.5;
    }
    cloudParticles.forEach((cloud) => {
      const normalizedZ =
        (cloud.originalPosition?.z ?? 0) + Math.abs(minDistance);
      const distanceMult = (normalizedZ / distanceRange) * 1.5;

      cloud.position.x =
        (cloud.originalPosition?.x ?? 0) + relativeX * -distanceMult;
      cloud.position.y =
        (cloud.originalPosition?.y ?? 0) + relativeY * distanceMult;
    });
  }

  window.addEventListener("mousemove", (event) => {
    const posX = event.clientX;
    const posY = event.clientY;
    handleMove(posX, posY);
  });

  window.addEventListener("touchmove", (event) => {
    const posX = event.touches[0].clientX;
    const posY = event.touches[0].clientY;
    handleMove(posX, posY);
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
