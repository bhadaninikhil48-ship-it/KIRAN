import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Modal } from "../../components/ui/Modal";
import { CropImage } from "../../components/ui/CropImage";
import { LoadingState } from "../../components/ui/LoadingState";
import {
  ShoppingBasket,
  Plus,
  RefreshCw,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
  Trash2,
  Eye,
  CheckCircle2,
  PackagePlus,
  UserCheck,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export function FPOLots() {
  const [lots, setLots] = useState([]);
  const [stats, setStats] = useState({
    total_lots: 0,
    draft_lots: 0,
    aggregated_lots: 0,
    offered_lots: 0,
    contracted_lots: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Lot Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [lotForm, setLotForm] = useState({
    crop_name: "",
    lot_number: "",
    unit: "quintal",
    quality_grade: "Grade A",
    expected_price: "",
    aggregation_center: "",
    status: "aggregated",
    description: "",
  });

  // Lot Details / Items Modal
  const [selectedLot, setSelectedLot] = useState(null);
  const [lotItems, setLotItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Add Contribution Modal
  const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);
  const [contributionLot, setContributionLot] = useState(null);
  const [availableProduce, setAvailableProduce] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [addingContribution, setAddingContribution] = useState(false);
  const [contributionType, setContributionType] = useState("produce"); // 'produce' | 'offline'

  const [produceForm, setProduceForm] = useState({
    produce_id: "",
    quantity_contributed: "",
  });

  const [offlineForm, setOfflineForm] = useState({
    member_id: "",
    quantity_contributed: "",
    unit: "quintal",
    notes: "",
  });

  const loadLots = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/fpo/lots");
      setLots(res.lots || []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error("Error loading FPO lots:", err);
      setError(err.message || "Failed to load lots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLots();
  }, []);

  // Open / Close Create Modal
  const handleOpenCreateModal = () => {
    setLotForm({
      crop_name: "",
      lot_number: "",
      unit: "quintal",
      quality_grade: "Grade A",
      expected_price: "",
      aggregation_center: "",
      status: "aggregated",
      description: "",
    });
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateError(null);
  };

  // Create Lot
  const handleCreateLot = async (e) => {
    e.preventDefault();
    if (!lotForm.crop_name.trim()) return;
    try {
      setCreating(true);
      setError(null);
      setCreateError(null);

      const payload = {
        crop_name: lotForm.crop_name.trim(),
        unit: lotForm.unit || "quintal",
        quality_grade: lotForm.quality_grade ? lotForm.quality_grade.trim() : "Grade A",
        expected_price: lotForm.expected_price ? parseFloat(lotForm.expected_price) : null,
        aggregation_center: lotForm.aggregation_center ? lotForm.aggregation_center.trim() : null,
        status: lotForm.status || "aggregated",
        description: lotForm.description ? lotForm.description.trim() : null,
      };

      // Only include lot_number if non-empty, otherwise omit for backend auto-generation
      if (lotForm.lot_number && lotForm.lot_number.trim()) {
        payload.lot_number = lotForm.lot_number.trim();
      }

      await api.post("/api/fpo/lots", payload);
      setIsCreateModalOpen(false);
      setLotForm({
        crop_name: "",
        lot_number: "",
        unit: "quintal",
        quality_grade: "Grade A",
        expected_price: "",
        aggregation_center: "",
        status: "aggregated",
        description: "",
      });
      setCreateError(null);
      await loadLots();
    } catch (err) {
      console.error("Error creating lot:", err);
      const errMsg = err.message || "Failed to create lot.";
      setCreateError(errMsg);
      setError(errMsg);
    } finally {
      setCreating(false);
    }
  };

  // View Lot Details & Items
  const handleViewLot = async (lot) => {
    setSelectedLot(lot);
    try {
      setLoadingItems(true);
      const res = await api.get(`/api/fpo/lots/${lot.id}/items`);
      setLotItems(res.items || []);
    } catch (err) {
      console.error("Error loading lot items:", err);
    } finally {
      setLoadingItems(false);
    }
  };

  // Open Contribution Dialog
  const handleOpenAddContribution = async (lot) => {
    setContributionLot(lot);
    setIsAddContributionOpen(true);
    try {
      setLoadingAvailable(true);
      const [prodRes, memRes] = await Promise.allSettled([
        api.get("/api/fpo/produce/available"),
        api.get("/api/fpo/members"),
      ]);
      if (prodRes.status === "fulfilled") {
        // Filter produce matching the lot's crop
        const allProduce = prodRes.value.available_produce || [];
        const matchingProduce = allProduce.filter(
          (p) => p.crop_name.trim().toLowerCase() === lot.crop_name.trim().toLowerCase()
        );
        setAvailableProduce(matchingProduce.length > 0 ? matchingProduce : allProduce);
      }
      if (memRes.status === "fulfilled") {
        setMembers(memRes.value.members || []);
      }
    } catch (err) {
      console.error("Error loading available produce/members:", err);
    } finally {
      setLoadingAvailable(false);
    }
  };

  // Submit Produce Contribution (Registered Farmer)
  const handleAddProduceContribution = async (e) => {
    e.preventDefault();
    if (!contributionLot || !produceForm.produce_id || !produceForm.quantity_contributed) return;
    try {
      setAddingContribution(true);
      setError(null);
      await api.post(`/api/fpo/lots/${contributionLot.id}/items`, {
        produce_id: produceForm.produce_id,
        quantity_contributed: parseFloat(produceForm.quantity_contributed),
        unit: contributionLot.unit,
      });
      setIsAddContributionOpen(false);
      setProduceForm({ produce_id: "", quantity_contributed: "" });
      await loadLots();
      if (selectedLot?.id === contributionLot.id) {
        await handleViewLot(contributionLot);
      }
    } catch (err) {
      console.error("Error adding produce item:", err);
      setError(err.message || "Failed to add produce item.");
    } finally {
      setAddingContribution(false);
    }
  };

  // Submit Direct Offline Contribution
  const handleAddOfflineContribution = async (e) => {
    e.preventDefault();
    if (!contributionLot || !offlineForm.member_id || !offlineForm.quantity_contributed) return;
    try {
      setAddingContribution(true);
      setError(null);
      await api.post(`/api/fpo/lots/${contributionLot.id}/items`, {
        member_id: offlineForm.member_id,
        quantity_contributed: parseFloat(offlineForm.quantity_contributed),
        unit: contributionLot.unit,
        notes: offlineForm.notes,
      });
      setIsAddContributionOpen(false);
      setOfflineForm({ member_id: "", quantity_contributed: "", unit: "quintal", notes: "" });
      await loadLots();
      if (selectedLot?.id === contributionLot.id) {
        await handleViewLot(contributionLot);
      }
    } catch (err) {
      console.error("Error adding offline contribution:", err);
      setError(err.message || "Failed to add offline item.");
    } finally {
      setAddingContribution(false);
    }
  };

  // Remove Item from Lot
  const handleRemoveItem = async (lotId, itemId) => {
    if (!window.confirm("Are you sure you want to remove this contribution? Allocated volume will be released back to the farmer.")) return;
    try {
      setError(null);
      await api.delete(`/api/fpo/lots/${lotId}/items/${itemId}`);
      await handleViewLot({ id: lotId });
      await loadLots();
    } catch (err) {
      console.error("Error removing lot item:", err);
      setError(err.message || "Failed to remove item.");
    }
  };

  // Delete Lot
  const handleDeleteLot = async (lotId, lotNumber) => {
    if (!window.confirm(`Are you sure you want to delete lot "${lotNumber}"?`)) return;
    try {
      setError(null);
      await api.delete(`/api/fpo/lots/${lotId}`);
      await loadLots();
    } catch (err) {
      console.error("Error deleting lot:", err);
      setError(err.message || "Failed to delete lot.");
    }
  };

  const filteredLots = lots.filter((lot) => {
    if (statusFilter === "all") return true;
    return lot.status === statusFilter;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Aggregated Produce Lots
            </h1>
            <Badge variant="emerald" dot>
              Freight Freight-Ready
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Pool smallholder harvest volumes into institutional grade lots to bid on verified buyer requirements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button size="sm" variant="outline" icon={RefreshCw} onClick={loadLots}>
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            icon={Plus}
            onClick={handleOpenCreateModal}
          >
            Create Aggregate Lot
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Lot Status Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-4 border-gray-200">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Total Lots
          </span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{stats.total_lots}</span>
          <p className="text-[11px] text-gray-500 mt-0.5">All created lots</p>
        </Card>

        <Card className="p-4 border-gray-200">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Aggregated
          </span>
          <span className="text-2xl font-bold text-blue-700 mt-1 block">{stats.aggregated_lots}</span>
          <p className="text-[11px] text-gray-500 mt-0.5">Ready to offer</p>
        </Card>

        <Card className="p-4 border-gray-200">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Offered
          </span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{stats.offered_lots}</span>
          <p className="text-[11px] text-gray-500 mt-0.5">In negotiation</p>
        </Card>

        <Card className="p-4 border-gray-200">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Contracted
          </span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{stats.contracted_lots}</span>
          <p className="text-[11px] text-gray-500 mt-0.5">Legally bound</p>
        </Card>

        <Card className="p-4 border-gray-200">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
            Draft
          </span>
          <span className="text-2xl font-bold text-gray-600 mt-1 block">{stats.draft_lots}</span>
          <p className="text-[11px] text-gray-500 mt-0.5">Gathering produce</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto text-xs font-semibold">
        {[
          { key: "all", label: "All Lots" },
          { key: "aggregated", label: "Aggregated (Ready)" },
          { key: "offered", label: "Offered (In Bidding)" },
          { key: "contracted", label: "Contracted (Finalized)" },
          { key: "draft", label: "Draft" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition-all ${
              statusFilter === tab.key
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lots Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingState message="Loading lots..." />
        </div>
      ) : filteredLots.length === 0 ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-gray-200">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBasket size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No Lots Found</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Create an aggregated lot and add smallholder harvest contributions to prepare bulk institutional freight consignments.
            </p>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              icon={Plus}
              onClick={handleOpenCreateModal}
            >
              Create New Lot
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLots.map((lot) => {
            const isAggregated = lot.status === "aggregated";
            const isOffered = lot.status === "offered";
            const isContracted = lot.status === "contracted";
            const isDraft = lot.status === "draft";

            return (
              <Card
                key={lot.id}
                className={`p-5 border transition-all flex flex-col justify-between ${
                  isContracted
                    ? "border-emerald-300 bg-emerald-50/15"
                    : isOffered
                    ? "border-amber-300 bg-amber-50/15"
                    : "border-gray-200 hover:border-emerald-300"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <CropImage
                        crop={lot.crop_name}
                        size="card"
                        className="rounded-xl shadow-xs shrink-0 border border-gray-200 mt-0.5"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{lot.crop_name}</h3>
                        <p className="text-xs text-gray-500">
                          Lot: <strong className="text-gray-800">{lot.lot_number}</strong>
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      status={
                        isContracted
                          ? "Contracted"
                          : isOffered
                          ? "Offered"
                          : isAggregated
                          ? "Aggregated"
                          : "Draft"
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 my-4 py-3 border-t border-b border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-400 block">Total Volume</span>
                      <span className="text-base font-bold text-gray-900">
                        {Number(lot.total_quantity).toLocaleString()} {lot.unit}
                      </span>
                      <span className="text-[11px] text-gray-500 block mt-0.5">
                        Grade: {lot.quality_grade || "Grade A"}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block">Target / Expected Rate</span>
                      <span className="text-base font-bold text-emerald-700">
                        {lot.expected_price ? `₹${Number(lot.expected_price).toLocaleString()} / ${lot.unit}` : "Market Rate"}
                      </span>
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        {lot.aggregation_center || "Regional Hub"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-100 text-xs">
                  <Button size="xs" variant="outline" icon={Eye} onClick={() => handleViewLot(lot)}>
                    Inspect Items
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {isAggregated && (
                      <>
                        <Button
                          size="xs"
                          variant="outline"
                          icon={PackagePlus}
                          onClick={() => handleOpenAddContribution(lot)}
                        >
                          Add Produce
                        </Button>
                        <Link to="/fpo/marketplace">
                          <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Bid Demand
                          </Button>
                        </Link>
                      </>
                    )}

                    {isDraft && (
                      <>
                        <Button
                          size="xs"
                          variant="outline"
                          icon={PackagePlus}
                          onClick={() => handleOpenAddContribution(lot)}
                        >
                          Add Produce
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          icon={Trash2}
                          onClick={() => handleDeleteLot(lot.id, lot.lot_number)}
                        >
                          Delete
                        </Button>
                      </>
                    )}

                    {isOffered && (
                      <Link to="/fpo/offers">
                        <Button size="xs" className="bg-amber-600 hover:bg-amber-700 text-white">
                          View Bids
                        </Button>
                      </Link>
                    )}

                    {isContracted && (
                      <Link to="/fpo/contracts">
                        <Button size="xs" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                          View Contract
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Lot Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Create New Aggregated Produce Lot"
      >
        <form onSubmit={handleCreateLot} className="space-y-4">
          {createError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{createError}</span>
            </div>
          )}

          <Input
            label="Crop Name *"
            placeholder="e.g. Nashik Red Onion, Wheat, Tomato"
            value={lotForm.crop_name}
            onChange={(e) => {
              setLotForm({ ...lotForm, crop_name: e.target.value });
              if (createError) setCreateError(null);
            }}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Custom Lot Number (Optional)"
              placeholder="Leave blank to auto-generate"
              value={lotForm.lot_number}
              onChange={(e) => {
                setLotForm({ ...lotForm, lot_number: e.target.value });
                if (createError) setCreateError(null);
              }}
              autoComplete="off"
            />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                value={lotForm.unit}
                onChange={(e) => setLotForm({ ...lotForm, unit: e.target.value })}
              >
                <option value="quintal">Quintal</option>
                <option value="tonne">Tonne</option>
                <option value="kg">Kg</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quality Grade"
              placeholder="e.g. Grade A, Grade B"
              value={lotForm.quality_grade}
              onChange={(e) => setLotForm({ ...lotForm, quality_grade: e.target.value })}
            />
            <Input
              label="Expected Price (₹ / Unit)"
              type="number"
              step="0.01"
              placeholder="e.g. 120"
              value={lotForm.expected_price}
              onChange={(e) => setLotForm({ ...lotForm, expected_price: e.target.value })}
            />
          </div>

          <Input
            label="Aggregation Hub / Depot"
            placeholder="e.g. Nashik Central Ag Depot"
            value={lotForm.aggregation_center}
            onChange={(e) => setLotForm({ ...lotForm, aggregation_center: e.target.value })}
          />

          <Input
            label="Lot Notes / Specs"
            placeholder="e.g. Cold storage cured, moisture < 12%"
            value={lotForm.description}
            onChange={(e) => setLotForm({ ...lotForm, description: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" type="button" onClick={handleCloseCreateModal}>
              Cancel
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Lot"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lot Inspection Modal */}
      {selectedLot && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLot(null)}
          title={`Lot Inspection: ${selectedLot.lot_number} (${selectedLot.crop_name})`}
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-400">Total Volume:</span>{" "}
                <strong className="text-gray-900">{Number(selectedLot.total_quantity).toLocaleString()} {selectedLot.unit}</strong>
              </div>
              <div>
                <span className="text-gray-400">Current Status:</span>{" "}
                <strong className="capitalize text-emerald-800">{selectedLot.status}</strong>
              </div>
              <div>
                <span className="text-gray-400">Quality Grade:</span>{" "}
                <strong className="text-gray-900">{selectedLot.quality_grade || "Grade A"}</strong>
              </div>
              <div>
                <span className="text-gray-400">Depot Hub:</span>{" "}
                <strong className="text-gray-900">{selectedLot.aggregation_center || "N/A"}</strong>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center justify-between">
                <span>Member Farmer Contributions Breakdown ({lotItems.length})</span>
                {selectedLot.status === "aggregated" && (
                  <Button
                    size="xs"
                    variant="outline"
                    icon={PackagePlus}
                    onClick={() => {
                      const l = selectedLot;
                      setSelectedLot(null);
                      handleOpenAddContribution(l);
                    }}
                  >
                    Add More Produce
                  </Button>
                )}
              </h4>

              {loadingItems ? (
                <div className="py-8 text-center text-xs text-gray-500">Loading item breakdown...</div>
              ) : lotItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400 border border-dashed rounded-lg">
                  No individual farmer contributions added to this lot yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {lotItems.map((item) => (
                    <div key={item.id} className="p-3 bg-white border border-gray-200 rounded-lg text-xs flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900">
                          {item.contributor_name || "Cooperative Member"}
                        </p>
                        <p className="text-gray-500 text-[11px] mt-0.5">
                          {item.produce_id ? `KIRAN Listing #${item.produce_id}` : "Offline Member Contribution"}
                          {item.notes && ` • ${item.notes}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-700 text-sm">
                          {Number(item.quantity_contributed).toLocaleString()} {item.unit}
                        </span>

                        {(selectedLot.status === "draft" || selectedLot.status === "aggregated") && (
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove contribution"
                            onClick={() => handleRemoveItem(selectedLot.id, item.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedLot(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Contribution to Lot Modal */}
      {isAddContributionOpen && contributionLot && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddContributionOpen(false)}
          title={`Add Produce to ${contributionLot.lot_number} (${contributionLot.crop_name})`}
        >
          <div className="space-y-4">
            <div className="flex border-b border-gray-200 text-xs font-semibold">
              <button
                type="button"
                className={`flex-1 py-2 border-b-2 transition-all ${
                  contributionType === "produce"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setContributionType("produce")}
              >
                From Member Harvest Listings
              </button>
              <button
                type="button"
                className={`flex-1 py-2 border-b-2 transition-all ${
                  contributionType === "offline"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setContributionType("offline")}
              >
                Offline Farmer Direct Add
              </button>
            </div>

            {loadingAvailable ? (
              <div className="py-8 text-center text-xs text-gray-500">Checking member harvest availability...</div>
            ) : contributionType === "produce" ? (
              <form onSubmit={handleAddProduceContribution} className="space-y-3">
                <p className="text-xs text-gray-500">
                  Select available, unallocated harvest listings submitted by your enrolled members.
                </p>

                {availableProduce.length === 0 ? (
                  <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-xs">
                    No unallocated harvest listings found for {contributionLot.crop_name}. Ensure member farmers have listed produce or use the Offline Direct Add tab.
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Select Member Harvest Listing *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                      value={produceForm.produce_id}
                      onChange={(e) => {
                        const pId = e.target.value;
                        const item = availableProduce.find((p) => String(p.id) === String(pId));
                        setProduceForm({
                          produce_id: pId,
                          quantity_contributed: item ? item.available_quantity : "",
                        });
                      }}
                      required
                    >
                      <option value="">-- Choose Harvest Listing --</option>
                      {availableProduce.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.farmer_name} • {p.crop_name} • Available: {p.available_quantity} {p.unit}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Input
                  label={`Quantity to Allocate (${contributionLot.unit}) *`}
                  type="number"
                  step="0.01"
                  placeholder="e.g. 100"
                  value={produceForm.quantity_contributed}
                  onChange={(e) => setProduceForm({ ...produceForm, quantity_contributed: e.target.value })}
                  required
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setIsAddContributionOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    type="submit"
                    disabled={addingContribution || !produceForm.produce_id}
                  >
                    {addingContribution ? "Allocating..." : "Allocate to Lot"}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddOfflineContribution} className="space-y-3">
                <p className="text-xs text-gray-500">
                  Record produce directly delivered to depot by an enrolled cooperative member.
                </p>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Select Enrolled Member *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    value={offlineForm.member_id}
                    onChange={(e) => setOfflineForm({ ...offlineForm, member_id: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Member --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.member_name} ({m.membership_id || `ID #${m.id}`}) • {m.village || m.district || "Member"}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label={`Delivered Quantity (${contributionLot.unit}) *`}
                  type="number"
                  step="0.01"
                  placeholder="e.g. 50"
                  value={offlineForm.quantity_contributed}
                  onChange={(e) => setOfflineForm({ ...offlineForm, quantity_contributed: e.target.value })}
                  required
                />

                <Input
                  label="Weighbridge / Lot Note"
                  placeholder="e.g. Moisture 11%, Weighbridge Slip #441"
                  value={offlineForm.notes}
                  onChange={(e) => setOfflineForm({ ...offlineForm, notes: e.target.value })}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setIsAddContributionOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    type="submit"
                    disabled={addingContribution || !offlineForm.member_id}
                  >
                    {addingContribution ? "Adding..." : "Add to Lot"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default FPOLots;
