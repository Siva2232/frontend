// import React, { useRef } from "react";
// import { ShieldCheck, Download, CheckCircle2, Award } from "lucide-react";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import Logo11 from "../assets/Logo11.png";

// const WarrantyCertificate = ({ registration }) => {
//   const certificateRef = useRef(null);

//   if (!registration) return null;

//   const { customerName, serialNumber, purchaseDate, modelNumber, productId } = registration;
  
//   let expiryDate = registration.expiryDate;
//   if (!expiryDate && purchaseDate) {
//     const date = new Date(purchaseDate);
//     const months = productId?.warrantyPeriodMonths || 12;
//     date.setMonth(date.getMonth() + months);
//     expiryDate = date;
//   }

//   const productName = productId?.productName || "Premium Series Device";

//   const formatDate = (dateString) => {
//     if (!dateString) return "Pending";
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const handleDownload = async () => {
//     const element = certificateRef.current;
//     if (!element) {
//       alert("Certificate element not found.");
//       return;
//     }

//     try {
//       const clone = element.cloneNode(true);
      
//       Object.assign(clone.style, {
//         position: 'fixed',
//         left: '-9999px',
//         top: '0',
//         width: '1000px',
//         height: 'auto',
//         backgroundColor: '#ffffff',
//         fontFamily: "'ProggyCleanTT', monospace",
//         color: '#000000',
//         zIndex: '-1',
//         padding: '40px',
//         boxSizing: 'border-box',
//         transform: 'none',
//         margin: '0',
//         borderRadius: '0'
//       });
      
//       // Restore desktop layout
//       const header = clone.querySelector('[data-section="header"]');
//       if (header) {
//         Object.assign(header.style, {
//           display: 'flex',
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'flex-start',
//           textAlign: 'left',
//           paddingBottom: '40px',
//           marginBottom: '40px',
//           borderBottom: '2px solid #f1f5f9'
//         });
//       }
//       const headerLeft = clone.querySelector('[data-section="header-left"]');
//       if (headerLeft) headerLeft.style.textAlign = 'left';
      
//       const headerRight = clone.querySelector('[data-section="header-right"]');
//       if (headerRight) {
//         Object.assign(headerRight.style, { textAlign: 'right', marginTop: '0' });
//       }

//       const grid = clone.querySelector('[data-section="details-grid"]');
//       if (grid) {
//         Object.assign(grid.style, {
//           display: 'grid',
//           gridTemplateColumns: 'repeat(4, 1fr)',
//           gap: '32px',
//           padding: '32px'
//         });
//       }

//       const footer = clone.querySelector('[data-section="footer"]');
//       if (footer) {
//         Object.assign(footer.style, {
//           display: 'flex',
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'flex-end',
//           textAlign: 'left',
//           marginTop: '64px'
//         });
//       }
//       const footerRight = clone.querySelector('[data-section="footer-right"]');
//       if (footerRight) {
//         Object.assign(footerRight.style, {
//           textAlign: 'right',
//           marginTop: '0',
//           width: 'auto',
//           borderTop: '2px solid #0f172a',
//           paddingTop: '16px',
//           paddingLeft: '32px'
//         });
//       }
      
//       document.body.appendChild(clone);

//       // Color sanitization (unchanged)
//       const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
//       ctx.canvas.width = 1;
//       ctx.canvas.height = 1;

//       const safeColor = (str) => {
//         if (!str || typeof str !== 'string') return str;
//         if (str.includes('oklch') || str.includes('lab') || str.includes('lch') || str.startsWith('var(')) {
//           try {
//             ctx.clearRect(0,0,1,1);
//             ctx.fillStyle = str;
//             ctx.fillRect(0,0,1,1);
//             const data = ctx.getImageData(0,0,1,1).data;
//             return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]/255})`;
//           } catch (e) {
//             return '#000000';
//           }
//         }
//         return str;
//       };

//       const allElements = clone.querySelectorAll('*');
//       const nodes = [clone, ...allElements];
      
//       for (const node of nodes) {
//         const style = window.getComputedStyle(node);
//         const props = [
//           'color', 'backgroundColor', 'borderColor', 
//           'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor',
//           'outlineColor', 'textDecorationColor', 'fill', 'stroke'
//         ];
        
//         for (const prop of props) {
//           const val = style.getPropertyValue(prop);
//           if (val && (val.includes('oklch') || val.includes('lab'))) {
//             node.style.setProperty(prop, safeColor(val), 'important');
//           }
//         }
//       }

//       const canvas = await html2canvas(clone, {
//         scale: 2,
//         useCORS: true,
//         logging: false,
//         backgroundColor: '#ffffff'
//       });

//       document.body.removeChild(clone);

//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF({
//         orientation: "landscape",
//         unit: "mm",
//         format: "a4"
//       });

//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();
      
//       pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//       pdf.save(`Warranty_${serialNumber}.pdf`);

//     } catch (error) {
//       console.error("PDF Fail:", error);
//       alert("PDF Error: " + error.message);
//       const cleanup = document.querySelectorAll('[style*="left: -9999px"]');
//       cleanup.forEach(el => el.remove());
//     }
//   };

//   // ────────────────────────────────────────────────
//   //    Font is applied ONLY inside this component
//   //    Recommended: Add this <link> inside the page
//   //    where <WarrantyCertificate /> is rendered
//   //    or keep it here as comment reminder
//   // ────────────────────────────────────────────────
//   // <link href="https://fonts.cdnfonts.com/css/proggy-clean" rel="stylesheet" />

//   return (
//     <div
//       className="max-w-4xl mx-auto my-6 md:my-12 px-4"
//       style={{ fontFamily: "'ProggyCleanTT', monospace" }}
//     >
//       {/* Top Action Bar */}
//       <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 print:hidden">
//         <div className="text-center sm:text-left">
//           <h2 className="text-2xl font-bold text-slate-900">Your Warranty is Active</h2>
//           <p className="text-slate-500 text-sm">Download or print this certificate for your records.</p>
//         </div>
//         <button
//           onClick={handleDownload}
//           className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-indigo-200 active:scale-95 cursor-pointer"
//           style={{ fontFamily: "'ProggyCleanTT', monospace" }}
//         >
//           <Download className="w-4 h-4 group-hover:animate-bounce" />
//           Download Warranty Certificate
//         </button>
//       </div>

//       {/* Certificate */}
//       <div
//         ref={certificateRef}
//         className="relative overflow-hidden bg-white rounded-lg shadow-2xl p-6 md:p-10"
//         style={{
//           border: "12px solid #f8fafc",
//           color: "#1e293b",
//           fontFamily: "'ProggyCleanTT', monospace"
//         }}
//       >
//         <div className="absolute top-0 right-0 rounded-full pointer-events-none opacity-40 mix-blend-multiply"
//              style={{ width: "256px", height: "256px", marginRight: "-128px", marginTop: "-128px", backgroundColor: "#ede9fe" }} />
//         <div className="absolute bottom-0 left-0 rounded-full pointer-events-none opacity-90 mix-blend-multiply"
//              style={{ width: "128px", height: "128px", marginLeft: "-64px", marginBottom: "-64px", backgroundColor: "#f1f5f9" }} />

//         <div className="relative z-10">
//           {/* Header */}
//           <div
//             data-section="header"
//             className="flex flex-col md:flex-row justify-between items-center md:items-start border-b-2 pb-10 mb-10 gap-6 md:gap-0"
//             style={{ borderColor: "#f1f5f9" }}
//           >
//             <div data-section="header-left" className="text-center md:text-left">
//               <img src={Logo11} alt="Logo" className="h-16 mb-6 mx-auto md:mx-0 object-contain" crossOrigin="anonymous" />
//               <div className="flex items-center justify-center md:justify-start gap-2">
//                 <ShieldCheck size={24} color="#4f46e5" />
//                 <span className="font-extrabold uppercase tracking-widest text-xs" style={{ color: "#94a3b8", letterSpacing: "0.2em" }}>
//                   Official Certification
//                 </span>
//               </div>
//             </div>
            
//             <div data-section="header-right" className="text-center md:text-right">
//               <h1 className="text-3xl md:text-4xl m-0" style={{ color: "#1e293b" }}>Warranty Certificate</h1>
//               <p className="mt-2 text-sm tracking-tighter" style={{ color: "#4f46e5" }}>
//                 ID: #W-{serialNumber?.substring(0,8).toUpperCase()}
//               </p>
//             </div>
//           </div>

//           {/* Recipient */}
//           <div data-section="recipient" className="text-center my-8 md:my-12">
//             <p className="font-bold uppercase tracking-widest mb-4 text-[10px]" style={{ color: "#94a3b8" }}>
//               This document confirms that
//             </p>
//             <h2 className="text-3xl md:text-5xl font-bold my-2" style={{ color: "#0f172a" }}>{customerName}</h2>
//             <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: "#64748b" }}>
//               is the registered owner of the <span style={{ color: "#0f172a", fontWeight: "600" }}>{productName}</span> and is entitled to full manufacturer support and protection services.
//             </p>
//           </div>

//           {/* Details Grid */}
//           <div
//             data-section="details-grid"
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 p-6 md:p-8 rounded-xl border"
//             style={{
//               backgroundColor: "rgba(248, 250, 252, 0.5)",
//               borderColor: "#e2e8f0"
//             }}
//           >
//             {[
//               { label: "Model Number", value: modelNumber || "N/A" },
//               { label: "Serial Number", value: serialNumber },
//               { label: "Issue Date", value: formatDate(purchaseDate) },
//               { label: "Coverage Until", value: formatDate(expiryDate), highlight: true }
//             ].map((item, i) => (
//               <div key={i} className="text-center md:text-left">
//                 <p className="font-bold uppercase mb-2 text-[10px]" style={{ color: item.highlight ? "#6366f1" : "#94a3b8" }}>
//                   {item.label}
//                 </p>
//                 <p className="font-bold text-sm" style={{ color: item.highlight ? "#4338ca" : "#1e293b" }}>
//                   {item.value}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* Footer */}
//           <div
//             data-section="footer"
//             className="mt-12 md:mt-16 flex flex-col md:flex-row justify-between items-center md:items-end gap-8 md:gap-0"
//           >
//             <div className="flex gap-6">
//               <div className="flex flex-col items-center">
//                 <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: "#ecfdf5" }}>
//                   <CheckCircle2 size={24} color="#10b981" />
//                 </div>
//                 <span className="font-bold uppercase text-[9px]" style={{ color: "#94a3b8" }}>Verified</span>
//               </div>
//               <div className="flex flex-col items-center">
//                 <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: "#eff6ff" }}>
//                   <Award size={24} color="#3b82f6" />
//                 </div>
//                 <span className="font-bold uppercase text-[9px]" style={{ color: "#94a3b8" }}>Authentic</span>
//               </div>
//             </div>

//             <div
//               data-section="footer-right"
//               className="text-center md:text-right border-t-2 pt-4 pl-0 md:pl-8 w-full md:w-auto"
//               style={{ borderColor: "#0f172a" }}
//             >
//               <p className="text-xl m-0" style={{ color: "#1e293b" }}>Authorized Representative</p>
//               <p className="font-bold uppercase tracking-widest mt-1 text-[10px]" style={{ color: "#94a3b8" }}>
//                 Global Support Division
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Footnote */}
//       <p className="mt-8 text-center text-slate-400 text-[10px] leading-loose" style={{ fontFamily: "'ProggyCleanTT', monospace" }}>
//         This certificate is digitally generated and valid without a physical signature.<br />
//         {/* For verification, visit <strong>warranty.yourbrand.com/verify</strong> and enter your Serial Number. */}
//       </p>
//     </div>
//   );
// };

// export default WarrantyCertificate;




import React, { useRef } from "react";
import { ShieldCheck, Download, CheckCircle2, Award } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Logo11 from "../assets/Logo11.png";

const WarrantyCertificate = ({ registration }) => {
  const certificateRef = useRef(null);

  if (!registration) return null;

  const { customerName, serialNumber, purchaseDate, modelNumber, productId } = registration;
  
  let expiryDate = registration.expiryDate;
  if (!expiryDate && purchaseDate) {
    const date = new Date(purchaseDate);
    const months = productId?.warrantyPeriodMonths || 12;
    date.setMonth(date.getMonth() + months);
    expiryDate = date;
  }

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
      const clone = element.cloneNode(true);

      // === PDF CLONE STYLES - EXACTLY MATCHES TARGET DESIGN ===
      Object.assign(clone.style, {
        position: 'fixed',
        left: '-9999px',
        top: '0',
        width: '1000px',
        backgroundColor: '#ffffff',
        fontFamily: "'ProggyCleanTT', monospace",
        color: '#1e293b',
        padding: '50px 60px',
        boxSizing: 'border-box',
        borderRadius: '0',
        boxShadow: 'none'
      });

      // Header - Force exact target layout (logo left + official below it, title right)
      const header = clone.querySelector('[data-section="header"]');
      if (header) {
        header.style.display = 'flex';
        header.style.flexDirection = 'row';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'flex-start';
        header.style.borderBottom = '2px solid #e2e8f0';
        header.style.paddingBottom = '40px';
        header.style.marginBottom = '40px';
      }

      // Left side of header (logo on top, official certification below it)
      const headerLeft = clone.querySelector('[data-section="header-left"]');
      if (headerLeft) {
        headerLeft.style.display = 'flex';
        headerLeft.style.flexDirection = 'column';
        headerLeft.style.alignItems = 'flex-start';
        headerLeft.style.gap = '12px';
      }

      // Right side of header
      const headerRight = clone.querySelector('[data-section="header-right"]');
      if (headerRight) {
        headerRight.style.textAlign = 'right';
      }

      // Details grid - 4 columns + rounded box
      const detailsGrid = clone.querySelector('[data-section="details-grid"]');
      if (detailsGrid) {
        detailsGrid.style.display = 'grid';
        detailsGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        detailsGrid.style.gap = '24px';
        detailsGrid.style.padding = '28px';
        detailsGrid.style.borderRadius = '16px';
        detailsGrid.style.backgroundColor = '#f8fafc';
        detailsGrid.style.border = '1px solid #e2e8f0';
      }

      // Footer
      const footer = clone.querySelector('[data-section="footer"]');
      if (footer) {
        footer.style.display = 'flex';
        footer.style.flexDirection = 'row';
        footer.style.justifyContent = 'space-between';
        footer.style.alignItems = 'flex-end';
        footer.style.marginTop = '60px';
      }

      document.body.appendChild(clone);

      // Safe color fix (prevents oklch error)
      const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      const safeColor = (str) => {
        if (!str || typeof str !== 'string') return str;
        if (!/oklch|oklab|lab|lch|var\(/i.test(str)) return str;
        try {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = str;
          ctx.fillRect(0, 0, 1, 1);
          const data = ctx.getImageData(0, 0, 1, 1).data;
          return `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
        } catch (e) {
          return '#1e293b';
        }
      };

      const allNodes = [clone, ...clone.querySelectorAll('*')];
      allNodes.forEach((node) => {
        const style = window.getComputedStyle(node);
        for (let i = 0; i < style.length; i++) {
          const prop = style[i];
          const val = style.getPropertyValue(prop);
          if (val && /oklch|oklab|lab|lch|var\(/i.test(val)) {
            node.style.setProperty(prop, safeColor(val), 'important');
          }
        }
      });

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: clone.offsetWidth,
        height: clone.offsetHeight,
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Warranty_${serialNumber || "certificate"}.pdf`);

    } catch (error) {
      console.error("PDF Fail:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 md:my-12 px-4 sm:px-6" style={{ fontFamily: "'ProggyCleanTT', monospace" }}>
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 print:hidden">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Warranty Certificate</h2>
          <p className="text-slate-600 text-sm sm:text-base mt-1">Your product is protected. Download for your records.</p>
        </div>
        <button
          onClick={handleDownload}
          className="group flex items-center gap-3 px-6 sm:px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95 w-full sm:w-auto justify-center"
        >
          <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          Download as PDF
        </button>
      </div>

      {/* Certificate - Mobile responsive, Desktop + PDF now match target exactly */}
      <div
        ref={certificateRef}
        className="relative overflow-hidden bg-white rounded-3xl shadow-2xl border border-slate-200 mx-auto"
        style={{ color: "#1e293b", fontFamily: "'ProggyCleanTT', monospace", maxWidth: "1000px" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 bg-indigo-100/40 rounded-full -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-slate-100/60 rounded-full translate-x-1/4 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 p-5 sm:p-8 md:p-14">
          {/* HEADER - NOW MATCHES TARGET DESIGN EXACTLY */}
          <div
            data-section="header"
            className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8 border-b pb-8 md:pb-10 mb-10 md:mb-12"
            style={{ borderColor: "#e2e8f0" }}
          >
            {/* Left side: Logo on top + Official Certification below it */}
            <div data-section="header-left" className="flex flex-col items-start gap-3">
              <img 
                src={Logo11} 
                alt="Lancaster Logo" 
                className="h-11 sm:h-12 md:h-14 object-contain" 
                crossOrigin="anonymous" 
              />
              <div className="flex items-center gap-2 text-indigo-600">
                <ShieldCheck size={24} />
                <span className="font-bold uppercase tracking-widest text-xs sm:text-sm">OFFICIAL CERTIFICATION</span>
              </div>
            </div>

            {/* Right side: Title + ID */}
            <div data-section="header-right" className="text-left md:text-right mt-2 md:mt-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Warranty Certificate</h1>
              <p className="text-indigo-600 font-medium mt-2 text-base sm:text-lg">
                ID: #W-{serialNumber ? serialNumber.substring(0, 8).toUpperCase() : "24011147"}
              </p>
            </div>
          </div>

          {/* Greeting */}
          <div className="mb-10 md:mb-12">
            <p className="text-slate-600 text-base sm:text-lg">
              Dear <span className="font-semibold text-slate-900">{customerName || "Valued Customer"}</span>,
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed text-sm sm:text-base">
              We sincerely thank you for registering and generating a warranty certificate. 
              This document serves as proof for warranty claims and after-sales service. 
              Enjoy your paperless warranty.
            </p>
          </div>

          {/* Details Grid - Matches target rounded box */}
          <div
            data-section="details-grid"
            className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 p-6 sm:p-8 rounded-2xl border bg-slate-50"
            style={{ borderColor: "#e2e8f0" }}
          >
            {[
              { label: "MODEL NUMBER", value: modelNumber || "N/A" },
              { label: "SERIAL NUMBER", value: serialNumber || "N/A" },
              { label: "ISSUE DATE", value: formatDate(purchaseDate) },
              { label: "COVERAGE UNTIL", value: formatDate(expiryDate), highlight: true }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-slate-500 mb-1 uppercase">
                  {item.label}
                </p>
                <p className={`font-bold text-sm sm:text-base md:text-lg ${item.highlight ? 'text-violet-700' : 'text-slate-900'}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="mt-10 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            Kindly note that the details mentioned in this Certificate are based on the information filled by you 
            and shall be subject to verification in case of a Warranty claim. Please refer to the warranty card 
            supplied with the product for full terms and conditions.
          </div>

          {/* Footer - Matches target */}
          <div
            data-section="footer"
            className="mt-12 md:mt-16 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-8 sm:gap-10"
          >
            <div className="flex gap-8 sm:gap-10">
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
                  <CheckCircle2 size={24} className="text-emerald-600" />
                </div>
                <span className="uppercase text-[10px] font-semibold tracking-widest text-slate-500">VERIFIED</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-3">
                  <Award size={24} className="text-blue-600" />
                </div>
                <span className="uppercase text-[10px] font-semibold tracking-widest text-slate-500">AUTHENTIC</span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900">Thank you for choosing LANCASTER</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footnote */}
      <p className="mt-8 text-center text-slate-400 text-xs leading-relaxed px-4">
        This certificate is digitally generated and valid without a physical signature.
      </p>
    </div>
  );
};

export default WarrantyCertificate;