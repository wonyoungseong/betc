// 사용자 인증 및 마이페이지 기능

window.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

window.checkAuthStatus = function() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    // const welcomeMessage = document.getElementById('welcomeMessage'); // 제거된 요소 참조 제거
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const logoutLink = document.getElementById('logoutLink');

    if (user) {
        window.currentUser = user;
        // welcomeMessage.textContent = `${user.username}님 환영합니다. |`; // 제거된 요소 참조 제거
        if(loginLink) loginLink.style.display = 'none';
        if(signupLink) signupLink.style.display = 'none';
        if(logoutLink) logoutLink.style.display = 'inline'; // Use 'inline' or 'inline-block'
    } else {
        window.currentUser = null;
        // welcomeMessage.textContent = ''; // 제거된 요소 참조 제거
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
function loadPurchaseHistory() {
    const purchaseList = document.getElementById('purchaseList');
    if (!purchaseList) return;

    const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    
    if (purchaseHistory.length === 0) {
        purchaseList.innerHTML = '<li>구매 내역이 없습니다.</li>';
        return;
    }

    let historyHTML = '';
    purchaseHistory.forEach((purchase, index) => {
        historyHTML += `
            <li class="purchase-item">
                <p>구매일자: ${purchase.date}</p>
                <p>총 금액: ₩${purchase.totalAmount}</p>
                <p>거래 ID: ${purchase.transactionId}</p>
                <ul>
                    ${purchase.items.map(item => `
                        <li>${item.productName} - ${item.quantity}개</li>
                    `).join('')}
                </ul>
                <button onclick="cancelPurchase(${index})">구매 취소</button>
            </li>
        `;
    });

    purchaseList.innerHTML = historyHTML;

    // 주문 목록을 로드한 후
    updateOrderCompleteCount();
}

// 구매 취소
function cancelPurchase(index) {
    let purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    if (index >= 0 && index < purchaseHistory.length) {
        purchaseHistory.splice(index, 1);
        localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
        loadPurchaseHistory();
        alert('구매가 취소되었습니다.');
    }
}

// --- Named Event Handlers ---

// Modify handleHamburgerClick to toggle body class instead of calling margin update
const handleHamburgerClick = () => {
    const mainNav = document.getElementById('mainNav');
    if (mainNav) {
        mainNav.classList.toggle('active');
        document.body.classList.toggle('mobile-nav-active'); // Toggle class on body
    }
};

const handleMainSearch = () => {
    if (typeof window.searchProduct === 'function') {
        window.searchProduct();
    } else {
        console.error('searchProduct function is not defined.');
    }
};

const handleMobileSearch = () => {
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const mainNav = document.getElementById('mainNav');
     if (typeof window.searchProduct === 'function' && mobileSearchInput) {
        window.searchProduct(mobileSearchInput.value);
        if (mainNav) mainNav.classList.remove('active'); // Close nav after search
        // No need to update margin here anymore
        document.body.classList.remove('mobile-nav-active'); // Also remove body class
    } else {
        console.error('searchProduct function or mobileSearchInput not defined.');
    }
};

const handleSearchInputKeypress = (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleMainSearch();
    }
};

const handleMobileSearchInputKeypress = (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleMobileSearch();
    }
};

// Event listeners setup function
function addEventListeners() {
    // --- Hamburger Menu ---
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    if (hamburgerMenu) {
        hamburgerMenu.removeEventListener('click', handleHamburgerClick);
        hamburgerMenu.addEventListener('click', handleHamburgerClick);
    }

    // --- Search ---
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
     if (mobileSearchButton) {
        mobileSearchButton.removeEventListener('click', handleMobileSearch);
        mobileSearchButton.addEventListener('click', handleMobileSearch);
     }
     if (mobileSearchInput) {
         mobileSearchInput.removeEventListener('keypress', handleMobileSearchInputKeypress);
         mobileSearchInput.addEventListener('keypress', handleMobileSearchInputKeypress);
     }

    // --- Login/Signup Links --- ADDED console.log
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');

    if (loginLink) {
        // Define handler locally for removal/addition clarity - REMOVED
        // Use the same function reference for remove and add
        loginLink.removeEventListener('click', handleLoginLinkClick); // Use named handler
        loginLink.addEventListener('click', handleLoginLinkClick);  // Use named handler
    } else {
        // console.warn("Login link not found");
    }

    if (signupLink) {
        // Define handler locally for removal/addition clarity - REMOVED
        // Use the same function reference for remove and add
        signupLink.removeEventListener('click', handleSignupLinkClick); // Use named handler
        signupLink.addEventListener('click', handleSignupLinkClick);  // Use named handler
    } else {
        // console.warn("Signup link not found");
    }

     // --- Logout --- Ensure handleLogout is defined before this call
     const logoutLink = document.getElementById('logoutLink');
     if (logoutLink) {
         // handleLogout must be defined in a scope accessible here
         logoutLink.removeEventListener('click', globalHandleLogout); // Assumes handleLogout is accessible
         logoutLink.addEventListener('click', globalHandleLogout);
     }

    // --- Modal Close Buttons --- ADDED/VERIFIED
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

    // --- Modal Submit Buttons --- ADDED/VERIFIED (though login has inline onclick)
    const loginSubmitBtn = document.getElementById('loginSubmit');
    const signupSubmitBtn = document.getElementById('signupSubmit');

    if(loginSubmitBtn){
        // Remove existing inline listener if migrating fully to JS listeners
        if (loginSubmitBtn.hasAttribute('onclick')) {
             console.log("Removing inline onclick from login submit");
             loginSubmitBtn.removeAttribute('onclick');
        }
        loginSubmitBtn.removeEventListener('click', window.login);
        loginSubmitBtn.addEventListener('click', window.login);
    }
     if(signupSubmitBtn){
        signupSubmitBtn.removeEventListener('click', window.signup);
        signupSubmitBtn.addEventListener('click', window.signup);
    }

     // --- Modal Enter Key Listeners --- ADDED/VERIFIED
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

// Make functions globally accessible if needed (Remove updateMainContentMargin)
// window.addEventListeners = addEventListeners; // No longer need to make global if called from DOMContentLoaded


// Simplified DOMContentLoaded - Remove initial margin update call
document.addEventListener('DOMContentLoaded', () => {
    // Call checkAuthStatus to set initial button visibility and cart count
    if (typeof window.checkAuthStatus === 'function') {
        window.checkAuthStatus();
    } else {
         console.error("checkAuthStatus function not found on DOMContentLoaded");
    }

    // Add all event listeners after DOM is ready
    addEventListeners(); // Call the setup function here

    // Removed requestAnimationFrame for margin update

    // Ensure body class is reset on load (moved from previous location)
    document.body.classList.remove('mobile-nav-active');

    // Option 3: Call updateCartCount here if needed independently,
    // but checkAuthStatus already calls it.
    // if (typeof window.updateCartCount === 'function') {
    //     window.updateCartCount();
    // }
});

// --- NEW FUNCTION: Update Cart Count in Header ---
window.updateCartCount = function() {
    const cartCountElement = document.getElementById('cartCount'); // 헤더의 카트 수량 표시 요소 ID
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

// --- Consider calling updateCartCount on initial page load ---
// Option 1: Add window.updateCartCount(); to each page's initializePage function (Recommended)
// Option 2: Modify checkAuthStatus (Less direct)
/*
window.checkAuthStatus = function() {
    // ... (existing login/logout link logic) ...
    window.updateCartCount(); // Call cart count update here as well
};
*/

// Option 3: Call on DOMContentLoaded (might be too early if cart depends on other async ops)
// document.addEventListener('DOMContentLoaded', window.updateCartCount);