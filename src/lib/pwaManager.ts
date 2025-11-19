/**
 * PWA Manager - Handles Progressive Web App functionality
 * Including service worker registration, push notifications, and offline capabilities
 */

interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.initializePWA();
    this.setupEventListeners();
  }

  private async initializePWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          updateViaCache: 'none' // Always check for updates
        });
        console.log('✅ Service Worker registered successfully');
        
        // Check for updates every 60 seconds
        setInterval(() => {
          this.swRegistration?.update();
        }, 60000);
        
        // Listen for service worker updates
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New version available, reloading...');
                // Auto-reload after a short delay to ensure clean transition
                setTimeout(() => window.location.reload(), 1000);
              }
            });
          }
        });
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }

    // Request notification permission
    await this.requestNotificationPermission();
  }

  private setupEventListeners() {
    // Install prompt handling
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as PWAInstallPrompt;
      console.log('📱 PWA install prompt available');
    });

    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online - syncing consciousness data');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Offline mode - consciousness data will be cached locally');
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      console.log('🎉 PWA installed successfully');
      this.deferredPrompt = null;
    });
  }

  private handleServiceWorkerUpdate() {
    // Show update notification or banner
    const updateBanner = document.createElement('div');
    updateBanner.innerHTML = `
      <div class="fixed top-4 right-4 z-50 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
        <p class="mb-2">New version available!</p>
        <button onclick="window.location.reload()" class="bg-white/20 px-3 py-1 rounded text-sm hover:bg-white/30">
          Update Now
        </button>
      </div>
    `;
    document.body.appendChild(updateBanner);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (updateBanner.parentNode) {
        updateBanner.parentNode.removeChild(updateBanner);
      }
    }, 10000);
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('No install prompt available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted PWA install');
        return true;
      } else {
        console.log('❌ User declined PWA install');
        return false;
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  isInstallable(): boolean {
    return this.deferredPrompt !== null;
  }

  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.swRegistration || !(await this.requestNotificationPermission())) {
      console.log('Notifications not available');
      return false;
    }

    try {
      await this.swRegistration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/placeholder.svg',
        badge: payload.badge || '/placeholder.svg',
        data: payload.data || {},
        tag: 'consciousness-insight', // Prevents duplicate notifications
        ...(payload.actions && { actions: payload.actions })
      });

      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  async scheduleConsciousnessReminder(delayMinutes: number = 60): Promise<void> {
    if (!this.swRegistration) return;

    // Schedule background sync for consciousness reminder
    try {
      // @ts-ignore - sync API might not be available in all browsers
      await this.swRegistration.sync?.register('consciousness-reminder');
      console.log(`⏰ Consciousness reminder scheduled for ${delayMinutes} minutes`);
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    }
  }

  private async syncOfflineData(): Promise<void> {
    if (!this.swRegistration || !this.isOnline) return;

    try {
      // @ts-ignore - sync API might not be available in all browsers
      await this.swRegistration.sync?.register('consciousness-sync');
      console.log('🔄 Syncing offline consciousness data');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  async cacheConsciousnessData(key: string, data: any): Promise<void> {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open('consciousness-data-v1');
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(key, response);
      console.log(`💾 Cached consciousness data: ${key}`);
    } catch (error) {
      console.error('Failed to cache consciousness data:', error);
    }
  }

  async getCachedConsciousnessData(key: string): Promise<any | null> {
    if (!('caches' in window)) return null;

    try {
      const cache = await caches.open('consciousness-data-v1');
      const response = await cache.match(key);
      
      if (response) {
        const data = await response.json();
        console.log(`📖 Retrieved cached consciousness data: ${key}`);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to retrieve cached data:', error);
      return null;
    }
  }

  getConnectionStatus(): 'online' | 'offline' {
    return this.isOnline ? 'online' : 'offline';
  }

  async addToHomeScreen(): Promise<void> {
    const banner = document.createElement('div');
    banner.innerHTML = `
      <div class="fixed bottom-4 left-4 right-4 md:left-auto md:w-80 bg-card border border-primary/30 rounded-lg p-4 shadow-lg z-50">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-gradient-cosmic rounded-lg flex items-center justify-center">
            📱
          </div>
          <div>
            <h3 class="font-medium text-foreground">Install Pitchfork</h3>
            <p class="text-sm text-muted-foreground">Get the full consciousness experience</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button id="install-pwa" class="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
            Install
          </button>
          <button id="dismiss-install" class="px-4 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">
            Maybe Later
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Handle install click
    const installBtn = banner.querySelector('#install-pwa');
    installBtn?.addEventListener('click', async () => {
      const installed = await this.showInstallPrompt();
      if (installed || !this.isInstallable()) {
        document.body.removeChild(banner);
      }
    });

    // Handle dismiss click
    const dismissBtn = banner.querySelector('#dismiss-install');
    dismissBtn?.addEventListener('click', () => {
      document.body.removeChild(banner);
    });

    // Auto-dismiss after 15 seconds
    setTimeout(() => {
      if (banner.parentNode) {
        document.body.removeChild(banner);
      }
    }, 15000);
  }
}

// Create singleton instance
export const pwaManager = new PWAManager();