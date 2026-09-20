import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { LoadingState } from "../../components/ui/LoadingState";
import { User, Phone, MapPin, Building, CheckCircle2, AlertCircle, Save } from "lucide-react";

export function Profile() {
  const { user, updateUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    village: "",
    district: "",
    state: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.get("/api/farmer/profile");
        if (data?.profile) {
          setFormData({
            name: data.profile.name || user?.name || "",
            email: data.profile.email || user?.email || "",
            phone: data.profile.phone || "",
            village: data.profile.village || "",
            district: data.profile.district || "",
            state: data.profile.state || "",
          });
        }
      } catch (err) {
        setErrorMessage(err.message || "Unable to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (successMessage) setSuccessMessage("");
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await api.put("/api/farmer/profile", {
        name: formData.name,
        phone: formData.phone,
        village: formData.village,
        district: formData.district,
        state: formData.state,
      });

      setSuccessMessage(response.message || "Profile updated successfully!");
      if (formData.name && formData.name !== user?.name) {
        updateUser({ name: formData.name });
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingState message="Loading your farmer profile..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Farmer Profile & Farmgate Location
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Keep your registered details and primary mandi district up to date for precise market matching.
          </p>
        </div>
        <Badge variant="emerald" dot>
          Active Verified Farmer
        </Badge>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3 text-sm text-emerald-800 animate-fadeIn">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200/80 flex items-center gap-3 text-sm text-red-700 animate-fadeIn">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Card className="p-6 sm:p-8 border-gray-200/90 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-gray-100 pb-5">
            <h2 className="text-base font-bold text-gray-900">Personal & Account Information</h2>
            <p className="text-xs text-gray-500 mt-0.5">Basic identity credentials registered with KIRAN.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Input
                label="Full Name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                icon={User}
              />

              <Input
                label="Registered Email Address"
                name="email"
                type="email"
                disabled
                value={formData.email}
                helperText="Email is your platform identity and cannot be changed"
              />
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-900">Farmgate & Geographic Location</h2>
            <p className="text-xs text-gray-500 mt-0.5">Used for calculating transport distance and local mandi price benchmarks.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Input
                label="Primary Phone Number"
                name="phone"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
                icon={Phone}
              />

              <Input
                label="Village / Cluster Name"
                name="village"
                placeholder="e.g. Depalpur"
                value={formData.village}
                onChange={handleChange}
                icon={MapPin}
              />

              <Input
                label="District"
                name="district"
                placeholder="e.g. Indore"
                value={formData.district}
                onChange={handleChange}
                icon={Building}
              />

              <Input
                label="State"
                name="state"
                placeholder="e.g. Madhya Pradesh"
                value={formData.state}
                onChange={handleChange}
                icon={MapPin}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
              className="font-semibold shadow-xs"
              icon={Save}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Profile;
