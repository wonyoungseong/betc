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
    var loginModal = document.getElementById('loginModal');
    loginModal.style.display = 'block';
    document.getElementById('loginUsername').focus(); // 모달이 열릴 때 포커스 설정
}

window.showSignupModal = function() {
    var signupModal = document.getElementById('signupModal');
    signupModal.style.display = 'block';
    document.getElementById('signupUsername').focus(); // 모달이 열릴 때 포커스 설정
}

window.closeLoginModal = function() {
    var loginModal = document.getElementById('loginModal');
    loginModal.style.display = 'none';
}

window.closeSignupModal = function() {
    var signupModal = document.getElementById('signupModal');
    signupModal.style.display = 'none';
}

window.login = function() {
    var username = document.getElementById('loginUsername').value.trim();
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
        window.closeLoginModal();
    } else {
        alert('사용자 이름을 입력하세요.');
    }
}


window.signup = function() {
    var username = document.getElementById('signupUsername').value.trim();
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
        window.closeSignupModal();
    } else {
        alert('사용자 이름을 입력하세요.');
    }
}

window.logout = function() {
    if (confirm('로그아웃 하시겠습니까?')) {
        window.currentUser = null;
        localStorage.removeItem('currentUser');
        window.checkAuthStatus();
        alert('로그아웃되었습니다.');
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

// Function to update main content margin based on header/nav height
function updateMainContentMargin() {
    const header = document.querySelector('header.gnb');
    const mainContent = document.querySelector('main.main-content');
    const mainNav = document.getElementById('mainNav');

    if (!header || !mainContent) {
        // console.warn('Header or Main Content element not found for margin update.');
        return;
    }

    let marginTop = header.offsetHeight; // Start with header height

    // Check if mobile nav is active AND displayed
    if (mainNav && mainNav.classList.contains('active') && window.getComputedStyle(mainNav).display !== 'none') {
        // If nav is active, add its height to the margin
        // Use offsetHeight as it includes padding and borders
        marginTop += mainNav.offsetHeight;
    }

    // Ensure margin is not negative and apply
    mainContent.style.marginTop = `${Math.max(0, marginTop)}px`;
    // console.log(`Calculated marginTop: ${marginTop}px`); // Debugging log
}

// Debounce function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// --- Named Event Handlers ---

// Refined hamburger click handler with potential double requestAnimationFrame for timing
const handleHamburgerClick = () => {
    const mainNav = document.getElementById('mainNav');
    if (mainNav) {
        mainNav.classList.toggle('active');
        // Double rAF for potentially better timing after style toggle
        requestAnimationFrame(() => {
             requestAnimationFrame(updateMainContentMargin);
        });
    }
};

const handleMainSearch = () => {
    if (typeof window.searchProduct === 'function') {
        window.searchProduct(); // Assumes main search uses #searchInput value internally
    } else {
        console.error('searchProduct function is not defined.');
    }
};

const handleMobileSearch = () => {
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const mainNav = document.getElementById('mainNav');
     if (typeof window.searchProduct === 'function' && mobileSearchInput) {
        window.searchProduct(mobileSearchInput.value); // Pass mobile input value
        if (mainNav) mainNav.classList.remove('active'); // Close nav after search
        requestAnimationFrame(updateMainContentMargin); // Update margin after closing nav
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

const handleLogout = (e) => {
    e.preventDefault();
    window.logout(); // Assuming logout function exists globally
};

// Debounced version of the margin update function for resize
const debouncedUpdateMargin = debounce(updateMainContentMargin, 100);


// Event listeners setup function
function addEventListeners() {
    // --- Hamburger Menu ---
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    if (hamburgerMenu) {
        hamburgerMenu.removeEventListener('click', handleHamburgerClick);
        hamburgerMenu.addEventListener('click', handleHamburgerClick);
    } else {
        // console.warn('Hamburger menu button not found.');
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

    // --- Logout ---
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.removeEventListener('click', handleLogout);
        logoutLink.addEventListener('click', handleLogout);
    } else {
         // console.warn('Logout link not found.');
    }

    // --- Resize Listener ---
    window.removeEventListener('resize', debouncedUpdateMargin);
    window.addEventListener('resize', debouncedUpdateMargin);
}

// Make functions globally accessible if needed
window.updateMainContentMargin = updateMainContentMargin;
window.addEventListeners = addEventListeners;


// Simplified DOMContentLoaded - relies on initializePage in each HTML file
document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
        updateMainContentMargin();
    });
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