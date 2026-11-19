// src/pages/Home.jsx
// Complete combined ZESTMED homepage following the 11 major healthcare specifications
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import SearchSection from '../components/SearchSection';
import PopularMedicinesAndTests from '../components/PopularMedicinesAndTests';
import HomeFeaturesOverview from '../components/HomeFeaturesOverview';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import ProductDetailModal from '../components/ProductDetailModal';
import TestDetailModal from '../components/TestDetailModal';
import PackageDetailModal from '../components/PackageDetailModal';
import BookDoctorModal from '../components/BookDoctorModal';
import BookPhysioModal from '../components/BookPhysioModal';
import SeniorCitizenPickUpModal from '../components/SeniorCitizenPickUpModal';

export default function Home({ 
  searchInputRef,
  isDoctorModalOpen: externalDoctorOpen,
  setIsDoctorModalOpen: externalSetDoctorOpen,
  isPhysioModalOpen: externalPhysioOpen,
  setIsPhysioModalOpen: externalSetPhysioOpen,
  isSurgeryModalOpen: externalSurgeryOpen,
  setIsSurgeryModalOpen: externalSetSurgeryOpen,
  isSeniorPickupOpen: externalSeniorOpen,
  setIsSeniorPickupOpen: externalSetSeniorOpen
}) {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Local modal states fallback if not controlled externally
  const [localDoctorOpen, setLocalDoctorOpen] = useState(false);
  const [localPhysioOpen, setLocalPhysioOpen] = useState(false);
  const [localSeniorOpen, setLocalSeniorOpen] = useState(false);

  const isDoctorOpen = externalDoctorOpen !== undefined ? externalDoctorOpen : localDoctorOpen;
  const setDoctorOpen = externalSetDoctorOpen || setLocalDoctorOpen;

  const isPhysioOpen = externalPhysioOpen !== undefined ? externalPhysioOpen : localPhysioOpen;
  const setPhysioOpen = externalSetPhysioOpen || setLocalPhysioOpen;

  const isSeniorOpen = externalSeniorOpen !== undefined ? externalSeniorOpen : localSeniorOpen;
  const setSeniorOpen = externalSetSeniorOpen || setLocalSeniorOpen;

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero Section with Lab Tests in #1 Order & Single-Day Reports */}
      <Hero
        onOpenDoctorModal={() => setDoctorOpen(true)}
        onOpenPhysioModal={() => setPhysioOpen(true)}
        onOpenSurgeryModal={() => navigate('/surgery-packages')}
        onOpenSeniorPickup={() => setSeniorOpen(true)}
      />

      {/* 2. Medicine / Lab Test / Doctor / Physio Search Panel */}
      <SearchSection
        searchInputRef={searchInputRef}
        onSelectProduct={(product) => setSelectedProduct(product)}
        onSelectTest={(test) => setSelectedTest(test)}
        onSelectPackage={(pkg) => setSelectedPackage(pkg)}
        onOpenDoctorModal={() => setDoctorOpen(true)}
        onOpenPhysioModal={() => setPhysioOpen(true)}
        onOpenSurgeryModal={() => navigate('/surgery-packages')}
        onOpenSeniorPickup={() => setSeniorOpen(true)}
      />

      {/* 3. Popular Medicines & Diagnostic Tests */}
      <PopularMedicinesAndTests
        onSelectProduct={(product) => setSelectedProduct(product)}
        onSelectTest={(test) => setSelectedTest(test)}
        onSelectPackage={(pkg) => setSelectedPackage(pkg)}
      />

      {/* 5. Health Checkup Packages, How It Works, Why Choose ZESTMED & Home Sample Collection */}
      <HomeFeaturesOverview
        onSelectPackage={(pkg) => setSelectedPackage(pkg)}
        onOpenSeniorPickup={() => setSeniorOpen(true)}
      />

      {/* 6. What Our Customers Say? – Testimonials (3 cards) */}
      <Testimonials />

      {/* 7. Frequently Asked Questions (FAQs) (6 accordion cards) */}
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

      {/* 2. Book Doctor Modal */}
      <BookDoctorModal
        isOpen={isDoctorOpen}
        onClose={() => setDoctorOpen(false)}
        onOpenSeniorPickup={() => setSeniorOpen(true)}
      />

      {/* 3. Book Physiotherapist Modal */}
      <BookPhysioModal
        isOpen={isPhysioOpen}
        onClose={() => setPhysioOpen(false)}
        onOpenSeniorPickup={() => setSeniorOpen(true)}
      />

      {/* 8. Senior Citizen 10km Free Pick-up & Drop Modal */}
      <SeniorCitizenPickUpModal
        isOpen={isSeniorOpen}
        onClose={() => setSeniorOpen(false)}
      />
    </main>
  );
}
