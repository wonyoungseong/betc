// scripts/global.js

// 기본 dataLayer 초기화 (페이지 로드 시 한 번만 실행되도록 고려)
// 참고: 이 코드는 scripts/include.js의 insertGtmScript 함수 시작에도 있습니다.
// 중복 실행을 피하기 위해 한 곳에서만 초기화하는 것이 좋습니다.
// 여기서는 일단 추가하되, 추후 include.js에서 제거하는 것을 고려할 수 있습니다.
window.dataLayer = window.dataLayer || [];

/**
 * dataLayer의 ecommerce 객체를 초기화합니다.
 * 새 전자상거래 이벤트를 푸시하기 전에 호출하여 데이터 충돌을 방지합니다.
 */
function resetEcommerceData() {
    window.dataLayer.push({ ecommerce: null });
    // console.log('Ecommerce object reset in dataLayer.'); // 디버깅용 로그
}

/**
 * GA4 전자상거래 이벤트를 dataLayer로 푸시하는 헬퍼 함수
 * @param {string} eventName - 푸시할 이벤트 이름 (예: 'add_to_cart')
 * @param {object} eventData - 이벤트와 함께 푸시할 전자상거래 데이터 객체
 */
function pushEcommerceEvent(eventName, ecommerceData) {
    console.log(`Pushing GA4 Event: ${eventName}`, ecommerceData);
    resetEcommerceData(); // Ensure ecommerce object is clean before pushing new data

    const eventData = {
        event: eventName,
        event_category: "ecommerce", // Auto-set for ecommerce events
        event_action: eventName,      // Auto-set for ecommerce events
        event_label: undefined,       // Set as undefined per request
        ecommerce: ecommerceData
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);
}

// New helper function for non-ecommerce events
function pushGeneralEvent(eventName, customData = {}) {
    console.log(`Pushing GA4 Event: ${eventName}`, customData);

    const eventData = {
        event: eventName,
        event_category: eventName, // Auto-set for general events
        event_action: eventName,   // Auto-set for general events
        event_label: undefined,    // Set as undefined per request
        ...customData              // Merge any additional parameters
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);
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