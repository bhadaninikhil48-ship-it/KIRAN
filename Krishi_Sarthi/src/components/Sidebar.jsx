import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import sihLogo from "../assets/Kiran.png";
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
  Headphones,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const farmerNavItems = [
  { to: "/", key: "Dashboard", label: "Farmer Dashboard", icon: LayoutDashboard },
  { to: "/sell", key: "Sell Produce", label: "Sell Produce", icon: ShoppingBasket },
  { to: "/markets", key: "Market Intelligence", label: "Market Intelligence", icon: Store },
  { to: "/opportunities", key: "Best Opportunities", label: "Best Opportunities", icon: TrendingUp },
  { to: "/buyers", key: "Find Buyers", label: "Find Buyers", icon: Users },
  { to: "/offers", key: "My Offers", label: "My Offers", icon: FileText },
  { to: "/transactions", key: "Transactions", label: "Transactions", icon: ReceiptText },
  { to: "/farmer/profile", key: "Profile", label: "Farmer Profile", icon: User },
  { to: "/support", key: "Trust & Support", label: "Trust & Support", icon: ShieldCheck },
];

const buyerNavItems = [
  { to: "/buyer/dashboard", key: "Dashboard", label: "Buyer Dashboard", icon: LayoutDashboard },
  { to: "/buyer/requirements", key: "Requirements", label: "Requirements", icon: ShoppingBasket },
  { to: "/buyer/offers", key: "Offers", label: "Received Offers", icon: FileText },
  { to: "/buyer/contracts", key: "Contracts", label: "Contracts", icon: ReceiptText },
  { to: "/markets", key: "Market Intelligence", label: "Market Prices", icon: Store },
  { to: "/support", key: "Trust & Support", label: "Trust & Support", icon: ShieldCheck },
];

const fpoNavItems = [
  { to: "/fpo/dashboard", key: "Dashboard", label: "FPO Dashboard", icon: LayoutDashboard },
  { to: "/markets", key: "Market Intelligence", label: "Market Prices", icon: Store },
  { to: "/support", key: "Trust & Support", label: "Trust & Support", icon: ShieldCheck },
];

export function Sidebar({
  isOpen,
  onClose,
  isCollapsed: controlledIsCollapsed,
  setIsCollapsed: controlledSetIsCollapsed,
}) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const location = useLocation();

  const navItems =
    user?.role === "buyer"
      ? buyerNavItems
      : user?.role === "fpo"
      ? fpoNavItems
      : farmerNavItems;

  const isCollapsed =
    controlledIsCollapsed !== undefined
      ? controlledIsCollapsed
      : internalIsCollapsed;

  const setIsCollapsed = (valueOrUpdater) => {
    if (controlledSetIsCollapsed) {
      controlledSetIsCollapsed(valueOrUpdater);
    } else {
      setInternalIsCollapsed(valueOrUpdater);
    }
  };

  // Close mobile drawer on route change
useEffect(() => {
  if (onClose) {
    onClose();
  }
}, [location.pathname]);

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
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-gray-200/90 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } ${isCollapsed ? "w-72 lg:w-20" : "w-72 lg:w-64"}`}
      >
        {/* Desktop Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:flex items-center justify-center absolute -right-4 top-4 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md text-gray-500 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-150 cursor-pointer z-50"
        >
          {isCollapsed ? (
            <ChevronRight size={16} className="text-gray-600" />
          ) : (
            <ChevronLeft size={16} className="text-gray-600" />
          )}
        </button>

        {/* Brand Header */}
        <div
          className={`h-16 border-b border-gray-100 flex items-center transition-all ${
            isCollapsed ? "lg:justify-center px-2" : "justify-between px-5"
          }`}
        >
          <div
            className={`flex items-center gap-2.5 ${
              isCollapsed ? "lg:justify-center" : ""
            }`}
          >
            <div
              className="h-9 w-9 rounded-xl  text-white flex items-center justify-center shadow-xs shrink-0"
              title={isCollapsed ? "KIRAN SIH" : undefined}
            >
              <span>
                 <img src={sihLogo} alt="sih-img"  className="h-12"/>
                </span>
            </div>
            <div className={isCollapsed ? "lg:hidden" : ""}>
              <span className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-1.5 whitespace-nowrap">
                KIRAN
              </span>
              <p className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                Agri-Market Intelligence
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav
          className={`flex-1 overflow-y-auto space-y-1 ${
            isCollapsed ? "px-2 py-4" : "px-3 py-4"
          }`}
        >
          <div
            className={`px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider ${
              isCollapsed ? "lg:hidden" : ""
            }`}
          >
            Platform Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                title={isCollapsed ? (t(`nav.${item.key}`) !== `nav.${item.key}` ? t(`nav.${item.key}`) : item.label) : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-xl text-sm font-medium transition-colors duration-150 ${
                    isCollapsed
                      ? "lg:justify-center lg:px-2 px-3 py-2.5 gap-3"
                      : "gap-3 px-3 py-2.5"
                  } ${
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
                      className={`shrink-0 ${
                        isActive
                          ? "text-emerald-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <span
                      className={`truncate ${isCollapsed ? "lg:hidden" : ""}`}
                    >
                      {t(`nav.${item.key}`) !== `nav.${item.key}` ? t(`nav.${item.key}`) : item.label}
                    </span>
                    {isActive && (
                      <span
                        className={`ml-auto w-1.5 h-4 rounded-full bg-emerald-600 ${
                          isCollapsed ? "lg:hidden" : ""
                        }`}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Support Widget */}
        <div className="p-3 border-t border-gray-100">
          {isCollapsed ? (
            <div className="hidden lg:flex justify-center">
              <a
                href="tel:18001801551"
                title="Kisan Helpdesk: 1800-180-1551"
                aria-label="Kisan Helpdesk"
                className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center hover:bg-emerald-100 transition-colors"
              >
                <Headphones size={18} />
              </a>
            </div>
          ) : null}

          <div
            className={`bg-gradient-to-br from-emerald-50 to-gray-50 rounded-xl p-3 border border-emerald-100/80 ${
              isCollapsed ? "lg:hidden" : ""
            }`}
          >
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