// البيانات
const positionsData = {
    interior: [
        'جندي', 'جندي أول', 'عريف', 'وكيل رقيب', 'رقيب', 'رقيب أول',
        'رئيس رقباء', 'ملازم', 'ملازم أول', 'نقيب', 'رائد', 'مقدم',
        'عقيد', 'عميد', 'لواء', 'فريق', 'فريق أول',
        'نائب مدير الأمن العام', 'مدير الأمن العام',
        'نائب وزير الداخلية', 'وزير الداخلية'
    ],
    health: [
        'مسعف', 'طبيب', 'طبيب عام', 'طبيب مختص',
        'دكتور', 'دكتور عام', 'دكتور مختص',
        'استشاري أمراض جلدية وجراحة',
        'استشاري طب الأسنان',
        'أخصائي', 'جراح', 'مساعد جراح',
        'بروفسور', 'نائب مدير مستشفى',
        'مدير مستشفى', 'مستشار وزير الصحة',
        'نائب وزير الصحة', 'وزير الصحة'
    ],
    justice: [
        'محامي', 'محامي متمرس', 'محامي متخصص',
        'قاضي', 'قاضي متمرس', 'قاضي استئناف',
        'قاضي درجة أولى', 'قاضي محكمة عليا',
        'قاضي محترف', 'مستشار وزير العدل',
        'نائب وزير العدل', 'وزير العدل'
    ]
};

const additionalPositionsData = {
    interior: [
        'إدارة القبول والتجنيد',
        'إدارة الشؤون',
        'إدارة شؤون الأفراد',
        'الإدارة العامة لوزارة الداخلية',
        'إدارة الشكاوى بوزارة الداخلية'
    ],
    health: [
        'إدارة القبول والتسجيل',
        'إدارة الشؤون الصحية',
        'إدارة الكلية الصحية',
        'مسؤول الشؤون الصحية',
        'إدارة الشكاوى بوزارة الصحة'
    ],
    justice: [
        'إدارة القبول والتسجيل بوزارة العدل',
        'المجلس الأعلى للقضاء',
        'إدارة الشؤون العدلية'
    ]
};

// حالة التطبيق
let currentStep = 1;
let selectedJob = null;
let selectedPosition = null;
let selectedAdditional = [];

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // إعداد مستمعي الأحداث
    setupEventListeners();
    
    // تحويل خطوات التقدم
    setupSteps();
    
    // التحقق من إدخال رقم الهوية
    const idInput = document.getElementById('nationalId');
    idInput.addEventListener('input', function(e) {
        // السماح بالأرقام فقط
        this.value = this.value.replace(/\D/g, '');
        // الحد الأقصى 10 أرقام
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
    });
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // اختيار الوظيفة
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', function() {
            const jobType = this.getAttribute('data-value');
            selectJob(jobType);
        });
    });
    
    // اختيار عدم وجود مناصب إضافية
    document.getElementById('noPositions').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.position-checkbox input');
        checkboxes.forEach(cb => {
            cb.disabled = this.checked;
            if (this.checked) {
                cb.checked = false;
            }
        });
        
        if (this.checked) {
            selectedAdditional = [];
        }
    });
    
    // زر الإرسال
    document.getElementById('submitBtn').addEventListener('click', submitForm);
}

// إعداد خطوات التقدم
function setupSteps() {
    const steps = document.querySelectorAll('.step');
    const formSteps = document.querySelectorAll('.form-step');
    
    // تحديث عرض الخطوة النشطة
    steps.forEach((step, index) => {
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    formSteps.forEach((step, index) => {
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// الانتقال بين الخطوات
function nextStep(step) {
    if (!validateCurrentStep()) return;
    
    currentStep = step;
    setupSteps();
    
    // إذا كانت الخطوة 3، تعبئة المناصب
    if (step === 3 && selectedJob && selectedJob !== 'citizen') {
        loadPositions();
    }
    
    // إذا كانت الخطوة 4، تعبئة المناصب الإضافية
    if (step === 4 && selectedJob && selectedJob !== 'citizen') {
        loadAdditionalPositions();
    }
}

function prevStep(step) {
    currentStep = step;
    setupSteps();
}

// التحقق من صحة الخطوة الحالية
function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            return validateStep1();
        case 2:
            return validateStep2();
        case 3:
            return validateStep3();
        default:
            return true;
    }
}

function validateStep1() {
    const name = document.getElementById('fullName').value.trim();
    const age = document.getElementById('age').value;
    const discord = document.getElementById('discord').value.trim();
    const nationalId = document.getElementById('nationalId').value.trim();
    
    if (!name) {
        showError('يرجى إدخال الاسم الكامل');
        return false;
    }
    
    if (!age || age < 18 || age > 100) {
        showError('يرجى إدخال عمر صحيح (من 18 إلى 100 سنة)');
        return false;
    }
    
    if (!discord) {
        showError('يرجى إدخال اسم المستخدم في الديسكورد');
        return false;
    }
    
    if (!nationalId || nationalId.length !== 10) {
        showError('يرجى إدخال رقم الهوية الوطنية (10 أرقام)');
        return false;
    }
    
    return true;
}

function validateStep2() {
    if (!selectedJob) {
        showError('يرجى اختيار الوظيفة');
        return false;
    }
    return true;
}

function validateStep3() {
    if (selectedJob !== 'citizen' && !selectedPosition) {
        showError('يرجى اختيار المنصب الرئيسي');
        return false;
    }
    return true;
}

// اختيار الوظيفة
function selectJob(jobType) {
    selectedJob = jobType;
    selectedPosition = null;
    selectedAdditional = [];
    
    // تحديث التحديد
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
        if (card.getAttribute('data-value') === jobType) {
            card.classList.add('selected');
        }
    });
    
    // تمكين زر التالي
    document.getElementById('nextStep2').disabled = false;
    
    // تحديث عنوان المنصب
    const positionTitle = document.getElementById('positionTitle');
    if (positionTitle) {
        const jobNames = {
            citizen: 'مواطن',
            interior: 'وزارة الداخلية',
            health: 'وزارة الصحة',
            justice: 'وزارة العدل'
        };
        positionTitle.innerHTML = `<i class="fas fa-user-tie"></i> اختيار المنصب - ${jobNames[jobType]}`;
    }
}

// تحميل المناصب
function loadPositions() {
    const container = document.getElementById('positionsContainer');
    if (!container) return;
    
    let positions = [];
    
    if (selectedJob === 'interior') {
        positions = positionsData.interior;
    } else if (selectedJob === 'health') {
        positions = positionsData.health;
    } else if (selectedJob === 'justice') {
        positions = positionsData.justice;
    }
    
    if (positions.length === 0) {
        container.innerHTML = '<p>لا توجد مناصب متاحة</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="position-list">
            ${positions.map(pos => `
                <div class="position-item" data-position="${pos}">${pos}</div>
            `).join('')}
        </div>
    `;
    
    // إضافة مستمعي الأحداث للمناصب
    document.querySelectorAll('.position-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.position-item').forEach(i => {
                i.classList.remove('selected');
            });
            this.classList.add('selected');
            selectedPosition = this.getAttribute('data-position');
            document.getElementById('nextStep3').disabled = false;
        });
    });
}

// تحميل المناصب الإضافية
function loadAdditionalPositions() {
    const container = document.getElementById('additionalContainer');
    if (!container) return;
    
    let positions = [];
    
    if (selectedJob === 'interior') {
        positions = additionalPositionsData.interior;
    } else if (selectedJob === 'health') {
        positions = additionalPositionsData.health;
    } else if (selectedJob === 'justice') {
        positions = additionalPositionsData.justice;
    }
    
    if (positions.length === 0) {
        container.innerHTML = '<p>لا توجد مناصب إضافية</p>';
        return;
    }
    
    container.innerHTML = positions.map(pos => `
        <div class="position-checkbox">
            <input type="checkbox" id="add_${pos.replace(/\s+/g, '_')}" value="${pos}">
            <label for="add_${pos.replace(/\s+/g, '_')}">${pos}</label>
        </div>
    `).join('');
    
    // إضافة مستمعي الأحداث
    document.querySelectorAll('.position-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateAdditionalSelections();
        });
    });
}

// تحديث المناصب الإضافية المختارة
function updateAdditionalSelections() {
    const checkboxes = document.querySelectorAll('.position-checkbox input:checked');
    selectedAdditional = Array.from(checkboxes).map(cb => cb.value);
}

// إرسال الفورم
function submitForm() {
    // التحقق النهائي
    if (!validateForm()) return;
    
    // جمع البيانات
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        age: document.getElementById('age').value,
        discord: document.getElementById('discord').value.trim(),
        nationalId: document.getElementById('nationalId').value.trim(),
        job: selectedJob,
        position: selectedJob === 'citizen' ? 'مواطن' : selectedPosition,
        additionalPositions: selectedAdditional
    };
    
    // إنشاء رقم طلب
    const requestId = 'KR-' + Date.now().toString().slice(-6);
    
    // إخفاء الفورم وإظهار رسالة النجاح
    document.getElementById('mainForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('requestId').textContent = requestId;
    
    // طباعة البيانات (بدلاً من الإرسال)
    console.log('بيانات الطلب:', formData);
    console.log('رقم الطلب:', requestId);
    
    // عرض رسالة في الكونسول
    console.log('تم إرسال الطلب بنجاح!');
}

// التحقق النهائي من الفورم
function validateForm() {
    // التحقق من البيانات الأساسية
    if (!validateStep1()) return false;
    
    // التحقق من الوظيفة
    if (!selectedJob) {
        showError('يرجى اختيار الوظيفة');
        return false;
    }
    
    // التحقق من المنصب (إذا لم يكن مواطن)
    if (selectedJob !== 'citizen' && !selectedPosition) {
        showError('يرجى اختيار المنصب الرئيسي');
        return false;
    }
    
    return true;
}

// عرض رسالة خطأ
function showError(message) {
    // إنشاء عنصر رسالة الخطأ إذا لم يكن موجوداً
    let errorDiv = document.getElementById('errorMessage');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.className = 'error-message';
        document.body.appendChild(errorDiv);
    }
    
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorDiv.style.display = 'block';
    
    // إخفاء الرسالة بعد 4 ثواني
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 4000);
}

// إعادة تعيين الفورم
function resetForm() {
    // إعادة تعيين المتغيرات
    currentStep = 1;
    selectedJob = null;
    selectedPosition = null;
    selectedAdditional = [];
    
    // إعادة تعيين الفورم
    document.getElementById('mainForm').reset();
    document.getElementById('mainForm').style.display = 'block';
    
    // إعادة تعيين التحديدات
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelectorAll('.position-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // إعادة تعيين المربعات
    document.getElementById('noPositions').checked = false;
    document.querySelectorAll('.position-checkbox input').forEach(cb => {
        cb.checked = false;
        cb.disabled = false;
    });
    
    // إخفاء رسالة النجاح
    document.getElementById('successMessage').style.display = 'none';
    
    // إعادة تعيين الخطوات
    setupSteps();
    
    // إعادة تعيين الأزرار
    document.getElementById('nextStep2').disabled = true;
    document.getElementById('nextStep3').disabled = true;
}
