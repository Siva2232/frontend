import React from "react";

/**
 * QR Label Card
 * Optimized for 50mm x 15mm thermal labels
 */

const LabelCard = ({ product, small = false, className = "" }) => {
  if (!product) return null;

  const containerStyle = small
    ? {
        width: "50mm",
        height: "15mm",
      }
    : {};

  const qrStyle = small
    ? {
        width: "14mm",
        height: "14mm",
      }
    : {
        width: "160px",
        height: "160px",
      };

  return (
    <div
      className={`flex items-center justify-between bg-white overflow-hidden ${className}`}
      style={containerStyle}
    >
      {/* TEXT SIDE */}
      <div className="flex flex-col justify-center leading-tight pl-[2mm] pr-[1mm] overflow-hidden">
        
        <span
          style={{
            fontSize: small ? "11px" : "16px",
            fontWeight: "700",
          }}
          className="truncate"
        >
          {product.productName}
        </span>

        <span
          style={{
            fontSize: small ? "10px" : "14px",
            fontWeight: "700",
          }}
          className="truncate"
        >
          {product.serialNumber}
        </span>

        {product.modelNumber && (
          <span
            style={{
              fontSize: small ? "10px" : "14px",
              fontWeight: "700",
            }}
            className="truncate"
          >
            {product.modelNumber}
          </span>
        )}
      </div>

      {/* QR SIDE */}
      <div
        className="flex items-center justify-center pr-[1mm]"
        style={qrStyle}
      >
        <img
          src={product.qrCodeUrl}
          alt="QR"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default LabelCard;