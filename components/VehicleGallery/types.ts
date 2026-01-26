export interface VehicleGalleryProps {
  images: string[];
  vehicleTitle?: string;
  showThumbnails?: boolean;
  showPagination?: boolean;
}

export interface VehicleCarouselProps {
  images: string[];
  onImageClick: (index: number) => void;
  vehicleTitle?: string;
  showThumbnails?: boolean;
  showPagination?: boolean;
}

export interface VehicleLightboxProps {
  images: string[];
  isOpen: boolean;
  initialIndex: number;
  onClose: () => void;
  vehicleTitle?: string;
}
