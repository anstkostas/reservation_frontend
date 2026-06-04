import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "../../../types/api";
import { useTranslation } from "react-i18next";

interface Props {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: Props) {
  const { t } = useTranslation();
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {restaurant.logoUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={restaurant.logoUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{restaurant.name}</CardTitle>
        <CardDescription>{restaurant.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">{t("restaurantCardCapacity", { capacity: restaurant.capacity })}</div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/restaurants/${restaurant.id}`}>{t("restaurantCardViewButton")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
