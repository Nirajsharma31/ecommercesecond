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
            <img src="${item.image || 'https://via.placeholder.com/100x100'}" 
                 alt="${item.name}"
                 onerror="this.src='https://via.placeholder.com/100x100'">
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
function openCheckoutModal() {
    const cart = getCart();
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

    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty');
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
        setTimeout(() => {
            // Clear cart
            saveCart([]);
            updateCartCount();

            // Close modal
            document.getElementById('checkout-modal').style.display = 'none';

            // Show success message
            alert('Order placed successfully! You will receive a confirmation email shortly.');

            // Redirect to home
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        console.error('Error processing checkout:', error);
        alert('Failed to process your order. Please try again.');
    }
}