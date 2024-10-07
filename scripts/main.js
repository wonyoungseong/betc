// 메인 스크립트 파일

document.addEventListener('DOMContentLoaded', () => {
    // 사용자 인증 상태 체크
    checkAuthStatus();
    // 메인 페이지 제품 로드
    loadMainProducts();
    // 이벤트 리스너 등록
    window.addEventListeners();
});
    document.getElementById('logoutLink').addEventListener('click', logout);
// 이 괄호는 불필요하므로 제거합니다.

window.loadProductDetail = function() {
    var params = new URLSearchParams(window.location.search);
    var id = parseInt(params.get('id'));
    var product = window.products.find(function(p) { return p.id === id; });
    if (product) {
        // 기존 코드는 그대로 유지
        // 추가된 부분
        document.getElementById('productFeatures').innerHTML = product.features ? 
            product.features.map(feature => `<li>${feature}</li>`).join('') : 
            '<li>제품 특징 정보가 없습니다.</li>';
        document.getElementById('productIngredients').innerHTML = product.ingredients ? 
            product.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('') : 
            '<li>성분 정보가 없습니다.</li>';
        document.getElementById('productUsage').textContent = product.usage || '사용 방법 정보가 없습니다.';
    }
}

// 검색 모달 관련 코드
const searchIcon = document.getElementById('searchIcon');
const searchModal = document.getElementById('searchModal');
const closeSearchModal = document.getElementById('closeSearchModal');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

searchIcon.onclick = function() {
    searchModal.style.display = "block";
}

closeSearchModal.onclick = function() {
    searchModal.style.display = "none";
}

searchButton.onclick = function() {
    // 여기에 검색 로직을 구현하세요
    console.log("검색어:", searchInput.value);
    searchModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == searchModal) {
        searchModal.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    function performSearch() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            window.location.href = `search-results.html?query=${encodeURIComponent(searchTerm)}`;
        } else {
            alert('검색어를 입력해주세요.');
        }
    }
});
