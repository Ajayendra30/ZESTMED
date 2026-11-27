// src/components/AddMedicineModal.jsx
import React from 'react';
import MedicineFormModal from './MedicineFormModal';

export default function AddMedicineModal({ isOpen, onClose, onAddMedicine }) {
  if (!isOpen) return null;

  return (
    <MedicineFormModal
      isOpen={isOpen}
      onClose={onClose}
      medicine={null}
      onSave={(newMed) => {
        if (onAddMedicine) {
          onAddMedicine(newMed);
        }
      }}
    />
  );
}
