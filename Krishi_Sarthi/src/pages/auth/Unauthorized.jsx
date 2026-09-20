import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function Unauthorized() {
  const { user } = useContext(AuthContext);

  const getDashboardPath = () => {
    if (user?.role === "buyer") return "/buyer/dashboard";
    if (user?.role === "fpo") return "/fpo/dashboard";
    return "/";
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center border-gray-200 shadow-xl rounded-2xl">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Access Restricted</h1>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          You do not have permission to view this section of the platform with your current account role (
          <span className="font-semibold text-gray-900 capitalize">{user?.role || "Guest"}</span>).
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link to={getDashboardPath()}>
            <Button variant="primary" className="w-full font-semibold" icon={ArrowLeft}>
              Return to Your Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default Unauthorized;
