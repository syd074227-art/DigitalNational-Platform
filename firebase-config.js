// firebase-config.js
// يمكن تضمين هذا الملف في كل الصفحات لتجنب تكرار الإعدادات

const firebaseConfig = {
    apiKey: "AIzaSyC4N68B8RQmzS_h5d8Q6vM4l5oWv5mW8Hs",
    authDomain: "kr-system-5c846.firebaseapp.com",
    databaseURL: "https://kr-system-5c846-default-rtdb.firebaseio.com",
    projectId: "kr-system-5c846",
    storageBucket: "kr-system-5c846.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// دالة لتهيئة Firebase
function initializeFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        return {
            app: firebase.app(),
            database: firebase.database(),
            storage: firebase.storage()
        };
    } catch (error) {
        console.error('❌ خطأ في تهيئة Firebase:', error);
        return null;
    }
}

// دالة للتحقق من اتصال Firebase
async function checkFirebaseConnection() {
    try {
        const fb = initializeFirebase();
        if (!fb) return false;
        
        await fb.database.ref('.info/connected').once('value');
        return true;
    } catch (error) {
        console.error('❌ خطأ في الاتصال بـ Firebase:', error);
        return false;
    }
}

// دالة للحصول على الوقت الحالي من سيرفر Firebase
function getFirebaseTimestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
}

// تصدير الدوال للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, initializeFirebase, checkFirebaseConnection };
}
