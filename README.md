# 🌌 FaceToCode Pro

**High-Performance Neural ASCII Visualization Engine**

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Version: 2.0.4](https://img.shields.io/badge/Version-2.0.4-blue.svg)
![Tech: React + Vite + Gemini](https://img.shields.io/badge/Tech-React%20%7C%20Vite%20%7C%20Gemini-orange.svg)

FaceToCode is a premium, real-time ASCII rendering system that transforms your camera feed into a cinematic cyberpunk visualization. Leveraging Google Gemini 1.5 Flash for neural analysis and a custom canvas-based rendering pipeline, it offers a unique blend of retro aesthetics and futuristic intelligence.

## ✨ Core Features

- **🚀 Neural ASCI Engine**: Ultra-smooth rendering using a custom buffer-reuse pipeline.
- **🧠 Emotion Sync (AI)**: Automatically adapts rendering styles based on your facial expressions (Happy, Serious, Neutral).
- **🎭 Multi-Mode Rendering**: 
  - `Matrix Mode`: Iconic vertical rain effect with per-column temporal tracking.
  - `Retro Mode`: Warm amber/phosphor glow for a vintage terminal feel.
  - `Color Mode`: High-fidelity color mapping for modern creative expression.
- **🎥 Pro Export System**:
  - 1080x1920 (Vertical HD) video recording.
  - Snapshot capture with custom metadata overlays.
  - Letterboxed aspect-ratio preservation for exports.
- **🤖 Intelligence Assessment**: Real-time visual decoding and threat-level analysis powered by Gemini 1.5 Flash.
- **💳 Monetization Ready**: Integrated Razorpay checkout flow (Simulated) for premium feature unlocking.

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build System**: Vite
- **AI Engine**: Google Generative AI (Gemini 1.5 Flash)
- **Icons**: Lucide React
- **Payments**: Razorpay SDK Integration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Google AI Studio API Key

### Local Installation

1.  **Clone & Install**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_gemini_api_key_here
    ```

3.  **Launch**:
    ```bash
    npm run dev
    ```

## 🔒 Privacy & Security

FaceToCode is built with a privacy-first architecture. 
- All ASCII rendering happens locally on the GPU/CPU.
- Neural analysis frames are heavily downsampled before processing and are not stored permanently by the client.
- Analytics data is stored entirely in your local browser storage.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">

</p>
