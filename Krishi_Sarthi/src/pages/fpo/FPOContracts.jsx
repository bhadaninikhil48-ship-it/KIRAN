import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { CropImage } from "../../components/ui/CropImage";
import { LoadingState } from "../../components/ui/LoadingState";
import {
  ReceiptText,
  ShieldCheck,
  Calendar,
  MapPin,
  RefreshCw,
  Building,
  Mail,
  AlertCircle,
  PackageCheck,
  FileCheck,
  Truck,
} from "lucide-react";

export function FPOContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/fpo/contracts");
      setContracts(res.contracts || []);
    } catch (err) {
      console.error("Error loading FPO contracts:", err);
      setError(err.message || "Failed to load contracts.");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              FPO Binding Trade Contracts
            </h1>
            <Badge variant="emerald" dot>
              Digital Deeds
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Finalized digital sale deeds with verified buyers. Lock in guaranteed procurement terms and settlement values.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button size="sm" variant="outline" icon={RefreshCw} onClick={loadContracts}>
            Refresh
          </Button>
          <Link to="/fpo/offers">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Check Active Bids
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Contracts Listing */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingState message="Loading your finalized contracts..." />
        </div>
      ) : contracts.length === 0 ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-gray-200">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ReceiptText size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No Finalized Contracts Yet</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              When an enterprise buyer accepts your offer, an enforceable digital deed will be minted here containing the final agreed terms.
            </p>
            <Link to="/fpo/marketplace">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Find Buyer Demands
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {contracts.map((contract) => (
            <Card key={contract.id} className="p-6 border-gray-200 hover:border-emerald-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-start gap-3.5">
                  <CropImage
                    crop={contract.crop_name}
                    size="card"
                    className="rounded-xl shadow-xs shrink-0 border border-gray-200 mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Contract #{contract.id}: {contract.crop_name} Consignment
                      </h2>
                      <StatusBadge status={contract.status === "active" ? "Confirmed" : contract.status || "Active"} />
                      {contract.lot_number && (
                        <Badge variant="purple">
                          Aggregated Lot: {contract.lot_number}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                      <span>Minted: {new Date(contract.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Offer #{contract.offer_id}</span>
                      <span>•</span>
                      <span>Demand #{contract.requirement_id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-baseline sm:items-end justify-between">
                  <span className="text-xs text-gray-400 uppercase">Total Contract Value</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                    ₹{Number(contract.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Terms Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-xs sm:text-sm">
                <div>
                  <span className="text-xs text-gray-400 block">Agreed Unit Rate</span>
                  <span className="font-bold text-gray-900 text-base">
                    ₹{Number(contract.agreed_price).toLocaleString()} / {contract.unit}
                  </span>
                  <span className="text-[11px] text-emerald-600 block mt-0.5">Final agreed terms</span>
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
                    <MapPin size={14} className="text-emerald-600 shrink-0" />
                    <span className="truncate">{contract.delivery_location || "Buyer Receiving Warehouse"}</span>
                  </span>
                  {contract.required_by && (
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      Required by: {new Date(contract.required_by).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                    Institutional Buyer
                  </span>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">{contract.buyer_name}</p>
                  {contract.buyer_email && (
                    <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                      <Mail size={11} /> {contract.buyer_email}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <PackageCheck size={14} className="text-emerald-600" />
                  <span>
                    FPO Collective Depot: <strong>{contract.aggregation_center || "Regional Hub"}</strong>
                  </span>
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

export default FPOContracts;
