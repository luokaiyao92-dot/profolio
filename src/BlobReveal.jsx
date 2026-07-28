/**
 * [INPUT]: 依赖 Three.js 的场景、相机、纹理与 ShaderMaterial，依赖 GSAP 驱动 uProgress，并接收目标图片、激活状态、时长和完成回调
 * [OUTPUT]: 对外提供 BlobReveal WebGL 纹理揭示组件，以 Originkit 的多 Blob SDF Shader 从画面中心液态扩张
 * [POS]: src 的 GPU 过渡渲染器，只负责“图二纹理显现”，由 HeroIntro 管理点击、封面和完成后的真实页面切换
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useCallback, useEffect, useRef } from 'react';
import {
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three';
import { gsap } from 'gsap';

const CAMERA_FOV = 35;
const PLANE_SEGMENTS = 128;

const vertexShader = `
varying vec2 vUv;
void main(){
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 clipPosition = projectionMatrix * viewPosition;
  gl_Position = clipPosition;
  vUv = uv;
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uProgress;
uniform vec2 uSize;
uniform vec2 uImageSize;
uniform sampler2D uTexture;
uniform int uBlobCount;
uniform float uFitCover;
#define PI 3.1415926538
#define TWO_PI 6.28318530718

float noise(vec2 point) {
  float frequency = 1.0;
  float angle = atan(point.y, point.x) + uProgress * PI;
  float w0 = (cos(angle * frequency) + 1.0) / 2.0;
  float w1 = (sin(2.0 * angle * frequency) + 1.0) / 2.0;
  float w2 = (cos(3.0 * angle * frequency) + 1.0) / 2.0;
  return (w0 + w1 + w2) / 3.0;
}

float softMax(float a, float b, float k) {
  return log(exp(k * a) + exp(k * b)) / k;
}

float softMin(float a, float b, float k) {
  return -softMax(-a, -b, k);
}

float circleSDF(vec2 pos, float rad) {
  float a = sin(uProgress * 0.2) * 0.25;
  float amt = 0.5 + a;
  float circle = length(pos);
  circle += noise(pos) * rad * amt;
  return circle;
}

void main() {
  vec4 bg = vec4(0.0, 0.0, 0.0, 0.0);
  vec2 coverUV = vUv;
  if (uSize.x > 0.0 && uSize.y > 0.0 && uImageSize.x > 0.0 && uImageSize.y > 0.0) {
    float containerAspect = uSize.x / uSize.y;
    float imageAspect = uImageSize.x / uImageSize.y;
    vec2 scale = vec2(1.0);
    if (uFitCover > 0.5) {
      if (containerAspect > imageAspect) scale.y = imageAspect / containerAspect;
      else scale.x = containerAspect / imageAspect;
    } else {
      if (containerAspect > imageAspect) scale.x = containerAspect / imageAspect;
      else scale.y = imageAspect / containerAspect;
    }
    coverUV = (vUv - 0.5) * scale + 0.5;
  }

  vec4 texture = texture2D(uTexture, coverUV);
  if (uFitCover < 0.5 &&
      (coverUV.x < 0.0 || coverUV.x > 1.0 || coverUV.y < 0.0 || coverUV.y > 1.0)) {
    texture = vec4(0.0);
  }

  vec2 coords = vUv * uSize;
  vec2 center = vec2(0.5) * uSize;
  float t = pow(uProgress, 2.5);
  float maxDim = sqrt(uSize.x * uSize.x + uSize.y * uSize.y);
  float rad = t * maxDim;
  float circle = circleSDF(coords - center, rad);
  float k = 50.0 / max(uSize.x, uSize.y);
  int extraBlobs = uBlobCount - 1;

  for (int i = 0; i < 20; i++) {
    if (i >= extraBlobs) break;
    float idx = float(i);
    float total = float(extraBlobs);
    float baseAngle = idx * TWO_PI / max(total, 1.0);
    float jitter = fract(sin(idx * 127.1 + 311.7) * 43758.5453) * 0.5 - 0.25;
    float angle = baseAngle + jitter;
    float distRatio = 0.25 + 0.2 * fract(sin(idx * 43.3) * 12345.6);
    vec2 offset = vec2(cos(angle), sin(angle)) * distRatio * min(uSize.x, uSize.y);
    float blobDist = length(coords - center - offset);
    float blobNoise = noise(coords - center - offset) * rad * 0.4;
    float blob = blobDist + blobNoise;
    circle = softMin(circle, blob, k);
  }

  circle = step(circle, rad);
  gl_FragColor = mix(bg, texture, circle);
}
`;

function cameraDistance(height, fov) {
  const safeHeight = Math.max(height, 1);
  return safeHeight / 2 / Math.tan((fov * Math.PI) / 360) || 1;
}

function fitCamera(camera, width, height) {
  const safeWidth = Math.max(width, 1);
  const safeHeight = Math.max(height, 1);
  camera.aspect = safeWidth / safeHeight;
  camera.fov = CAMERA_FOV;
  camera.position.set(0, 0, cameraDistance(safeHeight, camera.fov));
  camera.updateProjectionMatrix();
}

function cubicBezierEase(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (time) => ((ax * time + bx) * time + cx) * time;
  const sampleY = (time) => ((ay * time + by) * time + cy) * time;
  const derivativeX = (time) => (3 * ax * time + 2 * bx) * time + cx;

  return (progress) => {
    let time = progress;
    for (let index = 0; index < 8; index += 1) {
      const delta = sampleX(time) - progress;
      const derivative = derivativeX(time);
      if (Math.abs(delta) < 1e-4 || Math.abs(derivative) < 1e-6) break;
      time -= delta / derivative;
    }
    return sampleY(Math.min(1, Math.max(0, time)));
  };
}

const easeOut = cubicBezierEase(0, 0, 0.58, 1);

export default function BlobReveal({ image, active, duration = 2, blobCount = 20, fit = 'cover', onComplete }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const runtimeRef = useRef(null);
  const tweenRef = useRef(null);
  const activeRef = useRef(active);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const render = useCallback(() => {
    const runtime = runtimeRef.current;
    if (runtime) runtime.renderer.render(runtime.scene, runtime.camera);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || !image) return undefined;

    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    const scene = new Scene();
    const camera = new PerspectiveCamera(CAMERA_FOV, width / height, 0.1, 4000);
    fitCamera(camera, width, height);

    let renderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      onCompleteRef.current?.();
      return undefined;
    }

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const geometry = new PlaneGeometry(width, height, PLANE_SEGMENTS, PLANE_SEGMENTS);
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uProgress: { value: 0 },
        uSize: { value: new Vector2(width, height) },
        uImageSize: { value: new Vector2(1, 1) },
        uTexture: { value: null },
        uBlobCount: { value: Math.min(20, Math.max(1, Math.round(blobCount))) },
        uFitCover: { value: fit === 'contain' ? 0 : 1 },
      },
    });
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);
    runtimeRef.current = { scene, camera, renderer, mesh, material };

    const startReveal = () => {
      if (!activeRef.current || tweenRef.current) return;
      tweenRef.current = gsap.to(material.uniforms.uProgress, {
        value: 1,
        duration,
        ease: easeOut,
        onUpdate: () => {
          render();
        },
        onComplete: () => onCompleteRef.current?.(),
      });
    };

    const texture = new TextureLoader().load(image, (loadedTexture) => {
      const imageWidth = loadedTexture.image?.width || 1;
      const imageHeight = loadedTexture.image?.height || 1;
      material.uniforms.uImageSize.value.set(imageWidth, imageHeight);
      material.uniforms.uTexture.value = loadedTexture;
      render();
      startReveal();
    }, undefined, () => onCompleteRef.current?.());

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = container.clientWidth || 1;
      const nextHeight = container.clientHeight || 1;
      fitCamera(camera, nextWidth, nextHeight);
      renderer.setSize(nextWidth, nextHeight, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      mesh.geometry.dispose();
      mesh.geometry = new PlaneGeometry(nextWidth, nextHeight, PLANE_SEGMENTS, PLANE_SEGMENTS);
      material.uniforms.uSize.value.set(nextWidth, nextHeight);
      render();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      tweenRef.current?.kill();
      tweenRef.current = null;
      texture.dispose();
      mesh.geometry.dispose();
      material.dispose();
      scene.clear();
      renderer.dispose();
      runtimeRef.current = null;
    };
  }, [blobCount, duration, fit, image, render]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!active || !runtime || tweenRef.current || !runtime.material.uniforms.uTexture.value) return;
    tweenRef.current = gsap.to(runtime.material.uniforms.uProgress, {
      value: 1,
      duration,
      ease: easeOut,
      onUpdate: () => {
        render();
      },
      onComplete: () => onCompleteRef.current?.(),
    });
  }, [active, duration, render]);

  return (
    <div className="blob-reveal" aria-hidden="true" ref={containerRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}
