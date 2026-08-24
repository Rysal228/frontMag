interface MaxWebApp {
  platform: 'ios' | 'android' | 'desktop' | 'web';
  version: string;
  deviceName: string;
  initData: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name: string;
      username: string;
      language_code: string;
      photo_url: string;
    };
    chat?: {
      id: number;
      type: 'DIALOG' | 'CHAT' | 'CHANNEL';
    };
    start_param?: string;
  };
  [key: string]: any;
  ScreenCapture: {
    enableScreenCapture(): Promise<{ isScreenCaptureEnabled: boolean }>;
    disableScreenCapture(): Promise<{ isScreenCaptureEnabled: boolean }>;
  };
  getLaunchContext(): Promise<{
    entryPoint: 'tabbar' | 'default';
  }>;
  requestScreenMaxBrightness(): Promise<{ maxBrightness: boolean }>;
  restoreScreenBrightness(): Promise<{ maxBrightness: boolean }>;
  getViewportSize(): Promise<{
    height: string,          
    width: string           
    }>
    requestContact(): Promise<{
      phone: string;
      authDate: string; // timestamp создания hash
      hash: string;
  }>
  openLink(url: string): void;
  openMaxLink(url: string): void;
}

interface Window {
  WebApp: MaxWebApp;
}
