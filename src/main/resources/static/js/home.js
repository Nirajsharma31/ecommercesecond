// Home page specific functionality
document.addEventListener('DOMContentLoaded', function () {
    loadFeaturedProducts();
    loadCategoriesPreview();
    updateCartCount();
    checkAuthStatus();
});

// Scroll to products section
function scrollToProducts() {
    document.getElementById('featured-products').scrollIntoView({
        behavior: 'smooth'
    });
}

// Load featured products (limited)
async function loadFeaturedProducts() {
    try {
        console.log('Fetching products from:', `${API_BASE_URL}/products`);
        
        // First test if the API is reachable
        const healthResponse = await fetch(`${API_BASE_URL}/health`).catch(() => null);
        if (!healthResponse) {
            throw new Error('Server is not running. Please start the Spring Boot application.');
        }
        
        const response = await fetch(`${API_BASE_URL}/products`);
        console.log('Products response status:', response.status);
        console.log('Products response headers:', response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
        }
        
        const products = await response.json();
        console.log('Products loaded:', products);
        console.log('Number of products:', products.length);

        // Show only first 6 products as featured
        const featuredProducts = products.slice(0, 6);
        displayFeaturedProducts(featuredProducts);
    } catch (error) {
        console.error('Error loading featured products:', error);
        console.error('Error details:', error.message);
        
        let errorMessage = 'Failed to load products';
        if (error.message.includes('Server is not running')) {
            errorMessage = 'Server is not running. Please start the application with: mvnw spring-boot:run';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server. Make sure the Spring Boot app is running on port 8080.';
        } else {
            errorMessage = `Failed to load products: ${error.message}`;
        }
        
        document.getElementById('products-grid').innerHTML =
            `<div class="error-message" style="color: red; padding: 20px; text-align: center; border: 1px solid red; border-radius: 5px; margin: 20px;">
                <h3>⚠️ ${errorMessage}</h3>
                <p>Check the browser console (F12) for more details.</p>
                <button onclick="loadFeaturedProducts()" style="margin-top: 10px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Retry
                </button>
            </div>`;
    }
}

// Display featured products
function displayFeaturedProducts(products) {
    const productsGrid = document.getElementById('products-grid');

    if (!products || products.length === 0) {
        productsGrid.innerHTML = '<p class="loading">No featured products available</p>';
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
            <button class="add-to-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                Add to Cart
            </button>
        </div>
    `).join('');
}

// Load categories preview
async function loadCategoriesPreview() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const categories = await response.json();

        // Show only first 4 categories
        const previewCategories = categories.slice(0, 4);
        displayCategoriesPreview(previewCategories);
    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('categories-grid').innerHTML =
            '<div class="error-message">Failed to load categories</div>';
    }
}

// Display categories preview
function displayCategoriesPreview(categories) {
    const categoriesGrid = document.getElementById('categories-grid');

    if (!categories || categories.length === 0) {
        categoriesGrid.innerHTML = '<p class="loading">No categories available</p>';
        return;
    }

    categoriesGrid.innerHTML = categories.map(category => `
        <div class="category-card" onclick="window.location.href='categories.html'">
            <h3>${category.name}</h3>
            <p>${category.description || 'Explore products'}</p>
        </div>
    `).join('');
}