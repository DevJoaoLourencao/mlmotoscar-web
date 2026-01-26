import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import type { VehicleLightboxProps } from "./types";

export function VehicleLightbox({
  images,
  isOpen,
  initialIndex,
  onClose,
  vehicleTitle = "Veículo",
}: VehicleLightboxProps) {
  if (!images || images.length === 0) {
    return null;
  }

  const slides = images.map((src, index) => ({
    src,
    alt: `${vehicleTitle} - Imagem ${index + 1}`,
  }));

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      index={initialIndex}
      slides={slides}
      plugins={[Zoom]}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
        doubleClickDelay: 300,
        doubleClickMaxStops: 2,
        keyboardMoveDistance: 50,
        wheelZoomDistanceFactor: 100,
        pinchZoomDistanceFactor: 100,
        scrollToZoom: true,
      }}
      carousel={{
        finite: false,
        preload: 2,
      }}
      render={{
        buttonPrev: () => null,
        buttonNext: () => null,
      }}
      controller={{
        closeOnPullDown: true,
        closeOnBackdropClick: true,
      }}
    />
  );
}
