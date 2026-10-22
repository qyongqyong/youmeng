import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { removeToast, type Toast } from '../features/ui/uiSlice';

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 3200);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return <div className={`toast ${toast.type}`}>{toast.text}</div>;
}

export default function ToastContainer() {
  const toasts = useAppSelector((state) => state.ui.toasts);

  return (
    <div className="toast-wrap">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
