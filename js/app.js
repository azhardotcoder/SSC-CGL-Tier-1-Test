// Global Variables
let allQuestions = [];
let currentTestSet = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let markedForReview = new Set();
let testStartTime;
let timerInterval;
let testDuration = 60 * 60; // 60 minutes in seconds

// NEW: User state & progress
let userName = localStorage.getItem('ssc_userName') || '';
let progressData = JSON.parse(localStorage.getItem('ssc_progress') || '{}');

// Current page detection
const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

// ===== SUBJECT FLOW =====
let subjectMap={}; // {subject:[questions]}

// Utility to persist progress
function saveProgress() {
    if (!currentTestSet) return;
    progressData[currentTestSet.id || currentTestSet.name] = {
        answers: userAnswers,
        marked: Array.from(markedForReview),
        timestamp: Date.now()
    };
    localStorage.setItem('ssc_progress', JSON.stringify(progressData));
}

// DOM Elements
const pages = {
    landing: document.getElementById('landing-page'),
    test: document.getElementById('test-page'),
    results: document.getElementById('results-page'),
    review: document.getElementById('review-page')
};

// NEW: Modal Elements
const nameModal = document.getElementById('name-modal');
const nameInput = document.getElementById('name-input');
const saveNameBtn = document.getElementById('save-name-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    startLiveClock();
    
    // Setup name button listener if it exists
    if (saveNameBtn && nameInput) {
        saveNameBtn.addEventListener('click', () => {
            const val = nameInput.value.trim();
            if (val) {
                userName = val;
                localStorage.setItem('ssc_userName', userName);
                const nameModal = document.getElementById('name-modal');
                if (nameModal) nameModal.classList.remove('active');
                applyUserName();
            }
        });
    }
    
    try {
        // First load questions
        await loadQuestions();
        
        // Then initialize based on current page
        switch(currentPage) {
            case 'index':
                checkUserName();
                displayHomeCards();
                setupLandingListeners();
                break;
            case 'test':
                loadTestState();
                setupTestListeners();
                break;
            case 'results':
                loadResultsState();
                setupResultsListeners();
                break;
            case 'review':
                loadReviewState();
                setupReviewListeners();
                break;
        }
    } catch (error) {
        console.error('Initialization error:', error);
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h3>Error Loading Questions</h3>
            <p>There was a problem loading the test questions. Please try:</p>
            <ol>
                <li>Refreshing the page</li>
                <li>Clearing your browser cache</li>
                <li>If the problem persists, contact support</li>
            </ol>
        `;
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }
});

// === PAGE-SPECIFIC INITIALIZATION ===

function loadTestState() {
    const testState = JSON.parse(localStorage.getItem('currentTestState'));
    if (!testState) {
        window.location.href = 'index.html';
        return;
    }
    
    currentTestSet = testState.currentTestSet;
    currentQuestions = currentTestSet.questions;
    currentQuestionIndex = testState.currentQuestionIndex || 0;
    userAnswers = testState.userAnswers || {};
    markedForReview = new Set(testState.markedForReview || []);
    testStartTime = testState.testStartTime || Date.now();
    
    applyUserName();
    displayQuestion(currentQuestionIndex);
    createQuestionPalette();
    startTimer();
}

function loadResultsState() {
    const resultsState = JSON.parse(localStorage.getItem('testResults'));
    if (!resultsState) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update results page elements
    const elements = {
        'test-name-result': resultsState.testName,
        'total-score': resultsState.score,
        'max-score': resultsState.maxScore,
        'correct-count': resultsState.correct,
        'incorrect-count': resultsState.incorrect,
        'unattempted-count': resultsState.unattempted,
        'accuracy': `${resultsState.accuracy}%`
    };
    
    // Update each element if it exists
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

function loadReviewState() {
    const reviewState = JSON.parse(localStorage.getItem('reviewState'));
    if (!reviewState) {
        window.location.href = 'results.html';
        return;
    }
    
    // Update test name
    const testNameEl = document.getElementById('test-name-review');
    if (testNameEl) {
        testNameEl.textContent = reviewState.testName;
    }
    
    // Display review
    displayReview(reviewState);
}

// === EVENT LISTENERS SETUP ===

function setupLandingListeners() {
    // Home cards click handling
    const homeCards = document.getElementById('home-cards');
    if (homeCards) {
        homeCards.addEventListener('click', e => {
            const card = e.target.closest('.hero-card');
            if (!card) return;
            
            const cardId = card.dataset.cardId;
            switch(cardId) {
                case 'quick10':
                    startRandomTest(10, 'Quick Test - 10 Q');
                    break;
                case 'quick20':
                    startRandomTest(20, 'Quick Practice - 20 Q');
                    break;
                case 'subject':
                    showSubjectPage();
                    break;
                case 'mocks':
                    showMockTests();
                    break;
            }
        });
    }

    // Subject cards click handling
    const subjectCards = document.getElementById('subject-cards');
    if (subjectCards) {
        subjectCards.addEventListener('click', e => {
            const card = e.target.closest('.test-set-card');
            if (!card) return;
            const subject = card.dataset.subject;
            if (subject) {
                showSizePage(subject);
            }
        });
    }

    // Size cards click handling
    const sizeCards = document.getElementById('size-cards');
    if (sizeCards) {
        sizeCards.addEventListener('click', e => {
            const card = e.target.closest('.test-set-card');
            if (!card) return;
            const subject = card.dataset.subject;
            const size = parseInt(card.dataset.size);
            if (subject && size) {
                startSubjectTest(subject, size);
            }
        });
    }

    // Back button handling
    const backToHome = document.getElementById('back-to-home');
    if (backToHome) {
        backToHome.addEventListener('click', showHome);
    }

    const backToSubjects = document.getElementById('back-to-subjects');
    if (backToSubjects) {
        backToSubjects.addEventListener('click', showSubjectPage);
    }
}

function setupTestListeners() {
    document.getElementById('prev-btn').addEventListener('click', previousQuestion);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('mark-review-btn').addEventListener('click', toggleMarkForReview);
    document.getElementById('submit-test-btn').addEventListener('click', confirmSubmit);
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.addEventListener('click', e => {
        const option = e.target.closest('.option');
        if (!option) return;
        selectOption(option.dataset.key);
    });
    
    const paletteGrid = document.getElementById('palette-grid');
    paletteGrid.addEventListener('click', e => {
        const item = e.target.closest('.palette-item');
        if (!item) return;
        navigateToQuestion(parseInt(item.dataset.index));
    });
}

function setupResultsListeners() {
    // Review answers button
    const reviewBtn = document.getElementById('review-answers-btn');
    if (reviewBtn) {
        reviewBtn.addEventListener('click', () => {
            window.location.href = 'review.html';
        });
    }
    
    // New test button
    const newTestBtn = document.getElementById('new-test-btn');
    if (newTestBtn) {
        newTestBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // Share result button
    const shareBtn = document.getElementById('share-result-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareResults);
    }
}

function setupReviewListeners() {
    const backBtn = document.getElementById('back-to-results-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'results.html';
        });
    }
}

// === NAVIGATION & STATE MANAGEMENT ===

function startRandomTest(num, label) {
    // Ensure we don't try to get more questions than available
    const availableCount = allQuestions.length;
    const questionCount = Math.min(num, availableCount);
    
    // Create a copy of allQuestions array
    const questions = [...allQuestions];
    
    // Fisher-Yates shuffle
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    
    // Take first 'questionCount' questions
    const selectedQuestions = questions.slice(0, questionCount);
    
    currentTestSet = {
        id: `rand_${num}_${Date.now()}`,
        name: label,
        questions: selectedQuestions
    };
    
    localStorage.setItem('currentTestState', JSON.stringify({
        currentTestSet,
        currentQuestionIndex: 0,
        userAnswers: {},
        markedForReview: [],
        testStartTime: Date.now()
    }));
    
    window.location.href = 'test.html';
}

function submitTest() {
    const results = calculateResults();
    
    // Save results and state before navigation
    localStorage.setItem('testResults', JSON.stringify(results));
    localStorage.setItem('reviewState', JSON.stringify({
        testName: currentTestSet.name,
        questions: currentQuestions,
        userAnswers,
        markedForReview: Array.from(markedForReview)
    }));
    
    // Navigate to results page
    window.location.href = 'results.html';
}

// Ask for name if not set
function checkUserName() {
    const nameModal = document.getElementById('nameModal');
    if (!nameModal) return;
    
    if (!userName) {
        nameModal.classList.add('active');
    } else {
        applyUserName();
    }
}

function applyUserName() {
    // Update any UI placeholders with the userName
    const nameEls = document.querySelectorAll('#candidate-name');
    nameEls.forEach(el => (el.textContent = userName));
    const displayEl = document.getElementById('candidate-display');
    if(displayEl) displayEl.textContent = userName;
}

// === NEW HOME/ROUTING SETUP ===
function displayHomeCards(){
    const home = document.getElementById('home-cards');
    home.innerHTML = '';
    const cards=[
        {id:'quick10',title:'Quick Test',desc:'10 Questions',questions:10},
        {id:'quick20',title:'Quick Practice',desc:'20 Questions',questions:20},
        {id:'subject',title:'Subject-wise Tests',desc:'Choose Subject',questions:null},
        {id:'mocks',title:'Full-length Mock Tests',desc:'100 Questions',questions:null}
    ];
    cards.forEach(c=>{
        const div=document.createElement('div');
        div.className='hero-card';
        div.dataset.cardId=c.id;
        div.innerHTML=`<h3>${c.title}</h3><p>${c.desc}</p><button class="hero-btn">Start</button>`;
        home.appendChild(div);
    });
}

function showHome(){
    hideAllHomeSections();
    const homeCards = document.getElementById('home-cards');
    if (homeCards) {
        homeCards.style.display = 'grid';
    }
}
function showMockTests(){
    hideAllHomeSections();
    document.getElementById('test-sets').style.display='grid';
}

// Modify createTestSets rename
function createTestSets() {
    window.testSets = [];
    const questionsPerSet = 100;
    
    // Create a copy and shuffle all questions
    const shuffledQuestions = [...allQuestions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }
    
    // Create test sets with non-overlapping questions
    const totalSets = Math.floor(shuffledQuestions.length / questionsPerSet);
    for (let i = 0; i < totalSets; i++) {
        const start = i * questionsPerSet;
        const end = start + questionsPerSet;
        const qs = shuffledQuestions.slice(start, end);
        const categories = [...new Set(qs.map(q => q.category))].sort();
        window.testSets.push({
            id: i + 1,
            name: `Mock Test ${String(i + 1).padStart(2, '0')}`,
            questions: qs,
            categories,
            questionCount: qs.length,
            startIndex: start + 1,
            endIndex: end
        });
    }
    
    // Create quick practice set with remaining questions
    const remainingQuestions = shuffledQuestions.slice(totalSets * questionsPerSet);
    const quickQuestions = remainingQuestions.slice(0, 20);
    window.quickPractice = {
        id: 'quick',
        name: 'Quick Practice',
        questions: quickQuestions,
        categories: [...new Set(quickQuestions.map(q => q.category))].sort(),
        questionCount: quickQuestions.length
    };
}

// After loadQuestions call home and mocks render
async function loadQuestions() {
    try {
        // Load from master questions file
        const response = await fetch('data/master_questions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const questions = await response.json();
        
        // Add all questions to the main array
        allQuestions = questions;
        
        // Build subject map
        subjectMap = {};
        questions.forEach(q => {
            const category = q.category || 'General';
            if (!subjectMap[category]) {
                subjectMap[category] = [];
            }
            subjectMap[category].push(q);
        });
        
        console.log(`Loaded ${allQuestions.length} questions across ${Object.keys(subjectMap).length} subjects`);
        
        // Initialize test sets
        createTestSets();
        
    } catch(err) {
        console.error('Error loading questions:', err);
        throw err; // Re-throw to be handled by the caller
    }
}

// Display test and quick practice cards
function displayTestSets() {
    const container = document.getElementById('test-sets');
    container.innerHTML = '';

    // Regular 100-Q test sets
    window.testSets.forEach(set => {
        const card = createTestCard(set);
        container.appendChild(card);
    });
}

function createTestCard(set, isQuick = false) {
    const card = document.createElement('div');
    card.className = `test-set-card ${isQuick ? 'quick-practice' : ''}`;
    card.innerHTML = `
        <div class="test-set-header">
            <h4 class="test-set-name">${set.name}</h4>
            <span class="test-set-number">${isQuick ? '20 Q' : 'Set ' + set.id}</span>
        </div>
        <div class="test-set-body">
            <div class="test-set-categories">
                ${set.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
            </div>
        </div>
        <div class="test-set-footer">
            <div class="test-set-stats">
                <span><i class="fas fa-question-circle"></i> ${set.questionCount} Questions</span>
            </div>
            <button class="start-test-btn" data-set-id="${set.id}">${isQuick ? 'Start Practice' : 'Start Test'}</button>
        </div>`;
    return card;
}

function startQuickPractice() {
    currentTestSet = window.quickPractice;
    beginTestFlow();
}

// Start a specific test set
function startTest(setId) {
    currentTestSet = window.testSets.find(set => set.id === setId);
    if (!currentTestSet) return;
    beginTestFlow();
}

function beginTestFlow() {
    currentQuestions = currentTestSet.questions;
    currentQuestionIndex = 0;
    userAnswers = {};
    markedForReview.clear();
    applyUserName(); // ensure name shown

    document.getElementById('roll-no').textContent = `ROLL${Date.now().toString().slice(-5)}`;

    showPage('test');
    displayQuestion(currentQuestionIndex);
    createQuestionPalette();
    startTimer();

    // Update test name display where applicable
    document.querySelector('.test-title').textContent = currentTestSet.name;
    document.getElementById('test-name-result').textContent = currentTestSet.name;
    document.getElementById('test-name-review').textContent = currentTestSet.name;
}

// Sample questions for testing (remove when you provide JSON)
function getSampleQuestions() {
    return [
        {
            id: 1,
            question: "What is the capital of India?",
            options: {
                A: "Mumbai",
                B: "Delhi",
                C: "Kolkata",
                D: "Chennai"
            },
            correctAnswer: "B",
            category: "General Knowledge"
        },
        {
            id: 2,
            question: "Which of the following is a prime number?",
            options: {
                A: "4",
                B: "6",
                C: "7",
                D: "8"
            },
            correctAnswer: "C",
            category: "Mathematics"
        }
        // Add more sample questions as needed
    ];
}

// Display current question
function displayQuestion(qIndex) {
    const question = currentQuestions[qIndex];
    document.getElementById('question-section').textContent = `Section: ${question.category}`;
    const cleanText = question.question.replace(/\s*\(Q\d+\)$/i,'');
    document.getElementById('question-text').innerHTML = `
        <strong>Q${qIndex + 1}.</strong> ${cleanText.replace(/\n/g, '<br>')}
    `;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    Object.entries(question.options).forEach(([key, value]) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'option';
        // Check if an answer for this question already exists
        const isChecked = userAnswers[qIndex] === key;
        if (isChecked) {
            optionEl.classList.add('selected');
        }
        
        optionEl.innerHTML = `
            <input type="radio" id="option${key}" name="option" value="${key}" ${isChecked ? 'checked' : ''}>
            <label for="option${key}">${value}</label>
        `;
        optionsContainer.appendChild(optionEl);
    });

    updateNavigationButtons();
    updatePalette();
}

// Select an option
function selectOption(optionKey) {
    userAnswers[currentQuestionIndex] = optionKey;
    document.querySelectorAll('.option').forEach(el => {
        const radio = el.querySelector('input[type="radio"]');
        if (radio.value === optionKey) {
            el.classList.add('selected');
        } else {
            el.classList.remove('selected');
        }
    });
    updatePalette();
    saveProgress();
}

// Navigate to next question
function nextQuestion() {
    // The answer is already saved when the user clicks an option.
    // This function just moves to the next question.
    if (currentQuestionIndex < currentQuestions.length - 1) {
        navigateToQuestion(currentQuestionIndex + 1);
    }
}

// Navigate to previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        navigateToQuestion(currentQuestionIndex - 1);
    }
}

// Navigate to specific question
function navigateToQuestion(qIndex) {
    if (qIndex >= 0 && qIndex < currentQuestions.length) {
        currentQuestionIndex = qIndex;
        displayQuestion(qIndex);
    }
}

// Mark question for review
function toggleMarkForReview() {
    if (markedForReview.has(currentQuestionIndex)) {
        markedForReview.delete(currentQuestionIndex);
    } else {
        markedForReview.add(currentQuestionIndex);
    }
    updatePalette();
    saveProgress();
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-test-btn');
    
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === currentQuestions.length - 1;
    
    // Show submit button on last question
    if (currentQuestionIndex === currentQuestions.length - 1) {
        submitBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';
    } else {
        submitBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
    }
}

// Create question palette
function createQuestionPalette() {
    const paletteGrid = document.getElementById('palette-grid');
    paletteGrid.innerHTML = '';
    
    currentQuestions.forEach((_, i) => {
        const item = document.createElement('div');
        item.className = 'palette-item';
        item.dataset.index = i;
        item.textContent = i + 1;
        paletteGrid.appendChild(item);
    });
}

// Update palette status
function updatePalette() {
    const items = document.querySelectorAll('.palette-item');
    items.forEach((item, i) => {
        item.classList.remove('answered', 'marked', 'answered-marked', 'unattempted', 'current');
        const isAnswered = userAnswers.hasOwnProperty(i);
        const isMarked = markedForReview.has(i);

        if (isAnswered && isMarked) {
            item.classList.add('answered-marked');
        } else if (isAnswered) {
            item.classList.add('answered');
        } else if (isMarked) {
            item.classList.add('marked');
        } else {
            item.classList.add('unattempted');
        }

        if (i === currentQuestionIndex) {
            item.classList.add('current');
        }
    });
}

// Start timer
function startTimer() {
    // Clear any existing timer to prevent multiple timers running
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    const endTime = Date.now() + testDuration * 1000;

    const updateTimerDisplay = () => {
        const remainingMilliseconds = Math.max(0, endTime - Date.now());

        const hours = Math.floor(remainingMilliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMilliseconds % (1000 * 60)) / 1000);

        document.getElementById('timer').textContent = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (remainingMilliseconds === 0) {
            clearInterval(timerInterval);
            submitTest();
        }
    };

    // Initial display
    updateTimerDisplay();

    // Update the timer every second
    timerInterval = setInterval(updateTimerDisplay, 1000);
}

// Confirm test submission
function confirmSubmit() {
    if (confirm('Are you sure you want to submit the test?')) {
        submitTest();
    }
}

// Calculate results
function calculateResults() {
    let correct = 0, incorrect = 0, unattempted = 0;
    currentQuestions.forEach((q, i) => {
        if (!userAnswers.hasOwnProperty(i)) {
            unattempted++;
        } else if (userAnswers[i] === q.correctAnswer) {
            correct++;
        } else {
            incorrect++;
        }
    });

    const score = (correct * 2) - (incorrect * 0.5);
    const totalAttempted = correct + incorrect;
    const accuracy = totalAttempted > 0 ? (correct / totalAttempted * 100).toFixed(2) : 0;
    
    return {
        testName: currentTestSet.name,
        score: score,
        maxScore: currentQuestions.length * 2,
        correct: correct,
        incorrect: incorrect,
        unattempted: unattempted,
        accuracy: accuracy
    };
}

// Show review page
function showReview() {
    displayReview();
    showPage('review');
}

// Display review
function displayReview(reviewState) {
    const reviewContainer = document.getElementById('review-container');
    if (!reviewContainer) return;
    
    reviewContainer.innerHTML = '';
    
    reviewState.questions.forEach((question, index) => {
        const userAnswer = reviewState.userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        const isUnattempted = !userAnswer;
        const isMarked = reviewState.markedForReview.includes(index);
        
        const reviewQuestion = document.createElement('div');
        reviewQuestion.className = `review-question ${isUnattempted ? 'unattempted' : (isCorrect ? 'correct' : 'incorrect')}`;
        
        let statusText = '';
        if (isUnattempted) {
            statusText = '<span class="status unattempted">Unattempted</span>';
        } else if (isCorrect) {
            statusText = '<span class="status correct">Correct</span>';
        } else {
            statusText = '<span class="status incorrect">Incorrect</span>';
        }
        
        if (isMarked) {
            statusText += '<span class="status marked">Marked for Review</span>';
        }
        
        reviewQuestion.innerHTML = `
            <div class="question-header">
                <h4>Question ${index + 1} ${statusText}</h4>
                <div class="question-category">${question.category || 'General'}</div>
            </div>
            <div class="question-content">
                <p>${question.question}</p>
                <div class="review-options">
                    ${Object.entries(question.options).map(([key, value]) => {
                        let optionClass = '';
                        if (key === question.correctAnswer) {
                            optionClass = 'correct';
                        } else if (key === userAnswer && !isCorrect) {
                            optionClass = 'incorrect';
                        }
                        
                        return `
                            <div class="review-option ${optionClass} ${key === userAnswer ? 'selected' : ''}">
                                <strong>${key})</strong> ${value}
                                ${key === question.correctAnswer ? '<span class="icon correct">✓</span>' : ''}
                                ${key === userAnswer && !isCorrect ? '<span class="icon incorrect">✗</span>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                ${question.explanation ? `
                    <div class="explanation">
                        <strong>Explanation:</strong> ${question.explanation}
                    </div>
                ` : ''}
            </div>
        `;
        
        reviewContainer.appendChild(reviewQuestion);
    });
}

// Reset test
function resetTest() {
    currentTestSet = null;
    currentQuestions = [];
    currentQuestionIndex = 0;
    userAnswers = {};
    markedForReview.clear();
    showPage('landing');
}

// Show specific page
function showPage(pageName) {
    Object.values(pages).forEach(page => {
        page.classList.remove('active');
    });
    pages[pageName].classList.add('active');
}

// Show results page
function showResults() {
    showPage('results');
}

// Add CSS for review status indicators
const style = document.createElement('style');
style.textContent = `
    .status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-left: 10px;
    }
    
    .status.correct {
        background: #d4edda;
        color: #155724;
    }
    
    .status.incorrect {
        background: #f8d7da;
        color: #721c24;
    }
    
    .status.unattempted {
        background: #e2e3e5;
        color: #383d41;
    }
`;
document.head.appendChild(style);

// Utility functions
function changeFontSize(delta) {
    const questionBody = document.querySelector('.question-body');
    let currentSize = parseFloat(window.getComputedStyle(questionBody, null).getPropertyValue('font-size'));
    questionBody.style.fontSize = `${currentSize + delta}px`;
}

function startLiveClock() {
    const updateClock = () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        
        // Update all clock elements
        const clockElements = document.querySelectorAll('.live-clock');
        clockElements.forEach(el => {
            el.textContent = timeString;
        });
    };

    updateClock(); // Initial call
    setInterval(updateClock, 1000); // Update every second
}

function shareResults() {
    const text = `I scored ${document.getElementById('total-score').textContent} / ${document.getElementById('max-score').textContent} in ${currentTestSet.name}!`;
    if (navigator.share) {
        navigator.share({ title: 'SSC CGL Mock Test Result', text }).catch(err => console.error('Share failed:', err));
    } else {
        navigator.clipboard.writeText(text).then(() => alert('Result copied to clipboard!'));
    }
}

// Helper stub: previously missing; ensures results page transition works without errors
function prepareReviewPage(){ /* currently handled in displayReview */ }

function buildSubjectMap(){
    subjectMap={};
    allQuestions.forEach(q=>{
        const key=q.category||'General';
        if(!subjectMap[key]) subjectMap[key]=[];
        subjectMap[key].push(q);
    });
}

function showSubjectPage() {
    hideAllHomeSections();
    const sec = document.getElementById('subject-section');
    sec.style.display = 'block';
    const container = document.getElementById('subject-cards');
    container.innerHTML = '';
    
    // Sort subjects alphabetically
    const subjects = Object.keys(subjectMap).sort();
    
    subjects.forEach(sub => {
        const card = document.createElement('div');
        card.className = 'test-set-card';
        card.dataset.subject = sub;
        card.innerHTML = `
            <div class="test-set-header">
                <h4 class="test-set-name">${sub}</h4>
                <p class="question-count">${subjectMap[sub].length} questions available</p>
            </div>
            <div class="test-set-footer">
                <button class="hero-btn">Select Size</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function showSizePage(subject) {
    hideAllHomeSections();
    const sizeSection = document.getElementById('size-section');
    sizeSection.style.display = 'block';
    document.getElementById('size-section-title').textContent = `${subject} – Choose Test Size`;
    
    const container = document.getElementById('size-cards');
    container.innerHTML = '';
    const sizes = [10, 20, 50, 100];
    const availableQuestions = subjectMap[subject].length;
    
    sizes.forEach(sz => {
        if (availableQuestions >= sz) {
            const card = document.createElement('div');
            card.className = 'test-set-card';
            card.dataset.subject = subject;
            card.dataset.size = sz;
            card.innerHTML = `
                <div class="test-set-header">
                    <h4 class="test-set-name">${sz} Questions</h4>
                    <p class="duration">${Math.round(sz * 1.2)} minutes</p>
                </div>
                <div class="test-set-footer">
                    <button class="hero-btn">Start Test</button>
                </div>
            `;
            container.appendChild(card);
        }
    });
}

function startSubjectTest(subject, size) {
    // Create a copy of subject questions
    const questions = [...subjectMap[subject]];
    
    // Fisher-Yates shuffle
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    
    // Take first 'size' questions
    const selectedQuestions = questions.slice(0, size);
    
    currentTestSet = {
        id: `${subject}_${size}_${Date.now()}`,
        name: `${subject} Test - ${size} Questions`,
        questions: selectedQuestions,
        category: subject,
        questionCount: selectedQuestions.length
    };
    
    // Start the test
    localStorage.setItem('currentTestState', JSON.stringify({
        currentTestSet,
        currentQuestionIndex: 0,
        userAnswers: {},
        markedForReview: [],
        testStartTime: Date.now()
    }));
    
    window.location.href = 'test.html';
}

function hideAllHomeSections() {
    const sections = ['home-cards', 'test-sets', 'subject-section', 'size-section'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}

function renderHome() {
    hideAllHomeSections();
    displayHomeCards();
    document.getElementById('home-cards').style.display = 'grid';
}

function renderMockTests() {
    hideAllHomeSections();
    displayTestSets();
    document.getElementById('test-sets').style.display = 'grid';
} 