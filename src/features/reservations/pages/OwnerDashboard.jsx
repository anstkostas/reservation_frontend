import { useState } from "react";
import { Search, CheckCircle2, Users, Calendar, Clock, History, CalendarDays, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useOwnerReservationsQuery, useResolveReservationMutation } from "../queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import OwnerTableViewMobile from "../components/OwnerTableViewMobile";
import OwnerTableViewTabletDesktop from "../components/OwnerTableViewTabletDesktop";

export default function OwnerDashboard() {
  const { data: reservations, isLoading, error } = useOwnerReservationsQuery();
  const resolveMutation = useResolveReservationMutation();
  const [searchTerm, setSearchTerm] = useState("");

  const handleResolve = (id, status) => {
    const action = status === 'completed' ? 'Check in' : 'no-show';
    const loadingMsg = 'Processing...';

    toast.promise(resolveMutation.mutateAsync({ id, status }), {
      loading: loadingMsg,
      success: (data) => data.message || `Guest reservation status updated successfully!`,
      error: (err) => err.message || `Failed to update guest reservation status`,
    });
  };

  const filteredReservations = reservations?.filter((res) => {
    const searchLower = searchTerm.toLowerCase();
    const customerName = `${res.customer?.firstname || ''} ${res.customer?.lastname || ''}`.toLowerCase();
    const customerEmail = res.customer?.email?.toLowerCase() || "";
    return customerName.includes(searchLower) || customerEmail.includes(searchLower);
  }) || [];

  const activeReservations = filteredReservations.filter(r => r.status === 'active');
  const historyReservations = filteredReservations.filter(r => r.status !== 'active');

  // Sort: Active by date ASC (soonest), History by date DESC (recent)
  activeReservations.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
  historyReservations.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-[50vh]">
        <div className="text-destructive">Error loading reservations: {error.message}</div>
      </div>
    );
  }

  function canUpdate(dateString, timeString) {
    const reservationTime = new Date(`${dateString}T${timeString}`);
    const now = new Date();
    return reservationTime <= now;
  }

  function renderTable(activeReservations, showActions) {
    return (
      <>
        <div className="hidden md:block rounded-md border">
          <OwnerTableViewTabletDesktop activeReservations={activeReservations} canUpdate={canUpdate} handleResolve={handleResolve} resolveMutation={resolveMutation} showActions={showActions} />
        </div>

        <div className="md:hidden space-y-4">
          <OwnerTableViewMobile activeReservations={activeReservations} canUpdate={canUpdate} handleResolve={handleResolve} resolveMutation={resolveMutation} showActions={showActions} />
        </div>
      </>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your restaurant's active reservations.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
          <TabsTrigger value="active">
            <CalendarDays className="mr-2 h-4 w-4" />
            Active ({activeReservations.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            History ({historyReservations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Arrivals</CardTitle>
              <CardDescription>
                Upcoming reservations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTable(activeReservations, true)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Reservation History</CardTitle>
              <CardDescription>
                Completed and canceled past reservations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTable(historyReservations, false)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
