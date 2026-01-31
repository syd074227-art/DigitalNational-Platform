// kr-database.js - نظام قاعدة بيانات متقدم باستخدام IndexedDB
class KRDATABASE {
    constructor() {
        this.dbName = 'KR_IDENTITY_SYSTEM';
        this.dbVersion = 4;
        this.db = null;
        this.initialize();
    }

    // ====== تهيئة قاعدة البيانات ======
    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = (event) => {
                console.error('❌ خطأ في فتح قاعدة البيانات:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ قاعدة البيانات جاهزة');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                this.createStores(event);
            };
        });
    }

    // ====== إنشاء المخازن (Tables) ======
    createStores(event) {
        const db = event.target.result;

        // مخزن الطلبات
        if (!db.objectStoreNames.contains('requests')) {
            const requestsStore = db.createObjectStore('requests', {
                keyPath: 'id',
                autoIncrement: false
            });
            // إنشاء الفهارس
            requestsStore.createIndex('status_idx', 'status', { unique: false });
            requestsStore.createIndex('department_idx', 'department', { unique: false });
            requestsStore.createIndex('created_at_idx', 'created_at', { unique: false });
            requestsStore.createIndex('gameId_idx', 'gameId', { unique: true });
            requestsStore.createIndex('deviceId_idx', 'deviceId', { unique: false });
        }

        // مخزن المستخدمين المفعلين
        if (!db.objectStoreNames.contains('users')) {
            const usersStore = db.createObjectStore('users', {
                keyPath: 'id',
                autoIncrement: false
            });
            usersStore.createIndex('status_idx', 'status', { unique: false });
            usersStore.createIndex('department_idx', 'department', { unique: false });
            usersStore.createIndex('activationDate_idx', 'activationDate', { unique: false });
        }

        // مخزن المسؤولين
        if (!db.objectStoreNames.contains('admins')) {
            const adminsStore = db.createObjectStore('admins', {
                keyPath: 'id',
                autoIncrement: true
            });
            adminsStore.createIndex('username_idx', 'username', { unique: true });
            adminsStore.createIndex('role_idx', 'role', { unique: false });
            
            // إضافة المسؤول الافتراضي
            const defaultAdmin = {
                username: 'admin',
                password: 'admin123',
                name: 'المسؤول الرئيسي',
                role: 'superadmin',
                department: 'all',
                email: 'admin@kr.gov.sa',
                phone: '+966500000000',
                created_at: new Date().toISOString(),
                last_login: null,
                permissions: ['all']
            };
            
            const transaction = event.target.transaction;
            transaction.objectStore('admins').add(defaultAdmin);
        }

        // مخزن الإحصائيات
        if (!db.objectStoreNames.contains('statistics')) {
            const statsStore = db.createObjectStore('statistics', {
                keyPath: 'id',
                autoIncrement: true
            });
            statsStore.createIndex('date_idx', 'date', { unique: false });
        }

        // مخزن الإشعارات
        if (!db.objectStoreNames.contains('notifications')) {
            const notificationsStore = db.createObjectStore('notifications', {
                keyPath: 'id',
                autoIncrement: true
            });
            notificationsStore.createIndex('read_idx', 'read', { unique: false });
            notificationsStore.createIndex('type_idx', 'type', { unique: false });
        }

        // مخزن السجلات (Logs)
        if (!db.objectStoreNames.contains('logs')) {
            const logsStore = db.createObjectStore('logs', {
                keyPath: 'id',
                autoIncrement: true
            });
            logsStore.createIndex('action_idx', 'action', { unique: false });
            logsStore.createIndex('user_idx', 'userId', { unique: false });
            logsStore.createIndex('date_idx', 'timestamp', { unique: false });
        }

        // مخزن النسخ الاحتياطية
        if (!db.objectStoreNames.contains('backups')) {
            db.createObjectStore('backups', {
                keyPath: 'id',
                autoIncrement: true
            });
        }
    }

    // ====== الدوال الأساسية ======
    async getTransaction(storeNames, mode = 'readonly') {
        if (!this.db) await this.initialize();
        return this.db.transaction(storeNames, mode);
    }

    async getStore(storeName, mode = 'readonly') {
        const transaction = await this.getTransaction([storeName], mode);
        return transaction.objectStore(storeName);
    }

    // ====== إدارة الطلبات ======
    async addRequest(requestData) {
        const store = await this.getStore('requests', 'readwrite');
        
        // توليد ID فريد
        requestData.id = 'KR-' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 6);
        requestData.created_at = new Date().toISOString();
        requestData.updated_at = new Date().toISOString();
        requestData.status = 'pending';
        requestData.priority = 'normal';
        
        // إضافة العداد
        await this.incrementStats('total_requests');
        await this.incrementStats('pending_requests');
        
        return new Promise((resolve, reject) => {
            const request = store.add(requestData);
            
            request.onsuccess = async () => {
                // إنشاء إشعار للمسؤولين
                await this.createNotification({
                    type: 'new_request',
                    title: 'طلب جديد 📥',
                    message: `طلب جديد من ${requestData.fullName}`,
                    data: { requestId: requestData.id },
                    read: false,
                    timestamp: new Date().toISOString()
                });
                
                // تسجيل السجل
                await this.addLog({
                    action: 'CREATE_REQUEST',
                    userId: requestData.deviceId,
                    details: `تم إنشاء طلب جديد برقم ${requestData.id}`,
                    timestamp: new Date().toISOString(),
                    ip: await this.getClientIP()
                });
                
                resolve(requestData);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async getRequest(id) {
        const store = await this.getStore('requests');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getAllRequests(filters = {}, page = 1, limit = 50) {
        const store = await this.getStore('requests');
        return new Promise((resolve, reject) => {
            const request = store.index('created_at_idx').openCursor(null, 'prev');
            const results = [];
            let skipped = 0;
            let returned = 0;
            const startIndex = (page - 1) * limit;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const request = cursor.value;
                    
                    // تطبيق الفلاتر
                    let passesFilter = true;
                    if (filters.status && request.status !== filters.status) passesFilter = false;
                    if (filters.department && request.department !== filters.department) passesFilter = false;
                    if (filters.dateFrom && new Date(request.created_at) < new Date(filters.dateFrom)) passesFilter = false;
                    if (filters.dateTo && new Date(request.created_at) > new Date(filters.dateTo)) passesFilter = false;
                    
                    if (passesFilter) {
                        if (skipped < startIndex) {
                            skipped++;
                        } else if (returned < limit) {
                            results.push(request);
                            returned++;
                        }
                    }
                    
                    if (returned < limit) {
                        cursor.continue();
                    } else {
                        resolve({
                            data: results,
                            page,
                            limit,
                            total: await this.getRequestsCount(filters),
                            hasMore: skipped + returned < await this.getRequestsCount(filters)
                        });
                    }
                } else {
                    resolve({
                        data: results,
                        page,
                        limit,
                        total: await this.getRequestsCount(filters),
                        hasMore: false
                    });
                }
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getRequestsCount(filters = {}) {
        const store = await this.getStore('requests');
        return new Promise((resolve, reject) => {
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async updateRequestStatus(requestId, status, reviewNotes = '', adminName = '') {
        const store = await this.getStore('requests', 'readwrite');
        
        return new Promise(async (resolve, reject) => {
            const getRequest = store.get(requestId);
            
            getRequest.onsuccess = async (event) => {
                const request = event.target.result;
                if (!request) {
                    reject(new Error('الطلب غير موجود'));
                    return;
                }

                // تحديث الحالة القديمة في الإحصائيات
                await this.updateStatsCounter(request.status, -1);
                
                // تحديث الطلب
                request.status = status;
                request.updated_at = new Date().toISOString();
                request.review_notes = reviewNotes;
                request.reviewed_by = adminName;
                request.reviewed_at = new Date().toISOString();
                
                // تحديث الحالة الجديدة في الإحصائيات
                await this.updateStatsCounter(status, 1);
                
                const updateRequest = store.put(request);
                
                updateRequest.onsuccess = async () => {
                    // إذا تم القبول، تفعيل المستخدم
                    if (status === 'accepted') {
                        await this.activateUser(request);
                    }
                    
                    // إنشاء إشعار للمستخدم
                    await this.createNotification({
                        type: 'request_update',
                        title: status === 'accepted' ? 'تم قبول طلبك 🎉' : 'تم رفض طلبك ❌',
                        message: status === 'accepted' 
                            ? `تم قبول طلب تفعيل الهوية رقم ${requestId}` 
                            : `تم رفض طلب تفعيل الهوية رقم ${requestId}`,
                        data: { requestId, status },
                        read: false,
                        timestamp: new Date().toISOString()
                    });
                    
                    // تسجيل السجل
                    await this.addLog({
                        action: status === 'accepted' ? 'ACCEPT_REQUEST' : 'REJECT_REQUEST',
                        userId: adminName,
                        details: `تم ${status === 'accepted' ? 'قبول' : 'رفض'} الطلب ${requestId}`,
                        timestamp: new Date().toISOString(),
                        ip: await this.getClientIP()
                    });
                    
                    resolve(request);
                };
                
                updateRequest.onerror = (event) => reject(event.target.error);
            };
            
            getRequest.onerror = (event) => reject(event.target.error);
        });
    }

    async deleteRequest(requestId) {
        const store = await this.getStore('requests', 'readwrite');
        
        return new Promise(async (resolve, reject) => {
            // الحصول على الطلب أولاً لتحديث الإحصائيات
            const request = await this.getRequest(requestId);
            if (request) {
                await this.updateStatsCounter(request.status, -1);
                await this.decrementStats('total_requests');
            }
            
            const deleteRequest = store.delete(requestId);
            
            deleteRequest.onsuccess = async () => {
                // تسجيل السجل
                await this.addLog({
                    action: 'DELETE_REQUEST',
                    userId: 'system',
                    details: `تم حذف الطلب ${requestId}`,
                    timestamp: new Date().toISOString(),
                    ip: await this.getClientIP()
                });
                
                resolve(true);
            };
            
            deleteRequest.onerror = (event) => reject(event.target.error);
        });
    }

    // ====== إدارة المستخدمين ======
    async activateUser(requestData) {
        const store = await this.getStore('users', 'readwrite');
        
        const userData = {
            id: requestData.gameId,
            fullName: requestData.fullName,
            age: requestData.age,
            gameUsername: requestData.gameUsername,
            discordUsername: requestData.discordUsername,
            department: requestData.department,
            departmentName: requestData.departmentName,
            rank: requestData.rank,
            additionals: requestData.additionals || [],
            activationDate: new Date().toISOString(),
            status: 'active',
            requestId: requestData.id,
            lastActive: new Date().toISOString(),
            deviceId: requestData.deviceId,
            nationalIdImage: requestData.nationalIdImage,
            characterImage: requestData.characterImage
        };
        
        return new Promise((resolve, reject) => {
            const request = store.put(userData);
            
            request.onsuccess = async () => {
                await this.incrementStats('active_users');
                
                // تسجيل السجل
                await this.addLog({
                    action: 'ACTIVATE_USER',
                    userId: requestData.gameId,
                    details: `تم تفعيل المستخدم ${requestData.fullName}`,
                    timestamp: new Date().toISOString(),
                    ip: await this.getClientIP()
                });
                
                resolve(userData);
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getUser(userId) {
        const store = await this.getStore('users');
        return new Promise((resolve, reject) => {
            const request = store.get(userId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getAllUsers(filters = {}, page = 1, limit = 50) {
        const store = await this.getStore('users');
        return new Promise((resolve, reject) => {
            const request = store.index('activationDate_idx').openCursor(null, 'prev');
            const results = [];
            let skipped = 0;
            let returned = 0;
            const startIndex = (page - 1) * limit;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const user = cursor.value;
                    
                    // تطبيق الفلاتر
                    let passesFilter = true;
                    if (filters.department && user.department !== filters.department) passesFilter = false;
                    if (filters.status && user.status !== filters.status) passesFilter = false;
                    if (filters.dateFrom && new Date(user.activationDate) < new Date(filters.dateFrom)) passesFilter = false;
                    if (filters.dateTo && new Date(user.activationDate) > new Date(filters.dateTo)) passesFilter = false;
                    
                    if (passesFilter) {
                        if (skipped < startIndex) {
                            skipped++;
                        } else if (returned < limit) {
                            results.push(user);
                            returned++;
                        }
                    }
                    
                    if (returned < limit) {
                        cursor.continue();
                    } else {
                        resolve({
                            data: results,
                            page,
                            limit,
                            total: await this.getUsersCount(filters),
                            hasMore: skipped + returned < await this.getUsersCount(filters)
                        });
                    }
                } else {
                    resolve({
                        data: results,
                        page,
                        limit,
                        total: await this.getUsersCount(filters),
                        hasMore: false
                    });
                }
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getUsersCount(filters = {}) {
        const store = await this.getStore('users');
        return new Promise((resolve, reject) => {
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async deactivateUser(userId) {
        const store = await this.getStore('users', 'readwrite');
        
        return new Promise(async (resolve, reject) => {
            const user = await this.getUser(userId);
            if (user) {
                user.status = 'inactive';
                user.deactivationDate = new Date().toISOString();
                
                const updateRequest = store.put(user);
                
                updateRequest.onsuccess = async () => {
                    await this.decrementStats('active_users');
                    
                    // تسجيل السجل
                    await this.addLog({
                        action: 'DEACTIVATE_USER',
                        userId: userId,
                        details: `تم إلغاء تفعيل المستخدم ${user.fullName}`,
                        timestamp: new Date().toISOString(),
                        ip: await this.getClientIP()
                    });
                    
                    resolve(user);
                };
                
                updateRequest.onerror = (event) => reject(event.target.error);
            } else {
                reject(new Error('المستخدم غير موجود'));
            }
        });
    }

    // ====== إدارة المسؤولين ======
    async authenticateAdmin(username, password) {
        const store = await this.getStore('admins');
        return new Promise((resolve, reject) => {
            const request = store.index('username_idx').get(username);
            
            request.onsuccess = async (event) => {
                const admin = event.target.result;
                if (admin && admin.password === password) {
                    // تحديث آخر دخول
                    await this.updateAdminLastLogin(admin.id);
                    resolve(admin);
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async updateAdminLastLogin(adminId) {
        const store = await this.getStore('admins', 'readwrite');
        
        return new Promise(async (resolve, reject) => {
            const admin = await this.getAdmin(adminId);
            if (admin) {
                admin.last_login = new Date().toISOString();
                const updateRequest = store.put(admin);
                
                updateRequest.onsuccess = () => resolve(admin);
                updateRequest.onerror = (event) => reject(event.target.error);
            } else {
                reject(new Error('المسؤول غير موجود'));
            }
        });
    }

    async getAdmin(adminId) {
        const store = await this.getStore('admins');
        return new Promise((resolve, reject) => {
            const request = store.get(adminId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getAllAdmins() {
        const store = await this.getStore('admins');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async addAdmin(adminData) {
        const store = await this.getStore('admins', 'readwrite');
        
        adminData.created_at = new Date().toISOString();
        adminData.last_login = null;
        
        return new Promise((resolve, reject) => {
            const request = store.add(adminData);
            
            request.onsuccess = async () => {
                // تسجيل السجل
                await this.addLog({
                    action: 'ADD_ADMIN',
                    userId: 'system',
                    details: `تم إضافة مسؤول جديد: ${adminData.name}`,
                    timestamp: new Date().toISOString(),
                    ip: await this.getClientIP()
                });
                
                resolve(adminData);
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    // ====== الإحصائيات ======
    async getStatistics() {
        const store = await this.getStore('statistics');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            
            request.onsuccess = async () => {
                const stats = request.result;
                
                // حساب الإحصائيات الحية
                const liveStats = {
                    total_requests: await this.getRequestsCount(),
                    pending_requests: await this.getRequestsCount({ status: 'pending' }),
                    accepted_requests: await this.getRequestsCount({ status: 'accepted' }),
                    rejected_requests: await this.getRequestsCount({ status: 'rejected' }),
                    active_users: await this.getUsersCount({ status: 'active' }),
                    total_admins: await this.getAdminsCount(),
                    today_requests: await this.getTodayRequestsCount(),
                    weekly_requests: await this.getWeeklyRequestsCount(),
                    monthly_requests: await this.getMonthlyRequestsCount(),
                    last_updated: new Date().toISOString()
                };
                
                resolve(liveStats);
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async incrementStats(counterName) {
        const store = await this.getStore('statistics', 'readwrite');
        
        return new Promise((resolve, reject) => {
            const request = store.get(1); // استخدام ID ثابت للإحصائيات
            
            request.onsuccess = (event) => {
                let stats = event.target.result || {};
                stats[counterName] = (stats[counterName] || 0) + 1;
                stats.last_updated = new Date().toISOString();
                
                const updateRequest = store.put(stats, 1);
                updateRequest.onsuccess = () => resolve(stats);
                updateRequest.onerror = (event) => reject(event.target.error);
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async decrementStats(counterName) {
        const store = await this.getStore('statistics', 'readwrite');
        
        return new Promise((resolve, reject) => {
            const request = store.get(1);
            
            request.onsuccess = (event) => {
                let stats = event.target.result || {};
                stats[counterName] = Math.max((stats[counterName] || 0) - 1, 0);
                stats.last_updated = new Date().toISOString();
                
                const updateRequest = store.put(stats, 1);
                updateRequest.onsuccess = () => resolve(stats);
                updateRequest.onerror = (event) => reject(event.target.error);
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async updateStatsCounter(status, delta) {
        const counterName = `${status}_requests`;
        if (delta > 0) {
            await this.incrementStats(counterName);
        } else {
            await this.decrementStats(counterName);
        }
    }

    async getTodayRequestsCount() {
        const store = await this.getStore('requests');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return new Promise((resolve, reject) => {
            const request = store.index('created_at_idx').openCursor(IDBKeyRange.lowerBound(today.toISOString()));
            let count = 0;
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    count++;
                    cursor.continue();
                } else {
                    resolve(count);
                }
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    // ====== الإشعارات ======
    async createNotification(notificationData) {
        const store = await this.getStore('notifications', 'readwrite');
        
        notificationData.id = Date.now();
        
        return new Promise((resolve, reject) => {
            const request = store.add(notificationData);
            request.onsuccess = () => resolve(notificationData);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getNotifications(limit = 20) {
        const store = await this.getStore('notifications');
        return new Promise((resolve, reject) => {
            const request = store.index('timestamp_idx').openCursor(null, 'prev');
            const results = [];
            let count = 0;
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && count < limit) {
                    results.push(cursor.value);
                    count++;
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async markNotificationAsRead(notificationId) {
        const store = await this.getStore('notifications', 'readwrite');
        
        return new Promise(async (resolve, reject) => {
            const notification = await this.getNotification(notificationId);
            if (notification) {
                notification.read = true;
                const updateRequest = store.put(notification);
                updateRequest.onsuccess = () => resolve(notification);
                updateRequest.onerror = (event) => reject(event.target.error);
            } else {
                reject(new Error('الإشعار غير موجود'));
            }
        });
    }

    // ====== السجلات (Logs) ======
    async addLog(logData) {
        const store = await this.getStore('logs', 'readwrite');
        
        logData.id = Date.now() + Math.random().toString(36).substr(2, 9);
        
        return new Promise((resolve, reject) => {
            const request = store.add(logData);
            request.onsuccess = () => resolve(logData);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getLogs(filters = {}, limit = 100) {
        const store = await this.getStore('logs');
        return new Promise((resolve, reject) => {
            const request = store.index('timestamp_idx').openCursor(null, 'prev');
            const results = [];
            let count = 0;
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && count < limit) {
                    const log = cursor.value;
                    
                    // تطبيق الفلاتر
                    let passesFilter = true;
                    if (filters.action && log.action !== filters.action) passesFilter = false;
                    if (filters.userId && log.userId !== filters.userId) passesFilter = false;
                    if (filters.dateFrom && new Date(log.timestamp) < new Date(filters.dateFrom)) passesFilter = false;
                    if (filters.dateTo && new Date(log.timestamp) > new Date(filters.dateTo)) passesFilter = false;
                    
                    if (passesFilter) {
                        results.push(log);
                        count++;
                    }
                    
                    if (count < limit) {
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                } else {
                    resolve(results);
                }
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    // ====== النسخ الاحتياطي ======
    async createBackup() {
        const store = await this.getStore('backups', 'readwrite');
        
        const backupData = {
            id: Date.now(),
            date: new Date().toISOString(),
            requests: await this.getAllRequests({}, 1, 1000000),
            users: await this.getAllUsers({}, 1, 1000000),
            admins: await this.getAllAdmins(),
            statistics: await this.getStatistics(),
            size: await this.getDatabaseSize()
        };
        
        return new Promise((resolve, reject) => {
            const request = store.add(backupData);
            request.onsuccess = () => resolve(backupData);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getDatabaseSize() {
        return new Promise((resolve, reject) => {
            if (!navigator.storage) {
                resolve('غير معروف');
                return;
            }
            
            navigator.storage.estimate().then((estimate) => {
                const used = (estimate.usage / (1024 * 1024)).toFixed(2);
                const quota = (estimate.quota / (1024 * 1024)).toFixed(2);
                resolve(`${used} MB / ${quota} MB`);
            }).catch(() => resolve('غير معروف'));
        });
    }

    // ====== أدوات مساعدة ======
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    async clearDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(this.dbName);
            
            request.onsuccess = () => {
                console.log('🗑️ تم حذف قاعدة البيانات');
                this.db = null;
                resolve(true);
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async exportToJSON() {
        return {
            requests: await this.getAllRequests({}, 1, 1000000),
            users: await this.getAllUsers({}, 1, 1000000),
            admins: await this.getAllAdmins(),
            statistics: await this.getStatistics(),
            logs: await this.getLogs({}, 1000),
            exported_at: new Date().toISOString()
        };
    }

    async importFromJSON(data) {
        // استيراد الطلبات
        if (data.requests && data.requests.data) {
            for (const request of data.requests.data) {
                await this.addRequest(request);
            }
        }
        
        // استيراد المستخدمين
        if (data.users && data.users.data) {
            for (const user of data.users.data) {
                const store = await this.getStore('users', 'readwrite');
                await store.put(user);
            }
        }
        
        // استيراد المسؤولين
        if (data.admins) {
            for (const admin of data.admins) {
                const store = await this.getStore('admins', 'readwrite');
                await store.put(admin);
            }
        }
        
        return true;
    }
}

// إنشاء نسخة عامة من قاعدة البيانات
const KR_DB = new KRDATABASE();

// تصدير الكلاس للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KR_DB;
}
