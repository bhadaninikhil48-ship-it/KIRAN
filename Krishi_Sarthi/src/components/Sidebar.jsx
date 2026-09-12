import { useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingBasket,
  Store,
  Users,
  FileText,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  X,
  Sprout,
  Headphones,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/sell", label: "Sell Produce", icon: ShoppingBasket },
  { to: "/markets", label: "Market Intelligence", icon: Store },
  { to: "/opportunities", label: "Best Opportunities", icon: TrendingUp },
  { to: "/buyers", label: "Find Buyers", icon: Users },
  { to: "/offers", label: "My Offers", icon: FileText },
  { to: "/transactions", label: "Transactions", icon: ReceiptText },
  { to: "/support", label: "Trust & Support", icon: ShieldCheck },
];

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  }, [location.pathname, isOpen, onClose]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 lg:w-64 bg-white border-r border-gray-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sprout size={20} />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
                KIRAN
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 tracking-wide">
                  SIH
                </span>
              </span>
              <p className="text-[11px] text-gray-500 font-medium">
                Agri-Market Intelligence
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Platform Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 shadow-2xs font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      className={
                        isActive
                          ? "text-emerald-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }
                    />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-4 rounded-full bg-emerald-600" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Support Widget */}
        <div className="p-3 border-t border-gray-100">
          <div className="bg-gradient-to-br from-emerald-50 to-gray-50 rounded-xl p-3 border border-emerald-100/80">
            <div className="flex items-center gap-2 mb-1 text-emerald-800 font-semibold text-xs">
              <Headphones size={15} />
              <span>Kisan Helpdesk 24x7</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-tight mb-2">
              Toll-free price dispute & mandi advisory
            </p>
            <a
              href="tel:18001801551"
              className="inline-block text-xs font-semibold text-emerald-700 hover:underline"
            >
              📞 1800-180-1551
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;