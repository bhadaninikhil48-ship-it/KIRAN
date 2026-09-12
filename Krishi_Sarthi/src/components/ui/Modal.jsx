import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import gsap from "gsap";
import { isReducedMotion } from "../../utils/animations";

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-lg",
}) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    // GSAP entrance animation
    if (!isReducedMotion()) {
      if (overlayRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: "power2.out" }
        );
      }
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, scale: 0.95, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" }
        );
      }
    }

    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog Content */}
      <div
        ref={contentRef}
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-xl border border-gray-200 z-10 overflow-hidden my-auto`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
