console.log("scripts/user.js --- File execution started ---");
// 사용자 인증 및 마이페이지 기능

window.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

window.checkAuthStatus = function() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const logoutLink = document.getElementById('logoutLink');

    if (user) {
        window.currentUser = user;
        if(loginLink) loginLink.style.display = 'none';
        if(signupLink) signupLink.style.display = 'none';
        if(logoutLink) logoutLink.style.display = 'inline'; // Use 'inline' or 'inline-block'
    } else {
        window.currentUser = null;
        if(loginLink) loginLink.style.display = 'inline';
        if(signupLink) signupLink.style.display = 'inline';
        if(logoutLink) logoutLink.style.display = 'none';
    }
    updateCartCount(); // Update cart count on auth status change
}


window.showLoginModal = function() {
    console.log("Entering showLoginModal"); // 로그 추가
    var loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'block';
        const usernameInput = document.getElementById('loginUsername');
        if (usernameInput) usernameInput.focus(); // 모달이 열릴 때 포커스 설정
    } else {
        console.error("Login modal element not found!");
    }
}

window.showSignupModal = function() {
    console.log("Entering showSignupModal"); // 로그 추가
    var signupModal = document.getElementById('signupModal');
    if (signupModal) {
        signupModal.style.display = 'block';
        const usernameInput = document.getElementById('signupUsername');
        if (usernameInput) usernameInput.focus(); // 모달이 열릴 때 포커스 설정
    } else {
        console.error("Signup modal element not found!");
    }
}

window.closeLoginModal = function() {
    console.log("Entering closeLoginModal"); // 로그 추가
    var loginModal = document.getElementById('loginModal');
    if(loginModal) loginModal.style.display = 'none';
}

window.closeSignupModal = function() {
    console.log("Entering closeSignupModal"); // 로그 추가
    var signupModal = document.getElementById('signupModal');
    if(signupModal) signupModal.style.display = 'none';
}

window.login = function() {
    console.log("Entering login function"); // 로그 추가
    var usernameInput = document.getElementById('loginUsername');
    if (!usernameInput) return; // Prevent error if element not found
    var username = usernameInput.value.trim();
    if (username) {
        window.currentUser = { username: username };
        localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
        window.checkAuthStatus();

        // --- GA4 login 이벤트 푸시 (pushGeneralEvent 사용) ---
        if (typeof pushGeneralEvent === 'function') {
             pushGeneralEvent('login');
        } else {
            console.warn('pushGeneralEvent function is not defined. Cannot push login event.');
        }
        // --- 이벤트 푸시 끝 ---

        alert(`${username}님으로 로그인되었습니다.`);
        window.closeLoginModal(); // Ensure modal closes
    } else {
        alert('사용자 이름을 입력하세요.');
    }
}


window.signup = function() {
    console.log("Entering signup function"); // 로그 추가
    var usernameInput = document.getElementById('signupUsername');
    if (!usernameInput) return; // Prevent error if element not found
    var username = usernameInput.value.trim();
     if (username) {
        window.currentUser = { username: username };
        localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
        window.checkAuthStatus();

        // --- GA4 sign_up 이벤트 푸시 (pushGeneralEvent 사용) ---
        if (typeof pushGeneralEvent === 'function') {
             pushGeneralEvent('sign_up');
        } else {
            console.warn('pushGeneralEvent function is not defined. Cannot push sign_up event.');
        }
        // --- 이벤트 푸시 끝 ---

        alert(`${username}님으로 회원가입 및 로그인되었습니다.`);
        window.closeSignupModal(); // Ensure modal closes
    } else {
        alert('사용자 이름을 입력하세요.');
    }
}

// Rename the globally defined handleLogout slightly to avoid confusion
// with potential local variables if this file structure changes later.
const globalHandleLogout = (e) => {
    e.preventDefault();
    console.log("Entering handleLogout (Logout link clicked)"); // 로그 위치 변경 및 함수 이름 명확화
    window.logout(); // Call the actual logout logic function
};

// --- Named Event Handlers for Login/Signup Links ---
const handleLoginLinkClick = (e) => {
    e.preventDefault();
    console.log("Login link clicked"); // 로그 추가
    window.showLoginModal();
};

const handleSignupLinkClick = (e) => {
    e.preventDefault();
    console.log("Signup link clicked"); // 로그 추가
    window.showSignupModal();
};

window.logout = function() {
    console.log("Entering logout function"); // 로그 추가
    if (confirm('로그아웃 하시겠습니까?')) {
        console.log("Logout confirmed"); // 로그 추가
        window.currentUser = null;
        localStorage.removeItem('currentUser');
        window.checkAuthStatus();
        alert('로그아웃되었습니다.');
    } else {
        console.log("Logout cancelled"); // 로그 추가
    }
}

// 구매 내역 저장
function savePurchaseHistory(purchase) {
    let purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    purchaseHistory.push(purchase);
    localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
}

// 구매 내역 로드
window.loadMyPagePurchaseHistory = function() {
    console.log("--- loadMyPagePurchaseHistory started ---"); // 이름 변경 반영
    const purchaseList = document.getElementById('purchaseList');
    const totalAmountSpan = document.getElementById('totalAmount');
    const orderCompleteCountSpan = document.getElementById('orderCompleteCount');

    if (!purchaseList || !totalAmountSpan || !orderCompleteCountSpan) {
        console.error('Purchase history elements not found. Exiting.'); // 종료 지점 명확화
        return;
    }
    console.log("Required elements found.");

    const purchaseHistoryString = localStorage.getItem('purchaseHistory');
    console.log("Raw purchaseHistory from localStorage:", purchaseHistoryString);
    const purchaseHistory = JSON.parse(purchaseHistoryString) || [];
    console.log("Parsed purchaseHistory:", purchaseHistory);

    let totalPurchaseAmount = 0;
    let orderCompleteCount = 0;

    if (!purchaseList) {
        console.error("Element with ID 'purchaseList' not found (redundant check). Exiting.");
        return;
    }
    purchaseList.innerHTML = '';

    if (!Array.isArray(purchaseHistory)) {
        console.error("Parsed purchaseHistory is not an array!", purchaseHistory);
        purchaseList.innerHTML = '<li>구매 내역을 불러오는 중 오류가 발생했습니다.</li>';
        return;
    }

    if (purchaseHistory.length === 0) {
        console.log("Purchase history is empty.");
        purchaseList.innerHTML = '<li>구매 내역이 없습니다.</li>';
        if (totalAmountSpan) totalAmountSpan.textContent = '₩0';
        if (orderCompleteCountSpan) orderCompleteCountSpan.textContent = '0';
        return;
    }
    console.log(`Processing ${purchaseHistory.length} purchase items.`);

    let historyHTML = '';
    purchaseHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log("Starting purchaseHistory.forEach loop...");
    purchaseHistory.forEach((purchase, index) => {
        console.log(`Processing item ${index}:`, purchase);
        totalPurchaseAmount += (purchase.totalAmount || 0);
        const status = purchase.status || '주문완료';
        if (status === '주문완료') { orderCompleteCount++; }
        const transactionId = purchase.transactionId || 'N/A';
        const purchaseDate = purchase.date ? new Date(purchase.date).toLocaleString('ko-KR') : '날짜 정보 없음';
        const statusClass = `status-${status.toLowerCase().replace(' ', '-')}`;
        const totalOrderAmount = (purchase.totalAmount || 0).toLocaleString();

        let itemsHTML = '';
        try {
            itemsHTML = (purchase.items || []).map(item => {
                const productId = item.productId;
                const productName = item.productName || '상품 정보 없음';
                const quantity = item.quantity || 0;
                const price = item.price || 0;
                const productInfo = window.products ? window.products.find(p => p.id === productId) : null;
                const imageUrl = productInfo?.image || 'images/placeholder.png';
                return `
                <div class="product-entry">
                    <img src="${imageUrl}" alt="${productName}" class="product-thumbnail">
                    <div class="product-details">
                        <span class="product-name">${productName}</span>
                        <span class="product-quantity-price">수량: ${quantity} / 개당 ₩${price.toLocaleString()}</span>
                    </div>
                </div>
                `;
            }).join('');
        } catch (mapError) {
            console.error(`Error processing items for purchase index ${index}:`, mapError);
            itemsHTML = '<li>상품 정보를 불러오는 중 오류 발생</li>';
        }

        historyHTML += `
            <li class="purchase-item">
                <div class="purchase-item-header">
                    <div class="order-info">
                        <span class="order-number">주문 번호: ${transactionId}</span>
                        <span class="order-date">주문 일자: ${purchaseDate}</span>
                    </div>
                    <span class="order-status ${statusClass}">${status}</span>
                </div>
                <div class="purchase-item-products">${itemsHTML}</div>
                <div class="purchase-item-summary">
                    <span class="total-order-amount">총 금액: ₩${totalOrderAmount}</span>
                    <div class="purchase-item-actions">
                        ${status !== '취소됨' ? `<button class="btn-cancel-order" onclick="cancelPurchase(${index})">주문 취소</button>` : ''}
                        <!-- Add other buttons like 'Track Shipment' or 'Write Review' here -->
                    </div>
                </div>
            </li>
        `;
    });
    console.log("Finished purchaseHistory.forEach loop.");

    // 최종 HTML 생성 로그 (이전과 동일)
    console.log("Generated historyHTML:", historyHTML);

    purchaseList.innerHTML = historyHTML;
    console.log("Assigned historyHTML to purchaseList.innerHTML"); // 할당 확인 로그
    if(totalAmountSpan) totalAmountSpan.textContent = `₩${totalPurchaseAmount.toLocaleString()}`;
    if(orderCompleteCountSpan) orderCompleteCountSpan.textContent = orderCompleteCount;
    console.log("--- loadMyPagePurchaseHistory finished ---"); // 이름 변경 반영
}

// 구매 취소 함수도 window에 할당 (onclick에서 호출되므로)
window.cancelPurchase = function(index) {
    let purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    purchaseHistory.sort((a, b) => new Date(b.date) - new Date(a.date)); 

    if (index >= 0 && index < purchaseHistory.length) {
        const itemToCancel = purchaseHistory.splice(index, 1)[0]; 
        localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
        window.loadMyPagePurchaseHistory();
        alert('구매가 취소되었습니다.'); 
    } else {
        alert('구매 내역을 찾을 수 없습니다.');
    }
}

// *** 함수 정의 확인 로그 수정 ***
console.log("loadMyPagePurchaseHistory function DEFINED."); // 이름 변경 반영

// --- Named Event Handlers ---

// NEW: Toggle mobile navigation
const toggleMobileNav = () => {
    document.body.classList.toggle('mobile-nav-active');
    const isNavActive = document.body.classList.contains('mobile-nav-active');
    const hamburgerButton = document.getElementById('hamburgerMenu');
    if (hamburgerButton) {
        hamburgerButton.setAttribute('aria-expanded', isNavActive.toString());
    }
};

const handleMainSearch = () => {
    if (typeof window.searchProduct === 'function') {
        window.searchProduct();
    } else {
        console.error('searchProduct function is not defined.');
    }
};

// NEW: Handle mobile search submission
const handleMobileSearch = () => {
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const query = mobileSearchInput ? mobileSearchInput.value : null;
    if (typeof window.searchProduct === 'function') {
        window.searchProduct(query); // Call existing search function
        // Close the nav after search
        document.body.classList.remove('mobile-nav-active');
        const hamburgerButton = document.getElementById('hamburgerMenu');
        if (hamburgerButton) {
            hamburgerButton.setAttribute('aria-expanded', 'false');
        }
    } else {
        console.error('searchProduct function not found.');
    }
};

const handleSearchInputKeypress = (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleMainSearch();
    }
};

// NEW: Handle mobile search enter key
const handleMobileSearchEnter = (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleMobileSearch();
    }
};

// Event listeners setup function
function addEventListeners() {
    // --- Hamburger Menu --- MODIFIED
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    if (hamburgerMenu) {
        hamburgerMenu.removeEventListener('click', toggleMobileNav); // Use new handler
        hamburgerMenu.addEventListener('click', toggleMobileNav); // Use new handler
    }

    // --- Search --- MODIFIED
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const mobileSearchButton = document.getElementById('mobileSearchButton');
    const mobileSearchInput = document.getElementById('mobileSearchInput');

    if (searchButton) {
        searchButton.removeEventListener('click', handleMainSearch);
        searchButton.addEventListener('click', handleMainSearch);
    }
    if (searchInput) {
        searchInput.removeEventListener('keypress', handleSearchInputKeypress);
        searchInput.addEventListener('keypress', handleSearchInputKeypress);
    }
    // Add listeners for mobile search - NEW
     if (mobileSearchButton) {
        mobileSearchButton.removeEventListener('click', handleMobileSearch);
        mobileSearchButton.addEventListener('click', handleMobileSearch);
     }
     if (mobileSearchInput) {
         mobileSearchInput.removeEventListener('keypress', handleMobileSearchEnter);
         mobileSearchInput.addEventListener('keypress', handleMobileSearchEnter);
     }

    // --- Login/Signup Links --- (No changes needed here)
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');

    if (loginLink) {
        loginLink.removeEventListener('click', handleLoginLinkClick);
        loginLink.addEventListener('click', handleLoginLinkClick);
    } else {
        // console.warn("Login link not found");
    }

    if (signupLink) {
        signupLink.removeEventListener('click', handleSignupLinkClick);
        signupLink.addEventListener('click', handleSignupLinkClick);
    } else {
        // console.warn("Signup link not found");
    }

     // --- Logout --- (No changes needed here)
     const logoutLink = document.getElementById('logoutLink');
     if (logoutLink) {
         logoutLink.removeEventListener('click', globalHandleLogout);
         logoutLink.addEventListener('click', globalHandleLogout);
     }

    // --- Modal Close Buttons --- (No changes needed here)
    const closeLoginModalBtn = document.getElementById('closeLoginModal');
    const closeSignupModalBtn = document.getElementById('closeSignupModal');

    if(closeLoginModalBtn) {
        closeLoginModalBtn.removeEventListener('click', window.closeLoginModal);
        closeLoginModalBtn.addEventListener('click', window.closeLoginModal);
    }
     if(closeSignupModalBtn) {
        closeSignupModalBtn.removeEventListener('click', window.closeSignupModal);
        closeSignupModalBtn.addEventListener('click', window.closeSignupModal);
    }

    // --- Modal Submit Buttons --- (No changes needed here)
    const loginSubmitBtn = document.getElementById('loginSubmit');
    const signupSubmitBtn = document.getElementById('signupSubmit');

    if(loginSubmitBtn){
        if (loginSubmitBtn.hasAttribute('onclick')) {
             loginSubmitBtn.removeAttribute('onclick');
        }
        loginSubmitBtn.removeEventListener('click', window.login);
        loginSubmitBtn.addEventListener('click', window.login);
    }
     if(signupSubmitBtn){
        signupSubmitBtn.removeEventListener('click', window.signup);
        signupSubmitBtn.addEventListener('click', window.signup);
    }

     // --- Modal Enter Key Listeners --- (No changes needed here)
     const loginUsernameInput = document.getElementById('loginUsername');
     const signupUsernameInput = document.getElementById('signupUsername');

     if(loginUsernameInput){
         const handleLoginEnter = (event) => { if (event.key === 'Enter') { event.preventDefault(); window.login(); }};
         loginUsernameInput.removeEventListener('keypress', handleLoginEnter);
         loginUsernameInput.addEventListener('keypress', handleLoginEnter);
     }
     if(signupUsernameInput){
         const handleSignupEnter = (event) => { if (event.key === 'Enter') { event.preventDefault(); window.signup(); }};
         signupUsernameInput.removeEventListener('keypress', handleSignupEnter);
         signupUsernameInput.addEventListener('keypress', handleSignupEnter);
     }
}

// Updated DOMContentLoaded - removed obsolete parts
document.addEventListener('DOMContentLoaded', () => {
    // Call checkAuthStatus to set initial button visibility and cart count
    if (typeof window.checkAuthStatus === 'function') {
        window.checkAuthStatus();
    } else {
         console.error("checkAuthStatus function not found on DOMContentLoaded");
    }

    // Add all event listeners after DOM is ready
    addEventListeners(); // Call the setup function here

    // Ensure body class is reset on load
    document.body.classList.remove('mobile-nav-active');
});

// --- NEW FUNCTION: Update Cart Count in Header ---
window.updateCartCount = function() {
    const cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) {
        // console.warn("Cart count element (#cartCount) not found in header.");
        return; // 요소가 없으면 중단
    }

    const currentUserId = window.currentUser ? window.currentUser.username : 'guest';
    const cartData = JSON.parse(localStorage.getItem('cart')) || [];
    const userCart = cartData.filter(item => item.userId === currentUserId);

    // Calculate total quantity
    const totalQuantity = userCart.reduce((sum, item) => sum + item.quantity, 0);

    // Update the cart count display
    if (totalQuantity > 0) {
        cartCountElement.textContent = totalQuantity;
        cartCountElement.style.display = 'block'; // Show the count
    } else {
        cartCountElement.textContent = '0';
        cartCountElement.style.display = 'none'; // Hide count if cart is empty
    }
};
