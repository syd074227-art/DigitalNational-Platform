// الخطوة الحالية
let currentStep = 1;
let selectedFile = null;

// عندما تفتح الصفحة
window.onload = function() {
    // 1. جعل حقل الهوية يقبل أرقام فقط
    const idInput = document.getElementById('nationalId');
    
    idInput.addEventListener('input', function() {
        // السماح فقط بالأرقام
        let value = this.value.replace(/\D/g, '');
        
        // إذا كان المستخدم كتب حروف، نعرض تحذير فوري
        if (this.value !== value) {
            showError('❌ رقم الهوية يقبل أرقام فقط!');
        }
        
        // تحديث القيمة
        this.value = value.slice(0, 10);
    });
    
    // 2. إعداد رفع الملف
    document.getElementById('idImage').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            selectedFile = e.target.files[0];
            document.getElementById('fileInfo').innerHTML = 
                `✅ تم رفع: ${selectedFile.name}`;
        }
    });
};

// الانتقال بين الخطوات
function goToStep(step) {
    // إذا كنت تنتقل للخطوة التالية، تحقق أولاً
    if (step > currentStep) {
        if (!validateCurrentStep()) {
            return; // توقف إذا في خطأ
        }
    }
    
    // إخفاء كل الخطوات
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.remove('active');
    });
    
    // إظهار الخطوة المطلوبة
    document.getElementById('step' + step).classList.add('active');
    currentStep = step;
}

// اختيار الوظيفة
function selectJob(jobType) {
    // إزالة التحديد القديم
    document.querySelectorAll('.option').forEach(el => {
        el.classList.remove('selected');
    });
    
    // إضافة التحديد للعنصر المضغوط
    event.currentTarget.classList.add('selected');
}

// رفع الملف
function uploadFile() {
    document.getElementById('idImage').click();
}

// التحقق من الخطوة الحالية
function validateCurrentStep() {
    if (currentStep === 1) {
        return validateStep1();
    } else if (currentStep === 2) {
        return validateStep2();
    }
    return true;
}

// التحقق من الخطوة 1
function validateStep1() {
    const name = document.getElementById('fullName').value.trim();
    const age = document.getElementById('age').value;
    const discord = document.getElementById('discord').value.trim();
    const nationalId = document.getElementById('nationalId').value.trim();
    
    if (!name) {
        showError('⚠️ يرجى إدخال الاسم الكامل');
        return false;
    }
    
    if (!age || age < 18) {
        showError('⚠️ العمر يجب أن يكون 18 سنة أو أكثر');
        return false;
    }
    
    if (!discord) {
        showError('⚠️ يرجى إدخال اسم الديسكورد');
        return false;
    }
    
    if (!nationalId || nationalId.length !== 10) {
        showError('❌ رقم الهوية يجب أن يكون 10 أرقام بالضبط');
        return false;
    }
    
    return true;
}

// التحقق من الخطوة 2
function validateStep2() {
    const selected = document.querySelector('.option.selected');
    if (!selected) {
        showError('⚠️ يرجى اختيار الوظيفة');
        return false;
    }
    return true;
}

// إرسال الفورم
function submitForm() {
    // التحقق من الصورة
    if (!selectedFile) {
        showError('📸 يرجى رفع صورة الهوية أولاً');
        return;
    }
    
    // إخفاء الفورم وإظهار رسالة النجاح
    document.querySelectorAll('.form-step').forEach(el => {
        el.style.display = 'none';
    });
    
    document.getElementById('success').style.display = 'block';
    
    // طباعة البيانات
    console.log('تم إرسال الطلب بنجاح!');
    console.log('اسم الملف:', selectedFile.name);
}

// عرض رسالة خطأ
function showError(message) {
    const errorBox = document.getElementById('errorBox');
    
    // عرض الرسالة
    errorBox.innerHTML = message;
    errorBox.style.display = 'block';
    
    // إخفاء الرسالة بعد 4 ثواني
    setTimeout(() => {
        errorBox.style.display = 'none';
    }, 4000);
    
    // اهتزاز الصفحة قليلاً (تجربة أفضل)
    document.body.style.animation = 'none';
    setTimeout(() => {
        document.body.style.animation = 'shake 0.5s';
    }, 10);
}

// إعادة تعيين الفورم
function resetForm() {
    // إعادة تعيين القيم
    document.getElementById('fullName').value = '';
    document.getElementById('age').value = '';
    document.getElementById('discord').value = '';
    document.getElementById('nationalId').value = '';
    document.getElementById('idImage').value = '';
    selectedFile = null;
    
    // إعادة تعيين التحديد
    document.querySelectorAll('.option').forEach(el => {
        el.classList.remove('selected');
    });
    
    // إعادة تعيين العرض
    document.getElementById('fileInfo').innerHTML = 'لم يتم رفع أي صورة';
    
    // إعادة إظهار الفورم
    document.querySelectorAll('.form-step').forEach(el => {
        el.style.display = 'block';
    });
    
    document.getElementById('success').style.display = 'none';
    
    // العودة للخطوة 1
    goToStep(1);
}

// إضافة أنيميشن الاهتزاز
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);
