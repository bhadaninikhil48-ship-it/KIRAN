import { useState, useEffect } from "react";
import {
  ShoppingBasket,
  PlusCircle,
  X,
  Calendar,
  MapPin,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";

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
      setError("Failed to load your posted requirements.");
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Procurement Requirements
            </h1>
            <Badge variant="blue" dot>
              Demand Exchange
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Publish your agricultural demand to local farmer clusters and receive competitive price offers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            icon={RefreshCw}
            onClick={loadRequirements}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            icon={showForm ? X : PlusCircle}
            onClick={() => setShowForm((prev) => !prev)}
          >
            {showForm ? "Cancel" : "Post Requirement"}
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={18} className="text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Post Requirement Form */}
      {showForm && (
        <Card className="p-6 border-emerald-200 bg-white shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Post New Procurement Demand
              </h2>
              <p className="text-xs text-gray-500">
                Specify the crop, expected volume, acceptable quality grade, and target price ceiling.
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Crop Name *
                </label>
                <Input
                  type="text"
                  name="crop_name"
                  value={formData.crop_name}
                  onChange={handleChange}
                  placeholder="e.g. Wheat, Tomato, Soybean"
                  required
                />
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

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      ) : requirements.length === 0 ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-gray-300">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBasket size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              No Requirements Posted Yet
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Post your crop volume, target rate, and delivery terms. Farmers in surrounding districts will immediately see your open listing and submit competitive offers.
            </p>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setShowForm(true)}
              icon={PlusCircle}
            >
              Post First Requirement
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requirements.map((req) => (
            <Card key={req.id} className="p-5 border-gray-200 hover:border-emerald-300 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">
                      {req.crop_name}
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {req.quality_grade || "Grade A"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 mt-0.5 block">
                    Requirement #{req.id}
                  </span>
                </div>
                <Badge variant={req.status === "open" ? "emerald" : "gray"}>
                  {req.status ? req.status.toUpperCase() : "OPEN"}
                </Badge>
              </div>

              <div className="mt-4 space-y-2 py-2 border-t border-b border-gray-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Target Volume:</span>
                  <span className="font-bold text-gray-800">
                    {Number(req.quantity).toLocaleString()} {req.unit}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Target Rate:</span>
                  <span className="font-bold text-emerald-700">
                    {req.max_price ? `₹${Number(req.max_price).toLocaleString()} / ${req.unit}` : "Open to Bids"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Delivery Hub:</span>
                  <span className="font-medium text-gray-700 flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" />
                    {req.location || "Direct Delivery"}
                  </span>
                </div>

                {req.required_by && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Required By:</span>
                    <span className="font-medium text-gray-700 flex items-center gap-1">
                      <Calendar size={12} className="text-gray-400" />
                      {new Date(req.required_by).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
                <span>Created: {new Date(req.created_at).toLocaleDateString()}</span>
                <span className="text-emerald-700 font-semibold">Active in Market</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuyerRequirements;
