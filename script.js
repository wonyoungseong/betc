// 제품 데이터 (예시 데이터)
const products = [
    { id: 1, name: "립스틱", category: "메이크업", price: 10000, image: "lipstick.jpg" },
    { id: 2, name: "아이섀도우", category: "메이크업", price: 15000, image: "eyeshadow.jpg" },
    { id: 3, name: "클렌징 오일", category: "스킨케어", price: 20000, image: "cleansing_oil.jpg" },
    { id: 4, name: "모이스처 크림", category: "스킨케어", price: 25000, image: "moisture_cream.jpg" },
    // 추가 제품 데이터...
];

let cart = [];
let reviews = {};

// 메인 페이지 제품 로드
function loadMainProducts() {
    const productList = document.getElementById('mainProductList');
    products.forEach(product => {
        const item = createProductItem(product);
        productList.appendChild(item);
    });
}

// 제품 아이템 생성
function createProductItem(product) {
    const div = document.createElement('div');
    div.className = 'product-item';
    div.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>₩${product.price}</p>
        <button onclick="viewProduct(${product.id})">상세보기</button>
    `;
    return div;
}

// 제품 상세 페이지로 이동
function viewProduct(id) {
    window.location.href = `product-detail.html?id=${id}`;
}

// 제품 상세 정보 로드
function loadProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const product = products.find(p => p.id === id);
    if (product) {
        const detailDiv = document.getElementById('productDetail');
        detailDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h2>${product.name}</h2>
            <p>₩${product.price}</p>
            <button onclick="addToCart(${product.id})">장바구니에 추가</button>
            <button onclick="buyNow(${product.id})">바로 구매</button>
        `;
        loadReviews(id);
    }
}

// 장바구니에 추가
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    cart.push(product);
    alert('장바구니에 추가되었습니다.');

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
    cartDiv.innerHTML = '';
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <h3>${item.name}</h3>
            <p>₩${item.price}</p>
        `;
        cartDiv.appendChild(div);
    });
}

// 체크아웃 시작
function beginCheckout() {
    // GTM 이벤트 전송
    dataLayer.push({
        'event': 'begin_checkout',
        'ecommerce': {
            'items': cart.map(item => ({
                'item_id': item.id,
                'item_name': item.name,
                'price': item.price
            }))
        }
    });
    window.location.href = 'checkout.html';
}

// 구매 완료 처리
function completePurchase(event) {
    event.preventDefault();
    // GTM 이벤트 전송
    dataLayer.push({
        'event': 'purchase',
        'ecommerce': {
            'transaction_id': 'T12345',
            'value': cart.reduce((total, item) => total + item.price, 0),
            'items': cart.map(item => ({
                'item_id': item.id,
                'item_name': item.name,
                'price': item.price
            }))
        }
    });
    cart = [];
    window.location.href = 'purchase.html';
}

// 리뷰 로드
function loadReviews(productId) {
    const reviewDiv = document.getElementById('reviewList');
    const productReviews = reviews[productId] || [];
    reviewDiv.innerHTML = '';
    productReviews.forEach(review => {
        const p = document.createElement('p');
        p.textContent = review;
        reviewDiv.appendChild(p);
    });
}

// 리뷰 작성
function submitReview() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const reviewInput = document.getElementById('reviewInput');
    const reviewText = reviewInput.value;
    if (reviewText) {
        if (!reviews[id]) reviews[id] = [];
        reviews[id].push(reviewText);
        reviewInput.value = '';
        loadReviews(id);
    }
}

// 제품 검색
function searchProduct() {
    const query = document.getElementById('searchInput').value;
    window.location.href = `search-results.html?query=${encodeURIComponent(query)}`;
}

// 검색 결과 로드
function loadSearchResults() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    const results = products.filter(product => product.name.includes(query));
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
    results.forEach(product => {
        const item = createProductItem(product);
        resultsDiv.appendChild(item);
    });
}

// 페이지 로드 시 실행되는 초기화 함수
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        loadMainProducts();
    } else if (window.location.pathname.endsWith('product-detail.html')) {
        loadProductDetail();
    } else if (window.location.pathname.endsWith('cart.html')) {
        loadCartItems();
    } else if (window.location.pathname.endsWith('search-results.html')) {
        loadSearchResults();
    }
});

// 페이지 이동 함수
function goToMain() {
    window.location.href = 'index.html';
}
