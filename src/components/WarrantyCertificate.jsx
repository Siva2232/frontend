// import React, { useRef } from "react";
// import { ShieldCheck, Download, CheckCircle2, Calendar, Hash, User, Mail, Smartphone } from "lucide-react";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// const WarrantyCertificate = ({ registration }) => {
//   const certificateRef = useRef(null);
//   if (!registration) return null;

//   const { customerName, serialNumber, email, phone, purchaseDate, modelNumber, purchaseShopName, productId } = registration;
  
//   // Robust calculation for expiryDate if missing (fallback for older records)
//   let expiryDate = registration.expiryDate;
//   if (!expiryDate && purchaseDate) {
//     const date = new Date(purchaseDate);
//     const months = productId?.warrantyPeriodMonths || 12;
//     date.setMonth(date.getMonth() + months);
//     expiryDate = date;
//   }

//   const productName = productId?.productName || "Official Product";

//   const formatDate = (dateString) => {
//     if (!dateString) return "Not Provided";
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return "Invalid Date";
    
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const handleDownload = async () => {
//     const element = certificateRef.current;
//     if (!element) return;

//     try {
//       console.log("Generating PDF...");
//       // Ensure the element is visible and styles are loaded
//       const canvas = await html2canvas(element, {
//         scale: 3, // Even higher quality for printing
//         useCORS: true,
//         allowTaint: true,
//         logging: true, // Enable logging to see what's happening
//         backgroundColor: "#ffffff",
//         windowWidth: 1200 // Ensure consistent width for capture
//       });
      
//       console.log("Canvas generated, creating PDF...");
//       const imgData = canvas.toDataURL("image/jpeg", 1.0);
//       const pdf = new jsPDF({
//         orientation: "landscape",
//         unit: "px",
//         format: [canvas.width, canvas.height]
//       });

//       pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
//       pdf.save(`Warranty_Certificate_${serialNumber}.pdf`);
//       console.log("PDF download triggered");
//     } catch (error) {
//       console.error("PDF Generation Error Detail:", error);
//       // Removed window.print() fallback to prevent confusion if error persists
//       alert("Direct PDF download failed. Please try again or use the browser print option (Ctrl+P).");
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto my-6 animate-in fade-in zoom-in duration-500">
//       {/* Action Buttons - Hidden during print */}
//       <div className="flex justify-between items-center mb-4 print:hidden px-4">
//         <div className="flex items-center gap-2 text-emerald-600">
//           <CheckCircle2 className="w-5 h-5" />
//           <span className="text-sm font-bold text-slate-700">Registration Confirmed</span>
//         </div>
//         <button
//           onClick={handleDownload}
//           className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md hover:bg-slate-800 active:scale-95 transition-all"
//         >
//           <Download className="w-3.5 h-3.5" />
//           Download PDF
//         </button>
//       </div>

//       {/* Certificate Content */}
//       <div 
//         ref={certificateRef}
//         id="certificate" 
//         style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
//         className="p-8 md:p-10 relative overflow-hidden shadow-sm rounded-xl"
//       >
//         <div className="relative z-10">
//           {/* Top Bar */}
//           <div className="flex justify-between items-start mb-10 pb-6 border-b" style={{ borderBottomColor: "#f1f5f9" }}>
//             <div>
//               <div className="flex items-center gap-2 mb-1">
//                 <ShieldCheck className="w-5 h-5" style={{ color: "#2563eb" }} />
//                 <h1 className="text-lg font-black uppercase tracking-tight" style={{ color: "#0f172a" }}>
//                   Warranty Certificate
//                 </h1>
//               </div>
//               <p className="text-[10px] uppercase tracking-widest" style={{ color: "#94a3b8" }}>Verification #REG-{new Date().getTime().toString(36).toUpperCase()}</p>
//             </div>
//             <div className="text-right">
//               <p className="font-bold text-sm" style={{ color: "#0f172a" }}>{productName}</p>
//               <p className="text-[10px] font-mono tracking-tighter" style={{ color: "#64748b" }}>SN: {serialNumber}</p>
//             </div>
//           </div>

//           {/* Core Content */}
//           <div className="space-y-8">
//             <div>
//               <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#94a3b8" }}>Certified To</p>
//               <h2 className="text-2xl font-bold" style={{ color: "#0f172a" }}>{customerName}</h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y" style={{ borderColor: "#f1f5f9" }}>
//               <div>
//                 <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#94a3b8" }}>Issue Date</p>
//                 <p className="text-sm font-semibold" style={{ color: "#334155" }}>{formatDate(purchaseDate)}</p>
//               </div>
//               <div>
//                 <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#2563eb" }}>Valid Until</p>
//                 <p className="text-sm font-bold" style={{ color: "#0f172a" }}>{formatDate(expiryDate)}</p>
//               </div>
//               <div>
//                 <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#94a3b8" }}>Model Number</p>
//                 <p className="text-sm font-semibold" style={{ color: "#334155" }}>{modelNumber || "N/A"}</p>
//               </div>
//               <div>
//                 <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#94a3b8" }}>Purchased From</p>
//                 <p className="text-sm font-semibold" style={{ color: "#334155" }}>{purchaseShopName || "N/A"}</p>
//               </div>
//             </div>

//             <div className="flex justify-between items-end pt-4">
//               <div className="space-y-1">
//                 <p className="text-[9px] font-medium" style={{ color: "#94a3b8" }}>{email}</p>
//                 <p className="text-[9px] font-medium" style={{ color: "#94a3b8" }}>{phone}</p>
//               </div>
//               <div className="text-right">
//                 <div className="w-12 h-12 inline-flex items-center justify-center border rounded-full mb-1" style={{ borderColor: "#eff6ff" }}>
//                    <ShieldCheck className="w-6 h-6" style={{ color: "#dbeafe" }} />
//                 </div>
//                 <p className="text-[8px] font-bold uppercase tracking-tighter" style={{ color: "#cbd5e1" }}>Auth. Digital Signature</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Print styles */}
//       <style>{`
//         @media print {
//           body {
//             background: white !important;
//             padding: 0 !important;
//           }
//           .print\\:hidden {
//             display: none !important;
//           }
//           #certificate {
//             box-shadow: none !important;
//             border: 5px solid black !important;
//             width: 100% !important;
//             height: auto !important;
//             margin: 0 !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default WarrantyCertificate;
import React, { useRef } from "react";
import { ShieldCheck, Download, CheckCircle2, Award, Zap, Globe } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Logo11 from "../assets/Logo11.png";

const WarrantyCertificate = ({ registration }) => {
  const certificateRef = useRef(null);

  if (!registration) return null;

  const { customerName, serialNumber, email, phone, purchaseDate, modelNumber, purchaseShopName, productId } = registration;
  
  let expiryDate = registration.expiryDate;
  if (!expiryDate && purchaseDate) {
    const date = new Date(purchaseDate);
    const months = productId?.warrantyPeriodMonths || 12;
    date.setMonth(date.getMonth() + months);
    expiryDate = date;
  }

  const productName = productId?.productName || "Premium Series Device";

  const formatDate = (dateString) => {
    if (!dateString) return "Pending";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownload = async () => {
    const element = certificateRef.current;
    if (!element) {
      alert("Certificate element not found.");
      return;
    }

    try {
      // 1. Create a deep clone to manipulate the DOM without affecting the user's view
      const clone = element.cloneNode(true);
      
      // 2. Position the clone off-screen but keep it in the DOM so it renders
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      // Preserve original width to maintain layout
      clone.style.width = `${element.offsetWidth}px`;
      
      // 3. Apply a solid background to the container to prevent transparency issues
      clone.style.backgroundColor = '#ffffff';
      clone.style.color = '#000000'; // Default text color safety

      document.body.appendChild(clone);

      // Helper: Canvas context for color conversion
      const ctx = document.createElement('canvas').getContext('2d');

      // Helper: Convert any valid CSS color string to Hex/RGBA
      const convertToSafeColor = (colorStr) => {
        if (!colorStr) return colorStr;
        ctx.fillStyle = colorStr;
        return ctx.fillStyle;
      };

      // Helper: Find and replace oklch(...) in any string
      const sanitizeStyleValue = (value) => {
         if (!value || typeof value !== 'string') return value;
         if (!value.includes('oklch')) return value;

         // Replace each oklch(...) occurrence
         return value.replace(/oklch\([^)]+\)/g, (match) => {
             return convertToSafeColor(match);
         });
      };

      // 4. Traverse and sanitize all elements in the clone
      // We must use the computed style of the ORIGINAL elements to capture the actual values
      // (because cloning might lose computed values derived from CSS if not re-rendered same way)
      // But since we appended clone to body, getComputedStyle(clone) works too and is simpler.
      
      const allElements = clone.querySelectorAll('*');
      const allNodes = [clone, ...allElements];

      allNodes.forEach((node) => {
         const computed = window.getComputedStyle(node);
         
         const propertiesToSanitize = [
             'color', 
             'backgroundColor', 
             'borderColor', 
             'borderTopColor', 
             'borderBottomColor', 
             'borderLeftColor', 
             'borderRightColor',
             'outlineColor',
             'textDecorationColor',
             'boxShadow',       
             'backgroundImage'  
         ];

         propertiesToSanitize.forEach(prop => {
             const val = computed.getPropertyValue(prop);
             if (val && val.includes('oklch')) {
                 const safeVal = sanitizeStyleValue(val);
                 node.style.setProperty(prop, safeVal, 'important');
             }
         });
      });

      // 5. Generate with html2canvas (now seeing only safe colors)
      const canvas = await html2canvas(clone, {
        scale: 2.5,
        useCORS: true,
        allowTaint: false, 
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      // Clean up clone
      document.body.removeChild(clone);

      // 6. Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pxToMm = 25.4 / 96;
      const widthMm  = canvas.width  * pxToMm;
      const heightMm = canvas.height * pxToMm;

      const pdf = new jsPDF({
        orientation: widthMm > heightMm ? "landscape" : "portrait",
        unit: "mm",
        format: [widthMm, heightMm],
        hotfixes: ["px_to_pt"],
      });

      pdf.addImage(imgData, "PNG", 0, 0, widthMm, heightMm, undefined, "FAST");
      const fileName = `Warranty_${(customerName || "certificate").replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error("PDF generation failed:", error);
      // Clean up if error occurs
      const cleanup = document.querySelectorAll('[style*="left: -9999px"]');
      cleanup.forEach(el => el.remove());
      
      alert("Failed to generate PDF. Browser reported: " + error.message);
    }
  };

  // ──────────────────────────────────────────────
  // The rest of your component remains 100% unchanged
  // ──────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto my-12 px-4 font-sans">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Your Warranty is Active</h2>
          <p className="text-slate-500 text-sm">Download or print this certificate for your records.</p>
        </div>
        <button
          onClick={handleDownload}
          className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-indigo-200 active:scale-95"
        >
          <Download className="w-4 h-4 group-hover:animate-bounce" />
          Export Certificate
        </button>
      </div>

      {/* The Certificate Canvas */}
      <div 
        ref={certificateRef}
        className="relative bg-white border-[12px] border-slate-50 p-12 md:p-16 shadow-2xl rounded-sm overflow-hidden"
        style={{ minHeight: "500px" }}
      >
        {/* Decorative Background Elements */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 z-0"
          style={{ backgroundColor: "rgba(237, 233, 254, 0.4)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-32 h-32 rounded-full -ml-16 -mb-16 z-0"
          style={{ backgroundColor: "rgba(241, 245, 249, 0.9)" }}
        />

        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start border-b-2 border-slate-100 pb-10 mb-10">
            <div className="mb-6 md:mb-0">
              {/* LOGO IMPORT SLOT */}
              <img
                src={Logo11}
                alt="Perfect Digital Logo"
                className="h-12 sm:h-14 md:h-16 w-auto mb-4 object-contain transition-transform duration-300 hover:scale-105"
                crossOrigin="anonymous" // helps in some bundler/dev server cases
              />
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Official Certification</span>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <h1 className="text-4xl font-serif italic text-slate-800 mb-2">Warranty Certificate</h1>
              <p className="text-indigo-600 font-mono text-sm tracking-tighter">ID: #W-{serialNumber?.substring(0,8).toUpperCase()}</p>
            </div>
          </div>

          {/* Recipient Section */}
          <div className="text-center my-12">
            <p className="text-slate-400 uppercase tracking-widest text-[10px] font-bold mb-4">This document confirms that</p>
            <h2 className="text-5xl font-bold text-slate-900 mb-2">{customerName}</h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
              is the registered owner of the <span className="text-slate-900 font-semibold">{productName}</span> and is entitled to full manufacturer support and protection services.
            </p>
          </div>

          {/* Details Grid */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 px-6 rounded-xl border"
            style={{ backgroundColor: "rgba(248, 250, 252, 0.5)", borderColor: "#e2e8f0" }}
          >
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Model Number</p>
              <p className="text-sm font-bold text-slate-800">{modelNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Serial Number</p>
              <p className="text-sm font-bold text-slate-800">{serialNumber}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Issue Date</p>
              <p className="text-sm font-bold text-slate-800">{formatDate(purchaseDate)}</p>
            </div>
            <div>
              <p className="text-[10px] text-indigo-500 font-bold uppercase mb-2 italic">Coverage Until</p>
              <p className="text-sm font-black text-indigo-700">{formatDate(expiryDate)}</p>
            </div>
          </div>

          {/* Footer Signature Area */}
          <div className="mt-16 flex justify-between items-end">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-[9px] font-bold uppercase text-slate-400">Verified</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                  <Award className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-[9px] font-bold uppercase text-slate-400">Authentic</span>
              </div>
            </div>

            <div className="text-right border-t-2 border-slate-900 pt-4 px-8">
              <p className="font-serif italic text-xl text-slate-800 mb-0">Authorized Representative</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Global Support Division</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Technical Footnote */}
      <p className="mt-8 text-center text-slate-400 text-[10px] leading-loose">
        This certificate is digitally generated and valid without a physical signature. <br/>
        For verification, visit <strong>warranty.yourbrand.com/verify</strong> and enter your Serial Number.
      </p>
    </div>
  );
};

export default WarrantyCertificate;