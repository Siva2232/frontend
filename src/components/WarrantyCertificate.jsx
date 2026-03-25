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
      const clone = element.cloneNode(true);

      // Force clean desktop/print styles for PDF (UNTOUCHED)
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

      const detailsGrid = clone.querySelector('[data-section="details-grid"]');
      if (detailsGrid) {
        detailsGrid.style.display = 'grid';
        detailsGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        detailsGrid.style.gap = '30px';
        detailsGrid.style.padding = '32px';
      }

      const footer = clone.querySelector('[data-section="footer"]');
      if (footer) {
        footer.style.display = 'flex';
        footer.style.flexDirection = 'row';
        footer.style.justifyContent = 'space-between';
        footer.style.alignItems = 'flex-end';
        footer.style.marginTop = '60px';
      }

      document.body.appendChild(clone);

      // Improved safe color handling to prevent oklch error
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
          Download Warranty Certificate
        </button>
      </div>

      {/* Certificate - Mobile Optimized (Desktop + PDF Unchanged) */}
      <div
        ref={certificateRef}
        className="relative overflow-hidden bg-white rounded-3xl shadow-2xl border border-slate-200 mx-auto"
        style={{ color: "#1e293b", fontFamily: "'ProggyCleanTT', monospace", maxWidth: "1000px" }}
      >
        {/* Decorative backgrounds - hidden on very small screens if needed */}
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 bg-indigo-100/40 rounded-full -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-slate-100/60 rounded-full translate-x-1/4 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 p-5 sm:p-8 md:p-14">   {/* Reduced padding on mobile */}

          {/* Header - Fixed for Mobile */}
          <div
            data-section="header"
            className="flex flex-col md:flex-row justify-between items-start gap-5 md:gap-0 border-b pb-8 md:pb-10 mb-10 md:mb-12"
            style={{ borderColor: "#e2e8f0" }}
          >
            <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
              <img 
                src={Logo11} 
                alt="Lancaster Logo" 
                className="h-10 sm:h-12 md:h-14 object-contain flex-shrink-0" 
                crossOrigin="anonymous" 
              />
              <div className="flex items-center gap-2 text-indigo-600 min-w-0"> {/* Prevent text cutoff */}
                <ShieldCheck size={24} className="flex-shrink-0" />
                <span className="font-bold uppercase tracking-widest text-[10px] sm:text-xs md:text-sm leading-tight">
                  OFFICIAL CERTIFICATION
                </span>
              </div>
            </div>

            <div className="text-left md:text-right mt-6 md:mt-0 w-full md:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-none">
                Warranty Certificate
              </h1>
              <p className="text-indigo-600 font-medium mt-2 text-sm sm:text-base md:text-lg">
                ID: #W-{serialNumber ? serialNumber.substring(0, 8).toUpperCase() : "26051206"}
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

          {/* Details Grid */}
          <div
            data-section="details-grid"
            className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8 p-5 sm:p-8 rounded-2xl border bg-slate-50"
            style={{ borderColor: "#e2e8f0" }}
          >
            {[
              { label: "MODEL NUMBER", value: modelNumber || "N/A" },
              { label: "SERIAL NUMBER", value: serialNumber || "N/A" },
              { label: "ISSUE DATE", value: formatDate(purchaseDate) },
              { label: "COVERAGE UNTIL", value: formatDate(expiryDate), highlight: true }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-slate-500 mb-1.5 uppercase">
                  {item.label}
                </p>
                <p 
                  className={`font-bold text-sm sm:text-base md:text-lg break-words ${item.highlight ? 'text-violet-700' : 'text-slate-900'}`}
                >
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

          {/* Footer */}
          <div
            data-section="footer"
            className="mt-12 md:mt-16 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-8 sm:gap-10"
          >
            <div className="flex gap-8 sm:gap-10">
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
                  <CheckCircle2 size={24} className="text-emerald-600" />
                </div>
                <span className="uppercase text-[10px] font-semibold tracking-widest text-slate-500">Verified</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-3">
                  <Award size={24} className="text-blue-600" />
                </div>
                <span className="uppercase text-[10px] font-semibold tracking-widest text-slate-500">Authentic</span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900">Thank you for choosing LANCASTER</p>
              <div className="h-px w-28 sm:w-40 bg-slate-900 mt-4 mx-auto sm:ml-auto" />
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