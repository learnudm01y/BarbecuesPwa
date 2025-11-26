// Force Update Script - Add timestamp to bypass cache
(function() {
    const VERSION = '9.0.0';
    const STORAGE_KEY = 'app-version';
    
    // Check stored version
    const storedVersion = localStorage.getItem(STORAGE_KEY);
    
    if (storedVersion !== VERSION) {
        console.log('New version detected, clearing cache...');
        
        // Clear localStorage except photos
        const photos = localStorage.getItem('captured-photos');
        const cart = localStorage.getItem('kabab-cart');
        localStorage.clear();
        if (photos) localStorage.setItem('captured-photos', photos);
        if (cart) localStorage.setItem('kabab-cart', cart);
        
        // Clear all caches
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        
        // Unregister all service workers
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => {
                    registration.unregister();
                });
            });
        }
        
        // Update version
        localStorage.setItem(STORAGE_KEY, VERSION);
        
        // Force hard reload
        window.location.href = window.location.href + '?v=' + Date.now();
    }
})();
