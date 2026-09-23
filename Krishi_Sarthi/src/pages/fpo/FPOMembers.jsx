import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Modal } from "../../components/ui/Modal";
import { LoadingState } from "../../components/ui/LoadingState";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Phone,
  MapPin,
  Sprout,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

export function FPOMembers() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({
    total_members: 0,
    registered_farmers: 0,
    offline_farmers: 0,
    active_members: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState("registered"); // 'registered' | 'offline'
  const [adding, setAdding] = useState(false);

  // Farmer Search State for registered farmer enrollment
  const [farmerSearchQuery, setFarmerSearchQuery] = useState("");
  const [searchedFarmers, setSearchedFarmers] = useState([]);
  const [searchingFarmers, setSearchingFarmers] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [modalError, setModalError] = useState(null);

  // Offline Farmer Form State
  const [offlineForm, setOfflineForm] = useState({
    member_name: "",
    phone: "",
    village: "",
    district: "",
    state: "",
    land_area_acres: "",
    primary_crop: "",
    membership_id: "",
  });

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState(null);
  const [updating, setUpdating] = useState(false);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/fpo/members");
      setMembers(res.members || []);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Error loading FPO members:", err);
      setError(err.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // Search registered KIRAN farmers
  const handleSearchFarmers = async () => {
    if (!farmerSearchQuery.trim()) return;
    try {
      setSearchingFarmers(true);
      setModalError(null);
      const res = await api.get(`/api/fpo/farmers/search?q=${encodeURIComponent(farmerSearchQuery.trim())}`);
      setSearchedFarmers(res.farmers || []);
    } catch (err) {
      console.error("Error searching farmers:", err);
      setModalError(err.message || "Failed to search farmers.");
    } finally {
      setSearchingFarmers(false);
    }
  };

  // Add Registered Member
  const handleAddRegisteredFarmer = async () => {
    if (!selectedFarmer) return;
    try {
      setAdding(true);
      setError(null);
      setModalError(null);

      const targetFarmerId = selectedFarmer.farmer_profile_id || selectedFarmer.id;
      if (!targetFarmerId) {
        setModalError("Selected farmer does not have a valid farmer profile identifier.");
        return;
      }

      await api.post("/api/fpo/members", {
        farmer_id: targetFarmerId,
        member_name: selectedFarmer.name,
        phone: selectedFarmer.phone || undefined,
        village: selectedFarmer.village || undefined,
        district: selectedFarmer.district || undefined,
        state: selectedFarmer.state || undefined,
        primary_crop: selectedFarmer.primary_crop || "",
      });

      setIsAddModalOpen(false);
      setSelectedFarmer(null);
      setFarmerSearchQuery("");
      setSearchedFarmers([]);
      setModalError(null);
      await loadMembers();
    } catch (err) {
      console.error("Error adding registered farmer:", err);
      setModalError(err.message || "Failed to add registered farmer.");
      setError(err.message || "Failed to add registered farmer.");
    } finally {
      setAdding(false);
    }
  };

  // Add Offline Member
  const handleAddOfflineFarmer = async (e) => {
    e.preventDefault();
    if (!offlineForm.member_name.trim()) return;
    try {
      setAdding(true);
      setError(null);
      setModalError(null);
      await api.post("/api/fpo/members", offlineForm);
      setIsAddModalOpen(false);
      setOfflineForm({
        member_name: "",
        phone: "",
        village: "",
        district: "",
        state: "",
        land_area_acres: "",
        primary_crop: "",
        membership_id: "",
      });
      setModalError(null);
      await loadMembers();
    } catch (err) {
      console.error("Error adding offline farmer:", err);
      setModalError(err.message || "Failed to add offline farmer.");
      setError(err.message || "Failed to add offline farmer.");
    } finally {
      setAdding(false);
    }
  };

  // Update Member
  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      setUpdating(true);
      setError(null);
      await api.put(`/api/fpo/members/${editingMember.id}`, {
        member_name: editingMember.member_name,
        phone: editingMember.phone,
        village: editingMember.village,
        district: editingMember.district,
        state: editingMember.state,
        land_area_acres: editingMember.land_area_acres,
        primary_crop: editingMember.primary_crop,
        status: editingMember.status,
      });
      setEditingMember(null);
      await loadMembers();
    } catch (err) {
      console.error("Error updating member:", err);
      setError(err.message || "Failed to update member.");
    } finally {
      setUpdating(false);
    }
  };

  // Delete/Deactivate Member
  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove/deactivate "${name}" from this FPO?`)) return;
    try {
      setError(null);
      await api.delete(`/api/fpo/members/${id}`);
      await loadMembers();
    } catch (err) {
      console.error("Error deleting member:", err);
      setError(err.message || "Failed to delete member.");
    }
  };

  const filteredMembers = members.filter((m) => {
    const q = searchTerm.toLowerCase();
    return (
      (m.member_name && m.member_name.toLowerCase().includes(q)) ||
      (m.village && m.village.toLowerCase().includes(q)) ||
      (m.district && m.district.toLowerCase().includes(q)) ||
      (m.primary_crop && m.primary_crop.toLowerCase().includes(q)) ||
      (m.membership_id && m.membership_id.toLowerCase().includes(q)) ||
      (m.phone && m.phone.includes(q))
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              FPO Member Farmers
            </h1>
            <Badge variant="emerald" dot>
              Smallholder Collective
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Enrolled members supplying harvest volumes for aggregated lot creation and trade contracts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button size="sm" variant="outline" icon={RefreshCw} onClick={loadMembers}>
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            icon={UserPlus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Enroll Farmer
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-gray-200">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Total Members
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 block">
            {stats.total_members}
          </span>
          <p className="text-xs text-gray-500 mt-1">Enrolled smallholders</p>
        </Card>

        <Card className="p-5 border-gray-200">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Active Members
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-2 block">
            {stats.active_members}
          </span>
          <p className="text-xs text-gray-500 mt-1">In good standing</p>
        </Card>

        <Card className="p-5 border-gray-200">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            KIRAN Digital Farmers
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-blue-700 mt-2 block">
            {stats.registered_farmers}
          </span>
          <p className="text-xs text-gray-500 mt-1">Direct app profiles</p>
        </Card>

        <Card className="p-5 border-gray-200">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Offline Enrolled
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-purple-700 mt-2 block">
            {stats.offline_farmers}
          </span>
          <p className="text-xs text-gray-500 mt-1">Ledger-registered</p>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
            placeholder="Search member by name, phone, village, district, crop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Members Grid / Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingState message="Loading member directory..." />
        </div>
      ) : filteredMembers.length === 0 ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-gray-200">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Users size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {searchTerm ? "No Matching Members Found" : "No Members Enrolled Yet"}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {searchTerm
                ? "Try searching with a different name or phone number."
                : "Enroll registered KIRAN farmers or add offline farmers from your cooperative to start aggregating harvest lots."}
            </p>
            {!searchTerm && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                icon={UserPlus}
                onClick={() => setIsAddModalOpen(true)}
              >
                Enroll First Farmer
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="p-5 border-gray-200 hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                      {member.member_name}
                      {member.is_registered_farmer === 1 && (
                        <span title="Verified KIRAN Digital Farmer">
                          <CheckCircle2 size={16} className="text-blue-600 inline shrink-0" />
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {member.membership_id ? `ID: ${member.membership_id}` : `Member #${member.id}`}
                    </p>
                  </div>
                  <Badge variant={member.status === "active" ? "emerald" : "gray"}>
                    {member.status || "active"}
                  </Badge>
                </div>

                <div className="space-y-1.5 my-3 py-2 border-t border-b border-gray-100 text-xs">
                  {member.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={13} className="text-gray-400" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {(member.village || member.district) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={13} className="text-gray-400" />
                      <span>
                        {[member.village, member.district, member.state].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {member.primary_crop && (
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <Sprout size={13} />
                      <span>Primary: {member.primary_crop}</span>
                    </div>
                  )}
                  {member.land_area_acres && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>Land Area: {member.land_area_acres} acres</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-100">
                <span className="text-[11px]">
                  {member.is_registered_farmer === 1 ? "KIRAN Farmer" : "Cooperative Ledger"}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="xs"
                    variant="outline"
                    icon={Edit2}
                    onClick={() => setEditingMember(member)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 hover:border-red-200"
                    icon={Trash2}
                    onClick={() => handleDeleteMember(member.id, member.member_name)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Enroll Farmer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedFarmer(null);
          setFarmerSearchQuery("");
          setSearchedFarmers([]);
          setModalError(null);
        }}
        title="Enroll Farmer into FPO"
      >
        <div className="space-y-4">
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all ${
                addMode === "registered"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setAddMode("registered");
                setModalError(null);
              }}
            >
              Search Registered KIRAN Farmer
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all ${
                addMode === "offline"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setAddMode("offline");
                setModalError(null);
              }}
            >
              Add Offline Farmer
            </button>
          </div>

          {modalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{modalError}</span>
            </div>
          )}

          {addMode === "registered" ? (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Search verified farmers registered on KIRAN to link their harvest listings directly to your aggregated FPO lots.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter farmer name or phone number..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  value={farmerSearchQuery}
                  onChange={(e) => setFarmerSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchFarmers()}
                />
                <Button size="sm" onClick={handleSearchFarmers} disabled={searchingFarmers} icon={Search}>
                  {searchingFarmers ? "Searching..." : "Search"}
                </Button>
              </div>

              {searchedFarmers.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-100 rounded-lg p-2">
                  {searchedFarmers.map((f) => {
                    const farmerId = f.farmer_profile_id || f.id;
                    const isSelected = (selectedFarmer?.farmer_profile_id || selectedFarmer?.id) === farmerId;

                    return (
                      <div
                        key={farmerId}
                        onClick={() => {
                          setSelectedFarmer(f);
                          setModalError(null);
                        }}
                        className={`p-3 rounded-lg border cursor-pointer text-xs transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-gray-900 text-sm">{f.name}</strong>
                          <Badge variant="blue">Farmer #{farmerId}</Badge>
                        </div>
                        <div className="text-gray-500 mt-1 flex flex-wrap gap-2">
                          <span>Ph: {f.phone || "N/A"}</span>
                          {(f.village || f.district || f.state) && (
                            <span>• {[f.village, f.district, f.state].filter(Boolean).join(", ")}</span>
                          )}
                          {f.email && <span>• {f.email}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedFarmer && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-emerald-900 font-bold">Selected Farmer: {selectedFarmer.name}</p>
                    <Badge variant="emerald">Profile #{selectedFarmer.farmer_profile_id || selectedFarmer.id}</Badge>
                  </div>
                  <p className="text-emerald-700">Phone: {selectedFarmer.phone || "N/A"}</p>
                  <p className="text-emerald-700">
                    Location: {[selectedFarmer.village, selectedFarmer.district, selectedFarmer.state].filter(Boolean).join(", ") || "Location not specified"}
                  </p>
                  {selectedFarmer.email && <p className="text-emerald-700">Email: {selectedFarmer.email}</p>}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setModalError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  disabled={!selectedFarmer || adding}
                  onClick={handleAddRegisteredFarmer}
                >
                  {adding ? "Enrolling..." : "Enroll Selected Farmer"}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddOfflineFarmer} className="space-y-3">
              <Input
                label="Farmer Full Name *"
                value={offlineForm.member_name}
                onChange={(e) => setOfflineForm({ ...offlineForm, member_name: e.target.value })}
                placeholder="e.g. Tukaram Shinde"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Contact Phone"
                  value={offlineForm.phone}
                  onChange={(e) => setOfflineForm({ ...offlineForm, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                />
                <Input
                  label="Coop Membership ID"
                  value={offlineForm.membership_id}
                  onChange={(e) => setOfflineForm({ ...offlineForm, membership_id: e.target.value })}
                  placeholder="e.g. MEM-042"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="Village"
                  value={offlineForm.village}
                  onChange={(e) => setOfflineForm({ ...offlineForm, village: e.target.value })}
                  placeholder="e.g. Pimpalgaon"
                />
                <Input
                  label="District"
                  value={offlineForm.district}
                  onChange={(e) => setOfflineForm({ ...offlineForm, district: e.target.value })}
                  placeholder="e.g. Nashik"
                />
                <Input
                  label="State"
                  value={offlineForm.state}
                  onChange={(e) => setOfflineForm({ ...offlineForm, state: e.target.value })}
                  placeholder="e.g. Maharashtra"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Land Area (Acres)"
                  type="number"
                  step="0.1"
                  value={offlineForm.land_area_acres}
                  onChange={(e) => setOfflineForm({ ...offlineForm, land_area_acres: e.target.value })}
                  placeholder="e.g. 4.5"
                />
                <Input
                  label="Primary Crop"
                  value={offlineForm.primary_crop}
                  onChange={(e) => setOfflineForm({ ...offlineForm, primary_crop: e.target.value })}
                  placeholder="e.g. Onion"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" type="submit" disabled={adding}>
                  {adding ? "Saving..." : "Add Farmer"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Edit Member Modal */}
      {editingMember && (
        <Modal
          isOpen={true}
          onClose={() => setEditingMember(null)}
          title={`Edit Member: ${editingMember.member_name}`}
        >
          <form onSubmit={handleUpdateMember} className="space-y-3">
            <Input
              label="Member Full Name *"
              value={editingMember.member_name || ""}
              onChange={(e) => setEditingMember({ ...editingMember, member_name: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Phone"
                value={editingMember.phone || ""}
                onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
              />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  value={editingMember.status || "active"}
                  onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Village"
                value={editingMember.village || ""}
                onChange={(e) => setEditingMember({ ...editingMember, village: e.target.value })}
              />
              <Input
                label="District"
                value={editingMember.district || ""}
                onChange={(e) => setEditingMember({ ...editingMember, district: e.target.value })}
              />
              <Input
                label="State"
                value={editingMember.state || ""}
                onChange={(e) => setEditingMember({ ...editingMember, state: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Land Area (Acres)"
                type="number"
                step="0.1"
                value={editingMember.land_area_acres || ""}
                onChange={(e) => setEditingMember({ ...editingMember, land_area_acres: e.target.value })}
              />
              <Input
                label="Primary Crop"
                value={editingMember.primary_crop || ""}
                onChange={(e) => setEditingMember({ ...editingMember, primary_crop: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingMember(null)}>
                Cancel
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" type="submit" disabled={updating}>
                {updating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default FPOMembers;
