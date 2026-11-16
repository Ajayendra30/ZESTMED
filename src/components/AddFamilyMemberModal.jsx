// src/components/AddFamilyMemberModal.jsx
import React, { useState } from 'react';
import { X, UserPlus, Heart, AlertCircle, Shield } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AddFamilyMemberModal({ isOpen = true, onClose, onAddMember }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    relation: 'Child',
    age: '',
    gender: 'Male',
    bloodGroup: 'B+',
    conditions: '',
    allergies: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.age) {
      addToast('Please enter full name and valid age.', 'error');
      return;
    }

    const newMember = {
      id: `fam-${Date.now()}`,
      name: formData.name.trim(),
      relation: formData.relation,
      age: parseInt(formData.age, 10),
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      conditions: formData.conditions.trim() || 'None reported',
      allergies: formData.allergies.trim() || 'None reported',
      isPrimary: false
    };

    onAddMember(newMember);
    addToast(`${newMember.name} (${newMember.relation}) added to your family profiles.`, 'success');
    onClose();
    // Reset form
    setFormData({
      name: '',
      relation: 'Child',
      age: '',
      gender: 'Male',
      bloodGroup: 'B+',
      conditions: '',
      allergies: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-modal border border-slate-200 overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Family Member</h3>
              <p className="text-[11px] text-primary-100">Manage medicine orders & lab test reports together</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ananya Verma"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Relationship *</label>
              <select
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 bg-white"
              >
                <option value="Spouse">Spouse</option>
                <option value="Child">Child (Son/Daughter)</option>
                <option value="Parent">Parent (Father/Mother)</option>
                <option value="Sibling">Sibling (Brother/Sister)</option>
                <option value="Other">Other Dependent</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Age (Years) *</label>
              <input
                type="number"
                min="0"
                max="120"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 8"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 bg-white font-mono"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Pre-existing Health Conditions (Optional)
            </label>
            <input
              type="text"
              value={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
              placeholder="e.g. Asthma, High BP, Diabetes"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Known Drug / Food Allergies (Optional)
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="e.g. Penicillin, Aspirin, Peanuts"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800"
            />
            <p className="text-[10.5px] text-slate-500 mt-1">
              Allergy records help our pharmacists verify cross-reactive drug warnings.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-5 font-bold shadow-sm"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
