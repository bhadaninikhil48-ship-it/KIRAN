import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import sihLogo from "../../assets/Kiran.png";
import { AuthVisualPanel } from "./AuthVisualPanel";
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if redirected from a completed registration
  const registrationSuccess = Boolean(location.state?.registered);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", formData);

      if (response && response.token && response.user) {
        login(response.user, response.token);

        // Redirect based on role or original intended location
        const from = location.state?.from?.pathname;
        if (from && !from.includes("/login") && !from.includes("/register")) {
          navigate(from, { replace: true });
        } else if (response.user.role === "buyer") {
          navigate("/buyer/dashboard", { replace: true });
        } else if (response.user.role === "fpo") {
          navigate("/fpo/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative z-10">
        {/* Left Column: Rotating Agricultural Visual Carousel */}
        <div className="lg:col-span-5 hidden lg:flex flex-col min-h-[620px]">
          <AuthVisualPanel className="h-full flex flex-col justify-between" />
        </div>

        {/* Right Column: Clean Authentication Form Card */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <Card className="p-6 sm:p-10 bg-white border border-gray-200/90 shadow-sm rounded-3xl relative">
            {/* Top Bar: Back to KIRAN Navigation + Secure Badge */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
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
                Secure Platform
              </Badge>
            </div>

            {/* Brand Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-1 flex items-center justify-center shadow-2xs shrink-0">
                <img
                  src={sihLogo}
                  alt="KIRAN Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Sign in to access your KIRAN agricultural exchange dashboard.
                </p>
              </div>
            </div>

            {/* Mobile Visual Carousel Banner (< lg screens) */}
            <div className="lg:hidden mb-6">
              <AuthVisualPanel className="h-44 sm:h-52 w-full" />
            </div>

            {/* Optional Registration Success Notice */}
            {registrationSuccess && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5 shadow-2xs">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Registration completed successfully! Please sign in with your credentials.
                </span>
              </div>
            )}

            {/* Error Feedback Notice */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200/80 text-red-800 text-xs sm:text-sm flex items-start gap-2.5 shadow-2xs animate-shake">
                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. farmer@kiran.in"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="••••••••"
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

              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full mt-2 font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs hover:shadow transition-all"
                icon={ArrowRight}
              >
                Sign In to KIRAN
              </Button>
            </form>

            {/* Bottom Link to Register */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                Don't have an account on KIRAN?{" "}
                <Link
                  to="/register"
                  className="text-emerald-700 font-bold hover:text-emerald-900 hover:underline transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* Trust Context Tag */}
            <div className="mt-6 pt-4 border-t border-gray-100/60 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium text-center">
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

export default Login;
