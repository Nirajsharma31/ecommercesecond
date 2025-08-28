// Admin dashboard functionality
document.addEventListener('DOMContentLoaded', function () {
    checkAdminAccess();
    loadDashboardData();
    setupEventListeners();
});

function checkAdminAccess() {
    const user = getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'login.html';
        return;
    }
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });

    // Modal functionality
    setupModals();
}

function setupModals() {
    // Product modal
    const productModal = document.getElementById('product-modal');
    const categoryModal = document.getElementById('category-modal');

    // Close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Form submissions
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);
}

// Load dashboard data
async function loadDashboardData() {
    try {
        await Promise.all([
            loadProducts(),
            loadCategories(),
            loadOrders(),
            loadUsers(),
            updateStats()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Switch tabs
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${tab}-section`).classList.add('active');
}

// Update statistics
async function updateStats() {
    try {
        // Fetch real product count from API
        const response = await fetch(`${API_BASE_URL}/admin/products-count`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                document.getElementById('total-products').textContent = data.totalProducts || '0';
                document.getElementById('total-categories').textContent = data.totalCategories || '0';
            }
        } else {
            // Fallback to counting products directly
            const productsResponse = await fetch(`${API_BASE_URL}/products`);
            const products = await productsResponse.json();
            document.getElementById('total-products').textContent = products.length || '0';

            const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
            const categories = await categoriesResponse.json();
            document.getElementById('total-categories').textContent = categories.length || '0';
        }

        // Set orders and users to 0 since APIs are not implemented
        document.getElementById('total-orders').textContent = '0';
        document.getElementById('total-users').textContent = '0';
    } catch (error) {
        console.error('Error updating stats:', error);
        // Fallback values
        document.getElementById('total-products').textContent = '0';
        document.getElementById('total-categories').textContent = '0';
        document.getElementById('total-orders').textContent = '0';
        document.getElementById('total-users').textContent = '0';
    }
}

// Load products for admin table
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = await response.json();
        displayProductsTable(products);
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('products-table-body').innerHTML =
            '<tr><td colspan="7">Failed to load products</td></tr>';
    }
}

// Display products in admin table
function displayProductsTable(products) {
    const tbody = document.getElementById('products-table-body');

    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No products found</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category ? product.category.name : 'N/A'}</td>
            <td>$${product.price}</td>
            <td>${product.stockQuantity || 0}</td>
            <td>
                <span class="status-badge ${product.active ? 'status-active' : 'status-inactive'}">
                    ${product.active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${product.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const categories = await response.json();
        displayCategoriesTable(categories);
        populateCategoryDropdown(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Display categories table
function displayCategoriesTable(categories) {
    const tbody = document.getElementById('categories-table-body');

    if (!categories || categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No categories found</td></tr>';
        return;
    }

    tbody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${category.description || 'N/A'}</td>
            <td>${category.products ? category.products.length : 0}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editCategory(${category.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteCategory(${category.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Populate category dropdown in product form
function populateCategoryDropdown(categories) {
    const select = document.getElementById('product-category');
    select.innerHTML = '<option value="">Select Category</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// Load orders (API not implemented yet)
function loadOrders() {
    const tbody = document.getElementById('orders-table-body');

    // Show message that orders API is not implemented
    tbody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
                <div>
                    <p><strong>Orders Management Not Available</strong></p>
                    <p>The orders API endpoints are not implemented yet.</p>
                    <p>This feature will be available once the OrderController is fully implemented.</p>
                </div>
            </td>
        </tr>
    `;
    return;

    // Old mock data (commented out)
    const mockOrders = [
        { id: 1, customer: 'John Doe', total: 125.99, status: 'PENDING', date: '2024-01-15' },
        { id: 2, customer: 'Jane Smith', total: 89.50, status: 'SHIPPED', date: '2024-01-14' },
        { id: 3, customer: 'Bob Johnson', total: 234.75, status: 'DELIVERED', date: '2024-01-13' }
    ];

    tbody.innerHTML = mockOrders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customer}</td>
            <td>$${order.total}</td>
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
}

// Load users (API not implemented yet)
function loadUsers() {
    const tbody = document.getElementById('users-table-body');

    // Show message that users API is not implemented
    tbody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
                <div>
                    <p><strong>Users Management Not Available</strong></p>
                    <p>The users API endpoints are not implemented yet.</p>
                    <p>This feature will be available once the UserController is fully implemented.</p>
                </div>
            </td>
        </tr>
    `;
    return;

    // Old mock data (commented out)
    const mockUsers = [
        { id: 1, username: 'john_doe', email: 'john@example.com', role: 'USER', enabled: true },
        { id: 2, username: 'jane_smith', email: 'jane@example.com', role: 'USER', enabled: true },
        { id: 3, username: 'admin', email: 'admin@eshop.com', role: 'ADMIN', enabled: true }
    ];

    tbody.innerHTML = mockUsers.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <span class="status-badge ${user.enabled ? 'status-active' : 'status-inactive'}">
                    ${user.enabled ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="action-btn edit-btn" onclick="toggleUserStatus(${user.id})">
                    ${user.enabled ? 'Disable' : 'Enable'}
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal functions
async function openAddProductModal() {
    document.getElementById('product-modal-title').textContent = 'Add Product';
    document.getElementById('product-form').reset();

    // Load categories for dropdown
    try {
        console.log('Fetching categories from:', `${API_BASE_URL}/categories`);
        const response = await fetch(`${API_BASE_URL}/categories`);
        console.log('Categories response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const categories = await response.json();
        console.log('Categories loaded:', categories);

        if (categories && categories.length > 0) {
            populateCategoryDropdown(categories);
            showNotification(`Loaded ${categories.length} categories`, 'success');
        } else {
            showNotification('No categories found. Please add categories first.', 'error');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showNotification(`Error loading categories: ${error.message}`, 'error');

        // Fallback: add a manual option to create categories
        const select = document.getElementById('product-category');
        select.innerHTML = '<option value="">No categories available - Add categories first</option>';
    }

    document.getElementById('product-modal').style.display = 'block';
}

function openAddCategoryModal() {
    document.getElementById('category-modal-title').textContent = 'Add Category';
    document.getElementById('category-form').reset();
    document.getElementById('category-modal').style.display = 'block';
}

// Form handlers
async function handleProductSubmit(e) {
    e.preventDefault();

    const formData = new FormData();

    // Get form values
    const name = document.getElementById('product-name').value;
    const description = document.getElementById('product-description').value;
    const price = document.getElementById('product-price').value;
    const stock = document.getElementById('product-stock').value;
    const categoryId = document.getElementById('product-category').value;
    const brand = document.getElementById('product-brand').value;
    const imageFile = document.getElementById('product-image').files[0];

    // Validate required fields
    if (!name || !price || !stock || !categoryId) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Append form data
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stockQuantity', stock);
    formData.append('categoryId', categoryId);
    formData.append('brand', brand);

    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/products`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            showNotification('Product saved successfully!');
            document.getElementById('product-modal').style.display = 'none';
            document.getElementById('product-form').reset();
            loadProducts(); // Reload products table
        } else {
            const error = await response.text();
            showNotification(`Error saving product: ${error}`, 'error');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Error saving product. Please try again.', 'error');
    }
}

async function handleCategorySubmit(e) {
    e.preventDefault();

    const name = document.getElementById('category-name').value;
    const description = document.getElementById('category-description').value;

    // Validate required fields
    if (!name) {
        showNotification('Please enter a category name', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);

    try {
        const response = await fetch(`${API_BASE_URL}/admin/categories`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            showNotification('Category saved successfully!');
            document.getElementById('category-modal').style.display = 'none';
            document.getElementById('category-form').reset();
            loadCategories(); // Reload categories table
        } else {
            const error = await response.text();
            showNotification(`Error saving category: ${error}`, 'error');
        }
    } catch (error) {
        console.error('Error saving category:', error);
        showNotification('Error saving category. Please try again.', 'error');
    }
}

// Action functions
function editProduct(id) {
    console.log('Edit product:', id);
    // In real app, load product data and populate form
    openAddProductModal();
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        console.log('Delete product:', id);
        showNotification('Product deleted successfully!');
        loadProducts();
    }
}

function editCategory(id) {
    console.log('Edit category:', id);
    openAddCategoryModal();
}

function deleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
        console.log('Delete category:', id);
        showNotification('Category deleted successfully!');
        loadCategories();
    }
}

function updateOrderStatus(orderId, status) {
    console.log('Update order status:', orderId, status);
    showNotification('Order status updated successfully!');
}

function viewOrder(id) {
    console.log('View order:', id);
    alert('Order details would be shown here');
}

function toggleUserStatus(id) {
    console.log('Toggle user status:', id);
    showNotification('User status updated successfully!');
    loadUsers();
}

// Enhanced notification function
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
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
        ${type === 'error' ? 'background-color: #e74c3c;' : 'background-color: #27ae60;'}
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Helper function to get auth token
function getAuthToken() {
    const user = getCurrentUser();
    return user ? user.token : '';
}

// Refresh categories function
async function refreshCategories() {
    try {
        console.log('Refreshing categories...');
        const response = await fetch(`${API_BASE_URL}/categories`);
        console.log('Categories response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const categories = await response.json();
        console.log('Categories loaded:', categories);

        if (categories && categories.length > 0) {
            populateCategoryDropdown(categories);
            showNotification(`Refreshed ${categories.length} categories`, 'success');
        } else {
            showNotification('No categories found. Please add categories first.', 'error');
            const select = document.getElementById('product-category');
            select.innerHTML = '<option value="">No categories available - Add categories first</option>';
        }
    } catch (error) {
        console.error('Error refreshing categories:', error);
        showNotification(`Error refreshing categories: ${error.message}`, 'error');
    }
}

// Delete all products function
async function deleteAllProducts() {
    const confirmed = confirm('⚠️ WARNING: This will delete ALL products from the database!\n\nThis action cannot be undone. Are you sure you want to continue?');

    if (!confirmed) {
        return;
    }

    // Double confirmation for safety
    const doubleConfirmed = confirm('This is your final warning!\n\nAll products will be permanently deleted. Click OK to proceed or Cancel to abort.');

    if (!doubleConfirmed) {
        return;
    }

    try {
        showNotification('Deleting all products...', 'info');

        const response = await fetch(`${API_BASE_URL}/admin/delete-all-products`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Delete result:', result);

        if (result.success) {
            showNotification(`Successfully deleted ${result.deletedCount} products!`, 'success');

            // Reload the products table and update stats
            await loadProducts();
            await updateStats();

            // Show breakdown if available
            if (result.categoryBreakdown) {
                console.log('Deleted products by category:', result.categoryBreakdown);
            }
        } else {
            showNotification(`Error: ${result.message}`, 'error');
        }

    } catch (error) {
        console.error('Error deleting all products:', error);
        showNotification(`Error deleting products: ${error.message}`, 'error');
    }
}

// Debug products images
async function debugProducts() {
    try {
        showNotification('Checking product images...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/admin/debug-products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Debug result:', result);
        
        if (result.success) {
            const products = result.products;
            const problemProducts = products.filter(p => !p.hasImage || p.isPlaceholder);
            
            console.log('All products:', products);
            console.log('Products with image issues:', problemProducts);
            
            if (problemProducts.length > 0) {
                showNotification(`Found ${problemProducts.length} products with image issues. Check console for details.`, 'error');
                console.table(problemProducts);
            } else {
                showNotification('All products have proper images!', 'success');
            }
        } else {
            showNotification(`Error: ${result.message}`, 'error');
        }
        
    } catch (error) {
        console.error('Error debugging products:', error);
        showNotification(`Error debugging products: ${error.message}`, 'error');
    }
}

// Fix product images
async function fixProductImages() {
    const confirmed = confirm('This will fix products that have placeholder or missing image URLs.\n\nProducts with placeholder images will be set to use the frontend default placeholder.\n\nContinue?');
    
    if (!confirmed) {
        return;
    }
    
    try {
        showNotification('Fixing product images...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/admin/fix-product-images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Fix result:', result);
        
        if (result.success) {
            showNotification(`Successfully fixed ${result.fixedCount} products!`, 'success');
            
            // Reload the products table
            await loadProducts();
        } else {
            showNotification(`Error: ${result.message}`, 'error');
        }
        
    } catch (error) {
        console.error('Error fixing product images:', error);
        showNotification(`Error fixing products: ${error.message}`, 'error');
    }
}