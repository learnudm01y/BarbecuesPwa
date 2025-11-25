// Menu Data
const menuItems = [
    {
        id: 1,
        name: "كباب حلبي",
        description: "كباب حلبي طازج مشوي على الفحم مع التوابل الخاصة",
        price: 45,
        category: "kabab",
        image: "images/1725890147_r6H6cQ.jpg"
    },
    {
        id: 2,
        name: "كباب مشكل",
        description: "تشكيلة متنوعة من الكباب والمشويات اللذيذة",
        price: 55,
        category: "kabab",
        image: "images/1725946614_TRBvLL.jpg"
    },
    {
        id: 3,
        name: "دجاج مشوي كامل",
        description: "دجاج طازج مشوي على الفحم مع صوص خاص",
        price: 50,
        category: "chicken",
        image: "images/53d1276e-74fd-46d2-9e69-a0bf8f02fca5.jpg"
    },
    {
        id: 4,
        name: "كباب عربي",
        description: "كباب بالطريقة العربية الأصيلة مع البهارات",
        price: 40,
        category: "kabab",
        image: "images/660.png-550x550.png.webp"
    },
    {
        id: 5,
        name: "صحن مشكل",
        description: "صحن مشويات متنوع مع الأرز والسلطة",
        price: 65,
        category: "mixed",
        image: "images/82b2ff44ea849a79d2674418aa85547e_5534d19d-636f-498f-b4d4-f606affb55d7.webp"
    },
    {
        id: 6,
        name: "صحن كباب خاص",
        description: "كباب مع أرز برياني وخضار مشوية",
        price: 60,
        category: "plates",
        image: "images/mmw_638955205646984466.jpg"
    },
    {
        id: 7,
        name: "مشويات دجاج مشكلة",
        description: "تشكيلة دجاج مشوي مع سلطة طازجة",
        price: 58,
        category: "chicken",
        image: "images/pngtree-chicken-mixed-grills-platter-with-salad-png-image_15071847.png"
    },
    {
        id: 8,
        name: "طبق العائلة الكبير",
        description: "طبق عائلي كبير يحتوي على جميع أنواع المشويات",
        price: 150,
        category: "plates",
        image: "images/1725946614_TRBvLL.jpg"
    }
];

// Cart Management
let cart = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadMenu('all');
    setupEventListeners();
    loadCartFromStorage();
});

// Load Menu Items
function loadMenu(category) {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';
    
    const filteredItems = category === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === category);
    
    filteredItems.forEach(item => {
        const itemCard = createMenuItemCard(item);
        container.appendChild(itemCard);
    });
}

// Create Menu Item Card
function createMenuItemCard(item) {
    const card = document.createElement('div');
    card.className = 'menu-item';
    card.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'%3E%3Crect fill=\\'%232d2d2d\\' width=\\'200\\' height=\\'200\\'/%3E%3Ctext fill=\\'%23d4af37\\' font-size=\\'18\\' x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'%3E${item.name}%3C/text%3E%3C/svg%3E'">
        <div class="item-info">
            <h3 class="item-name">${item.name}</h3>
            <p class="item-description">${item.description}</p>
            <div class="item-footer">
                <span class="item-price">${item.price} ريال</span>
                <button class="add-btn" onclick="addToCart(${item.id})">
                    إضافة +
                </button>
            </div>
        </div>
    `;
    
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('add-btn')) {
            showItemDetail(item);
        }
    });
    
    return card;
}

// Add to Cart
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const existingItem = cart.find(i => i.id === itemId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({...item, quantity: 1});
    }
    
    updateCart();
    showNotification('تمت الإضافة للسلة ✓');
}

// Update Cart
function updateCart() {
    const countElement = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElement.textContent = totalItems;
    
    if (totalItems > 0) {
        countElement.style.display = 'flex';
    } else {
        countElement.style.display = 'none';
    }
    
    saveCartToStorage();
}

// Show Cart
function showCart() {
    const modal = document.getElementById('cartModal');
    const cartItemsContainer = document.getElementById('cartItems');
    const totalPriceElement = document.getElementById('totalPrice');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">السلة فارغة</p>';
        totalPriceElement.textContent = '0 ريال';
    } else {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.price} ريال × ${item.quantity} = ${itemTotal} ريال</p>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" onclick="decreaseQuantity(${item.id})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="increaseQuantity(${item.id})">+</button>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        totalPriceElement.textContent = `${total} ريال`;
    }
    
    modal.classList.add('active');
}

// Increase/Decrease Quantity
function increaseQuantity(itemId) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity++;
        updateCart();
        showCart();
    }
}

function decreaseQuantity(itemId) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity--;
        if (item.quantity === 0) {
            cart = cart.filter(i => i.id !== itemId);
        }
        updateCart();
        showCart();
    }
}

// Show Item Detail
function showItemDetail(item) {
    const modal = document.getElementById('itemModal');
    const detailsContainer = document.getElementById('itemDetails');
    
    detailsContainer.innerHTML = `
        <div class="item-detail">
            <img src="${item.image}" alt="${item.name}" class="item-detail-image" onerror="this.style.display='none'">
            <h2>${item.name}</h2>
            <p>${item.description}</p>
            <div class="item-price">${item.price} ريال</div>
            <button class="add-btn" onclick="addToCart(${item.id}); closeModal('itemModal');" style="padding: 15px 40px; font-size: 1.1em;">
                إضافة للسلة +
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

// Close Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('السلة فارغة!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderSummary = cart.map(item => 
        `${item.name} × ${item.quantity}`
    ).join('\n');
    
    const message = `طلب جديد من منيو مشويات الكباب:\n\n${orderSummary}\n\nالإجمالي: ${total} ريال`;
    
    // In a real app, this would send to a server
    alert(message + '\n\nشكراً لطلبك! سيتم التواصل معك قريباً.');
    
    cart = [];
    updateCart();
    closeModal('cartModal');
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #d4af37 0%, #c9a02c 100%);
        color: #1e1e1e;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(212, 175, 55, 0.5);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Local Storage
function saveCartToStorage() {
    localStorage.setItem('kabab-cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('kabab-cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadMenu(btn.dataset.category);
        });
    });
    
    // Cart Button
    document.getElementById('cartBtn').addEventListener('click', showCart);
    
    // Close Cart Modal
    document.getElementById('closeCart').addEventListener('click', () => closeModal('cartModal'));
    
    // Close Item Modal
    document.getElementById('closeItem').addEventListener('click', () => closeModal('itemModal'));
    
    // Checkout Button
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
    
    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);