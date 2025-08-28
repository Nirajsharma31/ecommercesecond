// Authentication page functionality
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkAuthStatus();
    
    // If already logged in, redirect to home
    if (isLoggedIn()) {
        window.location.href = 'index.html';
    }
});

function setupEventListeners() {
    // Tab switching
    document.getElementById('login-tab').addEventListener('click', () => showTab('login'));
    document.getElementById('signup-tab').addEventListener('click', () => showTab('signup'));
    
    // Form submissions
    document.getElementById('login-form-element').addEventListener('submit', handleLogin);
    document.getElementById('signup-form-element').addEventListener('submit', handleSignup);
}

// Show login or signup tab
function showTab(tab) {
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        showNotification('Logging in...');
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: email, // Using email as username
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Save user data and token
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            // Sync local cart to server after login
            await syncCartAfterLogin(data.user);
            
            // Process pending cart item if exists
            await processPendingCartItem(data.user);
            
            showNotification('Login successful!');
            
            // Redirect based on role
            if (data.user.role === 'ADMIN') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please check your connection.', 'error');
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Validation
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        showNotification('Creating account...');
        
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName,
                lastName,
                username,
                email,
                phoneNumber: phone,
                password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Account created successfully! Please log in.');
            
            // Switch to login tab
            showTab('login');
            
            // Pre-fill login email
            document.getElementById('login-email').value = email;
        } else {
            showNotification(data.message || 'Signup failed', 'error');
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('Signup failed. Please check your connection.', 'error');
    }
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Sync local cart to server after login
async function syncCartAfterLogin(user) {
    const localCart = localStorage.getItem('cart');
    if (localCart) {
        const cartItems = JSON.parse(localCart);
        console.log('Syncing local cart to server:', cartItems);
        
        // Add each item to server cart
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
        
        // Clear local cart after syncing
        localStorage.removeItem('cart');
        console.log('Cart synced successfully');
    }
}

// Process pending cart item after login
async function processPendingCartItem(user) {
    const pendingItemStr = localStorage.getItem('pendingCartItem');
    if (pendingItemStr) {
        try {
            const pendingItem = JSON.parse(pendingItemStr);
            console.log('Processing pending cart item:', pendingItem);
            
            // Check if the pending item is not too old (within 30 minutes)
            const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
            if (pendingItem.timestamp && pendingItem.timestamp > thirtyMinutesAgo) {
                // Add the pending item to cart
                const response = await fetch(`${API_BASE_URL}/cart/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        productId: pendingItem.productId,
                        quantity: pendingItem.quantity
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        showNotification(`${pendingItem.productName} added to cart!`, 'success');
                    }
                }
            }
            
            // Clear the pending item
            localStorage.removeItem('pendingCartItem');
            
        } catch (error) {
            console.error('Error processing pending cart item:', error);
            localStorage.removeItem('pendingCartItem'); // Clear invalid data
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart'); // Clear cart on logout
    
    showNotification('Logged out successfully');
    window.location.href = 'index.html';
}