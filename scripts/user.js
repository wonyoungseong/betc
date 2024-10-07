// 사용자 인증 및 마이페이지 기능

window.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

window.checkAuthStatus = function() {
    var welcomeMessage = document.getElementById('welcomeMessage');
    var loginLink = document.getElementById('loginLink');
    var signupLink = document.getElementById('signupLink');
    var logoutLink = document.getElementById('logoutLink');

    if (window.currentUser) {
        welcomeMessage.textContent = `${window.currentUser.username}님 환영합니다.`;
        loginLink.style.display = 'none';
        signupLink.style.display = 'none';
        logoutLink.style.display = 'inline';
    } else {
        welcomeMessage.textContent = '';
        loginLink.style.display = 'inline';
        signupLink.style.display = 'inline';
        logoutLink.style.display = 'none';
    }
}


window.showLoginModal = function() {
    var loginModal = document.getElementById('loginModal');
    loginModal.style.display = 'block';
}

window.showSignupModal = function() {
    var signupModal = document.getElementById('signupModal');
    signupModal.style.display = 'block';
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

// 이벤트 리스너 설정 함수
window.addEventListeners = function() {
    var loginLink = document.getElementById('loginLink');
    var signupLink = document.getElementById('signupLink');
    var logoutLink = document.getElementById('logoutLink');
    var searchButton = document.getElementById('searchButton');

    var closeLoginModalBtn = document.getElementById('closeLoginModal');
    var closeSignupModalBtn = document.getElementById('closeSignupModal');
    var loginSubmitBtn = document.getElementById('loginSubmit');
    var signupSubmitBtn = document.getElementById('signupSubmit');
    var searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                window.searchProduct();
            }
        });
    }

    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.showLoginModal();
        });
    }

    if (signupLink) {
        signupLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.showSignupModal();
        });
    }

    if (closeLoginModalBtn) {
        closeLoginModalBtn.addEventListener('click', window.closeLoginModal);
    }

    if (closeSignupModalBtn) {
        closeSignupModalBtn.addEventListener('click', window.closeSignupModal);
    }

    if (loginSubmitBtn) {
        loginSubmitBtn.addEventListener('click', window.login);
    }

    if (signupSubmitBtn) {
        signupSubmitBtn.addEventListener('click', window.signup);
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.logout();
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.searchProduct();
        });
    }
}

function updateOrderCompleteCount() {
    const purchaseList = document.getElementById('purchaseList');
    const orderCompleteCount = document.getElementById('orderCompleteCount');
    if (purchaseList && orderCompleteCount) {
        const count = purchaseList.children.length;
        orderCompleteCount.textContent = count;
    }
}

function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
}

function closeModals() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('signupModal').style.display = 'none';
}

// 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginLink').addEventListener('click', showLoginModal);
    document.getElementById('signupLink').addEventListener('click', showSignupModal);
    document.getElementById('closeLoginModal').addEventListener('click', closeModals);
    document.getElementById('closeSignupModal').addEventListener('click', closeModals);

    // 모달 외부 클릭 시 닫기
    window.onclick = function(event) {
        if (event.target == document.getElementById('loginModal') || 
            event.target == document.getElementById('signupModal')) {
            closeModals();
        }
    }
});