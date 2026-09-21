import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api";
import sihLogo from "../../assets/Kiran.png";
import AuthImageCarousel from "../../components/auth/AuthImageCarousel";
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Wheat,
  Users,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";

export function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "farmer",
  });

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

  const handleRoleSelect = (roleValue) => {
    setFormData((prev) => ({
      ...prev,
      role: roleValue,
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
      setError(err.message || "Registration failed. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      id: "farmer",
      title: "Farmer",
      subtitle: "Sell & manage produce",
      icon: Wheat,
    },
    {
      id: "fpo",
      title: "FPO Cluster",
      subtitle: "Aggregate & trade collectively",
      icon: Users,
    },
    {
      id: "buyer",
      title: "Institutional Buyer",
      subtitle: "Source agricultural produce",
      icon: Building2,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-stone-900 font-sans antialiased flex items-center justify-center p-3 sm:p-6 lg:p-8 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Centered Modal / Auth Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl sm:rounded-[28px] border border-stone-200/85 shadow-2xl shadow-stone-900/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12 p-3 sm:p-3.5 lg:p-4 gap-4 lg:gap-6">
        
        {/* Left Image Panel (~40% width on desktop) */}
        <div className="lg:col-span-5 w-full h-[340px] sm:h-[400px] lg:h-full min-h-[360px] lg:min-h-[660px]">
          <AuthImageCarousel />
        </div>

        {/* Right Form Card (~60% width on desktop) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-4 sm:p-7 lg:p-9">
          
          {/* Top Row: Back to KIRAN & Secure Platform Badge */}
          <div className="flex items-center justify-between pb-5 sm:pb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md py-1 px-1.5 -ml-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to KIRAN</span>
            </Link>

            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-50 border border-stone-200/80 px-2.5 py-1 rounded-full shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Secure Platform</span>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="w-full max-w-[440px] mx-auto my-auto py-1">
            
            {/* Brand Header */}
            <div className="text-left space-y-1.5 mb-5">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-1.5 flex items-center justify-center shadow-xs">
                <img src={sihLogo} alt="KIRAN Logo" className="h-full w-full object-contain" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Create Your Account
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-normal">
                Join KIRAN for direct farm-to-market trading.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200/90 text-left flex items-start gap-2.5 text-xs sm:text-sm text-red-700 shadow-2xs animate-fade-in">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              {/* Full Name / Organization */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-stone-700">
                  Full Name / Organization <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                    <User size={17} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. Ramesh Kumar or Kisan Agro"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-stone-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-stone-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                    <Mail size={17} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="e.g. ramesh@kiran.in"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-stone-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Create Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-stone-700">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                    <Lock size={17} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-stone-300 bg-white pl-10 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Platform Role Selection - 3 Selectable Cards */}
              <div className="space-y-1.5 pt-0.5">
                <label className="block text-xs sm:text-sm font-medium text-stone-700">
                  Select Platform Role <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {roleOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = formData.role === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleRoleSelect(option.id)}
                        className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between select-none focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/90 shadow-2xs ring-1 ring-emerald-600"
                            : "border-stone-200/90 bg-white hover:border-stone-300 hover:bg-stone-50/60"
                        }`}
                      >
                        <div
                          className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mb-1.5 transition-colors ${
                            isSelected
                              ? "bg-[#047857] text-white"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          <Icon size={15} />
                        </div>
                        <div>
                          <span
                            className={`text-xs font-bold block ${
                              isSelected ? "text-emerald-950" : "text-stone-900"
                            }`}
                          >
                            {option.title}
                          </span>
                          <span className="text-[10px] text-stone-500 leading-tight block mt-0.5 line-clamp-2">
                            {option.subtitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#047857] hover:bg-[#065F46] active:bg-[#064E3B] text-white font-semibold py-2.5 sm:py-3 px-4 rounded-xl text-sm transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create KIRAN Account</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="pt-3 text-center">
              <p className="text-xs sm:text-sm text-stone-600">
                Already have an account on KIRAN?{" "}
                <Link
                  to="/login"
                  className="text-emerald-700 font-semibold hover:text-emerald-800 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Card Bottom Footer */}
          <div className="mt-6 pt-4 border-t border-stone-200/70 text-center">
            <p className="text-[11px] sm:text-xs text-stone-500 font-medium flex items-center justify-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Empowering Farmers • FPO Collectives • Institutional Buyers</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
