# Diffusion Lab

A high-performance, interactive WebGL2 simulation of the Gray-Scott Reaction-Diffusion model.

This project was vibe coded in March 2026 using Gemini 3.1 Pro Preview.

## Features

- **Real-time WebGL2 Simulation**: Runs entirely on the GPU using floating-point textures for high precision.
- **Interactive Canvas**: Click and drag to add chemicals and watch the reaction evolve in real-time.
- **Pan Support**: Hold `Shift` and drag to pan around the infinite canvas.
- **3D Emboss Rendering**: Calculates normals from the chemical concentration to create a stunning 3D liquid effect.
- **Multiple Color Palettes**: Choose from various cosine-based color palettes (Electric Blue, Magma, Neon Green, Gold, etc.).
- **Presets**: Includes famous reaction-diffusion patterns like Mitosis, U-Skate World, Worms, and Chaos.
- **State Export/Import**: Save the exact floating-point state of your simulation to a `.rdd` file and load it later.
- **Parameter Animation**: Toggle the "Animate" checkbox to slowly drift the reaction rates over time, creating continuously evolving patterns.
- **I Feel Lucky**: Instantly randomize all parameters to discover new, unexpected patterns.
- **Shake Effect**: Simulate a physical disturbance (like a sound wave) that gently mixes the chemicals.

## How it Works

The simulation is based on the Gray-Scott model, which describes the reaction and diffusion of two virtual chemicals (A and B) on a 2D grid.

- **Chemical A** is added at a given "Feed Rate" and diffuses quickly.
- **Chemical B** is removed at a given "Kill Rate" and diffuses slowly.
- When two parts of B meet one part of A, they react to form three parts of B.

By tweaking the Feed and Kill rates, you can produce an incredible variety of patterns, from stable spots to dividing cells, chaotic boiling, and moving gliders.

## Local Development

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:3000` in your browser

## License

MIT
