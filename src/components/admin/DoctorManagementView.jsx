// src/components/admin/DoctorManagementView.jsx
import React, { useState } from 'react';
import { 
  Stethoscope, Search, Plus, Filter, Calendar, Clock, 
  MapPin, CheckCircle2, Award, Phone, Mail, Edit, Trash2, 
  ExternalLink, UserCheck, ShieldCheck
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function DoctorManagementView({
  doctorAppointments = [],
  onUpdateStatus,
  onViewBooking
}) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' or 'schedule'
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  // Real Doctors Directory
  const [doctorsList, setDoctorsList] = useState([
    {
      id: 'DOC-01',
      name: 'Dr. Arindam Sharma',
      qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
      specialty: 'Cardiology',
      experience: '16 Years',
      hospital: 'Zestmed Polyclinic Hub (Dispur)',
      opdDays: 'Mon, Wed, Fri',
      opdTime: '10:00 AM - 02:00 PM',
      fee: 800,
      phone: '+91 94350 88210',
      email: 'dr.sharma@zestmed.in',
      isAvailable: true,
      rating: 4.9,
      totalPatients: 1420
    },
    {
      id: 'DOC-02',
      name: 'Dr. N. Bora',
      qualification: 'MBBS, MD (Pathology & Lab Diagnostics)',
      specialty: 'Pathology & Diagnostics',
      experience: '18 Years',
      hospital: 'Zestmed Central Diagnostic Lab (GS Road)',
      opdDays: 'Daily (Mon - Sat)',
      opdTime: '08:30 AM - 01:30 PM',
      fee: 600,
      phone: '+91 94350 11982',
      email: 'dr.bora@zestmed.in',
      isAvailable: true,
      rating: 4.9,
      totalPatients: 2890
    },
    {
      id: 'DOC-03',
      name: 'Dr. Priyadarshini Das',
      qualification: 'MBBS, MS (Orthopedics), MCh (Joint Replacement)',
      specialty: 'Orthopedics',
      experience: '12 Years',
      hospital: 'Zestmed SuperSpecialty Hub (Dispur)',
      opdDays: 'Tue, Thu, Sat',
      opdTime: '11:00 AM - 03:00 PM',
      fee: 750,
      phone: '+91 98640 44219',
      email: 'dr.pdas@zestmed.in',
      isAvailable: true,
      rating: 4.8,
      totalPatients: 980
    },
    {
      id: 'DOC-04',
      name: 'Dr. Rohit Agarwala',
      qualification: 'MBBS, MD, DNB (Neurology)',
      specialty: 'Neurology',
      experience: '14 Years',
      hospital: 'Zestmed Central Polyclinic (GS Road)',
      opdDays: 'Mon, Thu',
      opdTime: '02:00 PM - 06:00 PM',
      fee: 900,
      phone: '+91 91270 33819',
      email: 'dr.rohit@zestmed.in',
      isAvailable: true,
      rating: 4.9,
      totalPatients: 840
    },
    {
      id: 'DOC-05',
      name: 'Dr. Meenakshi Barua',
      qualification: 'MBBS, MD, DGO (Obstetrics & Gynecology)',
      specialty: 'Gynecology',
      experience: '11 Years',
      hospital: 'Zestmed Women Care Center (Dispur)',
      opdDays: 'Mon, Wed, Sat',
      opdTime: '09:30 AM - 01:30 PM',
      fee: 700,
      phone: '+91 94355 66712',
      email: 'dr.barua@zestmed.in',
      isAvailable: true,
      rating: 4.8,
      totalPatients: 1120
    },
    {
      id: 'DOC-06',
      name: 'Dr. Debajit Kalita',
      qualification: 'MBBS, MD (General Medicine), Post Grad Diabetology',
      specialty: 'Diabetology & General Medicine',
      experience: '10 Years',
      hospital: 'Zestmed Polyclinic Hub (Dispur)',
      opdDays: 'Mon - Fri',
      opdTime: '04:00 PM - 08:00 PM',
      fee: 600,
      phone: '+91 97060 12890',
      email: 'dr.kalita@zestmed.in',
      isAvailable: true,
      rating: 4.7,
      totalPatients: 1650
    }
  ]);

  const toggleDoctorAvailability = (docId) => {
    setDoctorsList(prev => prev.map(d => {
      if (d.id === docId) {
        const next = !d.isAvailable;
        addToast(`${d.name} marked as ${next ? 'Available' : 'On Leave'}`, next ? 'success' : 'info');
        return { ...d, isAvailable: next };
      }
      return d;
    }));
  };

  const filteredDoctors = doctorsList.filter(d => {
    const matchesSpec = specialtyFilter === 'all' || d.specialty.toLowerCase().includes(specialtyFilter.toLowerCase());
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.qualification.toLowerCase().includes(q) ||
      d.hospital.toLowerCase().includes(q);
    return matchesSpec && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Stethoscope className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Doctor Management
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
              {doctorsList.length} Specialists
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage senior clinical consultants, OPD schedules, clinic affiliations, and live appointment queues.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'directory' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doctors Directory
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'schedule' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>OPD Appointments</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700">
              {doctorAppointments.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctor, specialty, clinic..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
              >
                <option value="all">All Specialties</option>
                <option value="cardio">Cardiology</option>
                <option value="patho">Pathology</option>
                <option value="ortho">Orthopedics</option>
                <option value="neuro">Neurology</option>
                <option value="gyne">Gynecology</option>
                <option value="diabet">Diabetology</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => addToast('Add Doctor Modal - Fill doctor details and save', 'info')}
              className="px-3.5 py-1.5 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Doctor</span>
            </button>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doc) => (
              <div key={doc.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-blue-200 transition">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {doc.name.split(' ').slice(1).map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{doc.name}</h4>
                        <span className="text-[11px] font-bold text-teal-700 block">{doc.specialty}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleDoctorAvailability(doc.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition cursor-pointer ${
                        doc.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {doc.isAvailable ? '● Available' : '○ On Leave'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-2 font-medium">{doc.qualification}</p>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 mb-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Experience:</span>
                      <strong className="text-slate-800">{doc.experience}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Consultation Fee:</span>
                      <strong className="text-teal-700 font-mono">₹{doc.fee}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">OPD Days:</span>
                      <span className="text-slate-800 font-semibold">{doc.opdDays}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">OPD Hours:</span>
                      <span className="font-mono text-slate-700 text-[10px]">{doc.opdTime}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[150px]">{doc.hospital}</span>
                  </span>
                  <a
                    href={`tel:${doc.phone}`}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                    title="Call Clinic"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* OPD Appointments Table */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Appointment #</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Consultant Doctor</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Fee / Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {doctorAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No doctor appointments scheduled.
                    </td>
                  </tr>
                ) : (
                  doctorAppointments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {a.id || a.appointment_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{a.patientName || a.patient_name}</div>
                        <div className="text-[10px] text-slate-400">{a.patientPhone || a.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {a.doctor || a.doctorName || a.doctor_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                          {a.specialty || a.department || 'General Medicine'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>{a.date || a.appointment_date}</div>
                        <div className="text-[11px] font-mono text-teal-700 font-bold">{a.time || a.appointment_time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-black text-slate-900">₹{a.fee || a.fees || 600}</div>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700">
                          {a.status || 'Confirmed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {onViewBooking && (
                          <button
                            type="button"
                            onClick={() => onViewBooking(a, 'doctor')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
