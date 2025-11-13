// Three.js scene components
let scene, camera, renderer, model;
let isArActive = false;
let isModelPlaced = false;
let autoRotate = true;
let surfaceIndicator;

// Touch interaction variables
let touchStartX = 0;
let touchStartY = 0;
let initialPinchDistance = 0;
let modelScale = 1;
let isDragging = false;
let lastTouchTime = 0;

// Mouse interaction variables
let isMouseDown = false;
let mouseStartX = 0;
let mouseStartY = 0;

// Model configurations
const modelConfigs = {
    'pizza.glb': { name: 'Pizza 🍕', scale: 0.5 },
    'samosa.glb': { name: 'Samosa 🥟', scale: 0.3 },
    'monster_energy_drink.glb': { name: 'Monster Energy Drink 🥤', scale: 0.4 }
};

// Get model from URL parameter
function getModelFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('model');
}

// Initialize the application
function init() {
    const modelFile = getModelFromURL();
    
    if (!modelFile) {
        alert('No model specified!');
        window.location.href = 'index.html';
        return;
    }

    // Update title
    const config = modelConfigs[modelFile];
    if (config) {
        document.getElementById('modelTitle').textContent = config.name;
        document.title = `${config.name} - Custom AR`;
    }

    // Setup event listeners
    setupEventListeners(modelFile);
}

function setupEventListeners(modelFile) {
    const openCameraBtn = document.getElementById('openCamera');
    const exitArBtn = document.getElementById('exitArBtn');
    const canvas = document.getElementById('arCanvas');

    // Camera integration using your provided code
    openCameraBtn.addEventListener('click', async () => {
        await startARExperience(modelFile);
    });

    // Exit AR
    exitArBtn.addEventListener('click', () => {
        exitAR();
    });

    // Control buttons
    document.getElementById('resetBtn').addEventListener('click', resetModel);
    document.getElementById('scaleUpBtn').addEventListener('click', () => scaleModel(1.2));
    document.getElementById('scaleDownBtn').addEventListener('click', () => scaleModel(0.8));
    document.getElementById('rotateBtn').addEventListener('click', toggleRotation);

    // Touch/Mouse interactions on canvas
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('click', handleCanvasClick);
    
    // Mouse support for desktop
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleMouseWheel, { passive: false });
}

// Start AR Experience with camera feed
async function startARExperience(modelFile) {
    const button = document.getElementById('openCamera');
    const video = document.getElementById('video');
    const startScreen = document.getElementById('startScreen');
    const arControls = document.getElementById('arControls');
    const canvas = document.getElementById('arCanvas');
    const loadingIndicator = document.getElementById('loadingIndicator');

    try {
        // Show loading
        loadingIndicator.classList.remove('hidden');

        // Request camera access using your provided code
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

        // Hide start screen
        startScreen.style.display = 'none';
        
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
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please ensure camera permissions are granted.');
        loadingIndicator.classList.add('hidden');
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
    renderer.outputEncoding = THREE.sRGBEncoding;
    
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
    surfaceIndicator.position.set(0, -1, -3); // Position in front of camera
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
        const loader = new THREE.GLTFLoader();
        const modelPath = `dish_models/${modelFile}`;
        
        loader.load(
            modelPath,
            (gltf) => {
                model = gltf.scene;
                
                // Get model config for initial scale
                const config = modelConfigs[modelFile];
                const initialScale = config ? config.scale : 0.5;
                
                model.scale.set(initialScale, initialScale, initialScale);
                
                // Center the model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.set(-center.x, -center.y, -center.z);
                
                // Initially hide the model
                model.visible = false;
                
                scene.add(model);
                modelScale = initialScale;
                
                console.log('Model loaded successfully');
                resolve();
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading model:', error);
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
    
    renderer.render(scene, camera);
}

// Handle touch start
function handleTouchStart(e) {
    lastTouchTime = Date.now();
    
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isDragging = false;
    } else if (e.touches.length === 2) {
        // Pinch gesture
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
    }
    e.preventDefault();
}

// Handle touch move
function handleTouchMove(e) {
    if (e.touches.length === 1) {
        // Check if user is dragging (moved enough distance)
        const moveThreshold = 10;
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > moveThreshold) {
            isDragging = true;
        }
        
        if (model && isModelPlaced && isDragging) {
            // Drag to move - improved sensitivity
            const moveSensitivity = 0.005;
            const dx = (e.touches[0].clientX - touchStartX) * moveSensitivity;
            const dy = -(e.touches[0].clientY - touchStartY) * moveSensitivity;
            
            model.position.x += dx;
            model.position.y += dy;
            
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            
            updatePositionText();
        }
    } else if (e.touches.length === 2) {
        isDragging = false;
        
        if (model && isModelPlaced) {
            // Pinch to scale - improved
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (initialPinchDistance > 0) {
                const scaleFactor = distance / initialPinchDistance;
                const newScale = modelScale * scaleFactor;
                
                // Limit scale range
                if (newScale > 0.05 && newScale < 5.0) {
                    modelScale = newScale;
                    model.scale.set(modelScale, modelScale, modelScale);
                    updatePositionText(`Scale: ${(modelScale * 100).toFixed(0)}%`);
                }
            }
            
            initialPinchDistance = distance;
        }
    }
    
    e.preventDefault();
}

// Handle touch end
function handleTouchEnd(e) {
    // Reset pinch distance
    if (e.touches.length < 2) {
        initialPinchDistance = 0;
    }
    
    // If not dragging and quick tap, it's a placement tap
    const touchDuration = Date.now() - lastTouchTime;
    if (!isDragging && touchDuration < 300 && e.touches.length === 0) {
        // This was a tap, not a drag
    }
    
    isDragging = false;
    e.preventDefault();
}

// Handle canvas click to place model
function handleCanvasClick(e) {
    if (!model || isDragging) return;
    
    if (!isModelPlaced) {
        // Place model at the surface indicator position
        model.position.copy(surfaceIndicator.position);
        model.position.y += 0.2; // Slightly above surface
        model.visible = true;
        
        // Hide surface indicator
        surfaceIndicator.visible = false;
        
        isModelPlaced = true;
        updatePositionText('Model placed! Use gestures to interact');
        
        // Add entrance animation
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
            }
        }, 16);
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
}

// Scale model
function scaleModel(factor) {
    if (!model || !isModelPlaced) return;
    
    modelScale *= factor;
    
    // Clamp scale
    modelScale = Math.max(0.05, Math.min(5.0, modelScale));
    
    model.scale.set(modelScale, modelScale, modelScale);
    updatePositionText(`Scale: ${(modelScale * 100).toFixed(0)}%`);
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
}

// Reset model position and scale
function resetModel() {
    if (!model) return;
    
    const config = modelConfigs[getModelFromURL()];
    const initialScale = config ? config.scale : 0.5;
    
    modelScale = initialScale;
    model.scale.set(modelScale, modelScale, modelScale);
    model.position.copy(surfaceIndicator.position);
    model.position.y += 0.2;
    model.rotation.set(0, 0, 0);
    
    if (isModelPlaced) {
        updatePositionText('Position reset');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([30, 50, 30]);
        }
    } else {
        model.visible = false;
        surfaceIndicator.visible = true;
        updatePositionText('Tap screen to place model');
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

// Update position text
function updatePositionText(text) {
    const positionText = document.getElementById('positionText');
    if (text) {
        positionText.textContent = text;
        // Auto-clear after 3 seconds
        setTimeout(() => {
            if (isModelPlaced && model) {
                positionText.textContent = `X: ${model.position.x.toFixed(2)} Y: ${model.position.y.toFixed(2)}`;
            }
        }, 3000);
    } else if (model) {
        positionText.textContent = `X: ${model.position.x.toFixed(2)} Y: ${model.position.y.toFixed(2)}`;
    }
}

// Mouse support for desktop testing
function handleMouseDown(e) {
    isMouseDown = true;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    isDragging = false;
}

function handleMouseMove(e) {
    if (!isMouseDown || !model || !isModelPlaced) return;
    
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
    
    if (newScale > 0.05 && newScale < 5.0) {
        modelScale = newScale;
        model.scale.set(modelScale, modelScale, modelScale);
        updatePositionText(`Scale: ${(modelScale * 100).toFixed(0)}%`);
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
    
    // Stop camera
    const video = document.getElementById('video');
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    // Cleanup Three.js
    if (renderer) {
        renderer.dispose();
    }
    if (scene) {
        scene.clear();
    }
    
    // Go back to main page
    window.location.href = 'index.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
