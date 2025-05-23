interface PopupProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Popup({
  title,
  message,
  onConfirm,
  onCancel,
}: PopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-xl font-medium text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-700 mb-8">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-medium uppercase tracking-wide text-sm transition-colors"
          >
            YES DELETE
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 font-medium uppercase tracking-wide text-sm transition-colors"
          >
            NO TAKE ME BACK
          </button>
        </div>
      </div>
    </div>
  );
}
