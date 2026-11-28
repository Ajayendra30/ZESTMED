// src/components/AddDiagnosticTestModal.jsx
import React from 'react';
import DiagnosticTestFormModal from './DiagnosticTestFormModal';

export default function AddDiagnosticTestModal({ isOpen = true, onClose, onAddTest }) {
  if (!isOpen) return null;

  return (
    <DiagnosticTestFormModal
      isOpen={isOpen}
      onClose={onClose}
      test={null}
      onSave={async (newTest) => {
        if (onAddTest) {
          return await onAddTest(newTest);
        }
      }}
    />
  );
}
