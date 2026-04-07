import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedButton from "./AnimatedButton.jsx";

/**
 * ProductCard.jsx
 * - Used for displaying product info grid/tile/list style for buyer, seller, admin panels
 * - Animated, fully prop-driven, accessible, modern, and reusable
 * - Supports modal preview, add-to-cart, review snapshot, and extendable for admin/seller actions
 **/

// Design configs for category, organic/value-added icons and colors
const categoryIcons = {
  fruits: "/assets/icon-fruit.svg",
  vegetables: "/assets/icon-veggie.svg",
  valueAdded: "/assets/icon-value.svg",
};

function ProductFlags({ isOrganic, isValueAdded }) {
  return (
    <div className="flex gap-2">
      {isOrganic && <span className="bg-green-200 text-green-800 px-2 py-1 text-xs font-bold rounded-lg">Organic</span>}
      {isValueAdded && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 text-xs font-bold rounded-lg">Value-Added</span>}
    </div>
  );
}

// For multi-use: Show quick rating snapshot
function ProductRating({ reviews }) {
  if (!reviews || !reviews.length) return <span className="text-gray-400 px-1">No reviews</span>;
  const stars = Math.round(reviews.reduce((sum,r)=>sum+r.rating,0)/reviews.length);
  return (
    <span className="flex items-center gap-1 text-yellow-500 font-bold">{'★'.repeat(stars)}<span className="text-gray-500 ml-1 text-xs">({reviews.length})</span></span>
  );
}

export default function ProductCard({
  product,
  onClick,
  addToCart,
  showActions = true,
  sellerView = false,
  adminView = false,
  onEdit,
  onDelete,
  highlight,
}) {
  const [hovered, setHovered] = useState(false);

  // Modal state if used as a stand-alone modal-card
  const [showReview, setShowReview] = useState(false);

  // Animation config
  const motionConfig = {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", stiffness: 70, damping: 13 },
    whileHover: { scale: 1.03, boxShadow: "0 16px 48px #a7ffcb16" }
  };

  // Card base
  let cardClass = "flex flex-col items-stretch rounded-2xl bg-white overflow-hidden shadow-xl border border-green-50 transition relative";
  if (highlight) cardClass += " ring-4 ring-green-300 animate-pulse";
  if (product.stock <= 3) cardClass += " border-red-200";

  // Elements (header, image, price, flag, desc, actions)
  return (
    <motion.div
      className={cardClass + " group"}
      {...motionConfig}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      tabIndex={0}
      aria-label={`Product ${product.name}`}
      role="region"
      onClick={()=>onClick && onClick(product)}
    >
      {/* Image */}
      <div className="relative h-36 flex justify-center items-center bg-gradient-to-br from-green-100 to-yellow-50 select-none">
        <img
          src={product.image}
          alt={product.name}
          className="h-32 w-32 mt-2 object-contain rounded-xl shadow group-hover:shadow-lg"
        />
        {/* Quick-stock flag */}
        {product.stock <= 3 && (
          <motion.div className="absolute top-2 left-2 bg-red-100 px-3 py-1 rounded-lg text-xs font-bold text-red-800 animate-pulse"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >Low Stock</motion.div>
        )}
      </div>
      {/* Name, flags, desc */}
      <div className="flex flex-col flex-1 gap-2 py-3 px-4">
        <div className="flex items-center mb-1 gap-2">
          <img src={categoryIcons[product.category] || categoryIcons["fruits"]} alt={product.category} className="h-6" />
          <h3 className="text-lg font-extrabold text-green-900">{product.name}</h3>
        </div>
        <ProductFlags isOrganic={product.isOrganic} isValueAdded={product.isValueAdded} />
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-green-50 px-2 py-1 rounded-lg text-green-800 font-bold">₹{product.price}</span>
          <span className="ml-2 text-gray-500 text-xs">Stock: {product.stock}</span>
        </div>
        <ProductRating reviews={product.reviews}/>
        {/* Desc */}
        <div className="text-sm text-gray-600 line-clamp-3 mb-2">{product.description}</div>
        {/* Seller tag */}
        <div className="mt-auto">
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-lg">By {product.seller}</span>
        </div>
      </div>
      {/* Quick actions (buyer/seller/admin) */}
      {showActions && (
        <div className="flex justify-between gap-3 px-4 py-2 border-t bg-green-50">
          {/* Buyer actions */}
          {!sellerView && !adminView && (
            <>
              <AnimatedButton
                label="Add to Cart"
                color="primary"
                size="sm"
                onClick={e => {e.stopPropagation();addToCart(product);}}
                disabled={product.stock <= 0}
              />
              <AnimatedButton
                label="Details"
                color="secondary"
                size="sm"
                onClick={e => {e.stopPropagation();onClick && onClick(product);}}
              />
            </>
          )}
          {/* Seller actions */}
          {sellerView && (
            <>
              <AnimatedButton
                label="Edit"
                color="secondary"
                size="sm"
                onClick={e => {e.stopPropagation();onEdit(product);}}
              />
              <AnimatedButton
                label="Delete"
                color="danger"
                size="sm"
                onClick={e => {e.stopPropagation();onDelete(product.id);}}
              />
            </>
          )}
          {/* Admin actions */}
          {adminView && (
            <>
              <AnimatedButton
                label="Suspend"
                color="danger"
                size="sm"
                onClick={e => {e.stopPropagation();/* suspend logic here */}}
              />
              <AnimatedButton
                label="Audit"
                color="primary"
                size="sm"
                onClick={e => {e.stopPropagation();/* audit logic here */}}
              />
            </>
          )}
        </div>
      )}

      {/* Review snapshot/expand */}
      <AnimatePresence>
        {showReview && (
          <motion.div className="absolute inset-0 bg-white/95 flex flex-col p-6 z-[20] shadow-xl"
            initial={{ y: 44, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 44, opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-green-900">Reviews</span>
              <button onClick={()=>setShowReview(false)} className="bg-gray-100 px-3 rounded shadow">✕</button>
            </div>
            {product.reviews&&product.reviews.length ? (
              <ul className="mt-3 space-y-2 overflow-auto max-h-36">
                {product.reviews.map((r,i)=>(
                  <li key={i} className="rounded bg-green-50 p-2">
                    <b>{r.user}</b>: {r.text} <span className="text-yellow-500 ml-1">{'★'.repeat(r.rating)}</span>
                  </li>
                ))}
              </ul>
            ):<div className="text-gray-500">No reviews yet.</div>}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Show reviews button (on hover) */}
      {product.reviews?.length > 0 && (
        <button
          onClick={e=>{e.stopPropagation();setShowReview(v=>!v);}}
          className={"absolute top-2 right-2 bg-yellow-50 shadow px-2 py-1 rounded text-xs text-yellow-700" +
            (hovered ? " scale-110" : "")}
          title="Show Reviews"
          tabIndex={0}
        >{showReview ? "Hide" : "★ Reviews"}</button>
      )}
    </motion.div>
  );
}
