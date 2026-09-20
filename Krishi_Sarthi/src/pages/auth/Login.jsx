import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import sihLogo from "../../assets/Kiran.png";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 shadow-xl mb-4">
            <img src={sihLogo} alt="KIRAN Logo" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome to KIRAN
          </h1>
          <p className="text-sm text-emerald-200/80 mt-1">
            Farmer Market Linkage & Price Discovery Platform
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Sign In</h2>
            <Badge variant="emerald" dot>
              Secure Auth
            </Badge>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-xs sm:text-sm text-red-700 animate-shake">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              placeholder="e.g. farmer@kiran.in"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2 font-semibold shadow-md"
              icon={ArrowRight}
            >
              Sign In to Platform
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-emerald-700 font-semibold hover:text-emerald-800 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Login;
