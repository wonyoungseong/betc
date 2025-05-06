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

// 공통 이벤트 리스너 설정 함수 (중복 방지 포함)
function addProductListClickListener(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 이미 리스너가 추가되었는지 확인 (플래그 사용)
    if (container.dataset.clickListenerAdded === 'true') {
        // console.log(`Listener already added to #${containerId}`); // 디버깅 시 주석 해제
        return;
    }

    container.addEventListener('click', function(event) {
        // 클릭된 요소 또는 가장 가까운 .product-item 조상 찾기
        console.log('List item clicked. Event target:', event.target); // 클릭된 타겟 로깅
        const productItem = event.target.closest('.product-item');
        console.log('Closest .product-item found:', productItem); // 찾은 productItem 로깅
        
        if (productItem) {
            const productId = parseInt(productItem.dataset.productId);
            const listName = productItem.dataset.listName;
            const listIndex = parseInt(productItem.dataset.listIndex);
            
            // 유효한 데이터가 있는지 확인
            if (!isNaN(productId) && listName !== undefined && listName !== 'undefined' && !isNaN(listIndex)) { // listName 'undefined' 문자열 체크 추가
                console.log(`Product item clicked: ID=${productId}, List=${listName}, Index=${listIndex}`);
                window.viewProduct(productId, listName, listIndex);
            } else {
                console.warn('Missing or invalid data attributes on clicked product item:', productItem.dataset);
            }
        } else {
             console.log('No .product-item ancestor found for the clicked element.');
        }
    });

    // 리스너 추가 플래그 설정
    container.dataset.clickListenerAdded = 'true';
    console.log(`Click listener added to #${containerId}`);
}

window.loadMainProducts = function(category = 'all') {
    console.log('loadMainProducts called with category:', category); // 로그 추가
    var productList = document.getElementById('mainProductList');
    if (!productList) return;
    productList.innerHTML = '';

    var filteredProducts = window.products.filter(function(product) {
        return category === 'all' || product.category === category;
    });

    // 최대 4개의 제품만 표시
    var displayProducts = filteredProducts.slice(0, 4);
    console.log('Products to display:', displayProducts.length, displayProducts); // 로그 추가

    // --- GA4 view_item_list 이벤트 푸시 시작 ---
    const listName = '메인 추천 제품';
    const listId = 'main_featured';
    const ecommerceData = {
        item_list_name: listName,
        item_list_id: listId,
        items: displayProducts.map((product, index) => ({
            item_id: product.id.toString(),
            item_name: product.name,
            affiliation: product.affiliation || '뷰티 코스메틱 쇼핑몰',
            coupon: product.coupon || undefined,
            discount: product.originalPrice ? (product.originalPrice - product.price) : undefined,
            index: index + 1,
            item_brand: product.brand || undefined,
            item_category: product.category || undefined,
            item_list_id: listId, // 각 아이템에도 목록 ID 추가
            item_list_name: listName, // 각 아이템에도 목록 이름 추가
            price: product.price,
            quantity: 1
        }))
    };

    console.log('Checking pushEcommerceEvent:', typeof pushEcommerceEvent); // 로그 추가
    if (typeof pushEcommerceEvent === 'function') {
        console.log('Pushing view_item_list for main products:', ecommerceData); // 로그 추가
        pushEcommerceEvent('view_item_list', ecommerceData);
    } else {
        console.warn('pushEcommerceEvent function is not defined. Cannot push view_item_list for main products.');
    }
    // --- GA4 view_item_list 이벤트 푸시 끝 ---

    displayProducts.forEach(function(product, index) {
        // createProductItem 호출 시 목록 정보 전달 (select_item을 위해)
        var item = window.createProductItem(product, listName, index);
        productList.appendChild(item);
    });

    // 이벤트 리스너 추가 (함수 호출)
    addProductListClickListener('mainProductList'); 
}

// --- NEW FUNCTION ---
function adjustThumbnailSizes() {
    const mainImageElement = document.getElementById('mainProductImage');
    const thumbnailContainer = document.getElementById('thumbnailContainer');

    if (!mainImageElement || !thumbnailContainer) {
        console.warn("Cannot adjust thumbnails: main image or container not found.");
        return;
    }

    const thumbnails = thumbnailContainer.querySelectorAll('.thumbnail');
    if (thumbnails.length === 0) {
        // console.log("No thumbnails to adjust.");
        return;
    }

    // Get the gap value dynamically from CSS (more robust)
    let gap = 8; // Default value
    try { // Use try-catch in case getComputedStyle fails
        const containerStyle = window.getComputedStyle(thumbnailContainer);
        // Check for gap property first, then fallback for older browsers if needed
        const gapValue = containerStyle.getPropertyValue('gap') || containerStyle.getPropertyValue('column-gap');
        if (gapValue && gapValue.endsWith('px')) {
            gap = parseFloat(gapValue);
        } else if (gapValue) {
            console.warn(`Could not parse gap value '${gapValue}', using default ${gap}px.`);
        }
    } catch (e) {
         console.warn("Could not get computed style for gap, using default.", e);
    }


    // Ensure main image has a width before calculating
    // Use scrollWidth or offsetWidth - offsetWidth is usually better here
    const mainWidth = mainImageElement.offsetWidth;
    if (mainWidth <= 0) {
        console.warn("Main image width is 0, trying again shortly...");
        // Retry after a short delay to allow image rendering
        setTimeout(adjustThumbnailSizes, 150); // Increased delay slightly
        return;
    }


    const numThumbnails = thumbnails.length;
    const totalGapWidth = (numThumbnails > 1) ? (numThumbnails - 1) * gap : 0;

    // Calculate available width, ensure it's not negative
    let totalThumbnailWidth = mainWidth - totalGapWidth;
    if (totalThumbnailWidth <= 0) {
         // If total width is still negative, maybe container has padding?
         // Let's try using clientWidth of the container as fallback
         const containerWidth = thumbnailContainer.clientWidth;
         totalThumbnailWidth = containerWidth - totalGapWidth;
         if (totalThumbnailWidth < 0) totalThumbnailWidth = 0; // Prevent negative width
         console.warn(`Main image width calculation resulted in non-positive thumbnail space (${mainWidth} - ${totalGapWidth}). Using container width ${containerWidth} as fallback.`);
    }


    const thumbnailWidth = (numThumbnails > 0) ? totalThumbnailWidth / numThumbnails : 0;

    // console.log(`Adjusting thumbnails: MainWidth=${mainWidth}, Thumbnails=${numThumbnails}, Gap=${gap}, ThumbWidth=${thumbnailWidth}`);

    thumbnails.forEach(thumb => {
        // Apply width only if calculated width is positive
        if (thumbnailWidth > 0) {
             thumb.style.width = `${thumbnailWidth}px`;
        } else {
             // Fallback: let CSS handle it or set a default small size?
             thumb.style.width = '60px'; // Example fallback width
        }
        // CSS handles height: auto
    });

     // After setting widths, allow wrapping if needed and make visible again
     thumbnailContainer.style.flexWrap = 'wrap'; // Allow wrapping after calculation
     thumbnailContainer.style.overflow = 'visible';
}

// --- MODIFY loadProductDetail FUNCTION ---
async function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id')); // Ensure ID is number if needed

    // Ensure product data is loaded (assuming window.products is populated)
    if (!window.products || window.products.length === 0) {
        console.error("Product data not loaded yet.");
        // Optionally display an error message to the user
        document.getElementById('productDetail').innerHTML = '<p>상품 데이터를 로드하는 중 오류가 발생했습니다.</p>';
        return;
    }

    const product = window.products.find(p => p.id === productId);
    const productInfoDiv = document.querySelector('.product-info'); // Target for name, price etc.
    const productDetailDiv = document.getElementById('productDetail'); // Overall container


    if (product && productInfoDiv && productDetailDiv) {
        // Clear previous info if reusing the page dynamically
        productInfoDiv.innerHTML = '';
        // ... (potentially clear other sections like description, reviews) ...

        // --- Populate Product Info ---
         // (Assuming you have elements inside .product-info or create them here)
         productInfoDiv.innerHTML = `
            <h1>${product.name}</h1>
            <div class="price-section">
                ${product.discountRate ? `<span class="discount">${product.discountRate}%</span>` : ''}
                <span class="current-price">${product.price.toLocaleString()}원</span>
                ${product.originalPrice ? `<span class="original-price">${product.originalPrice.toLocaleString()}원</span>` : ''}
            </div>
            <div class="quantity">
                <label for="quantityInput">수량:</label>
                <input type="number" id="quantityInput" value="1" min="1">
            </div>
            <div class="action-buttons">
                <button id="addToCartButton" class="add-to-cart-btn" data-product-id="${product.id}">장바구니 담기</button>
                <button id="buyNowButton" class="buy-now" data-product-id="${product.id}">바로 구매</button>
            </div>
            <!-- Add other info like description summary if needed -->
        `;

        // --- 이벤트 리스너 추가 --- 
        const addToCartButton = document.getElementById('addToCartButton');
        if (addToCartButton) {
            addToCartButton.addEventListener('click', function() {
                const productId = this.dataset.productId;
                console.log(`Add to Cart button clicked for product ID: ${productId}`);
                if (productId) {
                    window.addToCartWithQuantity(parseInt(productId)); // cart.js 함수 호출
                } else {
                    console.error('Product ID not found on Add to Cart button.');
                }
            });
        } else {
            console.error('Add to Cart button not found after rendering.');
        }
        
        const buyNowButton = document.getElementById('buyNowButton');
        if (buyNowButton) {
            buyNowButton.addEventListener('click', function() {
                 const productId = this.dataset.productId;
                 console.log(`Buy Now button clicked for product ID: ${productId}`);
                if (productId) {
                    window.buyNowWithQuantity(parseInt(productId)); // cart.js 함수 호출
                } else {
                    console.error('Product ID not found on Buy Now button.');
                }
            });
        } else {
             console.error('Buy Now button not found after rendering.');
        }
        // --- 이벤트 리스너 추가 끝 --- 

        // --- Populate Image Gallery ---
        const mainImage = document.getElementById('mainProductImage');
        const thumbnailContainer = document.getElementById('thumbnailContainer');

        if (mainImage && product.images && product.images.length > 0) {
            mainImage.src = product.images[0];
            mainImage.alt = product.name;

             // Add onload listener to main image to trigger adjustment *after* it loads
             mainImage.onload = () => {
                // console.log("Main image loaded, adjusting thumbnails.");
                adjustThumbnailSizes();
             };
             // If the image is already cached, onload might not fire, trigger manually too
             if (mainImage.complete) {
                 // console.log("Main image already complete, adjusting thumbnails.");
                // Use timeout to ensure layout calculation is possible
                 setTimeout(adjustThumbnailSizes, 0);
             }

        } else if (mainImage) {
             mainImage.src = 'images/placeholder.png'; // Fallback image
             mainImage.alt = 'Placeholder Image';
        }


        if (thumbnailContainer && product.images && product.images.length > 0) {
            thumbnailContainer.innerHTML = ''; // Clear existing thumbnails
            product.images.forEach((imgSrc, index) => {
                const thumb = document.createElement('img');
                thumb.src = imgSrc;
                thumb.alt = `${product.name} thumbnail ${index + 1}`;
                thumb.classList.add('thumbnail');
                if (index === 0) {
                    thumb.classList.add('active');
                }
                thumb.onclick = () => {
                    if (mainImage) mainImage.src = imgSrc;
                    thumbnailContainer.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                     // Re-adjust sizes might be needed if main image aspect ratio changes significantly
                     // setTimeout(adjustThumbnailSizes, 0);
                };
                thumbnailContainer.appendChild(thumb);
            });
        } else if (thumbnailContainer) {
             thumbnailContainer.innerHTML = ''; // Clear if no images
        }

        // --- Populate Description/Details/Reviews ---
        // (Your existing code to populate these sections)
        const featuresList = document.getElementById('productFeatures');
        if(featuresList && product.features) {
            featuresList.innerHTML = product.features.map(f => `<li>${f}</li>`).join('');
        }
        const ingredientsList = document.getElementById('productIngredients');
         if(ingredientsList && product.ingredients) {
            ingredientsList.innerHTML = product.ingredients.map(i => `<li>${i}</li>`).join('');
        }
        const usageP = document.getElementById('productUsage');
        if(usageP) usageP.textContent = product.usage || '';

        const infoTable = document.getElementById('productInfoTable');
        if(infoTable && product.infoTable) {
             infoTable.innerHTML = Object.entries(product.infoTable).map(([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`).join('');
        }

        // Load reviews (assuming function exists)
        window.loadReviews(productId);


        // --- GA4 view_item 이벤트 푸시 ---
         if (typeof pushEcommerceEvent === 'function') {
            const urlParams = new URLSearchParams(window.location.search);
            const listName = urlParams.get('list_name') || 'Product Detail'; // Get list name from URL or default
            const listId = urlParams.get('list_id') || 'detail_page';     // Get list id from URL or default

             const itemData = {
                item_id: product.id.toString(),
                item_name: product.name,
                // affiliation: "Google Merchandise Store", // Optional
                // coupon: "", // Optional
                currency: "KRW",
                discount: product.originalPrice ? (product.originalPrice - product.price) : undefined,
                // index: 0, // Optional: index in a list if applicable
                item_brand: product.brand || "Unknown Brand",
                item_category: product.category || "Unknown Category",
                // item_category2: "Apparel",
                // item_category3: "T-shirts",
                // item_category4: "",
                // item_category5: "",
                item_list_id: listId, // From referring list if available
                item_list_name: listName, // From referring list if available
                // item_variant: "green", // Optional
                // location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo", // Optional
                price: product.price,
                quantity: 1 // Default quantity for view_item is 1
            };
            pushEcommerceEvent('view_item', {
                currency: "KRW",
                value: product.price,
                items: [itemData]
            });
        } else {
            console.warn('pushEcommerceEvent function is not defined. Cannot push view_item event.');
        }
        // --- End GA4 Event ---


        // --- Adjust Thumbnails (Moved earlier to main image onload/complete) ---
        // setTimeout(adjustThumbnailSizes, 0); // Removed from here


    } else {
        console.error(`Product with ID ${productId} not found.`);
        if (productDetailDiv) {
             productDetailDiv.innerHTML = '<p>상품 정보를 찾을 수 없습니다.</p>';
        }
    }
}

// --- ADD RESIZE LISTENER ---
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    // Only run adjustThumbnails if we are potentially on a product detail page
    if (document.getElementById('thumbnailContainer')) {
        resizeTimeout = setTimeout(adjustThumbnailSizes, 250); // Debounce resize events
    }
});

window.createProductItem = function(product, listName, index) {
    var item = document.createElement('div');
    item.className = 'product-item';
    // onclick 제거됨

    // 데이터 속성 추가
    item.dataset.productId = product.id;
    item.dataset.listName = listName;
    item.dataset.listIndex = index; // 인덱스 저장 (0부터 시작)

    var discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

    // a 태그에서 onclick 제거
    item.innerHTML = `
        <a href="#" class="product-item-link"> 
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h3>${product.name}</h3>
            <p>
                ${discount > 0 ? `<span class="discount">${discount}%</span>` : ''}
                <span class="price">${product.price.toLocaleString()}원</span>
                ${product.originalPrice ? `<span class="original-price">${product.originalPrice.toLocaleString()}원</span>` : ''}
            </p>
        </a>
    `;

    return item;
}

window.viewProduct = function(id, listName, index) {
    const product = window.products.find(p => p.id === id);
    if (product && typeof pushEcommerceEvent === 'function') {
        const ecommerceData = {
            item_list_name: listName,
            item_list_id: product.category, // 목록 ID로 상품 카테고리 사용 (또는 listName과 동일하게 사용)
            items: [{
                item_id: product.id.toString(),
                item_name: product.name,
                affiliation: product.affiliation || '뷰티 코스메틱 쇼핑몰',
                coupon: product.coupon || undefined,
                discount: product.originalPrice ? (product.originalPrice - product.price) : undefined,
                index: index + 1,
                item_brand: product.brand || undefined,
                item_category: product.category || undefined,
                item_list_id: product.category, // 아이템에도 목록 ID
                item_list_name: listName,       // 아이템에도 목록 이름
                price: product.price,
                quantity: 1 // 선택 시 수량은 1
            }]
        };
        pushEcommerceEvent('select_item', ecommerceData);
    } else if (!product) {
        console.warn(`Product with ID ${id} not found for select_item event.`);
    } else {
        console.warn('pushEcommerceEvent function is not defined. Cannot push select_item.');
    }

    // 페이지 이동 로직 수정: list_name과 list_id(category) 추가
    const listId = product ? product.category : 'unknown'; // 상품 정보가 있을 경우 카테고리 사용
    const encodedListName = encodeURIComponent(listName || 'unknown');
    const encodedListId = encodeURIComponent(listId);
    window.location.href = `product-detail.html?id=${id}&list_name=${encodedListName}&list_id=${encodedListId}`;
}

window.searchProduct = function(query = null) {
    // If no query is passed, get it from the main search input
    if (query === null) {
        var searchInput = document.getElementById('searchInput');
        query = searchInput ? searchInput.value.trim() : '';
    } else {
        query = query.trim();
    }

    if (query) {
        // Navigate to search results page
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
        // listName과 listId 정의 (view_item_list 와 일관성 있게)
        const listName = `검색 결과: ${query}`;
        const listId = 'search_results';
        
        // view_item_list 이벤트 로직 (기존 코드 유지 또는 필요시 여기에 추가)
        // ...

        results.forEach(function(product, index) {
            // createProductItem 호출 시 listName, index 전달
            var item = window.createProductItem(product, listName, index); 
            resultsDiv.appendChild(item);
        });
        
        // 이벤트 리스너 추가
        addProductListClickListener('searchResults');

    } else {
        resultsDiv.innerHTML = '<p>검색 결과가 없습니다.</p>';
    }
    
    // --- GA4 Event: view_search_results ---
    if (query) {
        pushGeneralEvent('view_search_results', {
            search_term: query
        });
    }
    // --- End GA4 Event ---
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

    const listName = category === 'all' ? '전체 제품' : category;
    const ecommerceData = {
        item_list_name: listName,
        item_list_id: category,
        items: filteredProducts.map((product, index) => ({
            item_id: product.id.toString(),
            item_name: product.name,
            affiliation: product.affiliation || '뷰티 코스메틱 쇼핑몰',
            coupon: product.coupon || undefined,
            discount: product.originalPrice ? (product.originalPrice - product.price) : undefined,
            index: index + 1,
            item_brand: product.brand || undefined,
            item_category: product.category || undefined,
            item_list_id: category,
            item_list_name: listName,
            price: product.price,
            quantity: 1
        }))
    };
    if (typeof pushEcommerceEvent === 'function') {
        pushEcommerceEvent('view_item_list', ecommerceData);
    } else {
        console.warn('pushEcommerceEvent function is not defined. Cannot push view_item_list.');
    }

    filteredProducts.forEach(function(product, index) {
        var item = window.createProductItem(product, listName, index);
        productList.appendChild(item);
    });

    // 이벤트 리스너 추가
    addProductListClickListener('productList');
}

window.addToCartWithQuantity = function(productId) {
    var quantityInput = document.getElementById('quantity'); // quantity 입력 필드 가져오기
    var quantity = quantityInput ? parseInt(quantityInput.value) : 1; // 입력 필드가 있으면 값 사용, 없으면 1

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
            discount: product.originalPrice ? (product.originalPrice - product.price) : undefined,
            index: index + 1,
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
        // Fallback 직접 푸시
        // window.dataLayer = window.dataLayer || [];
        // window.dataLayer.push({ ecommerce: null });
        // window.dataLayer.push({ event: 'add_to_cart', ecommerce: ecommerceData });
    }
    // --- GA4 add_to_cart 이벤트 푸시 끝 ---
    
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

    // 기존 GTM 이벤트 전송 코드 제거
    // dataLayer.push({ ... });
}

window.buyNowWithQuantity = function(productId) {
    // 1. Add the item to the cart (this function also handles the add_to_cart GA4 event)
    window.addToCartWithQuantity(productId);
    
    // 2. Directly navigate to the checkout page
    // The begin_checkout event should have been triggered when initiating checkout from the cart page, 
    // or potentially not triggered at all in a 'buy now' flow if skipping the standard cart checkout start.
    // For simplicity now, we navigate directly. If a distinct 'buy_now_checkout_start' event is needed, 
    // it could be added here, but standard GA4 doesn't define one.
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
