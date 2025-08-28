// Products page functionality
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;

document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
    loadCategories();
    updateCartCount();
    checkAuthStatus();
    setupEventListeners();
});

function setupEventListeners() {
    // Search functionality
    document.getElementById('search-btn').addEventListener('click', searchProducts);
    document.getElementById('search-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });

    // Filter functionality
    document.getElementById('category-filter').addEventListener('change', filterProducts);
    document.getElementById('price-filter').addEventListener('change', filterProducts);
    document.getElementById('sort-filter').addEventListener('change', sortProducts);

    // Modal functionality
    const modal = document.getElementById('product-modal');
    const closeBtn = modal.querySelector('.close');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Load all products
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        displayProducts();
        setupPagination();
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('products-grid').innerHTML =
            '<div class="error-message">Failed to load products</div>';
    }
}

// Load categories for filter
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const categories = await response.json();

        const categoryFilter = document.getElementById('category-filter');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Display products with pagination
function displayProducts() {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    const productsGrid = document.getElementById('products-grid');

    if (productsToShow.length === 0) {
        productsGrid.innerHTML = '<div class="error-message">No products found</div>';
        return;
    }

    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card">
            <div class="product-image" onclick="openProductModal(${product.id})">
                <img src="${product.imageUrl || `data:image/svg+xml;charset=UTF-8,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E`}" 
                     alt="${product.name}"
                     onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg width=\\'300\\' height=\\'200\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Crect width=\\'300\\' height=\\'200\\' fill=\\'%23f5f5f5\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' font-family=\\'Arial\\' font-size=\\'16\\' fill=\\'%23999\\' text-anchor=\\'middle\\' dy=\\'.3em\\'%3ENo Image%3C/text%3E%3C/svg%3E'">
            </div>
            <h3 onclick="openProductModal(${product.id})">${product.name}</h3>
            <p>${product.description || 'No description available'}</p>
            <div class="product-price">$${product.price}</div>
            <div class="product-stock">Stock: ${product.stockQuantity || 0}</div>
            <button class="add-to-cart" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}"
                    ${(product.stockQuantity || 0) === 0 ? 'disabled' : ''}>
                ${(product.stockQuantity || 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
        </div>
    `).join('');

    // Add event listeners to add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function () {
            if (!this.disabled) {
                const productId = parseInt(this.dataset.productId);
                const productName = this.dataset.productName;
                const productPrice = parseFloat(this.dataset.productPrice);
                addToCart(productId, productName, productPrice);
            }
        });
    });
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    if (searchTerm.trim() === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            (product.brand && product.brand.toLowerCase().includes(searchTerm))
        );
    }

    currentPage = 1;
    displayProducts();
    setupPagination();
}

// Filter products
function filterProducts() {
    const categoryFilter = document.getElementById('category-filter').value;
    const priceFilter = document.getElementById('price-filter').value;

    filteredProducts = allProducts.filter(product => {
        let matchesCategory = true;
        let matchesPrice = true;

        if (categoryFilter) {
            matchesCategory = product.category && product.category.id == categoryFilter;
        }

        if (priceFilter) {
            const price = parseFloat(product.price);
            switch (priceFilter) {
                case '0-50':
                    matchesPrice = price >= 0 && price <= 50;
                    break;
                case '50-100':
                    matchesPrice = price > 50 && price <= 100;
                    break;
                case '100-200':
                    matchesPrice = price > 100 && price <= 200;
                    break;
                case '200+':
                    matchesPrice = price > 200;
                    break;
            }
        }

        return matchesCategory && matchesPrice;
    });

    currentPage = 1;
    displayProducts();
    setupPagination();
}

// Sort products
function sortProducts() {
    const sortOption = document.getElementById('sort-filter').value;

    switch (sortOption) {
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-asc':
            filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
    }

    displayProducts();
}

// Setup pagination
function setupPagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const paginationContainer = document.getElementById('pagination');

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="changePage(${currentPage - 1})">Previous</button>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
        }
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changePage(${currentPage + 1})">Next</button>`;
    }

    paginationContainer.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    currentPage = page;
    displayProducts();
    setupPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Open product modal
function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('modal-product-image').src = product.imageUrl || `data:image/svg+xml;charset=UTF-8,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='300' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image Available%3C/text%3E%3C/svg%3E`;
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-description').textContent = product.description || 'No description available';
    document.getElementById('modal-product-price').textContent = `$${product.price}`;
    document.getElementById('modal-product-brand').textContent = product.brand ? `Brand: ${product.brand}` : '';
    document.getElementById('modal-product-stock').textContent = `Stock: ${product.stockQuantity || 0}`;

    const addToCartBtn = document.getElementById('modal-add-to-cart');
    addToCartBtn.onclick = () => {
        const quantity = parseInt(document.getElementById('quantity').value);
        addToCart(product.id, product.name, product.price, quantity);
    };

    if ((product.stockQuantity || 0) === 0) {
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = 'Out of Stock';
    } else {
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = 'Add to Cart';
    }

    document.getElementById('product-modal').style.display = 'block';
}