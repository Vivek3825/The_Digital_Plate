// Menu Data
const menuData = [
    {
        id: 1,
        name: 'Caesar Salad',
        category: 'appetizers',
        price: 149,
        description: 'Crisp romaine lettuce with parmesan and croutons',
        image: 'images/Caesar_Salad.png',
        badge: 'Popular',
        hasAR: false
    },
    {
        id: 2,
        name: 'Garlic Bread',
        category: 'appetizers',
        price: 79,
        description: 'Toasted bread with garlic butter and herbs',
        image: 'images/Garlic_Bread.jpg',
        badge: 'New',
        hasAR: false
    },
    {
        id: 3,
        name: 'Bruschetta',
        category: 'appetizers',
        price: 119,
        description: 'Grilled bread with tomatoes and basil',
        image: 'images/Bruschetta.png',
        badge: '',
        hasAR: false
    },
    {
        id: 4,
        name: 'Grilled Salmon',
        category: 'main',
        price: 149,
        description: 'Fresh salmon with lemon butter sauce',
        image: 'images/Grilled_Salmon.png',
        badge: 'Chef Special',
        hasAR: false
    },
    {
        id: 5,
        name: 'Ribeye Steak',
        category: 'main',
        price: 249,
        description: 'Premium ribeye with garlic mashed potatoes',
        image: 'images/Ribeye_Steak.png',
        badge: 'Premium',
        hasAR: false
    },
    {
        id: 6,
        name: 'Chicken Parmesan',
        category: 'main',
        price: 499,
        description: 'Breaded chicken with marinara and cheese',
        image: 'images/Chicken_Parmesan.png',
        badge: 'Popular',
        hasAR: false
    },
    {
        id: 7,
        name: 'Vegetable Pasta',
        category: 'main',
        price: 99,
        description: 'Fresh pasta with seasonal vegetables',
        image: 'images/Vegetable_Pasta.png',
        badge: 'Vegan',
        hasAR: false
    },
    {
        id: 8,
        name: 'Lobster Risotto',
        category: 'main',
        price: 299,
        description: 'Creamy risotto with fresh lobster',
        image: 'images/Lobster_Risotto.jpg',
        badge: 'Premium',
        hasAR: false
    },
    {
        id: 9,
        name: 'Chocolate Lava Cake',
        category: 'desserts',
        price: 699,
        description: 'Warm chocolate cake with molten center',
        image: 'images/Chocolate_Lava_Cake.png',
        badge: 'Popular',
        hasAR: false
    },
    {
        id: 10,
        name: 'Tiramisu',
        category: 'desserts',
        price: 119,
        description: 'Classic Italian coffee-flavored dessert',
        image: 'images/Tiramisu.png',
        badge: '',
        hasAR: false
    },
    {
        id: 11,
        name: 'Cheesecake',
        category: 'desserts',
        price: 649,
        description: 'New York style with berry compote',
        image: 'images/Cheesecake.jpg',
        badge: 'Chef Special',
        hasAR: false
    },
    {
        id: 12,
        name: 'Fresh Lemonade',
        category: 'beverages',
        price: 229,
        description: 'Freshly squeezed lemonade',
        image: 'images/Fresh_Lemonade.jpg',
        badge: '',
        hasAR: false
    },
    {
        id: 13,
        name: 'Iced Coffee',
        category: 'beverages',
        price: 199,
        description: 'Cold brew with ice and cream',
        image: 'images/Iced_Coffee.png',
        badge: 'Popular',
        hasAR: false
    },
    {
        id: 14,
        name: 'Mojito',
        category: 'beverages',
        price: 149,
        description: 'Classic Cuban cocktail',
        image: 'images/Mojito.png',
        badge: 'Signature',
        hasAR: false
    },
    {
        id: 15,
        name: 'Samosa',
        category: 'appetizers',
        price: 49,
        description: 'Golden fried pastry with spiced filling',
        image: 'images/samosa.jpg',
        badge: 'AR Available',
        hasAR: true
    },
    {
        id: 16,
        name: 'Pizza',
        category: 'main',
        price: 299,
        description: 'Wood-fired artisan pizza with fresh toppings',
        image: 'images/pizza.jpg',
        badge: 'AR Available',
        hasAR: true
    },
    {
        id: 17,
        name: 'Monster Energy Drink',
        category: 'beverages',
        price: 99,
        description: 'Refreshing energy boost',
        image: 'images/Monster_Energy_Drink.jpg',
        badge: 'AR Available',
        hasAR: true
    },
    {
        id: 18,
        name: 'Chicken Masala',
        category: 'main',
        price: 249,
        description: 'Tender chicken in rich aromatic masala gravy',
        image: 'images/Chicken_Masala.png',
        badge: 'AR Available',
        hasAR: true
    },
    {
        id: 19,
        name: 'Egg Masala Thali',
        category: 'main',
        price: 179,
        description: 'Complete thali with egg curry, rice, and sides',
        image: 'images/Egg_Masala.png',
        badge: 'AR Available',
        hasAR: true
    },
    {
        id: 20,
        name: 'Paneer Masala',
        category: 'main',
        price: 199,
        description: 'Cottage cheese in creamy tomato-based gravy',
        image: 'images/Paneer_Masala.png',
        badge: 'AR Available',
        hasAR: true
    }
];

// Cart State
let cart = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeMenu();
    setupEventListeners();
    setupScrollAnimations();
    updateCartUI();
});

// Initialize Menu
function initializeMenu() {
    const menuGrid = document.getElementById('menuGrid');
    
    if (!menuGrid) {
        console.error('Menu grid not found in DOM');
        return;
    }
    
    renderMenuItems(currentFilter);
}

// Render Menu Items
function renderMenuItems(category) {
    const menuGrid = document.getElementById('menuGrid');
    
    if (!menuGrid) {
        console.error('Menu grid element not found');
        return;
    }
    
    // Clear existing content
    menuGrid.innerHTML = '';
    
    const filteredItems = category === 'all' 
        ? menuData 
        : menuData.filter(item => item.category === category);
    
    if (filteredItems.length === 0) {
        menuGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-utensils" style="font-size: 3rem; margin-bottom: 1rem; color: #ff6b6b;"></i>
                <p style="font-size: 1.2rem;">No items found in this category</p>
            </div>
        `;
        return;
    }
    
    filteredItems.forEach((item, index) => {
        const menuItem = createMenuItem(item, index);
        menuGrid.appendChild(menuItem);
    });
}

// Create Menu Item Element
function createMenuItem(item, index) {
    const div = document.createElement('div');
    div.className = 'menu-item';

    // Always render AR button. If not special, clicking still shows info popup.
    const arButton = `<button class="btn-ar" onclick="openARModal('${item.name}', ${item.hasAR})" style="background: #4ecdc4; color: white;">
            <i class="fas fa-cube"></i> AR
        </button>`;

    div.innerHTML = `
        <div class="menu-item-image" style="background: #e0e0e0;">
            <img src="${item.image}" alt="${item.name}" style="display: block; width: 100%; height: 100%; object-fit: cover;">
            ${item.badge ? `<span class="menu-item-badge" style="background: #ffe66d; color: #1a1a2e;">${item.badge}</span>` : ''}
        </div>
        <div class="menu-item-content" style="padding: 1.5rem; background: white;">
            <div class="menu-item-header">
                <h3 class="menu-item-title" style="color: #1a1a2e; font-size: 1.2rem; font-weight: 600;">${item.name}</h3>
                <span class="menu-item-price" style="color: #ff6b6b; font-size: 1.3rem; font-weight: bold;">₹${item.price}</span>
            </div>
            <p class="menu-item-description" style="color: #666; font-size: 0.95rem; margin-bottom: 1rem;">${item.description}</p>
            <div class="menu-item-footer">
                ${arButton}
                <button class="btn-add-cart" onclick="addToCart(${item.id})" style="background: #ff6b6b; color: white;">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `;

    return div;
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileMenuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Smooth scroll to target
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                // Force reveal of target section in case IntersectionObserver hasn't fired yet (mobile anchor jump issue)
                if (target.style && target.style.opacity === '0') {
                    target.style.opacity = '1';
                    target.style.transform = 'translateY(0)';
                }
            }
            
            // Close mobile menu on mobile
            if (window.innerWidth <= 768 && navMenu && mobileMenuToggle) {
                navMenu.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });
    
    // Category Buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            renderMenuItems(currentFilter);
        });
    });
    
    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Star Rating
    const stars = document.querySelectorAll('.star-rating i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.dataset.rating;
            stars.forEach(s => {
                if (s.dataset.rating <= rating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'active');
                } else {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                }
            });
        });
        
        star.addEventListener('mouseenter', () => {
            const rating = star.dataset.rating;
            stars.forEach(s => {
                if (s.dataset.rating <= rating) {
                    s.style.transform = 'scale(1.2)';
                }
            });
        });
        
        star.addEventListener('mouseleave', () => {
            stars.forEach(s => {
                s.style.transform = 'scale(1)';
            });
        });
    });
    
    // Feedback Form
    const feedbackForm = document.getElementById('feedbackForm');
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Thank you for your feedback!', 'success');
        feedbackForm.reset();
        stars.forEach(s => {
            s.classList.remove('fas', 'active');
            s.classList.add('far');
        });
    });
    
    // Chat Input
    const chatInput = document.getElementById('chatInput');
    const btnSend = document.getElementById('btnSend');
    
    btnSend.addEventListener('click', () => {
        sendMessage();
    });
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Quick Action Buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const message = btn.textContent;
            addUserMessage(message);
            setTimeout(() => {
                addBotResponse(message);
            }, 1000);
        });
    });
    
    // Modal
    const modal = document.getElementById('arModal');
    const closeModal = document.querySelector('.close-modal');
    
    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // View AR Buttons in Hero
    document.querySelectorAll('.btn-view-ar').forEach(btn => {
        btn.addEventListener('click', () => {
            const dishName = btn.getAttribute('data-dish');
            openARModal(dishName);
        });
    });
    
    // Cart Icon Click
    document.querySelector('.cart-icon').addEventListener('click', () => {
        scrollToSection('order');
    });
}

// Add to Cart
function addToCart(itemId) {
    const item = menuData.find(i => i.id === itemId);
    const existingItem = cart.find(i => i.id === itemId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    updateCartUI();
    showNotification(`${item.name} added to cart!`, 'success');
    
    // Button animation
    const btn = event.target.closest('.btn-add-cart');
    btn.classList.add('added');
    setTimeout(() => btn.classList.remove('added'), 500);
}

// Update Cart UI
function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.getElementById('cartItems');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <p>Your cart is empty</p>
                <button class="btn-primary" onclick="scrollToSection('menu')">Browse Menu</button>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="btn-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }
    
    updateOrderSummary();
}

// Update Quantity
function updateQuantity(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCartUI();
        }
    }
}

// Remove from Cart
function removeFromCart(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    updateCartUI();
    showNotification('Item removed from cart', 'info');
}

// Update Order Summary
function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const delivery = cart.length > 0 ? 415 : 0;
    const total = subtotal + tax + delivery;
    
    document.getElementById('subtotal').textContent = `₹${Math.round(subtotal)}`;
    document.getElementById('tax').textContent = `₹${Math.round(tax)}`;
    document.getElementById('delivery').textContent = `₹${delivery}`;
    document.getElementById('total').textContent = `₹${Math.round(total)}`;
}

// Chat Functions
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        addUserMessage(message);
        input.value = '';
        
        setTimeout(() => {
            addBotResponse(message);
        }, 1000);
    }
}

function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotResponse(userMessage) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    
    let response = getBotResponse(userMessage);
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>${response}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
        return "I recommend our Chef's Special - the Truffle Pasta! It's made with handmade pasta and fresh truffles. Would you like to add it to your cart?";
    } else if (lowerMessage.includes('dietary') || lowerMessage.includes('vegan') || lowerMessage.includes('vegetarian')) {
        return "We have several vegetarian and vegan options! Our Vegetable Pasta is completely vegan and very popular. We can also customize most dishes to meet your dietary needs.";
    } else if (lowerMessage.includes('special') || lowerMessage.includes('today')) {
        return "Today's specials include our Mediterranean Delight salad and Lobster Risotto. Both are prepared with fresh, locally-sourced ingredients!";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        return "Our menu items range from ₹331 for beverages to ₹3236 for premium dishes. We also offer combo deals! Would you like to know more about any specific item?";
    } else if (lowerMessage.includes('delivery') || lowerMessage.includes('order')) {
        return "Yes, we deliver! Delivery fee is ₹415 and typically takes 30-45 minutes. You can place your order through our cart section. Need help with anything else?";
    } else {
        return "I'm here to help! I can recommend dishes, answer questions about ingredients, dietary options, or help you place an order. What would you like to know?";
    }
}

// AR Modal - Redirect to AR Environment
function openARModal(dishName, hasAR) {
    // Map dish names to model files
    const dishToModelMap = {
        'Crispy Samosa': 'samosa.glb',
        'Samosa': 'samosa.glb',
        'Artisan Pizza': 'pizza.glb',
        'Pizza': 'pizza.glb',
        'Cheeze Corn Pizza': 'pizza.glb',
        'Monster Energy': 'monster_energy_drink.glb',
        'Monster Energy Drink': 'monster_energy_drink.glb',
        'Chicken Masala': 'chicken.glb',
        'Chicken_Masala': 'chicken.glb',
        'Egg Masala Thali': 'egg_masala.glb',
        'Egg_Masala_Thali': 'egg_masala.glb',
        'Paneer Masala': 'paneer.glb',
        'Paneer_Masala': 'paneer.glb'
    };

    // If dish has a model mapping, redirect directly to AR viewer
    if (dishToModelMap[dishName]) {
        const modelFile = dishToModelMap[dishName];
        window.location.href = `AR_environment/custom-ar.html?model=${encodeURIComponent(modelFile)}`;
        return;
    }

    // If hasAR not provided, look it up from menuData
    if (hasAR === undefined) {
        const dish = menuData.find(item => item.name === dishName);
        hasAR = dish ? dish.hasAR : false;
    }

    // If dish has AR support but no mapping found, show error
    if (hasAR) {
        console.warn('AR model not found for:', dishName);
    }

    // Otherwise show modal popup for dishes without AR
    const modal = document.getElementById('arModal');
    const note = document.getElementById('arNoteText');
    const title = document.getElementById('arModalTitle');

    if (!modal || !note || !title) return;

    title.textContent = 'Augmented Reality';
    note.textContent = 'AR feature is available only for special dishes... We are working on it.';

    modal.classList.add('active');
}

// Close AR modal button handler (dynamic element exists in HTML)
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('arModalCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = document.getElementById('arModal');
            if (modal) modal.classList.remove('active');
        });
    }
});

// Scroll to Section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Scroll Animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections
    document.querySelectorAll('section').forEach(section => {
        // Skip hiding the menu section to avoid initial white screen on mobile anchor navigation
        if (section.id === 'menu') {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        } else {
            section.style.opacity = '0';
            section.style.transform = 'translateY(50px)';
            section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(section);
        }
    });

    // Safety: if user lands directly on #menu via hash in URL, ensure it's visible
    if (window.location.hash === '#menu') {
        const menuSection = document.getElementById('menu');
        if (menuSection) {
            menuSection.style.opacity = '1';
            menuSection.style.transform = 'translateY(0)';
        }
    }
}

// Add animations to the page
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

