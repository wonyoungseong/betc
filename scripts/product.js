// 제품 데이터 및 함수 관리

window.products = [];

// 제품 데이터 로드
window.loadProductData = async function() {
    if (window.products && window.products.length > 0) {
        return;
    }
    try {
        const response = await fetch('data/products/index.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const productList = await response.json();
        window.products = await Promise.all(productList.map(async (productId) => {
            try {
                const productResponse = await fetch(`data/products/${productId}.json`);
                if (!productResponse.ok) {
                    console.warn(`제품 ${productId} 로드 실패: ${productResponse.status}`);
                    return null;
                }
                return await productResponse.json();
            } catch (error) {
                console.warn(`제품 ${productId} 로드 중 오류:`, error);
                return null;
            }
        }));
        window.products = window.products.filter(product => product !== null);
        console.log('로드된 제품:', window.products);
    } catch (error) {
        console.error('제품 데이터를 불러오는 데 실패했습니다:', error);
        window.products = [];
    }
}
window.loadMainProducts = function(category = 'all') {
    var productList = document.getElementById('mainProductList');
    if (!productList) return;
    productList.innerHTML = '';

    var filteredProducts = window.products.filter(function(product) {
        return category === 'all' || product.category === category;
    });

    // 최대 4개의 제품만 표시
    var displayProducts = filteredProducts.slice(0, 4);

    displayProducts.forEach(function(product) {
        var item = window.createProductItem(product);
        productList.appendChild(item);
    });
}

window.loadProductDetail = function() {
    var params = new URLSearchParams(window.location.search);
    var id = parseInt(params.get('id'));
    var product = window.products.find(function(p) { return p.id === id; });
    if (product) {
        var detailDiv = document.getElementById('productDetail');
        if (!detailDiv) return;
        detailDiv.innerHTML = `
            <div class="product-image-gallery">
                <div class="main-image">
                    <img id="mainProductImage" src="${product.image}" alt="${product.name}">
                </div>
                <div class="thumbnail-images" id="thumbnailContainer">
                    ${product.images.map((img, index) => `
                        <img src="${img}" alt="${product.name}" class="thumbnail" data-index="${index}">
                    `).join('')}
                </div>
            </div>
            <div class="product-info">
                <h2>${product.name}</h2>
                <p class="price">₩${product.price.toLocaleString()}</p>
                <p class="description">${product.description || '상품 설명이 없습니다.'}</p>
                <div class="quantity">
                    <label for="quantity">수량:</label>
                    <input type="number" id="quantity" name="quantity" value="1" min="1">
                </div>
                <button onclick="window.addToCartWithQuantity(${product.id})">장바구니 담기</button>
                <button onclick="window.buyNowWithQuantity(${product.id})">바로 구매</button>
            </div>
        `;
        
        // 제품 특징 표시
        var featuresDiv = document.getElementById('productFeatures');
        if (featuresDiv) {
            featuresDiv.innerHTML = product.features ? 
                product.features.map(feature => `<li>${feature}</li>`).join('') : 
                '<li>제품 특징 정보가 없습니다.</li>';
        }

        // 제품 성분 표시
        var ingredientsDiv = document.getElementById('productIngredients');
        if (ingredientsDiv) {
            ingredientsDiv.innerHTML = product.ingredients ? 
                product.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('') : 
                '<li>성분 정보가 없습니다.</li>';
        }

        // 사용 방법 표시
        var usageDiv = document.getElementById('productUsage');
        if (usageDiv) {
            usageDiv.textContent = product.usage || '사용 방법 정보가 없습니다.';
        }

        // 제품 정보 테이블 표시
        var infoTable = document.getElementById('productInfoTable');
        if (infoTable) {
            infoTable.innerHTML = `
                <tr><td>브랜드</td><td>${product.brand || '-'}</td></tr>
                <tr><td>카테고리</td><td>${product.category || '-'}</td></tr>
                <tr><td>용량</td><td>${product.volume || '-'}</td></tr>
            `;
        }

        // 이미지 갤러리 이벤트 리스너 추가
        addImageGalleryListeners(product);

        // 리뷰 로드 함수 호출
        window.loadReviews(id);

        // 콘텐츠 로드 후 여백 조정
        setTimeout(function() {
            var gnbHeight = document.querySelector('.gnb').offsetHeight;
            detailDiv.style.marginTop = (gnbHeight + 20) + 'px'; // 20px는 추가 여백
        }, 100); // 약간의 지연을 줘서 콘텐츠가 완전히 로드되도록 함
    }
}

// 이미지 갤러리 이벤트 리스너 함수 수정
function addImageGalleryListeners(product) {
    const mainImage = document.getElementById('mainProductImage');
    const thumbnailContainer = document.getElementById('thumbnailContainer');

    if (thumbnailContainer) {
        thumbnailContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('thumbnail')) {
                const clickedIndex = parseInt(event.target.getAttribute('data-index'));
                mainImage.src = product.images[clickedIndex];
                mainImage.alt = `${product.name} - Image ${clickedIndex + 1}`;

                // 활성 썸네일 표시
                thumbnailContainer.querySelectorAll('.thumbnail').forEach(thumb => {
                    thumb.classList.remove('active');
                });
                event.target.classList.add('active');
            }
        });
    }
}

// 이미지 갤러리 생성 함수 추가
function createImageGallery(product) {
    const mainImage = document.getElementById('mainProductImage');
    const thumbnailContainer = document.getElementById('thumbnailContainer');

    // 이미지 리스트 가져오기
    const imageList = product.images || [product.image]; // images 배열이 없으면 기본 이미지 사용

    // 메인 이미지 설정
    mainImage.src = imageList[0];
    mainImage.alt = product.name;

    // 썸네일 이미지 생성
    thumbnailContainer.innerHTML = ''; // 기존 썸네일 초기화
    imageList.forEach((imageSrc, index) => {
        const thumbImg = document.createElement('img');
        thumbImg.src = imageSrc;
        thumbImg.classList.add('thumbnail');
        if (index === 0) thumbImg.classList.add('active');
        thumbImg.alt = `${product.name} Thumbnail ${index + 1}`;
        thumbnailContainer.appendChild(thumbImg);

        // 썸네일 클릭 이벤트
        thumbImg.addEventListener('click', function() {
            mainImage.src = imageSrc;
            document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

window.createProductItem = function(product) {
    var item = document.createElement('div');
    item.className = 'product-item';
    item.onclick = function() {
        window.viewProduct(product.id);
    };
    
    var discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
    
    item.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <h3>${product.name}</h3>
        <p>
            ${discount > 0 ? `<span class="discount">${discount}%</span>` : ''}
            <span class="price">${product.price.toLocaleString()}원</span>
            ${product.originalPrice ? `<span class="original-price">${product.originalPrice.toLocaleString()}원</span>` : ''}
        </p>
    `;
    
    return item;
}

window.viewProduct = function(id) {
    window.location.href = `product-detail.html?id=${id}`;
}

window.searchProduct = function() {
    var query = document.getElementById('searchInput').value.trim();
    if (query) {
        window.location.href = `search-results.html?query=${encodeURIComponent(query)}`;
    } else {
        alert('검색어를 입력하세요.');
    }
}

window.loadSearchResults = function() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('query');
    if (!query) return;
    query = query.trim().toLowerCase();
    var results = window.products.filter(function(product) {
        return product.name.toLowerCase().includes(query);
    });
    var resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    resultsDiv.innerHTML = '';
    if (results.length > 0) {
        results.forEach(function(product) {
            var item = window.createProductItem(product);
            resultsDiv.appendChild(item);
        });
    } else {
        resultsDiv.innerHTML = '<p>검색 결과가 없습니다.</p>';
    }
}

window.loadProductList = function(category = 'all', sortBy = 'lowprice') {
    var productList = document.getElementById('productList');
    if (!productList) return;
    productList.innerHTML = '';

    var params = new URLSearchParams(window.location.search);
    var urlCategory = params.get('category');
    if (urlCategory) {
        category = urlCategory;
        document.getElementById('categoryTitle').textContent = category === 'all' ? '전체 제품' : category;
    }

    var filteredProducts = window.products.filter(function(product) {
        return category === 'all' || product.category === category;
    });

    filteredProducts.sort(function(a, b) {
        if (sortBy === 'highprice') {
            return b.price - a.price;
        } else {
            return a.price - b.price;
        }
    });

    filteredProducts.forEach(function(product) {
        var item = window.createProductItem(product);
        productList.appendChild(item);
    });
}

window.addToCartWithQuantity = function(productId) {
    var quantity = parseInt(document.getElementById('quantity').value);
    if (isNaN(quantity) || quantity < 1) {
        alert('올바른 수량을 입력해주세요.');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
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

window.initializeProductList = function() {
    var params = new URLSearchParams(window.location.search);
    var category = params.get('category') || 'all';
    var sortBy = document.getElementById('sortSelect').value;
    window.loadProductList(category, sortBy);
    window.addSortListener();
}

window.addCategoryListeners = function() {
    var categoryLinks = document.querySelectorAll('.category-list a');
    categoryLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            categoryLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            var category = this.getAttribute('data-category');
            document.getElementById('categoryTitle').textContent = 
                category === 'all' ? '전체 제품' : this.textContent;
            window.loadProductList(category, document.getElementById('sortSelect').value);
        });
    });
}

window.addSortListener = function() {
    var sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            var params = new URLSearchParams(window.location.search);
            var category = params.get('category') || 'all';
            window.loadProductList(category, this.value);
        });
    }
}

window.initializeCategoryNav = function() {
    var categoryLinks = document.querySelectorAll('.category-nav a');
    categoryLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            categoryLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            var category = this.getAttribute('data-category');
            window.loadMainProducts(category);
        });
    });
}
