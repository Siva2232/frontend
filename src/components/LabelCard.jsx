import React from "react";

/**
 * QR Label Card
 * Optimized for 50mm x 15mm thermal labels
 */

const LabelCard = ({ product, small = false, className = "" }) => {
  if (!product) return null;

  // Use print-specific styles via CSS classes or inline styles with print media queries
  const containerStyle = small
    ? {
        width: "50mm",
        height: "15mm",
        // Using !important to ensure print overrides if needed
      }
    : {};

  const qrStyle = small
    ? {
        width: "15mm",
        height: "15mm",
        minWidth: "15mm",
      }
    : {
        width: "160px",
        height: "160px",
      };

  return (
    <div
      className={`flex items-center justify-between bg-white overflow-hidden ${className} label-print-container`}
      style={containerStyle}
    >
      {/* TEXT SIDE */}
      <div className="flex flex-col justify-center leading-[1.1] pl-[2mm] pr-[1mm] overflow-hidden flex-1">
        
        <span
          className="truncate font-bold tracking-tight"
          style={{
            fontSize: small ? "11pt" : "18px",
            lineHeight: "1.2",
          }}
        >
          {product.productName}
        </span>

        <span
          className="truncate font-bold"
          style={{
            fontSize: small ? "10pt" : "16px",
            lineHeight: "1.1",
          }}
        >
          {product.serialNumber}
        </span>

        {product.modelNumber && (
          <span
            className="truncate font-bold"
            style={{
              fontSize: small ? "10pt" : "16px",
              lineHeight: "1.1",
            }}
          >
            {product.modelNumber}
          </span>
        )}
      </div>

      {/* QR SIDE */}
      <div
        className="flex items-center justify-center pr-0 shrink-0"
        style={qrStyle}
      >
        <img
          src={product.qrCodeUrl}
          alt="QR"
          className="w-full h-full object-contain print:max-w-none scale-105"
        />
      </div>

      <style dx-style>{`
        @media print {
          .label-print-container {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Ensure text doesn't shrink or wrap unexpectedly in print */
          .label-print-container span {
            display: block !important;
            white-space: nowrap !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LabelCard;