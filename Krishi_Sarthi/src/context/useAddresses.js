import { useContext } from "react";
import { AddressContext } from "./AddressContext";

export function useAddresses() {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error("useAddresses must be used within an AddressProvider");
  }
  return context;
}

export default useAddresses;
