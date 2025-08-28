// Cart page functionality
document.addEventListener('DOMContentLoaded', function () {
    loadCart();
    updateCartCount();
    checkAuthStatus();
    setupEventListeners();
});

function setupEventListeners() {
    // Checkout modal
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeBtn = checkoutModal.querySelector('.close');

    checkoutBtn.addEventListener('click', openCheckoutModal);
    closeBtn.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
    });

    // Checkout form
    document.getElementById('checkout-form').addEventListener('submit', processCheckout);
}

// Load cart items
async function loadCart() {
    const cart = await getCart();

    if (cart.length === 0) {
        showEmptyCart();
        return;
    }

    displayCartItems(cart);
    updateCartSummary(cart);
}

// Display cart items
function displayCartItems(cart) {
    const cartItemsContainer = document.getElementById('cart-items');

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <img src="${item.image || `data:image/svg+xml;charset=UTF-8,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E`}" 
                 alt="${item.name}"
                 onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg width=\\'100\\' height=\\'100\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Crect width=\\'100\\' height=\\'100\\' fill=\\'%23f5f5f5\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' font-family=\\'Arial\\' font-size=\\'12\\' fill=\\'%23999\\' text-anchor=\\'middle\\' dy=\\'.3em\\'%3ENo Image%3C/text%3E%3C/svg%3E'">
            <div class="item-details">
                <h3>${item.name}</h3>
                <div class="item-price">$${item.price}</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
    `).join('');

    document.getElementById('cart-items').style.display = 'block';
    document.getElementById('empty-cart').style.display = 'none';
}

// Show empty cart
function showEmptyCart() {
    document.getElementById('cart-items').style.display = 'none';
    document.getElementById('empty-cart').style.display = 'block';

    // Reset summary
    document.getElementById('subtotal').textContent = '$0.00';
    document.getElementById('tax').textContent = '$0.00';
    document.getElementById('total').textContent = '$5.99'; // Just shipping
    document.getElementById('checkout-btn').disabled = true;
}

// Update cart summary
function updateCartSummary(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 5.99 : 0;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free';
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;

    document.getElementById('checkout-btn').disabled = cart.length === 0;
}

// Update item quantity
async function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    const user = getCurrentUser();
    if (!user) {
        // Fallback to localStorage for non-logged-in users
        let cart = await getCart();
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex !== -1) {
            cart[itemIndex].quantity = newQuantity;
            saveCart(cart);
            loadCart();
            updateCartCount();
        }
        return;
    }

    // For logged-in users, we need to implement server-side quantity update
    // For now, remove and re-add with new quantity
    try {
        await removeFromCart(productId);
        // Get product details to re-add
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        if (response.ok) {
            const product = await response.json();
            await addToCart(productId, product.name, product.price, newQuantity);
            loadCart();
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showNotification('Failed to update quantity', 'error');
    }
}

// Remove item from cart
async function removeFromCart(productId) {
    const user = getCurrentUser();

    if (!user) {
        // Fallback to localStorage for non-logged-in users
        let cart = await getCart();
        cart = cart.filter(item => item.id !== productId);
        saveCart(cart);
        loadCart();
        updateCartCount();
        showNotification('Item removed from cart');
        return;
    }

    // For logged-in users, use server-side removal
    try {
        const response = await fetch(`${API_BASE_URL}/cart/remove/${user.id}/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                loadCart();
                updateCartCount();
                showNotification('Item removed from cart');
            } else {
                showNotification('Failed to remove item', 'error');
            }
        } else {
            showNotification('Failed to remove item', 'error');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('Failed to remove item', 'error');
    }
}

// Open checkout modal
async function openCheckoutModal() {
    const cart = await getCart();
    const total = calculateTotal(cart);

    document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('checkout-modal').style.display = 'block';
}

// Calculate total
function calculateTotal(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 5.99 : 0;
    const tax = subtotal * 0.08;
    return subtotal + shipping + tax;
}

// Process checkout
async function processCheckout(e) {
    e.preventDefault();

    const cart = await getCart();
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    // Get form data
    const formData = new FormData(e.target);
    const orderData = {
        items: cart,
        shippingInfo: {
            fullName: formData.get('full-name'),
            address: formData.get('address'),
            city: formData.get('city'),
            zipCode: formData.get('zip')
        },
        paymentMethod: formData.get('payment-method'),
        total: calculateTotal(cart)
    };

    try {
        // Simulate order processing
        showNotification('Processing your order...');

        // In a real app, you would send this to your backend
        // const response = await fetch(`${API_BASE_URL}/orders`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${getAuthToken()}`
        //     },
        //     body: JSON.stringify(orderData)
        // });

        // Simulate successful order
        setTimeout(async () => {
            // Clear cart
            const user = getCurrentUser();
            if (user) {
                // Clear server-side cart
                try {
                    await fetch(`${API_BASE_URL}/cart/clear/${user.id}`, {
                        method: 'DELETE'
                    });
                } catch (error) {
                    console.error('Error clearing server cart:', error);
                }
            }

            // Clear local cart
            saveCart([]);
            await updateCartCount();

            // Close modal
            document.getElementById('checkout-modal').style.display = 'none';

            // Show success message
            showNotification('Order placed successfully! You will receive a confirmation email shortly.');

            // Redirect to home after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }, 2000);

    } catch (error) {
        console.error('Error processing checkout:', error);
        alert('Failed to process your order. Please try again.');
    }
}

// Test function for debugging
async function testCartFunctions() {
    console.log('=== TESTING CART FUNCTIONS ===');

    try {
        // Test user authentication
        const user = getCurrentUser();
        console.log('Current user:', user);

        // Test cart retrieval
        const cart = await getCart();
        console.log('Current cart:', cart);
        console.log('Cart length:', cart.length);

        if (cart.length === 0) {
            console.warn('Cart is empty - add some products first');
            showNotification('Cart is empty - add some products first', 'error');
            return;
        }

        // Test cart calculations
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log('Subtotal:', subtotal);

        const total = calculateTotal(cart);
        console.log('Calculated total:', total);

        // Test individual cart items
        cart.forEach((item, index) => {
            console.log(`Item ${index + 1}:`, {
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                itemTotal: (item.price * item.quantity).toFixed(2)
            });
        });

        // Test cart summary calculations
        const shipping = subtotal > 0 ? 5.99 : 0;
        const tax = subtotal * 0.08;
        console.log('Shipping:', shipping);
        console.log('Tax:', tax);
        console.log('Final total:', (subtotal + shipping + tax).toFixed(2));

        showNotification('Cart test completed successfully - check console for details', 'success');

    } catch (error) {
        console.error('Error during cart testing:', error);
        showNotification('Cart test failed - check console for error details', 'error');
    }
}

// Additional debugging function for cart operations
async function debugCartOperations() {
    console.log('=== DEBUGGING CART OPERATIONS ===');

    try {
        // Test localStorage cart
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        console.log('LocalStorage cart:', localCart);

        // Test API availability
        console.log('API Base URL:', typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'Not defined');

        // Test user session
        const user = getCurrentUser();
        if (user) {
            console.log('User session active:', user);

            // Test server cart if user is logged in
            try {
                const response = await fetch(`${API_BASE_URL}/cart/${user.id}`);
                if (response.ok) {
                    const serverCart = await response.json();
                    console.log('Server cart:', serverCart);
                } else {
                    console.warn('Failed to fetch server cart:', response.status);
                }
            } catch (fetchError) {
                console.error('Error fetching server cart:', fetchError);
            }
        } else {
            console.log('No user session - using localStorage cart');
        }

        showNotification('Debug operations completed - check console', 'info');

    } catch (error) {
        console.error('Error during debug operations:', error);
        showNotification('Debug operations failed', 'error');
    }
}

// Make test functions available globally
window.testCartFunctions = testCartFunctions;
window.debugCartOperations = debugCartOperations;

// Global error handler for cart operations
window.handleCartError = function (operation, error) {
    console.error(`Cart ${operation} failed:`, error);

    const errorDetails = {
        operation: operation,
        message: error.message || 'Unknown error',
        stack: error.stack,
        timestamp: new Date().toISOString()
    };

    console.table(errorDetails);
    showNotification(`Cart ${operation} failed: ${error.message}`, 'error');

    return errorDetails;
};
