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
    const totalPriceSpan = document.getElementById('totalPrice');
    const checkoutButton = document.querySelector('.checkout-button');
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    const currentUser = window.currentUser ? window.currentUser.username : 'guest';
    const userCart = cart.filter(item => item.userId === currentUser);

    cartDiv.innerHTML = ''; // Clear previous items
    let total = 0;

    if (userCart.length === 0) {
        cartDiv.innerHTML = '<p>장바구니가 비어 있습니다.</p>';
        totalPriceSpan.textContent = '0원';
        if(checkoutButton) checkoutButton.textContent = '0원 주문하기';
        if(checkoutButton) checkoutButton.disabled = true;
        return;
    }

    // --- GA4 view_cart 이벤트 푸시 시작 ---
    if (typeof pushEcommerceEvent === 'function') {
        const ecommerceData = {
            currency: 'KRW',
            value: userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0), // 장바구니 총액
            items: userCart.map((item, index) => {
                const itemDetails = window.products.find(p => p.id === item.productId);
                return {
                    item_id: item.productId.toString(),
                    item_name: item.productName,
                    affiliation: itemDetails?.affiliation || '뷰티 코스메틱 쇼핑몰',
                    coupon: itemDetails?.coupon || undefined,
                    discount: itemDetails?.originalPrice ? (itemDetails.originalPrice - item.price) : undefined,
                    index: index + 1, // 장바구니 내 순서 (1부터 시작)
                    item_brand: itemDetails?.brand || undefined,
                    item_category: itemDetails?.category || undefined,
                    price: item.price,
                    quantity: item.quantity
                };
            })
        };
        pushEcommerceEvent('view_cart', ecommerceData);
    } else {
        console.warn('pushEcommerceEvent function is not defined. Cannot push view_cart.');
    }
    // --- GA4 view_cart 이벤트 푸시 끝 ---

    userCart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        const productInfo = window.products.find(p => p.id === item.productId);
        
        let imageUrl = 'images/placeholder.png';
        if (productInfo && productInfo.image) {
            imageUrl = productInfo.image;
        } else if (!productInfo) {
             console.warn(`Product info not found for cart item ID ${item.productId}. Using placeholder image.`);
        }

        // --- Updated innerHTML structure --- 
        div.innerHTML = `
            <img src="${imageUrl}" alt="${item.productName}" class="cart-item-image" onerror="this.onerror=null; this.src='images/placeholder.png'; console.error('Failed to load image:', this.src);">
            <div class="item-details">
                <h3 class="item-name">${item.productName}</h3>
                <p class="item-price">${item.price.toLocaleString()}원 / 개</p> 
            </div>
            <div class="item-controls"> 
                <div class="item-quantity">
                    <label for="qty-${item.productId}" style="display: none;">수량:</label> 
                    <input type="number" id="qty-${item.productId}" value="${item.quantity}" min="1" onchange="updateCartItemQuantity(${item.productId}, this.value)">
                </div>
                <div class="item-total">₩${(item.price * item.quantity).toLocaleString()}</div>
                <button class="remove-button" onclick="window.removeFromCart(${item.productId})">삭제</button>
            </div>
        `;
        // --- End Updated innerHTML structure ---

        cartDiv.appendChild(div);
        total += item.price * item.quantity;
    });

    totalPriceSpan.textContent = `${total.toLocaleString()}원`;
    if(checkoutButton) checkoutButton.textContent = `${total.toLocaleString()}원 주문하기`;
    if(checkoutButton) checkoutButton.disabled = false;
}

// 체크아웃 시작
window.beginCheckout = function() { 
    const currentUser = window.currentUser ? window.currentUser.username : 'guest';
    const userCart = cart.filter(item => item.userId === currentUser); 

    if (userCart.length === 0) {
        alert('장바구니가 비어 있습니다.');
        return;
    }

    // 페이지 이동만 수행
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

    // --- GA4 add_shipping_info 이벤트 푸시 시작 ---
    const currentUserId = window.currentUser ? window.currentUser.username : 'guest';
    const userCart = cart.filter(item => item.userId === currentUserId); // 현재 사용자 장바구니

    if (userCart.length > 0 && typeof pushEcommerceEvent === 'function') {
        const shippingEcommerceData = {
            currency: 'KRW',
            value: userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0), // 장바구니 총액
            coupon: undefined, // 전체 쿠폰 (있다면)
            shipping_tier: 'Standard', // 배송 옵션 (현재는 기본값)
            items: userCart.map((item, index) => {
                const itemDetails = window.products.find(p => p.id === item.productId);
                return {
                    item_id: item.productId.toString(),
                    item_name: item.productName,
                    affiliation: itemDetails?.affiliation || '뷰티 코스메틱 쇼핑몰',
                    coupon: itemDetails?.coupon || undefined,
                    discount: itemDetails?.originalPrice ? (itemDetails.originalPrice - item.price) : undefined,
                    index: index + 1, // 1부터 시작
                    item_brand: itemDetails?.brand || undefined,
                    item_category: itemDetails?.category || undefined,
                    price: item.price,
                    quantity: item.quantity
                };
            })
        };
        pushEcommerceEvent('add_shipping_info', shippingEcommerceData);

        // --- GA4 add_payment_info 이벤트 푸시 시작 ---
        const paymentEcommerceData = {
            currency: 'KRW',
            value: userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0), // 장바구니 총액
            payment_type: 'Credit Card', // 결제 수단 (현재는 기본값)
            coupon: undefined, // 전체 쿠폰 (있다면)
            items: userCart.map((item, index) => { // items 배열은 shipping과 동일하게 사용
                const itemDetails = window.products.find(p => p.id === item.productId);
                return {
                    item_id: item.productId.toString(),
                    item_name: item.productName,
                    affiliation: itemDetails?.affiliation || '뷰티 코스메틱 쇼핑몰',
                    coupon: itemDetails?.coupon || undefined,
                    discount: itemDetails?.originalPrice ? Number(itemDetails.originalPrice - item.price) : undefined,
                    index: index + 1, // 1부터 시작
                    item_brand: itemDetails?.brand || undefined,
                    item_category: itemDetails?.category || undefined,
                    price: item.price,
                    quantity: item.quantity
                };
            })
        };
        pushEcommerceEvent('add_payment_info', paymentEcommerceData);
        // --- GA4 add_payment_info 이벤트 푸시 끝 ---

        // --- 구매 내역 생성 및 저장 --- 
        const transactionId = `TID-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`; // 간단한 거래 ID 생성
        const finalTotal = userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0); // 최종 금액 계산

        const purchaseData = {
            date: new Date().toISOString(),
            totalAmount: finalTotal,
            items: userCart.map(item => ({ // 필요한 정보만 저장
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                price: item.price // 개당 가격 저장
            })),
            userId: currentUserId,
            transactionId: transactionId, // 생성된 ID 저장
            status: '주문완료' // 주문 상태 추가
        };

        // savePurchaseHistory 함수가 user.js에 정의되어 있으므로 window를 통해 호출
        if (typeof window.savePurchaseHistory === 'function') {
            window.savePurchaseHistory(purchaseData);
            console.log('Purchase history saved:', purchaseData);
        } else {
            console.error('savePurchaseHistory function is not defined on window.');
        }

        // --- GA4 purchase 이벤트 푸시 시작 ---
        const purchaseEcommerceData = {
            currency: 'KRW',
            transaction_id: transactionId, // 생성된 거래 ID 사용
            value: finalTotal,
            affiliation: '뷰티 코스메틱 쇼핑몰',
            coupon: undefined, // 사용된 쿠폰
            shipping: 0, // 배송비 (현재 0으로 가정)
            tax: 0, // 세금 (현재 0으로 가정)
            items: userCart.map((item, index) => {
                 const itemDetails = window.products.find(p => p.id === item.productId);
                 return {
                     item_id: item.productId.toString(),
                     item_name: item.productName,
                     affiliation: itemDetails?.affiliation || '뷰티 코스메틱 쇼핑몰',
                     coupon: itemDetails?.coupon || undefined,
                     discount: itemDetails?.originalPrice ? (itemDetails.originalPrice - item.price) : undefined,
                     index: index + 1,
                     item_brand: itemDetails?.brand || undefined,
                     item_category: itemDetails?.category || undefined,
                     price: item.price,
                     quantity: item.quantity
                 };
             })
        };
        pushEcommerceEvent('purchase', purchaseEcommerceData);
        // --- GA4 purchase 이벤트 푸시 끝 ---

    } else if (userCart.length === 0) {
         console.warn('Cart is empty. Skipping GA4 events.');
    } else {
        console.warn('pushEcommerceEvent function is not defined. Cannot push GA4 events.');
    }
    // --- GA4 이벤트 푸시 끝 (shipping & payment) ---

    // 장바구니 비우기
    const remainingCart = cart.filter(item => item.userId !== currentUserId);
    localStorage.setItem('cart', JSON.stringify(remainingCart));
    window.updateCartCount(); // 헤더 카트 수량 업데이트

    // 주문 완료 페이지로 리디렉션 등
    alert('주문이 완료되었습니다!');
    window.location.href = 'purchase-complete.html'; // 가상의 완료 페이지
}

// 장바구니에서 제품 제거
function removeFromCart(productId) {
    const currentUser = window.currentUser ? window.currentUser.username : 'guest';
    // cart 배열에서 현재 사용자의 상품 인덱스 찾기
    const itemIndex = cart.findIndex(item => item.userId === currentUser && item.productId === productId);

    if (itemIndex !== -1) {
        // 제거할 아이템 정보 저장 (이벤트 푸시용)
        const removedItem = { ...cart[itemIndex] }; // 복사본 저장
        const productInfo = window.products.find(p => p.id === removedItem.productId); // 원본 상품 정보 찾기

        // --- GA4 remove_from_cart 이벤트 푸시 시작 ---
        if (productInfo && typeof pushEcommerceEvent === 'function') {
            const ecommerceData = {
                currency: 'KRW',
                value: (removedItem.price * removedItem.quantity), // 제거된 아이템의 총 가치
                items: [{
                    item_id: removedItem.productId.toString(),
                    item_name: removedItem.productName,
                    affiliation: productInfo.affiliation || '뷰티 코스메틱 쇼핑몰',
                    coupon: productInfo.coupon || undefined, // 상품 원본 데이터에 쿠폰 정보가 있다면 사용
                    discount: productInfo.originalPrice ? (productInfo.originalPrice - removedItem.price) : undefined, // Per item discount
                    item_brand: productInfo.brand || undefined,
                    item_category: productInfo.category || undefined,
                    price: removedItem.price,
                    quantity: removedItem.quantity // 제거된 수량
                }]
            };
            pushEcommerceEvent('remove_from_cart', ecommerceData);
        } else if (!productInfo){
            console.warn(`Product info not found for removed item ID ${removedItem.productId}`);
        } else {
            console.warn('pushEcommerceEvent function is not defined. Cannot push remove_from_cart.');
        }
        // --- GA4 remove_from_cart 이벤트 푸시 끝 ---

        // cart 배열 및 localStorage에서 아이템 제거
        cart.splice(itemIndex, 1);
        localStorage.setItem('cart', JSON.stringify(cart));

        // 장바구니 UI 다시 로드
        loadCartItems();
    } else {
        console.warn(`Item with productId ${productId} not found in cart for user ${currentUser}`);
    }
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
        
        // 상품 정보 및 이미지 URL 가져오기
        const productInfo = window.products.find(p => p.id === item.productId);
        let imageUrl = 'images/placeholder.png'; // 기본 이미지
        if (productInfo && productInfo.image) {
            imageUrl = productInfo.image;
        } else if (!productInfo) {
            console.warn(`Product info not found for checkout summary item ID ${item.productId}. Using placeholder image.`);
        }

        summaryHTML += `
            <li class="order-item">
                <img src="${imageUrl}" alt="${item.productName}" class="summary-item-image" onerror="this.onerror=null; this.src='images/placeholder.png';"> <!-- 이미지 추가 -->
                <span class="summary-item-name">${item.productName}</span>
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
    var quantityInput = document.getElementById('quantityInput'); // Correct ID used in product-detail.html
    var quantity = quantityInput ? parseInt(quantityInput.value) : 1;

    if (isNaN(quantity) || quantity < 1) {
        alert('올바른 수량을 입력해주세요.');
        return;
    }

    const product = window.products.find(p => p.id === productId);
    if (!product) return;

    // --- GA4 add_to_cart 이벤트 푸시 시작 ---
    const ecommerceData = {
        currency: 'KRW', // 통화 코드
        value: (product.price * quantity), // 아이템 가격 * 수량
        items: [{
            item_id: product.id.toString(),
            item_name: product.name,
            affiliation: product.affiliation || '뷰티 코스메틱 쇼핑몰',
            coupon: product.coupon || undefined,
            discount: product.originalPrice ? (product.originalPrice - product.price) : undefined, // Per item discount
            // index: ???, // Should probably get index if available in context
            item_brand: product.brand || undefined,
            item_category: product.category || undefined,
            price: product.price,
            quantity: quantity
        }]
    };
    if (typeof pushEcommerceEvent === 'function') {
        pushEcommerceEvent('add_to_cart', ecommerceData);
    } else {
        console.warn('pushEcommerceEvent function is not defined. Cannot push add_to_cart.');
    }
    // --- GA4 add_to_cart 이벤트 푸시 끝 ---

    const cartItem = {
        userId: window.currentUser ? window.currentUser.username : 'guest',
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: quantity,
         image: product.image // Add image URL to cart item
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
    window.updateCartCount(); // Update header cart count

    if (confirm('장바구니에 추가되었습니다. 장바구니 페이지로 이동하시겠습니까?')) {
        window.location.href = 'cart.html';
    }
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