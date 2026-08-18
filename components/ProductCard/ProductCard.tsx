"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "./ProductCard.module.css";
import { useCart } from "@/components/Cart/CartContext";

interface ProductCardProps {
  product: any;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedPortion, setSelectedPortion] = useState(product.portions[0]);

  const handleAddToCart = () => {
    if (!selectedPortion) return;
    addToCart({
      productId: product.id,
      portionId: selectedPortion.id,
      name: product.name,
      portionLabel: selectedPortion.label,
      weight: selectedPortion.weight,
      price: selectedPortion.price,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <article className={`card ${styles.card} ${compact ? styles.compact : ""}`} aria-label={product.name}>
      {/* Image */}
      <div className={styles.imageWrap}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={`${product.name} — ${product.tagline}`}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className={styles.noImage}>No Image</div>
        )}
        <div className={styles.imageOverlay} aria-hidden="true" />
        {/* Spice indicator */}
        {product.spiceLevel && (
          <div className={styles.spiceRow} aria-label={`Spice level: ${product.spiceLevel} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`spice-dot ${i < product.spiceLevel! ? "active" : ""}`}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div>
          <p className={styles.tagline}>{product.tagline}</p>
          <h3 className={styles.name}>{product.name}</h3>
          {!compact && product.description && (
            <p className={styles.description}>{product.description}</p>
          )}
        </div>

        {/* Portions & Price */}
        <div className={styles.portionSelector}>
          {product.portions.map((portion: any) => (
            <button
              key={portion.id}
              className={`${styles.portionChip} ${selectedPortion?.id === portion.id ? styles.portionSelected : ""}`}
              onClick={() => setSelectedPortion(portion)}
            >
              <span className={styles.portionLabel}>{portion.label}</span>
              <span className={styles.portionWeight}>{portion.weight}</span>
              <span className={styles.portionPrice}>
                <span className={styles.currency}>Rs.</span>
                {portion.price.toLocaleString()}
              </span>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          className={`btn btn-primary ${styles.cta}`}
          aria-label={`Add ${product.name} to cart`}
          onClick={handleAddToCart}
          disabled={!selectedPortion || !selectedPortion.available}
        >
          {!selectedPortion?.available ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
