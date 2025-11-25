// Load Device Information
async function loadDeviceInfo() {
    const container = document.getElementById('deviceInfoContent');
    container.innerHTML = '<div class="loading"><p>جاري تحميل البيانات...</p></div>';

    try {
        const deviceInfo = await gatherDeviceInfo();
        displayDeviceInfo(deviceInfo);
    } catch (error) {
        container.innerHTML = '<div class="loading"><p>حدث خطأ في تحميل البيانات</p></div>';
        console.error('Error loading device info:', error);
    }
}

// Gather all device information
async function gatherDeviceInfo() {
    const info = {
        processor: await getProcessorInfo(),
        memory: await getMemoryInfo(),
        screen: getScreenInfo(),
        battery: await getBatteryInfo(),
        network: getNetworkInfo(),
        browser: getBrowserInfo(),
        system: getSystemInfo(),
        device: getDeviceInfo(),
        sensors: await getSensorsInfo(),
        storage: await getStorageInfo(),
        media: await getMediaInfo(),
        location: await getLocationInfo(),
        permissions: await getPermissionsInfo()
    };

    return info;
}

// Processor Information
async function getProcessorInfo() {
    const info = {
        cores: navigator.hardwareConcurrency || 'غير متاح',
        threads: navigator.hardwareConcurrency || 'غير متاح',
        architecture: navigator.platform || 'غير متاح',
        vendor: navigator.vendor || 'غير متاح'
    };

    // Try to get more detailed CPU info
    if ('deviceMemory' in navigator) {
        info.deviceMemory = navigator.deviceMemory + ' GB';
    }

    // Performance API for timing info
    if (window.performance && window.performance.memory) {
        info.jsHeapSizeLimit = formatBytes(performance.memory.jsHeapSizeLimit);
        info.totalJSHeapSize = formatBytes(performance.memory.totalJSHeapSize);
        info.usedJSHeapSize = formatBytes(performance.memory.usedJSHeapSize);
    }

    return info;
}

// Memory Information
async function getMemoryInfo() {
    const info = {};

    if ('deviceMemory' in navigator) {
        info.deviceMemory = navigator.deviceMemory + ' GB';
    } else {
        info.deviceMemory = 'غير متاح';
    }

    if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        info.quota = formatBytes(estimate.quota);
        info.usage = formatBytes(estimate.usage);
        info.available = formatBytes(estimate.quota - estimate.usage);
        info.usagePercentage = ((estimate.usage / estimate.quota) * 100).toFixed(2) + '%';
    }

    return info;
}

// Screen Information
function getScreenInfo() {
    return {
        width: screen.width + 'px',
        height: screen.height + 'px',
        availWidth: screen.availWidth + 'px',
        availHeight: screen.availHeight + 'px',
        colorDepth: screen.colorDepth + ' bits',
        pixelDepth: screen.pixelDepth + ' bits',
        orientation: screen.orientation ? screen.orientation.type : 'غير متاح',
        devicePixelRatio: window.devicePixelRatio || 1,
        innerWidth: window.innerWidth + 'px',
        innerHeight: window.innerHeight + 'px',
        touchSupport: 'ontouchstart' in window ? 'مدعوم' : 'غير مدعوم'
    };
}

// Battery Information
async function getBatteryInfo() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            return {
                level: (battery.level * 100).toFixed(0) + '%',
                charging: battery.charging ? 'نعم' : 'لا',
                chargingTime: battery.chargingTime === Infinity ? 'غير متصل بالشاحن' : formatTime(battery.chargingTime),
                dischargingTime: battery.dischargingTime === Infinity ? 'غير محدد' : formatTime(battery.dischargingTime),
                levelValue: battery.level
            };
        } catch (e) {
            return { error: 'غير متاح' };
        }
    }
    return { error: 'غير مدعوم' };
}

// Network Information
function getNetworkInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
        return {
            type: connection.effectiveType || 'غير متاح',
            downlink: connection.downlink ? connection.downlink + ' Mbps' : 'غير متاح',
            rtt: connection.rtt ? connection.rtt + ' ms' : 'غير متاح',
            saveData: connection.saveData ? 'مفعل' : 'غير مفعل',
            online: navigator.onLine ? 'متصل' : 'غير متصل'
        };
    }

    return {
        online: navigator.onLine ? 'متصل' : 'غير متصل',
        type: 'غير متاح'
    };
}

// Browser Information
function getBrowserInfo() {
    return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages ? navigator.languages.join(', ') : 'غير متاح',
        cookieEnabled: navigator.cookieEnabled ? 'مفعل' : 'معطل',
        doNotTrack: navigator.doNotTrack || 'غير محدد',
        maxTouchPoints: navigator.maxTouchPoints || 0,
        pdfViewerEnabled: navigator.pdfViewerEnabled ? 'مفعل' : 'معطل',
        webdriver: navigator.webdriver ? 'نعم' : 'لا'
    };
}

// System Information
function getSystemInfo() {
    return {
        platform: navigator.platform,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        product: navigator.product,
        productSub: navigator.productSub,
        vendor: navigator.vendor,
        vendorSub: navigator.vendorSub,
        oscpu: navigator.oscpu || 'غير متاح',
        buildID: navigator.buildID || 'غير متاح'
    };
}

// Device Information
function getDeviceInfo() {
    const info = {
        userAgent: navigator.userAgent
    };

    // Detect device type
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) {
        info.os = 'Android';
        const match = ua.match(/android\s([0-9.]*)/);
        info.osVersion = match ? match[1] : 'غير معروف';
    } else if (/iphone|ipad|ipod/.test(ua)) {
        info.os = 'iOS';
        const match = ua.match(/os\s([0-9_]*)/);
        info.osVersion = match ? match[1].replace(/_/g, '.') : 'غير معروف';
    } else if (/windows/.test(ua)) {
        info.os = 'Windows';
    } else if (/mac/.test(ua)) {
        info.os = 'macOS';
    } else if (/linux/.test(ua)) {
        info.os = 'Linux';
    } else {
        info.os = 'غير معروف';
    }

    // Device model detection (limited)
    if (/Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
        info.deviceType = 'هاتف محمول / تابلت';
    } else {
        info.deviceType = 'كمبيوتر';
    }

    return info;
}

// Sensors Information
async function getSensorsInfo() {
    const info = {
        accelerometer: 'غير متاح',
        gyroscope: 'غير متاح',
        magnetometer: 'غير متاح',
        orientation: 'غير متاح'
    };

    // Check for device motion
    if (window.DeviceMotionEvent) {
        info.accelerometer = 'مدعوم';
    }

    // Check for device orientation
    if (window.DeviceOrientationEvent) {
        info.gyroscope = 'مدعوم';
        info.orientation = 'مدعوم';
    }

    // Check for ambient light sensor
    if ('AmbientLightSensor' in window) {
        info.ambientLight = 'مدعوم';
    } else {
        info.ambientLight = 'غير مدعوم';
    }

    return info;
}

// Storage Information
async function getStorageInfo() {
    const info = {};

    if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        info.quota = formatBytes(estimate.quota);
        info.usage = formatBytes(estimate.usage);
        info.usageDetails = estimate.usageDetails || {};
    }

    // Check for different storage types
    info.localStorage = typeof localStorage !== 'undefined' ? 'مدعوم' : 'غير مدعوم';
    info.sessionStorage = typeof sessionStorage !== 'undefined' ? 'مدعوم' : 'غير مدعوم';
    info.indexedDB = typeof indexedDB !== 'undefined' ? 'مدعوم' : 'غير مدعوم';

    return info;
}

// Media Information
async function getMediaInfo() {
    const info = {
        audio: 'غير متاح',
        video: 'غير متاح',
        microphone: 'غير متاح',
        camera: 'غير متاح'
    };

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(d => d.kind === 'audioinput');
            const videoInputs = devices.filter(d => d.kind === 'videoinput');
            const audioOutputs = devices.filter(d => d.kind === 'audiooutput');

            info.microphone = audioInputs.length > 0 ? `${audioInputs.length} ميكروفون` : 'غير متاح';
            info.camera = videoInputs.length > 0 ? `${videoInputs.length} كاميرا` : 'غير متاح';
            info.speakers = audioOutputs.length > 0 ? `${audioOutputs.length} سماعة` : 'غير متاح';
        } catch (e) {
            console.log('Media devices error:', e);
        }
    }

    return info;
}

// Location Information
async function getLocationInfo() {
    const info = {
        permission: 'غير محدد',
        supported: 'geolocation' in navigator ? 'مدعوم' : 'غير مدعوم'
    };

    if ('permissions' in navigator) {
        try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            info.permission = result.state === 'granted' ? 'ممنوح' : 
                            result.state === 'denied' ? 'مرفوض' : 'غير محدد';
        } catch (e) {
            info.permission = 'غير متاح';
        }
    }

    return info;
}

// Permissions Information
async function getPermissionsInfo() {
    const permissions = {
        notifications: 'غير محدد',
        camera: 'غير محدد',
        microphone: 'غير محدد',
        geolocation: 'غير محدد'
    };

    if ('permissions' in navigator) {
        const permissionNames = ['notifications', 'camera', 'microphone', 'geolocation'];
        
        for (const name of permissionNames) {
            try {
                const result = await navigator.permissions.query({ name });
                permissions[name] = result.state === 'granted' ? 'ممنوح' : 
                                  result.state === 'denied' ? 'مرفوض' : 'غير محدد';
            } catch (e) {
                permissions[name] = 'غير متاح';
            }
        }
    }

    return permissions;
}

// Display Device Information
function displayDeviceInfo(info) {
    const container = document.getElementById('deviceInfoContent');
    let html = '';

    // Processor Section
    html += createSection('معلومات المعالج', info.processor, [
        { label: 'عدد الأنوية (Cores)', value: info.processor.cores, highlight: true },
        { label: 'عدد الخيوط (Threads)', value: info.processor.threads, highlight: true },
        { label: 'البنية المعمارية', value: info.processor.architecture },
        { label: 'المصنع', value: info.processor.vendor },
        { label: 'ذاكرة الجهاز', value: info.processor.deviceMemory || 'غير متاح' },
        { label: 'حد الـ JS Heap', value: info.processor.jsHeapSizeLimit || 'غير متاح' },
        { label: 'إجمالي الـ JS Heap', value: info.processor.totalJSHeapSize || 'غير متاح' },
        { label: 'الـ JS Heap المستخدم', value: info.processor.usedJSHeapSize || 'غير متاح' }
    ]);

    // Memory Section
    html += createSection('معلومات الذاكرة', info.memory, [
        { label: 'ذاكرة الجهاز', value: info.memory.deviceMemory },
        { label: 'المساحة الكلية', value: info.memory.quota || 'غير متاح' },
        { label: 'المساحة المستخدمة', value: info.memory.usage || 'غير متاح' },
        { label: 'المساحة المتاحة', value: info.memory.available || 'غير متاح' },
        { label: 'نسبة الاستخدام', value: info.memory.usagePercentage || 'غير متاح', highlight: true }
    ]);

    // Screen Section
    html += createSection('معلومات الشاشة', info.screen, [
        { label: 'العرض', value: info.screen.width },
        { label: 'الارتفاع', value: info.screen.height },
        { label: 'العرض المتاح', value: info.screen.availWidth },
        { label: 'الارتفاع المتاح', value: info.screen.availHeight },
        { label: 'عمق الألوان', value: info.screen.colorDepth },
        { label: 'عمق البكسل', value: info.screen.pixelDepth },
        { label: 'Device Pixel Ratio', value: info.screen.devicePixelRatio, highlight: true },
        { label: 'الاتجاه', value: info.screen.orientation },
        { label: 'دعم اللمس', value: info.screen.touchSupport }
    ]);

    // Battery Section
    if (!info.battery.error) {
        html += `<div class="info-section">
            <h2>⚡ معلومات البطارية</h2>
            <div class="info-item">
                <span class="info-label">مستوى الشحن</span>
                <div class="battery-level info-value">
                    <div class="battery-bar">
                        <div class="battery-fill ${info.battery.charging === 'نعم' ? 'battery-charging' : ''}" 
                             style="width: ${info.battery.level}"></div>
                    </div>
                    <span class="highlight">${info.battery.level}</span>
                </div>
            </div>
            <div class="info-item">
                <span class="info-label">حالة الشحن</span>
                <span class="info-value">${info.battery.charging}</span>
            </div>
            <div class="info-item">
                <span class="info-label">وقت الشحن المتبقي</span>
                <span class="info-value">${info.battery.chargingTime}</span>
            </div>
            <div class="info-item">
                <span class="info-label">وقت التفريغ المتبقي</span>
                <span class="info-value">${info.battery.dischargingTime}</span>
            </div>
        </div>`;
    }

    // Network Section
    html += createSection('معلومات الشبكة', info.network, [
        { label: 'حالة الاتصال', value: info.network.online, highlight: true },
        { label: 'نوع الاتصال', value: info.network.type },
        { label: 'سرعة التحميل', value: info.network.downlink || 'غير متاح' },
        { label: 'زمن الاستجابة (RTT)', value: info.network.rtt || 'غير متاح' },
        { label: 'وضع توفير البيانات', value: info.network.saveData }
    ]);

    // Device Section
    html += createSection('معلومات الجهاز', info.device, [
        { label: 'نظام التشغيل', value: info.device.os, highlight: true },
        { label: 'إصدار النظام', value: info.device.osVersion || 'غير معروف' },
        { label: 'نوع الجهاز', value: info.device.deviceType }
    ]);

    // Sensors Section
    html += createSection('أجهزة الاستشعار', info.sensors, [
        { label: 'مقياس التسارع', value: info.sensors.accelerometer },
        { label: 'الجيروسكوب', value: info.sensors.gyroscope },
        { label: 'مقياس المغناطيسية', value: info.sensors.magnetometer },
        { label: 'الاتجاه', value: info.sensors.orientation },
        { label: 'مستشعر الإضاءة', value: info.sensors.ambientLight || 'غير متاح' }
    ]);

    // Media Section
    html += createSection('الوسائط المتعددة', info.media, [
        { label: 'الميكروفون', value: info.media.microphone },
        { label: 'الكاميرا', value: info.media.camera },
        { label: 'السماعات', value: info.media.speakers || 'غير متاح' }
    ]);

    // Permissions Section
    html += createSection('الصلاحيات', info.permissions, [
        { label: 'الإشعارات', value: info.permissions.notifications },
        { label: 'الكاميرا', value: info.permissions.camera },
        { label: 'الميكروفون', value: info.permissions.microphone },
        { label: 'الموقع', value: info.permissions.geolocation }
    ]);

    // Browser Section
    html += createSection('معلومات المتصفح', info.browser, [
        { label: 'اللغة', value: info.browser.language },
        { label: 'الكوكيز', value: info.browser.cookieEnabled },
        { label: 'عدد نقاط اللمس', value: info.browser.maxTouchPoints, highlight: true },
        { label: 'عارض PDF', value: info.browser.pdfViewerEnabled }
    ]);

    container.innerHTML = html;
}

// Helper function to create section
function createSection(title, data, items) {
    let html = `<div class="info-section"><h2>${title}</h2>`;
    
    items.forEach(item => {
        const value = item.highlight ? 
            `<span class="highlight">${item.value}</span>` : 
            item.value;
        
        html += `
            <div class="info-item">
                <span class="info-label">${item.label}</span>
                <span class="info-value">${value}</span>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// Helper Functions
function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatTime(seconds) {
    if (!seconds || seconds === Infinity) return 'غير محدد';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} ساعة و ${minutes} دقيقة`;
}

// Load on page load
document.addEventListener('DOMContentLoaded', loadDeviceInfo);