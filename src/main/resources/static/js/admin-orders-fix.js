// Fix for admin orders display issue
// This file ensures orders are loaded from localStorage correctly

console.log('🔧 Admin Orders Fix loaded');

// Override the loadOrders function to ensure it works correctly
function loadOrders() {
    console.log('🔄 Loading orders from localStorage...');
    const tbody = document.getElementById('orders-table-body');
    
    if (!tbody) {
        console.error('❌ Orders table body not found');
        return;
    }
    
    try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        console.log('📦 Found orders:', orders.length);
        
        if (orders.length === 0) {
            console.log('📭 No orders found, showing empty message');
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
                        <div>
                            <p><strong>No Orders Found</strong></p>
                            <p>No orders have been placed yet.</p>
                            <p>Orders will appear here after customers complete checkout.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Sort orders by timestamp (newest first)
        orders.sort((a, b) => b.timestamp - a.timestamp);
        console.log('📊 Displaying', orders.length, 'orders');
        
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customerName}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td>
                    <select onchange="updateOrderStatus(${order.id}, this.value)">
                        <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                        <option value="CONFIRMED" ${order.status === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
                        <option value="SHIPPED" ${order.status === 'SHIPPED' ? 'selected' : ''}>Shipped</option>
                        <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
                        <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>${order.date}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="viewOrder(${order.id})">View</button>
                </td>
            </tr>
        `).join('');
        
        console.log('✅ Orders loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #e74c3c;">
                    <p>Error loading orders: ${error.message}</p>
                </td>
            </tr>
        `;
    }
}

// Override updateStats to show real order count
function updateStats() {
    console.log('📈 Updating admin stats...');
    
    try {
        // Get real order count from localStorage
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const orderCountElement = document.getElementById('total-orders');
        if (orderCountElement) {
            orderCountElement.textContent = orders.length;
            console.log('📊 Order count updated:', orders.length);
        }
        
        // Get user count (simple implementation)
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const userCountElement = document.getElementById('total-users');
        if (userCountElement) {
            userCountElement.textContent = user ? '1' : '0';
        }
        
        // Try to get product and category counts from API
        fetchProductStats();
        
    } catch (error) {
        console.error('❌ Error updating stats:', error);
    }
}

async function fetchProductStats() {
    try {
        // Fetch real product count from API
        const response = await fetch(`${API_BASE_URL}/admin/products-count`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const productCountElement = document.getElementById('total-products');
                const categoryCountElement = document.getElementById('total-categories');
                
                if (productCountElement) {
                    productCountElement.textContent = data.totalProducts || '0';
                }
                if (categoryCountElement) {
                    categoryCountElement.textContent = data.totalCategories || '0';
                }
            }
        } else {
            // Fallback to counting products directly
            const productsResponse = await fetch(`${API_BASE_URL}/products`);
            const products = await productsResponse.json();
            const productCountElement = document.getElementById('total-products');
            if (productCountElement) {
                productCountElement.textContent = products.length || '0';
            }

            const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
            const categories = await categoriesResponse.json();
            const categoryCountElement = document.getElementById('total-categories');
            if (categoryCountElement) {
                categoryCountElement.textContent = categories.length || '0';
            }
        }
    } catch (error) {
        console.error('❌ Error fetching product stats:', error);
        // Set fallback values
        const productCountElement = document.getElementById('total-products');
        const categoryCountElement = document.getElementById('total-categories');
        
        if (productCountElement) productCountElement.textContent = '0';
        if (categoryCountElement) categoryCountElement.textContent = '0';
    }
}

// Override updateOrderStatus function
function updateOrderStatus(orderId, status) {
    console.log('🔄 Updating order status:', orderId, 'to', status);
    
    try {
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const orderIndex = orders.findIndex(order => order.id == orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = status;
            localStorage.setItem('orders', JSON.stringify(orders));
            console.log('✅ Order status updated successfully');
            
            // Show notification if function exists
            if (typeof showNotification === 'function') {
                showNotification(`Order #${orderId} status updated to ${status}!`);
            } else {
                alert(`Order #${orderId} status updated to ${status}!`);
            }
        } else {
            console.error('❌ Order not found:', orderId);
            if (typeof showNotification === 'function') {
                showNotification('Order not found!', 'error');
            } else {
                alert('Order not found!');
            }
        }
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        if (typeof showNotification === 'function') {
            showNotification('Failed to update order status', 'error');
        } else {
            alert('Failed to update order status');
        }
    }
}

// Override viewOrder function
function viewOrder(id) {
    console.log('👁️ Viewing order:', id);
    
    try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find(order => order.id == id);
        
        if (order) {
            let orderDetails = `Order #${order.id}\n\n`;
            orderDetails += `Customer: ${order.customerName}\n`;
            orderDetails += `Date: ${order.date}\n`;
            orderDetails += `Status: ${order.status}\n`;
            orderDetails += `Payment: ${order.paymentMethod}\n\n`;
            
            orderDetails += `Shipping Address:\n`;
            orderDetails += `${order.shippingInfo.fullName}\n`;
            orderDetails += `${order.shippingInfo.address}\n`;
            orderDetails += `${order.shippingInfo.city}, ${order.shippingInfo.zipCode}\n\n`;
            
            orderDetails += `Items:\n`;
            order.items.forEach(item => {
                orderDetails += `- ${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}\n`;
            });
            
            orderDetails += `\nTotal: $${order.total.toFixed(2)}`;
            
            alert(orderDetails);
        } else {
            alert('Order not found!');
        }
    } catch (error) {
        console.error('❌ Error viewing order:', error);
        alert('Error loading order details');
    }
}

// Auto-fix function that runs when page loads
function autoFixAdminOrders() {
    console.log('🚀 Auto-fixing admin orders...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoFixAdminOrders);
        return;
    }
    
    // Check if we're on admin page
    if (document.getElementById('orders-table-body')) {
        console.log('📋 Admin page detected, applying fixes...');
        
        // Load orders immediately
        setTimeout(() => {
            loadOrders();
            updateStats();
        }, 100);
        
        // Refresh every 30 seconds
        setInterval(() => {
            console.log('🔄 Auto-refreshing orders...');
            loadOrders();
            updateStats();
        }, 30000);
    }
}

// Run auto-fix
autoFixAdminOrders();

console.log('✅ Admin Orders Fix ready');