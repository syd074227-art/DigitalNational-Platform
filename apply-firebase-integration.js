/**

- ========================================
- KR Identity System - Firebase Integration
- ========================================
- هذا الملف يحتوي على كل الوظائف المطلوبة لربط apply.html مع Firebase
- 
- طريقة الاستخدام:
- 1. ضع هذا الملف في نفس مجلد apply.html
- 1. أضف هذا السطر قبل إغلاق </body> في apply.html:
- <script type="module" src="./apply-firebase-integration.js"></script>
- 1. استبدل firebaseConfig ببياناتك
   */

// ========================================
// Firebase Configuration
// ========================================
const firebaseConfig = {
apiKey: “YOUR_API_KEY_HERE”,
authDomain: “your-project.firebaseapp.com”,
projectId: “your-project-id”,
storageBucket: “your-project.appspot.com”,
messagingSenderId: “123456789”,
appId: “your-app-id”
};

// ========================================
// Import Firebase Modules
// ========================================
import { initializeApp } from ‘https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js’;
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, onSnapshot } from ‘https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js’;
import { getStorage, ref, uploadBytes, getDownloadURL } from ‘https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js’;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

console.log(‘🔥 Firebase initialized successfully!’);

// ========================================
// Override Global Functions
// ========================================

// استبدال دالة initializeApp الأصلية
const originalInitializeApp = window.initializeApp;
window.initializeApp = async function() {
console.log(‘🚀 تهيئة التطبيق مع Firebase…’);

```
const deviceId = getDeviceId();
console.log('📱 Device ID:', deviceId);

// جلب طلبات المستخدم
const result = await getUserRequestsFromFirebase(deviceId);

if (result.success && result.requests.length > 0) {
    const latestRequest = result.requests[0];
    console.log('📋 تم العثور على طلب سابق:', latestRequest);
    
    if (latestRequest.status === 'accepted') {
        console.log('✅ الحساب مفعّل! جاري التوجيه...');
        redirectToActivatedPlatform(latestRequest);
        return;
    }
    
    showExistingRequest(latestRequest);
    document.getElementById('loadingScreen').style.display = 'none';
    
    // بدء الاستماع للتحديثات الفورية
    startRealtimeMonitoring(deviceId);
} else {
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('applicationForm').style.display = 'block';
    
    // بدء الاستماع للتحديثات الفورية
    startRealtimeMonitoring(deviceId);
}
```

};

// استبدال دالة submitRequest الأصلية
const originalSubmitRequest = window.submitRequest;
window.submitRequest = async function() {
const terms1 = document.getElementById(‘agreeTerms1’);
const terms2 = document.getElementById(‘agreeTerms2’);
const terms3 = document.getElementById(‘agreeTerms3’);

```
if (!terms1.checked || !terms2.checked || !terms3.checked) {
    showAlert('يجب الموافقة على جميع الشروط قبل إرسال الطلب', false);
    return;
}

// إظهار شاشة التحميل
const loadingScreen = document.getElementById('loadingScreen');
loadingScreen.style.display = 'flex';
loadingScreen.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-text">جاري رفع الصور وإرسال الطلب...</div>
`;

try {
    // رفع الصور إلى Firebase Storage
    console.log('📤 بدء رفع الصور...');
    
    const nationalIdUpload = await uploadImageToFirebaseStorage(
        window.uploadedNationalId.data,
        window.uploadedNationalId.name,
        'national-ids'
    );
    
    if (!nationalIdUpload.success) {
        throw new Error('فشل رفع صورة الهوية الوطنية');
    }
    
    const characterImageUpload = await uploadImageToFirebaseStorage(
        window.uploadedCharacterImage.data,
        window.uploadedCharacterImage.name,
        'character-images'
    );
    
    if (!characterImageUpload.success) {
        throw new Error('فشل رفع صورة الشخصية');
    }
    
    console.log('✅ تم رفع الصور بنجاح!');
    
    // تحضير بيانات الطلب
    const requestData = {
        id: 'KR-' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase(),
        fullName: document.getElementById('fullName').value.trim(),
        age: parseInt(document.getElementById('age').value),
        gameUsername: document.getElementById('gameUsername').value.trim(),
        discordUsername: document.getElementById('discordUsername').value.trim(),
        gameId: document.getElementById('gameId').value.trim(),
        department: window.selectedDepartment,
        departmentName: window.DEPARTMENTS[window.selectedDepartment].name,
        rank: window.selectedRank,
        additionals: window.selectedAdditionals,
        nationalIdImageURL: nationalIdUpload.url,
        characterImageURL: characterImageUpload.url,
        date: new Date().toLocaleString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        status: 'pending',
        deviceId: getDeviceId(),
        adminNotes: ''
    };
    
    // إضافة الطلب إلى Firestore
    console.log('📝 إضافة الطلب إلى قاعدة البيانات...');
    const addResult = await addRequestToFirestore(requestData);
    
    if (!addResult.success) {
        throw new Error('فشل حفظ الطلب في قاعدة البيانات');
    }
    
    console.log('🎉 تم إرسال الطلب بنجاح!');
    loadingScreen.style.display = 'none';
    
    // إظهار رسالة النجاح
    showSuccessMessage(requestData);
    
} catch (error) {
    console.error('❌ خطأ في إرسال الطلب:', error);
    loadingScreen.style.display = 'none';
    showAlert('حدث خطأ أثناء إرسال الطلب: ' + error.message, false);
}
```

};

// ========================================
// Firebase Helper Functions
// ========================================

/**

- رفع صورة إلى Firebase Storage
  */
  async function uploadImageToFirebaseStorage(imageData, fileName, folder = ‘images’) {
  try {
  // تحويل base64 إلى blob
  const response = await fetch(imageData);
  const blob = await response.blob();
  
  ```
   // إنشاء اسم فريد للصورة
   const timestamp = Date.now();
   const randomStr = Math.random().toString(36).substring(2, 9);
   const uniqueFileName = `${timestamp}_${randomStr}_${fileName}`;
   
   // إنشاء مرجع للصورة
   const storageRef = ref(storage, `${folder}/${uniqueFileName}`);
   
   // رفع الصورة
   const snapshot = await uploadBytes(storageRef, blob);
   
   // الحصول على رابط التحميل
   const downloadURL = await getDownloadURL(snapshot.ref);
   
   console.log('✅ تم رفع الصورة بنجاح:', downloadURL);
   return { success: true, url: downloadURL };
  ```
  
  } catch (error) {
  console.error(‘❌ خطأ في رفع الصورة:’, error);
  return { success: false, error: error.message };
  }
  }

/**

- إضافة طلب جديد إلى Firestore
  */
  async function addRequestToFirestore(requestData) {
  try {
  const docRef = await addDoc(collection(db, “requests”), {
  …requestData,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
  });
  
  ```
   console.log('✅ تم إضافة الطلب إلى Firebase بنجاح! ID:', docRef.id);
   return { success: true, id: docRef.id };
  ```
  
  } catch (error) {
  console.error(‘❌ خطأ في إضافة الطلب:’, error);
  return { success: false, error: error.message };
  }
  }

/**

- جلب طلبات المستخدم الحالي
  */
  async function getUserRequestsFromFirebase(deviceId) {
  try {
  const q = query(
  collection(db, “requests”),
  where(“deviceId”, “==”, deviceId),
  orderBy(“createdAt”, “desc”)
  );
  
  ```
   const querySnapshot = await getDocs(q);
   const requests = [];
   
   querySnapshot.forEach((doc) => {
       requests.push({
           firestoreId: doc.id,
           ...doc.data()
       });
   });
   
   console.log(`✅ تم جلب ${requests.length} طلب من Firebase`);
   return { success: true, requests };
  ```
  
  } catch (error) {
  console.error(‘❌ خطأ في جلب الطلبات:’, error);
  return { success: false, error: error.message, requests: [] };
  }
  }

/**

- الاستماع للتحديثات الفورية على طلبات المستخدم
  */
  function startRealtimeMonitoring(deviceId) {
  console.log(‘👁️ بدء المراقبة الفورية للطلبات…’);
  
  const q = query(
  collection(db, “requests”),
  where(“deviceId”, “==”, deviceId)
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
  const requests = [];
  querySnapshot.forEach((doc) => {
  requests.push({
  firestoreId: doc.id,
  …doc.data()
  });
  });
  
  ```
   console.log('🔄 تحديث فوري: تم جلب', requests.length, 'طلب');
   
   if (requests.length > 0) {
       const latestRequest = requests.sort((a, b) => 
           new Date(b.createdAt) - new Date(a.createdAt)
       )[0];
       
       if (latestRequest.status === 'accepted') {
           console.log('🎉 تم قبول الطلب! جاري التوجيه الفوري...');
           redirectToActivatedPlatform(latestRequest);
       }
   }
  ```
  
  });
  
  // حفظ الـ unsubscribe للتنظيف لاحقاً
  window.realtimeListener = unsubscribe;
  }

/**

- الحصول على Device ID فريد
  */
  function getDeviceId() {
  let deviceId = localStorage.getItem(‘device_id’);
  if (!deviceId) {
  deviceId = ‘device_’ + Date.now() + ‘_’ + Math.random().toString(36).substr(2, 9);
  localStorage.setItem(‘device_id’, deviceId);
  }
  return deviceId;
  }

// ========================================
// Helper Functions من الملف الأصلي
// ========================================

function showSuccessMessage(requestData) {
const form = document.getElementById(‘applicationForm’);
const successMessage = document.getElementById(‘successMessage’);
const successDetails = document.getElementById(‘successDetails’);

```
successDetails.innerHTML = `
    <div style="background: rgba(0,0,0,0.3); border-radius: 20px; padding: 35px; margin: 35px 0; border: 1px solid rgba(255,255,255,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <span style="color: var(--gray-light);"><i class="fas fa-hashtag"></i> رقم الطلب:</span>
            <span style="font-weight: 800; font-size: 20px; color: var(--accent);">${requestData.id}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <span style="color: var(--gray-light);"><i class="fas fa-calendar"></i> تاريخ التقديم:</span>
            <span style="font-weight: 600;">${requestData.date}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <span style="color: var(--gray-light);"><i class="fas fa-building"></i> الوزارة:</span>
            <span style="font-weight: 600;">${requestData.departmentName}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 0;">
            <span style="color: var(--gray-light);"><i class="fas fa-info-circle"></i> الحالة:</span>
            <span style="color: var(--warning); font-weight: 700; font-size: 18px;">
                <i class="fas fa-clock"></i> قيد المراجعة
            </span>
        </div>
    </div>
    <p style="color: var(--gray-light); font-size: 16px; text-align: center; margin-top: 20px;">
        <i class="fas fa-sync-alt fa-spin" style="margin-left: 8px;"></i> 
        سيتم توجيهك تلقائياً للمنصة الرقمية فور قبول طلبك
    </p>
`;

form.style.display = 'none';
successMessage.style.display = 'block';
successMessage.classList.add('show');
window.scrollTo({ top: 0, behavior: 'smooth' });
```

}

function showExistingRequest(request) {
const messageDiv = document.getElementById(‘previousRequestMessage’);
const formDiv = document.getElementById(‘applicationForm’);

```
let statusText, statusClass, statusIcon, statusColor;

if (request.status === 'pending') {
    statusText = 'طلبك قيد المراجعة';
    statusClass = 'warning';
    statusIcon = 'clock';
    statusColor = 'var(--warning)';
} else if (request.status === 'accepted') {
    statusText = 'تم تفعيل هويتك بنجاح';
    statusClass = 'success';
    statusIcon = 'check-circle';
    statusColor = 'var(--success)';
} else {
    statusText = 'تم رفض طلبك';
    statusClass = 'danger';
    statusIcon = 'times-circle';
    statusColor = 'var(--danger)';
}

messageDiv.innerHTML = `
    <i class="fas fa-${statusIcon}" style="font-size: 80px; margin-bottom: 30px; color: ${statusColor};"></i>
    <h2 style="font-size: 32px; margin-bottom: 25px;">${statusText}</h2>
    <div style="background: rgba(0,0,0,0.3); border-radius: 16px; padding: 25px; margin: 30px 0;">
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <span><i class="fas fa-hashtag"></i> رقم الطلب:</span>
            <strong>${request.id}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <span><i class="fas fa-calendar"></i> التاريخ:</span>
            <span>${request.date}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0;">
            <span><i class="fas fa-info-circle"></i> الحالة:</span>
            <span style="color: ${statusColor}; font-weight: 700;">
                ${request.status === 'accepted' ? 'مقبول ✓' : request.status === 'pending' ? 'قيد المراجعة ⏱' : 'مرفوض ✗'}
            </span>
        </div>
        ${request.adminNotes ? `
        <div style="margin-top: 15px; padding: 15px; background: rgba(255, 111, 0, 0.1); border-radius: 10px; border-right: 3px solid var(--accent);">
            <strong style="color: var(--accent);"><i class="fas fa-comment"></i> ملاحظات الإدارة:</strong>
            <p style="color: var(--light); margin-top: 8px;">${request.adminNotes}</p>
        </div>
        ` : ''}
    </div>
    ${request.status === 'rejected' ? 
        '<button class="btn" onclick="startNewRequest()"><i class="fas fa-redo"></i><span>تقديم طلب جديد</span></button>' : 
        request.status === 'pending' ? 
        '<p style="color: var(--gray-light); margin-top: 20px; font-size: 16px;"><i class="fas fa-sync-alt fa-spin" style="margin-left: 8px;"></i> جاري مراقبة حالة الطلب تلقائياً... سيتم توجيهك فور القبول</p>' : 
        ''
    }
`;

messageDiv.className = `status-message show ${statusClass}`;
messageDiv.style.background = 'var(--glass)';
messageDiv.style.backdropFilter = 'blur(20px)';
messageDiv.style.border = `2px solid ${statusColor}`;
formDiv.style.display = 'none';
```

}

function redirectToActivatedPlatform(userData) {
localStorage.setItem(‘activated_user_data’, JSON.stringify(userData));
localStorage.setItem(‘user_activated’, ‘true’);

```
document.getElementById('loadingScreen').style.display = 'flex';
document.getElementById('loadingScreen').innerHTML = `
    <div style="text-align: center;">
        <i class="fas fa-check-circle" style="font-size: 100px; color: #00c853; margin-bottom: 30px; animation: scaleIn 0.5s ease;"></i>
        <div style="color: #00c853; font-size: 28px; font-weight: 800; margin-bottom: 15px;">تم تفعيل هويتك بنجاح! 🎉</div>
        <div style="color: var(--accent); font-size: 18px; font-weight: 600; animation: pulse 1.5s ease-in-out infinite;">جاري التوجيه إلى المنصة الرقمية...</div>
        <div style="margin-top: 30px;">
            <div class="loading-spinner"></div>
        </div>
    </div>
    <style>
        @keyframes scaleIn { 
            from { transform: scale(0); } 
            to { transform: scale(1); } 
        }
    </style>
`;

setTimeout(() => {
    window.location.href = 'kr-digital-platform.html';
}, 1500);
```

}

function showAlert(message, isSuccess) {
const alertBox = document.getElementById(‘alertBox’);
alertBox.innerHTML = `<i class="fas fa-${isSuccess ? 'check-circle' : 'exclamation-triangle'}" style="font-size: 24px; margin-bottom: 10px;"></i> <div>${message}</div>`;
alertBox.className = ‘alert’;
if (isSuccess) {
alertBox.classList.add(‘success’);
} else {
alertBox.classList.add(‘warning’);
}
alertBox.classList.add(‘show’);

```
setTimeout(() => {
    alertBox.classList.remove('show');
}, 4000);
```

}

// ========================================
// Auto-Initialize
// ========================================
console.log(‘🎯 Firebase Integration loaded successfully!’);

// تحميل التطبيق تلقائياً عند تحميل الصفحة
if (document.readyState === ‘loading’) {
document.addEventListener(‘DOMContentLoaded’, () => {
if (window.initializeApp) {
window.initializeApp();
}
});
} else {
if (window.initializeApp) {
window.initializeApp();
}
}

// تنظيف عند إغلاق الصفحة
window.addEventListener(‘beforeunload’, () => {
if (window.realtimeListener) {
window.realtimeListener();
}
});
