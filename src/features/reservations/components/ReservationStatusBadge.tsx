import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { ReservationStatus } from "@/types/api";

const STATUS_KEY_MAP = {
  active: "statusActive",
  completed: "statusCompleted",
  canceled: "statusCanceled",
  "no-show": "statusNoShow",
} as const satisfies Record<ReservationStatus, string>;

interface Props {
  status: ReservationStatus;
}

export function ReservationStatusBadge({ status }: Props) {
  const { t } = useTranslation();
  return (
    <Badge
      variant="outline"
      className={`min-w-20 justify-center ${
        status === "active"
          ? "bg-green-50 text-green-700 border-green-200"
          : status === "completed"
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : status === "no-show"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {t(STATUS_KEY_MAP[status])}
    </Badge>
  );
}
