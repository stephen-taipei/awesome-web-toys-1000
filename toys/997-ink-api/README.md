# Ink API Demo

This toy demonstrates the use of the experimental **Ink API** (`navigator.ink`).

## What is it?
The Ink API allows web applications to reduce the latency of stylus (and sometimes touch) input by instructing the OS compositor to draw "predicted" ink strokes ahead of the main browser thread's rendering cycle.

## Usage
- Draw on the canvas.
- If your device and browser support the Ink API (e.g., Windows 10+ with a stylus, Chrome/Edge 94+), you might see smoother, more responsive strokes.
- Even without the API, it falls back to standard low-latency canvas settings (`desynchronized: true`).

## Requirements
- Chrome / Edge 94+
- Stylus input device recommended for best effect.
