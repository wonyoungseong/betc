// 리뷰 관리

let reviews = JSON.parse(localStorage.getItem('reviews')) || {};

// 리뷰 로드
window.loadReviews = function(productId) {
    var reviewDiv = document.getElementById('reviewList');
    var averageRatingSpan = document.getElementById('averageRating');
    var averageStarRating = document.getElementById('averageStarRating');
    var reviewCountSpan = document.getElementById('reviewCount');
    if (!reviewDiv) return;
    var allReviews = JSON.parse(localStorage.getItem('reviews')) || {};
    var productReviews = allReviews[productId] || [];
    reviewDiv.innerHTML = '';
    if (productReviews.length === 0) {
        reviewDiv.innerHTML = '<p>리뷰가 없습니다. 첫 번째로 리뷰를 작성해 보세요!</p>';
        averageRatingSpan.textContent = '0.0';
        averageStarRating.innerHTML = '☆☆☆☆☆';
        reviewCountSpan.textContent = '0';
    } else {
        var totalRating = 0;
        productReviews.forEach(function(review, index) {
            totalRating += review.rating;
            var div = document.createElement('div');
            div.className = 'review-item';
            div.innerHTML = `
                <p>평점: ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</p>
                <p>${review.text}</p>
                <button onclick="deleteReview(${productId}, ${index})">삭제</button>
            `;
            reviewDiv.appendChild(div);
        });
        var averageRating = totalRating / productReviews.length;
        averageRatingSpan.textContent = averageRating.toFixed(1);
        averageStarRating.innerHTML = '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating));
        reviewCountSpan.textContent = productReviews.length;
    }
}

// 리뷰 삭제
window.deleteReview = function(productId, reviewIndex) {
    var allReviews = JSON.parse(localStorage.getItem('reviews')) || {};
    if (allReviews[productId] && allReviews[productId].length > reviewIndex) {
        allReviews[productId].splice(reviewIndex, 1);
        localStorage.setItem('reviews', JSON.stringify(allReviews));
        window.loadReviews(productId);
        alert('리뷰가 삭제되었습니다.');
    }
}

// 리뷰 작성
window.submitReview = function() {
    var params = new URLSearchParams(window.location.search);
    var id = parseInt(params.get('id'));
    var reviewInput = document.getElementById('reviewInput');
    var ratingInput = document.getElementById('ratingInput');
    var reviewText = reviewInput.value.trim();
    var rating = parseInt(ratingInput.value);
    if (!reviewText) {
        alert('리뷰를 작성해주세요.');
        return;
    }
    var allReviews = JSON.parse(localStorage.getItem('reviews')) || {};
    if (!allReviews[id]) allReviews[id] = [];
    allReviews[id].push({text: reviewText, rating: rating});
    localStorage.setItem('reviews', JSON.stringify(allReviews));
    reviewInput.value = '';
    ratingInput.value = '5';
    window.loadReviews(id);
    
    // 리뷰 데이터 생성 (실제로는 사용자 정보 등 더 많은 정보 포함)
    const newReview = {
        productId: id, // 현재 상품 ID (어딘가에서 설정되어 있어야 함)
        rating: rating,
        text: reviewText,
        author: window.currentUser ? window.currentUser.username : '익명', // 현재 로그인 사용자
        date: new Date().toISOString().split('T')[0]
    };

    // --- GA4 Event: write_review ---
    pushGeneralEvent('write_review', {
        product_id: id.toString(), // 상품 ID는 문자열로
        review_score: rating // 평점
    });
    // --- End GA4 Event ---

    // 리뷰 저장 (현재는 로컬 스토리지 사용)
    saveReview(newReview);
    
    alert('리뷰가 등록되었습니다.');
}
