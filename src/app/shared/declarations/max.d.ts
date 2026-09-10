type MaxInitDataUser = {
  query_id: string;
  ip?: string;
  auth_date: number;
  hash: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    language_code: string;
    photo_url: string;
  };
  chat: {
    id: number;
    type: 'DIALOG' | 'CHAT' | 'CHANNEL';
  };
  start_param: string;
};

type MaxInitDataUnsafe = {
  user?: MaxInitDataUser;

  chat?: {
    id: number;
    type: 'DIALOG' | 'CHAT' | 'CHANNEL';
  };

  start_param?: string;
};

type MaxWebApp = {
  platform: 'ios' | 'android' | 'desktop' | 'web';

  version: string;

  deviceName: string;

  initData: string;

  initDataUnsafe?: MaxInitDataUnsafe;

  ScreenCapture: {
    enableScreenCapture(): Promise<{
      isScreenCaptureEnabled: boolean;
    }>;

    disableScreenCapture(): Promise<{
      isScreenCaptureEnabled: boolean;
    }>;
  };

  getLaunchContext(): Promise<{
    entryPoint: 'tabbar' | 'default';
  }>;

  requestScreenMaxBrightness(): Promise<{
    maxBrightness: boolean;
  }>;

  restoreScreenBrightness(): Promise<{
    maxBrightness: boolean;
  }>;

  getViewportSize(): Promise<{
    height: string;
    width: string;
  }>;

  requestContact(): Promise<{
    phone: string;
    authDate: string;
    hash: string;
  }>;

  openLink(url: string): void;

  openMaxLink(url: string): void;

  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };

  DeviceStorage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
  };

  HapticFeedback: {
    impactOccurred(style: 'soft' | 'light' | 'medium' | 'heavy' | 'rigid'): void;

    notificationOccurred(type: 'error' | 'success' | 'warning'): void;

    selectionChanged(): void;
  };
};

declare global {
  interface Window {
    WebApp?: MaxWebApp;
  }
}

export {};
