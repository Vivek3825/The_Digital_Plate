// Three.js scene components
let scene, camera, renderer, model;
let isArActive = false;
let isModelPlaced = false;
let autoRotate = true;
let surfaceIndicator;
let lastSurfaceDetected = false;

// WebXR variables
let xrSession = null;
let xrRefSpace = null;
let hitTestSource = null;
let reticle = null;
let useWebXR = false;
let domOverlayEnabled = false;

// Touch interaction variables
let touchStartX = 0;
let touchStartY = 0;
let initialPinchDistance = 0;
let initialRotationAngle = 0;
let modelScale = 1;
let isDragging = false;
let lastTouchTime = 0;
let isTwoFingerGesture = false;

// Mouse interaction variables
let isMouseDown = false;
let mouseStartX = 0;
let mouseStartY = 0;

// Model configurations with real-world sizes (in centimeters)
const modelConfigs = {
    'pizza.glb': { name: 'Pizza 🍕', scale: 0.5, dishId: 16, realSizeCm: 30, minSizeCm: 15, maxSizeCm: 45 },
    'samosa.glb': { name: 'Samosa 🥟', scale: 0.6, dishId: 15, realSizeCm: 12, minSizeCm: 8, maxSizeCm: 18 },
    'monster_energy_drink.glb': { name: 'Monster Energy Drink 🥤', scale: 0.6, dishId: 17, realSizeCm: 16, minSizeCm: 10, maxSizeCm: 20 },
    'chicken.glb': { name: 'Chicken Masala 🍗', scale: 0.6, dishId: 18, realSizeCm: 25, minSizeCm: 18, maxSizeCm: 35 },
    'egg_masala.glb': { name: 'Egg Masala Thali 🍳', scale: 0.5, dishId: 19, realSizeCm: 28, minSizeCm: 20, maxSizeCm: 35 },
    'paneer.glb': { name: 'Paneer Masala 🧀', scale: 0.6, dishId: 20, realSizeCm: 22, minSizeCm: 15, maxSizeCm: 30 }
};

// Realistic scaling variables
let baseModelSize = 1; // Base size of model in scene units
let currentRealSizeCm = 25; // Current displayed size in cm
let realSizeConfig = null; // Current dish real size config
let sizeSprite = null; // 3D sprite showing current size in AR

// Dish details data (from ingredients_nutrients_filled.csv)
const dishData = {
    15: {
        name: 'Samosa',
        ingredients: 'Potatoes, peas, spices, flour pastry',
        nutrients: 'Carbohydrates, fats, fiber, protein'
    },
    16: {
        name: 'Pizza',
        ingredients: 'Pizza dough, cheese, corn, tomato sauce, oregano',
        nutrients: 'Carbohydrates, fats, calcium, protein'
    },
    17: {
        name: 'Monster Energy Drink',
        ingredients: 'Carbonated water, sugar, caffeine, taurine, B-vitamins',
        nutrients: 'Carbohydrates, caffeine, B-vitamins'
    },
    18: {
        name: 'Chicken Masala',
        ingredients: 'Chicken, onions, tomatoes, garlic, ginger, masala spices',
        nutrients: 'Protein, fats, iron, vitamin B6'
    },
    19: {
        name: 'Egg Masala Thali',
        ingredients: 'Eggs, onions, tomatoes, masala spices, rice, roti',
        nutrients: 'Protein, carbohydrates, fats, vitamins A & B12'
    },
    20: {
        name: 'Paneer Masala',
        ingredients: 'Paneer, tomatoes, onions, cream, spices',
        nutrients: 'Protein, fats, calcium'
    }
};

// Info panel state
let isInfoPanelVisible = false;
let currentDishId = null;

// Futuristic hologram elements (3D overlay around model)
let hologramGroup = null;
let hologramPulse = 0;
const hologramState = {
    sprites: [],
    ring: null,
    beam: null
};
const tempBox = new THREE.Box3();
const tempVector = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();
const tempScale = new THREE.Vector3();
const tempDir = new THREE.Vector3();

const HIT_STABILITY_THRESHOLD = 3;
let consecutiveHitFrames = 0;
let statusMessageTimeout = null;

const CAMERA_GROUND_Y = -0.2;

function isUiInteractionTarget(target) {
    if (!target || typeof target.closest !== 'function') return false;
    return Boolean(
        target.closest('.control-panel') ||
        target.closest('.exit-btn') ||
        target.closest('.exit-ar-btn') ||
        target.closest('.size-indicator')
    );
}

function getStatusElement() {
    return document.getElementById('statusMessage');
}

function hideStatusMessage() {
    const el = getStatusElement();
    if (!el) return;
    el.classList.add('hidden');
    el.classList.remove('visible');
    if (statusMessageTimeout) {
        clearTimeout(statusMessageTimeout);
        statusMessageTimeout = null;
    }
}

function showStatusMessage(text, options = {}) {
    const el = getStatusElement();
    if (!el) {
        if (text) console.log('[AR]', text);
        return;
    }
    if (!text) {
        hideStatusMessage();
        return;
    }
    el.textContent = text;
    el.classList.remove('hidden');
    el.classList.add('visible');
    if (statusMessageTimeout) {
        clearTimeout(statusMessageTimeout);
        statusMessageTimeout = null;
    }
    if (!options.sticky) {
        const duration = options.duration ?? 4000;
        statusMessageTimeout = setTimeout(() => {
            hideStatusMessage();
        }, duration);
    }
}

function projectScreenPointToGround(clientX, clientY) {
    if (!camera || !renderer) return null;
    const rect = renderer.domElement.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
    const ndc = new THREE.Vector3(ndcX, ndcY, 0.5);
    ndc.unproject(camera);
    tempDir.copy(ndc).sub(camera.position).normalize();
    const epsilon = 1e-4;
    if (Math.abs(tempDir.y) < epsilon) {
        return null;
    }
    const t = (CAMERA_GROUND_Y - camera.position.y) / tempDir.y;
    if (t <= 0) {
        return null;
    }
    return new THREE.Vector3().copy(camera.position).add(tempDir.multiplyScalar(t));
}

function updateSurfaceIndicatorPosition(point) {
    if (!surfaceIndicator || !point) return;
    surfaceIndicator.position.copy(point);
    surfaceIndicator.position.y = CAMERA_GROUND_Y;
    surfaceIndicator.visible = true;
}

// Get model from URL parameter
function getModelFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('model');
}

// Show the holographic info panel with dish details
function showHoloInfoPanel(modelFile) {
    const config = modelConfigs[modelFile];
    if (!config || !config.dishId) return;
    
    const dish = dishData[config.dishId];
    if (!dish) return;
    
    currentDishId = config.dishId;
    realSizeConfig = config;
    
    // In WebXR mode: only show 3D hologram (HTML won't be visible anyway)
    if (useWebXR) {
        updateHologramContent(dish);
        isInfoPanelVisible = true;
        
        // Update toggle button style
        const toggleBtn = document.getElementById('infoToggleBtn');
        if (toggleBtn) {
            toggleBtn.style.background = 'rgba(0, 255, 255, 0.3)';
            toggleBtn.style.borderColor = 'rgba(0, 255, 255, 0.8)';
        }
        return;
    }
    
    // In camera mode: show HTML panel only (no 3D hologram to avoid duplication)
    // Update panel content
    document.getElementById('holoDishName').textContent = dish.name;
    document.getElementById('holoIngredients').textContent = dish.ingredients;
    document.getElementById('holoNutrients').textContent = dish.nutrients;
    
    // Update size indicator
    updateSizeIndicator();
    
    // Show panel with animation
    const panel = document.getElementById('holoInfoPanel');
    panel.classList.remove('hidden');
    
    // Trigger reflow for animation
    void panel.offsetWidth;
    panel.classList.add('visible');
    
    isInfoPanelVisible = true;
    
    // Update toggle button
    const toggleBtn = document.getElementById('infoToggleBtn');
    if (toggleBtn) {
        toggleBtn.style.background = 'rgba(0, 255, 255, 0.3)';
        toggleBtn.style.borderColor = 'rgba(0, 255, 255, 0.8)';
    }
    
    // Hide 3D hologram in camera mode (HTML panel is enough)
    hideHologramGroup();
}

// Hide the holographic info panel
function hideHoloInfoPanel() {
    const panel = document.getElementById('holoInfoPanel');
    
    // Hide HTML panel (camera mode)
    if (panel) {
        panel.classList.remove('visible');
        setTimeout(() => {
            panel.classList.add('hidden');
        }, 500);
    }
    
    isInfoPanelVisible = false;
    
    // Update toggle button
    const toggleBtn = document.getElementById('infoToggleBtn');
    if (toggleBtn) {
        toggleBtn.style.background = 'rgba(255, 255, 255, 0.95)';
        toggleBtn.style.borderColor = 'transparent';
    }
    
    // Hide 3D hologram
    hideHologramGroup();
    
    // Hide 3D size sprite
    if (sizeSprite && scene) {
        scene.remove(sizeSprite);
        if (sizeSprite.material && sizeSprite.material.map) sizeSprite.material.map.dispose();
        if (sizeSprite.material) sizeSprite.material.dispose();
        sizeSprite = null;
    }
}

// Update the size indicator display - DISABLED (no size labels)
function updateSizeIndicator() {
    // Size indicator removed - function kept as no-op to prevent errors
    return;
}

// Update 3D size sprite - DISABLED (no size labels)
function update3DSizeSprite() {
    // Size sprite removed - function kept as no-op
    return;
}

// Update size sprite position in render loop - DISABLED
function updateSizeSpritePosition() {
    // Size sprite removed - function kept as no-op
    return;
}

// Reset to real plate size
function resetToRealSize() {
    if (!model || !realSizeConfig) return;
    
    modelScale = realSizeConfig.scale;
    model.scale.set(modelScale, modelScale, modelScale);
    currentRealSizeCm = realSizeConfig.realSizeCm;
    
    updateSizeIndicator();
    updatePositionText(`📏 Reset to real size: ${realSizeConfig.realSizeCm} cm`);
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
    }
}

// Toggle info panel visibility
function toggleHoloInfoPanel() {
    if (!isModelPlaced) return;
    
    if (isInfoPanelVisible) {
        hideHoloInfoPanel();
    } else {
        const modelFile = getModelFromURL();
        showHoloInfoPanel(modelFile);
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
}

function ensureHologramGroup() {
    if (!scene) return;
    if (!hologramGroup) {
        hologramGroup = new THREE.Group();
        hologramGroup.visible = false;
        scene.add(hologramGroup);
    }
}

function hideHologramGroup() {
    if (!hologramGroup) return;
    hologramGroup.visible = false;
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });
    if (currentLine) {
        lines.push(currentLine);
    }
    return lines;
}

function createNeonSprite(text, options = {}) {
    const fontSize = options.fontSize || 42;
    const padding = options.padding || 28;
    const maxWidth = options.maxWidth || 640;
    const color = options.color || '#00ffff';
    const gradientStart = options.gradientStart || 'rgba(0, 255, 255, 0.15)';
    const gradientEnd = options.gradientEnd || 'rgba(120, 0, 255, 0.15)';
    const font = options.font || `600 ${fontSize}px 'Orbitron', 'Segoe UI', sans-serif`;
    const lineHeight = options.lineHeight || Math.round(fontSize * 1.2);
    const borderRadius = options.borderRadius || 8;
    const pixelRatio = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = font;
    const lines = wrapText(ctx, text, maxWidth - padding * 2);
    const width = maxWidth;
    const height = lineHeight * lines.length + padding * 2;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
    ctx.font = font;
    ctx.clearRect(0, 0, width, height);

    // Draw rounded rectangle background with soft blur effect
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, borderRadius);
    ctx.closePath();
    
    // Darker, more opaque background for better readability
    ctx.fillStyle = 'rgba(5, 10, 25, 0.85)';
    ctx.fill();
    
    // Gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, gradientStart);
    gradient.addColorStop(1, gradientEnd);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Rounded border with glow
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text with glow effect
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    lines.forEach((line, index) => {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fillText(line, padding, padding + index * lineHeight);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false
    });
    const sprite = new THREE.Sprite(material);
    const scaleFactor = options.scale ?? 0.0011;
    sprite.scale.set(width * scaleFactor, height * scaleFactor, 1);
    return sprite;
}

function createHoloRing(inner = 0.28, outer = 0.33) {
    const geometry = new THREE.RingGeometry(inner, outer, 64);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.name = 'holoRing';
    ring.rotation.x = -Math.PI / 2;
    return ring;
}

function createBeam() {
    const geometry = new THREE.CylinderGeometry(0.015, 0.03, 0.5, 16, 1, true);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
    });
    const beam = new THREE.Mesh(geometry, material);
    beam.rotation.z = Math.PI / 2;
    beam.position.y = 0.12;
    return beam;
}

function updateHologramContent(dish) {
    if (!model || !scene) return;
    ensureHologramGroup();
    hologramGroup.visible = true;
    if (hologramGroup.children.length) {
        hologramGroup.children.forEach((child) => {
            if (child.material && child.material.map) {
                child.material.map.dispose();
            }
            if (child.material && child.material.dispose) {
                child.material.dispose();
            }
            if (child.geometry && child.geometry.dispose) {
                child.geometry.dispose();
            }
        });
        hologramGroup.clear();
    }
    hologramState.sprites = [];
    hologramState.ring = null;
    hologramState.beam = null;

    const ring = createHoloRing();
    hologramGroup.add(ring);
    hologramState.ring = ring;

    const beam = createBeam();
    hologramGroup.add(beam);
    hologramState.beam = beam;

    const modelHeight = getModelHeight();
    
    // Position labels to the LEFT of the model, stacked vertically with proper spacing
    // Each label gets enough space to not overlap
    const leftOffset = -0.22; // Position to left side
    const baseHeight = modelHeight * 0.3; // Start position
    const verticalSpacing = 0.08; // Space between each label

    // Add dish name with size info - top label
    const sizeInfo = realSizeConfig ? ` (${currentRealSizeCm}cm)` : '';
    const nameSprite = createNeonSprite(dish.name + sizeInfo, {
        fontSize: 26,
        lineHeight: 32,
        maxWidth: 260,
        color: '#00ffff',
        padding: 12,
        scale: 0.0008,
        borderRadius: 10,
        blurBackground: true
    });
    nameSprite.position.set(leftOffset, baseHeight, 0.1);
    hologramGroup.add(nameSprite);
    hologramState.sprites.push(nameSprite);

    const detailSpriteOptions = {
        fontSize: 16,
        lineHeight: 20,
        maxWidth: 220,
        padding: 8,
        scale: 0.00065,
        borderRadius: 6,
        blurBackground: true
    };

    // Ingredients - below name with proper spacing
    const ingredientsSprite = createNeonSprite(`ING: ${dish.ingredients}`, {
        ...detailSpriteOptions,
        color: '#80ffea'
    });
    ingredientsSprite.position.set(leftOffset, baseHeight - verticalSpacing, 0.1);
    hologramGroup.add(ingredientsSprite);
    hologramState.sprites.push(ingredientsSprite);

    // Nutrients - below ingredients with proper spacing
    const nutrientsSprite = createNeonSprite(`NUTR: ${dish.nutrients}`, {
        ...detailSpriteOptions,
        color: '#9d86ff'
    });
    nutrientsSprite.position.set(leftOffset, baseHeight - verticalSpacing * 2, 0.1);
    hologramGroup.add(nutrientsSprite);
    hologramState.sprites.push(nutrientsSprite);

    hologramPulse = 0;
    updateHologramFollow(true);
}


function getModelHeight() {
    if (!model) return 0.5;
    tempBox.setFromObject(model);
    const height = tempBox.max.y - tempBox.min.y;
    return Math.max(height || 0.5, 0.25);
}

function updateHologramFollow(force = false) {
    if (!hologramGroup || !model || !camera || !isModelPlaced) return;
    const modelHeight = getModelHeight();
    tempVector.copy(model.position);
    // Position hologram at model center height (labels positioned relative to this)
    tempVector.y += modelHeight * 0.5;
    if (force) {
        hologramGroup.position.copy(tempVector);
    } else {
        hologramGroup.position.lerp(tempVector, 0.25);
    }
    hologramGroup.lookAt(camera.position);
    hologramPulse += 0.02;
    if (hologramState.ring) {
        const scale = 1 + Math.sin(hologramPulse) * 0.08;
        hologramState.ring.scale.set(scale, scale, scale);
        hologramState.ring.material.opacity = 0.25 + (Math.sin(hologramPulse * 2) + 1) * 0.15;
    }
    if (hologramState.beam) {
        hologramState.beam.material.opacity = 0.25 + (Math.sin(hologramPulse * 3) + 1) * 0.1;
    }
}

// Initialize the application
function init() {
    const modelFile = getModelFromURL();
    
    if (!modelFile) {
        alert('No model specified! Redirecting to menu...');
        window.location.href = '../index.html';
        return;
    }

    // Update title
    const config = modelConfigs[modelFile];
    if (config) {
        document.title = `${config.name} - AR Viewer`;
    }

    // Setup event listeners
    setupEventListeners(modelFile);
    
    // Show start button and wait for user interaction
    showStartButton(modelFile);
}

function setupEventListeners(modelFile) {
    const exitArBtn = document.getElementById('exitArBtn');
    const canvas = document.getElementById('arCanvas');

    // Exit AR
    exitArBtn.addEventListener('click', () => {
        exitAR();
    });

    // Control buttons
    document.getElementById('resetBtn').addEventListener('click', resetModel);
    document.getElementById('scaleUpBtn').addEventListener('click', () => scaleModel(1.2));
    document.getElementById('scaleDownBtn').addEventListener('click', () => scaleModel(0.8));
    document.getElementById('rotateBtn').addEventListener('click', toggleRotation);
    // Info button removed - reset button handles info display

    // Touch/Mouse interactions on canvas (works in both modes)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    
    // Also add touch listeners to body for WebXR DOM overlay mode
    document.body.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.body.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.body.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Click event for desktop and as fallback for mobile
    canvas.addEventListener('click', handleCanvasClick);
    
    // Mouse support for desktop
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleMouseWheel, { passive: false });
    
    // Prevent default context menu on long press
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Show start button (WebXR requires user activation)
function showStartButton(modelFile) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const startArButton = document.getElementById('startArButton');
    const startArBtn = document.getElementById('startArBtn');
    
    loadingIndicator.classList.add('hidden');
    startArButton.classList.remove('hidden');
    startArButton.style.display = ''; // Reset display
    showStatusMessage('Tap "Start AR Experience" to begin.', { sticky: true });
    
    startArBtn.onclick = () => {
        startArFlow(modelFile);
    };
}

async function startArFlow(modelFile) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const startArButton = document.getElementById('startArButton');

    if (startArButton) {
        startArButton.classList.add('hidden');
        startArButton.style.display = 'none';
    }
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }
    showStatusMessage('Initializing sensors...', { sticky: true });

    let webXRError = null;

    if (await isWebXRSupported()) {
        try {
            await startWebXRSession(modelFile);
            showStatusMessage('Move your device to find a surface.', { sticky: true });
            return;
        } catch (error) {
            webXRError = error;
            console.warn('[AR] WebXR failed, falling back to camera mode.', error);
            showStatusMessage('WebXR failed. Falling back to camera mode...', { duration: 3500 });
        }
    } else {
        console.info('[AR] WebXR not supported. Using camera fallback.');
        showStatusMessage('Device lacks WebXR. Using camera overlay.', { duration: 3500 });
    }

    try {
        await startARExperience(modelFile);
        showStatusMessage('Point your camera at a flat surface and tap to place.', { sticky: true });
    } catch (cameraError) {
        console.error('[AR] Camera fallback failed:', cameraError);
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
        if (startArButton) {
            startArButton.classList.remove('hidden');
            startArButton.style.display = '';
        }
        const prefix = webXRError ? 'WebXR failed and camera fallback also failed.\n\n' : '';
        const message = cameraError?.message || 'Unable to start AR experience.';
        alert(prefix + message);
        hideStatusMessage();
        showStatusMessage('Unable to start AR. Please adjust permissions and retry.', { duration: 6000 });
    }
}

async function isWebXRSupported() {
    if (!navigator.xr) {
        return false;
    }

    try {
        return await navigator.xr.isSessionSupported('immersive-ar');
    } catch (error) {
        console.warn('[AR] Failed to query WebXR support:', error);
        return false;
    }
}

// Start WebXR AR session
async function startWebXRSession(modelFile) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const startArButton = document.getElementById('startArButton');
    const canvas = document.getElementById('arCanvas');
    const arControls = document.getElementById('arControls');

    try {
        loadingIndicator.classList.remove('hidden');
        
        // Make sure start button is completely hidden
        if (startArButton) {
            startArButton.classList.add('hidden');
            startArButton.style.display = 'none';
        }

        // Get DOM overlay root element for showing UI in WebXR
        const domOverlayRoot = document.body;

        // Request AR session with DOM overlay for UI visibility
        const sessionOptions = {
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay'],
            domOverlay: { root: domOverlayRoot }
        };

        xrSession = await navigator.xr.requestSession('immersive-ar', sessionOptions);

        // Check if DOM overlay is supported
        domOverlayEnabled = Boolean(xrSession.domOverlayState && xrSession.domOverlayState.type);
        console.log('[WebXR] DOM Overlay supported:', domOverlayEnabled);

    // Initialize Three.js for WebXR
    await initThreeJSWebXR(modelFile);

    // Setup session - try the most compatible reference spaces
    const { space: refSpace, type: refType } = await resolveReferenceSpace(['local-floor', 'local', 'bounded-floor']);
    xrRefSpace = refSpace;
    renderer.xr.setReferenceSpaceType(refType);
    await renderer.xr.setSession(xrSession);

    // Request hit test source using viewer or local space
    const { space: hitSpace, type: hitType } = await resolveReferenceSpace(['viewer', 'local']);
    hitTestSource = await xrSession.requestHitTestSource({ space: hitSpace });
    

        // Handle session end
        xrSession.addEventListener('end', () => {
            xrSession = null;
            hitTestSource = null;
            domOverlayEnabled = false;
            window.location.href = '../index.html';
        });

        // Setup WebXR input sources for pinch gestures
        xrSession.addEventListener('selectstart', handleXRSelectStart);
        xrSession.addEventListener('selectend', handleXRSelectEnd);

        // Hide elements that shouldn't show in WebXR
        const holoInfoPanel = document.getElementById('holoInfoPanel');
        if (holoInfoPanel) {
            holoInfoPanel.classList.add('hidden');
            holoInfoPanel.classList.remove('visible');
        }
        
        const sizeIndicator = document.getElementById('sizeIndicator');
        if (sizeIndicator) {
            sizeIndicator.classList.add('hidden');
            sizeIndicator.classList.remove('visible');
        }

        if (!domOverlayEnabled) {
            showStatusMessage('Controller tap to place. Screen gestures limited (DOM overlay unavailable).', { duration: 6000 });
        }

        // Show canvas and controls
        canvas.style.display = 'block';
        arControls.classList.remove('hidden');
        loadingIndicator.classList.add('hidden');

        useWebXR = true;
        isArActive = true;

        // Start render loop
        renderer.setAnimationLoop(renderWebXR);

    } catch (error) {
        console.error('[WebXR] Session error:', error);
        loadingIndicator.classList.add('hidden');
        throw new Error('Failed to start WebXR session: ' + error.message);
    }
}

// WebXR select handlers for scaling
let xrSelectStartTime = 0;

function handleXRSelectStart(event) {
    xrSelectStartTime = Date.now();
    
    // If model not placed yet, place it on select
    if (!isModelPlaced && model && reticle && reticle.visible) {
        // Get reticle position
        const position = new THREE.Vector3();
        reticle.matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());
        
        model.position.copy(position);
        model.visible = true;
        reticle.visible = false;
        isModelPlaced = true;
        
        // Initialize real size config
        const modelFile = getModelFromURL();
        realSizeConfig = modelConfigs[modelFile] || null;
        
        if (navigator.vibrate) {
            navigator.vibrate([50, 100, 50]);
        }
        
        // Show size indicator after placement
        setTimeout(() => {
            showHoloInfoPanel(modelFile);
            updateSizeIndicator();
        }, 500);
    }
}

function handleXRSelectEnd(event) {
    const selectDuration = Date.now() - xrSelectStartTime;
    
    // Quick tap while model is placed - toggle info
    if (isModelPlaced && selectDuration < 300) {
        toggleHoloInfoPanel();
    }
}

// Helper to request the first available reference space from a prioritized list
async function resolveReferenceSpace(preferredTypes) {
    for (const type of preferredTypes) {
        try {
            const space = await xrSession.requestReferenceSpace(type);
            return { space, type };
        } catch (err) {
            console.warn(`[WebXR] Reference space ${type} not supported:`, err.message);
        }
    }
    throw new Error('No compatible reference space found');
}

// Initialize Three.js for WebXR
async function initThreeJSWebXR(modelFile) {
    const canvas = document.getElementById('arCanvas');

    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    // Create renderer with XR enabled
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    if (renderer.outputEncoding !== undefined) {
        renderer.outputEncoding = THREE.sRGBEncoding;
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Create reticle for plane detection
    const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.7 });
    reticle = new THREE.Mesh(geometry, material);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    // Load model
    await loadModel(modelFile);
}

// WebXR render loop
function renderWebXR(timestamp, frame) {
    if (!frame || !xrSession) return;

    const pose = frame.getViewerPose(xrRefSpace);
    if (!pose) return;

    // Hit test for plane detection
    if (hitTestSource && !isModelPlaced) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);

        if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const hitPose = hit.getPose(xrRefSpace);

            if (hitPose) {
                // Show reticle
                reticle.visible = true;
                reticle.matrix.fromArray(hitPose.transform.matrix);
                if (!lastSurfaceDetected) {
                    updatePositionText('Surface detected. Hold steady to place.', { duration: 2500 });
                }
                lastSurfaceDetected = true;

                if (consecutiveHitFrames === 0) {
                    updatePositionText('Surface detected. Hold steady for placement.');
                }

                consecutiveHitFrames = Math.min(consecutiveHitFrames + 1, HIT_STABILITY_THRESHOLD);

                if (consecutiveHitFrames >= HIT_STABILITY_THRESHOLD && model && model.visible === false) {
                    placeModelWebXR(hitPose);
                    consecutiveHitFrames = 0;
                }
            } else {
                reticle.visible = false;
                consecutiveHitFrames = 0;
                if (lastSurfaceDetected) {
                    updatePositionText('Tracking lost. Move device slowly to re-acquire surface.', { duration: 2500 });
                }
                lastSurfaceDetected = false;
            }
        } else {
            reticle.visible = false;
            consecutiveHitFrames = 0;
            if (lastSurfaceDetected) {
                updatePositionText('Tracking lost. Move device slowly to re-acquire surface.', { duration: 2500 });
            }
            lastSurfaceDetected = false;
        }
    }

    // Auto-rotate if enabled
    if (model && isModelPlaced && autoRotate) {
        model.rotation.y += 0.01;
    }

    updateHologramFollow();
    updateSizeSpritePosition();
    renderer.render(scene, camera);
}

// Place model at detected surface
function placeModelWebXR(hitPose) {
    if (!model || isModelPlaced) return;

    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    
    const matrix = new THREE.Matrix4().fromArray(hitPose.transform.matrix);
    matrix.decompose(position, rotation, scale);

    model.position.copy(position);
    model.quaternion.copy(rotation);
    model.visible = true;

    reticle.visible = false;
    isModelPlaced = true;

    // Get real size config
    const modelFile = getModelFromURL();
    const config = modelConfigs[modelFile];
    realSizeConfig = config || null;

    updatePositionText(`✓ Placed! Pinch to resize (${config?.realSizeCm || 25} cm)`);

    if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
    }

    // Show info panel and size indicator after a short delay for better UX
    setTimeout(() => {
        showHoloInfoPanel(modelFile);
        updateSizeIndicator();
    }, 800);
}

function moveModelToReticle() {
    if (!model || !reticle || !reticle.visible) return false;
    reticle.matrix.decompose(tempVector, tempQuaternion, tempScale);
    model.position.copy(tempVector);
    model.quaternion.copy(tempQuaternion);
    model.visible = true;
    isModelPlaced = true;
    updatePositionText('✅ Model moved to detected surface.');
    return true;
}

// Start AR Experience with camera feed
async function startARExperience(modelFile) {
    const video = document.getElementById('video');
    const arControls = document.getElementById('arControls');
    const canvas = document.getElementById('arCanvas');
    const loadingIndicator = document.getElementById('loadingIndicator');

    try {
        // Show loading
        loadingIndicator.classList.remove('hidden');

        // Check if page is served securely
        const isSecureContext = window.isSecureContext;
        const protocol = window.location.protocol;
        
        // Check for HTTPS or localhost requirement
        if (!isSecureContext && protocol !== 'https:' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
            throw new Error('AR requires HTTPS or localhost. Please run a local server (e.g., python3 -m http.server 8000) and access via http://localhost:8000');
        }

        // Check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera API not available. Please use HTTPS or run on localhost.');
        }

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment', // Use rear camera
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        video.srcObject = stream;
        video.style.display = 'block';
        
        // Wait for video to be ready
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });
        
        // Initialize Three.js scene
        await initThreeJS(modelFile, video);
        
        // Show canvas and controls
        canvas.style.display = 'block';
        arControls.classList.remove('hidden');
        
        // Hide loading
        loadingIndicator.classList.add('hidden');
        
        isArActive = true;
        
        // Start rendering
        animate();

    } catch (error) {
        loadingIndicator.classList.add('hidden');
        let errorMessage = 'Unable to start AR experience.\n\n';
        
        if (error.message.includes('HTTPS') || error.message.includes('localhost')) {
            errorMessage = '🔒 Security Error: AR features require HTTPS or localhost.\n\n'
                + 'Solution:\n'
                + '1. Open terminal in project folder\n'
                + '2. Run: python3 -m http.server 8000\n'
                + '3. Open: http://localhost:8000 in your browser\n'
                + '4. Navigate to AR page from there';
        } else if (error.name === 'NotAllowedError') {
            errorMessage += 'Camera access was denied. Please allow camera permissions in your browser settings.';
        } else if (error.name === 'NotFoundError') {
            errorMessage += 'No camera found on this device.';
        } else if (error.message.includes('GLTFLoader')) {
            errorMessage += 'Failed to load 3D model viewer. Please check your internet connection.';
        } else if (error.message.includes('Failed to load')) {
            errorMessage += 'Failed to load 3D model. Please check if the model file exists in dish_models/ folder.';
        } else {
            errorMessage += error.message;
        }

        console.error('[AR] Experience Error:', errorMessage, error);
        throw new Error(errorMessage);
    }
}

// Initialize Three.js scene
async function initThreeJS(modelFile, video) {
    const canvas = document.getElementById('arCanvas');
    
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Handle encoding for different Three.js versions
    if (renderer.outputEncoding !== undefined) {
        renderer.outputEncoding = THREE.sRGBEncoding;
    }
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);
    
    // Create surface detection indicator
    createSurfaceIndicator();
    
    // Load 3D model
    await loadModel(modelFile);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

// Create surface detection indicator
function createSurfaceIndicator() {
    // Create a circular ring to show where model will be placed
    const geometry = new THREE.RingGeometry(0.3, 0.35, 32);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
    });
    surfaceIndicator = new THREE.Mesh(geometry, material);
    surfaceIndicator.rotation.x = -Math.PI / 2; // Make it horizontal
    surfaceIndicator.position.set(0, CAMERA_GROUND_Y, -2); // Position closer and centered
    surfaceIndicator.visible = true;
    scene.add(surfaceIndicator);
    
    // Animate the indicator
    animateSurfaceIndicator();
}

// Animate surface indicator
function animateSurfaceIndicator() {
    if (!surfaceIndicator || isModelPlaced) return;
    
    const time = Date.now() * 0.001;
    surfaceIndicator.material.opacity = 0.5 + Math.sin(time * 3) * 0.3;
    surfaceIndicator.scale.set(
        1 + Math.sin(time * 2) * 0.1,
        1 + Math.sin(time * 2) * 0.1,
        1
    );
}

// Load 3D model
function loadModel(modelFile) {
    return new Promise((resolve, reject) => {
        // Check which GLTFLoader is available
        let LoaderClass;
        if (typeof THREE.GLTFLoader !== 'undefined') {
            LoaderClass = THREE.GLTFLoader;
        } else if (typeof GLTFLoader !== 'undefined') {
            LoaderClass = GLTFLoader;
        } else {
            const errorMsg = 'GLTFLoader not found! Please check your internet connection.';
            console.error('[AR]', errorMsg);
            alert(errorMsg);
            reject(new Error(errorMsg));
            return;
        }
        
        const loader = new LoaderClass();
        const modelPath = `dish_models/${modelFile}`;
        
        loader.load(
            modelPath,
            (gltf) => {
                model = gltf.scene;
                
                // Get model config for initial scale and real size
                const config = modelConfigs[modelFile];
                const initialScale = config ? config.scale : 0.5;
                
                // Initialize real size config
                realSizeConfig = config || null;
                currentRealSizeCm = config ? config.realSizeCm : 25;
                
                model.scale.set(initialScale, initialScale, initialScale);
                
                // Center the model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.set(-center.x, -center.y, -center.z);
                
                // Store base model size for reference
                const size = box.getSize(new THREE.Vector3());
                baseModelSize = Math.max(size.x, size.y, size.z);
                
                // Initially hide the model
                model.visible = false;
                
                scene.add(model);
                modelScale = initialScale;
                
                resolve();
            },
            (xhr) => {
                // Progress callback
                if (xhr.lengthComputable) {
                    const percentComplete = (xhr.loaded / xhr.total) * 100;
                    updatePositionText(`Loading model ${percentComplete.toFixed(0)}%`);
                }
            },
            (error) => {
                console.error('[AR] Error loading model:', error);
                console.error('[AR] Attempted path:', modelPath);
                alert('Failed to load 3D model. Please check if the model file exists.');
                reject(error);
            }
        );
    });
}

// Animation loop
function animate() {
    if (!isArActive) return;
    
    requestAnimationFrame(animate);
    
    // Animate surface indicator
    if (!isModelPlaced) {
        animateSurfaceIndicator();
    }
    
    // Auto-rotate model
    if (model && autoRotate && isModelPlaced) {
        model.rotation.y += 0.01;
    }
    
    updateHologramFollow();
    renderer.render(scene, camera);
}

// Handle touch start
function handleTouchStart(e) {
    // Skip if touching control buttons
    if (isUiInteractionTarget(e.target)) {
        return;
    }
    if (useWebXR && !domOverlayEnabled) {
        return;
    }
    
    lastTouchTime = Date.now();
    
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isDragging = false;
        isTwoFingerGesture = false;
    } else if (e.touches.length === 2) {
        // Two-finger gesture (pinch to scale, rotate)
        isDragging = false;
        isTwoFingerGesture = true;
        
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate initial rotation angle
        initialRotationAngle = Math.atan2(dy, dx);
    }
    
    // Only prevent default on canvas touches
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
}

// Handle touch move
function handleTouchMove(e) {
    // Skip if touching control buttons
    if (isUiInteractionTarget(e.target)) {
        return;
    }
    if (useWebXR && !domOverlayEnabled) {
        return;
    }
    
    if (e.touches.length === 1 && !isTwoFingerGesture) {
        if (useWebXR) {
            updatePositionText('Tap once to move dish to highlighted surface.', { duration: 2000 });
            return;
        }
        // Single finger drag - hold and drag to reposition model
        const moveThreshold = 5; // Lower threshold for more responsive dragging
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > moveThreshold) {
            isDragging = true;
        }
        
        if (model && isModelPlaced && isDragging) {
            const moveSensitivity = 0.008;
            const dx = (e.touches[0].clientX - touchStartX) * moveSensitivity;
            const dy = (e.touches[0].clientY - touchStartY) * moveSensitivity;
            model.position.x += dx;
            model.position.z += dy;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            updatePositionText();
        }
    } else if (e.touches.length === 2) {
        // Two-finger gesture (works in both WebXR and camera mode)
        isDragging = false;
        isTwoFingerGesture = true;
        
        if (model && isModelPlaced) {
            
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Pinch to scale - no limits for full flexibility
            if (initialPinchDistance > 0) {
                const scaleFactor = distance / initialPinchDistance;
                const newScale = modelScale * scaleFactor;
                
                // Very wide limits for flexibility (essentially unlimited)
                const minScale = 0.01;
                const maxScale = 20.0;
                
                // Apply scale within wide limits
                if (newScale >= minScale && newScale <= maxScale) {
                    modelScale = newScale;
                    model.scale.set(modelScale, modelScale, modelScale);
                    
                    // Update size indicator with real size
                    updateSizeIndicator();
                    
                    // Show size feedback
                    if (realSizeConfig) {
                        const scaleRatio = modelScale / realSizeConfig.scale;
                        const displaySize = Math.round(realSizeConfig.realSizeCm * scaleRatio);
                        updatePositionText(`📏 Size: ${displaySize} cm`);
                    } else {
                        updatePositionText(`Scale: ${(modelScale * 100).toFixed(0)}%`);
                    }
                }
            }
            
            // Rotate with two fingers
            if (initialRotationAngle !== undefined) {
                const rotationDelta = angle - initialRotationAngle;
                model.rotation.y += rotationDelta;
                initialRotationAngle = angle;
            }
            
            initialPinchDistance = distance;
        }
    }
    
    // Prevent default on multi-touch gestures
    if (e.touches.length >= 2) {
        e.preventDefault();
    }
}

// Handle touch end
function handleTouchEnd(e) {
    // Skip if touching control buttons
    if (isUiInteractionTarget(e.target)) {
        return;
    }
    if (useWebXR && !domOverlayEnabled) {
        return;
    }
    
    // Reset gesture tracking
    if (e.touches.length < 2) {
        initialPinchDistance = 0;
        initialRotationAngle = undefined;
    }
    
    if (e.touches.length === 0) {
        isTwoFingerGesture = false;
    }
    
    // If not dragging and quick tap, it's a placement tap
    const touchDuration = Date.now() - lastTouchTime;
    const wasTap = !isDragging && !isTwoFingerGesture && touchDuration < 300 && e.touches.length === 0;
    
    if (wasTap && !isModelPlaced && !useWebXR) {
        // Trigger placement via click event (camera mode only)
        handleCanvasClick(e);
    } else if (wasTap && useWebXR) {
        if (moveModelToReticle()) {
            updatePositionText('✅ Model moved to detected surface.');
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        } else {
            updatePositionText('Move device slowly to highlight a surface, then tap again.', { duration: 2500 });
        }
    }
    
    // Small delay before resetting drag flag to prevent click event from firing
    setTimeout(() => {
        isDragging = false;
    }, 100);
}

// Handle canvas click/tap to place model
function handleCanvasClick(e) {
    // Skip if using WebXR (auto-placement handles it)
    if (useWebXR) return;
    
    // Check if this was preceded by dragging
    if (isDragging) {
        return;
    }
    
    // Check if model exists
    if (!model) {
        return;
    }
    
    const placementPoint = projectScreenPointToGround(e.clientX, e.clientY);
    if (!placementPoint) {
        updatePositionText('Aim toward a flat surface and try again.', { duration: 2500 });
        return;
    }
    placementPoint.y = CAMERA_GROUND_Y;
    updateSurfaceIndicatorPosition(placementPoint);
    const hoverOffset = 0.15;
    if (!isModelPlaced) {
        model.position.copy(placementPoint);
        model.position.y += hoverOffset;
        model.visible = true;
        if (surfaceIndicator) {
            surfaceIndicator.visible = false;
        }
        isModelPlaced = true;
        const modelFile = getModelFromURL();
        const config = modelConfigs[modelFile];
        realSizeConfig = config || null;
        updatePositionText(`Model placed! Real size: ${config?.realSizeCm || 25} cm`);
        const startScale = modelScale * 0.1;
        const targetScale = modelScale;
        let progress = 0;
        model.scale.set(startScale, startScale, startScale);
        const placeAnimation = setInterval(() => {
            progress += 0.05;
            const currentScale = startScale + (targetScale - startScale) * Math.sin(progress * Math.PI / 2);
            model.scale.set(currentScale, currentScale, currentScale);
            if (progress >= 1) {
                model.scale.set(targetScale, targetScale, targetScale);
                clearInterval(placeAnimation);
                showHoloInfoPanel(modelFile);
                updateSizeIndicator();
            }
        }, 16);
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    } else {
        model.position.copy(placementPoint);
        model.position.y += hoverOffset;
        updatePositionText('Model moved.', { duration: 1500 });
    }
    if (surfaceIndicator) {
        surfaceIndicator.visible = false;
    }
}

// Scale model - no limits for full flexibility
function scaleModel(factor) {
    if (!model || !isModelPlaced) return;
    
    const newScale = modelScale * factor;
    
    // Very wide limits for flexibility (essentially unlimited)
    const minScale = 0.01;
    const maxScale = 20.0;
    
    // Clamp scale within wide limits
    modelScale = Math.max(minScale, Math.min(maxScale, newScale));
    
    model.scale.set(modelScale, modelScale, modelScale);
    
    // Update size indicator
    updateSizeIndicator();
    
    // Show size feedback
    if (realSizeConfig) {
        const scaleRatio = modelScale / realSizeConfig.scale;
        const displaySize = Math.round(realSizeConfig.realSizeCm * scaleRatio);
        updatePositionText(`📏 Size: ${displaySize} cm`);
    } else {
        updatePositionText(`Scale: ${(modelScale * 100).toFixed(0)}%`);
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
}

// Reset model position and scale
function resetModel() {
    if (!model) return;
    
    const modelFile = getModelFromURL();
    const config = modelConfigs[modelFile];
    const initialScale = config ? config.scale : 0.5;
    
    modelScale = initialScale;
    realSizeConfig = config || null;
    
    model.scale.set(modelScale, modelScale, modelScale);
    if (!useWebXR && surfaceIndicator) {
        model.position.copy(surfaceIndicator.position);
        model.position.y += 0.2;
    } else if (useWebXR && reticle && reticle.visible) {
        reticle.matrix.decompose(tempVector, tempQuaternion, tempScale);
        model.position.copy(tempVector);
    }
    model.rotation.set(0, 0, 0);
    
    if (isModelPlaced) {
        updateSizeIndicator();
        updatePositionText(`📏 Reset to real size: ${config?.realSizeCm || 25} cm`);
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([30, 50, 30]);
        }
    } else {
        model.visible = false;
        if (surfaceIndicator) {
            surfaceIndicator.visible = true;
        }
        updatePositionText('Tap screen to place model');
        
        // Hide info panel and size indicator when model is reset to not placed
        hideHoloInfoPanel();
        const sizeIndicator = document.getElementById('sizeIndicator');
        if (sizeIndicator) {
            sizeIndicator.classList.add('hidden');
            sizeIndicator.classList.remove('visible');
        }
    }
}

// Toggle auto-rotation
function toggleRotation() {
    if (!isModelPlaced) return;
    
    autoRotate = !autoRotate;
    const btn = document.getElementById('rotateBtn');
    btn.style.background = autoRotate ? 'rgba(255, 255, 255, 0.95)' : 'rgba(102, 126, 234, 0.95)';
    btn.style.color = autoRotate ? '#000' : '#fff';
    
    updatePositionText(autoRotate ? 'Auto-rotation ON' : 'Auto-rotation OFF');
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
}

// Update position text via status overlay
function updatePositionText(text, options) {
    if (text === undefined || text === null || text === '') {
        hideStatusMessage();
        return;
    }
    showStatusMessage(text, options);
}

// Mouse support for desktop testing
function handleMouseDown(e) {
    isMouseDown = true;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    isDragging = false;
}

function handleMouseMove(e) {
    if (!isMouseDown || !model || !isModelPlaced || useWebXR) return;
    
    const moveThreshold = 5;
    const deltaX = e.clientX - mouseStartX;
    const deltaY = e.clientY - mouseStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > moveThreshold) {
        isDragging = true;
    }
    
    if (isDragging) {
        const moveSensitivity = 0.005;
        const dx = (e.clientX - mouseStartX) * moveSensitivity;
        const dy = -(e.clientY - mouseStartY) * moveSensitivity;
        
        model.position.x += dx;
        model.position.y += dy;
        
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
        
        updatePositionText();
    }
}

function handleMouseUp(e) {
    isMouseDown = false;
    setTimeout(() => {
        isDragging = false;
    }, 50);
}

function handleMouseWheel(e) {
    if (!model || !isModelPlaced) return;
    
    e.preventDefault();
    
    const scaleFactor = e.deltaY > 0 ? 0.95 : 1.05;
    const newScale = modelScale * scaleFactor;
    
    // Calculate limits based on real dish config
    let minScale = 0.05;
    let maxScale = 5.0;
    
    if (realSizeConfig) {
        minScale = realSizeConfig.scale * (realSizeConfig.minSizeCm / realSizeConfig.realSizeCm);
        maxScale = realSizeConfig.scale * (realSizeConfig.maxSizeCm / realSizeConfig.realSizeCm);
    }
    
    if (newScale >= minScale && newScale <= maxScale) {
        modelScale = newScale;
        model.scale.set(modelScale, modelScale, modelScale);
        
        // Update size indicator
        updateSizeIndicator();
        
        // Show size feedback
        if (realSizeConfig) {
            const scaleRatio = modelScale / realSizeConfig.scale;
            const displaySize = Math.round(realSizeConfig.realSizeCm * scaleRatio);
            updatePositionText(`📏 Size: ${displaySize} cm`);
        } else {
            updatePositionText(`Scale: ${(modelScale * 100).toFixed(0)}%`);
        }
    }
}

// Handle window resize
function onWindowResize() {
    if (!camera || !renderer) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Exit AR and cleanup
function exitAR() {
    isArActive = false;
    domOverlayEnabled = false;
    lastSurfaceDetected = false;
    
    // End WebXR session if active
    if (xrSession) {
        xrSession.end();
        xrSession = null;
    }
    
    // Stop camera
    const video = document.getElementById('video');
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    // Cleanup Three.js
    if (renderer) {
        renderer.setAnimationLoop(null);
        renderer.dispose();
    }
    if (scene) {
        scene.clear();
    }
    hologramGroup = null;
    sizeSprite = null;
    hideStatusMessage();
    
    // Go back to frontend menu
    window.location.href = '../index.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
