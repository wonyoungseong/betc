let currentStage = 1;
let completedStages = 0;
let attemptedStages = 1; // 시도한 가장 높은 단계를 추적

const solutions = {
    1: `window.dataLayer.push({
  event: 'login'
});`,
    2: `window.dataLayer.push({
  event: 'login',
  userId: 'abc123',
  pricingPlan: 'premium'
});`,
    3: `window.dataLayer.push({
  event: 'login',
  userId: 'abc123',
  pricingPlan: 'premium',
  sessionNumber: 7
});`,
    4: `window.dataLayer = window.dataLayer || [];

window.dataLayer.push({
  // event: 로그인 이벤트
  event: 'login',
  // userId: 사용자 고유 식별자
  userId: 'abc123',
  // pricingPlan: 사용자의 요금제
  pricingPlan: 'premium',
  // sessionNumber: 현재 세션 번호
  sessionNumber: 7
});`
};

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    currentStage = parseInt(sessionStorage.getItem('currentStage')) || 1;
    completedStages = parseInt(sessionStorage.getItem('completedStages')) || 0;
    attemptedStages = parseInt(sessionStorage.getItem('attemptedStages')) || 1;
    updateAllStageElements();

    const codeInput = document.getElementById('codeInput');
    codeInput.addEventListener('input', saveCodeInput);

    const submitButton = document.getElementById('submitButton');
    submitButton.addEventListener('click', checkDataLayerPush);

    const solutionButton = document.getElementById('solutionButton');
    solutionButton.addEventListener('click', showSolution);
});

function updateAllStageElements() {
    updateChallengeInfo();
    updateStageContent();
    updateNavigator();
    updateCodeInput();
    updateSolutionButton();
}

function updateChallengeInfo() {
    const challengeInfo = document.getElementById('challengeInfo');
    const questions = {
        1: `<table class="challenge-table">
                <thead>
                    <tr><th>Key</th><th>Value</th></tr>
                </thead>
                <tbody>
                    <tr><td>event</td><td>login</td></tr>
                </tbody>
            </table>`,
        2: `<table class="challenge-table">
                <thead>
                    <tr><th>Key</th><th>Value</th></tr>
                </thead>
                <tbody>
                    <tr><td>event</td><td>login</td></tr>
                    <tr><td>userId</td><td>abc123</td></tr>
                    <tr><td>pricingPlan</td><td>premium</td></tr>
                </tbody>
            </table>`,
        3: `<table class="challenge-table">
                <thead>
                    <tr><th>Key</th><th>Value</th></tr>
                </thead>
                <tbody>
                    <tr><td>event</td><td>login</td></tr>
                    <tr><td>userId</td><td>abc123</td></tr>
                    <tr><td>pricingPlan</td><td>premium</td></tr>
                    <tr><td>sessionNumber</td><td>7</td></tr>
                </tbody>
            </table>
            <p><strong>주의:</strong> 텍스트는 따옴표로 묶고, 숫자는 따옴표 없이 입력하세요.</p>`,
        4: `<table class="challenge-table">
                <thead>
                    <tr><th>Key</th><th>Value</th></tr>
                </thead>
                <tbody>
                    <tr><td>event</td><td>login</td></tr>
                    <tr><td>userId</td><td>abc123</td></tr>
                    <tr><td>pricingPlan</td><td>premium</td></tr>
                    <tr><td>sessionNumber</td><td>7</td></tr>
                </tbody>
            </table>
            <p>4단계 과제:</p>
            <ol>
                <li>첫 줄에 다음 코드를 추가하세요: <code>window.dataLayer = window.dataLayer || [];</code></li>
                <li>3단계에서 작성한 dataLayer.push 코드를 그대로 사용하세요.</li>
                <li>각 키에 대한 주석을 추가하세요. 예: <code>// event: 로그인 이벤트</code></li>
            </ol>
            <p><strong>주의:</strong> 모든 단계를 정확히 따라야 합니다.</p>`
    };

    challengeInfo.innerHTML = `
        <h3>Stage ${currentStage} 문제:</h3>
        ${questions[currentStage]}
        <p>위의 지시사항에 따라 코드를 작성하세요:</p>
    `;
}

function updateStageContent() {
    const stageContentElement = document.getElementById('stage-content');
    if (stageContentElement) {
        const stageContent = {
            1: "Stage 1: Introduction - DataLayer 기초",
            2: "Stage 2: Intermediate Challenges - 복잡한 DataLayer 구조",
            3: "Stage 3: Advanced Problems - 다중 이벤트 처리",
            4: "Stage 4: Expert Level - DataLayer 최적화 및 디버깅"
        };
        
        stageContentElement.innerHTML = `
            <h2>${stageContent[currentStage]}</h2>
            <p>${getStageDescription(currentStage)}</p>
        `;
    }
}

function updateCodeInput() {
    const codeInput = document.getElementById('codeInput');
    const savedInput = sessionStorage.getItem(`stage${currentStage}Input`);
    console.log(`Loading input for stage ${currentStage}:`, savedInput);
    codeInput.value = savedInput || '';
}

function saveCodeInput() {
    const codeInput = document.getElementById('codeInput');
    sessionStorage.setItem(`stage${currentStage}Input`, codeInput.value);
    console.log(`Saving input for stage ${currentStage}:`, codeInput.value);
}

function updateNavigator() {
    const navigator = document.getElementById('navigator');
    navigator.innerHTML = '';
    for (let i = 1; i <= 4; i++) {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = `Stage ${i}`;
        link.onclick = () => navigateToStage(i);
        if (i <= completedStages) {
            link.style.color = 'green';
        } else if (i === currentStage) {
            link.style.color = 'blue';
        } else if (i <= attemptedStages) {
            link.style.color = 'orange'; // 시도했지만 완료하지 못한 단계
        } else {
            link.style.color = 'gray';
            link.style.pointerEvents = 'none'; // 아직 시도하지 않은 단계는 클릭 불가능
        }
        navigator.appendChild(link);
    }
}

function updateSolutionButton() {
    const solutionButton = document.getElementById('solutionButton');
    if (solutionButton) {
        solutionButton.onclick = () => showSolution();
    }
}

function navigateToStage(stageNumber) {
    if (stageNumber <= attemptedStages) {
        currentStage = stageNumber;
        sessionStorage.setItem('currentStage', currentStage);
        updateAllStageElements();
    } else {
        alert(`You need to complete stage ${stageNumber - 1} first.`);
    }
}

function checkDataLayerPush() {
    window.dataLayer = [];
    const codeInput = document.getElementById('codeInput').value;
    let isCorrect = false;
    let errorMessage = '';

    console.log('Current stage:', currentStage);
    console.log('User input:', codeInput);

    sessionStorage.setItem(`stage${currentStage}Input`, codeInput);

    try {
        eval(codeInput);
        const lastPush = window.dataLayer[window.dataLayer.length - 1];
        console.log('Evaluated dataLayer:', window.dataLayer);
        console.log('Last push:', lastPush);

        if (currentStage === 1) {
            isCorrect = lastPush && lastPush.event === 'login';
        } else if (currentStage === 2) {
            isCorrect = lastPush && 
                        lastPush.event === 'login' &&
                        lastPush.userId === 'abc123' &&
                        lastPush.pricingPlan === 'premium';
        } else if (currentStage === 3) {
            isCorrect = lastPush && 
                        lastPush.event === 'login' &&
                        lastPush.userId === 'abc123' &&
                        lastPush.pricingPlan === 'premium' &&
                        lastPush.sessionNumber === 7;
        } else if (currentStage === 4) {
            isCorrect = codeInput.includes('window.dataLayer = window.dataLayer || []') &&
                        lastPush && 
                        lastPush.event === 'login' &&
                        lastPush.userId === 'abc123' &&
                        lastPush.pricingPlan === 'premium' &&
                        lastPush.sessionNumber === 7 &&
                        codeInput.includes('//');
        }

        console.log('Is correct:', isCorrect);
    } catch (error) {
        errorMessage = `코드 실행 중 오류 발생: ${error.message}`;
        console.error('Error details:', error);
    }

    const resultElement = document.getElementById('result');
    if (isCorrect) {
        if (currentStage === 4) {
            const stage4CompletedThisSession = sessionStorage.getItem('stage4SessionComplete');
            if (stage4CompletedThisSession !== 'true') {
                console.log("Stage 4 completed for the first time this session. Triggering confetti!");
                triggerConfettiAnimation(7000);
                sessionStorage.setItem('stage4SessionComplete', 'true');
            }
        }

        if (currentStage > completedStages) {
            completedStages = currentStage;
            sessionStorage.setItem('completedStages', completedStages);
        }
        
        if (currentStage < 4) {
            resultElement.innerHTML = `<span style="color: green;">Great! ${currentStage}단계 완료. 다음 단계로 넘어갑니다.</span>`;
            saveCodeInput();
            currentStage++;
            attemptedStages = Math.max(attemptedStages, currentStage);
            sessionStorage.setItem('currentStage', currentStage);
            sessionStorage.setItem('attemptedStages', attemptedStages);
            setTimeout(() => {
                updateAllStageElements();
                resultElement.innerHTML = '';
            }, 1500);
        } else {
            resultElement.innerHTML = '<span style="color: green;">Congratulations! 모든 단계를 완료했습니다!</span>';
        }
        updateNavigator();

    } else {
        resultElement.innerHTML = `<span style="color: red;">${errorMessage || `${currentStage}단계가 완료되지 않았습니다. 다시 시도해주세요.`}</span>`;
        attemptedStages = Math.max(attemptedStages, currentStage);
        sessionStorage.setItem('attemptedStages', attemptedStages);
        updateNavigator();
    }

    console.log('Current stage after check:', currentStage);
    console.log('Completed stages:', completedStages);
}

function triggerConfettiAnimation(duration) {
    if (typeof confetti !== 'function') {
        console.error("Confetti library is not loaded.");
        return;
    }

    const endTime = Date.now() + duration;

    confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
    });

    const interval = setInterval(function() {
        if (Date.now() > endTime) {
            return clearInterval(interval);
        }

        confetti({
            particleCount: Math.random() * 50 + 50,
            spread: Math.random() * 60 + 60,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
            angle: Math.random() * 360,
            startVelocity: 25 + Math.random() * 10,
            ticks: 200 + Math.random() * 100
        });
    }, 300);
}

function showSolution() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${currentStage}단계 정답</h2>
            <pre><code id="solutionCode">${solutions[currentStage]}</code></pre>
            <button onclick="copySolution()">정답 복사</button>
            <button onclick="closeModal()">닫기</button>
            <p id="copyMessage" style="display:none; color: green;">정답이 클립보드에 복사되었습니다!</p>
        </div>
    `;
    document.body.appendChild(modal);

    document.addEventListener('keydown', handleEscKey);

    modal.addEventListener('click', handleOutsideClick);
}

function handleEscKey(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
}

function handleOutsideClick(event) {
    if (event.target.className === 'modal') {
        closeModal();
    }
}

function copySolution() {
    const solutionCode = document.getElementById('solutionCode');
    const textArea = document.createElement('textarea');
    textArea.value = solutionCode.textContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    const copyMessage = document.getElementById('copyMessage');
    copyMessage.style.display = 'block';
    setTimeout(() => {
        copyMessage.style.display = 'none';
    }, 2000);
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleEscKey);
    }
}

function getStageDescription(stage) {
    const descriptions = {
        1: "이 단계에서는 DataLayer의 기본 개념과 간단한 이벤트 푸시를 학습합니다.",
        2: "이 단계에서는 여러 속성을 가진 복잡한 DataLayer 구조를 다룹니다.",
        3: "이 단계에서는 여러 이벤트를 동시에 처리하는 방법을 학습합니다.",
        4: "이 단계에서는 DataLayer를 최적화하고 디버깅하는 고급 기술을 배웁니다."
    };
    return descriptions[stage] || "설명이 없습니다.";
}