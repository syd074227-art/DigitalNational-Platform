// بيانات التطبيق
let userData = {
    fullName: '',
    age: '',
    discord: '',
    gameId: '',
    job: '',
    position: '',
    additionalPositions: [],
    idImage: null
};

// بيانات الوزارات
const ministryData = {
    interior: {
        name: 'وزارة الداخلية',
        color: '#1e3a8a',
        ranks: [
            'جندي', 'جندي أول', 'عريف', 'وكيل رقيب', 'رقيب', 'رقيب أول', 
            'رئيس رقباء', 'ملازم', 'ملازم أول', 'نقيب', 'رائد', 'مقدم',
            'عقيد', 'عميد', 'لواء', 'فريق', 'فريق أول',
            'نائب مدير الأمن العام', 'مدير الأمن العام',
            'نائب وزير الداخلية', 'وزير الداخلية'
        ],
        additional: [
            'إدارة القبول والتجنيد',
            'إدارة الشؤون',
            'إدارة شؤون الأفراد',
            'الإدارة العامة لوزارة الداخلية',
            'إدارة الشكاوى بوزارة الداخلية'
        ]
    },
    health: {
        name: 'وزارة الصحة',
        color: '#dc2626',
        ranks: [
            'مسعف', 'طبيب', 'طبيب عام', 'طبيب مختص',
            'دكتور', 'دكتور عام', 'دكتور مختص',
            'استشاري أمراض جلدية وجراحة',
            'استشاري طب الأسنان',
            'أخصائي', 'جراح', 'مساعد جراح',
            'بروفسور', 'نائب مدير مستشفى',
            'مدير مستشفى', 'مستشار وزير الصحة',
            'نائب وزير الصحة', 'وزير الصحة'
        ],
        additional: [
            'إدارة القبول والتسجيل',
            'إدارة الشؤون الصحية',
            'إدارة الكلية الصحية',
            'مسؤول الشؤون الصحية',
            'إدارة الشكاوى بوزارة الصحة'
        ]
    },
    justice: {
        name: 'وزارة العدل',
        color: '#059669',
        ranks: [
            'محامي', 'محامي متمرس', 'محامي متخصص',
            'قاضي', 'قاضي متمرس', 'قاضي استئناف',
            'قاضي درجة أولى', 'قاضي محكمة عليا',
            'قاضي محترف', 'مستشار وزير العدل',
            'نائب وزير العدل', 'وزير العدل'
        ],
        additional: [
            'إدارة القبول والتسجيل بوزارة العدل',
            'المجلس الأعلى للقضاء',
            'إدارة الشؤون العدلية'
        ]
    }
};

// عناصر DOM
const steps = document.querySelectorAll('.step');
const formSteps = document.querySelectorAll('.form-step');
const nextBtns = document.querySelectorAll('.btn-next');
const prevBtns = document.querySelectorAll('.btn-prev');

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    // تحميل البيانات المحفوظة
    loadSavedData();
    
    // إضافة مستمعي الأحداث
    setupEventListeners();
    
    // تعيين الحد الأدنى للعمر
    const ageInput = document.getElementById('age');
    if (ageInput) {
        const today = new Date();
        ageInput.max = today.getFullYear() - 18;
    }
    
    // تهيئة اختيار الوظائف
    initJobSelection();
    
    // تهيئة اختيار الرتب
    initRanksSelection();
    
    // تهيئة اختيار المناصب الإضافية
    initAdditionalPositions();
    
    // تهيئة رفع الملفات
    initFileUpload();
    
    // تهيئة زر الإرسال
    initSubmitButton();
    
    // التحقق من صحة البيانات عند الكتابة
    setupValidation();
});

// تحميل البيانات المحفوظة
function loadSavedData() {
    const saved = localStorage.getItem('krIdentityData');
    if (saved) {
        userData = JSON.parse(saved);
        populateForm();
    }
}

// تعبئة الفورم بالبيانات المحفوظة
function populateForm() {
    document.getElementById('fullName').value = userData.fullName || '';
    document.getElementById('age').value = userData.age || '';
    document.getElementById('discord').value = userData.discord || '';
    document.getElementById('gameId').value = userData.gameId || '';
    
    if (userData.job) {
        selectJob(userData.job);
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // مستمعي الأزرار
    nextBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const currentStep = getCurrentStep();
            if (validateStep(currentStep)) {
                goToStep(currentStep + 1);
            }
        });
    });
    
    prevBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const currentStep = getCurrentStep();
            goToStep(currentStep - 1);
        });
    });
    
    // حفظ البيانات عند التغيير
    document.getElementById('fullName')?.addEventListener('input', function(e) {
        userData.fullName = e.target.value;
        saveData();
    });
    
    document.getElementById('age')?.addEventListener('input', function(e) {
        userData.age = e.target.value;
        saveData();
    });
    
    document.getElementById('discord')?.addEventListener('input', function(e) {
        userData.discord = e.target.value;
        saveData();
    });
    
    document.getElementById('gameId')?.addEventListener('input', function(e) {
        userData.gameId = e.target.value;
        saveData();
    });
}

// التحقق من صحة الخطوة
function validateStep(step) {
    switch(step) {
        case 1:
            return validateStep1();
        case 2:
            return validateStep2();
        case 3:
            return validateStep3();
        case 5:
            return validateStep5();
        default:
            return true;
    }
}

// التحقق من الخطوة 1
function validateStep1() {
    const name = document.getElementById('fullName').value.trim();
    const age = document.getElementById('age').value;
    const discord = document.getElementById('discord').value.trim();
    const gameId = document.getElementById('gameId').value.trim();
    
    if (!name || name.split(' ').length < 2) {
        showError('يرجى إدخال الاسم الكامل (ثلاثي على الأقل)');
        return false;
    }
    
    if (!age || age < 18 || age > 100) {
        showError('يرجى إدخال عمر صحيح (من 18 إلى 100 سنة)');
        return false;
    }
    
    if (!discord || !discord.includes('#')) {
        showError('يرجى إدخال اسم الديسكورد مع التاق (#)');
        return false;
    }
    
    if (!gameId || !/^\d{8}$/.test(gameId)) {
        showError('يرجى إدخال رقم هوية صحيح (8 أرقام فقط)');
        return false;
    }
    
    return true;
}

// التحقق من الخطوة 2
function validateStep2() {
    if (!userData.job) {
        showError('يرجى اختيار الوظيفة المهنية');
        return false;
    }
    return true;
}

// التحقق من الخطوة 3
function validateStep3() {
    if (userData.job !== 'citizen' && !userData.position) {
        showError('يرجى اختيار المنصب الرئيسي');
        return false;
    }
    return true;
}

// التحقق من الخطوة 5
function validateStep5() {
    if (!userData.idImage) {
        showError('يرجى رفع صورة الهوية');
        return false;
    }
    return true;
}

// الانتقال بين الخطوات
function goToStep(step) {
    if (step < 1 || step > 6) return;
    
    // إخفاء جميع الخطوات
    formSteps.forEach(formStep => {
        formStep.classList.remove('active');
    });
    
    // تحديث خطوات التقدم
    steps.forEach((s, index) => {
        if (index + 1 <= step) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
    
    // إظهار الخطوة الحالية
    document.getElementById(`step${step}`).classList.add('active');
    
    // تحديث عرض المراجعة إذا كنا في الخطوة 6
    if (step === 6) {
        updateReview();
    }
}

// الحصول على الخطوة الحالية
function getCurrentStep() {
    for (let i = 0; i < formSteps.length; i++) {
        if (formSteps[i].classList.contains('active')) {
            return i + 1;
        }
    }
    return 1;
}

// اختيار الوظيفة
function initJobSelection() {
    const jobCards = document.querySelectorAll('.job-card');
    
    jobCards.forEach(card => {
        card.addEventListener('click', function() {
            // إزالة التحديد من جميع البطاقات
            jobCards.forEach(c => c.classList.remove('selected'));
            
            // تحديد البطاقة المختارة
            this.classList.add('selected');
            
            // حفظ اختيار المستخدم
            const jobType = this.classList[1]; // citizen, interior, health, justice
            selectJob(jobType);
            
            // تمكين زر التالي
            document.getElementById('nextStep2').disabled = false;
        });
    });
}

function selectJob(jobType) {
    userData.job = jobType;
    saveData();
    
    // تحديث عرض الرتب حسب الوظيفة
    updateRanksDisplay();
    
    // تحديث عرض المناصب الإضافية
    updateAdditionalPositions();
}

// تحديث عرض الرتب
function updateRanksDisplay() {
    // إخفاء جميع أقسام الرتب
    document.querySelectorAll('.positions-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // إظهار قسم الرتب المناسب
    if (userData.job === 'interior') {
        document.getElementById('interiorPositions').style.display = 'block';
    } else if (userData.job === 'health') {
        document.getElementById('healthPositions').style.display = 'block';
    } else if (userData.job === 'justice') {
        document.getElementById('justicePositions').style.display = 'block';
    }
    
    // إذا كان مواطن، تخطي الخطوة 3
    if (userData.job === 'citizen') {
        userData.position = 'مواطن';
        goToStep(4);
    }
}

// تهيئة اختيار الرتب
function initRanksSelection() {
    // تعبئة رتب الداخلية
    const interiorRanks = document.getElementById('interiorRanks');
    if (interiorRanks) {
        interiorRanks.innerHTML = ministryData.interior.ranks.map(rank => `
            <div class="rank-card" data-rank="${rank}">${rank}</div>
        `).join('');
    }
    
    // تعبئة رتب الصحة
    const healthRanks = document.getElementById('healthRanks');
    if (healthRanks) {
        healthRanks.innerHTML = ministryData.health.ranks.map(rank => `
            <div class="rank-card" data-rank="${rank}">${rank}</div>
        `).join('');
    }
    
    // تعبئة رتب العدل
    const justiceRanks = document.getElementById('justiceRanks');
    if (justiceRanks) {
        justiceRanks.innerHTML = ministryData.justice.ranks.map(rank => `
            <div class="rank-card" data-rank="${rank}">${rank}</div>
        `).join('');
    }
    
    // إضافة مستمعي الأحداث للرتب
    document.querySelectorAll('.rank-card').forEach(card => {
        card.addEventListener('click', function() {
            // إزالة التحديد من جميع الرتب
            document.querySelectorAll('.rank-card').forEach(c => {
                c.classList.remove('selected');
            });
            
            // تحديد الرتبة المختارة
            this.classList.add('selected');
            
            // حفظ الرتبة
            userData.position = this.getAttribute('data-rank');
            saveData();
            
            // تمكين زر التالي
            document.getElementById('nextStep3').disabled = false;
        });
    });
}

// تهيئة اختيار المناصب الإضافية
function initAdditionalPositions() {
    const noAdditionalCheckbox = document.getElementById('noAdditional');
    if (noAdditionalCheckbox) {
        noAdditionalCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.additional-checkbox');
            checkboxes.forEach(cb => {
                cb.disabled = this.checked;
                if (this.checked) {
                    cb.checked = false;
                }
            });
            
            if (this.checked) {
                userData.additionalPositions = [];
            }
            saveData();
        });
    }
}

function updateAdditionalPositions() {
    const container = document.getElementById('additionalPositions');
    if (!container) return;
    
    let positions = [];
    
    if (userData.job === 'interior') {
        positions = ministryData.interior.additional;
    } else if (userData.job === 'health') {
        positions = ministryData.health.additional;
    } else if (userData.job === 'justice') {
        positions = ministryData.justice.additional;
    } else {
        container.innerHTML = '<p>لا توجد مناصب إضافية للمواطنين</p>';
        return;
    }
    
    container.innerHTML = positions.map(pos => `
        <div class="checkbox-group">
            <input type="checkbox" id="pos_${pos}" class="additional-checkbox" value="${pos}">
            <label for="pos_${pos}">${pos}</label>
        </div>
    `).join('');
    
    // إضافة مستمعي الأحداث
    document.querySelectorAll('.additional-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateAdditionalPositionsList();
        });
    });
    
    // تعيين القيم السابقة
    userData.additionalPositions.forEach(pos => {
        const checkbox = document.querySelector(`input[value="${pos}"]`);
        if (checkbox) checkbox.checked = true;
    });
}

function updateAdditionalPositionsList() {
    const checkboxes = document.querySelectorAll('.additional-checkbox:checked');
    userData.additionalPositions = Array.from(checkboxes).map(cb => cb.value);
    saveData();
}

// تهيئة رفع الملفات
function initFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('idImage');
    const fileInfo = document.getElementById('fileInfo');
    
    if (!uploadArea || !fileInput) return;
    
    // النقر على منطقة الرفع
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // تغيير الملف
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // التحقق من نوع الملف
            if (!file.type.startsWith('image/')) {
                showError('يرجى رفع ملف صورة فقط');
                return;
            }
            
            // التحقق من حجم الملف (5MB كحد أقصى)
            if (file.size > 5 * 1024 * 1024) {
                showError('حجم الصورة يجب أن يكون أقل من 5MB');
                return;
            }
            
            // حفظ الملف
            userData.idImage = {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            };
            
            // تحديث عرض المعلومات
            fileInfo.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>تم رفع: ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
            `;
            
            // تمكين زر التالي
            document.getElementById('nextStep5').disabled = false;
            
            saveData();
        }
    });
    
    // سحب وإفلات الملفات
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#3b82f6';
        this.style.background = '#eff6ff';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '#cbd5e1';
        this.style.background = 'white';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#cbd5e1';
        this.style.background = 'white';
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            fileInput.dispatchEvent(new Event('change'));
        }
    });
}

// تحديث عرض المراجعة
function updateReview() {
    document.getElementById('reviewName').textContent = userData.fullName || '-';
    document.getElementById('reviewAge').textContent = userData.age || '-';
    document.getElementById('reviewDiscord').textContent = userData.discord || '-';
    document.getElementById('reviewId').textContent = userData.gameId || '-';
    
    // عرض الوظيفة
    let jobName = '';
    switch(userData.job) {
        case 'citizen': jobName = 'مواطن'; break;
        case 'interior': jobName = 'منسوب وزارة الداخلية'; break;
        case 'health': jobName = 'منسوب وزارة الصحة'; break;
        case 'justice': jobName = 'منسوب وزارة العدل'; break;
        default: jobName = '-';
    }
    document.getElementById('reviewJob').textContent = jobName;
    
    // عرض المنصب
    document.getElementById('reviewPosition').textContent = userData.position || '-';
    
    // عرض المناصب الإضافية
    const additionalReview = document.getElementById('reviewAdditional');
    if (userData.additionalPositions.length > 0) {
        additionalReview.textContent = userData.additionalPositions.join(', ');
    } else {
        additionalReview.textContent = 'لا يوجد';
    }
    
    // عرض صورة الهوية
    const imageReview = document.getElementById('reviewImage');
    if (userData.idImage) {
        imageReview.textContent = userData.idImage.name;
        imageReview.style.color = '#059669';
    } else {
        imageReview.textContent = 'لم يتم الرفع';
        imageReview.style.color = '#dc2626';
    }
}

// تهيئة زر الإرسال
function initSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;
    
    submitBtn.addEventListener('click', function() {
        // التحقق من الموافقة على الشروط
        const agreeTerms = document.getElementById('agreeTerms');
        if (!agreeTerms.checked) {
            showError('يرجى الموافقة على الشروط والأحكام');
            return;
        }
        
        // التحقق النهائي من البيانات
        if (!validateAllData()) {
            return;
        }
        
        // إرسال البيانات (محاكاة)
        submitForm();
    });
}

// التحقق النهائي من جميع البيانات
function validateAllData() {
    if (!userData.fullName) {
        showError('يرجى إدخال الاسم الكامل');
        return false;
    }
    
    if (!userData.age || userData.age < 18) {
        showError('يرجى إدخال عمر صحيح (18 سنة على الأقل)');
        return false;
    }
    
    if (!userData.discord) {
        showError('يرجى إدخال اسم الديسكورد');
        return false;
    }
    
    if (!userData.gameId || !/^\d{8}$/.test(userData.gameId)) {
        showError('يرجى إدخال رقم هوية صحيح (8 أرقام)');
        return false;
    }
    
    if (!userData.job) {
        showError('يرجى اختيار الوظيفة');
        return false;
    }
    
    if (userData.job !== 'citizen' && !userData.position) {
        showError('يرجى اختيار المنصب الرئيسي');
        return false;
    }
    
    if (!userData.idImage) {
        showError('يرجى رفع صورة الهوية');
        return false;
    }
    
    return true;
}

// إرسال الفورم (محاكاة)
function submitForm() {
    // إنشاء رقم طلب عشوائي
    const requestNumber = 'KR-' + new Date().getFullYear() + '-' + 
        Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // عرض رسالة النجاح
    const successMessage = document.getElementById('successMessage');
    const reviewSection = document.querySelector('.review-container');
    const submitBtn = document.getElementById('submitBtn');
    
    if (successMessage && reviewSection && submitBtn) {
        // تحديث رقم الطلب
        document.getElementById('requestNumber').textContent = requestNumber;
        
        // إخفاء قسم المراجعة وزر الإرسال
        reviewSection.style.display = 'none';
        submitBtn.style.display = 'none';
        
        // إظهار رسالة النجاح
        successMessage.style.display = 'block';
        
        // إرسال البيانات (محاكاة)
        setTimeout(() => {
            console.log('تم إرسال البيانات:', userData);
            console.log('رقم الطلب:', requestNumber);
            
            // مسح البيانات المحلية
            localStorage.removeItem('krIdentityData');
        }, 1000);
    }
}

// إعداد التحقق من الصحة
function setupValidation() {
    // التحقق من رقم الهوية
    const gameIdInput = document.getElementById('gameId');
    if (gameIdInput) {
        gameIdInput.addEventListener('input', function(e) {
            const value = e.target.value.replace(/\D/g, '');
            e.target.value = value.slice(0, 8);
        });
    }
    
    // التحقق من اسم الديسكورد
    const discordInput = document.getElementById('discord');
    if (discordInput) {
        discordInput.addEventListener('input', function(e) {
            const value = e.target.value;
            if (!value.includes('#')) {
                e.target.style.borderColor = '#dc2626';
            } else {
                e.target.style.borderColor = '#22c55e';
            }
        });
    }
}

// عرض رسالة خطأ
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.style.display = 'block';
        
        // إخفاء الرسالة بعد 4 ثواني
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 4000);
        
        // اهتزاز
        errorDiv.style.animation = 'none';
        setTimeout(() => {
            errorDiv.style.animation = 'pulse 4s';
        }, 10);
    }
}

// حفظ البيانات
function saveData() {
    localStorage.setItem('krIdentityData', JSON.stringify(userData));
}

// إعادة تعيين الفورم
function resetForm() {
    // مسح البيانات
    userData = {
        fullName: '',
        age: '',
        discord: '',
        gameId: '',
        job: '',
        position: '',
        additionalPositions: [],
        idImage: null
    };
    
    // مسح التخزين المحلي
    localStorage.removeItem('krIdentityData');
    
    // إعادة تعيين الفورم
    document.getElementById('identityForm').reset();
    
    // إعادة تعيين التحديدات
    document.querySelectorAll('.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    document.querySelectorAll('.rank-card.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // إعادة تعيين ملفات الرفع
    document.getElementById('idImage').value = '';
    document.getElementById('fileInfo').innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>لم يتم اختيار أي ملف</span>
    `;
    
    // إعادة تعيين رسالة النجاح
    const successMessage = document.getElementById('successMessage');
    const reviewSection = document.querySelector('.review-container');
    const submitBtn = document.getElementById('submitBtn');
    
    if (successMessage && reviewSection && submitBtn) {
        successMessage.style.display = 'none';
        reviewSection.style.display = 'block';
        submitBtn.style.display = 'block';
    }
    
    // العودة للخطوة الأولى
    goToStep(1);
}

// وظائف للمساعدة
function showStep(stepNumber) {
    goToStep(stepNumber);
}

function nextStep(current) {
    if (validateStep(current)) {
        goToStep(current + 1);
    }
}

function prevStep(current) {
    goToStep(current - 1);
}
