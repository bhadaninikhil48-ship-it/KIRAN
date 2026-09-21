import { useState, useEffect } from "react";
import {
  ShoppingBasket,
  PlusCircle,
  X,
  Calendar,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { EmptyState } from "../../components/ui/EmptyState";
import { CropImage } from "../../components/ui/CropImage";

export function BuyerRequirements() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [formData, setFormData] = useState({
    crop_name: "",
    quantity: "",
    unit: "quintal",
    quality_grade: "Grade A",
    max_price: "",
    required_by: "",
    location: "",
  });

  const loadRequirements = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/buyer/requirements/my");
      setRequirements(res.requirements || []);
    } catch (err) {
      console.error("Error fetching requirements:", err);
      setError("Failed to load your posted requirements. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.crop_name || !formData.quantity) {
      setError("Please provide at least the crop name and required quantity.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        crop_name: formData.crop_name.trim(),
        quantity: Number(formData.quantity),
        unit: formData.unit,
        quality_grade: formData.quality_grade,
        max_price: formData.max_price ? Number(formData.max_price) : null,
        required_by: formData.required_by || null,
        location: formData.location.trim() || null,
      };

      const res = await api.post("/api/buyer/requirements", payload);
      setSuccessMsg(res.message || "Requirement posted successfully!");
      setFormData({
        crop_name: "",
        quantity: "",
        unit: "quintal",
        quality_grade: "Grade A",
        max_price: "",
        required_by: "",
        location: "",
      });
      setShowForm(false);
      loadRequirements();
    } catch (err) {
      console.error("Error creating requirement:", err);
      setError(err.message || "Failed to create requirement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header Container */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            {/* Title & Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Procurement Requirements
              </h1>
              <Badge variant="blue" dot size="sm">
                Demand Exchange
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50/90 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Demand Exchange
              </span>
            </div>
            {/* Supporting Subtitle */}
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed">
              Publish your agricultural demand to local farmer clusters and receive competitive price offers.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              loading={loading}
              onClick={loadRequirements}
              className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-medium shadow-xs"
            >
              Refresh
            </Button>
            <Button
              size="sm"
              className={
                showForm
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 shadow-xs font-medium"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow font-medium active:scale-[0.98] transition-all"
              }
              icon={showForm ? X : PlusCircle}
              onClick={() => setShowForm((prev) => !prev)}
            >
              {showForm ? "Cancel" : "Post Requirement"}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between gap-3 text-sm shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center justify-between gap-3 text-sm shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Post Requirement Form */}
      {showForm && (
        <Card className="p-6 sm:p-7 border-emerald-200 bg-white shadow-sm rounded-2xl">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Post New Procurement Demand
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Specify the crop, expected volume, acceptable quality grade, and target price ceiling.
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Crop Name *
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <Input
                      type="text"
                      name="crop_name"
                      value={formData.crop_name}
                      onChange={handleChange}
                      placeholder="e.g. Wheat, Tomato, Soybean, Banana"
                      required
                    />
                  </div>
                  {formData.crop_name.trim() && (
                    <CropImage cropName={formData.crop_name} size="xs" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Required Volume *
                </label>
                <Input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Unit of Measure
                </label>
                <Select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  options={[
                    { value: "quintal", label: "Quintal (q)" },
                    { value: "kg", label: "Kilogram (kg)" },
                    { value: "tonne", label: "Tonne (t)" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quality Grade
                </label>
                <Select
                  name="quality_grade"
                  value={formData.quality_grade}
                  onChange={handleChange}
                  options={[
                    { value: "Grade A", label: "Grade A (Premium / Export)" },
                    { value: "Grade B", label: "Grade B (Standard Market)" },
                    { value: "Grade C", label: "Grade C (Processing / Feed)" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Price Ceiling (₹ / unit)
                </label>
                <Input
                  type="number"
                  name="max_price"
                  value={formData.max_price}
                  onChange={handleChange}
                  placeholder="e.g. 2600"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Required By Date
                </label>
                <Input
                  type="date"
                  name="required_by"
                  value={formData.required_by}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Delivery / Mandi Hub Location
                </label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Depalpur Mandi Yard or Indore Hub"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                loading={submitting}
              >
                Publish to Farmers
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Requirements List */}
      {loading ? (
        /* SaaS Skeleton Loading State for Requirement Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-100 rounded-2xl border border-gray-200/70 p-5 sm:p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-200"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded-full w-14"></div>
                </div>
                <div className="mt-4 p-3.5 bg-gray-200/60 rounded-xl space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-4"></div>
            </div>
          ))}
        </div>
      ) : requirements.length === 0 ? (
        <EmptyState
          icon={ShoppingBasket}
          title="No Requirements Posted Yet"
          description="Post your crop volume, target rate, and delivery terms. Farmers in surrounding districts will immediately see your open listing and submit competitive offers."
          actionLabel="Post First Requirement"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {requirements.map((req) => (
            <Card
              key={req.id}
              className="p-5 sm:p-6 border-gray-200/90 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white flex flex-col justify-between group"
            >
              <div>
                {/* Top Row: Crop Image + Spec Info + Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Visual Crop Presentation */}
                    <CropImage cropName={req.crop_name} size="md" />

                    <div className="min-w-0">
                      <h3
                        className="font-extrabold text-gray-900 text-base sm:text-lg tracking-tight truncate"
                        title={req.crop_name}
                      >
                        {req.crop_name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                          {req.quality_grade || "Grade A"}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          #{req.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={req.status === "open" ? "emerald" : "gray"}
                    dot
                    size="sm"
                    className="shrink-0"
                  >
                    {req.status ? req.status.toUpperCase() : "OPEN"}
                  </Badge>
                </div>

                {/* Middle: Structured Data Specs Panel */}
                <div className="mt-4 p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Target Volume</span>
                    <span className="font-bold text-gray-900">
                      {Number(req.quantity).toLocaleString("en-IN")} {req.unit}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Target Rate</span>
                    <span className="font-bold text-emerald-700">
                      {req.max_price
                        ? `₹${Number(req.max_price).toLocaleString("en-IN")} / ${req.unit}`
                        : "Open to Bids"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Delivery Hub</span>
                    <span className="font-semibold text-gray-700 flex items-center gap-1 min-w-0">
                      <MapPin size={12} className="text-gray-400 shrink-0" />
                      <span
                        className="truncate max-w-[140px]"
                        title={req.location || "Direct Delivery"}
                      >
                        {req.location || "Direct Delivery"}
                      </span>
                    </span>
                  </div>

                  {req.required_by && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Required By</span>
                      <span className="font-semibold text-gray-700 flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400 shrink-0" />
                        {new Date(req.required_by).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer: Created Date & Market Status */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                <span>Created: {new Date(req.created_at).toLocaleDateString()}</span>
                <span className="text-emerald-700 font-semibold inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active in Market
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuyerRequirements;
