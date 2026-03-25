import React, { useRef } from "react";
import { ShieldCheck, Download, CheckCircle2, Award } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Logo11 from "../assets/Logo11.png";

const WarrantyCertificate = ({ registration }) => {
  const certificateRef = useRef(null);

  if (!registration) return null;

  const {
    customerName = "Valued Customer",
    serialNumber = "26051206",
    purchaseDate,
    modelNumber = "JKUIHJUK KHUIYHB\nUYHHUIH UIKHUIY",
  } = registration;

  let expiryDate = registration.expiryDate;
  if (!expiryDate && purchaseDate) {
    const date = new Date(purchaseDate);
    date.setFullYear(date.getFullYear() + 1);
    expiryDate = date;
  }

  const formatDate = (date) => {
    if (!date) return "March 24, 2026";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDownload = async () => {
    const element = certificateRef.current;
    if (!element) {
      alert("Certificate not found");
      return;
    }

    try {
      const clone = element.cloneNode(true);

      // Strong styling for clean PDF capture
      Object.assign(clone.style, {
        position: "fixed",
        left: "-9999px",
        top: "0",
        width: "980px",           // Slightly wider for better spacing
        backgroundColor: "#ffffff",
        color: "#1e293b",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "55px 65px",
        boxSizing: "border-box",
        border: "none",
        boxShadow: "none",
        borderRadius: "0",
      });

      document.body.appendChild(clone);

      // Color sanitization (fixes oklch / Tailwind issues)
      const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      const safeColor = (str) => {
        if (!str || typeof str !== "string") return str;

        // direct simple mouse, e.g. oklch(...) and linked vars
        if (/oklch|oklab|lab|lch|var\(/i.test(str)) {
          try {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = str;
            ctx.fillRect(0, 0, 1, 1);
            const data = ctx.getImageData(0, 0, 1, 1).data;
            return `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
          } catch (e) {
            // fallback: map each color-function token to safe rgb if possible
            const replaced = str.replace(/(?:oklch|oklab|lab|lch)\([^)]*\)/gi, (token) => {
              try {
                ctx.clearRect(0, 0, 1, 1);
                ctx.fillStyle = token;
                ctx.fillRect(0, 0, 1, 1);
                const data = ctx.getImageData(0, 0, 1, 1).data;
                return `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
              } catch (innerError) {
                return "rgb(0, 0, 0)";
              }
            });
            if (replaced !== str) return replaced;
            return "rgb(0, 0, 0)";
          }
        }

        return str;
      };

      const allNodes = [clone, ...clone.querySelectorAll("*")];
      allNodes.forEach((node) => {
        const style = window.getComputedStyle(node);
        for (let i = 0; i < style.length; i++) {
          const prop = style[i];
          const val = style.getPropertyValue(prop);
          if (!val) continue;

          if (/oklch|oklab|lab|lch|var\(/i.test(val)) {
            const sanitized = safeColor(val);
            node.style.setProperty(prop, sanitized || "rgb(0, 0, 0)", "important");
          }
        }
      });

      const canvas = await html2canvas(clone, {
        scale: 2.8,                 // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 980,
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a3",    // increased page size from a4 to a3
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Warranty_Certificate_${serialNumber}.pdf`);

    } catch (error) {
      console.error("PDF Error:", error);
      alert("Failed to generate PDF: " + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <div className="flex justify-end mb-6 print:hidden">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold shadow-lg transition-all"
        >
          <Download className="w-5 h-5" />
          Download Warranty Certificate
        </button>
      </div>

      {/* Certificate - Made to match image closely */}
      <div
        ref={certificateRef}
        className="relative bg-white mx-auto shadow-2xl overflow-hidden"
        style={{
          width: "980px",
          maxWidth: "100%",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#1e293b",
          border: "14px solid #f8fafc",
        }}
      >
        {/* Decorative blobs (light) */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-100 rounded-full opacity-30 pointer-events-none" style={{ transform: "translate(25%, -35%)" }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-slate-100 rounded-full opacity-50 pointer-events-none" style={{ transform: "translate(-30%, 40%)" }} />

        <div className="relative p-14">
          {/* Header - Exact match style */}
          <div className="flex justify-between items-start pb-12 border-b border-slate-200">
            <div>
              <img
                src={Logo11}
                alt="Lancaster"
                className="h-16 object-contain"
                crossOrigin="anonymous"
              />
              <div className="flex items-center gap-3 mt-8">
                <ShieldCheck size={32} className="text-indigo-600" />
                <span className="uppercase tracking-[3px] text-sm font-bold text-slate-500">
                  OFFICIAL CERTIFICATION
                </span>
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-4xl font- tracking-tight text-slate-900">Warranty Certificate</h1>
              <p className="text-indigo-600 mt-1 text-xl">ID: #W-{serialNumber}</p>
            </div>
          </div>

          {/* Dear Customer */}
          <div className="mt-12 mb-10 text-lg leading-relaxed text-slate-700">
            <p className="font-bold mb-6 ">Dear {customerName},</p>
            <p>
              We sincerely thank you for registering and generating a warranty certificate. This document
              serves as proof for warranty claims and after-sales service. Enjoy the paperless warranty.
            </p>
          </div>

          {/* Details Grid - Matches image exactly */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 mb-12">
            <div className="grid grid-cols-4 gap-x-8 gap-y-9 text-sm">
              <div>
                <div className="uppercase text-xs tracking-widest text-slate-400 font-bold mb-1.5">MODEL NUMBER</div>
                <div className="font-semibold whitespace-pre-line leading-tight text-slate-800">
                  {modelNumber}
                </div>
              </div>
              <div>
                <div className="uppercase text-xs tracking-widest text-slate-400 font-bold mb-1.5">SERIAL NUMBER</div>
                <div className="font-semibold text-slate-800">{serialNumber}</div>
              </div>
              <div>
                <div className="uppercase text-xs tracking-widest text-slate-400 font-bold mb-1.5">ISSUE DATE</div>
                <div className="font-semibold text-slate-800">{formatDate(purchaseDate)}</div>
              </div>
              <div>
                <div className="uppercase text-xs tracking-widest text-indigo-600 font-bold mb-1.5">COVERAGE UNTIL</div>
                <div className="font-semibold text-indigo-700">{formatDate(expiryDate)}</div>
              </div>
            </div>
          </div>

          {/* Note */}
          <p className="text-slate-700 leading-relaxed mb-16">
            Kindly note that the details mentioned in this Certificate is based on the information filled by you
            and the same shall be subject verification in case of Warranty claim. Please refer warranty card
            supplied along with the product for warranty terms and conditions.
          </p>

          {/* Thank You + Badges */}
          <div className="flex justify-between items-end">
            <div className="flex gap-10">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={34} className="text-emerald-600" />
                </div>
                <span className="uppercase text-xs font-bold tracking-widest text-slate-400">VERIFIED</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Award size={34} className="text-blue-600" />
                </div>
                <span className="uppercase text-xs font-bold tracking-widest text-slate-400">AUTHENTIC</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-medium text-slate-800 mb-4">Thank you for choosing LANCASTER</p>
              <div className="w-80 border-t border-slate-900" />
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-10">
        This certificate is digitally generated and valid without a physical signature.
      </p>
    </div>
  );
};

export default WarrantyCertificate;