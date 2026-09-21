import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { LoadingState } from "../../components/ui/LoadingState";
import {
  User,
  Phone,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  Save,
  Camera,
  Trash2,
  Sparkles,
  Check,
} from "lucide-react";

const AVATAR_PRESETS = [
  {
    id: "farmer-traditional",
    label: "Kisan",
    role: "farmer",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23059669'/><circle cx='50' cy='42' r='18' fill='%23fcd34d'/><ellipse cx='50' cy='27' rx='20' ry='11' fill='%23ea580c'/><path d='M50 16c-12 0-20 6-20 11h40c0-5-8-11-20-11z' fill='%23c2410c'/><circle cx='50' cy='25' r='4' fill='%23fbbf24'/><circle cx='43' cy='40' r='2.5' fill='%231e293b'/><circle cx='57' cy='40' r='2.5' fill='%231e293b'/><path d='M43 47q7 5 14 0' stroke='%23b45309' stroke-width='2.5' stroke-linecap='round' fill='none'/><path d='M22 88c2-18 14-26 28-26s26 8 28 26z' fill='%23f8fafc'/><path d='M35 62l15 15 15-15' fill='%2310b981'/></svg>",
  },
  {
    id: "agri-tech",
    label: "Agripreneur",
    role: "farmer",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23047857'/><circle cx='50' cy='44' r='17' fill='%23fed7aa'/><path d='M32 34c2-9 9-14 18-14s16 5 18 14z' fill='%2315803d'/><path d='M30 33h40v4H30z' fill='%23166534'/><circle cx='44' cy='43' r='2' fill='%230f172a'/><circle cx='56' cy='43' r='2' fill='%230f172a'/><path d='M45 49q5 4 10 0' stroke='%239a3412' stroke-width='2' stroke-linecap='round' fill='none'/><path d='M24 88c2-17 14-25 26-25s24 8 26 25z' fill='%23065f46'/><path d='M45 63h10v25H45z' fill='%23f8fafc'/></svg>",
  },
  {
    id: "corporate-buyer",
    label: "Buyer / Trader",
    role: "buyer",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%231d4ed8'/><circle cx='50' cy='42' r='17' fill='%23fde68a'/><path d='M34 32c3-9 9-13 16-13s13 4 16 13z' fill='%231e293b'/><circle cx='44' cy='41' r='2' fill='%230f172a'/><circle cx='56' cy='41' r='2' fill='%230f172a'/><path d='M45 48q5 3 10 0' stroke='%23b45309' stroke-width='2' stroke-linecap='round' fill='none'/><path d='M22 88c2-18 13-26 28-26s26 8 28 26z' fill='%230f172a'/><path d='M43 62l7 14 7-14z' fill='%23ffffff'/><path d='M48 64l2 16 2-16z' fill='%232563eb'/></svg>",
  },
  {
    id: "fpo-leader",
    label: "FPO Lead",
    role: "fpo",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%230f766e'/><circle cx='50' cy='42' r='17' fill='%23fed7aa'/><path d='M33 33c4-10 10-14 17-14s13 4 17 14z' fill='%23334155'/><circle cx='44' cy='42' r='2' fill='%230f172a'/><circle cx='56' cy='42' r='2' fill='%230f172a'/><path d='M45 48q5 4 10 0' stroke='%239a3412' stroke-width='2' stroke-linecap='round' fill='none'/><path d='M22 88c2-18 14-26 28-26s26 8 28 26z' fill='%23134e4a'/><path d='M40 62h20v26H40z' fill='%23f1f5f9'/><circle cx='50' cy='72' r='3' fill='%23f59e0b'/></svg>",
  },
  {
    id: "kisan-didi",
    label: "Agri Leader",
    role: "farmer",
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23b45309'/><circle cx='50' cy='43' r='17' fill='%23fde68a'/><path d='M31 43c-1-12 8-22 19-22s20 10 19 22c-3 8-7 14-19 14s-16-6-19-14z' fill='%23ea580c'/><circle cx='50' cy='43' r='15' fill='%23fed7aa'/><circle cx='50' cy='38' r='2' fill='%23b91c1c'/><circle cx='44' cy='43' r='2' fill='%230f172a'/><circle cx='56' cy='43' r='2' fill='%230f172a'/><path d='M45 49q5 4 10 0' stroke='%23b45309' stroke-width='2' stroke-linecap='round' fill='none'/><path d='M22 88c2-18 14-26 28-26s26 8 28 26z' fill='%23c2410c'/><path d='M32 62c6 4 11 12 18 26' stroke='%23fef08a' stroke-width='3' fill='none'/></svg>",
  },
];

export function Profile() {
  const { user, updateUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    village: "",
    district: "",
    state: "",
  });

  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (user?.role === "farmer") {
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
        } else {
          setFormData((prev) => ({
            ...prev,
            name: user?.name || "",
            email: user?.email || "",
          }));
        }
      } catch (err) {
        // Gracefully keep user context data
        setFormData((prev) => ({
          ...prev,
          name: user?.name || "",
          email: user?.email || "",
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Keep local avatar synced with context when user updates
  useEffect(() => {
    if (user?.avatar !== undefined) {
      setAvatar(user.avatar);
    }
  }, [user?.avatar]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (successMessage) setSuccessMessage("");
    if (errorMessage) setErrorMessage("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image file size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 256x256 for instant display and optimal storage
        const canvas = document.createElement("canvas");
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
        setAvatar(compressedDataUrl);
        updateUser({ avatar: compressedDataUrl });
        setSuccessMessage("Profile photo uploaded and updated successfully!");
        setErrorMessage("");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    updateUser({ avatar: null });
    setSuccessMessage("Profile photo removed. Restored standard initial badge.");
    setErrorMessage("");
  };

  const handleSelectPreset = (presetSrc) => {
    setAvatar(presetSrc);
    updateUser({ avatar: presetSrc });
    setSuccessMessage("Avatar preset applied!");
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (user?.role === "farmer") {
        await api.put("/api/farmer/profile", {
          name: formData.name,
          phone: formData.phone,
          village: formData.village,
          district: formData.district,
          state: formData.state,
        });
      }

      const locStr = [formData.village || formData.district, formData.state]
        .filter(Boolean)
        .join(" • ");

      // Update auth context state and cache
      updateUser({
        name: formData.name,
        avatar: avatar,
        phone: formData.phone,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        location: locStr,
      });

      setSuccessMessage("Profile details updated successfully!");
    } catch (err) {
      const locStr = [formData.village || formData.district, formData.state]
        .filter(Boolean)
        .join(" • ");

      // If backend call fails (e.g. buyer/fpo or network), update local state
      updateUser({
        name: formData.name,
        avatar: avatar,
        phone: formData.phone,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        location: locStr,
      });
      setSuccessMessage("Profile updated locally!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingState message="Loading your profile..." />
      </div>
    );
  }

  const roleTitle =
    user?.role === "buyer"
      ? "Institutional Buyer Profile"
      : user?.role === "fpo"
      ? "FPO Coordinator Profile"
      : "Farmer Profile & Farmgate Location";

  const roleSubtitle =
    user?.role === "buyer"
      ? "Manage your procurement entity credentials and contact information."
      : user?.role === "fpo"
      ? "Manage your FPO aggregation cluster details and regional representation."
      : "Keep your registered details and primary mandi district up to date for precise market matching.";

  const badgeText =
    user?.role === "buyer"
      ? "Verified Institutional Buyer"
      : user?.role === "fpo"
      ? "FPO Cluster Coordinator"
      : "Active Verified Farmer";

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {roleTitle}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            {roleSubtitle}
          </p>
        </div>
        <Badge variant="emerald" dot>
          {badgeText}
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

      {/* Avatar Management Card */}
      <Card className="p-6 sm:p-7 border-gray-200/90 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-600" />
            Profile Avatar & Visual Platform Identity
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Your avatar appears across the top navbar, home dashboard greeting banner, and platform contracts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
          {/* Main Avatar Preview */}
          <div className="relative shrink-0">
            <Avatar
              src={avatar}
              name={formData.name || user?.name || "User"}
              role={user?.role || "farmer"}
              size="2xl"
              ring
              className="border-2 border-white shadow-md"
            />
            {avatar && (
              <span className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-xs">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </div>

          {/* Action buttons & info */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors">
                <Camera size={15} />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-red-200/60"
                >
                  <Trash2 size={14} />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-gray-400">
              Supported formats: PNG, JPG, WEBP. Max size: 5MB. Resized automatically for optimal performance.
            </p>

            {/* Presets Row */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-600 block mb-2">
                Or pick an agricultural role preset:
              </span>

              <div className="flex items-center gap-3 flex-wrap">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = avatar === preset.src;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.src)}
                      className={`group flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      title={`Select ${preset.label} preset`}
                    >
                      <img
                        src={preset.src}
                        alt={preset.label}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <span
                        className={`text-xs ${
                          isSelected
                            ? "font-bold text-emerald-800"
                            : "font-medium text-gray-700"
                        }`}
                      >
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Details Form */}
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
            <h2 className="text-base font-bold text-gray-900">
              {user?.role === "farmer"
                ? "Farmgate & Geographic Location"
                : "Operational & Geographic Location"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {user?.role === "farmer"
                ? "Used for calculating transport distance and local mandi price benchmarks."
                : "Used for regional cluster matching and logistics dispatch coordination."}
            </p>

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
                label={user?.role === "farmer" ? "Village / Cluster Name" : "City / Hub Name"}
                name="village"
                placeholder={user?.role === "farmer" ? "e.g. Depalpur" : "e.g. Indore Central Hub"}
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
