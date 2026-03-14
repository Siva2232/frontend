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
        width: "15mm",
        height: "15mm",
      }
    : {
        width: "160px",
        height: "160px",
      };

  return (
    <div
      className={`flex items-center bg-white border border-dashed border-gray-300 overflow-hidden ${className}`}
      style={containerStyle}
    >
      {/* QR */}
      <div
        className="flex items-center justify-center"
        style={qrStyle}
      >
        <img
          src={product.qrCodeUrl}
          alt="QR"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Text */}
      <div className="flex flex-col justify-center ml-2 leading-tight overflow-hidden">
        <span
          className={`font-bold ${
            small ? "text-[6pt]" : "text-base"
          } truncate`}
        >
          {product.productName}
        </span>

        <span
          className={`font-bold ${
            small ? "text-[5pt]" : "text-sm"
          } truncate`}
        >
          {product.serialNumber}
        </span>

        {product.modelNumber && (
          <span
            className={`font-bold ${
              small ? "text-[5pt]" : "text-sm"
            } truncate`}
          >
            {product.modelNumber}
          </span>
        )}
      </div>
    </div>
  );
};

export default LabelCard;