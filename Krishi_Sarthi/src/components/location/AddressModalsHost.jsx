import { useAddresses } from "../../context/AddressContext";
import { AddressManagerModal } from "./AddressManagerModal";
import { AddAddressModal } from "./AddAddressModal";

export function AddressModalsHost() {
  const {
    isManagerOpen,
    closeAddressManager,
    isAddModalOpen,
    closeAddAddress,
    addModalInitialMode,
  } = useAddresses();

  return (
    <>
      {isManagerOpen && (
        <AddressManagerModal
          isOpen={isManagerOpen}
          onClose={closeAddressManager}
        />
      )}
      {isAddModalOpen && (
        <AddAddressModal
          isOpen={isAddModalOpen}
          onClose={closeAddAddress}
          initialMode={addModalInitialMode}
        />
      )}
    </>
  );
}

export default AddressModalsHost;
