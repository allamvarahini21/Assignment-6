// Shared functions between pages
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the products page
    if (document.getElementById('productsGrid')) {
        initProductsPage();
    }
    
    // Check if we're on the home page
    if (document.getElementById('featuredProducts')) {
        initHomePage();
    }
    
    // Initialize cart count
    updateCartCount();
});

function initHomePage() {
    // Load featured products for home page
    fetch('https://dummyjson.com/products?limit=6')
        .then(res => res.json())
        .then(data => {
            const productsContainer = document.getElementById('featuredProducts');
            productsContainer.innerHTML = '';
            
            data.products.forEach((product, index) => {
                const productCard = createProductCard(product, index);
                productsContainer.appendChild(productCard);
                
                // Add animation delay for staggered effect
                productCard.style.animationDelay = `${index * 0.1}s`;
            });
        });
}

function initProductsPage() {
    // Get category from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'all';
    
    // Update page title and breadcrumb based on category
    updateCategoryDisplay(category);
    
    // Set the category filter dropdown
    document.getElementById('category').value = category;
    
    // Load all products initially (will be filtered by category)
    fetch('https://dummyjson.com/products')
        .then(res => res.json())
        .then(data => {
            window.allProducts = data.products; // Store for filtering
            filterAndDisplayProducts(category);
            
            // Set up event listeners for filters
            document.getElementById('category').addEventListener('change', function() {
                filterAndDisplayProducts(this.value);
                updateCategoryDisplay(this.value);
                updateUrlParameter('category', this.value);
            });
            
            document.getElementById('sort').addEventListener('change', function() {
                filterAndDisplayProducts(category, this.value);
            });
        });
}

function filterAndDisplayProducts(category, sortOption = 'default') {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
    // Filter by category
    let filteredProducts = category === 'all' 
        ? [...window.allProducts] 
        : window.allProducts.filter(product => 
            product.category.toLowerCase().includes(category.toLowerCase())
        );
    
    // Sort products
    filteredProducts = sortProducts(filteredProducts, sortOption);
    
    // Display products
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <p>No products found in this category</p>
                <a href="products.html" class="btn">View All Products</a>
            </div>
        `;
    } else {
        filteredProducts.forEach((product, index) => {
            const productCard = createProductCard(product, index);
            productsGrid.appendChild(productCard);
        });
    }
}

function sortProducts(products, sortOption) {
    switch(sortOption) {
        case 'price-asc':
            return [...products].sort((a, b) => a.price - b.price);
        case 'price-desc':
            return [...products].sort((a, b) => b.price - a.price);
        case 'name-asc':
            return [...products].sort((a, b) => a.title.localeCompare(b.title));
        case 'name-desc':
            return [...products].sort((a, b) => b.title.localeCompare(a.title));
        default:
            return products;
    }
}

function updateCategoryDisplay(category) {
    if (category === 'all') return;
    
    const pageTitle = document.getElementById('pageTitle');
    const breadcrumb = document.getElementById('breadcrumbCategory');
    
    const categoryMap = {
        'electronics': 'Electronics',
        'fashion': 'Fashion',
        'home': 'Home & Kitchen'
    };
    
    if (categoryMap[category]) {
        pageTitle.textContent = categoryMap[category];
        breadcrumb.textContent = categoryMap[category];
    }
}

function updateUrlParameter(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
}

function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card scale-up';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const discountBadge = product.discountPercentage > 0 ? 
        `<div class="discount-badge">${Math.round(product.discountPercentage)}% OFF</div>` : '';
    
    const stars = createStarRating(product.rating);
    
    card.innerHTML = `
        ${discountBadge}
        <img src="${product.thumbnail}" alt="${product.title}" class="product-image hover-zoom">
        <div class="product-content">
            <h3 class="product-title">${product.title}</h3>
            <span class="product-brand">${product.brand}</span>
            <p class="product-description">${product.description}</p>
            <div class="rating">
                ${stars}
                <div class="rating-count">${product.rating}/5</div>
            </div>
            <div class="price-section">
                <span class="product-price">$${product.price}</span>
                ${product.discountPercentage > 0 ? 
                    `<span class="original-price">$${Math.round(product.price / (1 - product.discountPercentage/100))}</span>` : ''}
            </div>
            <button class="btn btn-primary add-to-cart" data-id="${product.id}">Add to Cart</button>
        </div>
    `;
    
    return card;
}

function createStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return `<div class="rating-stars">${stars}</div>`;
}

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = window.allProducts.find(p => p.id == productId);
    
    if (product) {
        const existingItem = cart.find(item => item.id == productId);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
    });
}

// Add to cart functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
        const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
        const productId = button.getAttribute('data-id');
        addToCart(productId);
        animateCartButton(button);
    }
});

function animateCartButton(button) {
    button.innerHTML = '<i class="fas fa-check"></i> Added';
    button.style.backgroundColor = 'var(--success)';
    
    setTimeout(() => {
        button.innerHTML = 'Add to Cart';
        button.style.backgroundColor = 'var(--primary)';
    }, 1500);
    
    // Update cart count animation
    const cartCount = document.querySelector('.cart-count');
    cartCount.classList.add('bounce');
    setTimeout(() => cartCount.classList.remove('bounce'), 1000);
}
// Load featured products on index page
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('featuredProducts')) {
        fetch('https://dummyjson.com/products?limit=6')
            .then(res => res.json())
            .then(data => {
                const container = document.getElementById('featuredProducts');
                container.innerHTML = '';
                
                data.products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.innerHTML = `
                        <a href="product-details.html?id=${product.id}">
                            <img src="${product.thumbnail}" alt="${product.title}">
                            <h3>${product.title}</h3>
                            <p>$${product.price}</p>
                        </a>
                        <button class="btn add-to-cart" data-id="${product.id}">Add to Cart</button>
                    `;
                    container.appendChild(productCard);
                });
            });
    }
});