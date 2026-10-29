// Turns any backend / network error into a readable message
export function getErrorMessage(err: any, fallback = 'Something went wrong, please try again'): string {
    if (err?.status === 0) {
        return 'Cannot reach the server. Is the backend running on port 3000?';
    }
    return err?.error?.message || err?.error?.error || err?.message || fallback;
}
