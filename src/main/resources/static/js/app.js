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
        // If not logged in, return empty cart
        return [];
    }
    
    try {
        // Get cart from localStorage (reliable approach)
        const cartKey = 'userCart_' + user.id;
        const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        console.log('Retrieved cart from localStorage:', cart);
        return cart;
        
    } catch (error) {
        console.error('Error getting cart from localStorage:', error);
        return [];
    }
}

function saveCart(cart) {
    // Keep localStorage as backup for non-logged-in users
    localStorage.setItem('cart', JSON.stringify(cart));
}

async function addToCart(productId, productName, productPrice, quantity = 1) {
    console.log('=== ADD TO CART CALLED ===');
    console.log('Product ID:', productId, 'Name:', productName, 'Price:', productPrice, 'Quantity:', quantity);
    
    const user = getCurrentUser();
    console.log('Current user:', user);
    
    if (!user) {
        console.log('User not logged in, redirecting to login page');
        // Store the intended action for after login
        const pendingCartItem = {
            productId: productId,
            productName: productName,
            productPrice: productPrice,
            quantity: quantity,
            timestamp: Date.now()
        };
        localStorage.setItem('pendingCartItem', JSON.stringify(pendingCartItem));
        
        // Show notification and redirect
        showNotification('Please login to add items to cart', 'error');
        
        // Redirect after a short delay to show the notification
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // For logged in users, use localStorage cart (simplified approach)
    console.log('User is logged in, adding to localStorage cart');
    
    try {
        // Get current cart from localStorage
        let cart = JSON.parse(localStorage.getItem('userCart_' + user.id) || '[]');
        console.log('Current cart:', cart);
        
        // Check if item already exists
        const existingItemIndex = cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex !== -1) {
            // Update quantity of existing item
            cart[existingItemIndex].quantity += quantity;
            console.log('Updated existing item quantity:', cart[existingItemIndex]);
        } else {
            // Add new item to cart
            const newItem = {
                id: productId,
                name: productName,
                price: productPrice,
                quantity: quantity,
                image: `data:image/svg+xml;charset=UTF-8,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E`
            };
            cart.push(newItem);
            console.log('Added new item to cart:', newItem);
        }
        
        // Save updated cart
        localStorage.setItem('userCart_' + user.id, JSON.stringify(cart));
        console.log('Cart saved to localStorage:', cart);
        
        // Update cart count
        await updateCartCount();
        
        // Show success notification
        showNotification(`${productName} added to cart!`);
        
        // Try to sync with server in background (optional)
        syncCartToServer(user.id, productId, quantity);
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add to cart: ' + error.message, 'error');
    }
}

// Background sync to server (optional, won't block the UI)
async function syncCartToServer(userId, productId, quantity) {
    try {
        console.log('Attempting to sync cart to server...');
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                productId: productId,
                quantity: quantity
            })
        });
        
        if (response.ok) {
            console.log('✅ Cart synced to server successfully');
        } else {
            console.log('⚠️ Server sync failed, but local cart is working');
        }
    } catch (error) {
        console.log('⚠️ Server sync failed, but local cart is working:', error.message);
    }
}

let isUpdatingCartCount = false;

async function updateCartCount() {
    if (isUpdatingCartCount) return; // Prevent multiple simultaneous calls
    isUpdatingCartCount = true;
    
    try {
        const cart = await getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartCountElements = document.querySelectorAll('#cart-count');
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'inline' : 'none';
        });
    } catch (error) {
        console.error('Error updating cart count:', error);
    } finally {
        isUpdatingCartCount = false;
    }
}

// Authentication Functions
function checkAuthStatus() {
    const user = getCurrentUser();
    const authNavElements = document.querySelectorAll('#auth-nav, #admin-auth-nav');
    
    authNavElements.forEach(authNav => {
        if (user) {
            // User is logged in
            const displayName = user.firstName || user.username || 'User';
            if (user.role === 'ADMIN') {
                authNav.innerHTML = `
                    <a href="admin.html" class="nav-link">Dashboard</a>
                    <a href="#" class="nav-link" onclick="logout()">Logout (${displayName})</a>
                `;
            } else {
                authNav.innerHTML = `
                    <a href="#" class="nav-link" onclick="logout()">Logout (${displayName})</a>
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

// Debug function to test cart functionality
async function debugCart() {
    const user = getCurrentUser();
    console.log('Current user:', user);
    
    if (!user) {
        console.log('No user logged in');
        showNotification('Please log in first', 'error');
        return;
    }
    
    try {
        // Test debug endpoint
        const response = await fetch(`${API_BASE_URL}/cart/debug-add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                productId: 1,
                quantity: 1
            })
        });
        
        const result = await response.json();
        console.log('Debug result:', result);
        showNotification('Debug test completed - check console');
        
    } catch (error) {
        console.error('Debug error:', error);
        showNotification('Debug test failed', 'error');
    }
}

// Make debugCart available globally for testing
window.debugCart = debugCart;

// Function to require authentication for certain pages
function requireAuthentication(redirectUrl = 'login.html') {
    const user = getCurrentUser();
    if (!user) {
        showNotification('Please login to access this page', 'error');
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);
        return false;
    }
    return true;
}

// Function to check if user is authenticated
function isAuthenticated() {
    return getCurrentUser() !== null;
}

// Function to prompt login for cart actions
function promptLogin(action = 'perform this action') {
    showNotification(`Please login to ${action}`, 'error');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Debug function to test cart step by step
async function debugCartFlow() {
    console.log('=== DEBUGGING CART FLOW ===');
    
    const user = getCurrentUser();
    console.log('1. Current user:', user);
    
    if (!user) {
        console.log('❌ No user logged in');
        return;
    }
    
    // Test adding an item
    console.log('2. Testing add to cart...');
    try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                productId: 1,
                quantity: 1
            })
        });
        
        const responseText = await response.text();
        console.log('Add to cart response:', responseText);
        
        if (response.ok) {
            const result = JSON.parse(responseText);
            console.log('✅ Add to cart successful:', result);
        } else {
            console.log('❌ Add to cart failed:', response.status);
        }
    } catch (error) {
        console.error('❌ Add to cart error:', error);
    }
    
    // Test getting cart
    console.log('3. Testing get cart...');
    try {
        const cart = await getCart();
        console.log('✅ Cart retrieved:', cart);
        console.log('Cart items count:', cart.length);
    } catch (error) {
        console.error('❌ Get cart error:', error);
    }
    
    // Test cart count update
    console.log('4. Testing cart count update...');
    try {
        await updateCartCount();
        console.log('✅ Cart count updated');
    } catch (error) {
        console.error('❌ Cart count update error:', error);
    }
}

// Make functions available globally
window.requireAuthentication = requireAuthentication;
window.isAuthenticated = isAuthenticated;
window.promptLogin = promptLogin;
window.debugCartFlow = debugCartFlow;