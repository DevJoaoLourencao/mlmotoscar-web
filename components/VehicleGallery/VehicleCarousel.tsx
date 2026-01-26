import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "./VehicleCarousel.css";

import type { VehicleCarouselProps } from "./types";

export function VehicleCarousel({
  images,
  onImageClick,
  vehicleTitle = "Veículo",
  showThumbnails = true,
  showPagination = false,
}: VehicleCarouselProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Nenhuma imagem disponível</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Carrossel Principal */}
      <div className="relative group">
        <Swiper
          modules={[Navigation, Pagination, Thumbs]}
          spaceBetween={10}
          slidesPerView={1}
          loop={images.length > 1}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          pagination={
            showPagination
              ? {
                  clickable: true,
                  el: ".swiper-pagination-custom",
                  bulletClass: "swiper-pagination-bullet",
                  bulletActiveClass: "swiper-pagination-bullet-active",
                }
              : false
          }
          thumbs={
            showThumbnails
              ? {
                  swiper:
                    thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
                }
              : undefined
          }
          onSwiper={setMainSwiper}
          className="w-full rounded-lg overflow-hidden"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] cursor-pointer group/item"
                onClick={() => onImageClick(index)}
              >
                <img
                  src={image}
                  alt={`${vehicleTitle} - Imagem ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Botões de navegação customizados */}
        <button
          className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
          aria-label="Imagem anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
          aria-label="Próxima imagem"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      
      {/* Pagination dots */}
      {showPagination && images.length > 1 && (
        <div className="swiper-pagination-custom mt-4"></div>
      )}

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="relative flex items-center gap-2">
          {/* Botão anterior */}
          <button
            className="swiper-button-prev-thumbs flex-shrink-0 bg-primary hover:bg-primary/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm z-10"
            aria-label="Thumbnails anteriores"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Carrossel de thumbnails */}
          <div className="flex-1 overflow-hidden">
            <Swiper
              modules={[Thumbs, Navigation]}
              onSwiper={setThumbsSwiper}
              spaceBetween={8}
              slidesPerView={4.5}
              loop={images.length > 4}
              navigation={{
                nextEl: ".swiper-button-next-thumbs",
                prevEl: ".swiper-button-prev-thumbs",
              }}
              breakpoints={{
                640: {
                  slidesPerView: 5.5,
                  loop: images.length > 5,
                },
                768: {
                  slidesPerView: 6.5,
                  loop: images.length > 6,
                },
                1024: {
                  slidesPerView: 7.5,
                  loop: images.length > 7,
                },
              }}
              className="w-full"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div
                    className="relative w-full h-20 md:h-24 cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all group/thumb"
                    onClick={() => {
                      mainSwiper?.slideTo(index);
                    }}
                  >
                    <img
                      src={image}
                      alt={`${vehicleTitle} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                      loading="lazy"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Botão próximo */}
          <button
            className="swiper-button-next-thumbs flex-shrink-0 bg-primary hover:bg-primary/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm z-10"
            aria-label="Próximas thumbnails"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
