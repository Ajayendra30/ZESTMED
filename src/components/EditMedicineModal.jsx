// src/components/EditMedicineModal.jsx
import React from 'react';
import MedicineFormModal from './MedicineFormModal';

export default function EditMedicineModal({ isOpen = true, onClose, medicine, onSaveMedicine }) {
  if (!isOpen || !medicine) return null;

  return (
    <MedicineFormModal
      isOpen={isOpen}
      onClose={onClose}
      medicine={medicine}
      onSave={async (updated) => {
        if (onSaveMedicine) {
          return await onSaveMedicine(updated);
        }
      }}
    />
  );
}
