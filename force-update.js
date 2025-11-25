// Force Update Script - Add timestamp to bypass cache
(function() {
    const VERSION = '7.0.0';
    const STORAGE_KEY = 'app-version';
    
    // Check stored version
    const storedVersion = localStorage.getItem(STORAGE_KEY);
    
    if (storedVersion !== VERSION) {
        console.log('New version detected, clearing cache...');
        
        // Clear all caches
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        
        // Clear service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => {
                    registration.unregister();
                });
            });
        }
        
        // Update version
        localStorage.setItem(STORAGE_KEY, VERSION);
        
        // Force reload
        setTimeout(() => {
            window.location.reload(true);
        }, 500);
    }
})();
