import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ReceiptText,
  ShieldCheck,
  Truck,
  FileCheck,
  Calendar,
  MapPin,
  PhoneCall,
  User,
  Info,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function BuyerContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/contracts/buyer");
      setContracts(res.contracts || []);
    } catch (err) {
      console.error("Error fetching buyer contracts:", err);
      setError("Failed to load your contracts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Legal Fulfillment Contracts
            </h1>
            <Badge variant="emerald" dot>
              Binding Digital Deeds
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Enforceable digital trade agreements generated upon offer acceptance with complete fulfillment tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            icon={RefreshCw}
            onClick={loadContracts}
          >
            Refresh
          </Button>
          <Link to="/buyer/offers">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Browse Farmer Offers
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
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
              <ReceiptText size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No Contracts Generated Yet</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              When you accept a farmer's offer, a legally binding contract will be minted instantly with delivery terms, agreed unit rate, and total payable amount.
            </p>
            <Link to="/buyer/offers">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Review Incoming Offers
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {contracts.map((contract) => (
            <Card key={contract.id} className="p-6 border-gray-200 hover:border-emerald-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Contract #{contract.id}: {contract.crop_name} Consignment
                    </h2>
                    <StatusBadge status={contract.status === "active" ? "Confirmed" : contract.status || "Active"} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                    <span>Generated: {new Date(contract.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Offer #{contract.offer_id}</span>
                    <span>•</span>
                    <span>Requirement #{contract.requirement_id}</span>
                  </p>
                </div>

                <div className="flex sm:flex-col items-baseline sm:items-end justify-between">
                  <span className="text-xs text-gray-400 uppercase">Total Contract Value</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                    ₹{Number(contract.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-xs sm:text-sm">
                <div>
                  <span className="text-xs text-gray-400 block">Agreed Rate</span>
                  <span className="font-bold text-gray-900 text-base">
                    ₹{Number(contract.agreed_price).toLocaleString()} / {contract.unit}
                  </span>
                  <span className="text-[11px] text-emerald-600 block mt-0.5">Fixed rate deed</span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 block">Contracted Volume</span>
                  <span className="font-bold text-gray-900 text-base">
                    {Number(contract.quantity).toLocaleString()} {contract.unit}
                  </span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Grade: {contract.quality_grade || "Grade A"}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 block">Delivery Destination</span>
                  <span className="font-bold text-gray-900 text-base flex items-center gap-1">
                    <MapPin size={14} className="text-emerald-600" />
                    {contract.delivery_location || "Buyer Warehouse"}
                  </span>
                  {contract.required_by && (
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      By: {new Date(contract.required_by).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Section 15 Payment notice */}
                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/70">
                  <span className="text-xs text-amber-800 block font-medium">Payment Settlement</span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <FileCheck size={16} className="text-amber-700" />
                    <span className="font-bold text-amber-800 text-xs">
                      Pending Gateway
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-amber-700 flex items-start gap-1">
                    <Info size={11} className="mt-0.5 flex-shrink-0" />
                    <span>Direct escrow payment integration pending backend support.</span>
                  </div>
                </div>
              </div>

              {/* Farmer Contact & Counterpart Footer */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={14} className="text-emerald-600" />
                  <span>
                    Seller: <strong className="text-gray-800">{contract.farmer_name || "Enrolled Farmer"}</strong>
                    {contract.farmer_district && ` (${contract.farmer_district}, ${contract.farmer_state || ""})`}
                  </span>
                  {contract.farmer_phone && (
                    <span className="text-emerald-700 font-medium flex items-center gap-1 ml-2">
                      <PhoneCall size={12} /> {contract.farmer_phone}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link to="/support">
                    <Button size="xs" variant="outline" icon={ShieldCheck}>
                      Dispute Support
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuyerContracts;
