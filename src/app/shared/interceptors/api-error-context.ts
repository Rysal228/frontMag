import { HttpContextToken } from '@angular/common/http';

export const SKIP_API_ERROR_ALERT = new HttpContextToken<boolean>(() => false);
