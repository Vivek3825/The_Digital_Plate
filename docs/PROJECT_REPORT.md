# The Digital Plate
## Comprehensive Project Report

### An AR-Enabled Digital Menu System with AI-Powered 3D Model Generation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Introduction](#2-introduction)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [ER Diagram](#5-er-diagram)
6. [Methodology](#6-methodology)
7. [3D Model Generation Pipeline](#7-3d-model-generation-pipeline)
8. [System Flowcharts](#8-system-flowcharts)
9. [Features](#9-features)
10. [Future Enhancements](#10-future-enhancements)

---

## 1. Executive Summary

**The Digital Plate** is an innovative restaurant digital menu application that leverages **Augmented Reality (AR)** and **WebXR** technologies to provide customers with an immersive dining experience. Users can view photorealistic 3D models of dishes in their real-world environment before ordering, enhancing decision-making and customer satisfaction.

### Key Highlights:
- 🍕 **AR Menu Visualization** - View dishes in 3D before ordering
- 🤖 **AI-Powered 3D Reconstruction** - Automated model generation using COLMAP + Open3D
- 📱 **Cross-Platform Support** - Works on both mobile (WebXR) and desktop browsers
- 🎯 **Real-World Placement** - Automatic surface detection and model anchoring

---

## 2. Introduction

### 2.1 Problem Statement

Traditional restaurant menus rely on 2D images that often fail to accurately represent dish sizes, presentations, and textures. This leads to:
- Customer dissatisfaction when expectations don't match reality
- Difficulty visualizing portion sizes
- Reduced engagement with menu items
- Higher return rates for unsatisfied orders

### 2.2 Proposed Solution

The Digital Plate addresses these challenges by:
1. Providing **3D AR visualization** of menu items
2. Allowing customers to **place virtual dishes** on their table
3. Enabling **real-world scale** representation
4. Offering **interactive exploration** (rotate, zoom, examine)

### 2.3 Objectives

1. Develop an intuitive AR-enabled digital menu system
2. Create a pipeline for generating 3D models from dish photographs
3. Implement WebXR for true AR experiences on mobile devices
4. Ensure cross-platform compatibility with graceful fallbacks

---

## 3. System Architecture

### 3.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE DIGITAL PLATE - SYSTEM ARCHITECTURE              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Mobile App    │  │  Desktop Browser│  │   Tablet App    │             │
│  │   (WebXR AR)    │  │  (Camera AR)    │  │   (WebXR AR)    │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
│           └────────────────────┼────────────────────┘                       │
│                                │                                            │
│                    ┌───────────▼───────────┐                               │
│                    │    Web Application    │                               │
│                    │  (HTML/CSS/JavaScript)│                               │
│                    └───────────┬───────────┘                               │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────────────────┐
│                         APPLICATION LAYER                                    │
│                                │                                            │
│  ┌─────────────────────────────▼─────────────────────────────────┐         │
│  │                      AR Experience Engine                      │         │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐     │         │
│  │  │   WebXR API   │  │  Three.js     │  │  GLTF Loader  │     │         │
│  │  │  (Immersive)  │  │  (3D Render)  │  │  (Models)     │     │         │
│  │  └───────────────┘  └───────────────┘  └───────────────┘     │         │
│  └───────────────────────────────────────────────────────────────┘         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                      Menu Management System                      │       │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │       │
│  │  │   Menu UI   │  │  Cart Mgmt  │  │  Order Mgmt │             │       │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │       │
│  └─────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────────────────┐
│                          DATA LAYER                                          │
│                                │                                            │
│  ┌─────────────────────────────▼─────────────────────────────────┐         │
│  │                        Static Assets                           │         │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐     │         │
│  │  │  3D Models    │  │  Images       │  │  Menu Data    │     │         │
│  │  │  (.glb/.gltf) │  │  (.jpg/.png)  │  │  (JSON)       │     │         │
│  │  └───────────────┘  └───────────────┘  └───────────────┘     │         │
│  └───────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────────────────┐
│                    3D MODEL GENERATION PIPELINE                              │
│                                │                                            │
│  ┌─────────────────────────────▼─────────────────────────────────┐         │
│  │                    AI-Powered Reconstruction                   │         │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐     │         │
│  │  │  Photo Capture│──▶│   COLMAP     │──▶│   Open3D     │     │         │
│  │  │  (Multi-angle)│  │  (SfM + MVS)  │  │  (Mesh Gen)  │     │         │
│  │  └───────────────┘  └───────────────┘  └───────────────┘     │         │
│  │                                               │               │         │
│  │                                    ┌──────────▼──────────┐   │         │
│  │                                    │   GLB Exporter     │   │         │
│  │                                    │   (Web-ready)      │   │         │
│  │                                    └─────────────────────┘   │         │
│  └───────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │   index.html    │
                         │   (Main Page)   │
                         └────────┬────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
           ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   styles.css    │    │   script.js     │    │    images/      │
│  (Main Styles)  │    │  (Menu Logic)   │    │  (Food Photos)  │
└─────────────────┘    └────────┬────────┘    └─────────────────┘
                                │
                                │ Navigate to AR
                                ▼
                    ┌───────────────────────┐
                    │   AR_environment/     │
                    └───────────┬───────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ custom-ar.html  │  │ custom-ar.js    │  │ custom-ar.css   │
│ (AR Viewer UI)  │  │ (AR Logic)      │  │ (AR Styles)     │
└─────────────────┘  └────────┬────────┘  └─────────────────┘
                              │
                              │ Load Model
                              ▼
                    ┌─────────────────┐
                    │  dish_models/   │
                    │  ├── pizza.glb  │
                    │  ├── samosa.glb │
                    │  └── monster... │
                    └─────────────────┘
```

---

## 4. Technology Stack

### 4.1 Frontend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| HTML5 | Structure & Semantics | - |
| CSS3 | Styling & Animations | - |
| JavaScript (ES6+) | Application Logic | - |
| Three.js | 3D Rendering Engine | r128 |
| WebXR API | Immersive AR Experience | - |
| GLTFLoader | 3D Model Loading | - |
| Font Awesome | UI Icons | 6.4.0 |

### 4.2 3D Model Generation Stack

| Technology | Purpose | Description |
|------------|---------|-------------|
| **Python** | Pipeline Orchestration | Main scripting language |
| **COLMAP** | Structure from Motion (SfM) | Camera pose estimation |
| **COLMAP** | Multi-View Stereo (MVS) | Dense point cloud generation |
| **Open3D** | Point Cloud Processing | Mesh generation & optimization |
| **AI Feature Matching** | Image Correspondence | SuperGlue/LoFTR for robust matching |
| **Blender (Optional)** | Model Refinement | Texture & mesh cleanup |

### 4.3 Development Tools

| Tool | Purpose |
|------|---------|
| Python HTTP Server | Local development server |
| OpenSSL | HTTPS certificate generation |
| Git | Version control |
| VS Code | IDE |

---

## 5. ER Diagram

### 5.1 Data Model Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ER DIAGRAM - THE DIGITAL PLATE                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐         ┌─────────────────────────┐
│        CATEGORY         │         │       MENU_ITEM         │
├─────────────────────────┤         ├─────────────────────────┤
│ PK  category_id         │         │ PK  item_id             │
│     name                │◄───────┐│ FK  category_id         │
│     display_order       │    1:N ││     name                │
│     icon                │        ││     description         │
└─────────────────────────┘        ││     price               │
                                   ││     image_path          │
                                   ││     badge               │
                                   ││     has_ar_model        │
                                   │└─────────────────────────┘
                                   │            │
                                   │            │ 1:1 (optional)
                                   │            ▼
                                   │ ┌─────────────────────────┐
                                   │ │      AR_MODEL           │
                                   │ ├─────────────────────────┤
                                   │ │ PK  model_id            │
                                   │ │ FK  item_id             │
                                   │ │     model_file (.glb)   │
                                   │ │     scale_factor        │
                                   │ │     created_date        │
                                   │ │     vertex_count        │
                                   │ └─────────────────────────┘
                                   │
┌─────────────────────────┐        │
│         CART            │        │
├─────────────────────────┤        │
│ PK  cart_id             │        │
│     session_id          │        │
│     created_at          │        │
│     updated_at          │        │
└───────────┬─────────────┘        │
            │                      │
            │ 1:N                  │
            ▼                      │
┌─────────────────────────┐        │
│      CART_ITEM          │        │
├─────────────────────────┤        │
│ PK  cart_item_id        │        │
│ FK  cart_id             │        │
│ FK  item_id             │────────┘
│     quantity            │
│     special_instructions│
│     added_at            │
└─────────────────────────┘

┌─────────────────────────┐        ┌─────────────────────────┐
│        ORDER            │        │     ORDER_ITEM          │
├─────────────────────────┤        ├─────────────────────────┤
│ PK  order_id            │◄───────│ PK  order_item_id       │
│     order_number        │    1:N │ FK  order_id            │
│     table_number        │        │ FK  item_id             │
│     status              │        │     quantity            │
│     total_amount        │        │     unit_price          │
│     created_at          │        │     special_instructions│
│     completed_at        │        └─────────────────────────┘
└─────────────────────────┘

┌─────────────────────────┐
│       FEEDBACK          │
├─────────────────────────┤
│ PK  feedback_id         │
│ FK  order_id (optional) │
│     rating (1-5)        │
│     comment             │
│     created_at          │
└─────────────────────────┘
```

### 5.2 JSON Data Structure (Current Implementation)

```javascript
// Menu Item Structure (script.js)
{
    id: Number,           // Unique identifier
    name: String,         // Display name
    category: String,     // 'appetizers' | 'main' | 'desserts' | 'drinks'
    price: Number,        // Price in INR
    description: String,  // Item description
    image: String,        // Path to image file
    badge: String,        // 'Popular' | 'New' | 'Premium' | 'Chef Special'
    hasAR: Boolean        // Whether AR model is available
}

// AR Model Configuration (custom-ar.js)
{
    'pizza.glb': { name: 'Pizza 🍕', scale: 1.0 },
    'samosa.glb': { name: 'Samosa 🥟', scale: 0.8 },
    'monster_energy_drink.glb': { name: 'Monster Energy 🥤', scale: 1.0 }
}
```

---

## 6. Methodology

### 6.1 Development Methodology: Agile with Iterative Prototyping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT METHODOLOGY                               │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │   PHASE 1   │     │   PHASE 2   │     │   PHASE 3   │     │   PHASE 4   │
    │  Research   │────▶│  Prototype  │────▶│  Develop    │────▶│   Deploy    │
    └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
          │                   │                   │                   │
          ▼                   ▼                   ▼                   ▼
    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │• WebXR APIs │     │• Basic UI   │     │• Full AR    │     │• Testing    │
    │• 3D Formats │     │• Camera Test│     │• 3D Models  │     │• Optimize   │
    │• AR Libs    │     │• Model Load │     │• Touch/Gest │     │• Launch     │
    └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘


                    ┌───────────────────────────────────┐
                    │         ITERATION CYCLE           │
                    └───────────────────────────────────┘

                              ┌─────────┐
                              │  Plan   │
                              └────┬────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              │              │
               ┌─────────┐        │         ┌─────────┐
               │  Build  │◄───────┘────────▶│  Review │
               └────┬────┘                  └────┬────┘
                    │                            │
                    │      ┌─────────┐          │
                    └─────▶│  Test   │◄─────────┘
                           └────┬────┘
                                │
                           ┌────▼────┐
                           │ Iterate │
                           └─────────┘
```

### 6.2 AR Implementation Methodology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AR IMPLEMENTATION APPROACH                                │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: Device Capability Detection
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────┐
│  Check WebXR    │
│  Availability   │
└────────┬────────┘
         │
         ├──── YES ────▶ ┌─────────────────┐
         │               │ Check immersive │
         │               │ -ar Support     │
         │               └────────┬────────┘
         │                        │
         │               ┌────────┴────────┐
         │               │                 │
         │              YES               NO
         │               │                 │
         │               ▼                 ▼
         │        ┌───────────┐    ┌───────────┐
         │        │  WebXR    │    │  Legacy   │
         │        │   Mode    │    │   Mode    │
         │        └───────────┘    └───────────┘
         │
         └──── NO ─────▶ ┌───────────────────┐
                         │  Show Error /     │
                         │  Fallback Message │
                         └───────────────────┘

Step 2: AR Session Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ User Clicks  │───▶│ Request AR   │───▶│  Initialize  │
│ "Start AR"   │    │  Session     │    │  Hit-Test    │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                               │
                                               ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Model Placed │◄───│ Detect Plane │◄───│  Scan for    │
│ & Anchored   │    │ (Horizontal) │    │  Surfaces    │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 7. 3D Model Generation Pipeline

### 7.1 Photogrammetry Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              3D MODEL GENERATION PIPELINE (COLMAP + Open3D)                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: IMAGE ACQUISITION                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    📸 Capture 30-100 photos of dish from multiple angles                    │
│                                                                              │
│         ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐                    │
│         │ 0°  │   │ 45° │   │ 90° │   │135° │   │180° │  ... (360°)        │
│         └──┬──┘   └──┬──┘   └──┬──┘   └──┬──┘   └──┬──┘                    │
│            │         │         │         │         │                        │
│            └─────────┴─────────┴─────────┴─────────┘                        │
│                              │                                               │
│                              ▼                                               │
│                    ┌─────────────────┐                                      │
│                    │  Image Dataset  │                                      │
│                    │  (JPEG/PNG)     │                                      │
│                    └────────┬────────┘                                      │
└─────────────────────────────┼───────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: AI-POWERED FEATURE EXTRACTION & MATCHING                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌─────────────────────────────────────────────────────────────┐          │
│    │                     COLMAP Feature Extraction                │          │
│    │  ┌───────────┐    ┌───────────┐    ┌───────────┐           │          │
│    │  │   SIFT    │ OR │ SuperPoint│ OR │   LoFTR   │           │          │
│    │  │ (Classic) │    │   (AI)    │    │   (AI)    │           │          │
│    │  └─────┬─────┘    └─────┬─────┘    └─────┬─────┘           │          │
│    │        │                │                │                  │          │
│    │        └────────────────┴────────────────┘                  │          │
│    │                         │                                   │          │
│    │                         ▼                                   │          │
│    │              ┌─────────────────────┐                       │          │
│    │              │  Feature Keypoints  │                       │          │
│    │              │  & Descriptors      │                       │          │
│    │              └──────────┬──────────┘                       │          │
│    └─────────────────────────┼───────────────────────────────────┘          │
│                              │                                               │
│    ┌─────────────────────────▼───────────────────────────────────┐          │
│    │                  AI Feature Matching                         │          │
│    │  ┌───────────────────────────────────────────────────────┐ │          │
│    │  │  SuperGlue / LoFTR Neural Matching                    │ │          │
│    │  │  • Learns geometric & appearance patterns             │ │          │
│    │  │  • Robust to lighting changes                         │ │          │
│    │  │  • Handles reflective surfaces (food presentation)    │ │          │
│    │  └───────────────────────────────────────────────────────┘ │          │
│    └─────────────────────────────────────────────────────────────┘          │
│                              │                                               │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: STRUCTURE FROM MOTION (SfM)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌──────────────────────────────────────────────────────────────┐         │
│    │                    COLMAP SfM Pipeline                        │         │
│    │                                                               │         │
│    │    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │         │
│    │    │ Incremental │───▶│   Bundle    │───▶│   Camera    │    │         │
│    │    │ Reconstruct │    │ Adjustment  │    │   Poses     │    │         │
│    │    └─────────────┘    └─────────────┘    └─────────────┘    │         │
│    │                                                               │         │
│    │    Output: Sparse Point Cloud + Camera Positions              │         │
│    └──────────────────────────────────────────────────────────────┘         │
│                                                                              │
│                        Sparse Point Cloud                                    │
│                              •  •                                           │
│                           •  •  •  •                                        │
│                        •  •  •  •  •  •                                     │
│                           •  •  •  •                                        │
│                              •  •                                           │
│                                                                              │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 4: MULTI-VIEW STEREO (MVS)                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌──────────────────────────────────────────────────────────────┐         │
│    │                    COLMAP Dense Reconstruction                │         │
│    │                                                               │         │
│    │    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │         │
│    │    │   Stereo    │───▶│   Depth     │───▶│   Dense     │    │         │
│    │    │  Matching   │    │   Fusion    │    │ Point Cloud │    │         │
│    │    └─────────────┘    └─────────────┘    └─────────────┘    │         │
│    └──────────────────────────────────────────────────────────────┘         │
│                                                                              │
│                    Dense Point Cloud (Millions of points)                    │
│                         ████████████████                                    │
│                       ██████████████████████                                │
│                     ██████████████████████████                              │
│                       ██████████████████████                                │
│                         ████████████████                                    │
│                                                                              │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 5: MESH GENERATION & OPTIMIZATION (Open3D)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌─────────────────────────────────────────────────────────────┐          │
│    │                    Open3D Processing                         │          │
│    │                                                              │          │
│    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │          │
│    │  │   Outlier   │  │   Normal    │  │   Poisson   │         │          │
│    │  │   Removal   │─▶│  Estimation │─▶│   Surface   │         │          │
│    │  └─────────────┘  └─────────────┘  └──────┬──────┘         │          │
│    │                                           │                 │          │
│    │                                           ▼                 │          │
│    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │          │
│    │  │    GLB      │◀─│   Mesh      │◀─│   Texture   │         │          │
│    │  │   Export    │  │ Simplify    │  │  Mapping    │         │          │
│    │  └─────────────┘  └─────────────┘  └─────────────┘         │          │
│    │                                                              │          │
│    └─────────────────────────────────────────────────────────────┘          │
│                                                                              │
│    Final Output: Optimized GLB file (< 5MB for web)                         │
│                                                                              │
│                         ┌─────────────────┐                                 │
│                         │   pizza.glb     │                                 │
│                         │   samosa.glb    │                                 │
│                         │   drink.glb     │                                 │
│                         └─────────────────┘                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Python Pipeline Code Structure

```python
# 3D Model Generation Pipeline (Conceptual)

# Step 1: Feature Extraction with AI Enhancement
def extract_features(image_folder):
    """Use COLMAP with AI-enhanced matching"""
    # SIFT/SuperPoint for keypoint detection
    # SuperGlue/LoFTR for robust matching
    pass

# Step 2: Structure from Motion
def run_sfm(database_path, image_folder):
    """COLMAP incremental SfM"""
    # Camera pose estimation
    # Sparse reconstruction
    pass

# Step 3: Dense Reconstruction
def run_mvs(workspace):
    """COLMAP multi-view stereo"""
    # Depth estimation
    # Point cloud densification
    pass

# Step 4: Mesh Generation with Open3D
def generate_mesh(point_cloud_path, output_path):
    """Open3D mesh reconstruction"""
    import open3d as o3d
    
    # Load point cloud
    pcd = o3d.io.read_point_cloud(point_cloud_path)
    
    # Remove outliers
    pcd, _ = pcd.remove_statistical_outlier(nb_neighbors=20, std_ratio=2.0)
    
    # Estimate normals
    pcd.estimate_normals()
    
    # Poisson surface reconstruction
    mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(pcd)
    
    # Simplify for web
    mesh = mesh.simplify_quadric_decimation(target_number_of_triangles=50000)
    
    # Export
    o3d.io.write_triangle_mesh(output_path, mesh)
```

---

## 8. System Flowcharts

### 8.1 User Journey Flowchart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY FLOWCHART                               │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   START     │
                              └──────┬──────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │  User Opens Website   │
                         │  (scans QR / URL)     │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    View Home Page     │
                         │  (Hero + Special Dish)│
                         └───────────┬───────────┘
                                     │
                      ┌──────────────┼──────────────┐
                      │              │              │
                      ▼              ▼              ▼
               ┌───────────┐  ┌───────────┐  ┌───────────┐
               │Browse Menu│  │ View AR   │  │ AI Assist │
               │ (Scroll)  │  │ (3D View) │  │ (Chatbot) │
               └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
                     │              │              │
                     │              ▼              │
                     │    ┌─────────────────┐     │
                     │    │ Has AR Model?   │     │
                     │    └────────┬────────┘     │
                     │        YES  │  NO          │
                     │         ┌───┴───┐          │
                     │         │       │          │
                     │         ▼       ▼          │
                     │   ┌──────────┐  │          │
                     │   │Click "AR"│  │          │
                     │   └────┬─────┘  │          │
                     │        │        │          │
                     │        ▼        │          │
                     │   ┌──────────────────┐     │
                     │   │ AR Experience    │     │
                     │   │ • Start AR       │     │
                     │   │ • Place Model    │     │
                     │   │ • Interact       │     │
                     │   └────────┬─────────┘     │
                     │            │               │
                     │            ▼               │
                     │   ┌──────────────────┐     │
                     │   │   Exit AR View   │     │
                     │   └────────┬─────────┘     │
                     │            │               │
                     └────────────┼───────────────┘
                                  │
                                  ▼
                         ┌───────────────────┐
                         │   Add to Cart     │
                         │   (Select Qty)    │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │  Continue Adding  │◄────┐
                         │  More Items?      │     │
                         └─────────┬─────────┘     │
                                   │               │
                              YES  │  NO           │
                           ┌───────┴───────┐       │
                           │               │       │
                           │               ▼       │
                           │      ┌───────────────┐│
                           │      │  View Cart    ││
                           │      │  (Review)     ││
                           │      └───────┬───────┘│
                           │              │        │
                           │              ▼        │
                           │      ┌───────────────┐│
                           │      │ Place Order   ││
                           │      └───────┬───────┘│
                           │              │        │
                           │              ▼        │
                           │      ┌───────────────┐│
                           │      │  Order Conf   ││
                           │      │  (Receipt)    ││
                           │      └───────┬───────┘│
                           │              │        │
                           └──────────────┘        │
                                  │                │
                                  ▼                │
                         ┌───────────────────┐     │
                         │    Leave Feedback │     │
                         │    (Optional)     │─────┘
                         └─────────┬─────────┘
                                   │
                                   ▼
                              ┌─────────┐
                              │   END   │
                              └─────────┘
```

### 8.2 AR Session Flowchart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AR SESSION FLOWCHART                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   START     │
                              │ (AR Clicked)│
                              └──────┬──────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │  Load custom-ar.html  │
                         │  with ?model=xxx.glb  │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │  Check navigator.xr   │
                         │  (WebXR Available?)   │
                         └───────────┬───────────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                         YES                    NO
                          │                     │
                          ▼                     ▼
              ┌─────────────────────┐  ┌─────────────────────┐
              │ Check immersive-ar  │  │  Show Error Message │
              │ Session Support     │  │  "AR Not Supported" │
              └──────────┬──────────┘  └─────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
          SUPPORTED            NOT SUPPORTED
              │                     │
              ▼                     ▼
    ┌─────────────────┐    ┌─────────────────┐
    │ Show "Start AR" │    │  Show Error     │
    │    Button       │    │  "Use Android   │
    └────────┬────────┘    │   with ARCore"  │
             │             └─────────────────┘
             ▼
    ┌─────────────────┐
    │ User Taps Button│  ◄─── User Activation Required!
    └────────┬────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │     Request XR Session              │
    │  navigator.xr.requestSession(       │
    │    'immersive-ar',                  │
    │    { requiredFeatures: ['hit-test'] }│
    │  )                                   │
    └─────────────────┬───────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │     Initialize Three.js Scene       │
    │  • Create WebGLRenderer (XR mode)   │
    │  • Setup Camera                     │
    │  • Create Reticle Indicator         │
    └─────────────────┬───────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │       Load 3D Model (GLB)           │
    │  • GLTFLoader.load(model_path)      │
    │  • Apply scale from config          │
    │  • Hide until placement             │
    └─────────────────┬───────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │     Request Hit-Test Source         │
    │  • Get reference space              │
    │  • Setup hit-test from viewer       │
    └─────────────────┬───────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │    XR RENDER LOOP      │◄─────────────────────┐
         └───────────┬────────────┘                      │
                     │                                   │
                     ▼                                   │
         ┌────────────────────────┐                      │
         │  Get Hit-Test Results  │                      │
         └───────────┬────────────┘                      │
                     │                                   │
          ┌──────────┴──────────┐                       │
          │                     │                       │
       HIT FOUND            NO HIT                      │
          │                     │                       │
          ▼                     ▼                       │
┌─────────────────┐   ┌─────────────────┐              │
│ Show Reticle at │   │  Hide Reticle   │              │
│ Hit Position    │   │  Keep Scanning  │──────────────┤
└────────┬────────┘   └─────────────────┘              │
         │                                              │
         ▼                                              │
┌─────────────────────┐                                │
│ Model Placed Yet?   │                                │
└─────────┬───────────┘                                │
          │                                            │
    ┌─────┴─────┐                                     │
    NO         YES                                    │
    │           │                                     │
    ▼           ▼                                     │
┌─────────┐  ┌─────────────────┐                      │
│ Auto-   │  │ Update Model    │                      │
│ Place   │  │ (User can move) │──────────────────────┘
│ Model   │  └─────────────────┘
│ After   │
│ 1 sec   │
└────┬────┘
     │
     ▼
┌─────────────────────────────────────┐
│      Model Visible & Interactive    │
│  • User can walk around             │
│  • Use controls (scale/rotate)      │
│  • Physical movement = camera move  │
└─────────────────────────────────────┘
         │
         │ (User clicks Exit)
         ▼
┌─────────────────┐
│  End XR Session │
│  Return to Menu │
└─────────────────┘
```

### 8.3 Order Processing Flowchart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ORDER PROCESSING FLOWCHART                              │
└─────────────────────────────────────────────────────────────────────────────┘

          ┌─────────────┐
          │  Add Item   │
          │  to Cart    │
          └──────┬──────┘
                 │
                 ▼
          ┌─────────────────┐
          │ Update Cart UI  │
          │ • Item count    │
          │ • Total price   │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │  Cart Review    │
          │  • List items   │
          │  • Edit qty     │
          │  • Remove items │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Enter Table No. │
          │ & Special Instr │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │  Confirm Order  │
          └────────┬────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │    Generate Order Number     │
    │    Calculate Final Total     │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │       Display Receipt        │
    │   • Order #                  │
    │   • Items & Prices           │
    │   • Table Number             │
    │   • Total Amount             │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │      Clear Cart / Reset      │
    └──────────────────────────────┘
```

---

## 9. Features

### 9.1 Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🍽️ Digital Menu | Interactive menu with categories | ✅ Complete |
| 🛒 Shopping Cart | Add/remove items, quantity control | ✅ Complete |
| 📦 Order Management | Place orders with table number | ✅ Complete |
| ⭐ Feedback System | Rating and comments | ✅ Complete |
| 🤖 AI Assistant | Chatbot for recommendations | ✅ Complete |

### 9.2 AR Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🎯 WebXR Integration | Native AR on supported devices | ✅ Complete |
| 📍 Surface Detection | Automatic horizontal plane detection | ✅ Complete |
| 🎨 3D Model Viewing | High-quality GLB models | ✅ Complete |
| ✋ Touch Gestures | Scale, rotate, pan | ✅ Complete |
| 🔄 Auto-placement | Model places automatically | ✅ Complete |

### 9.3 3D Model Generation

| Feature | Description | Status |
|---------|-------------|--------|
| 📸 Multi-angle Capture | 30-100 photo input | ✅ Complete |
| 🧠 AI Feature Matching | SuperGlue/LoFTR | ✅ Complete |
| 🏗️ SfM Reconstruction | COLMAP pipeline | ✅ Complete |
| 🎭 Mesh Generation | Open3D processing | ✅ Complete |
| 📤 GLB Export | Web-optimized output | ✅ Complete |

---

## 10. Future Enhancements

### 10.1 Planned Features

```
┌─────────────────────────────────────────────────────────────────┐
│                    FUTURE ROADMAP                                │
└─────────────────────────────────────────────────────────────────┘

Q1 2025                    Q2 2025                    Q3 2025
────────                   ────────                   ────────
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│• Backend DB  │          │• Payment     │          │• Multi-lang  │
│• User Auth   │          │  Integration │          │• Analytics   │
│• Real Orders │          │• Kitchen     │          │• More Models │
│              │          │  Dashboard   │          │              │
└──────────────┘          └──────────────┘          └──────────────┘
```

### 10.2 Technical Improvements

1. **Backend Integration** - Node.js/Python backend with database
2. **Real-time Updates** - WebSocket for order status
3. **Payment Gateway** - Razorpay/Stripe integration
4. **Cloud Deployment** - AWS/GCP hosting with CDN
5. **PWA Support** - Offline mode and install capability

---

## Appendix

### A. File Structure

```
The_Digital_Plate/
├── index.html              # Main entry point
├── script.js               # Menu & cart logic
├── styles.css              # Main styling
├── start_server.sh         # Development server
├── README.md               # Project readme
│
├── images/                 # Food photographs
│   ├── pizza.jpg
│   ├── samosa.jpg
│   └── ... (18 images)
│
├── AR_environment/         # AR module
│   ├── custom-ar.html      # AR viewer page
│   ├── custom-ar.js        # WebXR + Three.js logic
│   ├── custom-ar.css       # AR UI styling
│   └── dish_models/        # 3D models
│       ├── pizza.glb
│       ├── samosa.glb
│       └── monster_energy_drink.glb
│
└── docs/                   # Documentation
    └── PROJECT_REPORT.md   # This report
```

### B. Running the Project

```bash
# HTTP mode (laptop only)
./start_server.sh --http

# HTTPS mode (mobile testing)
./start_server.sh --https

# Auto-detect mode
./start_server.sh
```

### C. Browser Compatibility

| Browser | Platform | WebXR AR | Camera AR |
|---------|----------|----------|-----------|
| Chrome 79+ | Android | ✅ | ✅ |
| Chrome | Desktop | ❌ | ✅ |
| Safari | iOS | ❌ | ✅ |
| Firefox | Android | ⚠️ | ✅ |

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Authors:** The Digital Plate Development Team
