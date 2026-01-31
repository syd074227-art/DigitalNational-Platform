// database.js - نظام قاعدة بيانات مبسطة باستخدام localStorage
class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        if (!localStorage.getItem('kr_identity_requests')) {
            localStorage.setItem('kr_identity_requests', JSON.stringify([]));
        }
        if (!localStorage.getItem('kr_users')) {
            localStorage.setItem('kr_users', JSON.stringify([]));
        }
        if (!localStorage.getItem('kr_admins')) {
            // إضافة مستخدم مسؤول افتراضي
            const defaultAdmins = [
                {
                    id: 1,
                    username: 'admin',
                    password: 'admin123',
                    name: 'المسؤول الرئيسي',
                    role: 'superadmin',
                    department: 'all',
                    created_at: new Date().toISOString()
                }
            ];
            localStorage.setItem('kr_admins', JSON.stringify(defaultAdmins));
        }
    }

    // إضافة طلب جديد
    addRequest(requestData) {
        const requests = this.getAllRequests();
        requestData.id = 'KR-' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
        requestData.created_at = new Date().toISOString();
        requestData.updated_at = new Date().toISOString();
        requestData.status = 'pending';
        
        requests.unshift(requestData); // إضافة في البداية
        localStorage.setItem('kr_identity_requests', JSON.stringify(requests));
        
        // تحديث الإحصائيات
        this.updateStats();
        
        return requestData;
    }

    // جلب جميع الطلبات
    getAllRequests() {
        return JSON.parse(localStorage.getItem('kr_identity_requests') || '[]');
    }

    // جلب الطلبات حسب الحالة
    getRequestsByStatus(status) {
        const requests = this.getAllRequests();
        return requests.filter(request => request.status === status);
    }

    // تحديث حالة الطلب
    updateRequestStatus(requestId, status, notes = '', adminName = '') {
        const requests = this.getAllRequests();
        const requestIndex = requests.findIndex(req => req.id === requestId);
        
        if (requestIndex !== -1) {
            requests[requestIndex].status = status;
            requests[requestIndex].updated_at = new Date().toISOString();
            requests[requestIndex].review_notes = notes;
            requests[requestIndex].reviewed_by = adminName;
            requests[requestIndex].reviewed_at = new Date().toISOString();
            
            // إذا تم القبول، إضافة المستخدم إلى القائمة النشطة
            if (status === 'accepted') {
                this.activateUser(requests[requestIndex]);
            }
            
            localStorage.setItem('kr_identity_requests', JSON.stringify(requests));
            this.updateStats();
            return true;
        }
        return false;
    }

    // تفعيل المستخدم
    activateUser(requestData) {
        const users = this.getAllUsers();
        const userData = {
            id: requestData.gameId,
            fullName: requestData.fullName,
            age: requestData.age,
            gameUsername: requestData.gameUsername,
            discordUsername: requestData.discordUsername,
            department: requestData.department,
            departmentName: requestData.departmentName,
            rank: requestData.rank,
            additionals: requestData.additionals,
            activationDate: new Date().toISOString(),
            status: 'active',
            requestId: requestData.id
        };
        
        // إزالة أي تفعيل سابق لنفس المستخدم
        const existingIndex = users.findIndex(user => user.id === userData.id);
        if (existingIndex !== -1) {
            users[existingIndex] = userData;
        } else {
            users.push(userData);
        }
        
        localStorage.setItem('kr_users', JSON.stringify(users));
        return userData;
    }

    // جلب جميع المستخدمين المفعلين
    getAllUsers() {
        return JSON.parse(localStorage.getItem('kr_users') || '[]');
    }

    // جلب إحصائيات
    getStats() {
        const requests = this.getAllRequests();
        const users = this.getAllUsers();
        
        return {
            totalRequests: requests.length,
            pendingRequests: requests.filter(r => r.status === 'pending').length,
            acceptedRequests: requests.filter(r => r.status === 'accepted').length,
            rejectedRequests: requests.filter(r => r.status === 'rejected').length,
            activeUsers: users.length,
            lastUpdated: new Date().toISOString()
        };
    }

    // تحديث الإحصائيات
    updateStats() {
        const stats = this.getStats();
        localStorage.setItem('kr_stats', JSON.stringify(stats));
        return stats;
    }

    // مصادقة المسؤول
    authenticateAdmin(username, password) {
        const admins = JSON.parse(localStorage.getItem('kr_admins') || '[]');
        const admin = admins.find(admin => 
            admin.username === username && admin.password === password
        );
        return admin || null;
    }

    // جلب جميع المسؤولين
    getAllAdmins() {
        return JSON.parse(localStorage.getItem('kr_admins') || '[]');
    }

    // إضافة مسؤول جديد
    addAdmin(adminData) {
        const admins = this.getAllAdmins();
        adminData.id = admins.length > 0 ? Math.max(...admins.map(a => a.id)) + 1 : 1;
        adminData.created_at = new Date().toISOString();
        admins.push(adminData);
        localStorage.setItem('kr_admins', JSON.stringify(admins));
        return adminData;
    }

    // حذف طلب
    deleteRequest(requestId) {
        const requests = this.getAllRequests();
        const filteredRequests = requests.filter(req => req.id !== requestId);
        localStorage.setItem('kr_identity_requests', JSON.stringify(filteredRequests));
        this.updateStats();
        return true;
    }
}

// إنشاء نسخة عامة من قاعدة البيانات
const KR_DATABASE = new Database();
