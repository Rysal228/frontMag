export type OneCConnectionStatus = {
  code: string;
  message: string;
  details: {
    status: number;
    response: unknown;
  } | null;
};
