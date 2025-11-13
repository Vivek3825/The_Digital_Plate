// Model configurations with icons and descriptions
const modelConfigs = {
    'pizza.glb': {
        name: 'Pizza',
        icon: '🍕',
        description: 'Delicious Italian pizza'
    },
    'samosa.glb': {
        name: 'Samosa',
        icon: '🥟',
        description: 'Crispy Indian snack'
    },
    'monster_energy_drink.glb': {
        name: 'Monster Energy Drink',
        icon: '🥤',
        description: 'Energy drink can'
    }
};

// Load available models
async function loadModels() {
    const modelsGrid = document.getElementById('modelsGrid');
    
    // Show loading state
    modelsGrid.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading models...</p></div>';
    
    try {
        // Get list of models from dish_models folder
        const models = Object.keys(modelConfigs);
        
        if (models.length === 0) {
            modelsGrid.innerHTML = '<p style="color: white; text-align: center;">No models found</p>';
            return;
        }
        
        // Clear loading state
        modelsGrid.innerHTML = '';
        
        // Create cards for each model
        models.forEach(modelFile => {
            const config = modelConfigs[modelFile];
            const card = createModelCard(modelFile, config);
            modelsGrid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading models:', error);
        modelsGrid.innerHTML = '<p style="color: white; text-align: center;">Error loading models</p>';
    }
}

function createModelCard(modelFile, config) {
    const card = document.createElement('a');
    card.className = 'model-card';
    // Use custom AR viewer with camera feed
    card.href = `custom-ar.html?model=${encodeURIComponent(modelFile)}`;
    
    card.innerHTML = `
        <div class="model-icon">${config.icon}</div>
        <h2>${config.name}</h2>
        <p>${config.description}</p>
        <span class="ar-badge">View in AR</span>
    `;
    
    return card;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadModels);
