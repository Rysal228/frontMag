export class SilentApiError extends Error {
  public constructor(public readonly originalError: unknown) {
    super('API error suppressed');
    this.name = 'SilentApiError';
  }
}
