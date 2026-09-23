import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { LoadingState } from "../../components/ui/LoadingState";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  FileText,
} from "lucide-react";

export function FPOProfile() {
  const { user, updateUser } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    fpo_name: "",
    registration_number: "",
    contact_person: "",
    phone: "",
    email: "",
    office_address: "",
    village_locality: "",
    district: "",
    state: "",
    pincode: "",
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/fpo/profile");
      if (res?.profile) {
        setProfile(res.profile);
        setFormData({
          fpo_name: res.profile.fpo_name || "",
          registration_number: res.profile.registration_number || "",
          contact_person: res.profile.contact_person || "",
          phone: res.profile.phone || "",
          email: res.profile.email || "",
          office_address: res.profile.office_address || "",
          village_locality: res.profile.village_locality || "",
          district: res.profile.district || "",
          state: res.profile.state || "",
          pincode: res.profile.pincode || "",
        });
        if (updateUser) {
          const dist = (res.profile.district || "").trim();
          const st = (res.profile.state || "").trim();
          updateUser({
            district: dist,
            state: st,
            location: dist && st ? `${dist} • ${st}` : null,
          });
        }
      }
    } catch (err) {
      if (err.status === 404) {
        // No profile yet, show creation form
        setProfile(null);
        setIsEditing(true);
      } else {
        console.error("Error loading FPO profile:", err);
        setError(err.message || "Failed to load FPO profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!formData.fpo_name.trim()) {
        setError("FPO Name is required.");
        return;
      }

      let res;
      if (profile) {
        res = await api.put("/api/fpo/profile", formData);
        setSuccess("FPO profile updated successfully.");
      } else {
        res = await api.post("/api/fpo/profile", formData);
        setSuccess("FPO profile created successfully.");
      }

      if (res?.profile) {
        setProfile(res.profile);
        setIsEditing(false);
        if (updateUser) {
          const dist = (res.profile.district || formData.district || "").trim();
          const st = (res.profile.state || formData.state || "").trim();
          updateUser({
            district: dist,
            state: st,
            location: dist && st ? `${dist} • ${st}` : null,
          });
        }
      }
    } catch (err) {
      console.error("Error saving FPO profile:", err);
      setError(err.message || "Failed to save FPO profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingState message="Loading FPO profile..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              FPO Organization Profile
            </h1>
            <Badge variant="emerald" dot>
              Verified Collective
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Manage your legal entity registration, official contact points, and operational hub details.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button size="sm" variant="outline" icon={RefreshCw} onClick={loadProfile}>
            Refresh
          </Button>
          {!isEditing && profile && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Organization Overview Stats */}
      {profile && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Members
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                {profile.total_members_count || 0}
              </span>
              <p className="text-xs text-gray-500 mt-1">Enrolled smallholder farmers</p>
            </div>
          </Card>

          <Card className="p-5 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Active Farmers
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-700">
                {profile.active_members_count || 0}
              </span>
              <p className="text-xs text-gray-500 mt-1">Currently contributing produce</p>
            </div>
          </Card>

          <Card className="p-5 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Compliance Status
              </span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-lg font-bold text-gray-900">
                {profile.registration_number ? "Registered Entity" : "Pending Registration"}
              </span>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {profile.registration_number || "CIN / Registrar ID needed"}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Main Profile Form / Details View */}
      <Card className="p-6 border-gray-200/90 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Legal Entity & Registration</h3>
                <p className="text-xs text-gray-500">Official details registered with the Ministry of Corporate Affairs / Registrar of Societies.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="FPO Organization Legal Name *"
              name="fpo_name"
              value={formData.fpo_name}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. Sahyadri Agri Producer Co. Ltd."
              required
            />
            <Input
              label="Registration / CIN Number"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. U01100MH2022PTC123456"
            />
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                <User size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Designated Contact Person</h3>
                <p className="text-xs text-gray-500">Authorized representative managing marketplace transactions and buyer trade inquiries.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Contact Person Name"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. Ramesh Patil"
            />
            <Input
              label="Official Contact Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. 9876543210"
            />
            <Input
              label="Official Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. contact@sahyadriagro.in"
            />
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Registered Office & Operational Hub</h3>
                <p className="text-xs text-gray-500">Primary collection center address for logistics and freight dispatch.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Office / Facility Address"
              name="office_address"
              value={formData.office_address}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. Plot No. 12, APMC Market Yard Complex"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              label="Village / Locality"
              name="village_locality"
              value={formData.village_locality}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. Dindori"
            />
            <Input
              label="District"
              name="district"
              value={formData.district}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. Nashik"
            />
            <Input
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. Maharashtra"
            />
            <Input
              label="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. 422001"
            />
          </div>

          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              {profile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" icon={Save} disabled={saving}>
                {saving ? "Saving..." : profile ? "Save Changes" : "Create FPO Profile"}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}

export default FPOProfile;
