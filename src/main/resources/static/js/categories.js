// Categories page functionality
let allCategories = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    updateCartCount();
    checkAuthStatus();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('back-to-categories').addEventListener('click', showCategories);
}

// Load all categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        allCategories = await response.json();
        displayCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('categories-grid').innerHTML = 
            '<div class="error-message">Failed to load categories</div>';
    }
}

// Display categories
function displayCategories() {
    const categoriesGrid = document.getElementById('categories-grid');
    
    if (!allCategories || allCategories.length === 0) {
        categoriesGrid.innerHTML = '<div class="error-message">No categories available</div>';
        return;
    }

    categoriesGrid.innerHTML = allCategories.map(category => `
        <div class="category-card-large" onclick="showCategoryProducts(${category.id}, '${category.name}')">
            <h3>${category.name}</h3>
            <p>${category.description || 'Explore our products in this category'}</p>
            <div class="category-stats">
                <small>Click to view products</small>
            </div>
        </div>
    `).join('');
}

// Show products for selected category
async function showCategoryProducts(categoryId, categoryName) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}`);
        const products = await response.json();
        
        // Hide categories grid and show products
        document.getElementById('categories-grid').style.display = 'none';
        document.getElementById('category-products').style.display = 'block';
        document.getElementById('selected-category-name').textContent = `${categoryName} Products`;
        
        displayCategoryProducts(products);
    } catch (error) {
        console.error('Error loading category products:', error);
        alert('Failed to load products for this category');
    }
}

// Display products for category
function displayCategoryProducts(products) {
    const productsGrid = document.getElementById('category-products-grid');
    
    if (!products || products.length === 0) {
        productsGrid.innerHTML = '<div class="error-message">No products found in this category</div>';
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.imageUrl || 'https://via.placeholder.com/300x200'}" 
                     alt="${product.name}"
                     onerror="this.src='https://via.placeholder.com/300x200'">
            </div>
            <h3>${product.name}</h3>
            <p>${product.description || 'No description available'}</p>
            <div class="product-price">$${product.price}</div>
            <div class="product-stock">Stock: ${product.stockQuantity || 0}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price})"
                    ${(product.stockQuantity || 0) === 0 ? 'disabled' : ''}>
                ${(product.stockQuantity || 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
        </div>
    `).join('');
}

// Show categories (back button)
function showCategories() {
    document.getElementById('categories-grid').style.display = 'grid';
    document.getElementById('category-products').style.display = 'none';
}