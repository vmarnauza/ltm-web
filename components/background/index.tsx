import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firstRenderDone = useRef(false);

  useEffect(() => {
    if (canvasRef.current && !firstRenderDone.current) {
      initBackground(canvasRef.current);
      firstRenderDone.current = true;
    }
  });

  return (
    <div className="w-screen h-screen fixed left-0 top-0 -z-10 overflow-hidden">
      <canvas ref={canvasRef} />
    </div>
  );
}

function initBackground(canvas: HTMLCanvasElement) {
  const { max } = Math;
  const { innerHeight, innerWidth, devicePixelRatio } = window;
  const s = max(innerHeight, innerWidth) * devicePixelRatio;
  canvas.width = s;
  canvas.height = s;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const fov = 75;
  const aspect = 1;
  const near = 0.1;
  const far = 20;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(
    0.018642919740713196,
    0.062166257361373406,
    1.8988912022517688
  );
  camera.rotation.x = -0.032726499473191346;
  camera.rotation.y = 0.00981222047356264;
  camera.rotation.z = 0.00032122915379875284;

  const scene = new THREE.Scene();
  const uniforms = {
    time: { type: "f", value: 1.0 },
  };

  const material = new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms,
  });
  const geometry = new THREE.PlaneGeometry(3, 3, 32);
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);
  function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
    const canvas = renderer.domElement;
    const { innerHeight, innerWidth, devicePixelRatio } = window;
    const s = max(innerHeight, innerWidth) * devicePixelRatio;
    const needResize = canvas.width !== s || canvas.height !== s;
    if (needResize) {
      renderer.setSize(s, s, false);
    }
    return needResize;
  }

  function render(time: number) {
    time *= 0.0005;
    uniforms.time.value = time;
    if (resizeRendererToDisplaySize(renderer)) {
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

const fragmentShader = `
uniform float time;
varying vec2 vUv;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 4

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 st = 20.0 * vUv;
    vec3 color = vec3(0.0);
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00*time);
    q.y = fbm( st + vec2(1.0));
    vec2 r = vec2(0.);
    r.x = fbm( st + q*3.1261 + vec2(6.4890,3.9225)+ 0.5771*time);
    r.y = fbm( st + q*0.5899 + vec2(3.4505,0.3149)+ 0.5978*time);
    float f = fbm(st+r);
    color = mix(vec3(0.0837, 0.5855, 0.7247),
                vec3(0.8151,0.3307,0.9294),
                clamp((f*f)*6.7746,0.0,1.0));
    color = mix(color,
                vec3(0.4, 0.4, 0.4),
                clamp(length(q),0.0,1.0));
    color = mix(color,
                vec3(0.3105,0.3042,0.7610),
                clamp(length(r.x),0.0,1.0));

    gl_FragColor = vec4((f*f*f*0.9483+0.9943*f*f+0.7139*f)*color,1.);
}
`;

const vertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPos;

void main() {
  vPos = position;
  vec3 newPos = position;
  vUv = uv;
  vNormal = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPos, 1.0 );
}
`;
