// البيانات
const data = {
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
    ],
    additional: {
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
    }
};

// حالة التطبيق
let currentStep = 1;
let selectedJob = null;
let selectedPosition = null;
let selectedAdditional = [];
let selectedFile = null;
let errorTimeout = null;

// عند تحميل الصفحة
window.onload = function() {
    // جعل رقم الهوية يقبل أرقاماً فقط
    const idInput = document.getElementById('nationalId');
    idInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
    });
    
    // إعداد رفع الملف
    setupFileUpload();
    
    // إخفاء رسالة النجاح
    document.getElementById('success').style.display = 'none';
};

// إعداد رفع الملف
function setupFileUpload() {
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
                showError('يرجى رفع ملف صورة فقط (JPG, PNG)');
                return;
            }
            
            // التحقق من حجم الملف (5MB كحد أقصى)
            if (file.size > 5 * 1024 * 1024) {
                showError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
                return;
            }
            
            selectedFile = file;
            
            // تحديث عرض المعلومات
            fileInfo.innerHTML = `
                <i class="fas fa-check-circle" style="color: #10b981;"></i>
                <span>تم رفع: ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
            `;
        }
    });
    
    // سحب وإفلات الملفات
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
        this.style.borderColor = '#3b82f6';
        this.style.background = '#eff6ff';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        this.style.borderColor = '#cbd5e1';
        this.style.background = '#f8fafc';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        this.style.borderColor = '#cbd5e1';
        this.style.background = '#f8fafc';
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            const changeEvent = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(changeEvent);
        }
    });
}

// الانتقال بين الخطوات
function goToStep(step) {
    if (step < 1 || step > 5) return;
    
    // التحقق قبل الانتقال
    if (step > currentStep) {
        if (!validateStep(currentStep)) return;
    }
    
    // إخفاء جميع الخطوات
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.remove('active');
    });
    
    // تحديث الخطوة الحالية
    currentStep = step;
    
    // إظهار الخطوة المطلوبة
    const stepElement = document.getElementById(`step${step}`);
    if (stepElement) {
        stepElement.classList.add('active');
    }
    
    // إذا كانت الخطوة 3، تعبئة المناصب
    if (step === 3 && selectedJob && selectedJob !== 'citizen') {
        loadPositions();
    }
    
    // إذا كانت الخطوة 4، تعبئة المناصب الإضافية
    if (step === 4 && selectedJob && selectedJob !== 'citizen') {
        loadAdditional();
    }
}

// التحقق من الخطوة
function validateStep(step) {
    switch(step) {
        case 1:
            return validateStep1();
        case 2:
            return validateStep2();
        case 3:
            return validateStep3();
        case 4:
            return true; // المناصب الإضافية اختيارية
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
        document.getElementById('fullName').focus();
        return false;
    }
    
    if (!age || age < 18) {
        showError('يرجى إدخال عمر صحيح (18 سنة على الأقل)');
        document.getElementById('age').focus();
        return false;
    }
    
    if (!discord) {
        showError('يرجى إدخال اسم المستخدم في الديسكورد');
        document.getElementById('discord').focus();
        return false;
    }
    
    if (!nationalId || nationalId.length !== 10) {
        showError('يرجى إدخال رقم الهوية في اللعبة (10 أرقام)');
        document.getElementById('nationalId').focus();
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
function selectJob(job) {
    selectedJob = job;
    selectedPosition = null;
    selectedAdditional = [];
    
    // تحديث التحديد
    document.querySelectorAll('.option').forEach(el => {
        el.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    
    // تمكين الزر التالي
    const nextBtn = document.getElementById('next2');
    if (nextBtn) {
        nextBtn.disabled = false;
    }
    
    // تحديث العنوان
    const titles = {
        citizen: 'مواطن',
        interior: 'وزارة الداخلية',
        health: 'وزارة الصحة',
        justice: 'وزارة العدل'
    };
    const titleElement = document.getElementById('position-title');
    if (titleElement) {
        titleElement.textContent = `اختيار المنصب - ${titles[job]}`;
    }
}

// تحميل المناصب
function loadPositions() {
    const container = document.getElementById('positions-list');
    if (!container) return;
    
    const positions = data[selectedJob] || [];
    
    if (positions.length === 0) {
        container.innerHTML = '<p>لا توجد مناصب متاحة</p>';
        return;
    }
    
    container.innerHTML = positions.map(pos => `
        <div class="position" onclick="selectPosition(this, '${pos}')">${pos}</div>
    `).join('');
    
    // إضافة مستمعي الأحداث للمناصب
    document.querySelectorAll('.position').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.position').forEach(p => {
                p.classList.remove('selected');
            });
            this.classList.add('selected');
            selectedPosition = this.textContent;
            const nextBtn = document.getElementById('next3');
            if (nextBtn) {
                nextBtn.disabled = false;
            }
        });
    });
}

// اختيار المنصب
function selectPosition(el, position) {
    document.querySelectorAll('.position').forEach(p => {
        p.classList.remove('selected');
    });
    
    el.classList.add('selected');
    selectedPosition = position;
    const nextBtn = document.getElementById('next3');
    if (nextBtn) {
        nextBtn.disabled = false;
    }
}

// تحميل المناصب الإضافية
function loadAdditional() {
    const container = document.getElementById('additional-list');
    if (!container) return;
    
    const additional = data.additional[selectedJob] || [];
    
    if (additional.length === 0) {
        container.innerHTML = '<p>لا توجد مناصب إضافية</p>';
        return;
    }
    
    container.innerHTML = additional.map(item => `
        <div class="additional-item">
            <input type="checkbox" id="add-${item.replace(/\s+/g, '-')}" value="${item}" onchange="updateAdditional(this)">
            <label for="add-${item.replace(/\s+/g, '-')}">${item}</label>
        </div>
    `).join('');
}

// تحديث المناصب الإضافية
function updateAdditional(checkbox) {
    if (checkbox.checked) {
        selectedAdditional.push(checkbox.value);
    } else {
        selectedAdditional = selectedAdditional.filter(item => item !== checkbox.value);
    }
}

// تبديل المناصب الإضافية
function toggleAdditional() {
    const noPosCheckbox = document.getElementById('no-pos');
    const checkboxes = document.querySelectorAll('.additional-item input');
    
    checkboxes.forEach(cb => {
        cb.disabled = noPosCheckbox.checked;
        if (noPosCheckbox.checked) {
            cb.checked = false;
        }
    });
    
    if (noPosCheckbox.checked) {
        selectedAdditional = [];
    }
}

// إرسال الفورم
function submitForm() {
    // التحقق النهائي
    if (!validateForm()) return;
    
    // جمع البيانات
    const formData = {
        name: document.getElementById('fullName').value.trim(),
        age: document.getElementById('age').value,
        discord: document.getElementById('discord').value.trim(),
        nationalId: document.getElementById('nationalId').value.trim(),
        job: selectedJob,
        position: selectedJob === 'citizen' ? 'مواطن' : selectedPosition,
        additional: selectedAdditional,
        hasIdImage: selectedFile ? 'نعم' : 'لا'
    };
    
    // إنشاء رقم طلب
    const requestId = 'KR-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // إخفاء الفورم
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.remove('active');
    });
    
    // إظهار رسالة النجاح
    const successElement = document.getElementById('success');
    if (successElement) {
        successElement.style.display = 'block';
    }
    
    const requestIdElement = document.getElementById('request-id');
    if (requestIdElement) {
        requestIdElement.textContent = requestId;
    }
    
    // طباعة البيانات (محاكاة الإرسال)
    console.log('📋 بيانات الطلب المرسلة:', formData);
    console.log('🖼️ ملف الهوية:', selectedFile ? selectedFile.name : 'لم يتم الرفع');
    console.log('🆔 رقم الطلب:', requestId);
}

// التحقق النهائي
function validateForm() {
    // التحقق من الخطوات
    if (!validateStep1()) return false;
    if (!validateStep2()) return false;
    if (!validateStep3()) return false;
    
    // التحقق من صورة الهوية
    if (!selectedFile) {
        showError('يرجى رفع صورة هوية اللعبة قبل الإرسال');
        return false;
    }
    
    return true;
}

// عرض رسالة خطأ
function showError(message) {
    // إزالة التحذير السابق إن وجد
    if (errorTimeout) {
        clearTimeout(errorTimeout);
    }
    
    // إنشاء عنصر رسالة الخطأ
    let errorDiv = document.getElementById('errorMessage');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            left: 20px;
            background: #fee2e2;
            color: #991b1b;
            padding: 16px;
            border-radius: 12px;
            text-align: center;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 2px solid #f87171;
            animation: pulseError 0.5s;
        `;
        document.body.appendChild(errorDiv);
        
        // إضافة أنيميشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulseError {
                0% { transform: translateY(-20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorDiv.style.display = 'block';
    
    // إخفاء الرسالة بعد 4 ثواني
    errorTimeout = setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 4000);
}

// إعادة تعيين الفورم
function resetForm() {
    // إعادة تعيين القيم
    currentStep = 1;
    selectedJob = null;
    selectedPosition = null;
    selectedAdditional = [];
    selectedFile = null;
    
    // إعادة تعيين الحقول
    document.getElementById('fullName').value = '';
    document.getElementById('age').value = '';
    document.getElementById('discord').value = '';
    document.getElementById('nationalId').value = '';
    const fileInput = document.getElementById('idImage');
    if (fileInput) fileInput.value = '';
    
    // إعادة تعيين التحديدات
    document.querySelectorAll('.option').forEach(el => {
        el.classList.remove('selected');
    });
    
    document.querySelectorAll('.position').forEach(el => {
        el.classList.remove('selected');
    });
    
    // إعادة تعيين المربعات
    const noPosCheckbox = document.getElementById('no-pos');
    if (noPosCheckbox) noPosCheckbox.checked = false;
    
    const checkboxes = document.querySelectorAll('.additional-item input');
    checkboxes.forEach(cb => {
        if (cb) {
            cb.checked = false;
            cb.disabled = false;
        }
    });
    
    // إعادة تعيين عرض الملف
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) {
        fileInfo.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>لم يتم اختيار أي ملف</span>
        `;
    }
    
    // إعادة تعيين الأزرار
    const next2 = document.getElementById('next2');
    const next3 = document.getElementById('next3');
    if (next2) next2.disabled = true;
    if (next3) next3.disabled = true;
    
    // إخفاء رسالة النجاح
    const success = document.getElementById('success');
    if (success) success.style.display = 'none';
    
    // إخفاء رسالة الخطأ
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) errorDiv.style.display = 'none';
    
    // العودة للخطوة الأولى
    goToStep(1);
}
