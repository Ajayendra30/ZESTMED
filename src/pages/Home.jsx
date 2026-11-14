// src/pages/Home.jsx
// Complete combined ZESTMED homepage following the exact specifications from Image 1 and Image 2
import React, { useState } from 'react';
import Hero from '../components/Hero';
import SearchSection from '../components/SearchSection';
import HealthcareCategories from '../components/HealthcareCategories';
import PopularMedicinesAndTests from '../components/PopularMedicinesAndTests';
import HomeFeaturesOverview from '../components/HomeFeaturesOverview';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import ProductDetailModal from '../components/ProductDetailModal';
import TestDetailModal from '../components/TestDetailModal';
import PackageDetailModal from '../components/PackageDetailModal';
import PrescriptionUploadModal from '../components/PrescriptionUploadModal';

export default function Home({ isPrescriptionModalOpen, setPrescriptionModalOpen, searchInputRef }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handleOpenPrescription = () => {
    setPrescriptionModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* ======================================================== */}
      {/* PART 1: FIRST REFERENCE IMAGE CONTENT (Top to Bottom)    */}
      {/* ======================================================== */}

      {/* 1. Hero Section with healthcare professionals & CTAs */}
      <Hero />

      {/* 2. Medicine / Lab Test / Health Packages Search Panel */}
      <SearchSection
        searchInputRef={searchInputRef}
        onSelectProduct={(product) => setSelectedProduct(product)}
        onSelectTest={(test) => setSelectedTest(test)}
        onSelectPackage={(pkg) => setSelectedPackage(pkg)}
      />

      {/* 3. Healthcare Categories Strip */}
      <HealthcareCategories />

      {/* 4. Popular Medicines & Diagnostic Tests */}
      <PopularMedicinesAndTests
        onSelectProduct={(product) => setSelectedProduct(product)}
        onSelectTest={(test) => setSelectedTest(test)}
        onSelectPackage={(pkg) => setSelectedPackage(pkg)}
      />

      {/* 5. Health Checkup Packages, How It Works, Why Choose ZESTMED & Home Sample Collection */}
      <HomeFeaturesOverview
        onSelectPackage={(pkg) => setSelectedPackage(pkg)}
      />

      {/* 6. What Our Customers Say? – Testimonials (3 cards) */}
      <Testimonials />

      {/* 5. Frequently Asked Questions (FAQs) (6 accordion cards) */}
      <FAQ />

      {/* ======================================================== */}
      {/* CONNECTED INTERACTIVE MODALS                             */}
      {/* ======================================================== */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <TestDetailModal
        test={selectedTest}
        onClose={() => setSelectedTest(null)}
      />

      <PackageDetailModal
        pkg={selectedPackage}
        onClose={() => setSelectedPackage(null)}
      />

      <PrescriptionUploadModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
      />
    </main>
  );
}
