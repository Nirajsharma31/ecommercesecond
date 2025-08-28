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
        alert('Please fill in all fields');
        return;
    }
    
    try {
        // For demo purposes, we'll simulate login
        // In a real app, you would call your backend API
        
        const loginData = {
            username: email, // Using email as username for demo
            password: password
        };
        
        // Simulate API call
        showNotification('Logging in...');
        
        // Mock successful login
        setTimeout(() => {
            const mockUser = {
                id: 1,
                username: email,
                email: email,
                firstName: 'John',
                lastName: 'Doe',
                role: email === 'admin@eshop.com' ? 'ADMIN' : 'USER'
            };
            
            const mockToken = 'mock-jwt-token-' + Date.now();
            
            // Save user data
            localStorage.setItem('user', JSON.stringify(mockUser));
            localStorage.setItem('token', mockToken);
            
            // Sync local cart to server after login
            syncCartAfterLogin(mockUser);
            
            showNotification('Login successful!');
            
            // Redirect based on role
            if (mockUser.role === 'ADMIN') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials.');
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
        alert('Please fill in all required fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    try {
        const signupData = {
            firstName,
            lastName,
            username,
            email,
            phoneNumber: phone,
            password
        };
        
        // Simulate API call
        showNotification('Creating account...');
        
        // Mock successful signup
        setTimeout(() => {
            showNotification('Account created successfully! Please log in.');
            
            // Switch to login tab
            showTab('login');
            
            // Pre-fill login email
            document.getElementById('login-email').value = email;
        }, 1000);
        
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
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

// Logout function
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart'); // Clear cart on logout
    
    showNotification('Logged out successfully');
    window.location.href = 'index.html';
}