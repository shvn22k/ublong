"use client";

import React, { useState } from "react";
import { User, Calendar, MapPin, Users, Globe, FileText, Send } from "lucide-react";

export default function ChildRegistrationForm() {
  const [formData, setFormData] = useState({
    childName: "",
    dob: "",
    gender: "",
    fatherName: "",
    motherName: "",
    countryOfBirth: "",
    currentLocation: "",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would dispatch to backend or context
    console.log("Submitting form data:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        childName: "", dob: "", gender: "", fatherName: "", motherName: "", countryOfBirth: "", currentLocation: "", notes: ""
      });
    }, 4000);
  };

  return (
    <section className="py-24 px-6 bg-background" id="registration-form">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            Initiate Case
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-teal-50 tracking-tight mb-4">
            Child Registration Intake
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 font-medium">
            Provide the necessary details below to start the legal identity recovery process. Our AI agents will use this information to determine the correct legal pathway.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
          {submitted ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 z-10 text-center px-6">
              <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
                <Send className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-teal-50 mb-3">
                Intake Received
              </h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-md">
                We have securely received the child&apos;s information. The AI legal agents are now analyzing the jurisdiction and required documents.
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Child Details */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-teal-50 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <User className="w-5 h-5 text-primary" /> Child Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name</label>
                  <input required type="text" name="childName" value={formData.childName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="Enter child's full name" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gender</label>
                    <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Parents Details */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-teal-50 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Users className="w-5 h-5 text-accent" /> Parent Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mother&apos;s Full Name</label>
                  <input required type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all" placeholder="Enter mother's full name" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Father&apos;s Full Name</label>
                  <input required type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all" placeholder="Enter father's full name" />
                </div>
              </div>
            </div>

            {/* Geography */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-teal-50 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Globe className="w-5 h-5 text-secondary" /> Geographical Context
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Country of Birth</label>
                  <select required name="countryOfBirth" value={formData.countryOfBirth} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all">
                    <option value="">Select Country</option>
                    <option value="Syria">Syria</option>
                    <option value="Afghanistan">Afghanistan</option>
                    <option value="South Sudan">South Sudan</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Myanmar">Myanmar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required type="text" name="currentLocation" value={formData.currentLocation} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all" placeholder="City, Country or Camp Name" />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-teal-50 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <FileText className="w-5 h-5 text-slate-500" /> Additional Notes
              </h3>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none transition-all resize-none" placeholder="Include any relevant details about missing documents, displacement timeline, etc."></textarea>
            </div>

            <button type="submit" className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold tracking-wide shadow-lg shadow-primary/30 transition-all hover:-translate-y-1">
              Submit Case for Analysis
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
