// src/components/FAQ.jsx
import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqsLeft = [
    {
      q: 'How can I order medicines from ZESTMED?',
      a: 'You can order medicines easily by searching for your required medicine, adding it to your cart, and proceeding to checkout. If required, you can also upload a valid doctor\'s prescription for pharmacist verification.'
    },
    {
      q: 'Do I need a prescription to buy all medicines?',
      a: 'Over-the-counter (OTC) medicines, health supplements, and wellness items do not require a prescription. However, Schedule H and prescription-only medications require a valid doctor\'s prescription.'
    },
    {
      q: 'How does home sample collection work?',
      a: 'A certified and vaccinated phlebotomist visits your home at your scheduled morning slot with sterilized vacutainer collection kits, collects the sample safely, and transports it in temperature-controlled cold-chain boxes.'
    }
  ];

  const faqsRight = [
    {
      q: 'When will I get my diagnostic test reports?',
      a: 'Most routine blood test reports (CBC, Thyroid, Lipid Profile) are available within 6 to 12 hours. You can view and download your digital report directly from your Patient Dashboard.'
    },
    {
      q: 'Are the medicines genuine and safe?',
      a: 'Yes, 100% genuine. All medicines and medical supplies are sourced directly from licensed pharmaceutical distributors and manufacturers with strict batch numbers and expiry checks.'
    },
    {
      q: 'Can I book tests for my family members?',
      a: 'Yes! You can add family members to your ZESTMED account and book lab tests, home collections, or health packages for any member with separate individual health records.'
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked <span className="text-[#005CB9]">Questions (FAQs)</span>
          </h2>
          <a
            href="#faq"
            onClick={(e) => e.preventDefault()}
            className="text-sm sm:text-base font-bold text-[#005CB9] hover:underline flex items-center gap-1.5 transition"
          >
            <span>View All FAQs</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>

        {/* 2 Columns with 6 Accordion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Column */}
          <div className="space-y-5">
            {faqsLeft.map((faq, idx) => {
              const isOpen = openIndex === `L-${idx}`;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border-2 border-slate-100 bg-white overflow-hidden transition-all shadow-sm hover:border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(`L-${idx}`)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <span className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#005CB9]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {faqsRight.map((faq, idx) => {
              const isOpen = openIndex === `R-${idx}`;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border-2 border-slate-100 bg-white overflow-hidden transition-all shadow-sm hover:border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(`R-${idx}`)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <span className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#005CB9]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
