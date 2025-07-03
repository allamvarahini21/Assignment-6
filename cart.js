document.addEventListener('DOMContentLoaded', function() {
    // Load cart items
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cartItems');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('cartTotal');
    
    if (cartItems.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart slide-up">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="products.html" class="btn pulse">Continue Shopping</a>
            </div>
        `;
    } else {
        renderCartItems(cartItems);
        updateCartSummary(cartItems);
    }
    
    // Quantity change handlers
    cartContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn')) {
            const itemId = e.target.closest('.cart-item').dataset.id;
            const isIncrease = e.target.classList.contains('increase');
            updateQuantity(itemId, isIncrease);
        }
        
        if (e.target.classList.contains('cart-remove')) {
            const itemId = e.target.closest('.cart-item').dataset.id;
            removeItem(itemId);
        }
    });
    
    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        setTimeout(() => {
            alert('Checkout completed!');
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
        }, 1500);
    });
    
    function renderCartItems(items) {
        cartContainer.innerHTML = '';
        
        items.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item slide-up';
            cartItem.dataset.id = item.id;
            
            cartItem.innerHTML = `
                <div class="cart-product">
                    <img src="${item.thumbnail}" alt="${item.title}">
                    <div class="cart-product-info">
                        <h4>${item.title}</h4>
                        <p>${item.brand}</p>
                    </div>
                </div>
                <div class="cart-price">$${item.price}</div>
                <div class="cart-quantity">
                    <button class="quantity-btn decrease">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                    <button class="quantity-btn increase">+</button>
                </div>
                <div class="cart-total">$${(item.price * item.quantity).toFixed(2)}</div>
                <div class="cart-remove"><i class="fas fa-times"></i></div>
            `;
            
            cartContainer.appendChild(cartItem);
        });
    }
    
    function updateQuantity(itemId, isIncrease) {
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        const itemIndex = cartItems.findIndex(item => item.id == itemId);
        
        if (itemIndex !== -1) {
            if (isIncrease) {
                cartItems[itemIndex].quantity++;
            } else {
                if (cartItems[itemIndex].quantity > 1) {
                    cartItems[itemIndex].quantity--;
                }
            }
            
            localStorage.setItem('cart', JSON.stringify(cartItems));
            renderCartItems(cartItems);
            updateCartSummary(cartItems);
            
            // Add animation to the changed quantity
            const quantityInput = document.querySelector(`.cart-item[data-id="${itemId}"] .quantity-input`);
            quantityInput.classList.add('bounce');
            setTimeout(() => quantityInput.classList.remove('bounce'), 300);
        }
    }
    
    function removeItem(itemId) {
        let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        cartItems = cartItems.filter(item => item.id != itemId);
        
        localStorage.setItem('cart', JSON.stringify(cartItems));
        
        if (cartItems.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart fade-in">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="products.html" class="btn">Continue Shopping</a>
                </div>
            `;
            updateCartSummary([]);
        } else {
            renderCartItems(cartItems);
            updateCartSummary(cartItems);
        }
        
        // Update cart count in header
        const cartCount = document.querySelector('.cart-count');
        cartCount.textContent = cartItems.reduce((total, item) => total + item.quantity, 0);
    }
    
    function updateCartSummary(items) {
        const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 ? 0 : 5;
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + shipping + tax;
        
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        shippingElement.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
        taxElement.textContent = `$${tax.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;
        
        // Animate total change
        totalElement.classList.add('pulse');
        setTimeout(() => totalElement.classList.remove('pulse'), 500);
    }
});