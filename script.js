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

// عند تحميل الصفحة
window.onload = function() {
    // جعل رقم الهوية يقبل أرقاماً فقط[citation:2]
    const idInput = document.getElementById('nationalId');
    idInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
    });
    
    // إعداد رفع الملف[citation:2]
    setupFileUpload();
    
    // إخفاء رسالة النجاح
    document.getElementById('success').style.display = 'none';
};

// إعداد رفع الملف
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('idImage');
    const fileInfo = document.getElementById('fileInfo');
    
    // النقر على منطقة الرفع
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // تغيير الملف[citation:5]
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // التحقق من نوع الملف[citation:2]
            if (!file.type.startsWith('image/')) {
                alert('يرجى رفع ملف صورة فقط (JPG, PNG)');
                return;
            }
            
            // التحقق من حجم الملف (5MB كحد أقصى)
            if (file.size > 5 * 1024 * 1024) {
                alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
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
    
    // سحب وإفلات الملفات[citation:2]
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
            fileInput.dispatchEvent(new Event('change'));
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
    document.getElementById(`step${step}`).classList.add('active');
    
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
            return true;
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
        alert('يرجى إدخال الاسم الكامل');
        return false;
    }
    
    if (!age || age < 18) {
        alert('يرجى إدخال عمر صحيح (18 سنة على الأقل)');
        return false;
    }
    
    if (!discord) {
        alert('يرجى إدخال اسم المستخدم في الديسكورد');
        return false;
    }
    
    if (!nationalId || nationalId.length !== 10) {
        alert('يرجى إدخال رقم الهوية الوطنية (10 أرقام)');
        return false;
    }
    
    return true;
}

function validateStep2() {
    if (!selectedJob) {
        alert('يرجى اختيار الوظيفة');
        return false;
    }
    return true;
}

function validateStep3() {
    if (selectedJob !== 'citizen' && !selectedPosition) {
        alert('يرجى اختيار المنصب الرئيسي');
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
    document.getElementById('next2').disabled = false;
    
    // تحديث العنوان
    const titles = {
        citizen: 'مواطن',
        interior: 'وزارة الداخلية',
        health: 'وزارة الصحة',
        justice: 'وزارة العدل'
    };
    document.getElementById('position-title').textContent = `اختيار المنصب - ${titles[job]}`;
}

// تحميل المناصب
function loadPositions() {
    const container = document.getElementById('positions-list');
    if (!container) return;
    
    const positions = data[selectedJob] || [];
    
    container.innerHTML = positions.map(pos => `
        <div class="position" onclick="selectPosition(this, '${pos}')">${pos}</div>
    `).join('');
}

// اختيار المنصب
function selectPosition(el, position) {
    document.querySelectorAll('.position').forEach(p => {
        p.classList.remove('selected');
    });
    
    el.classList.add('selected');
    selectedPosition = position;
    document.getElementById('next3').disabled = false;
}

// تحميل المناصب الإضافية
function loadAdditional() {
    const container = document.getElementById('additional-list');
    if (!container) return;
    
    const additional = data.additional[selectedJob] || [];
    
    container.innerHTML = additional.map(item => `
        <div class="additional-item">
            <input type="checkbox" id="add-${item}" value="${item}" onchange="updateAdditional(this)">
            <label for="add-${item}">${item}</label>
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
    document.getElementById('success').style.display = 'block';
    document.getElementById('request-id').textContent = requestId;
    
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
        alert('يرجى رفع صورة هوية اللعبة قبل الإرسال');
        return false;
    }
    
    return true;
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
    document.getElementById('idImage').value = '';
    
    // إعادة تعيين التحديدات
    document.querySelectorAll('.option').forEach(el => {
        el.classList.remove('selected');
    });
    
    document.querySelectorAll('.position').forEach(el => {
        el.classList.remove('selected');
    });
    
    // إعادة تعيين المربعات
    document.getElementById('no-pos').checked = false;
    const checkboxes = document.querySelectorAll('.additional-item input');
    checkboxes.forEach(cb => {
        if (cb) {
            cb.checked = false;
            cb.disabled = false;
        }
    });
    
    // إعادة تعيين عرض الملف
    document.getElementById('fileInfo').innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>لم يتم اختيار أي ملف</span>
    `;
    
    // إعادة تعيين الأزرار
    document.getElementById('next2').disabled = true;
    document.getElementById('next3').disabled = true;
    
    // إخفاء رسالة النجاح
    document.getElementById('success').style.display = 'none';
    
    // العودة للخطوة الأولى
    goToStep(1);
}
