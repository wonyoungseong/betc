// 장바구니 관리

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// 장바구니에 추가
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const cartItem = {
        userId: window.currentUser ? window.currentUser.username : 'guest',
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1
    };

    const existingItemIndex = cart.findIndex(item => 
        item.userId === cartItem.userId && item.productId === cartItem.productId
    );

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    if (confirm('장바구니에 추가되었습니다. 장바구니 페이지로 이동하시겠습니까?')) {
        window.location.href = 'cart.html';
    }

    // GTM 이벤트 전송
    dataLayer.push({
        'event': 'add_to_cart',
        'ecommerce': {
            'items': [{
                'item_id': product.id,
                'item_name': product.name,
                'price': product.price
            }]
        }
    });
}

// 바로 구매
function buyNow(productId) {
    addToCart(productId);
    window.location.href = 'checkout.html';
}

// 장바구니 아이템 로드
function loadCartItems() {
    const cartDiv = document.getElementById('cartItems');
    if (!cartDiv) return;
    cartDiv.innerHTML = '';
    
    const currentUserId = window.currentUser ? window.currentUser.username : 'guest';
    const userCart = cart.filter(item => item.userId === currentUserId);

    if (userCart.length === 0) {
        cartDiv.innerHTML = '<p>장바구니가 비어 있습니다.</p>';
        updateTotalPrice(0);
        return;
    }

    let totalPrice = 0;
    let totalQuantity = 0;
    userCart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        totalQuantity += item.quantity;
        div.innerHTML = `
            <div class="item-name">${item.productName}</div>
            <div class="item-price">금액: ₩${item.price.toLocaleString()}</div>
            <div class="item-quantity">수량: <input type="number" value="${item.quantity}" min="1" onchange="updateCartItemQuantity(${item.productId}, this.value)"></div>
            <div class="item-total">소계: ₩${itemTotal.toLocaleString()}</div>
            <button onclick="removeFromCart(${item.productId})" class="remove-button">삭제</button>
        `;
        cartDiv.appendChild(div);
    });

    updateTotalPrice(totalPrice, totalQuantity);
}

// 체크아웃 시작
function beginCheckout() {
    if (cart.length === 0) {
        alert('장바구니가 비어 있습니다.');
        return;
    }
    // GTM 이벤트 전송
    dataLayer.push({
        'event': 'begin_checkout',
        'ecommerce': {
            'items': cart.map(item => ({
                'item_id': item.id,
                'item_name': item.name,
                'price': item.price,
                'quantity': item.quantity
            }))
        }
    });
    window.location.href = 'checkout.html';
}

// 구매 완료 처리
window.completePurchase = function(event) { 
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    if (!name || !address || !phone || !email) {
        alert('모든 필수 정보를 입력해주세요.');
        return;
    }

    // 여기에 실제 결제 처리 로직을 추가할 수 있습니다.

    // 구매 내역 저장
    const currentUserId = window.currentUser ? window.currentUser.username : 'guest';
    const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    const newPurchase = {
        id: Date.now(),
        userId: currentUserId,
        items: cart.filter(item => item.userId === currentUserId),
        totalAmount: calculateTotalPrice(),
        date: new Date().toISOString(),
        shippingInfo: { name, address, phone, email, message }
    };
    purchaseHistory.push(newPurchase);
    localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));

    // 장바구니 비우기
    cart = cart.filter(item => item.userId !== currentUserId);
    localStorage.setItem('cart', JSON.stringify(cart));

    // GTM 이벤트 전송
    dataLayer.push({
        'event': 'purchase',
        'ecommerce': {
            'purchase': {
                'actionField': {
                    'id': newPurchase.id,
                    'revenue': newPurchase.totalAmount
                },
                'products': newPurchase.items.map(item => ({
                    'name': item.productName,
                    'id': item.productId,
                    'price': item.price,
                    'quantity': item.quantity
                }))
            }
        }
    });

    // 결제 완료 페이지로 이동
    window.location.href = 'purchase.html';
}

// 장바구니에서 제품 제거
function removeFromCart(productId) {
    const currentUserId = window.currentUser ? window.currentUser.username : 'guest';
    cart = cart.filter(item => !(item.userId === currentUserId && item.productId === productId));
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartItems();
}

function loadOrderSummary() {
    const summaryDiv = document.getElementById('orderSummary');
    const totalPriceDiv = document.getElementById('totalPrice');
    if (!summaryDiv || !totalPriceDiv) return;

    const currentUserId = window.currentUser ? window.currentUser.username : 'guest';
    const userCart = cart.filter(item => item.userId === currentUserId);

    if (userCart.length === 0) {
        summaryDiv.innerHTML = '<p>장바구니가 비어 있습니다.</p>';
        totalPriceDiv.innerHTML = '0원';
        return;
    }

    let totalAmount = 0;
    let summaryHTML = '<ul class="order-items">';

    userCart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        summaryHTML += `
            <li class="order-item">
                <span>${item.productName}</span>
                <span>${item.quantity}개</span>
                <span>₩${itemTotal.toLocaleString()}</span>
            </li>
        `;
    });

    summaryHTML += '</ul>';
    summaryDiv.innerHTML = summaryHTML;
    totalPriceDiv.innerHTML = `₩${totalAmount.toLocaleString()}`;

    const checkoutButton = document.querySelector('.checkout-button');
    if (checkoutButton) {
        checkoutButton.textContent = `₩${totalAmount.toLocaleString()} 결제하기`;
    }
}

window.addToCartWithQuantity = function(productId) {
    const product = window.products.find(p => p.id === productId);
    if (!product) return;
    
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    
    const cartItem = {
        userId: window.currentUser ? window.currentUser.username : 'guest',
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: quantity
    };

    const existingItemIndex = cart.findIndex(item => 
        item.userId === cartItem.userId && item.productId === cartItem.productId
    );

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    if (confirm('장바구니에 추가되었습니다. 장바구니 페이지로 이동하시겠습니까?')) {
        window.location.href = 'cart.html';
    }

    // GTM 이벤트 전송
    dataLayer.push({
        'event': 'add_to_cart',
        'ecommerce': {
            'items': [{
                'item_id': product.id,
                'item_name': product.name,
                'price': product.price,
                'quantity': quantity
            }]
        }
    });
}

window.buyNowWithQuantity = function(productId) {
    window.addToCartWithQuantity(productId);
    window.location.href = 'checkout.html';
}

function updateCartItemQuantity(productId, newQuantity) {
    const currentUserId = window.currentUser ? window.currentUser.username : 'guest';
    const itemIndex = cart.findIndex(item => item.userId === currentUserId && item.productId === productId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity = parseInt(newQuantity);
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartItems();
    }
}

function calculateTotalPrice() {
    const currentUserId = window.currentUser ? window.currentUser.username : 'guest';
    const userCart = cart.filter(item => item.userId === currentUserId);
    return userCart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateTotalPrice(total) {
    const totalPriceElement = document.getElementById('totalPrice');
    const checkoutButton = document.querySelector('.checkout-button');
    
    if (totalPriceElement) {
        totalPriceElement.textContent = `₩${total.toLocaleString()}`;
    }
    
    if (checkoutButton) {
        checkoutButton.textContent = `₩${total.toLocaleString()} 주문하기`;
    }
}

function loadPurchaseHistory() {
    const purchaseList = document.getElementById('purchaseList');
    if (!purchaseList) return;

    const currentUserId = window.currentUser ? window.currentUser.username : 'guest';
    const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    const userPurchases = purchaseHistory.filter(purchase => purchase.userId === currentUserId);

    purchaseList.innerHTML = '';
    let totalAmount = 0;
    userPurchases.forEach(purchase => {
        totalAmount += purchase.totalAmount;
        const li = document.createElement('li');
        li.innerHTML = `
            <p>주문 번호: ${purchase.id}</p>
            <p>주문 일자: ${new Date(purchase.date).toLocaleString()}</p>
            <p>상태: 주문완료</p>
            <ul>
                ${purchase.items.map(item => `
                    <li>${item.productName} - ${item.quantity}개, ₩${(item.price * item.quantity).toLocaleString()}</li>
                `).join('')}
            </ul>
            <p>총 금액: ₩${purchase.totalAmount.toLocaleString()}</p>
            <button onclick="cancelOrder(${purchase.id})">주문 취소</button>
        `;
        purchaseList.appendChild(li);
    });

    updateOrderStatus(userPurchases.length, totalAmount);
}

function cancelOrder(orderId) {
    if (!confirm('정말로 이 주문을 취소하시겠습니까?')) {
        return;
    }

    const currentUserId = window.currentUser ? window.currentUser.username : 'guest';
    let purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    
    const orderIndex = purchaseHistory.findIndex(purchase => purchase.id === orderId && purchase.userId === currentUserId);
    
    if (orderIndex === -1) {
        alert('주문을 찾을 수 없습니다.');
        return;
    }

    purchaseHistory.splice(orderIndex, 1);
    localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));

    // GTM 이벤트 전송
    dataLayer.push({
        'event': 'cancel_order',
        'orderId': orderId
    });

    alert('주문이 취소되었습니다.');
    loadPurchaseHistory();
}

function updateOrderStatus(completedOrdersCount, totalAmount) {
    const orderCompleteCount = document.getElementById('orderCompleteCount');
    const totalAmountElement = document.getElementById('totalAmount');
    if (orderCompleteCount) {
        orderCompleteCount.textContent = completedOrdersCount;
    }
    if (totalAmountElement) {
        totalAmountElement.textContent = `₩${totalAmount.toLocaleString()}`;
    }
}