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

export function RestaurantCard({ restaurant }) {
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
        <div className="text-sm text-muted-foreground">
          Capacity: {restaurant.capacity} persons
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/restaurants/${restaurant.id}`}>View Details & Book</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
