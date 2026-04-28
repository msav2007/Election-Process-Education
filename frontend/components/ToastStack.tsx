import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { ToastMessage } from "@/lib/types";

function toastTone(tone: ToastMessage["tone"]) {
  if (tone === "success") {
    return {
      icon: CheckCircle2,
      shell: "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]"
    };
  }
  if (tone === "error") {
    return {
      icon: AlertCircle,
      shell: "border-[#FED7AA] bg-[#FFF7ED] text-[#9A3412]"
    };
  }
  return {
    icon: Info,
    shell: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
  };
}

export function ToastStack({
  toasts,
  onDismiss
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => {
        const tone = toastTone(toast.tone);
        const Icon = tone.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg backdrop-blur transition duration-200 ease-out motion-safe:animate-[toast-in_180ms_ease-out] ${tone.shell}`}
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="mt-1 text-sm leading-6 opacity-90">{toast.description}</p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="rounded-full px-2 py-1 text-xs font-semibold opacity-80 transition hover:bg-white/50 hover:opacity-100"
              >
                Close
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
