declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: any;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: any;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        BackButton: {
          isVisible: boolean;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText(text: string): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
          enable(): void;
          disable(): void;
          showProgress(leaveActive?: boolean): void;
          hideProgress(): void;
          setParams(params: any): void;
        };
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
          selectionChanged(): void;
        };
        ready(): void;
        expand(): void;
        close(): void;
        enableClosingConfirmation(): void;
        disableClosingConfirmation(): void;
        onEvent(eventType: string, callback: () => void): void;
        offEvent(eventType: string, callback: () => void): void;
        sendData(data: string): void;
        openLink(url: string, options?: { try_instant_view?: boolean }): void;
        openTelegramLink(url: string): void;
        showPopup(params: any, callback?: (id: string) => void): void;
        showAlert(message: string, callback?: () => void): void;
        showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
        showScanQrPopup(params: any, callback?: (text: string) => boolean): void;
        closeScanQrPopup(): void;
        requestContact(callback?: (contactShared: boolean) => void): void;
      };
    };
  }
}

// Check if we're in development mode
export const isDevMode = (): boolean => {
  return typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1' ||
     process.env.NODE_ENV === 'development');
};

// Mock Telegram user for development
const mockTelegramUser = {
  id: 123456789,
  first_name: 'Тест',
  last_name: 'Водитель',
  username: 'test_driver',
  language_code: 'ru',
};

export const isTelegramWebApp = (): boolean => {
  // Allow access in dev mode
  if (isDevMode()) {
    return true;
  }
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
};

export const getTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const getTelegramInitData = (): string | null => {
  // Return mock init data in dev mode
  if (isDevMode() && !window.Telegram?.WebApp) {
    return 'dev_mode_test_data';
  }
  const webApp = getTelegramWebApp();
  return webApp?.initData || null;
};

export const getTelegramUser = () => {
  // Return mock user in dev mode
  if (isDevMode() && !window.Telegram?.WebApp) {
    return mockTelegramUser;
  }
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user || null;
};

export const initTelegramWebApp = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.ready();
    webApp.expand();
  }
};

export const closeTelegramWebApp = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.close();
  }
};

export const showTelegramAlert = (message: string) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.showAlert(message);
  } else {
    alert(message);
  }
};

export const showTelegramConfirm = (message: string, callback: (confirmed: boolean) => void) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.showConfirm(message, callback);
  } else {
    callback(confirm(message));
  }
};

export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => {
  const webApp = getTelegramWebApp();
  if (webApp?.HapticFeedback) {
    if (type === 'success' || type === 'error' || type === 'warning') {
      webApp.HapticFeedback.notificationOccurred(type);
    } else {
      webApp.HapticFeedback.impactOccurred(type);
    }
  }
};

// Enhanced phone number getter with logging
export const getTelegramPhoneNumber = (): string | null => {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    console.log('[Telegram] WebApp not available');
    return null;
  }

  const user = webApp.initDataUnsafe?.user;
  console.log('[Telegram] User data:', JSON.stringify(user, null, 2));

  const phone = user?.phone_number;
  console.log('[Telegram] Phone number from user:', phone);

  return phone || null;
};
