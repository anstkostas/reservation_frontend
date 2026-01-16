import { Badge } from "@/components/ui/badge";

export function ReservationStatusBadge({ status }) {
  return (
    <>
      <Badge variant="outline" className={`min-w-[80px] justify-center ${status === 'active' ? "bg-green-50 text-green-700 border-green-200" :
        status === 'completed' ? "bg-blue-50 text-blue-700 border-blue-200" :
          status === 'no-show' ? "bg-red-50 text-red-700 border-red-200" :
            "bg-gray-100 text-gray-700 border-gray-200"
        }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    </>
  )
}