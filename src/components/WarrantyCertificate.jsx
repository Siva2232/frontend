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
      // Create a simplified clone for PDF generation
      const clone = element.cloneNode(true);
      
      // Force explicit styles on the clone container to ensure visibility off-screen
      // We also enforce "Desktop" dimensions here to ensure PDF looks like desktop view even if on mobile
      Object.assign(clone.style, {
        position: 'fixed',
        left: '-9999px',
        top: '0',
        width: '1000px', // Fixed width for consistent PDF
        height: 'auto',
        backgroundColor: '#ffffff',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        color: '#000000',
        zIndex: '-1',
        padding: '40px', // Force desktop padding
        boxSizing: 'border-box',
        transform: 'none', // Reset any potential transforms
        margin: '0',
        borderRadius: '0'
      });
      
      // --- RESTORE DESKTOP LAYOUT (Override Mobile Styles) ---
      
      // 1. Header Flex Row & Alignment
      const header = clone.querySelector('[data-section="header"]');
      if(header) {
        Object.assign(header.style, {
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            textAlign: 'left',
            paddingBottom: '40px',
            marginBottom: '40px',
            borderBottom: '2px solid #f1f5f9'
        });
      }
      const headerLeft = clone.querySelector('[data-section="header-left"]');
      if (headerLeft) {
          headerLeft.style.textAlign = 'left';
      }
      const headerRight = clone.querySelector('[data-section="header-right"]');
      if (headerRight) {
        Object.assign(headerRight.style, { 
            textAlign: 'right', 
            marginTop: '0' 
        });
      }

      // 2. Details Grid (4 Columns)
      const grid = clone.querySelector('[data-section="details-grid"]');
      if(grid) {
        Object.assign(grid.style, {
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '32px',
            padding: '32px'
        });
      }

      // 3. Footer Flex Row
      const footer = clone.querySelector('[data-section="footer"]');
      if(footer) {
        Object.assign(footer.style, {
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end',
            textAlign: 'left',
            marginTop: '64px'
        });
      }
      const footerRight = clone.querySelector('[data-section="footer-right"]');
      if (footerRight) {
         Object.assign(footerRight.style, { 
             textAlign: 'right', 
             marginTop: '0',
             width: 'auto',
             borderTop: '2px solid #0f172a', 
             paddingTop: '16px',
             paddingLeft: '32px'
         });
      }
      
      // Append to body to allow style computation
      document.body.appendChild(clone);

      // Force-replace all colors in the clone with hex equivalents via Canvas context
      // This safeguards against 'oklch' errors in html2canvas
      const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      ctx.canvas.width = 1;
      ctx.canvas.height = 1;

      const safeColor = (str) => {
        if (!str || typeof str !== 'string') return str;
        // If it isn't a simple hex/rgb, let the browser compute it
        if (str.includes('oklch') || str.includes('lab') || str.includes('lch') || str.startsWith('var(')) {
            try {
                ctx.clearRect(0,0,1,1);
                ctx.fillStyle = str;
                ctx.fillRect(0,0,1,1);
                const data = ctx.getImageData(0,0,1,1).data;
                return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]/255})`;
            } catch (e) {
                return '#000000'; // Fallback
            }
        }
        return str;
      };

      // Sanitize Loop
      const allElements = clone.querySelectorAll('*');
      const nodes = [clone, ...allElements];
      
      for (const node of nodes) {
          const style = window.getComputedStyle(node);
          const props = [
            'color', 'backgroundColor', 'borderColor', 
            'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor',
            'outlineColor', 'textDecorationColor', 'fill', 'stroke'
          ];
          
          for (const prop of props) {
              const val = style.getPropertyValue(prop);
              if (val && (val.includes('oklch') || val.includes('lab'))) {
                  node.style.setProperty(prop, safeColor(val), 'important');
              }
          }
      }

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
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
      pdf.save(`Warranty_${serialNumber}.pdf`);

    } catch (error) {
      console.error("PDF Fail:", error);
      alert("PDF Error: " + error.message);
      // Clean up
      const cleanup = document.querySelectorAll('[style*="left: -9999px"]');
      cleanup.forEach(el => el.remove());
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 md:my-12 px-4 font-sans">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 print:hidden">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-slate-900">Your Warranty is Active</h2>
          <p className="text-slate-500 text-sm">Download or print this certificate for your records.</p>
        </div>
        <button
          onClick={handleDownload}
          className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-indigo-200 active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4 group-hover:animate-bounce" />
          Download Warranty Certificate
        </button>
      </div>

      {/* The Certificate Canvas - Responsive Classes for View, Inline logic preserved for safety */}
      <div 
        ref={certificateRef}
        className="relative overflow-hidden bg-white rounded-lg shadow-2xl p-6 md:p-10"
        style={{
            border: "12px solid #f8fafc", 
            color: "#1e293b",
            fontFamily: "ui-sans-serif, system-ui, sans-serif"
        }}
      >
        {/* Decorative Background Elements - positioned absolutely */}
        <div className="absolute top-0 right-0 rounded-full pointer-events-none opacity-40 mix-blend-multiply" 
             style={{ width: "256px", height: "256px", marginRight: "-128px", marginTop: "-128px", backgroundColor: "#ede9fe" }} />
        <div className="absolute bottom-0 left-0 rounded-full pointer-events-none opacity-90 mix-blend-multiply" 
             style={{ width: "128px", height: "128px", marginLeft: "-64px", marginBottom: "-64px", backgroundColor: "#f1f5f9" }} />

        <div className="relative z-10">
          {/* Header Section */}
          <div 
            data-section="header"
            className="flex flex-col md:flex-row justify-between items-center md:items-start border-b-2 pb-10 mb-10 gap-6 md:gap-0"
            style={{ borderColor: "#f1f5f9" }}
          >
            <div data-section="header-left" className="text-center md:text-left">
              <img src={Logo11} alt="Logo" className="h-16 mb-6 mx-auto md:mx-0 object-contain" crossOrigin="anonymous" />
              <div className="flex items-center justify-center md:justify-start gap-2">
                <ShieldCheck size={24} color="#4f46e5" />
                <span className="font-extrabold uppercase tracking-widest text-xs" style={{ color: "#94a3b8", letterSpacing: "0.2em" }}>
                  Official Certification
                </span>
              </div>
            </div>
            
            <div data-section="header-right" className="text-center md:text-right">
              <h1 className="text-3xl md:text-4xl m-0 font-serif italic" style={{ color: "#1e293b" }}>Warranty Certificate</h1>
              <p className="mt-2 text-sm font-mono tracking-tighter" style={{ color: "#4f46e5" }}>
                ID: #W-{serialNumber?.substring(0,8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Recipient Section */}
          <div data-section="recipient" className="text-center my-8 md:my-12">
            <p className="font-bold uppercase tracking-widest mb-4 text-[10px]" style={{ color: "#94a3b8" }}>
                This document confirms that
            </p>
            <h2 className="text-3xl md:text-5xl font-bold my-2" style={{ color: "#0f172a" }}>{customerName}</h2>
            <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: "#64748b" }}>
              is the registered owner of the <span style={{ color: "#0f172a", fontWeight: "600" }}>{productName}</span> and is entitled to full manufacturer support and protection services.
            </p>
          </div>

          {/* Details Grid */}
          <div 
             data-section="details-grid"
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 p-6 md:p-8 rounded-xl border"
             style={{
                backgroundColor: "rgba(248, 250, 252, 0.5)",
                borderColor: "#e2e8f0"
             }}
          >
            {[
                { label: "Model Number", value: modelNumber || "N/A" },
                { label: "Serial Number", value: serialNumber },
                { label: "Issue Date", value: formatDate(purchaseDate) },
                { label: "Coverage Until", value: formatDate(expiryDate), highlight: true }
            ].map((item, i) => (
                <div key={i} className="text-center md:text-left">
                    <p className="font-bold uppercase mb-2 text-[10px]" style={{ color: item.highlight ? "#6366f1" : "#94a3b8" }}>
                        {item.label}
                    </p>
                    <p className="font-bold text-sm" style={{ color: item.highlight ? "#4338ca" : "#1e293b" }}>
                        {item.value}
                    </p>
                </div>
            ))}
          </div>

          {/* Footer Signature Area */}
          <div 
            data-section="footer"
            className="mt-12 md:mt-16 flex flex-col md:flex-row justify-between items-center md:items-end gap-8 md:gap-0"
          >
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: "#ecfdf5" }}>
                  <CheckCircle2 size={24} color="#10b981" />
                </div>
                <span className="font-bold uppercase text-[9px]" style={{ color: "#94a3b8" }}>Verified</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: "#eff6ff" }}>
                  <Award size={24} color="#3b82f6" />
                </div>
                <span className="font-bold uppercase text-[9px]" style={{ color: "#94a3b8" }}>Authentic</span>
              </div>
            </div>

            <div 
              data-section="footer-right"
              className="text-center md:text-right border-t-2 pt-4 pl-0 md:pl-8 w-full md:w-auto"
              style={{ borderColor: "#0f172a" }}
            >
              <p className="text-xl m-0 font-serif italic" style={{ color: "#1e293b" }}>Authorized Representative</p>
              <p className="font-bold uppercase tracking-widest mt-1 text-[10px]" style={{ color: "#94a3b8" }}>Global Support Division</p>
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