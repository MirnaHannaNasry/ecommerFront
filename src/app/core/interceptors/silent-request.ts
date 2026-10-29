import { HttpContextToken } from '@angular/common/http';

// Put this on a request when the component shows its own error message,
// so the error interceptor must not redirect / alert.
export const SILENT_REQUEST = new HttpContextToken<boolean>(() => false);
