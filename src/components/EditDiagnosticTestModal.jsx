// src/components/EditDiagnosticTestModal.jsx
import React from 'react';
import DiagnosticTestFormModal from './DiagnosticTestFormModal';

export default function EditDiagnosticTestModal({ isOpen = true, onClose, test, onSaveTest }) {
  if (!isOpen || !test) return null;

  return (
    <DiagnosticTestFormModal
      isOpen={isOpen}
      onClose={onClose}
      test={test}
      onSave={(updated) => {
        if (onSaveTest) {
          onSaveTest(updated);
        }
      }}
    />
  );
}
