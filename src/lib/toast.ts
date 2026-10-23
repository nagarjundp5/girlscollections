type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  productImage?: string;
  productName?: string;
}

type ToastSubscriber = (toasts: ToastMessage[]) => void;

let subscribers: ToastSubscriber[] = [];
let toasts: ToastMessage[] = [];

const notify = () => {
  subscribers.forEach((sub) => sub([...toasts]));
};

export const toast = {
  subscribe: (sub: ToastSubscriber) => {
    subscribers.push(sub);
    sub([...toasts]);
    return () => {
      subscribers = subscribers.filter((s) => s !== sub);
    };
  },
  show: (message: string, type: ToastType = 'success', extra?: { productImage?: string; productName?: string }) => {
    const id = Math.random().toString(36).substring(2, 9);
    toasts = [...toasts, { id, message, type, ...extra }];
    notify();
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      notify();
    }, 2500); // 2.5 second auto-dismiss
  },
  success: (message: string) => toast.show(message, 'success'),
  error: (message: string) => toast.show(message, 'error'),
  info: (message: string) => toast.show(message, 'info'),
  cartSuccess: (productName: string, productImage: string) =>
    toast.show(`Added ${productName} to bag`, 'success', { productName, productImage }),
};
