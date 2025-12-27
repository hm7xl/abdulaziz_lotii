// cart.js
// هذا الملف يحتوي على جميع وظائف عربة التسوق (الإضافة، الحفظ، العرض، الحساب)

const SHIPPING_COST = 2.00; // تكلفة الشحن الثابتة في الكويت

// 1. وظيفة رئيسية: إضافة منتج إلى العربة (تُستدعى من product-detail.html)
function addToCart(item) {
    // 1.1 جلب العربة الحالية من التخزين المحلي (localStorage)
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // إنشاء معرف فريد يجمع بين اللون والحجم لتحديد المنتج
    const itemId = item.id;

    // 1.2 البحث عما إذا كان المنتج موجوداً بالفعل (بنفس اللون والحجم)
    const existingItemIndex = cart.findIndex(cartItem => 
        cartItem.id === itemId
    );

    if (existingItemIndex > -1) {
        // إذا كان موجوداً: زيادة الكمية فقط
        cart[existingItemIndex].quantity += item.quantity;
    } else {
        // إذا لم يكن موجوداً: إضافة المنتج الجديد
        cart.push(item);
    }

    // 1.3 حفظ العربة المحدثة
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    
    // 1.4 تحديث العداد في الـ Header
    updateCartCount();
}


// 2. وظيفة تحديث العداد في الـ Header (يجب استدعاؤها في كل صفحة)
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    // حساب إجمالي عدد القطع
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    // البحث عن جميع عدادات العربة وتحديثها
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        // إظهار/إخفاء العداد
        element.style.display = totalItems > 0 ? 'inline-block' : 'none';
    });
}


// ----------------------------------------------------
// وظائف خاصة بصفحة cart.html (العرض والتفاعل)
// ----------------------------------------------------

// 3. وظيفة عرض المنتجات في صفحة cart.html
function renderCartItems() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const cartListElement = document.getElementById('cartItemsList');
    
    if (!cartListElement) return; // الخروج إذا لم يكن العنصر موجوداً (أي نحن لسنا في cart.html)
    
    // مسح المحتوى الحالي
    cartListElement.innerHTML = ''; 

    if (cart.length === 0) {
        // عرض رسالة إذا كانت العربة فارغة
        cartListElement.innerHTML = `
            <div class="cart-empty" style="text-align: center; padding: 40px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff;">
                <h3>Your cart is empty.</h3>
                <p>Continue shopping to find your perfect scrub set!</p>
                <a href="ourshop.html" style="color: #008080; font-weight: bold; text-decoration: none;">Go to Shop</a>
            </div>
        `;
        calculateCartTotal(); // حساب الإجمالي (صفر)
        return;
    }

    // بناء واجهة المنتج لكل عنصر في العربة
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const itemHTML = `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="item-img">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-color">Color: ${item.color.toUpperCase()} | Size: ${item.size}</p>
                    <p>Unit Price: ${item.price.toFixed(2)} KWD</p>
                </div>
                
                <div class="item-quantity">
                    <button class="qty-btn change-qty-btn" data-id="${item.id}" data-action="minus">-</button>
                    <input type="number" value="${item.quantity}" min="1" class="qty-input" data-id="${item.id}">
                    <button class="qty-btn change-qty-btn" data-id="${item.id}" data-action="plus">+</button>
                </div>
                
                <div class="item-price-section">
                    <span class="item-price">${itemTotal.toFixed(2)} KWD</span>
                    <button class="remove-item-btn" data-id="${item.id}">Remove</button>
                </div>
            </div>
        `;
        cartListElement.insertAdjacentHTML('beforeend', itemHTML);
    });
    
    // استدعاء وظيفة الحساب بعد عرض المنتجات
    calculateCartTotal();

    // ربط وظائف التفاعل (الكمية والحذف)
    bindCartEventListeners();
}

// 4. وظيفة حساب وعرض إجمالي الطلب
function calculateCartTotal() {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const shipping = cart.length > 0 ? SHIPPING_COST : 0;
    const total = subtotal + shipping;
    
    // تحديث قيم الملخص في cart.html
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping-cost');
    const totalElement = document.getElementById('total-price');
    const checkoutBtn = document.querySelector('.checkout-btn');

    if (subtotalElement) subtotalElement.textContent = subtotal.toFixed(2) + ' KWD';
    if (shippingElement) shippingElement.textContent = shipping.toFixed(2) + ' KWD';
    if (totalElement) totalElement.textContent = total.toFixed(2) + ' KWD';
    
    // تفعيل زر الدفع
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

// 5. وظيفة حذف منتج من العربة
function removeItemFromCart(itemId) {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    
    // تحديث كل شيء
    updateCartCount();
    renderCartItems();
}

// 6. وظيفة تغيير كمية المنتج
function changeQuantity(itemId, action) {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const itemIndex = cart.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
        if (action === 'plus') {
            cart[itemIndex].quantity += 1;
        } else if (action === 'minus' && cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else if (action === 'manual') {
             // معالجة الإدخال اليدوي
             const inputElement = document.querySelector(`.qty-input[data-id="${itemId}"]`);
             let newQty = parseFloat(inputElement.value);
             
             if (isNaN(newQty) || newQty < 1) {
                 newQty = 1; 
             }
             
             cart[itemIndex].quantity = newQty;
        }
        
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        
        // تحديث كل شيء
        updateCartCount();
        renderCartItems();
    }
}

// 7. ربط وظائف التفاعل (الحذف وتغيير الكمية)
function bindCartEventListeners() {
    // ربط زر الحذف
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            removeItemFromCart(e.target.dataset.id);
        });
    });

    // ربط أزرار الزيادة والنقصان
    document.querySelectorAll('.change-qty-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            changeQuantity(e.target.dataset.id, e.target.dataset.action);
        });
    });
    
    // ربط حقل الإدخال اليدوي
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', (e) => {
            changeQuantity(e.target.dataset.id, 'manual');
        });
    });
}

// 8. استدعاء وظيفة تحديث العداد عند تحميل كل صفحة
document.addEventListener('DOMContentLoaded', updateCartCount);

// 9. استدعاء وظيفة العرض عند تحميل صفحة cart.html فقط
if (window.location.pathname.includes('cart.html')) {
    document.addEventListener('DOMContentLoaded', renderCartItems);
}