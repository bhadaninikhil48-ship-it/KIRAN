/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import api from "../services/api";

export const AddressContext = createContext(null);

export function AddressProvider({ children }) {
  const { user, token } = useContext(AuthContext) || {};

  const [addresses, setAddresses] = useState(() => {
    try {
      if (user?.id) {
        const cached = localStorage.getItem(`kiran_addresses_${user.id}`);
        return cached ? JSON.parse(cached) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Active address selection for current workflow
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    try {
      return sessionStorage.getItem("kiran_selected_address_id") || null;
    } catch {
      return null;
    }
  });

  // Navigation / Return Context distinction: "normal" | "sell-new-crop"
  const [flowContext, setFlowContext] = useState("normal");

  // Modal display states
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialMode, setAddModalInitialMode] = useState(null); // 'current' | 'manual' | null
  const [onAddressCreatedCallback, setOnAddressCreatedCallback] = useState(null);

  // Preserve form data for Sell New Crop or other forms
  const [preservedSellForm, setPreservedSellForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem("kiran_preserved_sell_form");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Synchronize cache when addresses update
  const syncLocalCache = (userId, newAddresses) => {
    if (userId) {
      try {
        localStorage.setItem(`kiran_addresses_${userId}`, JSON.stringify(newAddresses));
      } catch (e) {
        console.warn("Could not write addresses to local cache", e);
      }
    }
  };

  // Fetch addresses from backend
  const fetchAddresses = useCallback(async () => {
    if (!token || !user?.id) return [];
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/addresses");
      const list = res?.addresses || [];
      setAddresses(list);
      syncLocalCache(user.id, list);
      return list;
    } catch (err) {
      console.warn("Could not fetch remote addresses, using cache:", err.message);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  // Load addresses on auth change
  useEffect(() => {
    let active = true;
    if (token && user?.id) {
      (async () => {
        try {
          const res = await api.get("/api/addresses");
          if (active) {
            const list = res?.addresses || [];
            setAddresses(list);
            syncLocalCache(user.id, list);
          }
        } catch (err) {
          if (active) {
            console.warn("Could not fetch remote addresses, using cache:", err.message);
            setError(err.message);
          }
        }
      })();
    } else {
      const timer = setTimeout(() => {
        setAddresses([]);
        setSelectedAddressId(null);
      }, 0);
      return () => clearTimeout(timer);
    }
    return () => {
      active = false;
    };
  }, [token, user?.id]);

  // Derive default address (is_default === 1 or first address)
  const defaultAddress = addresses.find((a) => Boolean(a.is_default)) || addresses[0] || null;

  // Derive currently selected address
  const selectedAddress =
    addresses.find((a) => String(a.id) === String(selectedAddressId)) ||
    defaultAddress;

  // Set active selection
  const selectAddress = (addressOrId) => {
    const id = typeof addressOrId === "object" ? addressOrId?.id : addressOrId;
    setSelectedAddressId(id ? String(id) : null);
    try {
      if (id) {
        sessionStorage.setItem("kiran_selected_address_id", String(id));
      } else {
        sessionStorage.removeItem("kiran_selected_address_id");
      }
    } catch (e) {
      console.warn("Session storage unavailable", e);
    }
  };

  // Add address
  const addAddress = async (addressData) => {
    try {
      setError(null);
      const res = await api.post("/api/addresses", addressData);
      const newAddress = res?.address;
      if (newAddress) {
        const updated = [newAddress, ...addresses.filter((a) => a.id !== newAddress.id)];
        if (newAddress.is_default) {
          updated.forEach((a) => {
            if (a.id !== newAddress.id) a.is_default = 0;
          });
        }
        setAddresses(updated);
        syncLocalCache(user?.id, updated);
        selectAddress(newAddress.id);
        return newAddress;
      }
      return null;
    } catch (err) {
      console.error("Failed to add address:", err);
      setError(err.message || "Failed to save address");
      throw err;
    }
  };

  // Remove address
  const removeAddress = async (id) => {
    try {
      setError(null);
      await api.delete(`/api/addresses/${id}`);
      const updated = addresses.filter((a) => a.id !== id);
      setAddresses(updated);
      syncLocalCache(user?.id, updated);
      if (String(selectedAddressId) === String(id)) {
        selectAddress(updated[0]?.id || null);
      }
      return true;
    } catch (err) {
      console.error("Failed to remove address:", err);
      setError(err.message || "Failed to delete address");
      throw err;
    }
  };

  // Set default address
  const setAsDefault = async (id) => {
    try {
      setError(null);
      await api.patch(`/api/addresses/${id}/default`);
      const updated = addresses.map((a) => ({
        ...a,
        is_default: a.id === id ? 1 : 0,
      }));
      setAddresses(updated);
      syncLocalCache(user?.id, updated);
      selectAddress(id);
      return true;
    } catch (err) {
      console.error("Failed to set default address:", err);
      setError(err.message);
      throw err;
    }
  };

  // Open Address Manager (Flipkart-style selection modal)
  const openAddressManager = (options = {}) => {
    setFlowContext(options.flowContext || "normal");
    setIsManagerOpen(true);
  };

  const closeAddressManager = () => {
    setIsManagerOpen(false);
  };

  // Open Add Address Modal (Current Location vs Manual)
  const openAddAddress = (options = {}) => {
    setFlowContext(options.flowContext || "normal");
    setAddModalInitialMode(options.mode || null);
    if (options.onSuccess) {
      setOnAddressCreatedCallback(() => options.onSuccess);
    } else {
      setOnAddressCreatedCallback(null);
    }
    setIsAddModalOpen(true);
  };

  const closeAddAddress = () => {
    setIsAddModalOpen(false);
    setAddModalInitialMode(null);
  };

  // Preserve form data for Sell New Crop
  const preserveSellFormData = (formData) => {
    setPreservedSellForm(formData);
    try {
      if (formData) {
        sessionStorage.setItem("kiran_preserved_sell_form", JSON.stringify(formData));
      } else {
        sessionStorage.removeItem("kiran_preserved_sell_form");
      }
    } catch (e) {
      console.warn("Session storage unavailable", e);
    }
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        defaultAddress,
        selectedAddress,
        loading,
        error,
        flowContext,
        setFlowContext,
        isManagerOpen,
        openAddressManager,
        closeAddressManager,
        isAddModalOpen,
        addModalInitialMode,
        openAddAddress,
        closeAddAddress,
        onAddressCreatedCallback,
        fetchAddresses,
        addAddress,
        removeAddress,
        setAsDefault,
        selectAddress,
        preservedSellForm,
        preserveSellFormData,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export { useAddresses } from "./useAddresses";
export default AddressContext;
