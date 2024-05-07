import { type ToastSettings, type ToastStore } from "@skeletonlabs/skeleton";


const getSendToast = (toastStore: ToastStore) => {
    const sendToast = (type: 'success' | 'error', message: string) => {
        let toast: ToastSettings = {
            message,
            background: `variant-filled-${type}`,
            autohide: type === 'success'
        }
        toastStore.trigger(toast);
    }

    return sendToast;
}



export { getSendToast }