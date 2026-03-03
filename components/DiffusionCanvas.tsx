import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SimulationParams, WebGLContextState } from '../types';
import { 
  VERTEX_SHADER_SOURCE, 
  SIM_FRAGMENT_SHADER_SOURCE, 
  DISPLAY_FRAGMENT_SHADER_SOURCE 
} from '../constants';
import { createShader, createProgram, createTexture, createFramebuffer } from '../utils/webgl';

interface DiffusionCanvasProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  resetSignal: number;
  clearSignal: number;
  isPaused: boolean;
  exportSignal: number;
  importFile: File | null;
  onImportComplete: () => void;
  isShaking: boolean;
}

const DiffusionCanvas: React.FC<DiffusionCanvasProps> = ({ params, setParams, resetSignal, clearSignal, isPaused, exportSignal, importFile, onImportComplete, isShaking }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webglRef = useRef<WebGLContextState>(null);
  const animationFrameRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number, y: number, lastX: number, lastY: number, down: boolean, shiftKey: boolean }>({ x: 0, y: 0, lastX: 0, lastY: 0, down: false, shiftKey: false });

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Adjust canvas resolution to match display size for sharpness
    const dpr = window.devicePixelRatio || 1;
    // Limit resolution for performance on high-DPI screens if needed, 
    // but 1080p equivalent is usually fine for this shader.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gl = canvas.getContext('webgl2', { antialias: false });
    if (!gl) {
      alert("WebGL2 not supported");
      return;
    }

    // Enable floating point textures
    const ext = gl.getExtension('EXT_color_buffer_float');
    if (!ext) {
      alert("Need EXT_color_buffer_float");
      return;
    }
    
    // Enable linear filtering for half float textures if available
    const linearSupport = gl.getExtension('OES_texture_half_float_linear');

    // Compile Shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const simFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, SIM_FRAGMENT_SHADER_SOURCE);
    const displayFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, DISPLAY_FRAGMENT_SHADER_SOURCE);

    const programSim = createProgram(gl, vertexShader, simFragmentShader);
    const programDisplay = createProgram(gl, vertexShader, displayFragmentShader);

    // Setup Quad Geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW);

    // Create Textures (Ping-Pong)
    const filter = linearSupport ? gl.LINEAR : gl.NEAREST;
    const textureA = createTexture(gl, canvas.width, canvas.height, filter);
    const textureB = createTexture(gl, canvas.width, canvas.height, filter);

    // Create Framebuffers
    const fboA = createFramebuffer(gl, textureA);
    const fboB = createFramebuffer(gl, textureB);

    webglRef.current = {
      gl,
      programDisplay,
      programSim,
      textureA,
      textureB,
      fboA,
      fboB,
      width: canvas.width,
      height: canvas.height,
    };
  }, []);

  const renderFrame = useCallback(() => {
    const state = webglRef.current;
    if (!state) return;

    const { gl, programSim, programDisplay, fboA, fboB, textureA, textureB, width, height } = state;

    if (!isPaused) {
      gl.useProgram(programSim);

      // Bind uniforms that are constant for all iterations in this frame
      const uResolution = gl.getUniformLocation(programSim, 'uResolution');
      const uBrushUV = gl.getUniformLocation(programSim, 'uBrushUV');
      const uBrushSize = gl.getUniformLocation(programSim, 'uBrushSize');
      const uMouseDown = gl.getUniformLocation(programSim, 'uMouseDown');
      const uFeed = gl.getUniformLocation(programSim, 'uFeed');
      const uKill = gl.getUniformLocation(programSim, 'uKill');
      const uDiffA = gl.getUniformLocation(programSim, 'uDiffA');
      const uDiffB = gl.getUniformLocation(programSim, 'uDiffB');
      const uDt = gl.getUniformLocation(programSim, 'uDt');
      const uDiversity = gl.getUniformLocation(programSim, 'uDiversity');
      const uShake = gl.getUniformLocation(programSim, 'uShake');
      const uTime = gl.getUniformLocation(programSim, 'uTime');
      const uTexture = gl.getUniformLocation(programSim, 'uTexture');
      const positionLoc = gl.getAttribLocation(programSim, 'position');

      const screenUVX = mouseRef.current.x / width;
      const screenUVY = 1.0 - (mouseRef.current.y / height);
      const simUVX = screenUVX - params.panX;
      const simUVY = screenUVY - params.panY;

      gl.uniform2f(uResolution, width, height);
      gl.uniform2f(uBrushUV, simUVX - Math.floor(simUVX), simUVY - Math.floor(simUVY));
      gl.uniform1f(uBrushSize, params.brushSize);
      gl.uniform1i(uMouseDown, (mouseRef.current.down && !mouseRef.current.shiftKey) ? 1 : 0);
      gl.uniform1f(uFeed, params.feed);
      gl.uniform1f(uKill, params.kill);
      gl.uniform1f(uDiffA, params.diffA);
      gl.uniform1f(uDiffB, params.diffB);
      gl.uniform1f(uDt, params.timestep);
      gl.uniform1f(uDiversity, params.diversity);
      gl.uniform1f(uShake, isShaking ? params.shakeStrength : 0.0);
      gl.uniform1f(uTime, performance.now() / 1000.0);
      gl.uniform1i(uTexture, 0);

      gl.enableVertexAttribArray(positionLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); // Using the one buffer we created would be better but for simplicity re-binding default logic often works if context isn't lost. 
      // Actually, let's just reuse the bound buffer from init.
      // Ideally we store the VAO or buffer. For this simple single-buffer app, 
      // we assume the buffer data set in init is still bound to ARRAY_BUFFER or we re-bind it.
      // Re-binding explicitly to be safe:
      const buffer = gl.createBuffer(); 
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
          -1, -1, 1, -1, -1, 1,
          -1, 1, 1, -1, 1, 1,
      ]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);


      // Simulation Loop (Ping-Pong)
      let inputTex = state.textureA;
      let inputFbo = state.fboA; // Not used for reading, but for tracking logic
      let outputFbo = state.fboB;
      let outputTex = state.textureB;

      accumulatedTimeRef.current += params.animationSpeed;
      const iterations = Math.floor(accumulatedTimeRef.current);
      accumulatedTimeRef.current -= iterations;

      for (let i = 0; i < iterations; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, outputFbo);
        gl.viewport(0, 0, width, height);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, inputTex);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Swap
        const tempTex = inputTex;
        inputTex = outputTex;
        outputTex = tempTex;

        const tempFbo = inputFbo; // technically unused logic variable here but good for mental model
        inputFbo = outputFbo; 
        outputFbo = tempFbo;

        // Determine which is currently holding the latest state
        if (i === iterations - 1) {
            // Update state refs for next frame start
            state.textureA = inputTex;
            state.textureB = outputTex;
            state.fboA = inputFbo;
            state.fboB = outputFbo;
        }
      }
    }

    // --- Render to Screen ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Null is screen
    gl.viewport(0, 0, width, height);
    gl.useProgram(programDisplay);

    const uResDisp = gl.getUniformLocation(programDisplay, 'uResolution');
    const uTexDisp = gl.getUniformLocation(programDisplay, 'uTexture');
    const uColorPalette = gl.getUniformLocation(programDisplay, 'uColorPalette');
    const uEmboss = gl.getUniformLocation(programDisplay, 'uEmboss');
    const uLightPos = gl.getUniformLocation(programDisplay, 'uLightPos');
    const uPan = gl.getUniformLocation(programDisplay, 'uPan');
    const posLocDisp = gl.getAttribLocation(programDisplay, 'position');

    gl.uniform2f(uResDisp, width, height);
    gl.uniform1i(uTexDisp, 0);
    gl.uniform1i(uColorPalette, params.colorPalette);
    gl.uniform1f(uEmboss, params.emboss);
    gl.uniform3f(uLightPos, params.lightX, params.lightY, params.lightZ);
    gl.uniform2f(uPan, params.panX, params.panY);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, state.textureA); // The last written texture from loop above

    gl.enableVertexAttribArray(posLocDisp);
    gl.vertexAttribPointer(posLocDisp, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationFrameRef.current = requestAnimationFrame(renderFrame);
  }, [params, isPaused, isShaking]);

  // Initial Setup
  useEffect(() => {
    initWebGL();
    
    const handleResize = () => {
        const canvas = canvasRef.current;
        const state = webglRef.current;
        if (!canvas || !state) return;

        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        if (newWidth === state.width && newHeight === state.height) return;

        const { gl, textureA, textureB, fboA, fboB } = state;

        // Create new textures with new size
        const filter = gl.getExtension('OES_texture_half_float_linear') ? gl.LINEAR : gl.NEAREST;
        const newTextureA = createTexture(gl, newWidth, newHeight, filter);
        const newTextureB = createTexture(gl, newWidth, newHeight, filter);
        
        // Create new FBOs
        const newFboA = createFramebuffer(gl, newTextureA);
        const newFboB = createFramebuffer(gl, newTextureB);

        // Copy old texture to new texture using blitFramebuffer
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fboA);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, newFboA);
        gl.blitFramebuffer(
            0, 0, state.width, state.height,
            0, 0, newWidth, newHeight,
            gl.COLOR_BUFFER_BIT, gl.NEAREST
        );

        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fboB);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, newFboB);
        gl.blitFramebuffer(
            0, 0, state.width, state.height,
            0, 0, newWidth, newHeight,
            gl.COLOR_BUFFER_BIT, gl.NEAREST
        );

        // Cleanup old resources
        gl.deleteTexture(textureA);
        gl.deleteTexture(textureB);
        gl.deleteFramebuffer(fboA);
        gl.deleteFramebuffer(fboB);

        // Update state
        canvas.width = newWidth;
        canvas.height = newHeight;
        state.width = newWidth;
        state.height = newHeight;
        state.textureA = newTextureA;
        state.textureB = newTextureB;
        state.fboA = newFboA;
        state.fboB = newFboB;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initWebGL]);

  // Handle Loop
  useEffect(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [renderFrame]);

  // Handle Reset/Clear
  useEffect(() => {
      if (!webglRef.current) return;
      // Re-init effectively resets seed.
      initWebGL();
  }, [resetSignal, initWebGL]);

  useEffect(() => {
     if (!webglRef.current || clearSignal === 0) return;
     const { gl, width, height, textureA, textureB } = webglRef.current;
     
     // Clear by writing all 0s (except maybe Feed A=1)
     const size = width * height * 4;
     const data = new Float32Array(size);
     for(let i=0; i<size; i+=4) {
         data[i] = 1.0; // A
         data[i+1] = 0.0; // B
         data[i+2] = 0.0;
         data[i+3] = 1.0;
     }

     gl.bindTexture(gl.TEXTURE_2D, textureA);
     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, data);
     gl.bindTexture(gl.TEXTURE_2D, textureB);
     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, data);
  }, [clearSignal]);

  // Export State
  useEffect(() => {
      if (exportSignal === 0 || !webglRef.current) return;
      const { gl, width, height, fboA } = webglRef.current;
      
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboA);
      const data = new Float32Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.FLOAT, data);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      const header = new Uint32Array([width, height]);
      const blob = new Blob([header, data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diffusion_state_${Date.now()}.rdd`;
      a.click();
      URL.revokeObjectURL(url);
  }, [exportSignal]);

  // Import State
  useEffect(() => {
      if (!importFile || !webglRef.current) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          const buffer = e.target?.result as ArrayBuffer;
          if (!buffer) return;
          
          const header = new Uint32Array(buffer, 0, 2);
          const w = header[0];
          const h = header[1];
          const data = new Float32Array(buffer, 8);

          const state = webglRef.current;
          if (!state) return;
          const { gl } = state;

          const filter = gl.getExtension('OES_texture_half_float_linear') ? gl.LINEAR : gl.NEAREST;

          const newTexA = gl.createTexture()!;
          gl.bindTexture(gl.TEXTURE_2D, newTexA);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.FLOAT, data);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

          const newTexB = gl.createTexture()!;
          gl.bindTexture(gl.TEXTURE_2D, newTexB);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.FLOAT, data);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

          const newFboA = gl.createFramebuffer()!;
          gl.bindFramebuffer(gl.FRAMEBUFFER, newFboA);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, newTexA, 0);

          const newFboB = gl.createFramebuffer()!;
          gl.bindFramebuffer(gl.FRAMEBUFFER, newFboB);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, newTexB, 0);

          gl.deleteTexture(state.textureA);
          gl.deleteTexture(state.textureB);
          gl.deleteFramebuffer(state.fboA);
          gl.deleteFramebuffer(state.fboB);

          state.textureA = newTexA;
          state.textureB = newTexB;
          state.fboA = newFboA;
          state.fboB = newFboB;
          state.width = w;
          state.height = h;

          onImportComplete();
      };
      reader.readAsArrayBuffer(importFile);
  }, [importFile, onImportComplete]);

  // Mouse Handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    mouseRef.current.shiftKey = e.shiftKey;
    if (e.shiftKey && mouseRef.current.down) {
        const dx = e.clientX - mouseRef.current.lastX;
        const dy = e.clientY - mouseRef.current.lastY;
        setParams(p => ({
            ...p,
            panX: p.panX + dx / window.innerWidth,
            panY: p.panY - dy / window.innerHeight
        }));
    } else {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
    }
    mouseRef.current.lastX = e.clientX;
    mouseRef.current.lastY = e.clientY;
  };
  const handleMouseDown = (e: React.MouseEvent) => { 
      mouseRef.current.down = true; 
      mouseRef.current.shiftKey = e.shiftKey;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
  };
  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => { 
      mouseRef.current.down = false; 
      if ('shiftKey' in e) {
          mouseRef.current.shiftKey = (e as React.MouseEvent).shiftKey;
      }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
      mouseRef.current.x = e.touches[0].clientX;
      mouseRef.current.y = e.touches[0].clientY;
      mouseRef.current.shiftKey = e.shiftKey;
  };
  const handleTouchStart = (e: React.TouchEvent) => {
      mouseRef.current.down = true;
      mouseRef.current.x = e.touches[0].clientX;
      mouseRef.current.y = e.touches[0].clientY;
      mouseRef.current.shiftKey = e.shiftKey;
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none overscroll-none"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleMouseUp}
    />
  );
};

export default DiffusionCanvas;
