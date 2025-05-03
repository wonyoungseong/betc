function insertGtmScript() {
    // GTM 스크립트가 이미 삽입되었는지 확인 (중복 삽입 방지)
    if (document.getElementById('gtm-script')) {
        return;
    }

    // dataLayer 초기화 (이미 초기화되지 않은 경우)
    window.dataLayer = window.dataLayer || [];

    // --- 페이지 뷰 정보 푸시 시작 ---
    window.dataLayer.push({
        'page_title': document.title,
        'page_location': window.location.href,
        'page_path': window.location.pathname,
        // 'event': 'page_view_info' // 필요시 별도 이벤트 이름 사용 가능
    });
    // --- 페이지 뷰 정보 푸시 끝 ---

    // gtm.js 이벤트 푸시 (GTM 로드 시작 알림)
    window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
    });

    // GTM 스크립트 태그 생성
    var gtmScript = document.createElement('script');
    gtmScript.id = 'gtm-script'; // 중복 방지용 ID
    gtmScript.async = true;
    gtmScript.src = 'https://data.betc.co.kr/gtm.js?id=GTM-56QPGJLB'; // 제공된 GTM ID 사용

    // head에 스크립트 추가
    document.head.appendChild(gtmScript);
}

function includeHTML(callback) {
    // GTM 스크립트 삽입 함수를 먼저 호출
    insertGtmScript();

    var elements = document.querySelectorAll('[include-html]');
    var totalElements = elements.length;
    var loadedCount = 0;

    // 콜백이 제공되지 않았을 경우를 대비한 빈 함수 설정
    callback = callback || function() {}; 

    if (totalElements === 0) {
        // 즉시 콜백 호출 (HTML 조각이 없는 경우)
        callback(); 
        return; // 함수 종료
    }

    elements.forEach(function(elmnt) {
        var file = elmnt.getAttribute("include-html");
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    elmnt.innerHTML = this.responseText;
                }
                if (this.status == 404) {
                    elmnt.innerHTML = "Page not found.";
                }
                elmnt.removeAttribute("include-html");
                loadedCount++;
                if (loadedCount === totalElements) {
                    // 모든 HTML 조각 로드 후 콜백 실행
                    callback();
                }
            }
        }
        xhr.open("GET", file, true);
        xhr.send();
    });
}
