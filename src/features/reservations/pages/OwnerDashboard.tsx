import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, CalendarDays, History } from "lucide-react";
import { toast } from "sonner";
import { useOwnerReservationsQuery, useResolveReservationMutation } from "@/features/reservations/queries";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OwnerTableViewMobile } from "@/features/reservations/components/OwnerTableViewMobile";
import { OwnerTableViewTabletDesktop } from "@/features/reservations/components/OwnerTableViewTabletDesktop";
import type { ApiError, Reservation, ReservationStatus } from "@/types/api";
import { resolveErrorMessage } from "@/lib/apiError";

/**
 * Main Dashboard for Restaurant Owners.
 *
 * Logic:
 * - Data Fetching: Fetches ALL reservations for the owners restaurant.
 * - Client-Side Filtering:
 *   - Search: Filters by customer name/email.
 *   - Tabs: Splits data into 'Active' (upcoming) and 'History' (completed/no-show).
 * - Sorting:
 *   - Active: Ascending by date (soonest first).
 *   - History: Descending by date (most recent first).
 * - Actions: Allows marking reservations as 'completed' or 'no-show'.
 */
export default function OwnerDashboard() {
  const { t } = useTranslation();
  const { data: reservations, isLoading, error } = useOwnerReservationsQuery();
  const resolveMutation = useResolveReservationMutation();
  const [searchTerm, setSearchTerm] = useState("");

  const handleResolve = (id: string, status: ReservationStatus) => {
    toast.promise(resolveMutation.mutateAsync({ id, status }), {
      loading: t("ownerResolveLoading"),
      success: (data) => data.message || t("ownerResolvedSnackbar"),
      error: (err) => (err as ApiError)?.message || t("ownerResolveError"),
    });
  };

  const filteredReservations: Reservation[] =
    reservations?.filter((reservation) => {
      const searchLower = searchTerm.toLowerCase();
      const customerName =
        `${reservation.customer?.firstname ?? ""} ${reservation.customer?.lastname ?? ""}`.toLowerCase();
      const customerEmail = reservation.customer?.email?.toLowerCase() ?? "";
      return customerName.includes(searchLower) || customerEmail.includes(searchLower);
    }) ?? [];

  // Sort: Active by date ASC (soonest), History by date DESC (recent)
  const activeReservations = filteredReservations
    .filter((r) => r.status === "active")
    .toSorted((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const historyReservations = filteredReservations
    .filter((r) => r.status !== "active")
    .toSorted((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  function canUpdate(scheduledAt: string): boolean {
    return new Date(scheduledAt) <= new Date();
  }

  function renderTable(tableReservations: Reservation[], showActions: boolean) {
    return (
      <>
        <div className="hidden md:block rounded-md border">
          <OwnerTableViewTabletDesktop
            activeReservations={tableReservations}
            canUpdate={canUpdate}
            handleResolve={handleResolve}
            resolveMutation={resolveMutation}
            showActions={showActions}
          />
        </div>

        <div className="md:hidden space-y-4">
          <OwnerTableViewMobile
            activeReservations={tableReservations}
            canUpdate={canUpdate}
            handleResolve={handleResolve}
            resolveMutation={resolveMutation}
            showActions={showActions}
          />
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-[50vh]">
        <div className="animate-pulse text-muted-foreground">{t("ownerDashboardLoading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-[50vh]">
        <div className="text-destructive">{t("reservationsLoadError", { message: resolveErrorMessage(t, error) })}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("ownerDashboardTitle")}</h1>
          <p className="text-muted-foreground mt-1">{t("ownerDashboardSubtitle")}</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("ownerDashboardSearchHint")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-100 grid-cols-2 mb-8">
          <TabsTrigger value="active" className="cursor-pointer">
            <CalendarDays className="mr-2 h-4 w-4" />
            {t("ownerDashboardTabActive", { count: activeReservations.length })}
          </TabsTrigger>
          <TabsTrigger value="history" className="cursor-pointer">
            <History className="mr-2 h-4 w-4" />
            {t("ownerDashboardTabHistory", { count: historyReservations.length })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>{t("ownerDashboardCardActiveTitle")}</CardTitle>
              <CardDescription>{t("ownerDashboardCardActiveSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>{renderTable(activeReservations, true)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>{t("ownerDashboardCardHistoryTitle")}</CardTitle>
              <CardDescription>{t("ownerDashboardCardHistorySubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>{renderTable(historyReservations, false)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
