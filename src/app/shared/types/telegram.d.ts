export {};

declare global {
  interface Window {
    Telegram: {
      WebApp: Telegram.WebApp;
    };
  }
}