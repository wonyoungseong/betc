document.addEventListener('DOMContentLoaded', function() {
    const subscribeBtn = document.getElementById('subscribeBtn');
    const modal = document.getElementById('subscribeModal');
    const submitEmail = document.getElementById('submitEmail');
    const emailInput = document.getElementById('emailInput');
    const subscriptionMessage = document.getElementById('subscriptionMessage');

    function showModal() {
        modal.style.display = 'block';
        emailInput.focus(); // 모달이 열릴 때 이메일 입력 필드에 포커스
    }

    function hideModal() {
        modal.style.display = 'none';
        subscriptionMessage.style.display = 'none';
    }

    function submitSubscription() {
        if (emailInput.value) {
            subscriptionMessage.style.display = 'block';
            emailInput.value = '';
            setTimeout(hideModal, 3000);
        }
    }

    subscribeBtn.addEventListener('click', showModal);

    submitEmail.addEventListener('click', submitSubscription);

    // Enter 키 입력 처리
    emailInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // 폼 제출 방지
            submitSubscription();
        }
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            hideModal();
        }
    });
});