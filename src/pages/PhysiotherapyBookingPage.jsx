// src/pages/PhysiotherapyBookingPage.jsx
import React from 'react';
import PhysiotherapyDetailPage from './PhysiotherapyDetailPage';

export default function PhysiotherapyBookingPage() {
  // Seamlessly delegates to the complete 5-step user journey starting at Step 2 (Booking & Patient Details)
  return <PhysiotherapyDetailPage initialStep={2} />;
}
