import { useState, useEffect, useRef, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Menu,
  CheckCircle2,
  AlertCircle,
  Truck,
  TrendingUp,
  MapPin,
  LogOut,
  User,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import { isReducedMotion } from "../utils/animations";
import { AuthContext } from "../context/AuthContext";
import { useAddresses } from "../context/AddressContext";
import { Avatar } from "./ui/Avatar";

const initialNotifications = [
  {
    id: 1,
    title: "Direct Buyer Match: FreshMart",
    desc: "FreshMart wants 800 kg Tomato at ₹2,520/q. Opportunity Score: 91/100.",
    time: "2m ago",
    type: "opportunity",
    unread: true,
  },
  {
    id: 2,
    title: "Payment Received Confirmed",
    desc: "₹20,160 settled in your linked SBI account for Consignment #KS-4091.",
    time: "45m ago",
    type: "payment",
    unread: true,
  },
  {
    id: 3,
    title: "Mandi Price Alert: Tomato +8%",
    desc: "Modal rate in Nashik APMC surged to ₹2,700/q due to increased south demand.",
    time: "2h ago",
    type: "market",
    unread: true,
  },
  {
    id: 4,
    title: "FPO Aggregation Dispatch",
    desc: "Shared logistics pickup confirmed for tomorrow 06:30 AM at Indore Center.",
    time: "5h ago",
    type: "logistics",
    unread: false,
  },
];

export function Navbar({ onMenuToggle }) {
  const { i18n } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const notifRef = useRef(null);
  const location = useLocation();

  // Page title mapping
  const getPageTitle = (path) => {
    switch (path) {
      case "/sell":
        return "Sell Produce";
      case "/markets":
        return "Market Intelligence";
      case "/opportunities":
      case "/best-opportunities":
        return "Best Selling Opportunities";
      case "/farmer/dashboard":
        return "Farmer Dashboard";
      case "/buyers":
        return "Find & Match Buyers";
      case "/offers":
        return "My Produce Offers";
      case "/transactions":
        return "Transaction Tracking";
      case "/support":
        return "Trust & Dispute Support";
      case "/farmer/profile":
        return "Farmer Profile";
      case "/buyer/dashboard":
        return "Buyer Dashboard";
      case "/buyer/requirements":
        return "Buyer Procurement Requirements";
      case "/buyer/offers":
        return "Incoming Farmer Offers";
      case "/buyer/contracts":
        return "Buyer Contracts";
      case "/fpo/dashboard":
        return "FPO Cluster Dashboard";
      case "/fpo/members":
        return "FPO Member Farmers";
      case "/fpo/lots":
        return "FPO Produce Aggregation & Lots";
      case "/fpo/marketplace":
        return "Buyer Procurement Demands";
      case "/fpo/offers":
        return "FPO Submitted Bids & Negotiations";
      case "/fpo/contracts":
        return "FPO Procurement Contracts";
      case "/fpo/profile":
        return "FPO Organization Profile";
      case "/profile":
        if (user?.role === "buyer") return "Buyer Profile";
        if (user?.role === "fpo") return "FPO Organization Profile";
        return "Farmer Profile";
      default:
        if (user?.role === "buyer") return "Buyer Dashboard";
        if (user?.role === "fpo") return "FPO Dashboard";
        return "Farmer Dashboard";
    }
  };

  // Close notifications on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      if (!isReducedMotion()) {
        const dropdown = notifRef.current?.querySelector(".notif-dropdown");
        if (dropdown) {
          gsap.fromTo(
            dropdown,
            { opacity: 0, y: -8, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
          );
        }
      }
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const {
    defaultAddress,
    selectedAddress,
    openAddressManager,
    openAddAddress,
  } = useAddresses();

  // Role configurations
  const role = user?.role || "farmer";

  // Address role labels
  const addressRoleConfig = {
    farmer: {
      tag: "Primary Farmgate",
      addLabel: "+ Add Primary Farmgate",
    },
    buyer: {
      tag: "Procurement Warehouse",
      addLabel: "+ Add Procurement Warehouse",
    },
    fpo: {
      tag: "Aggregation Hub",
      addLabel: "+ Add Aggregation Hub",
    },
  }[role] || {
    tag: "Primary Location",
    addLabel: "+ Add Primary Location",
  };

  // Profile link path (FPO -> /fpo/profile, Farmer/Buyer -> /profile)
  const profilePath = role === "fpo" ? "/fpo/profile" : "/profile";

  // FEATURE 1: Profile Location (strictly from profile district + state for all roles)
  const profileDistrict = (user?.district || "").trim();
  const profileState = (user?.state || "").trim();
  const hasProfileLocation = Boolean(profileDistrict && profileState);
  const profileLocationText = hasProfileLocation
    ? `${profileDistrict} • ${profileState}`
    : "Add Profile Details";

  // FEATURE 2: Saved Address / Primary Farmgate / Warehouse / Hub (strictly from Address Management)
  const activeAddress = selectedAddress || defaultAddress || null;
  const hasSavedAddress = Boolean(activeAddress);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/90 px-3 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Hamburger, Title, Live Mandi Feeds, and Role Address Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
              {getPageTitle(location.pathname)}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Mandi Feeds
            </span>

            {/* Address / Farmgate / Hub Trigger immediately beside Live Mandi Feeds */}
            <div className="flex items-center shrink-0">
              {hasSavedAddress ? (
                <button
                  type="button"
                  onClick={() => openAddressManager({ flowContext: "normal" })}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-gray-200 bg-gray-50/90 hover:bg-emerald-50/80 hover:border-emerald-300 transition-all text-left group cursor-pointer shadow-2xs max-w-[150px] sm:max-w-[220px] md:max-w-[280px]"
                  title={`${addressRoleConfig.tag} (Click to change or manage addresses)`}
                >
                  <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MapPin size={11} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 leading-none">
                      <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">
                        {addressRoleConfig.tag}
                      </span>
                      {Boolean(activeAddress.is_default) && (
                        <span className="hidden sm:inline-block text-[8px] sm:text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1 py-0.2 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs font-semibold text-gray-900 group-hover:text-emerald-800 truncate mt-0.5">
                      {activeAddress.village_locality || activeAddress.name || activeAddress.district}
                    </p>
                  </div>
                  <ChevronRight size={12} className="text-gray-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAddAddress({ flowContext: "normal" })}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/80 hover:border-emerald-500 transition-all text-left group cursor-pointer shadow-2xs"
                  title={`${addressRoleConfig.addLabel} for mandi rates & logistics`}
                >
                  <MapPin size={12} className="text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-800 group-hover:text-emerald-900 whitespace-nowrap">
                    {addressRoleConfig.addLabel}
                  </span>
                  <ChevronRight size={12} className="text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* Profile Location Row: Dynamic for all 3 roles, clickable to role-specific profile */}
          <Link
            to={profilePath}
            className="inline-flex items-center gap-1 text-[11px] text-gray-600 hover:text-emerald-700 font-medium group cursor-pointer truncate max-w-full mt-0.5"
            title={hasProfileLocation ? "Profile Location (Click to view/edit profile)" : "Add Profile Details"}
          >
            <MapPin size={12} className="text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="truncate">{profileLocationText}</span>
            <ChevronRight size={11} className="text-gray-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </div>
      </div>

      {/* Right Side: Language, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          aria-label="Select language"
          className="text-xs sm:text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="mr">मराठी</option>
        </select>
        {/* Notification Menu */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="relative p-2 text-gray-600 hover:text-emerald-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown (strictly inside viewport) */}
          {showNotifications && (
            <div className="notif-dropdown fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full mt-1 sm:mt-2 w-[calc(100vw-16px)] sm:w-96 max-w-sm bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-3.5 sm:p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-gray-50/80 transition-colors flex gap-3 text-left ${n.unread ? "bg-emerald-50/30" : ""
                      }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {n.type === "opportunity" && (
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <TrendingUp size={16} />
                        </div>
                      )}
                      {n.type === "payment" && (
                        <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                      {n.type === "market" && (
                        <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                          <AlertCircle size={16} />
                        </div>
                      )}
                      {n.type === "logistics" && (
                        <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                          <Truck size={16} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs sm:text-sm truncate ${n.unread
                              ? "font-semibold text-gray-900"
                              : "font-medium text-gray-700"
                            }`}
                        >
                          {n.title}
                        </p>
                        {n.unread && (
                          <span className="h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.desc}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {n.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-gray-50/80 border-t border-gray-100 text-center">
                <span className="text-[11px] text-gray-500">
                  KIRAN Realtime Intelligence Dispatcher
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Capsule */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:border-l sm:border-gray-200">
          <Link
            to="/profile"
            className="flex items-center gap-2 group cursor-pointer"
            title="Manage Profile & Photo"
          >
            <Avatar
              src={user?.avatar}
              name={user?.name || "User"}
              role={user?.role || "farmer"}
              size="md"
              ring
              className="group-hover:ring-emerald-500/50 transition-all"
            />

            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  {user?.name || "User"}
                </span>
              </div>
              <span className="text-[11px] text-gray-500 font-medium capitalize">
                {user?.role === "buyer"
                  ? "Verified Buyer"
                  : user?.role === "fpo"
                  ? "FPO Coordinator"
                  : "Registered Farmer"}
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/");
            }}
            title="Sign Out"
            aria-label="Sign Out"
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;