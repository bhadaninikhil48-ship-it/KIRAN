import { useState } from "react";
import {
  Star,
  AlertCircle,
  CheckCircle2,
  Send,
  Truck,
  UserCheck,
} from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";

export function TrustSupport() {
  const [buyerRating, setBuyerRating] = useState(4);
  const [buyerHoverRating, setBuyerHoverRating] = useState(0);
  const [buyerRatingSubmitted, setBuyerRatingSubmitted] = useState(false);

  const [transporterRating, setTransporterRating] = useState(5);
  const [transporterHoverRating, setTransporterHoverRating] = useState(0);
  const [transporterSubmitted, setTransporterSubmitted] = useState(false);

  const [showComplaint, setShowComplaint] = useState(false);
  const [issueType, setIssueType] = useState("Payment Delay");
  const [txnRef, setTxnRef] = useState("KS-TXN-2026-0482");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("High");

  // Submitted ticket state
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Demo History
  const [history, setHistory] = useState([
    {
      id: "KS-2026-001",
      txn: "KS-TXN-2026-0482",
      type: "Payment Delay",
      date: "12 Sep 2026",
      status: "Under Review",
      eta: "Within 24 Hours",
    },
    {
      id: "KS-2025-089",
      txn: "KS-TXN-2025-9122",
      type: "Delayed Transport Detention",
      date: "14 Aug 2025",
      status: "Resolved",
      eta: "Compensated ₹1,200",
    },
    {
      id: "KS-2025-042",
      txn: "KS-TXN-2025-3011",
      type: "Weighment Discrepancy",
      date: "03 May 2025",
      status: "Resolved",
      eta: "Weight Rectified (40 kg adjustment)",
    },
  ]);

  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    const newTicket = {
      id: `KS-2026-${String(history.length + 1).padStart(3, "0")}`,
      txn: txnRef,
      type: issueType,
      date: "Today",
      status: "Under Review",
      eta: "Within 24 Hours",
    };
    setSubmittedTicket(newTicket);
    setHistory([newTicket, ...history]);
    setShowComplaint(false);
    setDescription("");
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Trust, Ratings & Dispute Support
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Escrow protection, impartial quality dispute resolution, and counterpart trust ratings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="emerald" dot>
            Kisan Ombudsman Active
          </Badge>
        </div>
      </div>

      {/* Top 2 Columns: Buyer Rating & Transporter Rating */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Buyer Rating Card */}
        <Card className="border-gray-200/90">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Rate Your Buyer
                </h3>
                <Badge variant="emerald">Recent Deal</Badge>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                FreshMart Logistics • Order #KS-TXN-2026-0482
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <span className="text-xs text-gray-500 block">
              How satisfied were you with weighment accuracy and payment speed?
            </span>

            {/* Interactive Stars */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} star`}
                  onMouseEnter={() => setBuyerHoverRating(star)}
                  onMouseLeave={() => setBuyerHoverRating(0)}
                  onClick={() => {
                    setBuyerRating(star);
                    setBuyerRatingSubmitted(true);
                  }}
                  className="p-1 text-2xl transition-transform hover:scale-115 focus:outline-none"
                >
                  <Star
                    size={26}
                    className={`${
                      (buyerHoverRating || buyerRating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-gray-700">
                {buyerRating}/5
                {buyerRating === 5
                  ? " (Excellent)"
                  : buyerRating === 4
                  ? " (Very Good)"
                  : buyerRating === 3
                  ? " (Satisfactory)"
                  : " (Needs Attention)"}
              </span>
            </div>

            {buyerRatingSubmitted && (
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 size={14} /> Buyer trust score updated successfully!
              </p>
            )}
          </div>
        </Card>

        {/* Transporter Rating Card */}
        <Card className="border-gray-200/90">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Rate Consignment Transporter
                </h3>
                <Badge variant="blue">Logistics Partner</Badge>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Malwa Kisan Express (Truck MP-09-AB-1234)
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
              <Truck size={20} />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <span className="text-xs text-gray-500 block">
              Vehicle hygiene, transit temperature, and on-time farmgate arrival:
            </span>

            {/* Interactive Stars */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate transporter ${star} star`}
                  onMouseEnter={() => setTransporterHoverRating(star)}
                  onMouseLeave={() => setTransporterHoverRating(0)}
                  onClick={() => {
                    setTransporterRating(star);
                    setTransporterSubmitted(true);
                  }}
                  className="p-1 text-2xl transition-transform hover:scale-115 focus:outline-none"
                >
                  <Star
                    size={26}
                    className={`${
                      (transporterHoverRating || transporterRating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-gray-700">
                {transporterRating}/5 (On-time Delivery)
              </span>
            </div>

            {transporterSubmitted && (
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 size={14} /> Transporter rating logged to FPO driver ledger.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Complaint / Dispute Section */}
      <Card className="border-gray-200/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Dispute Resolution & Grievance Cell
              </h3>
              <Badge variant="amber">Toll Free 1800-180-1551</Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Report payment delays, produce grading disputes, or transit damages for immediate mediation.
            </p>
          </div>

          <Button
            variant={showComplaint ? "outline" : "danger"}
            size="sm"
            onClick={() => setShowComplaint((prev) => !prev)}
            icon={AlertCircle}
          >
            {showComplaint ? "Close Form" : "Raise a Complaint"}
          </Button>
        </div>

        {/* Complaint Submission Form */}
        {showComplaint && (
          <form onSubmit={handleComplaintSubmit} className="pt-4 space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Associated Transaction"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                required
              >
                <option value="KS-TXN-2026-0482">#KS-TXN-2026-0482 (FreshMart • Tomato)</option>
                <option value="KS-TXN-2026-0410">#KS-TXN-2026-0410 (Indore Mandi • 500kg)</option>
                <option value="General">General / Platform Issue</option>
              </Select>

              <Select
                label="Dispute Category"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                required
              >
                <option value="Payment Delay">Payment Settlement Delay</option>
                <option value="Weighment Discrepancy">Weighment Discrepancy at Hub</option>
                <option value="Crop Quality Downgrade">Unjust Quality Downgrade</option>
                <option value="Transport Damage">In-transit Damage / Spoilage</option>
                <option value="Buyer Non-response">Buyer Cancelled / Unresponsive</option>
              </Select>

              <Select
                label="Urgency Level"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="High">High (Perishable Produce)</option>
                <option value="Critical">Critical (Funds Escrow Issue)</option>
                <option value="Normal">Normal Inquiry</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Detailed Description of Dispute
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="State exact details (e.g. Tomato weight verified at 800 kg on farm digital scale, but receiving dock logged 760 kg)..."
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowComplaint(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                icon={Send}
              >
                Submit Formal Complaint
              </Button>
            </div>
          </form>
        )}

        {/* Success Banner when ticket submitted */}
        {submittedTicket && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>Complaint Submitted Successfully</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/80 text-emerald-900">
              <div>
                <span className="text-emerald-700 text-[11px] block">Reference ID:</span>
                <strong className="font-mono">{submittedTicket.id}</strong>
              </div>
              <div>
                <span className="text-emerald-700 text-[11px] block">Status:</span>
                <span className="font-bold text-blue-700">{submittedTicket.status}</span>
              </div>
              <div>
                <span className="text-emerald-700 text-[11px] block">Resolution SLA:</span>
                <span>{submittedTicket.eta}</span>
              </div>
              <div>
                <span className="text-emerald-700 text-[11px] block">Assigned Mediator:</span>
                <span>FPO Grievance Desk</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              *Prototype demonstration value. KrishiSarthi locks buyer escrow deposits until disputes are officially cleared.
            </p>
          </div>
        )}
      </Card>

      {/* Transaction Grievance History */}
      <Card className="border-gray-200/90">
        <CardHeader
          title="Dispute & Grievance History"
          subtitle="Audit log of previous complaints, mediator actions, and escrow reimbursements."
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase font-semibold text-gray-500">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Transaction</th>
                <th className="py-3 px-4">Issue Category</th>
                <th className="py-3 px-4">Date Filed</th>
                <th className="py-3 px-4">Resolution Status</th>
                <th className="py-3 px-4">Outcome / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">
                    {h.id}
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-xs">
                    {h.txn}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {h.type}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {h.date}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={h.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-medium">
                    {h.eta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default TrustSupport;