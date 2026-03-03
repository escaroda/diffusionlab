export interface SimulationParams {
  feed: number;
  kill: number;
  diffA: number;
  diffB: number;
  timestep: number;
  animationSpeed: number;
  brushSize: number;
  colorPalette: number;
  emboss: number;
  diversity: number;
  lightX: number;
  lightY: number;
  lightZ: number;
  panX: number;
  panY: number;
  animateParams: boolean;
  shakeStrength: number;
}

export interface Preset {
  name: string;
  params: Partial<SimulationParams>;
}

export type WebGLContextState = {
  gl: WebGL2RenderingContext;
  programDisplay: WebGLProgram;
  programSim: WebGLProgram;
  textureA: WebGLTexture;
  textureB: WebGLTexture;
  fboA: WebGLFramebuffer;
  fboB: WebGLFramebuffer;
  width: number;
  height: number;
} | null;
