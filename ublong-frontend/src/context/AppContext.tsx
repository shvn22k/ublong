"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "light" | "dark";
export type Language = "en" | "es" | "fr" | "ar";
export type CaseStatus =
  | "idle"
  | "ocr_scanning"
  | "ocr_done"
  | "agents_running"
  | "agents_done"
  | "submitting"
  | "submitted"
  | "approved";

export interface CaseData {
  familyFiles: { name: string; type: string; url?: string }[];
  country: string;
  childName: string;
  birthDate: string;
  ocrExtracted: {
    childName?: string;
    fatherName?: string;
    motherName?: string;
    birthDate?: string;
    documentType?: string;
  };
}

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontScale: number;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  resetFontScale: () => void;
  caseStatus: CaseStatus;
  setCaseStatus: (status: CaseStatus) => void;
  caseData: CaseData;
  setCaseData: React.Dispatch<React.SetStateAction<CaseData>>;
  runCaseSimulation: () => void;
  resetCaseSimulation: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("en");
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [caseStatus, setCaseStatus] = useState<CaseStatus>("idle");
  const [caseData, setCaseData] = useState<CaseData>({
    familyFiles: [],
    country: "Syria",
    childName: "Amira Al-Hasan",
    birthDate: "2021-08-14",
    ocrExtracted: {},
  });

  // Apply class attributes to :root / html tag
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Theme
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // High Contrast
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Font Scale
    root.style.setProperty("--font-scale", fontScale.toString());
  }, [theme, highContrast, fontScale]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const increaseFontScale = () => {
    setFontScale((prev) => Math.min(prev + 0.1, 1.5));
  };

  const decreaseFontScale = () => {
    setFontScale((prev) => Math.max(prev - 0.1, 0.9));
  };

  const resetFontScale = () => {
    setFontScale(1);
  };

  // Run whole flow automatically in a staggered simulation
  const runCaseSimulation = () => {
    if (caseStatus !== "idle" && caseStatus !== "approved") return;
    
    // Step 1: Scanning
    setCaseStatus("ocr_scanning");
    
    setTimeout(() => {
      // Step 2: OCR Done
      setCaseStatus("ocr_done");
      setCaseData((prev) => ({
        ...prev,
        ocrExtracted: {
          childName: "Amira Al-Hasan",
          fatherName: "Yousef Al-Hasan",
          motherName: "Fatima Al-Hasan",
          birthDate: "14 Aug 2021",
          documentType: "Hospital Birth Notification Certificate",
        },
      }));

      // Step 3: Agents Running (Mission Control Center)
      setTimeout(() => {
        setCaseStatus("agents_running");

        // Step 4: Agents completed
        setTimeout(() => {
          setCaseStatus("agents_done");

          // Step 5: Submitting
          setTimeout(() => {
            setCaseStatus("submitting");

            // Step 6: Submitted
            setTimeout(() => {
              setCaseStatus("submitted");

              // Step 7: Approved
              setTimeout(() => {
                setCaseStatus("approved");
              }, 4000); // 4s in submitted/review status
            }, 3000); // 3s submit animation
          }, 3500); // 3.5s agent wrap-up
        }, 8000); // 8s Agent activity logs simulation
      }, 2500); // 2.5s OCR read pause
    }, 3500); // 3.5s Scan animation duration
  };

  const resetCaseSimulation = () => {
    setCaseStatus("idle");
    setCaseData((prev) => ({
      ...prev,
      familyFiles: [],
      ocrExtracted: {},
    }));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        highContrast,
        toggleHighContrast,
        fontScale,
        increaseFontScale,
        decreaseFontScale,
        resetFontScale,
        caseStatus,
        setCaseStatus,
        caseData,
        setCaseData,
        runCaseSimulation,
        resetCaseSimulation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
