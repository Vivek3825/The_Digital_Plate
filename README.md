<div align="center">

# 🍽️ THE DIGITAL PLATE

### *Where Reality Meets Cuisine*

[![Live Demo](https://img.shields.io/badge/🌐_LIVE_DEMO-Visit_Now-00d4aa?style=for-the-badge)](https://vivek3825.github.io/The_Digital_Plate/index.html)
[![AR Ready](https://img.shields.io/badge/AR-Enabled-ff6b6b?style=for-the-badge&logo=augmented-reality)]()
[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js)]()
[![WebXR](https://img.shields.io/badge/WebXR-Supported-4ecdc4?style=for-the-badge)]()

<br>

> **Experience dishes before you order** — A revolutionary AR-powered digital menu that brings food to life in 3D right on your table.

<br>

<img src="https://raw.githubusercontent.com/Vivek3825/The_Digital_Plate/main/output/Home_page.png" alt="The Digital Plate" width="800"/>

</div>

---

## ⚡ EXPERIENCE THE FUTURE

<table>
<tr>
<td width="50%">

### 🎯 What is this?
A **next-generation restaurant menu** that uses **Augmented Reality** to display photorealistic 3D food models. Customers can visualize exact portion sizes, ingredients, and nutritional info before ordering.

</td>
<td width="50%">

### 🔮 Why it matters
- **Reduce order regrets** by 80%
- **Increase customer confidence**
- **Showcase premium dishes** effectively
- **Stand out** from competition

</td>
</tr>
</table>

---

## 🖼️ SHOWCASE

<div align="center">

| Home Page | Menu Section |
|:-:|:-:|
| <img src="https://raw.githubusercontent.com/Vivek3825/The_Digital_Plate/main/output/Home_page.png" width="400"/> | <img src="https://raw.githubusercontent.com/Vivek3825/The_Digital_Plate/main/output/Menu_section.png" width="400"/> |

| AR - Camera Mode | AR - WebXR Mode |
|:-:|:-:|
| <img src="https://raw.githubusercontent.com/Vivek3825/The_Digital_Plate/main/output/Camera_AR_approach.png" width="400"/> | <img src="https://raw.githubusercontent.com/Vivek3825/The_Digital_Plate/main/output/WebXR_AR_approach.png" width="400"/> |

| Orders & Cart | AI Assistant |
|:-:|:-:|
| <img src="https://raw.githubusercontent.com/Vivek3825/The_Digital_Plate/main/output/Order_section.png" width="400"/> | <img src="https://raw.githubusercontent.com/Vivek3825/The_Digital_Plate/main/output/AI_assistance.png" width="400"/> |

</div>

---

## 🛠️ 3D MODEL CREATION PIPELINE

<div align="center">

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           PHOTOGRAMMETRY WORKFLOW                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   📱 CAPTURE          🔄 PROCESS           🎨 REFINE           📦 EXPORT            │
│   ───────────────     ─────────────────    ──────────────      ──────────           │
│                                                                                     │
│   ┌─────────┐         ┌─────────────┐      ┌────────────┐      ┌────────┐           │
│   │  Mobile │   ───►  │  Meshroom   │ ───► │   Clean    │ ───► │  .GLB  │           │
│   │  Photos │         │  Kiri Engine│      │  Optimize  │      │  File  │           │
│   └─────────┘         └─────────────┘      └────────────┘      └────────┘           │
│                                                                                     │
│   50-100 photos       Point cloud →        Remove noise        Web-ready            │
│   360° coverage       Dense mesh           Texture fix         Compressed           │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

</div>

### 📦 AR-Ready 3D Models

| Model | Preview | Real Size |
|:------|:-------:|:---------:|
| 🍕 Pizza | `pizza.glb` | 30 cm |
| 🥟 Samosa | `samosa.glb` | 12 cm |
| 🍗 Chicken Masala | `chicken.glb` | 25 cm |
| 🧀 Paneer Masala | `paneer.glb` | 22 cm |
| 🍳 Egg Masala Thali | `egg_masala.glb` | 28 cm |
| 🥤 Monster Energy | `monster_energy_drink.glb` | 16 cm |

---

## 🏗️ ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            THE DIGITAL PLATE                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────┐    ┌─────────────────┐    ┌───────────────────────┐  │
│  │   FRONTEND     │    │   AR ENGINE     │    │    3D ASSETS          │  │
│  │   ───────────  │    │   ──────────    │    │    ─────────          │  │
│  │                │    │                 │    │                       │  │
│  │  • HTML5/CSS3  │◄──►│  • Three.js     │◄──►│  • GLB Models         │  │
│  │  • JavaScript  │    │  • WebXR API    │    │  • Photogrammetry     │  │
│  │  • Font Awesome│    │  • Camera AR    │    │  • Texture Maps       │  │
│  │                │    │                 │    │                       │  │
│  └────────────────┘    └─────────────────┘    └───────────────────────┘  │
│           │                    │                        │                │
│           └────────────────────┼────────────────────────┘                │
│                                │                                         │
│                    ┌───────────▼───────────┐                             │
│                    │     DISH DATA         │                             │
│                    │  • Ingredients CSV    │                             │
│                    │  • Nutritional Info   │                             │
│                    │  • Real-world Sizes   │                             │
│                    └───────────────────────┘                             │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📈 DEVELOPMENT JOURNEY

```
                              DEVELOPMENT TIMELINE
    ═══════════════════════════════════════════════════════════════════════

    PHASE 1: FOUNDATION                     PHASE 2: AR INTEGRATION
    ─────────────────────                   ───────────────────────
         │                                        │
         ▼                                        ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐   ┌─────────┐  ┌─────────┐
    │ Initial │──│   UI    │──│ Colab   │   │   AR    │──│  GLB    │
    │ Commit  │  │ Created │  │ Integ.  │   │  Env.   │  │ Models  │
    └─────────┘  └─────────┘  └─────────┘   └─────────┘  └─────────┘


    PHASE 3: ENHANCEMENT                    PHASE 4: POLISH
    ────────────────────                    ──────────────────
         │                                        │
         ▼                                        ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐   ┌─────────┐  ┌─────────┐
    │Three.js │──│ Stable  │──│  New    │   │  Zoom   │──│  Bug    │
    │  Fix    │  │  3D AR  │  │ Dishes  │   │  Drag   │  │  Fixes  │
    └─────────┘  └─────────┘  └─────────┘   └─────────┘  └─────────┘

    ═══════════════════════════════════════════════════════════════════════
    Commits: 45+  │  Features: AR, Cart, AI Chat  │  Status: LIVE ✓
```

---

## ✨ FEATURES

<table>
<tr>
<td>

### 🔷 Core Features
- **Dual AR Modes** — WebXR & Camera fallback
- **Interactive 3D** — Rotate, zoom, drag models
- **Real-size Scaling** — Accurate portion display
- **Holographic UI** — Futuristic info panels

</td>
<td>

### 🔶 Menu & Orders
- **Category Filters** — Appetizers, Mains, Desserts
- **Smart Cart** — Add, edit, remove items
- **Order Summary** — Tax & delivery calculation
- **Quick Checkout** — Seamless flow

</td>
</tr>
<tr>
<td>

### 🤖 AI Assistant
- **Dish Recommendations**
- **Dietary Restrictions**
- **Today's Specials**
- **Interactive Chat**

</td>
<td>

### 📱 Experience
- **Mobile First** — Responsive design
- **Touch Gestures** — Pinch, swipe, tap
- **Haptic Feedback** — Vibration cues
- **Smooth Animations** — 60fps rendering

</td>
</tr>
</table>

---

## 🚀 QUICK START

```bash
# Clone the repository
git clone https://github.com/Vivek3825/The_Digital_Plate.git

# Navigate to project
cd The_Digital_Plate

# Start local server (Python)
python3 -m http.server 8000

# Open in browser
# 🌐 http://localhost:8000
```

> ⚠️ **Important**: AR features require `HTTPS` or `localhost`. Don't open via `file://` protocol.

---

## 🔧 TROUBLESHOOTING

| Issue | Cause | Solution |
|:------|:------|:---------|
| ❌ Camera not working | Not served over HTTPS | Use local server |
| ❌ 3D model not loading | Missing GLB files | Check `AR_environment/dish_models/` |
| ❌ WebXR unavailable | Device not supported | Use Camera AR mode |

---

## 📂 PROJECT STRUCTURE

```
The_Digital_Plate/
├── 📄 index.html              # Main entry point
├── 📄 styles.css              # Styling & animations
├── 📄 script.js               # Core functionality
├── 🖼️ images/                 # Dish images
├── 📁 AR_environment/
│   ├── 📄 custom-ar.html      # AR viewer page
│   ├── 📄 custom-ar.js        # Three.js AR engine
│   ├── 📄 custom-ar.css       # AR UI styles
│   ├── 📁 dish_models/        # GLB 3D models
│   └── 📁 dish_details/       # Ingredients CSV
└── 📁 output/                 # Screenshots
```

---

<div align="center">

## 🎯 TRY IT NOW

[![Open Live Demo](https://img.shields.io/badge/🚀_LAUNCH_THE_DIGITAL_PLATE-00d4aa?style=for-the-badge&labelColor=1a1a2e)](https://vivek3825.github.io/The_Digital_Plate/index.html)

<br>

**Built with ❤️ by [Vivek](https://github.com/Vivek3825)**

*Transforming dining experiences, one dish at a time.*

---

<sub>© 2025 The Digital Plate. All rights reserved.</sub>

</div>

### 6. User will place the order
- User can click on the Top-Right corner to add dish into cart
- Click on cart option to Add to cancel order, edit order, place order
- User can see the waiting time

### 7. Hotel counter will receive the order with table number
- Counter receive orders
- They can accept or decline orders with reason
- If order get accept, weater will start serving process
- If order get decline, weater will discuss the issue with customer

### 8. End

---

## Development Status

### Dynamic Features

| Section | Description | Status |
|:---------|:--------------------------------------|:--------:|
| **Home Overview** | Attractively showcased (Hotel images, Positive feedback and rating, Badge, certifications) | Started |
| **Menu list** | List all dishes with price, user reviews, short description (sort by option) | Started |
| **Manage orders** | Add to cart, cancel order, edit order, place order | Started |
| **Offers and todays special** | daily offers, special items and combos | Started |
| **Help and Feedback** | collect user queries, issues, feedbacks for improment | Not Started |
| **Guid**| step by step guid to place order for new users | ❌ Not Started |


## Frontend Dvelopment
```
index.html
script.js
style.css

```

**five section**
```
Home
Menu
Orders
Feedback
AI Assistant

```

---

## QR code
### Snan Me
![Snan Me](images/The-Digital-Plate.png)
---