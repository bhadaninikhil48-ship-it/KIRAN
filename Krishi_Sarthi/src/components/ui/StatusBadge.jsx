import Badge from "./Badge";

export function StatusBadge({ status, className = "" }) {
  const normalized = (status || "").toLowerCase().trim();

  const getVariant = (norm) => {
    switch (norm) {
      case "accepted":
      case "confirmed":
      case "delivered":
      case "received":
      case "resolved":
      case "active":
      case "ready":
        return "emerald";
      case "in transit":
      case "transport":
      case "processing":
      case "listening":
      case "under review":
        return "blue";
      case "pending":
      case "negotiation":
      case "negotiating":
      case "pickup":
        return "amber";
      case "rejected":
      case "cancelled":
      case "disputed":
      case "error":
        return "red";
      default:
        return "neutral";
    }
  };

  return (
    <Badge variant={getVariant(normalized)} dot size="sm" className={className}>
      {status}
    </Badge>
  );
}

export default StatusBadge;
