import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { CalendarIcon, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Reservation, ReservationStatus } from "@/types/api";

/** Maps reservation status values to Shadcn Badge variant names. */
const STATUS_BADGE_VARIANT = {
  active: "default",       // primary
  completed: "secondary",  // gray
  canceled: "destructive", // red
  "no-show": "outline",    // neutral
} as const satisfies Record<ReservationStatus, string>;

const STATUS_KEY_MAP = {
  active: "statusActive",
  completed: "statusCompleted",
  canceled: "statusCanceled",
  "no-show": "statusNoShow",
} as const satisfies Record<ReservationStatus, string>;

interface Props {
  reservation: Reservation;
  onClick: (reservation: Reservation) => void;
}

export function ReservationCard({ reservation, onClick }: Props) {
  const { t } = useTranslation();
  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary"
      onClick={() => onClick(reservation)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg line-clamp-1">
              {reservation.restaurantName || `${t("reservationCardRestaurantFallback")} #${reservation.restaurantId}`}
            </CardTitle>
          </div>
          <Badge variant={STATUS_BADGE_VARIANT[reservation.status]}>
            {t(STATUS_KEY_MAP[reservation.status])}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span>
              {format(new Date(reservation.scheduledAt), "EEE, MMM d")} •{" "}
              {format(new Date(reservation.scheduledAt), "HH:mm")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{t(reservation.people === 1 ? "reservationDetailGuestSingular" : "reservationDetailGuestPlural", { count: reservation.people })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
