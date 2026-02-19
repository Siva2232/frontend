import React, { useRef } from "react";
import { ShieldCheck, Download, CheckCircle2, Calendar, Hash, User, Mail, Smartphone } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const WarrantyCertificate = ({ registration }) => {
  const certificateRef = useRef(null);
  if (!registration) return null;

  const { customerName, serialNumber, email, phone, purchaseDate, productId } = registration;
  
  // Robust calculation for expiryDate if missing (fallback for older records)
  let expiryDate = registration.expiryDate;
  if (!expiryDate && purchaseDate) {
    const date = new Date(purchaseDate);
    const months = productId?.warrantyPeriodMonths || 12;
    date.setMonth(date.getMonth() + months);
    expiryDate = date;
  }

  const productName = productId?.productName || "Official Product";

  const formatDate = (dateString) => {
    if (!dateString) return "Not Provided";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownload = async () => {
    const element = certificateRef.current;
    if (!element) return;

    try {
      console.log("Generating PDF...");
      // Ensure the element is visible and styles are loaded
      const canvas = await html2canvas(element, {
        scale: 3, // Even higher quality for printing
        useCORS: true,
        allowTaint: true,
        logging: true, // Enable logging to see what's happening
        backgroundColor: "#ffffff",
        windowWidth: 1200 // Ensure consistent width for capture
      });
      
      console.log("Canvas generated, creating PDF...");
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Warranty_Certificate_${serialNumber}.pdf`);
      console.log("PDF download triggered");
    } catch (error) {
      console.error("PDF Generation Error Detail:", error);
      // Removed window.print() fallback to prevent confusion if error persists
      alert("Direct PDF download failed. Please try again or use the browser print option (Ctrl+P).");
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 animate-in fade-in zoom-in duration-500">
      {/* Action Buttons - Hidden during print */}
      <div className="flex justify-between items-center mb-4 print:hidden px-4">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-bold text-slate-700">Registration Confirmed</span>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md hover:bg-slate-800 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Download PDF
        </button>
      </div>

      {/* Certificate Content */}
      <div 
        ref={certificateRef}
        id="certificate" 
        style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
        className="p-8 md:p-10 relative overflow-hidden shadow-sm rounded-xl"
      >
        <div className="relative z-10">
          {/* Top Bar */}
          <div className="flex justify-between items-start mb-10 pb-6 border-b" style={{ borderBottomColor: "#f1f5f9" }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5" style={{ color: "#2563eb" }} />
                <h1 className="text-lg font-black uppercase tracking-tight" style={{ color: "#0f172a" }}>
                  Warranty Certificate
                </h1>
              </div>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "#94a3b8" }}>Verification #REG-{new Date().getTime().toString(36).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm" style={{ color: "#0f172a" }}>{productName}</p>
              <p className="text-[10px] font-mono tracking-tighter" style={{ color: "#64748b" }}>SN: {serialNumber}</p>
            </div>
          </div>

          {/* Core Content */}
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#94a3b8" }}>Certified To</p>
              <h2 className="text-2xl font-bold" style={{ color: "#0f172a" }}>{customerName}</h2>
            </div>

            <div className="grid grid-cols-2 gap-8 py-6 border-y" style={{ borderColor: "#f1f5f9" }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#94a3b8" }}>Issue Date</p>
                <p className="text-sm font-semibold" style={{ color: "#334155" }}>{formatDate(purchaseDate)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#2563eb" }}>Valid Until</p>
                <p className="text-sm font-bold" style={{ color: "#0f172a" }}>{formatDate(expiryDate)}</p>
              </div>
            </div>

            <div className="flex justify-between items-end pt-4">
              <div className="space-y-1">
                <p className="text-[9px] font-medium" style={{ color: "#94a3b8" }}>{email}</p>
                <p className="text-[9px] font-medium" style={{ color: "#94a3b8" }}>{phone}</p>
              </div>
              <div className="text-right">
                <div className="w-12 h-12 inline-flex items-center justify-center border rounded-full mb-1" style={{ borderColor: "#eff6ff" }}>
                   <ShieldCheck className="w-6 h-6" style={{ color: "#dbeafe" }} />
                </div>
                <p className="text-[8px] font-bold uppercase tracking-tighter" style={{ color: "#cbd5e1" }}>Auth. Digital Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Print styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          #certificate {
            box-shadow: none !important;
            border: 5px solid black !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WarrantyCertificate;
