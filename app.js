// ===============================================================
// LOGIN / AUTH LOGIC
// ===============================================================

const loginOverlay   = document.getElementById('login-overlay');
const navUserArea    = document.getElementById('nav-user-area');
const navUsername    = document.getElementById('nav-username');
const mainNavLinks   = document.getElementById('main-nav-links');

/** Check if a user is already logged in from a previous session */
function checkExistingSession() {
    const savedUser = localStorage.getItem('hh_user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        revealApp(user.name, false); // No animation needed on auto-login
    }
}

/** Fade the login overlay out and reveal the main app */
function revealApp(name, animate = true) {
    if (animate) {
        loginOverlay.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        loginOverlay.style.opacity   = '0';
        loginOverlay.style.transform = 'scale(1.04)';
        setTimeout(() => {
            loginOverlay.style.display = 'none';
        }, 700);
    } else {
        loginOverlay.style.display = 'none';
    }

    document.body.classList.remove('login-active');

    // Show user info in navbar
    navUsername.textContent   = `Hello, ${name.split(' ')[0]} 💖`;
    navUserArea.style.display = 'flex';
}

/** Handle Login form submission */
function handleLogin(e) {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl    = document.getElementById('login-error');

    // Retrieve registered accounts from localStorage
    const accounts = JSON.parse(localStorage.getItem('hh_accounts') || '[]');
    const match    = accounts.find(a => a.email === email && a.password === password);

    if (match) {
        errEl.classList.add('hidden');
        localStorage.setItem('hh_user', JSON.stringify({ name: match.name, email: match.email }));
        revealApp(match.name);
    } else {
        // Allow demo login with any credentials if no accounts exist
        if (accounts.length === 0) {
            const demoName = email.split('@')[0] || 'Friend';
            localStorage.setItem('hh_user', JSON.stringify({ name: demoName, email }));
            revealApp(demoName);
        } else {
            errEl.classList.remove('hidden');
            setTimeout(() => errEl.classList.add('hidden'), 4000);
        }
    }
}

/** Handle Sign Up form submission */
function handleSignUp(e) {
    e.preventDefault();
    const name     = document.getElementById('signup-name').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const successEl = document.getElementById('signup-success');

    const accounts = JSON.parse(localStorage.getItem('hh_accounts') || '[]');
    accounts.push({ name, email, password });
    localStorage.setItem('hh_accounts', JSON.stringify(accounts));
    localStorage.setItem('hh_user', JSON.stringify({ name, email }));

    successEl.classList.remove('hidden');
    setTimeout(() => {
        successEl.classList.add('hidden');
        revealApp(name);
    }, 1500);
}

/** Switch between Login & Sign Up tabs */
function switchAuthTab(tab) {
    const loginForm   = document.getElementById('login-form');
    const signupForm  = document.getElementById('signup-form');
    const tabLogin    = document.getElementById('tab-login');
    const tabSignup   = document.getElementById('tab-signup');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
    } else {
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
    }
}

/** Toggle password visibility */
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon  = btn.querySelector('i');
    if (input.type === 'password') {
        input.type    = 'text';
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        input.type    = 'password';
        icon.className = 'fa-solid fa-eye';
    }
}

/** Log the user out and show the login page again */
function handleLogout() {
    localStorage.removeItem('hh_user');
    navUserArea.style.display = 'none';
    document.body.classList.add('login-active');

    // Reset and show overlay
    loginOverlay.style.display   = '';
    loginOverlay.style.opacity   = '0';
    loginOverlay.style.transform = 'scale(0.96)';
    setTimeout(() => {
        loginOverlay.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        loginOverlay.style.opacity    = '1';
        loginOverlay.style.transform  = 'scale(1)';
    }, 20);

    // Reset forms
    document.getElementById('login-form').reset();
    document.getElementById('signup-form').reset();
    switchAuthTab('login');
}

// Expose auth functions globally (called from HTML onclick)
window.handleLogin    = handleLogin;
window.handleSignUp   = handleSignUp;
window.switchAuthTab  = switchAuthTab;
window.togglePassword = togglePassword;
window.handleLogout   = handleLogout;

// Auto-login if session exists
checkExistingSession();


// ================= NAVIGATION LOGIC =================
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

function navigateTo(targetId) {
    // Update buttons
    navBtns.forEach(btn => {
        if (btn.dataset.target === targetId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update views
    views.forEach(view => {
        if (view.id === targetId) {
            view.classList.remove('hidden');
            view.classList.add('active-view');
        } else {
            view.classList.add('hidden');
            view.classList.remove('active-view');
        }
    });

    // Close mobile menu if open
    navLinks.classList.remove('show');
}

// Attach event listeners to nav buttons
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navigateTo(btn.dataset.target);
    });
});

// Mobile menu toggle
mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('show');
});

// Expose navigateTo globally for inline onclick handlers
window.navigateTo = navigateTo;


// ================= BMI CALCULATOR =================
const heightInput = document.getElementById('height-input');
const weightInput = document.getElementById('weight-input');
const heightVal = document.getElementById('height-val');
const weightVal = document.getElementById('weight-val');
const calcBmiBtn = document.getElementById('calculate-bmi-btn');
const bmiResultBox = document.getElementById('bmi-result-box');
const bmiScoreEl = document.getElementById('bmi-score');
const bmiCategoryEl = document.getElementById('bmi-category');
const bmiTipsEl = document.getElementById('bmi-tips');
const bmiDietChartEl = document.getElementById('bmi-diet-chart');

const dietCharts = {
    female: {
        underweight: `
            <h5>🌸 Your Personal Nourishment Plan</h5>
            <ul>
                <li><strong>Breakfast:</strong> Stuffed paratha with curd or a large bowl of oats with nuts & honey.</li>
                <li><strong>Lunch:</strong> 2 rotis, a bowl of dal, seasonal veg, and a portion of paneer or chicken.</li>
                <li><strong>Snack:</strong> Banana smoothie or a handful of mixed nuts with a glass of milk.</li>
                <li><strong>Dinner:</strong> Rice/Roti with thick dal, veggies, and a small dessert like jaggery.</li>
            </ul>
        `,
        normal: `
            <h5>✨ Your Balanced Wellness Plan</h5>
            <ul>
                <li><strong>Breakfast:</strong> Vegetable Poha, Upma, or 2 boiled eggs with whole wheat toast.</li>
                <li><strong>Lunch:</strong> 1-2 rotis, large bowl of dal, leafy greens, and a cup of curd.</li>
                <li><strong>Snack:</strong> Seasonal fruit or roasted makhana (foxnuts).</li>
                <li><strong>Dinner:</strong> Grilled protein (tofu/fish/paneer) with sautéed veggies and a light soup.</li>
            </ul>
        `,
        overweight: `
            <h5>🌿 Your Mindful Energy Plan</h5>
            <ul>
                <li><strong>Breakfast:</strong> Moong dal chilla with green chutney or a fruit & yogurt bowl.</li>
                <li><strong>Lunch:</strong> 1 multigrain roti, massive bowl of salad, and a light dal.</li>
                <li><strong>Snack:</strong> Green tea with 2 soaked walnuts or an apple.</li>
                <li><strong>Dinner:</strong> Vegetable soup followed by a small portion of brown rice and steamed veggies.</li>
            </ul>
        `,
        obese: `
            <h5>🌱 Your Health Transformation Plan</h5>
            <ul>
                <li><strong>Breakfast:</strong> Sprouted salad with lemon or a high-fiber smoothie (no sugar).</li>
                <li><strong>Lunch:</strong> Clear veg soup, 1 small bajra/jowar roti, and plenty of stir-fried greens.</li>
                <li><strong>Snack:</strong> Coconut water or cucumber slices with a pinch of black salt.</li>
                <li><strong>Dinner:</strong> Large bowl of boiled pulses/lentils with a side of steamed broccoli/cauliflower.</li>
            </ul>
        `
    },
    male: {
        underweight: `
            <h5>💪 Your Muscle Gain Plan</h5>
            <ul>
                <li><strong>Breakfast:</strong> 3-4 eggs, whole wheat bread, and a peanut butter banana shake.</li>
                <li><strong>Lunch:</strong> 3 rotis, large bowl of dal/beans, and a good portion of lean meat or paneer.</li>
                <li><strong>Snack:</strong> Protein bar or a bowl of sweet potato chaat.</li>
                <li><strong>Dinner:</strong> Large bowl of brown rice with chicken/soy curry and a glass of milk before bed.</li>
            </ul>
        `,
        normal: `
            <h5>⚡ Your Vitality Maintenance Plan</h5>
            <ul>
                <li><strong>Breakfast:</strong> Omelette with veggies or Multigrain paratha with a bowl of curd.</li>
                <li><strong>Lunch:</strong> 2 rotis, dal, mixed veg curry, and a small portion of rice.</li>
                <li><strong>Snack:</strong> Handful of almonds or a glass of fresh buttermilk.</li>
                <li><strong>Dinner:</strong> Grilled fish/chicken or Tofu stir-fry with plenty of seasonal vegetables.</li>
            </ul>
        `,
        overweight: `
            <h5>🏃 Your Active Lean Plan</h5>
            <ul>
                <li><strong>Breakfast:</strong> Besan chilla or 2 egg whites with steamed veggies.</li>
                <li><strong>Lunch:</strong> 1 roti, large bowl of dal, and double the portion of salad/sabzi.</li>
                <li><strong>Snack:</strong> 1 citrus fruit or a few roasted chickpeas (chana).</li>
                <li><strong>Dinner:</strong> Roasted chicken/paneer with a bowl of clear vegetable soup.</li>
            </ul>
        `,
        obese: `
            <h5>📉 Your Weight Management Plan</h5>
            <ul>
                <li><strong>Breakfast:</strong> Vegetable oats (no oil) or a large bowl of papaya/watermelon.</li>
                <li><strong>Lunch:</strong> 1 jowar roti, a bowl of yellow dal (no tadka), and steamed spinach.</li>
                <li><strong>Snack:</strong> Green tea or a few slices of carrot/beetroot.</li>
                <li><strong>Dinner:</strong> Boiled legumes with steamed vegetables and a squeeze of lemon.</li>
            </ul>
        `
    }
};

// Update labels on slider move
heightInput.addEventListener('input', (e) => heightVal.innerText = e.target.value);
weightInput.addEventListener('input', (e) => weightVal.innerText = e.target.value);

calcBmiBtn.addEventListener('click', () => {
    const heightM = parseFloat(heightInput.value) / 100;
    const weightKg = parseFloat(weightInput.value);
    
    if (heightM > 0 && weightKg > 0) {
        const bmi = (weightKg / (heightM * heightM)).toFixed(1);
        bmiScoreEl.innerText = bmi;
        
        const gender = document.querySelector('input[name="gender"]:checked').value;
        
        let category = '';
        let className = '';
        let tip = '';
        let chartKey = '';

        if (bmi < 18.5) {
            category = 'Underweight';
            className = 'underweight';
            tip = 'You may need to gain some weight. Consider a diet rich in nutrients and protein.';
            chartKey = 'underweight';
        } else if (bmi >= 18.5 && bmi <= 24.9) {
            category = 'Normal Weight';
            className = 'normal-weight';
            tip = 'You are in a healthy weight range! Keep maintaining your balanced diet and regular exercise.';
            chartKey = 'normal';
        } else if (bmi >= 25 && bmi <= 29.9) {
            category = 'Overweight';
            className = 'overweight';
            tip = 'You are slightly above the recommended weight range. Focus on whole foods and daily physical activity.';
            chartKey = 'overweight';
        } else {
            category = 'Obese';
            className = 'obese';
            tip = 'Your BMI indicates obesity. Please consult a doctor for a tailored plan.';
            chartKey = 'obese';
        }

        bmiCategoryEl.innerText = category;
        bmiCategoryEl.className = className;
        bmiTipsEl.innerText = tip;
        
        // Inject Diet Chart
        bmiDietChartEl.innerHTML = dietCharts[gender][chartKey];
        
        bmiResultBox.classList.remove('hidden');
    }
});


// ================= PERIOD TRACKER =================
const lastPeriodDateInput = document.getElementById('last-period-date');
const cycleLengthInput = document.getElementById('cycle-length');
const savePeriodBtn = document.getElementById('save-period-btn');
const daysLeftNumber = document.getElementById('days-left-number');
const nextPeriodText = document.getElementById('next-period-text');
const lastPeriodRecord = document.getElementById('last-period-record');
const lastPeriodDisplay = document.getElementById('last-period-display');
const periodReminderEl = document.getElementById('period-reminder');
const reminderMessageEl = document.getElementById('reminder-message');

function loadTrackerData() {
    const savedDate = localStorage.getItem('lastPeriodDate');
    const savedCycle = localStorage.getItem('cycleLength');
    
    if (savedDate && savedCycle) {
        lastPeriodDateInput.value = savedDate;
        cycleLengthInput.value = savedCycle;
        
        // Show last period record
        const formattedLastDate = new Date(savedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        lastPeriodDisplay.innerText = formattedLastDate;
        lastPeriodRecord.classList.remove('hidden');
        
        calculateNextPeriod(savedDate, parseInt(savedCycle));
    }
}

function calculateNextPeriod(startDateStr, cycleDays) {
    const startDate = new Date(startDateStr);
    const nextDate = new Date(startDate);
    nextDate.setDate(startDate.getDate() + cycleDays);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const timeDiff = nextDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    nextPeriodText.innerHTML = `Predicted next period: <strong>${nextDate.toLocaleDateString(undefined, options)}</strong>`;
    
    // Period Reminder Logic
    if (daysDiff > 0 && daysDiff <= 3) {
        periodReminderEl.classList.remove('hidden');
        reminderMessageEl.innerHTML = `Your period is starting in <strong>${daysDiff} day${daysDiff > 1 ? 's' : ''}</strong>. Stay hydrated and keep your essentials ready! 🌸`;
    } else if (daysDiff === 0) {
        periodReminderEl.classList.remove('hidden');
        reminderMessageEl.innerHTML = `Your period is predicted for <strong>Today</strong>! Take it easy and be prepared. 💖`;
    } else {
        periodReminderEl.classList.add('hidden');
    }
    
    if (daysDiff < 0) {
        const lateDays = Math.abs(daysDiff);
        daysLeftNumber.innerText = `${lateDays} Day${lateDays > 1 ? 's' : ''}`;
        daysLeftNumber.style.fontSize = "1.8rem";
        daysLeftNumber.style.color = "var(--primary-dark)";
        document.querySelector('.days-text').innerText = "Late";
    } else if (daysDiff === 0) {
        daysLeftNumber.innerText = "Today";
        daysLeftNumber.style.fontSize = "2.5rem";
        daysLeftNumber.style.color = "var(--primary)";
        document.querySelector('.days-text').innerText = "Due";
    } else {
        daysLeftNumber.innerText = daysDiff;
        daysLeftNumber.style.fontSize = "3.5rem";
        daysLeftNumber.style.color = "var(--primary-dark)";
        document.querySelector('.days-text').innerText = "Days Left";
    }
}

savePeriodBtn.addEventListener('click', () => {
    const dateVal = lastPeriodDateInput.value;
    const cycleVal = cycleLengthInput.value;
    
    if (dateVal && cycleVal) {
        localStorage.setItem('lastPeriodDate', dateVal);
        localStorage.setItem('cycleLength', cycleVal);
        
        // Show last period record
        const formattedLastDate = new Date(dateVal).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        lastPeriodDisplay.innerText = formattedLastDate;
        lastPeriodRecord.classList.remove('hidden');
        
        calculateNextPeriod(dateVal, parseInt(cycleVal));
        alert('Data saved successfully!');
    } else {
        alert('Please enter a valid date and cycle length.');
    }
});

// Initialize tracker on load
loadTrackerData();


// ================= LEARN TABS =================
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        tabContents.forEach(content => {
            if (content.id === `tab-${targetTab}`) {
                content.classList.remove('hidden');
                content.classList.add('active');
            } else {
                content.classList.add('hidden');
                content.classList.remove('active');
            }
        });
    });
});


// ================= QUIZ LOGIC =================
const allQuizData = [
    { question: "What is considered a normal length for a menstrual cycle?", options: ["10-15 days", "21-35 days", "40-50 days", "Exactly 28 days always"], correct: 1 },
    { question: "Which hormone is primarily responsible for triggering ovulation?", options: ["Estrogen", "Progesterone", "Luteinizing Hormone (LH)", "Testosterone"], correct: 2 },
    { question: "What is a common symptom of PCOS?", options: ["Low blood sugar", "Irregular periods", "Excessive height growth", "Perfectly clear skin"], correct: 1 },
    { question: "Which vitamin is especially important during Menopause for bone health?", options: ["Vitamin C", "Vitamin D", "Vitamin B12", "Vitamin A"], correct: 1 },
    { question: "What is the primary function of the ovaries?", options: ["Produce eggs and hormones", "Digest food", "Filter blood", "Pump oxygen"], correct: 0 },
    { question: "At what age does menopause typically begin?", options: ["20s to 30s", "45 to 55 years", "After 65 years", "During puberty"], correct: 1 },
    { question: "Which of the following can help alleviate menstrual cramps?", options: ["Drinking ice water", "Applying a heat pad", "Eating extra sugar", "Standing on one leg"], correct: 1 },
    { question: "What does BMI stand for?", options: ["Body Mass Indicator", "Basal Metabolic Index", "Body Mass Index", "Bone Mass Identity"], correct: 2 },
    { question: "What lifestyle change is most recommended for managing PCOD/PCOS?", options: ["Sleeping 4 hours a day", "Regular exercise and a balanced diet", "Drinking exclusively juice", "Avoiding all fats"], correct: 1 },
    { question: "What is ovulation?", options: ["The shedding of the uterine lining", "The release of an egg from an ovary", "The end of menstrual cycles", "The fertilization of an egg"], correct: 1 }
];

let activeQuizQuestions = [];
let currentQuestion = 0;
let score = 0;

const startQuizBtn = document.getElementById('start-quiz-btn');
const restartQuizBtn = document.getElementById('restart-quiz-btn');
const quizStart = document.getElementById('quiz-start');
const quizActive = document.getElementById('quiz-active');
const quizResult = document.getElementById('quiz-result');
const questionText = document.getElementById('question-text');
const quizOptions = document.getElementById('quiz-options');
const quizScoreEl = document.getElementById('quiz-score');

startQuizBtn.addEventListener('click', startQuiz);
restartQuizBtn.addEventListener('click', startQuiz);

function shuffleArray(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

function startQuiz() {
    activeQuizQuestions = shuffleArray(allQuizData).slice(0, 5); // Pick 5 random questions
    currentQuestion = 0;
    score = 0;
    quizStart.classList.add('hidden');
    quizResult.classList.add('hidden');
    quizActive.classList.remove('hidden');
    loadQuestion();
}

function loadQuestion() {
    const q = activeQuizQuestions[currentQuestion];
    questionText.innerText = `Question ${currentQuestion + 1}/${activeQuizQuestions.length}: ${q.question}`;
    quizOptions.innerHTML = '';
    
    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.classList.add('quiz-option-btn');
        btn.innerText = opt;
        btn.addEventListener('click', () => checkAnswer(index, btn));
        quizOptions.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, btn) {
    const q = activeQuizQuestions[currentQuestion];
    const allBtns = quizOptions.querySelectorAll('.quiz-option-btn');
    
    // Disable all buttons
    allBtns.forEach(b => b.style.pointerEvents = 'none');
    
    if (selectedIndex === q.correct) {
        btn.classList.add('correct');
        score++;
    } else {
        btn.classList.add('wrong');
        allBtns[q.correct].classList.add('correct');
    }
    
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < activeQuizQuestions.length) {
            loadQuestion();
        } else {
            showResults();
        }
    }, 1500);
}

function showResults() {
    quizActive.classList.add('hidden');
    quizResult.classList.remove('hidden');
    document.getElementById('quiz-result').querySelector('p').innerHTML = `You scored <span id="quiz-score">${score}</span> out of ${activeQuizQuestions.length}.`;
}

// ================= DOCTORS SEARCH =================
const doctorsData = [
    { name: "Dr. Anjali Sharma", location: "Delhi", phone: "+91 98765 43210", address: "Connaught Place, New Delhi", exp: "15 Years" },
    { name: "Dr. Ritu Verma", location: "Delhi", phone: "+91 98765 11223", address: "Saket, New Delhi", exp: "10 Years" },
    { name: "Dr. Sneha Patil", location: "Mumbai", phone: "+91 91234 56789", address: "Bandra West, Mumbai", exp: "12 Years" },
    { name: "Dr. Kavita Desai", location: "Mumbai", phone: "+91 99887 76655", address: "Andheri East, Mumbai", exp: "20 Years" },
    { name: "Dr. Priya Reddy", location: "Bangalore", phone: "+91 98888 77777", address: "Indiranagar, Bangalore", exp: "8 Years" },
    { name: "Dr. Meena Iyer", location: "Chennai", phone: "+91 94444 33333", address: "Adyar, Chennai", exp: "25 Years" },
    { name: "Dr. Suman Rao", location: "Hyderabad", phone: "+91 93333 22222", address: "Banjara Hills, Hyderabad", exp: "18 Years" },
    { name: "Dr. Neha Gupta", location: "Pune", phone: "+91 92222 11111", address: "Koregaon Park, Pune", exp: "11 Years" }
];

const searchDoctorBtn = document.getElementById('search-doctor-btn');
const locationInput = document.getElementById('location-input');
const doctorResults = document.getElementById('doctor-results');
const featuredDoctors = document.getElementById('featured-doctors');

if(searchDoctorBtn) {
    searchDoctorBtn.addEventListener('click', () => {
        const query = locationInput.value.toLowerCase().trim();
        doctorResults.innerHTML = ''; // Clear previous results
        doctorResults.classList.remove('hidden');
        if (featuredDoctors) featuredDoctors.classList.add('hidden');
        
        if (!query) {
            doctorResults.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Please enter a city name to search.</p>';
            if (featuredDoctors) featuredDoctors.classList.remove('hidden');
            return;
        }
        
        const filteredDocs = doctorsData.filter(doc => doc.location.toLowerCase().includes(query));
        
        if (filteredDocs.length === 0) {
            doctorResults.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No gynaecologists found near that location. Try another city like Delhi, Mumbai, or Bangalore.</p>';
            return;
        }
        
        filteredDocs.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'doctor-card fade-in';
            card.innerHTML = `
                <div class="doctor-header">
                    <div class="doc-avatar"><i class="fa-solid fa-user-doctor"></i></div>
                    <div>
                        <h3>${doc.name}</h3>
                        <p style="color:var(--primary-dark); font-size:0.85rem; margin-top:2px;"><strong>Experience:</strong> ${doc.exp}</p>
                    </div>
                </div>
                <p><i class="fa-solid fa-location-dot"></i> ${doc.address}</p>
                <p><i class="fa-solid fa-phone"></i> ${doc.phone}</p>
            `;
            doctorResults.appendChild(card);
        });
    });
}


// ================================================================
// CHATBOT – HerBot 💖
// ================================================================

const chatKnowledge = [
    { keys: ['hi','hello','hey','hii','heyy','namaste'], reply: "Hi there, gorgeous! 🌸 I'm HerBot, your personal wellness companion. Ask me about your cycle, nutrition, PCOS, mood swings — anything! 💕" },
    { keys: ['how are you','how r u'], reply: "I'm blooming like a flower today! 🌺 Thanks for asking. How can I help YOU feel amazing today? ✨" },
    { keys: ['thank','thanks','ty','thankyou'], reply: "You're so welcome! Remember, you're doing amazing 💖 Is there anything else I can help with?" },
    { keys: ['bye','goodbye','see you'], reply: "Take care of yourself, lovely! 🌷 Come back anytime — I'm always here for you! 💗" },

    { keys: ['period','periods','menstruation','cycle','menstrual'], reply: "Your menstrual cycle has 4 phases: Menstrual (days 1-5), Follicular (days 1-13), Ovulation (day ~14), and Luteal (days 15-28). Each phase has unique energy levels and nutritional needs! 🌸 Check the 🍓 Eat by Phase tab in Learn for food tips!" },
    { keys: ['late period','missed period','period late','period miss'], reply: "A late period can happen due to stress, weight changes, illness, or hormonal imbalances. If it's more than 7 days late and you're sexually active, consider a pregnancy test. If it keeps happening, consult a gynaecologist! 🩺💕" },
    { keys: ['cramps','period pain','dysmenorrhea'], reply: "Period cramps are caused by prostaglandins making the uterus contract. 💊 Relief tips: apply a heat pad 🔥, try ginger tea 🫚, magnesium-rich foods like dark chocolate 🍫, gentle yoga, and ibuprofen if needed. Severe cramps may need a doctor's check!" },
    { keys: ['heavy period','heavy flow','lots of blood'], reply: "Heavy periods could signal fibroids, endometriosis, or hormonal imbalance. Track your flow and talk to a doctor if it's affecting daily life. Iron-rich foods like spinach 🥬 can help with blood loss!" },
    { keys: ['irregular period','irregular cycle'], reply: "Irregular cycles can be caused by stress, PCOS, thyroid issues, or extreme weight changes. Tracking your period with our Period Tracker can help spot patterns! If irregular for 3+ months, see a doctor. 🩺" },

    { keys: ['ovulation','ovulate','fertile window','fertile'], reply: "Ovulation usually happens around day 14 of a 28-day cycle. Signs: increased cervical mucus (egg-white texture), slight temp rise, mild one-sided pelvic pain, and heightened energy! 🥚✨ This is your most fertile window." },

    { keys: ['pcos','pcod','polycystic'], reply: "PCOS affects 1 in 5 women in India! 🌺 Key symptoms: irregular periods, weight gain, acne, excess facial hair, and hair thinning. Management: low-glycemic diet, regular exercise, stress reduction, and sometimes medication. You are NOT alone! 💕" },
    { keys: ['pcos diet','pcos food','eat pcos'], reply: "For PCOS: ✅ EAT — leafy greens, lentils, brown rice, berries, nuts, salmon, flaxseeds, cinnamon. ❌ AVOID — refined sugar, white bread, fried foods, excess dairy. Myo-inositol supplements may also help — ask your doctor! 🥗" },
    { keys: ['pcos symptoms','pcos signs'], reply: "PCOS symptoms include: irregular periods, weight gain (especially belly), acne, excess body hair, hair loss from scalp, mood swings, and difficulty conceiving. Get blood tests (AMH, testosterone, insulin) for diagnosis! 🩺" },

    { keys: ['mood swing','mood swings','emotional','irritable','pms'], reply: "Mood swings before your period are caused by estrogen and progesterone drops! 😢➡️😊 Help: dark chocolate 🍫 (magnesium), bananas 🍌 (serotonin), omega-3s, exercise, and reducing caffeine. You're not 'crazy' — it's hormones! 💕" },
    { keys: ['anxiety','stressed','stress'], reply: "Hormone fluctuations can worsen anxiety! 🌿 Try: magnesium-rich foods (spinach, pumpkin seeds), adaptogen herbs like ashwagandha, deep breathing, and gentle walks. Avoid excess caffeine and sugar during your luteal phase. You've got this! 💪🌸" },
    { keys: ['depressed','depression','sad','low mood'], reply: "Feeling low before your period is real! Increase serotonin naturally: sunlight ☀️, exercise, tryptophan-rich foods (banana, eggs, milk). If it severely impacts your life, please talk to a doctor or therapist. You matter so much! 💗" },
    { keys: ['bloating','bloated'], reply: "Period bloating is caused by hormonal water retention. Help: reduce salt, avoid carbonated drinks, eat potassium-rich foods like bananas 🍌 and avocado 🥑, try fennel tea, and do gentle movement. It passes after your period starts! 🌸" },

    { keys: ['eat','food','nutrition','diet','what to eat'], reply: "Your nutritional needs change with your cycle! 🍓 Menstrual phase → iron & anti-inflammatory. Follicular → protein & fermented foods. Ovulation → antioxidants & zinc. Luteal → magnesium & calcium. Check our 🍓 Eat by Phase tab for the full guide!" },
    { keys: ['menstrual food','eat during period','period food'], reply: "During your period (Days 1-5): 🍫 Dark chocolate, 🥬 Leafy greens, 🐟 Salmon, 🫐 Berries, 🫚 Ginger tea. AVOID: caffeine, alcohol, salty snacks!" },
    { keys: ['follicular food','follicular phase'], reply: "Follicular phase (Days 1-13): Your estrogen rises — eat light and energising! 🥚 Eggs, 🥦 Broccoli, 🫐 Berries, 🌰 Nuts, 🥗 Fermented foods like curd/yoghurt. Great time to try new healthy recipes! ✨" },
    { keys: ['ovulation food','ovulation phase'], reply: "Ovulation (Day ~14): 🫐 Berries & leafy greens (antioxidants), 🐠 Fish (zinc & selenium), 🥕 Colourful vegetables, 💧 Coconut water. Zinc supports egg quality!" },
    { keys: ['luteal food','luteal phase','pms food'], reply: "Luteal phase (Days 15-28): 🍫 Dark chocolate, 🍌 Banana, 🥑 Avocado, 🥜 Pumpkin seeds, 🌾 Complex carbs (oats, brown rice). Avoid sugar spikes — they worsen PMS! 🌸" },
    { keys: ['chocolate','dark chocolate'], reply: "Dark chocolate (70%+) is genuinely great for your period! 🍫 Rich in magnesium (helps cramps), iron, and boosts serotonin. Just 1-2 squares is perfect. Milk chocolate has too much sugar though!" },
    { keys: ['iron','iron food','anaemia'], reply: "During menstruation you lose iron! 🥬 Top sources: spinach, rajma, chana, methi, dates, jaggery, pomegranate. Pair with Vitamin C (lemon 🍋, amla) for better absorption. Avoid tea/coffee right after iron-rich meals!" },
    { keys: ['magnesium'], reply: "Magnesium reduces cramps, bloating, mood swings, and headaches! ✨ Top sources: dark chocolate 🍫, pumpkin seeds, spinach, bananas, almonds. Many women are deficient — consider a supplement!" },
    { keys: ['water','hydration','drink'], reply: "Staying hydrated is KEY during your cycle! 💧 Aim for 8-10 glasses daily. Try warm water with lemon, ginger tea for cramps, and coconut water 🥥 for electrolytes. Avoid excess caffeine as it dehydrates!" },

    { keys: ['menopause','hot flash','hot flush'], reply: "Menopause usually begins between 45-55 years. Symptoms: hot flashes, night sweats, mood changes, vaginal dryness. Help: Phytoestrogen foods (soy, flaxseeds), calcium & Vitamin D, weight-bearing exercise, and HRT (consult your doctor)! 🌿" },
    { keys: ['bmi','weight','overweight','underweight'], reply: "BMI = weight(kg) ÷ height(m)². Normal range: 18.5-24.9. Use our BMI Calculator — and focus on how you feel, not just the number. 💕" },
    { keys: ['lose weight','weight loss'], reply: "For healthy weight management: eat whole foods, avoid crash diets (they disrupt hormones!), do cardio + strength training, track your cycle, and sleep 7-8 hours. You're beautiful as you are! 🌺" },
    { keys: ['doctor','gynaecologist','gynecologist','gynae'], reply: "Find top gynaecologists in our 🩺 Doctors section! Enter your city (Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Pune). Regular check-ups every 6-12 months are recommended! 💕" },
    { keys: ['quiz','quizzes','test myself'], reply: "Test your women's health knowledge in our 📋 Quizzes section! 10 fun questions about cycles, PCOS, menopause, and BMI. 🌸" },
    { keys: ['exercise','workout','yoga','walk'], reply: "Exercise changes across your cycle! 🏃‍♀️ Menstrual: gentle yoga. Follicular: high energy workouts! Ovulation: HIIT & strength. Luteal: moderate cardio, walks, Pilates. Listen to your body! 💪🌸" },
    { keys: ['sleep','insomnia','tired','fatigue'], reply: "Hormones directly affect sleep! 😴 Try: 7-9 hours, consistent schedule, avoid screens before bed, chamomile tea 🍵, and magnesium supplements. Your body heals while you sleep! ✨" },
];

const quickSuggestions = ['🩸 Period cramps', '🧁 What to eat?', '💜 PCOS tips', '😤 Mood swings', '💧 Hydration', '🏃 Exercise'];

let chatOpen = false;

function toggleChatbot() {
    chatOpen = !chatOpen;
    const win = document.getElementById('chatbot-window');
    const badge = document.getElementById('chatbot-badge');
    if (chatOpen) {
        win.classList.add('open');
        badge.classList.add('hidden');
        const msgs = document.getElementById('chatbot-messages');
        if (msgs.children.length === 0) {
            setTimeout(() => addBotMessage("Hey gorgeous! 🌸 I'm HerBot, your personal wellness BFF! Ask me about your cycle, foods, mood, PCOS — anything! 💖"), 400);
            renderSuggestions();
        }
    } else {
        win.classList.remove('open');
    }
}

function addBotMessage(text) {
    const msgs = document.getElementById('chatbot-messages');
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(() => {
        typing.remove();
        const msg = document.createElement('div');
        msg.className = 'chat-msg bot';
        msg.textContent = text;
        msgs.appendChild(msg);
        msgs.scrollTop = msgs.scrollHeight;
    }, 900);
}

function addUserMessage(text) {
    const msgs = document.getElementById('chatbot-messages');
    const msg = document.createElement('div');
    msg.className = 'chat-msg user';
    msg.textContent = text;
    msgs.appendChild(msg);
    msgs.scrollTop = msgs.scrollHeight;
}

function getBotReply(input) {
    const lower = input.toLowerCase().trim();
    for (const entry of chatKnowledge) {
        if (entry.keys.length === 0) continue;
        if (entry.keys.some(k => lower.includes(k))) return entry.reply;
    }
    const fallbacks = [
        "Hmm, I'm still learning! 🌸 Try asking about your period, PCOS, nutrition by phase, or mood swings. I'd love to help!",
        "Great question! 💕 Try checking our Learn or Plans sections for more info!",
        "I'm not sure about that one! 🌷 But I know lots about cycle nutrition, PCOS, and period health — ask me about those!"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function sendChatMessage(overrideText) {
    const input = document.getElementById('chatbot-input');
    const text = overrideText || input.value.trim();
    if (!text) return;
    addUserMessage(text);
    input.value = '';
    document.getElementById('chatbot-suggestions').innerHTML = '';
    const reply = getBotReply(text);
    addBotMessage(reply);
    setTimeout(renderSuggestions, 1600);
}

function renderSuggestions() {
    const container = document.getElementById('chatbot-suggestions');
    container.innerHTML = '';
    quickSuggestions.forEach(s => {
        const chip = document.createElement('button');
        chip.className = 'suggestion-chip';
        chip.textContent = s;
        chip.onclick = () => sendChatMessage(s);
        container.appendChild(chip);
    });
}

window.toggleChatbot   = toggleChatbot;
window.sendChatMessage = sendChatMessage;


// ================================================================
// NUTRITION BY PHASE TAB
// ================================================================

const nutritionPhases = [
    {
        cls: 'menstrual', emoji: '🩸', bgEmoji: '🌹', title: 'Menstrual Phase', days: 'Days 1–5',
        mood: '😴 Low energy · Crampy · Introspective', color: '#be185d',
        foods: [
            { emoji: '🥬', text: 'Spinach & Palak — iron to replace blood loss, folate for energy' },
            { emoji: '🍫', text: 'Dark Chocolate (70%+) — magnesium eases cramps & boosts serotonin' },
            { emoji: '🐟', text: 'Salmon / Flaxseeds — omega-3s are natural anti-inflammatories' },
            { emoji: '🫐', text: 'Berries & Pomegranate — antioxidants fight fatigue & boost immunity' },
            { emoji: '🫚', text: 'Ginger & Haldi Tea — reduces prostaglandin-driven inflammation' },
            { emoji: '🌰', text: 'Pumpkin Seeds & Til — zinc + magnesium powerhouse duo' },
            { emoji: '🥣', text: 'Oatmeal / Dalia / Ragi Porridge — gentle iron & fibre for digestion' },
            { emoji: '🍲', text: 'Khichdi with Ghee — easy to digest, warm & comforting' },
            { emoji: '🌴', text: 'Dates (Khajoor) & Jaggery — natural iron + instant energy' },
            { emoji: '🍵', text: 'Chamomile / Ajwain Tea — relieves bloating & calms nerves' },
        ],
        avoid: '🚫 Avoid: Caffeine, alcohol, salty snacks, fried food, cold drinks',
        recipe: '🍳 Quick Recipe: Palak Dal — Spinach + moong dal + turmeric + cumin tadka. Iron + protein in one bowl!',
        symptomTip: '💡 For Cramps: Hot water bottle + ginger tea + 2 squares dark chocolate = natural relief combo!'
    },
    {
        cls: 'follicular', emoji: '🌱', bgEmoji: '🍀', title: 'Follicular Phase', days: 'Days 6–13',
        mood: '⚡ Rising energy · Creative · Optimistic', color: '#15803d',
        foods: [
            { emoji: '🥚', text: 'Eggs & Paneer — protein & choline fuel rising estrogen production' },
            { emoji: '🥦', text: 'Broccoli & Cruciferous Veggies — DIM compound balances estrogen' },
            { emoji: '🫘', text: 'Sprouts, Moong & Lentils — plant protein + iron + folate' },
            { emoji: '🍓', text: 'Strawberries, Amla & Citrus — Vitamin C supercharges iron absorption' },
            { emoji: '🥗', text: 'Fermented foods (Curd, Idli, Kanji) — probiotics = happy gut = happy hormones' },
            { emoji: '🥑', text: 'Avocado & Coconut — healthy fats for smooth hormone synthesis' },
            { emoji: '🌾', text: 'Quinoa / Brown Rice / Jowar Roti — complex carbs for sustained energy' },
            { emoji: '🥕', text: 'Carrots & Beetroot — beta-carotene supports uterine lining growth' },
            { emoji: '🫐', text: 'Flaxseed Smoothie — lignans help metabolise estrogen cleanly' },
            { emoji: '🥒', text: 'Cucumber & Mint Raita — cooling, hydrating, gut-friendly' },
        ],
        avoid: '🚫 Avoid: Processed foods, excess sugar, heavy fried meals',
        recipe: '🍳 Quick Recipe: Moong Sprout Chaat — sprouted moong + onion + tomato + lemon + chaat masala. Light & energising!',
        symptomTip: '💡 Energy Hack: This is your BEST week for trying new workouts & recipes — estrogen gives you natural motivation!'
    },
    {
        cls: 'ovulation', emoji: '🌟', bgEmoji: '☀️', title: 'Ovulation Phase', days: 'Day 13–15',
        mood: '🔥 Peak energy · Confident · Social · Glowing skin', color: '#a16207',
        foods: [
            { emoji: '🫐', text: 'Berries & Pomegranate — antioxidants protect egg quality & skin glow' },
            { emoji: '🐠', text: 'Fish & Shellfish — zinc & selenium support fertility & immunity' },
            { emoji: '🥕', text: 'Rainbow Vegetables — beta-carotene, folate & phytonutrients galore' },
            { emoji: '🫘', text: 'Chickpeas (Chana) & Rajma — folate for healthy cell division' },
            { emoji: '🌿', text: 'Tulsi & Ashwagandha Tea — adaptogen herbs reduce cortisol' },
            { emoji: '🥥', text: 'Coconut Water & Nariyal Malai — electrolytes & natural cooling' },
            { emoji: '🍉', text: 'Watermelon & Muskmelon — lycopene + hydration + Vitamin A' },
            { emoji: '🍅', text: 'Tomatoes & Bell Peppers — glutathione for detox & clear skin' },
            { emoji: '🌰', text: 'Sunflower & Sesame Seeds — Vitamin E for reproductive health' },
            { emoji: '🍋', text: 'Nimbu Pani with Chia Seeds — hydration + omega-3s + fibre' },
        ],
        avoid: '🚫 Avoid: Alcohol, trans fats, excess caffeine, processed meats',
        recipe: '🍳 Quick Recipe: Chana Chaat Bowl — boiled chana + cucumber + tomato + pomegranate + mint chutney. Protein-packed & delicious!',
        symptomTip: '💡 Glow Tip: Your skin is naturally at its BEST during ovulation — hydrate well & skip heavy makeup!'
    },
    {
        cls: 'luteal', emoji: '🌙', bgEmoji: '💜', title: 'Luteal Phase', days: 'Days 16–28',
        mood: '😢 Cravings · PMS · Mood swings · Bloating · Tender', color: '#6d28d9',
        foods: [
            { emoji: '🍌', text: 'Bananas — tryptophan converts to serotonin for a natural mood lift' },
            { emoji: '🍫', text: 'Dark Chocolate — magnesium reduces PMS tension, cramping & anxiety' },
            { emoji: '🥑', text: 'Avocado — Vitamin B6 supports progesterone & fights water retention' },
            { emoji: '🌰', text: 'Almonds, Walnuts & Cashews — magnesium, calcium & healthy fats' },
            { emoji: '🫘', text: 'Tofu, Edamame & Paneer — calcium-rich foods reduce PMS bloating' },
            { emoji: '🍠', text: 'Sweet Potato & Shakarkandi Chaat — complex carbs stabilise blood sugar & mood' },
            { emoji: '🫚', text: 'Saunf (Fennel) Tea — reduces bloating & water retention naturally' },
            { emoji: '🥛', text: 'Warm Haldi Doodh — turmeric + calcium + tryptophan = sleep well' },
            { emoji: '🌾', text: 'Oats, Daliya & Brown Rice — slow-release carbs prevent sugar crashes' },
            { emoji: '🥜', text: 'Peanut Butter on Toast — protein + healthy fat curbs cravings smartly' },
        ],
        avoid: '🚫 Avoid: Refined sugar, alcohol, salty chips, excess dairy, caffeine after 2pm',
        recipe: '🍳 Quick Recipe: Haldi Doodh (Golden Milk) — warm milk + turmeric + cinnamon + honey + pinch of pepper. PMS-fighting magic before bed!',
        symptomTip: '💡 For Mood Swings: Banana + dark chocolate + walk in sunlight = serotonin triple boost! Skip the sugar — it makes PMS worse.'
    }
];

function buildNutritionTab() {
    if (document.getElementById('tab-nutrition')) return;
    const section = document.getElementById('learn-view');
    const div = document.createElement('div');
    div.className = 'tab-content hidden';
    div.id = 'tab-nutrition';
    div.innerHTML = `
        <div class="article-card card-panel">
            <div class="nutrition-hero">
                <img src="phase-nutrition.png" alt="Cycle Nutrition" />
                <h3>Eat with Your Cycle 🌸</h3>
                <p>Your hormones shift every week — and so should your plate! Eating in sync with your cycle can reduce cramps, lift mood, boost energy, balance hormones, and even clear your skin. Here's your complete guide with Indian-inspired tips! 🇮🇳</p>
            </div>
            <div class="phase-nutrition-grid">
                ${nutritionPhases.map(p => `
                    <div class="phase-nutrition-card ${p.cls}" data-emoji="${p.bgEmoji}">
                        <span class="phase-card-emoji">${p.emoji}</span>
                        <h4 style="color:${p.color}">${p.title}</h4>
                        <span class="phase-days">${p.days}</span>
                        <div class="phase-mood">${p.mood}</div>
                        <ul class="eat-list">
                            ${p.foods.map(f => `<li><span class="food-emoji">${f.emoji}</span><span>${f.text}</span></li>`).join('')}
                        </ul>
                        <div class="avoid-tag">${p.avoid}</div>
                        <p style="margin-top:14px;font-size:0.88rem;color:${p.color};font-weight:700;">${p.recipe}</p>
                        <p style="margin-top:8px;font-size:0.85rem;background:rgba(255,255,255,0.5);padding:8px 12px;border-radius:14px;font-weight:600;">${p.symptomTip}</p>
                    </div>
                `).join('')}
            </div>

            <!-- BONUS: Symptom-specific quick guide -->
            <div style="margin-top:45px;">
                <h3 style="text-align:center;color:var(--primary-dark);font-size:1.5rem;">🆘 Quick Symptom Food Guide</h3>
                <p style="text-align:center;color:var(--text-muted);margin-bottom:25px;">Feeling something specific? Here's what to reach for!</p>
                <div class="phase-nutrition-grid">
                    <div class="phase-nutrition-card menstrual" data-emoji="😣">
                        <span class="phase-card-emoji">😣</span>
                        <h4 style="color:#be185d">Cramps & Pain</h4>
                        <ul class="eat-list">
                            <li><span class="food-emoji">🫚</span><span>Ginger tea — blocks prostaglandins naturally</span></li>
                            <li><span class="food-emoji">🍫</span><span>Dark chocolate — magnesium relaxes muscles</span></li>
                            <li><span class="food-emoji">🍌</span><span>Banana — potassium prevents muscle spasms</span></li>
                            <li><span class="food-emoji">🐟</span><span>Omega-3 rich foods — natural pain relief</span></li>
                            <li><span class="food-emoji">🔥</span><span>Ajwain water — traditional Indian cramp remedy</span></li>
                        </ul>
                    </div>
                    <div class="phase-nutrition-card luteal" data-emoji="😤">
                        <span class="phase-card-emoji">😤</span>
                        <h4 style="color:#6d28d9">Mood Swings & Irritability</h4>
                        <ul class="eat-list">
                            <li><span class="food-emoji">🍌</span><span>Banana — tryptophan → serotonin (happy chemical!)</span></li>
                            <li><span class="food-emoji">🌰</span><span>Walnuts — omega-3s improve brain mood regulation</span></li>
                            <li><span class="food-emoji">🍠</span><span>Sweet potato — steady blood sugar = steady mood</span></li>
                            <li><span class="food-emoji">☀️</span><span>Vitamin D foods (eggs, mushrooms) + sunlight</span></li>
                            <li><span class="food-emoji">🍵</span><span>Chamomile tea — calms anxiety & promotes sleep</span></li>
                        </ul>
                    </div>
                    <div class="phase-nutrition-card follicular" data-emoji="🫧">
                        <span class="phase-card-emoji">🫧</span>
                        <h4 style="color:#15803d">Bloating & Water Retention</h4>
                        <ul class="eat-list">
                            <li><span class="food-emoji">🥒</span><span>Cucumber & celery — natural diuretics</span></li>
                            <li><span class="food-emoji">🫚</span><span>Fennel (saunf) tea — reduces gas & bloating</span></li>
                            <li><span class="food-emoji">🍌</span><span>Potassium-rich foods — flush excess sodium</span></li>
                            <li><span class="food-emoji">💧</span><span>Drink MORE water (not less!) — reduces retention</span></li>
                            <li><span class="food-emoji">🥑</span><span>Avocado & coconut water — electrolyte balance</span></li>
                        </ul>
                    </div>
                    <div class="phase-nutrition-card ovulation" data-emoji="😴">
                        <span class="phase-card-emoji">😴</span>
                        <h4 style="color:#a16207">Fatigue & Low Energy</h4>
                        <ul class="eat-list">
                            <li><span class="food-emoji">🥬</span><span>Iron-rich greens — fight anaemia-related tiredness</span></li>
                            <li><span class="food-emoji">🌴</span><span>Dates & dry fruits — instant natural energy boost</span></li>
                            <li><span class="food-emoji">🥚</span><span>Eggs & paneer — protein sustains energy longer</span></li>
                            <li><span class="food-emoji">🌾</span><span>Complex carbs (oats, ragi) — slow-release fuel</span></li>
                            <li><span class="food-emoji">🍋</span><span>Lemon water + amla — Vitamin C boosts iron absorption</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    section.appendChild(div);
}

buildNutritionTab();
