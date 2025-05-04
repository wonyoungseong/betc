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

    subscribeBtn.addEventListener('click', function() {
        console.log('subscribeBtn clicked!');
        console.log('Checking pushEvent for begin_subscription:', typeof pushEvent);
        if (typeof pushEvent === 'function') {
            pushEvent('begin_subscription', { /* 필요 시 추가 데이터 */ });
            console.log('begin_subscription event pushed.');
        } else {
            console.warn('pushEvent function is not defined. Cannot push begin_subscription.');
        }
        showModal();
    });

    submitEmail.addEventListener('click', function() {
        console.log('submitEmail clicked!');
        console.log('Checking pushEvent for complete_subscription:', typeof pushEvent);
        if (emailInput.value && typeof pushEvent === 'function') {
            pushEvent('complete_subscription', {
                // email_address: emailInput.value // 필요 시 이메일 주소 포함 
            });
            console.log('complete_subscription event pushed.');
        } else if (!emailInput.value) {
            console.log('Email not entered, skipping complete_subscription event.');
        } else {
            console.warn('pushEvent function is not defined. Cannot push complete_subscription.');
        }
        submitSubscription();
    });

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