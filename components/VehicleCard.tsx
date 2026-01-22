import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Vehicle } from "../types";
import { Button, Card, CardContent } from "./ui/core";

interface VehicleCardProps {
  vehicle: Vehicle;
  index?: number;
}

export default function VehicleCard({ vehicle, index = 0 }: VehicleCardProps) {
  return (
    <Link
      to={`/catalogo/${vehicle.id}`}
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
      style={index ? { animationDelay: `${index * 100}ms` } : undefined}
      aria-label={`Ver detalhes de ${vehicle.title} - ${vehicle.year} por ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(vehicle.price)}`}
    >
      <Card className="h-full overflow-hidden border-border bg-card hover:border-primary/50 hover:shadow-lg flex flex-col transition-all duration-300">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={vehicle.images?.[0] || (vehicle as any).image_url}
            alt={`${vehicle.title} - ${vehicle.year}`}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4 md:p-5 flex flex-col gap-2 md:gap-3 flex-1">
          <div>
            <h3 className="font-bold text-lg md:text-xl text-foreground group-hover:text-primary transition-colors mb-1 md:mb-2">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground uppercase leading-relaxed">
              {vehicle.title}
            </p>
          </div>
          
          <div className="mt-auto">
            <div className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(vehicle.price)}
            </div>
            
            <div className="flex items-center justify-between text-sm md:text-base text-muted-foreground mb-6">
              <span>{vehicle.year}</span>
              <span>{vehicle.mileage.toLocaleString()} km</span>
            </div>
            
            <div className="pt-6 border-t border-border">
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-10 md:h-11 text-sm md:text-base font-semibold shadow-sm group-hover:shadow-md transition-all"
                aria-label={`Ver detalhes de ${vehicle.title}`}
              >
                Ver Detalhes
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
