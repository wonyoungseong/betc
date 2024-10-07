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
    alert('리뷰가 등록되었습니다.');
}
