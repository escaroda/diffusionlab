export function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${info}`);
  }
  
  return shader;
}

export function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create program");
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${info}`);
  }
  
  return program;
}

export function createTexture(gl: WebGL2RenderingContext, width: number, height: number, filter: number = gl.NEAREST): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) throw new Error("Could not create texture");
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  // Seed the texture with initial state: A=1, B=0 (mostly)
  // We add a small square of B=1 in the center to start the reaction
  const size = width * height * 4; // RGBA float
  const data = new Float32Array(size);
  
  for (let i = 0; i < size; i += 4) {
    data[i] = 1.0;     // R channel (Chemical A)
    data[i + 1] = 0.0; // G channel (Chemical B)
    data[i + 2] = 0.0;
    data[i + 3] = 1.0; // Alpha
  }
  
  // Create a seeded area in the center
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const radius = 10;
  
  for (let y = centerY - radius; y < centerY + radius; y++) {
    for (let x = centerX - radius; x < centerX + radius; x++) {
      const idx = (y * width + x) * 4;
      if (idx >= 0 && idx < size) {
        data[idx + 1] = 1.0; // Set B to 1
      }
    }
  }

  // We need FLOAT textures for simulation precision
  // RGBA16F is color-renderable by default in WebGL2, which avoids Framebuffer Incomplete errors
  // on devices that don't support EXT_color_buffer_float.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, data);
  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  
  return texture;
}

export function createFramebuffer(gl: WebGL2RenderingContext, texture: WebGLTexture): WebGLFramebuffer {
  const fbo = gl.createFramebuffer();
  if (!fbo) throw new Error("Could not create framebuffer");
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(`Framebuffer incomplete: ${status}`);
  }
  
  return fbo;
}
