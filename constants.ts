import { Preset, SimulationParams } from './types';

export const DEFAULT_PARAMS: SimulationParams = {
  feed: 0.055,
  kill: 0.062,
  diffA: 1.0,
  diffB: 0.5,
  timestep: 1.0,
  animationSpeed: 8.0,
  brushSize: 20,
  colorPalette: 0,
  emboss: 1.0,
  diversity: 0.0,
  lightX: 1.0,
  lightY: 1.0,
  lightZ: 1.5,
  panX: 0.0,
  panY: 0.0,
  animateParams: false,
  shakeStrength: 0.0,
};

export const PRESETS: Preset[] = [
  {
    name: "Default (Coral)",
    params: { feed: 0.0545, kill: 0.062, diffA: 1.0, diffB: 0.5, colorPalette: 0, emboss: 1.0, diversity: 0.0, lightX: 1.0, lightY: 1.0, lightZ: 1.5, animationSpeed: 8.0, panX: 0.0, panY: 0.0, animateParams: false, shakeStrength: 0.0 },
  },
  {
    name: "Mitosis",
    params: { feed: 0.0367, kill: 0.0649, diffA: 1.0, diffB: 0.5, colorPalette: 1, emboss: 1.5, diversity: 0.2, lightX: 1.0, lightY: 1.0, lightZ: 1.5, animationSpeed: 8.0, panX: 0.0, panY: 0.0, animateParams: false, shakeStrength: 0.0 },
  },
  {
    name: "Coral & Holes",
    params: { feed: 0.0545, kill: 0.062, diffA: 1.0, diffB: 0.5, colorPalette: 2, emboss: 0.8, diversity: 0.5, lightX: 1.0, lightY: 1.0, lightZ: 1.5, animationSpeed: 8.0, panX: 0.0, panY: 0.0, animateParams: false, shakeStrength: 0.0 },
  },
  {
    name: "Mazes",
    params: { feed: 0.029, kill: 0.057, diffA: 1.0, diffB: 0.5, colorPalette: 3, emboss: 1.2, diversity: 0.0, lightX: 1.0, lightY: 1.0, lightZ: 1.5, animationSpeed: 8.0, panX: 0.0, panY: 0.0, animateParams: false, shakeStrength: 0.0 },
  },
  {
    name: "Waves",
    params: { feed: 0.014, kill: 0.045, diffA: 1.0, diffB: 0.5, colorPalette: 4, emboss: 0.5, diversity: 0.8, lightX: 1.0, lightY: 1.0, lightZ: 1.5, animationSpeed: 8.0, panX: 0.0, panY: 0.0, animateParams: false, shakeStrength: 0.0 },
  },
  {
    name: "Moving Spots",
    params: { feed: 0.014, kill: 0.047, diffA: 1.0, diffB: 0.5, colorPalette: 0, emboss: 2.0, diversity: 0.1, lightX: 1.0, lightY: 1.0, lightZ: 1.5, animationSpeed: 8.0, panX: 0.0, panY: 0.0, animateParams: false, shakeStrength: 0.0 },
  },
  {
    name: "Pulsating Solitons",
    params: { feed: 0.025, kill: 0.060, diffA: 1.0, diffB: 0.5, colorPalette: 1, emboss: 1.0, diversity: 0.0, lightX: 1.0, lightY: 1.0, lightZ: 1.5, animationSpeed: 8.0, panX: 0.0, panY: 0.0, animateParams: false, shakeStrength: 0.0 },
  },
  {
    name: "Chaos",
    params: { feed: 0.026, kill: 0.051, diffA: 1.0, diffB: 0.5, colorPalette: 4, emboss: 1.0, diversity: 1.0, lightX: 1.0, lightY: 1.0, lightZ: 1.5, animationSpeed: 8.0, panX: 0.0, panY: 0.0, animateParams: false, shakeStrength: 0.0 },
  },
  {
    name: "U-Skate World",
    params: { feed: 0.062, kill: 0.0609, diffA: 1.0, diffB: 0.5, colorPalette: 2, emboss: 1.5, diversity: 0.0, lightX: 1.0, lightY: 1.0, lightZ: 1.5, animationSpeed: 8.0, panX: 0.0, panY: 0.0, animateParams: false, shakeStrength: 0.0 },
  },
  {
    name: "Worms",
    params: { feed: 0.078, kill: 0.061, diffA: 1.0, diffB: 0.5, colorPalette: 3, emboss: 1.0, diversity: 0.0, lightX: 1.0, lightY: 1.0, lightZ: 1.5, animationSpeed: 8.0, panX: 0.0, panY: 0.0, animateParams: false, shakeStrength: 0.0 },
  },
  {
    name: "Bacteria",
    params: { feed: 0.035, kill: 0.065, diffA: 1.0, diffB: 0.5, colorPalette: 1, emboss: 1.2, diversity: 0.1, lightX: 1.0, lightY: 1.0, lightZ: 1.5, animationSpeed: 8.0, panX: 0.0, panY: 0.0, animateParams: false, shakeStrength: 0.0 },
  },
  {
    name: "Zebra",
    params: { feed: 0.022, kill: 0.051, diffA: 1.0, diffB: 0.5, colorPalette: 5, emboss: 0.5, diversity: 0.0, lightX: 1.0, lightY: 1.0, lightZ: 1.5, animationSpeed: 8.0, panX: 0.0, panY: 0.0, animateParams: false, shakeStrength: 0.0 },
  }
];

// Vertex Shader (Common)
export const VERTEX_SHADER_SOURCE = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Fragment Shader: Simulation (Gray-Scott)
export const SIM_FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uBrushUV;
uniform float uBrushSize;
uniform bool uMouseDown;

// Simulation parameters
uniform float uFeed;
uniform float uKill;
uniform float uDiffA;
uniform float uDiffB;
uniform float uDt;
uniform float uDiversity;
uniform float uShake;
uniform float uTime;

out vec4 fragColor;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec2 texel = 1.0 / uResolution;
  vec2 uv = gl_FragCoord.xy / uResolution;

  vec2 shakeOffset = vec2(0.0);
  if (uShake > 0.0) {
      float chance = random(uv + uTime * 2.0);
      if (chance < uShake) {
          float angle = random(uv + uTime) * 6.2831853;
          vec2 dir = vec2(cos(angle), sin(angle));
          float shiftPixels = 1.0 + uShake * 2.0;
          shakeOffset = dir * shiftPixels * texel;
      }
  }
  
  vec2 readUv = uv + shakeOffset;

  // Center cell
  vec4 center = texture(uTexture, readUv);
  float a = center.r;
  float b = center.g;

  // Laplacian convolution (3x3)
  // Weights:
  // 0.05  0.2  0.05
  // 0.2  -1.0  0.2
  // 0.05  0.2  0.05
  
  vec4 top    = texture(uTexture, readUv + vec2(0.0, texel.y));
  vec4 bottom = texture(uTexture, readUv - vec2(0.0, texel.y));
  vec4 left   = texture(uTexture, readUv - vec2(texel.x, 0.0));
  vec4 right  = texture(uTexture, readUv + vec2(texel.x, 0.0));
  
  vec4 topLeft     = texture(uTexture, readUv + vec2(-texel.x, texel.y));
  vec4 topRight    = texture(uTexture, readUv + vec2(texel.x, texel.y));
  vec4 bottomLeft  = texture(uTexture, readUv + vec2(-texel.x, -texel.y));
  vec4 bottomRight = texture(uTexture, readUv + vec2(texel.x, -texel.y));

  vec2 laplacian = (
    -1.0 * center.rg +
    0.2 * (top.rg + bottom.rg + left.rg + right.rg) +
    0.05 * (topLeft.rg + topRight.rg + bottomLeft.rg + bottomRight.rg)
  );

  // Add spatial diversity to feed and kill rates
  float currentFeed = uFeed;
  float currentKill = uKill;
  
  if (uDiversity > 0.0) {
    float variation = sin(uv.x * 15.0) * cos(uv.y * 15.0);
    currentFeed += variation * 0.01 * uDiversity;
    currentKill -= variation * 0.01 * uDiversity;
  }

  // Reaction-Diffusion logic
  // A' = A + (Da * lapA - A*B^2 + f*(1-A)) * dt
  // B' = B + (Db * lapB + A*B^2 - (k+f)*B) * dt

  float reaction = a * b * b;
  float da = uDiffA * laplacian.r - reaction + currentFeed * (1.0 - a);
  float db = uDiffB * laplacian.g + reaction - (currentKill + currentFeed) * b;

  a += da * uDt;
  b += db * uDt;

  // Mouse interaction: Add B (chemical 2)
  vec2 d = abs(uv - uBrushUV);
  d = min(d, 1.0 - d);
  float dist = length(d * uResolution);
  if (uMouseDown && dist < uBrushSize) {
     b = 0.9;
  }

  // Constrain
  fragColor = vec4(clamp(a, 0.0, 1.0), clamp(b, 0.0, 1.0), 0.0, 1.0);
}
`;

// Fragment Shader: Display (Color Mapping)
export const DISPLAY_FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform int uColorPalette;
uniform float uEmboss;
uniform vec3 uLightPos;
uniform vec2 uPan;

out vec4 fragColor;

// Cosine based palette, 4 vec3 params
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
  vec2 texel = 1.0 / uResolution;
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  vec2 simUv = fract(uv - uPan);
  
  float b = texture(uTexture, simUv).g;
  
  // Normal calculation for 3D effect
  float bTop = texture(uTexture, fract(simUv + vec2(0.0, texel.y))).g;
  float bBottom = texture(uTexture, fract(simUv - vec2(0.0, texel.y))).g;
  float bLeft = texture(uTexture, fract(simUv - vec2(texel.x, 0.0))).g;
  float bRight = texture(uTexture, fract(simUv + vec2(texel.x, 0.0))).g;
  
  float dx = (bRight - bLeft) * 5.0 * uEmboss;
  float dy = (bTop - bBottom) * 5.0 * uEmboss;
  float dz = 1.0;
  vec3 normal = normalize(vec3(-dx, -dy, dz));
  
  // Lighting
  vec3 lightDir = normalize(uLightPos);
  float diffuse = max(dot(normal, lightDir), 0.0);
  
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfDir = normalize(lightDir + viewDir);
  float specular = pow(max(dot(normal, halfDir), 0.0), 32.0) * uEmboss;
  
  // Color Palettes
  vec3 color;
  float t = pow(b, 0.5); // non-linear mapping for better contrast
  
  if (uColorPalette == 0) {
    color = palette(t, vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5), vec3(1.0,1.0,1.0), vec3(0.0,0.33,0.67));
  } else if (uColorPalette == 1) {
    color = palette(t, vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5), vec3(1.0,1.0,1.0), vec3(0.0,0.10,0.20));
  } else if (uColorPalette == 2) {
    color = palette(t, vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5), vec3(1.0,1.0,1.0), vec3(0.3,0.20,0.20));
  } else if (uColorPalette == 3) {
    color = palette(t, vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5), vec3(1.0,1.0,0.5), vec3(0.8,0.90,0.30));
  } else if (uColorPalette == 4) {
    color = palette(t, vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5), vec3(2.0,1.0,0.0), vec3(0.5,0.20,0.25));
  } else if (uColorPalette == 5) {
    color = palette(t, vec3(0.6,0.6,0.6), vec3(0.4,0.4,0.4), vec3(1.0,1.0,1.0), vec3(0.0,0.0,0.0)); // Silver
  } else if (uColorPalette == 6) {
    color = palette(t, vec3(0.6,0.4,0.2), vec3(0.4,0.3,0.1), vec3(1.0,1.0,1.0), vec3(0.0,0.0,0.0)); // Bronze
  } else {
    color = palette(t, vec3(0.4,0.5,0.4), vec3(0.4,0.3,0.2), vec3(1.0,1.0,1.0), vec3(0.5,0.0,0.2)); // Patina
  }
  
  // Combine color, diffuse, and specular
  float diffuseFactor = mix(1.0, 0.3 + 0.7 * diffuse, clamp(uEmboss, 0.0, 1.0));
  vec3 finalColor = color * diffuseFactor + specular * vec3(1.0);
  
  // Add a bit of ambient occlusion based on concentration
  float ao = mix(1.0, smoothstep(0.0, 0.5, b + 0.2), clamp(uEmboss, 0.0, 1.0));
  finalColor *= ao;

  fragColor = vec4(finalColor, 1.0);
}
`;
