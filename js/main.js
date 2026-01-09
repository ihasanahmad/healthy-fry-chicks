// ===================================
// HEALTHY FRY CHICKS - MAIN JAVASCRIPT
// ===================================

// ========== GLOBAL STATE ==========
let cart = JSON.parse(localStorage.getItem('hfc_cart')) || [];

// ========== DOM ELEMENTS ==========
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

// ========== INITIALIZATION ==========
function initializeApp() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');

            // Animate hamburger icon
            const spans = mobileMenuToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translateY(8px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Header scroll effect
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Category tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            filterProducts(category);

            // Update active tab
            categoryTabs.forEach(t => {
                t.classList.remove('btn-primary', 'active');
                t.classList.add('btn-secondary');
            });
            tab.classList.remove('btn-secondary');
            tab.classList.add('btn-primary', 'active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }

                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe animated elements
    document.querySelectorAll('.animate-fade-in-up, .animate-slide-in-left, .animate-slide-in-right').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // Update cart count
    updateCartCount();
}

// ========== PRODUCT FILTERING ==========
function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');

    products.forEach(product => {
        if (category === 'all' || product.dataset.category.includes(category)) {
            product.style.display = 'block';
            // Re-trigger animation
            product.style.animation = 'none';
            setTimeout(() => {
                product.style.animation = '';
            }, 10);
        } else {
            product.style.display = 'none';
        }
    });
}

// ========== SHOPPING CART ==========
function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }

    localStorage.setItem('hfc_cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    showNotification(`${productName} added to cart!`, 'success');
}

function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    localStorage.setItem('hfc_cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    showNotification('Item removed from cart', 'info');
}

function updateQuantity(productName, change) {
    const item = cart.find(item => item.name === productName);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productName);
        } else {
            localStorage.setItem('hfc_cart', JSON.stringify(cart));
            updateCartDisplay();
            updateCartCount();
        }
    }
}

function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartBadges = document.querySelectorAll('.cart-count, .cart-badge');

    cartBadges.forEach(badge => {
        badge.textContent = cartCount;
        if (cartCount > 0) {
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function openCartModal() {
    updateCartDisplay();
    document.getElementById('cartModal').classList.add('active');
    document.getElementById('cartBackdrop').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    document.getElementById('cartModal').classList.remove('active');
    document.getElementById('cartBackdrop').classList.remove('active');
    document.body.style.overflow = '';
}

function updateCartDisplay() {
    const cartBody = document.getElementById('cartBody');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartBody.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <p style="font-size: var(--font-size-sm);">Add some delicious items!</p>
            </div>
        `;
        cartTotal.textContent = 'Rs. 0';
        return;
    }

    cartBody.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">Rs. ${item.price.toLocaleString()}</div>
                <div class="cart-item-controls">
                    <button class="cart-qty-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                    <span class="cart-qty-display">${item.quantity}</span>
                    <button class="cart-qty-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.name}')" title="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    cartTotal.textContent = `Rs. ${getCartTotal().toLocaleString()}`;
}

// ========== ORDER MODAL ==========
function showOrderModal() {
    if (cart.length === 0) {
        showNotification('Your cart is empty! Add some items first.', 'warning');
        return;
    }

    // Generate order message for WhatsApp
    let orderMessage = '🛒 *New Order from HFC Website*\n\n';
    orderMessage += '*Order Details:*\n';

    cart.forEach((item, index) => {
        orderMessage += `${index + 1}. ${item.name}\n`;
        orderMessage += `   Quantity: ${item.quantity}\n`;
        orderMessage += `   Price: Rs. ${item.price * item.quantity}\n\n`;
    });

    orderMessage += `*Total: Rs. ${getCartTotal()}*\n\n`;
    orderMessage += 'Please confirm my order!';

    const whatsappUrl = `https://wa.me/923343301111?text=${encodeURIComponent(orderMessage)}`;
    window.open(whatsappUrl, '_blank');

    // Close cart modal
    closeCartModal();
}

// ========== FORMS ==========
function handleQuickOrder(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const name = formData.get('name') || form.querySelector('input[type="text"]').value;
    const phone = formData.get('phone') || form.querySelectorAll('input')[1].value;
    const order = formData.get('order') || form.querySelector('textarea').value;

    const message = `🍗 *Quick Order*\n\nName: ${name}\nPhone: ${phone}\n\nOrder:\n${order}`;
    const whatsappUrl = `https://wa.me/923343301111?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
    form.reset();
    showNotification('Redirecting to WhatsApp...', 'success');
}

function handleNewsletter(event) {
    event.preventDefault();

    const email = event.target.querySelector('input[type="email"]').value;

    // In a real app, you'd send this to a server
    console.log('Newsletter subscription:', email);

    showNotification('Thank you for subscribing! 🎉', 'success');
    event.target.reset();
}

function handleContactForm(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const name = formData.get('name') || form.querySelector('input[name="name"]').value;
    const email = formData.get('email') || form.querySelector('input[name="email"]').value;
    const phone = formData.get('phone') || form.querySelector('input[name="phone"]').value;
    const message = formData.get('message') || form.querySelector('textarea[name="message"]').value;

    const whatsappMessage = `📧 *Contact Form Message*\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`;
    const whatsappUrl = `https://wa.me/923343301111?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(whatsappUrl, '_blank');
    form.reset();
    showNotification('Message sent! We\'ll contact you soon.', 'success');
}

// ========== NOTIFICATIONS ==========
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'var(--color-accent)' : type === 'warning' ? 'var(--color-warning)' : 'var(--color-info)'};
        color: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        max-width: 350px;
    `;

    const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠' : 'ℹ';
    notification.innerHTML = `<span style="font-size: 20px;">${icon}</span><span>${message}</span>`;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add slideInRight and slideOutRight animations to CSS dynamically
if (!document.getElementById('notification-animations')) {
    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ========== UTILITY FUNCTIONS ==========
function formatCurrency(amount) {
    return `Rs. ${amount.toLocaleString()}`;
}

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;
window.showOrderModal = showOrderModal;
window.handleQuickOrder = handleQuickOrder;
window.handleNewsletter = handleNewsletter;
window.handleContactForm = handleContactForm;

