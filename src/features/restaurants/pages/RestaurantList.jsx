import { useRestaurants } from "../useRestaurants";
import { RestaurantCard } from "../components/RestaurantCard";

export default function RestaurantList() {
  const { data: restaurants, isLoading, error } = useRestaurants();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading restaurants...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading restaurants: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Available Restaurants</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-12">
        {restaurants?.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}
