"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { translations } from "@/locales/translations";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, FileText, Scan, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";

interface DocumentPreset {
  name: string;
  type: string;
  fileName: string;
  ocrMock: {
    childName: string;
    fatherName: string;
    motherName: string;
    birthDate: string;
    documentType: string;
    authority: string;
  };
}

const documentPresets: DocumentPreset[] = [
  {
    name: "Humanitarian Support",
    type: "Civil Registry Support Document",
    fileName: "humanitarian_civil_registration_support.pdf",
    ocrMock: {
      childName: "Farah Al-Saeed",
      fatherName: "Tariq Al-Saeed",
      motherName: "Layla Al-Saeed",
      birthDate: "12 October 2022",
      documentType: "Humanitarian Civil Registration Support Certificate",
      authority: "Joint Humanitarian Civil Registry Taskforce, Jordan",
    },
  },
  {
    name: "Hospital Birth Certificate",
    type: "Hospital Record",
    fileName: "hospital_notification_984.pdf",
    ocrMock: {
      childName: "Amira Al-Hasan",
      fatherName: "Yousef Al-Hasan",
      motherName: "Fatima Al-Hasan",
      birthDate: "14 August 2021",
      documentType: "Hospital Live Birth Notification Record",
      authority: "Al-Razi Maternity Ward, Aleppo, Syria",
    },
  },
  {
    name: "UNHCR Camp Card",
    type: "Refugee Card",
    fileName: "unhcr_registration_card.jpg",
    ocrMock: {
      childName: "Bashir Qasemi",
      fatherName: "Ahmad Qasemi",
      motherName: "Zuhra Qasemi",
      birthDate: "03 May 2019",
      documentType: "UNHCR Refugee Registration Record",
      authority: "Zaatari Camp Admin Center, Sector 4",
    },
  },
  {
    name: "Civil ID Copy",
    type: "Passport",
    fileName: "family_id_pass.jpg",
    ocrMock: {
      childName: "Mateo Silva",
      fatherName: "Carlos Silva",
      motherName: "Elena Silva",
      birthDate: "22 November 2020",
      documentType: "National Civil Register Birth Slip",
      authority: "Municipio de Cúcuta, Norte de Santander",
    },
  },
  {
    name: "Rejection Letter",
    type: "Rejection Letter",
    fileName: "civil_registry_denial_letter.pdf",
    ocrMock: {
      childName: "Amira Al-Hasan",
      fatherName: "Yousef Al-Hasan",
      motherName: "Fatima Al-Hasan",
      birthDate: "14 August 2021",
      documentType: "Official Rejection of Birth Certificate Application",
      authority: "Directorate of Civil Affairs, Damascus Division",
    },
  },
];

export default function DocumentGenerator() {
  const { language, caseStatus, setCaseStatus, setCaseData } = useApp();
  const t = translations[language];

  const [selectedPreset, setSelectedPreset] = useState<DocumentPreset | null>(null);
  const [scanStage, setScanStage] = useState<"idle" | "scanning" | "completed">("idle");
  const [boundingBoxes, setBoundingBoxes] = useState<{ x: string; y: string; w: string; h: string; label: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bounding boxes coordinates to render scanning simulation
  const mockBoxes = [
    { x: "10%", y: "15%", w: "40%", h: "6%", label: "DOCUMENT HEADER" },
    { x: "10%", y: "25%", w: "55%", h: "5%", label: "HOSPITAL IDENTITY" },
    { x: "12%", y: "38%", w: "35%", h: "5%", label: "CHILD NAME: AMIRA AL-HASAN" },
    { x: "12%", y: "48%", w: "30%", h: "5%", label: "DOB: 14/08/2021" },
    { x: "12%", y: "58%", w: "45%", h: "5%", label: "FATHER: YOUSEF AL-HASAN" },
    { x: "12%", y: "68%", w: "45%", h: "5%", label: "MOTHER: FATIMA AL-HASAN" },
    { x: "10%", y: "80%", w: "35%", h: "8%", label: "OFFICIAL REGISTRY STAMP" },
  ];

  // React to global simulator transitions
  useEffect(() => {
    if (caseStatus === "idle") {
      setScanStage("idle");
      setSelectedPreset(null);
      setBoundingBoxes([]);
    } else if (caseStatus === "ocr_scanning") {
      if (!selectedPreset) {
        setSelectedPreset(documentPresets[0]); // default preset if triggered globally
      }
      setScanStage("scanning");
      animateBoundingBoxes();
    } else if (caseStatus === "ocr_done") {
      setScanStage("completed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseStatus]);

  const animateBoundingBoxes = () => {
    setBoundingBoxes([]);
    mockBoxes.forEach((box, i) => {
      setTimeout(() => {
        setBoundingBoxes((prev) => [...prev, box]);
      }, i * 400 + 400);
    });
  };

  const handleSelectPreset = (preset: DocumentPreset) => {
    setSelectedPreset(preset);
    setScanStage("idle");
    setBoundingBoxes([]);
    
    // Auto initiate scanning sequence for that preset
    setCaseStatus("ocr_scanning");
    setCaseData((prev) => ({
      ...prev,
      familyFiles: [{ name: preset.fileName, type: preset.type }],
      childName: preset.ocrMock.childName,
      birthDate: preset.ocrMock.birthDate,
    }));

    setTimeout(() => {
      setCaseStatus("ocr_done");
      setCaseData((prev) => ({
        ...prev,
        ocrExtracted: preset.ocrMock,
      }));
    }, 3200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Helper to generate dynamic mock values based on the file name
    const baseName = file.name.split(".")[0].replace(/[-_]/g, " ");
    const formattedName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    
    const customPreset: DocumentPreset = {
      name: file.name,
      type: "Custom Uploaded File",
      fileName: file.name,
      ocrMock: {
        childName: formattedName.length > 5 ? formattedName : "Zayn Al-Masri",
        fatherName: "Hassan Al-Masri",
        motherName: "Nadia Al-Masri",
        birthDate: "05 December 2021",
        documentType: `Custom Scanned ${file.name.split('.').pop()?.toUpperCase() || "PDF"} Document`,
        authority: "Regional Registry & Humanitarian Aid Office",
      }
    };

    setSelectedPreset(customPreset);
    setScanStage("idle");
    setBoundingBoxes([]);

    setCaseStatus("ocr_scanning");
    setCaseData((prev) => ({
      ...prev,
      familyFiles: [{ name: customPreset.fileName, type: customPreset.type }],
      childName: customPreset.ocrMock.childName,
      birthDate: customPreset.ocrMock.birthDate,
    }));

    setTimeout(() => {
      setCaseStatus("ocr_done");
      setCaseData((prev) => ({
        ...prev,
        ocrExtracted: customPreset.ocrMock,
      }));
    }, 3200);
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="py-24 px-6 bg-background" id="document-generator">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            AI Optical Engine
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-teal-50 tracking-tight mb-6">
            {t.docGenTitle}
          </h2>
          <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 font-normal leading-relaxed">
            {t.docGenSub}
          </p>
        </div>

        {/* OCR Visualizer container grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Uploader Card (Left 6 Columns) */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-white dark:bg-slate-900/40 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden min-h-[500px]">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex justify-between items-center">
                <span>Source Document Stage</span>
                <button
                  onClick={handleDropZoneClick}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-350 border border-emerald-200 dark:border-emerald-900 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
                >
                  Upload File
                </button>
              </h3>
              
              {/* Presets List */}
              <div className="mb-6 flex flex-wrap gap-2.5">
                {documentPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      selectedPreset?.name === preset.name
                        ? "bg-primary border-primary text-white shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-755"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Document scanning portal preview */}
            <div 
              onClick={handleDropZoneClick}
              className="flex-1 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 group cursor-pointer hover:border-primary/50 transition-colors"
            >
              
              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload} 
                accept=".pdf,.png,.jpg,.jpeg,.gif"
              />

              {/* Scan Laser beam */}
              {scanStage === "scanning" && <div className="animate-scan" />}

              <AnimatePresence mode="wait">
                {selectedPreset ? (
                  <motion.div
                    key={selectedPreset.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full h-full flex flex-col items-center justify-center relative"
                  >
                    {/* Simulated Document Canvas Sheet */}
                    <div className="w-56 h-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-lg shadow-sm flex flex-col justify-between select-none relative overflow-hidden">
                      
                      {/* Bounding boxes mockup on the document */}
                      {boundingBoxes.map((box, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, border: "1px solid var(--accent)" }}
                          animate={{ opacity: 1, border: "1px solid var(--accent)", backgroundColor: "rgba(200, 130, 116, 0.05)" }}
                          className="absolute rounded-[2px]"
                          style={{
                            top: box.y,
                            left: box.x,
                            width: box.w,
                            height: box.h,
                          }}
                        />
                      ))}

                      {/* Mock Text Elements */}
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850" />
                        <div className="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded" />
                      </div>

                      <div className="flex-1 flex flex-col gap-3 py-6">
                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded" />
                        <div className="w-5/6 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
                        <div className="w-3/4 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded" />
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-end">
                        <div className="w-12 h-6 bg-slate-100 dark:bg-slate-850 rounded" />
                      </div>
                    </div>

                    {/* Scan indicator overlay */}
                    <div className="absolute bottom-4 left-4 bg-slate-900/90 text-slate-100 border border-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center gap-1.5 backdrop-blur-md">
                      {scanStage === "scanning" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>PARSING BLOCKS ({boundingBoxes.length}/7)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                          <span>DOCUMENT PARSED</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center text-center max-w-sm pointer-events-none">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl shadow-sm mb-4">
                      <FileUp className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-display text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                      Drag family documents here
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed">
                      Accepts Hospital certificates, refugee camp records, rejection papers, or ID scans.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* OCR Extracted Data Metadata (Right 6 Columns) */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900/40 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Scan className="w-4.5 h-4.5 text-accent animate-pulse" />
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                  AI Metadata Extraction
                </h3>
              </div>

              {/* Extraction Data Table */}
              <div className="flex flex-col gap-4">
                {[
                  { label: "Document Type", key: "documentType", icon: <FileText className="w-4 h-4 text-primary" /> },
                  { label: "Child Full Name", key: "childName", icon: null },
                  { label: "Date of Birth", key: "birthDate", icon: null },
                  { label: "Father Name", key: "fatherName", icon: null },
                  { label: "Mother Name", key: "motherName", icon: null },
                  { label: "Issuing Authority", key: "authority", icon: null },
                ].map((row) => {
                  const extractedVal = selectedPreset?.ocrMock[row.key as keyof typeof selectedPreset.ocrMock];
                  const hasData = scanStage === "completed" || (scanStage === "scanning" && boundingBoxes.length > 3);
                  
                  return (
                    <div
                      key={row.label}
                      className={`flex flex-col md:flex-row md:items-center justify-between gap-2 p-3.5 rounded-xl border transition-colors ${
                        hasData
                          ? "bg-slate-50 dark:bg-slate-850/65 border-slate-200 dark:border-slate-800"
                          : "bg-transparent border-dashed border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                        {row.icon}
                        {row.label}
                      </span>

                      <div className="min-h-6 flex items-center">
                        <AnimatePresence mode="wait">
                          {hasData && extractedVal ? (
                            <motion.span
                              initial={{ opacity: 0, x: 5 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100"
                            >
                              {extractedVal}
                            </motion.span>
                          ) : scanStage === "scanning" ? (
                            <span className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500 italic">Pending scan...</span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verification Footer Banner */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-700 dark:text-slate-400">
              <ShieldCheck className="w-5 h-5 text-success flex-shrink-0" />
              <span>
                All documents are encrypted using SHA-256 and purged immediately upon processing, adhering to UNICEF child safety rules.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
