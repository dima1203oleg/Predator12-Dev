declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, MOUSE, TOUCH, Vector3 } from 'three';

  export class OrbitControls extends EventTarget {
    constructor(object: Camera, domElement?: HTMLElement);

    object: Camera;
    domElement: HTMLElement | Document;

    // API
    enabled: boolean;
    target: Vector3;

    // Sub-object controls
    enableRotate: boolean;
    enableZoom: boolean;
    enablePan: boolean;

    // Limits
    minDistance: number;
    maxDistance: number;
    minZoom: number;
    maxZoom: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;

    // Set to true to enable damping (inertia)
    enableDamping: boolean;
    dampingFactor: number;

    // Auto-rotate
    autoRotate: boolean;
    autoRotateSpeed: number;

    // Mouse buttons
    mouseButtons: { LEFT?: MOUSE; MIDDLE?: MOUSE; RIGHT?: MOUSE };
    touches: { ONE?: TOUCH; TWO?: TOUCH };

    // Methods
    update(): boolean;
    saveState(): void;
    reset(): void;
    dispose(): void;
    getAzimuthalAngle(): number;
    getPolarAngle(): number;
    getDistance(): number;

    // Events
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
  }
}

declare module 'three/examples/jsm/loaders/GLTFLoader' {
  import { Loader, LoadingManager, Scene, AnimationClip, Camera, Group } from 'three';

  export interface GLTF {
    animations: AnimationClip[];
    scene: Group;
    scenes: Group[];
    cameras: Camera[];
    asset: object;
    parser: GLTFParser;
    userData: any;
  }

  export interface GLTFParser {
    json: any;
  }

  export class GLTFLoader extends Loader {
    constructor(manager?: LoadingManager);

    load(
      url: string,
      onLoad: (gltf: GLTF) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;

    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<GLTF>;

    parse(
      data: ArrayBuffer | string,
      path: string,
      onLoad: (gltf: GLTF) => void,
      onError?: (event: ErrorEvent) => void
    ): void;

    parseAsync(data: ArrayBuffer | string, path: string): Promise<GLTF>;

    setDRACOLoader(dracoLoader: any): GLTFLoader;
    setKTX2Loader(ktx2Loader: any): GLTFLoader;
    setMeshoptDecoder(meshoptDecoder: any): GLTFLoader;
  }
}

declare module 'three/examples/jsm/postprocessing/EffectComposer' {
  import { WebGLRenderer, Scene, Camera, WebGLRenderTarget, Clock } from 'three';

  export class EffectComposer {
    constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget);

    renderer: WebGLRenderer;
    renderTarget1: WebGLRenderTarget;
    renderTarget2: WebGLRenderTarget;
    writeBuffer: WebGLRenderTarget;
    readBuffer: WebGLRenderTarget;
    passes: any[];
    copyPass: any;
    clock: Clock;
    renderToScreen: boolean;

    swapBuffers(): void;
    addPass(pass: any): void;
    insertPass(pass: any, index: number): void;
    removePass(pass: any): void;
    isLastEnabledPass(passIndex: number): boolean;
    render(deltaTime?: number): void;
    reset(renderTarget?: WebGLRenderTarget): void;
    setSize(width: number, height: number): void;
    setPixelRatio(pixelRatio: number): void;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/postprocessing/RenderPass' {
  import { Scene, Camera, Material, Color } from 'three';

  export class RenderPass {
    constructor(scene: Scene, camera: Camera, overrideMaterial?: Material, clearColor?: Color, clearAlpha?: number);

    scene: Scene;
    camera: Camera;
    overrideMaterial: Material;
    clearColor: Color;
    clearAlpha: number;
    clear: boolean;
    clearDepth: boolean;
    needsSwap: boolean;
    enabled: boolean;

    render(renderer: any, writeBuffer: any, readBuffer: any): void;
    setSize(width: number, height: number): void;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/postprocessing/UnrealBloomPass' {
  import { Vector2 } from 'three';

  export class UnrealBloomPass {
    constructor(resolution: Vector2, strength: number, radius: number, threshold: number);

    resolution: Vector2;
    strength: number;
    radius: number;
    threshold: number;
    clearColor: number;
    needsSwap: boolean;
    enabled: boolean;

    render(renderer: any, writeBuffer: any, readBuffer: any): void;
    setSize(width: number, height: number): void;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/postprocessing/ShaderPass' {
  export class ShaderPass {
    constructor(shader: any, textureID?: string);

    textureID: string;
    uniforms: any;
    material: any;
    fsQuad: any;
    enabled: boolean;
    needsSwap: boolean;
    clear: boolean;
    renderToScreen: boolean;

    render(renderer: any, writeBuffer: any, readBuffer: any): void;
    setSize(width: number, height: number): void;
    dispose(): void;
  }
}

export {};
