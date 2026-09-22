import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import sihLogo from "../../assets/Kiran.png";
import { AuthVisualPanel } from "./AuthVisualPanel";
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Leaf,
  Users,
  ShoppingBasket,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const queryRole =
    new URLSearchParams(location.search).get("role") || location.state?.role;
  const initialRole = ["farmer", "fpo", "buyer"].includes(queryRole?.toLowerCase())
    ? queryRole.toLowerCase()
    : "farmer";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: initialRole,
  });

  useEffect(() => {
    const roleParam =
      new URLSearchParams(location.search).get("role") || location.state?.role;
    if (roleParam && ["farmer", "fpo", "buyer"].includes(roleParam.toLowerCase())) {
      setFormData((prev) => ({ ...prev, role: roleParam.toLowerCase() }));
    }
  }, [location.search, location.state]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({
      ...prev,
      role: selectedRole,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/register", formData);

      if (response && response.token && response.user) {
        login(response.user, response.token);

        if (response.user.role === "buyer") {
          navigate("/buyer/dashboard", { replace: true });
        } else if (response.user.role === "fpo") {
          navigate("/fpo/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        navigate("/login", { state: { registered: true } });
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: "farmer",
      title: "Farmer",
      subtitle: "Sell Produce & Discover Prices",
      icon: Leaf,
      activeColor: "border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20",
    },
    {
      id: "fpo",
      title: "FPO",
      subtitle: "Aggregate Collective Supply",
      icon: Users,
      activeColor: "border-teal-600 bg-teal-50/80 text-teal-900 ring-2 ring-teal-500/20",
    },
    {
      id: "buyer",
      title: "Buyer",
      subtitle: "Procure Directly from Source",
      icon: ShoppingBasket,
      activeColor: "border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative z-10">
        {/* Left Column: Rotating Agricultural Visual Carousel */}
        <div className="lg:col-span-5 hidden lg:flex flex-col min-h-[660px]">
          <AuthVisualPanel className="h-full flex flex-col justify-between" />
        </div>

        {/* Right Column: Clean Authentication Form Card */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <Card className="p-6 sm:p-10 bg-white border border-gray-200/90 shadow-sm rounded-3xl relative">
            {/* Top Bar: Back to KIRAN Navigation + Instant Access Badge */}
            <div className="flex items-center justify-between pb-5 mb-5 border-b border-gray-100">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-700 transition-colors group"
              >
                <ArrowLeft
                  size={14}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
                <span>Back to KIRAN</span>
              </Link>

              <Badge variant="emerald" dot size="sm">
                Instant Access
              </Badge>
            </div>

            {/* Brand Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-1 flex items-center justify-center shadow-2xs shrink-0">
                <img
                  src={sihLogo}
                  alt="KIRAN Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                  Join KIRAN Network
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Create your account to start trading on the digital agricultural exchange.
                </p>
              </div>
            </div>

            {/* Mobile Visual Carousel Banner (< lg screens) */}
            <div className="lg:hidden mb-5">
              <AuthVisualPanel className="h-44 sm:h-52 w-full" />
            </div>

            {/* Error Feedback Notice */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200/80 text-red-800 text-xs sm:text-sm flex items-start gap-2.5 shadow-2xs animate-shake">
                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection Cards */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Select Your Platform Role *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {roles.map((r) => {
                    const isSelected = formData.role === r.id;
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleSelect(r.id)}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? r.activeColor
                            : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Icon size={18} className={isSelected ? "text-emerald-700" : "text-gray-400"} />
                          {isSelected && (
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <div>
                          <span className="font-extrabold text-xs block">
                            {r.title}
                          </span>
                          <span className="text-[10px] text-gray-500 leading-tight block mt-0.5">
                            {r.subtitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Full Name / Organization *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Ramesh Kumar or Fresh Agro Ltd"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              {/* Email Address Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. ramesh@kiran.in"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              {/* Password Input with Visibility Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Create Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-11 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full mt-2 font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs hover:shadow transition-all"
                icon={ArrowRight}
              >
                Complete Registration
              </Button>
            </form>

            {/* Bottom Link to Login */}
            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                Already registered on KIRAN?{" "}
                <Link
                  to="/login"
                  className="text-emerald-700 font-bold hover:text-emerald-900 hover:underline transition-colors"
                >
                  Sign In instead
                </Link>
              </p>
            </div>

            {/* Trust Context Tag */}
            <div className="mt-5 pt-3 border-t border-gray-100/60 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium text-center">
              <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
              <span>
                Empowering Farmers • FPO Collectives • Institutional Buyers
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Register;
