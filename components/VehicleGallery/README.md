# VehicleGallery Component

Galeria de imagens profissional para veículos usando Swiper e Lightbox.

## Estrutura

```
components/VehicleGallery/
├── VehicleGallery.tsx        # Componente principal
├── VehicleCarousel.tsx       # Carrossel Swiper
├── VehicleLightbox.tsx       # Lightbox com zoom
├── types.ts                  # Tipos TypeScript
└── index.ts                  # Exports
```

## Uso

```tsx
import { VehicleGallery } from "@/components/VehicleGallery";

function VehicleDetails({ vehicle }) {
  const images = vehicle.images || [];

  return (
    <VehicleGallery 
      images={images} 
      vehicleTitle={vehicle.title} 
    />
  );
}
```

## Funcionalidades

### Carrossel (Swiper)
- ✅ Navegação por setas (hover)
- ✅ Swipe em mobile
- ✅ Thumbnails clicáveis
- ✅ Responsivo
- ✅ Lazy loading

### Lightbox
- ✅ Abre na imagem clicada
- ✅ Navegação por setas do teclado (← →)
- ✅ Swipe em mobile
- ✅ Zoom e pan (duplo clique ou scroll)
- ✅ Fecha com ESC ou clique fora

## Dependências

- `swiper` - Carrossel
- `yet-another-react-lightbox` - Lightbox com zoom

## Estilos

Todos os estilos são via Tailwind CSS. Os estilos do Swiper e Lightbox são importados automaticamente.
