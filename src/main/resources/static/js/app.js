// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkApiHealth();
    updateCartCount();
    checkAuthStatus();
    setupMobileMenu();
});

// Check API Health
async function checkApiHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log('API Health:', data);
    } catch (error) {
        console.error('API Health Check Failed:', error);
    }
}

// Setup mobile menu
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Cart Management Functions
async function getCart() {
    const user = getCurrentUser();
    if (!user) {
        // If not logged in, use localStorage as fallback
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${user.id}`);
        if (response.ok) {
            const cartData = await response.json();
            // Convert server cart format to frontend format
            if (cartData.cartItems) {
                return cartData.cartItems.map(item => ({
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    image: item.product.imageUrl || 'https://via.placeholder.com/100x100'
                }));
            }
        }
    } catch (error) {
        console.error('Error fetching cart from server:', error);
    }
    
    // Fallback to localStorage
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    // Keep localStorage as backup for non-logged-in users
    localStorage.setItem('cart', JSON.stringify(cart));
}

async function addToCart(productId, productName, productPrice, quantity = 1) {
    const user = getCurrentUser();
    
    if (!user) {
        // If not logged in, use localStorage
        let cart = await getCart();
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: quantity,
                image: `https://via.placeholder.com/100x100`
            });
        }
        
        saveCart(cart);
        updateCartCount();
        showNotification(`${productName} added to cart!`);
        return;
    }
    
    // If logged in, use server-side cart
    try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                productId: productId,
                quantity: quantity
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                updateCartCount();
                showNotification(`${productName} added to cart!`);
            } else {
                showNotification('Failed to add to cart', 'error');
            }
        } else {
            showNotification('Failed to add to cart', 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add to cart', 'error');
    }
}

async function updateCartCount() {
    const cart = await getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'inline' : 'none';
    });
}

// Authentication Functions
function checkAuthStatus() {
    const user = getCurrentUser();
    const authNavElements = document.querySelectorAll('#auth-nav, #admin-auth-nav');
    
    authNavElements.forEach(authNav => {
        if (user) {
            // User is logged in
            if (user.role === 'ADMIN') {
                authNav.innerHTML = `
                    <a href="admin.html" class="nav-link">Dashboard</a>
                    <a href="#" class="nav-link" onclick="logout()">Logout (${user.firstName})</a>
                `;
            } else {
                authNav.innerHTML = `
                    <a href="#" class="nav-link" onclick="logout()">Logout (${user.firstName})</a>
                `;
            }
        } else {
            // User is not logged in
            authNav.innerHTML = `
                <a href="login.html" class="nav-link">Login</a>
            `;
        }
    });
}

function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function getAuthToken() {
    return localStorage.getItem('token');
}

async function logout() {
    // Before logging out, if there are items in localStorage cart and user is logged in,
    // we should sync them to the server
    const user = getCurrentUser();
    if (user) {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
            const cartItems = JSON.parse(localCart);
            // Sync local cart items to server before logout
            for (const item of cartItems) {
                try {
                    await fetch(`${API_BASE_URL}/cart/add`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userId: user.id,
                            productId: item.id,
                            quantity: item.quantity
                        })
                    });
                } catch (error) {
                    console.error('Error syncing cart item:', error);
                }
            }
        }
    }
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart'); // Clear local cart after syncing
    
    showNotification('Logged out successfully');
    window.location.href = 'index.html';
}

// Notification System
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        font-weight: bold;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Utility Functions
function formatPrice(price) {
    return `$${parseFloat(price).toFixed(2)}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search functionality (can be used across pages)
function performSearch(searchTerm, items, searchFields) {
    if (!searchTerm.trim()) {
        return items;
    }
    
    const term = searchTerm.toLowerCase();
    return items.filter(item => {
        return searchFields.some(field => {
            const value = getNestedProperty(item, field);
            return value && value.toString().toLowerCase().includes(term);
        });
    });
}

function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
}

// Error handling
function handleApiError(error, fallbackMessage = 'An error occurred') {
    console.error('API Error:', error);
    
    if (error.response) {
        // Server responded with error status
        return error.response.data?.message || fallbackMessage;
    } else if (error.request) {
        // Request was made but no response received
        return 'Network error. Please check your connection.';
    } else {
        // Something else happened
        return fallbackMessage;
    }
}

// Loading state management
function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="loading">Loading...</div>';
    }
}

function hideLoading(element) {
    const loadingElement = element?.querySelector('.loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Form validation helpers
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

function validateRequired(value) {
    return value && value.toString().trim().length > 0;
}