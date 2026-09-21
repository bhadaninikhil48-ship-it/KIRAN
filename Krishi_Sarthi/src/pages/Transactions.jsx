import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Truck,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  PhoneCall,
  FileCheck,
  Calendar,
  MapPin,
  Package,
  Layers,
  Info,
  Clock
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { animateReveal } from "../utils/animations";
import { CropImage } from "../components/ui/CropImage";
import api from "../services/api";

export function Transactions() {
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Logistics tracking states
  const [deliveryStatus, setDeliveryStatus] = useState("Pending"); // Pending, In Transit, Delivered
  const [showBackupBuyers, setShowBackupBuyers] = useState(false);
  const [backupRequirements, setBackupRequirements] = useState([]);
  const [contactedBuyerModal, setContactedBuyerModal] = useState(null);

  const backupRef = useRef(null);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/contracts/farmer");
      const list = res.contracts || [];
      setContracts(list);
      if (list.length > 0) {
        setSelectedContractId(list[0].id);
      }
    } catch (err) {
      console.error("Error fetching farmer contracts:", err);
      setError("Failed to load your transaction contracts.");
    } finally {
      setLoading(false);
    }
  };

  const loadBackupBuyers = async () => {
    try {
      const res = await api.get("/api/buyer/requirements/open");
      setBackupRequirements(res.requirements || []);
    } catch (err) {
      console.error("Error fetching backup requirements:", err);
    }
  };

  useEffect(() => {
    loadContracts();
    loadBackupBuyers();
  }, []);

  useEffect(() => {
    if (showBackupBuyers && backupRef.current) {
      animateReveal(backupRef.current, { duration: 0.35 });
    }
  }, [showBackupBuyers]);

  const activeContract = contracts.find((c) => c.id === selectedContractId) || contracts[0] || null;

  // Timeline steps as specified in Section 14
  // Offer -> Accepted -> Transaction Created -> Transport -> Pickup -> Delivery -> Payment
  const getTimelineSteps = () => {
    const isDelivered = deliveryStatus === "Delivered" || activeContract?.status === "completed";
    const isInTransit = deliveryStatus === "In Transit";

    return [
      { id: "offer", label: "Offer", completed: true, current: false },
      { id: "accepted", label: "Accepted", completed: true, current: false },
      { id: "created", label: "Contract Created", completed: true, current: false },
      {
        id: "transport",
        label: "Transport",
        completed: isInTransit || isDelivered,
        current: deliveryStatus === "Pending",
      },
      {
        id: "pickup",
        label: "Pickup",
        completed: isInTransit || isDelivered,
        current: deliveryStatus === "Pending",
      },
      {
        id: "delivery",
        label: "Delivery",
        completed: isDelivered,
        current: isInTransit,
      },
      {
        id: "payment",
        label: "Settlement",
        completed: false, // Payment gateway pending backend support
        current: isDelivered,
      },
    ];
  };

  const timelineSteps = getTimelineSteps();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Transaction & Consignment Tracking
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Real-time status progression from contract generation through transport dispatch to payment settlement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="outline"
            icon={RotateCcw}
            onClick={() => {
              setDeliveryStatus("Pending");
              loadContracts();
            }}
          >
            Refresh Status
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          {error}
        </div>
      ) : contracts.length === 0 ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-gray-300">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <FileCheck size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No Active Contracts Yet</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              When a buyer accepts one of your submitted offers, a legally binding digital contract will be automatically generated and appear here with full dispatch tracking.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link to="/offers">
                <Button size="sm" variant="outline">
                  View Submitted Offers
                </Button>
              </Link>
              <Link to="/buyers">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Browse Open Requirements
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Contract Selector Tabs */}
          {contracts.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex-shrink-0">
                Contracts:
              </span>
              {contracts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedContractId(c.id);
                    setDeliveryStatus("Pending");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedContractId === c.id
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <CropImage crop={c.crop_name} size="xs" className="rounded shrink-0" />
                  <span>#{c.id} • {c.crop_name} ({c.quantity} {c.unit})</span>
                </button>
              ))}
            </div>
          )}

          {/* Visual Status Progression Timeline (Section 14) */}
          <Card className="border-gray-200/90 overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Contract Fulfillment Pipeline
                </h3>
                <p className="text-xs text-gray-500">
                  Contract #{activeContract.id} • Buyer: {activeContract.buyer_name || "Verified Buyer"}
                </p>
              </div>
              <Badge variant="emerald" dot>
                {activeContract.status ? activeContract.status.toUpperCase() : "ACTIVE CONTRACT"}
              </Badge>
            </div>

            {/* Responsive Horizontal Stepper */}
            <div className="py-2 overflow-x-auto">
              <div className="flex items-center justify-between min-w-[650px] px-2">
                {timelineSteps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    {/* Node */}
                    <div className="flex flex-col items-center text-center group">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                          step.completed
                            ? "bg-emerald-600 text-white shadow-xs"
                            : step.current
                            ? "bg-emerald-100 text-emerald-800 ring-4 ring-emerald-50 border border-emerald-400 font-extrabold animate-pulse"
                            : "bg-gray-100 text-gray-400 border border-gray-200"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium max-w-[85px] leading-tight ${
                          step.completed
                            ? "text-emerald-800 font-semibold"
                            : step.current
                            ? "text-gray-900 font-bold"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {/* Connecting Line */}
                    {idx < timelineSteps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 transition-all duration-200 ${
                          timelineSteps[idx + 1].completed || step.completed
                            ? "bg-emerald-500"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Card>

          {/* Active Transaction Details Card */}
          <Card className="border-gray-200/90 hover:border-emerald-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-start gap-3.5">
                <CropImage
                  crop={activeContract.crop_name}
                  size="card"
                  className="rounded-xl shadow-xs shrink-0 border border-gray-200 mt-0.5"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {activeContract.buyer_name ? `${activeContract.buyer_name} Consignment` : "Buyer Consignment"}
                    </h2>
                    <StatusBadge status={activeContract.status === "active" ? "Confirmed" : activeContract.status || "Confirmed"} />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Produce Lot: <strong>{activeContract.crop_name}</strong>
                    {activeContract.quality_grade ? ` (${activeContract.quality_grade})` : ""} •{" "}
                    {Number(activeContract.quantity).toLocaleString()} {activeContract.unit} •{" "}
                    Delivery to: <strong>{activeContract.delivery_location || "Buyer Warehouse"}</strong>
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-1">
                <span className="text-xs text-gray-400 uppercase">Settlement Amount</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                  ₹{Number(activeContract.total_amount).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-xs sm:text-sm">
              <div>
                <span className="text-xs text-gray-400 block">Agreed Unit Rate</span>
                <span className="font-bold text-gray-900 text-base">
                  ₹{Number(activeContract.agreed_price).toLocaleString()} / {activeContract.unit}
                </span>
                <span className="text-[11px] text-emerald-600 block mt-0.5">Legally locked</span>
              </div>

              <div>
                <span className="text-xs text-gray-400 block">Total Consignment Volume</span>
                <span className="font-bold text-gray-900 text-base">
                  {Number(activeContract.quantity).toLocaleString()} {activeContract.unit}
                </span>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  Contract #{activeContract.id}
                </span>
              </div>

              {/* Delivery Interactive Stepper */}
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200/70">
                <span className="text-xs text-gray-500 block font-medium">Logistics Status</span>
                <div className="mt-1 flex items-center gap-1.5">
                  <Truck size={16} className="text-emerald-600" />
                  <span
                    className={`font-bold ${
                      deliveryStatus === "Delivered"
                        ? "text-emerald-700"
                        : deliveryStatus === "In Transit"
                        ? "text-blue-700"
                        : "text-amber-700"
                    }`}
                  >
                    {deliveryStatus}
                  </span>
                </div>

                <div className="mt-2">
                  {deliveryStatus === "Pending" && (
                    <button
                      type="button"
                      onClick={() => setDeliveryStatus("In Transit")}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      Start Delivery <ArrowRight size={13} />
                    </button>
                  )}
                  {deliveryStatus === "In Transit" && (
                    <button
                      type="button"
                      onClick={() => setDeliveryStatus("Delivered")}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      Mark Delivered <CheckCircle2 size={13} />
                    </button>
                  )}
                  {deliveryStatus === "Delivered" && (
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 size={13} /> Consignment received at hub
                    </span>
                  )}
                </div>
              </div>

              {/* Payment Status Card (Section 15: Marked as pending backend support) */}
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/70">
                <span className="text-xs text-amber-800 block font-medium">Payment Settlement</span>
                <div className="mt-1 flex items-center gap-1.5">
                  <FileCheck size={16} className="text-amber-700" />
                  <span className="font-bold text-amber-800">
                    Pending Gateway
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-amber-700 flex items-start gap-1">
                  <Info size={12} className="mt-0.5 flex-shrink-0" />
                  <span>Direct escrow payment integration pending backend support.</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={13} /> Created: {new Date(activeContract.created_at).toLocaleDateString()}
                {activeContract.required_by && (
                  <> • Required By: {new Date(activeContract.required_by).toLocaleDateString()}</>
                )}
              </span>
              {activeContract.buyer_phone && (
                <span className="text-gray-600 font-medium flex items-center gap-1">
                  <PhoneCall size={13} /> Buyer Contact: {activeContract.buyer_phone}
                </span>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Backup Buyer / Deal Recovery (Section 15) */}
      <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 border border-amber-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert size={14} className="text-amber-700" />
                Deal Recovery Protocol
              </span>
              <span className="text-xs text-amber-800 font-medium">
                Instant Re-matching Safety Net
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Buyer cancels the deal? Find another suitable buyer quickly.
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
              If a buyer reneges or fails transit inspection, KIRAN instantly mobilizes alternate pre-screened buyers with open requirements so your perishables are never dumped.
            </p>
          </div>

          <Button
            size="md"
            className="bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0"
            onClick={() => setShowBackupBuyers((prev) => !prev)}
          >
            {showBackupBuyers ? "Hide Backup Buyers" : "Find Backup Buyer"}
          </Button>
        </div>

        {/* GSAP Revealed Backup Buyers List */}
        {showBackupBuyers && (
          <div ref={backupRef} className="mt-6 pt-5 border-t border-amber-200/80 space-y-3">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-600" />
              Active Open Market Demands
            </h4>

            {backupRequirements.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-2">
                No alternative buyer demands currently posted in the open exchange.
              </p>
            ) : (
              <div className="space-y-3">
                {backupRequirements.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white border border-gray-200 hover:border-amber-400 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <CropImage
                        crop={req.crop_name}
                        size="card"
                        className="rounded-xl shadow-xs shrink-0 border border-gray-200 mt-0.5"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-gray-900 text-sm sm:text-base">
                            {req.buyer_name || "Enterprise Buyer"}
                          </h5>
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {req.quality_grade || "Grade A"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-800">{req.crop_name}</span>
                          <span>•</span>
                          <span>{Number(req.quantity).toLocaleString()} {req.unit}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {req.delivery_location}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">Target Budget</span>
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          ₹{Number(req.target_price).toLocaleString()} / {req.unit}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => setContactedBuyerModal(req)}
                        icon={PhoneCall}
                      >
                        Connect Instantly
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact Backup Buyer Feedback Modal */}
      <Modal
        isOpen={Boolean(contactedBuyerModal)}
        onClose={() => setContactedBuyerModal(null)}
        title="Backup Buyer Contacted!"
        subtitle={`Emergency reallocation routed to ${contactedBuyerModal?.buyer_name || "Buyer"}`}
      >
        <div className="space-y-4 text-xs sm:text-sm text-gray-700">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-3">
            {contactedBuyerModal?.crop_name && (
              <CropImage
                crop={contactedBuyerModal.crop_name}
                size="card"
                className="rounded-xl shadow-xs shrink-0 border border-emerald-300 mt-0.5"
              />
            )}
            <div>
              <p className="font-semibold">Deal Recovery Protocol Initiated.</p>
              <p className="mt-1 text-xs text-emerald-800">
                Buyer dispatch agent has acknowledged demand for <strong>{contactedBuyerModal?.crop_name}</strong>. Target price pegged at <strong>₹{contactedBuyerModal?.target_price} / {contactedBuyerModal?.unit}</strong>.
              </p>
            </div>
          </div>

          <div className="space-y-2 border border-gray-100 p-3 rounded-lg bg-gray-50/50">
            <div className="flex justify-between">
              <span className="text-gray-500">Target Volume:</span>
              <strong>{contactedBuyerModal?.quantity} {contactedBuyerModal?.unit}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Hub:</span>
              <strong>{contactedBuyerModal?.delivery_location}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Required By:</span>
              <strong>{contactedBuyerModal?.required_by ? new Date(contactedBuyerModal.required_by).toLocaleDateString() : "Immediate"}</strong>
            </div>
          </div>

          <div className="flex gap-2">
            <Link to="/sell" className="flex-1">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                Submit Direct Offer
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setContactedBuyerModal(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Transactions;