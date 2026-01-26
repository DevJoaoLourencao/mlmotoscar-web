import { useState } from "react";

import { VehicleCarousel } from "./VehicleCarousel";
import { VehicleLightbox } from "./VehicleLightbox";
import type { VehicleGalleryProps } from "./types";

export function VehicleGallery({
  images,
  vehicleTitle,
  showThumbnails = true,
  showPagination = false,
}: VehicleGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  return (
    <>
      <VehicleCarousel
        images={images}
        onImageClick={handleImageClick}
        vehicleTitle={vehicleTitle}
        showThumbnails={showThumbnails}
        showPagination={showPagination}
      />
      <VehicleLightbox
        images={images}
        isOpen={lightboxOpen}
        initialIndex={lightboxIndex}
        onClose={handleCloseLightbox}
        vehicleTitle={vehicleTitle}
      />
    </>
  );
}
