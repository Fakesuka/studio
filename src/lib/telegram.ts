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
  if (typeof window === 'undefined') return false;

  // Check localStorage flag OR hostname OR NODE_ENV
  return (
    localStorage.getItem('devMode') === 'true' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    process.env.NODE_ENV === 'development'
  );
};

// Mock Telegram user for development
const MOCK_TELEGRAM_USER = {
  id: 123456789,
  first_name: 'Dev',
  last_name: 'User',
  username: 'devuser',
  language_code: 'ru',
  is_premium: false,
  phone_number: '+79991234567',
};

const MOCK_INIT_DATA = 'query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Dev%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22devuser%22%2C%22language_code%22%3A%22ru%22%7D&auth_date=1640000000&hash=dev_mode_mock_hash';

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
  // Return mock in dev mode
  if (isDevMode()) {
    return {
      initData: MOCK_INIT_DATA,
      initDataUnsafe: {
        user: MOCK_TELEGRAM_USER,
      },
      ready: () => console.log('[Mock Telegram] ready()'),
      expand: () => console.log('[Mock Telegram] expand()'),
      close: () => console.log('[Mock Telegram] close()'),
      showAlert: (msg: string) => alert(msg),
      showConfirm: (msg: string, cb: (confirmed: boolean) => void) => cb(confirm(msg)),
    } as any;
  }
  return null;
};

export const getTelegramInitData = (): string | null => {
  // Return mock init data in dev mode when real Telegram is not available
  if (isDevMode() && !window.Telegram?.WebApp) {
    console.log('[Telegram] Using mock init data (dev mode)');
    return MOCK_INIT_DATA;
  }
  const webApp = getTelegramWebApp();
  return webApp?.initData || null;
};

export const getTelegramUser = () => {
  // Return mock user in dev mode when real Telegram is not available
  if (isDevMode() && !window.Telegram?.WebApp) {
    console.log('[Telegram] Using mock user data (dev mode):', MOCK_TELEGRAM_USER);
    return MOCK_TELEGRAM_USER;
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
  if (isDevMode() && !window.Telegram?.WebApp) {
    console.log('[Telegram] Using mock phone number (dev mode):', MOCK_TELEGRAM_USER.phone_number);
    return MOCK_TELEGRAM_USER.phone_number;
  }

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
