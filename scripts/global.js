// scripts/global.js

// 기본 dataLayer 초기화 (페이지 로드 시 한 번만 실행되도록 고려)
// 참고: 이 코드는 scripts/include.js의 insertGtmScript 함수 시작에도 있습니다.
// 중복 실행을 피하기 위해 한 곳에서만 초기화하는 것이 좋습니다.
// 여기서는 일단 추가하되, 추후 include.js에서 제거하는 것을 고려할 수 있습니다.
window.dataLayer = window.dataLayer || [];

/**
 * GA4 전자상거래 이벤트를 dataLayer로 푸시하는 헬퍼 함수
 * @param {string} eventName - 푸시할 이벤트 이름 (예: 'add_to_cart')
 * @param {object} eventData - 이벤트와 함께 푸시할 전자상거래 데이터 객체
 */
window.pushEcommerceEvent = function(eventName, eventData) {
    if (!eventName || !eventData) {
        console.warn('pushEcommerceEvent: eventName 또는 eventData가 제공되지 않았습니다.');
        return;
    }

    // 이전 ecommerce 객체를 초기화 (선택적 권장 사항)
    window.dataLayer.push({ ecommerce: null });

    // 새 이벤트 푸시
    window.dataLayer.push({
        event: eventName,
        ecommerce: eventData
    });

    if (window.debugMode) { // 디버그 모드가 활성화된 경우 콘솔에 로그 출력 (선택 사항)
        console.log(`GA4 Event Pushed: ${eventName}`, eventData);
    }
}

/**
 * 일반 GA4 이벤트를 dataLayer로 푸시하는 헬퍼 함수
 * @param {string} eventName - 푸시할 이벤트 이름 (예: 'login')
 * @param {object} [eventData={}] - 이벤트와 함께 푸시할 추가 데이터 객체 (선택 사항)
 */
window.pushEvent = function(eventName, eventData = {}) {
    if (!eventName) {
        console.warn('pushEvent: eventName이 제공되지 않았습니다.');
        return;
    }

    // 이벤트 데이터와 함께 이벤트 푸시
    const dataToPush = { event: eventName, ...eventData };
    window.dataLayer.push(dataToPush);

    if (window.debugMode) { 
        console.log(`GA4 Event Pushed: ${eventName}`, dataToPush);
    }
}

// 디버그 모드 설정 (개발 중에만 true로 설정)
window.debugMode = false; // 필요에 따라 true로 변경하여 콘솔 로그 확인

console.log('global.js loaded and pushEcommerceEvent is ready.'); 
console.log('pushEvent function is also ready.'); // 로그 추가 