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
      Object.assign(clone.style, {
        position: 'fixed',
        left: '-9999px',
        top: '0',
        width: '1000px', // Fixed width for consistent PDF
        backgroundColor: '#ffffff',
        fontFamily: 'sans-serif',
        color: '#000000',
        zIndex: '-1'
      });
      
      document.body.appendChild(clone);

      // Force-replace all colors in the clone with hex equivalents via Canvas context
      // This guarantees that any oklch(...) or var(--oklch) becomes rgba(...)
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

      {/* The Certificate Canvas - INLINE STYLES FOR SAFETY */}
      <div 
        ref={certificateRef}
        style={{
            backgroundColor: "#ffffff",
            border: "12px solid #f8fafc", 
            padding: "40px",
            borderRadius: "4px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            color: "#1e293b",
            fontFamily: "ui-sans-serif, system-ui, sans-serif"
        }}
      >
        {/* Decorative Background Elements */}
        <div style={{
            position: "absolute", top: 0, right: 0,
            width: "256px", height: "256px", borderRadius: "9999px",
            marginRight: "-128px", marginTop: "-128px",
            backgroundColor: "rgba(237, 233, 254, 0.4)", zIndex: 0
        }} />
        <div style={{
            position: "absolute", bottom: 0, left: 0,
            width: "128px", height: "128px", borderRadius: "9999px",
            marginLeft: "-64px", marginBottom: "-64px",
            backgroundColor: "rgba(241, 245, 249, 0.9)", zIndex: 0
        }} />

        <div style={{ position: "relative", zIndex: 10 }}>
          {/* Header Section */}
          <div style={{
              borderBottom: "2px solid #f1f5f9", paddingBottom: "40px", marginBottom: "40px",
              display: "flex", justifyContent: "space-between", alignItems: "flex-start"
          }}>
            <div>
              <img src={Logo11} alt="Logo" style={{ height: "64px", marginBottom: "24px", objectFit: "contain" }} crossOrigin="anonymous" />
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={24} color="#4f46e5" />
                <span style={{ fontSize: "12px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.2em", color: "#94a3b8" }}>
                  Official Certification
                </span>
              </div>
            </div>
            
            <div style={{ textAlign: "right" }}>
              <h1 style={{ fontSize: "36px", color: "#1e293b", fontFamily: "serif", fontStyle: "italic", margin: 0 }}>Warranty Certificate</h1>
              <p style={{ color: "#4f46e5", fontSize: "14px", fontFamily: "monospace", letterSpacing: "-0.05em", marginTop: "8px" }}>
                ID: #W-{serialNumber?.substring(0,8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Recipient Section */}
          <div style={{ textAlign: "center", margin: "48px 0" }}>
            <p style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                This document confirms that
            </p>
            <h2 style={{ fontSize: "48px", fontWeight: "bold", color: "#0f172a", margin: "8px 0" }}>{customerName}</h2>
            <p style={{ color: "#64748b", maxWidth: "480px", margin: "0 auto", fontSize: "14px", lineHeight: "1.6" }}>
              is the registered owner of the <span style={{ color: "#0f172a", fontWeight: "600" }}>{productName}</span> and is entitled to full manufacturer support and protection services.
            </p>
          </div>

          {/* Details Grid */}
          <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px",
              padding: "32px", backgroundColor: "rgba(248, 250, 252, 0.5)",
              border: "1px solid #e2e8f0", borderRadius: "12px"
          }}>
            {[
                { label: "Model Number", value: modelNumber || "N/A" },
                { label: "Serial Number", value: serialNumber },
                { label: "Issue Date", value: formatDate(purchaseDate) },
                { label: "Coverage Until", value: formatDate(expiryDate), highlight: true }
            ].map((item, i) => (
                <div key={i}>
                    <p style={{ fontSize: "10px", color: item.highlight ? "#6366f1" : "#94a3b8", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px" }}>
                        {item.label}
                    </p>
                    <p style={{ fontSize: "14px", fontWeight: "bold", color: item.highlight ? "#4338ca" : "#1e293b" }}>
                        {item.value}
                    </p>
                </div>
            ))}
          </div>

          {/* Footer Signature Area */}
          <div style={{ marginTop: "64px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "99px", backgroundColor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                  <CheckCircle2 size={24} color="#10b981" />
                </div>
                <span style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", color: "#94a3b8" }}>Verified</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "99px", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                  <Award size={24} color="#3b82f6" />
                </div>
                <span style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", color: "#94a3b8" }}>Authentic</span>
              </div>
            </div>

            <div style={{ textAlign: "right", borderTop: "2px solid #0f172a", paddingTop: "16px", paddingLeft: "32px" }}>
              <p style={{ fontFamily: "serif", fontStyle: "italic", fontSize: "20px", color: "#1e293b", margin: 0 }}>Authorized Representative</p>
              <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", fontWeight: "bold", marginTop: "4px" }}>Global Support Division</p>
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