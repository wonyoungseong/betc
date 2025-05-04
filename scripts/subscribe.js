document.addEventListener('DOMContentLoaded', function() {
    const subscribeBtn = document.getElementById('subscribeBtn');
    const modal = document.getElementById('subscribeModal');
    const submitEmailBtn = document.getElementById('submitEmail');
    const emailInput = document.getElementById('emailInput');
    const subscriptionMessage = document.getElementById('subscriptionMessage');

    let beginSubscriptionFired = false;
    let subscriptionComplete = false;

    function showModal() {
        if (subscriptionComplete) return;
        modal.style.display = 'block';
        emailInput.focus();
        if (!beginSubscriptionFired) {
            const eventData = {
                event: 'begin_subscription',
                event_category: 'subscription',
                event_action: 'begin_subscription',
                event_label: undefined
            };
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(eventData);
            beginSubscriptionFired = true;
            console.log('begin_subscription event pushed (category: subscription).');
        }
    }

    function hideModal() {
        modal.style.display = 'none';
    }

    function submitSubscription() {
        if (subscriptionComplete) return;

        const email = emailInput.value.trim();
        if (validateEmail(email)) {
            console.log('구독 이메일:', email);

            const eventData = {
                event: 'complete_subscription',
                event_category: 'subscription',
                event_action: 'complete_subscription',
                event_label: undefined
            };
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(eventData);
            console.log('complete_subscription event pushed (category: subscription).');

            subscriptionComplete = true;
            subscriptionMessage.textContent = '구독이 완료되었습니다!';
            subscriptionMessage.style.display = 'block';
            emailInput.disabled = true;
            submitEmailBtn.textContent = '구독 완료';
            submitEmailBtn.disabled = true;

            setTimeout(hideModal, 2000);

        } else {
            alert('유효한 이메일 주소를 입력해주세요.');
        }
    }

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', showModal);
    }

    if (submitEmailBtn) {
        submitEmailBtn.addEventListener('click', submitSubscription);
    }

    if (emailInput) {
        emailInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !subscriptionComplete) {
                event.preventDefault();
                submitSubscription();
            }
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            hideModal();
        }
    });
});