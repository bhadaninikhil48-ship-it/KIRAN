import React, { useState, useRef, useEffect } from "react";
import {
  CheckCircle2,
  Truck,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  PhoneCall,
  FileCheck,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { animateReveal } from "../utils/animations";

export function Transactions() {
  const [deliveryStatus, setDeliveryStatus] = useState("Pending"); // Pending, In Transit, Delivered
  const [paymentStatus, setPaymentStatus] = useState("Pending"); // Pending, Processing, Received
  const [showBackupBuyers, setShowBackupBuyers] = useState(false);
  const [contactedBuyerModal, setContactedBuyerModal] = useState(null);

  const backupRef = useRef(null);

  useEffect(() => {
    if (showBackupBuyers && backupRef.current) {
      animateReveal(backupRef.current, { duration: 0.35 });
    }
  }, [showBackupBuyers]);

  // Timeline steps as specified in Section 14
  // Offer -> Accepted -> Transaction Created -> Transport -> Pickup -> Delivery -> Payment
  const getTimelineSteps = () => {
    const steps = [
      { id: "offer", label: "Offer", completed: true, current: false },
      { id: "accepted", label: "Accepted", completed: true, current: false },
      { id: "created", label: "Transaction Created", completed: true, current: false },
      {
        id: "transport",
        label: "Transport",
        completed: deliveryStatus === "In Transit" || deliveryStatus === "Delivered",
        current: deliveryStatus === "Pending",
      },
      {
        id: "pickup",
        label: "Pickup",
        completed: deliveryStatus === "In Transit" || deliveryStatus === "Delivered",
        current: deliveryStatus === "Pending",
      },
      {
        id: "delivery",
        label: "Delivery",
        completed: deliveryStatus === "Delivered",
        current: deliveryStatus === "In Transit",
      },
      {
        id: "payment",
        label: "Payment",
        completed: paymentStatus === "Received",
        current: deliveryStatus === "Delivered" && paymentStatus !== "Received",
      },
    ];
    return steps;
  };

  const timelineSteps = getTimelineSteps();

  const backupBuyersList = [
    {
      id: "b1",
      name: "Indore Fresh Buyers Consortium",
      crop: "Tomato (Grade A)",
      demand: "High",
      offeredPrice: 2490,
      payment: "2 Days Direct",
      distance: "28 km",
      reliability: 93,
    },
    {
      id: "b2",
      name: "Bhopal Agro Traders",
      crop: "Tomato (Grade A)",
      demand: "Medium",
      offeredPrice: 2420,
      payment: "3 Days",
      distance: "190 km",
      reliability: 84,
    },
    {
      id: "b3",
      name: "Malwa Agri Logistics Depot",
      crop: "Tomato (Grade A)",
      demand: "High",
      offeredPrice: 2460,
      payment: "Instant Escrow",
      distance: "35 km",
      reliability: 90,
    },
  ];

  const resetForDemo = () => {
    setDeliveryStatus("Pending");
    setPaymentStatus("Pending");
    setShowBackupBuyers(false);
  };

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
            onClick={resetForDemo}
          >
            Reset Demo Flow
          </Button>
        </div>
      </div>

      {/* Visual Status Progression Timeline (Section 14) */}
      <Card className="border-gray-200/90 overflow-hidden">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Contract Fulfillment Pipeline
            </h3>
            <p className="text-xs text-gray-500">
              Order #KS-TXN-2026-0482 • FreshMart Consignment
            </p>
          </div>
          <Badge variant="emerald" dot>
            Verified Deal
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
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                FreshMart Retail Consignment
              </h2>
              <StatusBadge status="Confirmed" />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Produce Lot: <strong>Tomato (Grade A)</strong> • 800 kg (8 Quintals) • Origin: Depalpur Cluster
            </p>
          </div>

          <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-1">
            <span className="text-xs text-gray-400 uppercase">Settlement Amount</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              ₹20,160
            </span>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-xs sm:text-sm">
          <div>
            <span className="text-xs text-gray-400 block">Unit Rate</span>
            <span className="font-bold text-gray-900 text-base">₹2,520 / q</span>
            <span className="text-[11px] text-emerald-600 block mt-0.5">₹20/q above MSP</span>
          </div>

          <div>
            <span className="text-xs text-gray-400 block">Total Consignment Volume</span>
            <span className="font-bold text-gray-900 text-base">800 kg</span>
            <span className="text-[11px] text-gray-500 block mt-0.5">Batch #KS-LOT-88</span>
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

          {/* Payment Interactive Stepper */}
          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200/70">
            <span className="text-xs text-gray-500 block font-medium">Payment Settlement</span>
            <div className="mt-1 flex items-center gap-1.5">
              <FileCheck size={16} className="text-emerald-600" />
              <span
                className={`font-bold ${
                  paymentStatus === "Received"
                    ? "text-emerald-700"
                    : paymentStatus === "Processing"
                    ? "text-blue-700"
                    : "text-amber-700"
                }`}
              >
                {paymentStatus}
              </span>
            </div>

            <div className="mt-2">
              {paymentStatus === "Pending" && (
                <button
                  type="button"
                  onClick={() => setPaymentStatus("Processing")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                  Process Payment <ArrowRight size={13} />
                </button>
              )}
              {paymentStatus === "Processing" && (
                <button
                  type="button"
                  onClick={() => setPaymentStatus("Received")}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-1"
                >
                  Confirm Payment <CheckCircle2 size={13} />
                </button>
              )}
              {paymentStatus === "Received" && (
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 size={13} /> Funds settled to Bank A/C
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Consignment dispatch scheduled via local FPO logistics partner (Demo status tracking).</span>
          <span className="text-gray-500">Transporter: Malwa Kisan Express (MP-09-AB-1234)</span>
        </div>
      </Card>

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
              If a buyer reneges or fails transit inspection, KrishiSarthi instantly mobilizes alternate pre-screened buyers within a 40 km radius so your perishables are never dumped.
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
              Pre-approved Backup Liquidation Channels
            </h4>

            <div className="space-y-3">
              {backupBuyersList.map((bb) => (
                <div
                  key={bb.id}
                  className="bg-white border border-gray-200 hover:border-amber-400 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-gray-900 text-sm sm:text-base">
                        {bb.name}
                      </h5>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {bb.reliability}% Reliability
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {bb.crop} • {bb.distance} away • Demand: <strong className="text-emerald-700">{bb.demand}</strong> • Settlement: {bb.payment}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">Offer Rate</span>
                      <span className="text-base sm:text-lg font-bold text-gray-900">
                        ₹{bb.offeredPrice}/q
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => setContactedBuyerModal(bb)}
                      icon={PhoneCall}
                    >
                      Connect Instantly
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Backup Buyer Feedback Modal */}
      <Modal
        isOpen={Boolean(contactedBuyerModal)}
        onClose={() => setContactedBuyerModal(null)}
        title="Backup Buyer Contacted!"
        subtitle={`Emergency reallocation routed to ${contactedBuyerModal?.name}`}
      >
        <div className="space-y-4 text-xs sm:text-sm text-gray-700">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
            <p className="font-semibold">Deal Recovery Protocol Initiated.</p>
            <p className="mt-1 text-xs text-emerald-800">
              Buyer dispatch agent has acknowledged lot availability. Offer pegged at <strong>₹{contactedBuyerModal?.offeredPrice}/q</strong>.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Target Lot:</span>
              <strong>800 kg Tomato (Grade A)</strong>
            </div>
            <div className="flex justify-between">
              <span>Pickup Vehicle:</span>
              <strong>Available within 3 hours</strong>
            </div>
            <div className="flex justify-between">
              <span>Payment Terms:</span>
              <strong>{contactedBuyerModal?.payment}</strong>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => setContactedBuyerModal(null)}
          >
            Acknowledge Reallocation
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Transactions;