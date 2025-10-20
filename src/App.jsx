import React, { useEffect, useState, useRef, useMemo, useCallback, Suspense } from "react";
import {
  fetchProviders,
  fetchAppointments,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  searchProviders,
} from "./api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AssistantSection from "./AssistantSection";
import Spinner from "@/components/Spinner";

// Lazy load non-critical views
const ProvidersView = React.lazy(() => import("./views/ProvidersView"));
const AppointmentsView = React.lazy(() => import("./views/AppointmentsView"));

/** Loading Shimmer Component */
function ProviderShimmer() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-custom-gray-200/50 animate-pulse"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-custom-gray-200 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-custom-gray-200 rounded w-1/3" />
              <div className="h-3 bg-custom-gray-200 rounded w-1/2" />
              <div className="h-3 bg-custom-gray-200 rounded w-1/4" />
              <div className="flex space-x-2 mt-4">
                <div className="h-8 bg-custom-gray-200 rounded-lg w-20" />
                <div className="h-8 bg-custom-gray-200 rounded-lg w-20" />
                <div className="h-8 bg-custom-gray-200 rounded-lg w-20" />
        </div>
      </div>
    </div>
        </div>
      ))}
    </div>
  );
}

/** Inline ProviderSearch component */
function ProviderSearch({ onResults, onSearchStateChange }) {
  const inputRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    const q = inputRef.current?.value.trim();
    if (!q) return;

    setIsSearching(true);
    setSearchQuery(q);
    onSearchStateChange?.(true);
    
    try {
      const res = await searchProviders(q);
      // normalize slots to { iso, label }
      const normalized = (res || []).map((p) => ({
        ...p,
        slots: (p.slots || []).map((s) => ({
          iso: s.start,
          label: new Date(s.start).toLocaleString(),
        })),
      }));
      onResults(normalized);
    } catch (error) {
      console.error("Search error:", error);
      onResults([]);
    } finally {
      setIsSearching(false);
      onSearchStateChange?.(false);
    }
  }

  return (
            <div>
      <form onSubmit={onSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            placeholder="Search providers, specialty, or location…"
            className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border border-custom-gray-200/50 rounded-2xl focus:ring-2 focus:ring-curious-blue-500/20 focus:border-curious-blue-500 focus:bg-white shadow-sm transition-all duration-200 text-custom-gray-900 placeholder-custom-gray-500"
            disabled={isSearching}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            {isSearching ? (
              <Spinner className="h-5 w-5 text-curious-blue-500" />
                ) : (
              <svg className="h-5 w-5 text-custom-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
                )}
              </div>
            </div>
                  <button
          type="submit"
          disabled={isSearching}
          className="px-6 py-4 rounded-2xl bg-gradient-to-r from-curious-blue-600 to-curious-blue-700 text-white hover:from-curious-blue-700 hover:to-curious-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
          {isSearching ? "Searching..." : "Search"}
                  </button>
      </form>
      
      {/* AI Fallback Prompt */}
      {searchQuery && !isSearching && (
        <div className="mt-4 p-4 bg-gradient-to-r from-curious-blue-50 to-curious-blue-100 border border-curious-blue-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-curious-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🤖</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-curious-blue-800">No results found for "{searchQuery}"</p>
              <p className="text-xs text-curious-blue-600 mt-1">Would you like me to suggest available specialists nearby?</p>
            </div>
            <button 
              onClick={() => {
                setSearchQuery("");
                if (inputRef.current) {
                  inputRef.current.value = "Show me available cardiologists near me";
                  inputRef.current.focus();
                }
              }}
              className="ml-auto px-4 py-2 bg-curious-blue-500 text-white rounded-lg hover:bg-curious-blue-600 transition-colors text-sm font-medium"
            >
              Get Suggestions
            </button>
          </div>
      </div>
      )}
    </div>
  );
}

export default function App() {
  const [providers, setProviders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [booking, setBooking] = useState(false);
  const [chatInput, setChatInput] = useState(""); // New state for chat input
  const [activeView, setActiveView] = useState("dashboard"); // Track active sidebar view
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state
  const [recentlyBooked, setRecentlyBooked] = useState([]); // Track recently booked appointments
  const [showBookingSuccess, setShowBookingSuccess] = useState(false); // Show booking success animation
  const [cancelledAppointment, setCancelledAppointment] = useState(null); // Track cancelled appointment for undo
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false); // Show undo snackbar
  const [isSearchingProviders, setIsSearchingProviders] = useState(false); // Track provider search state

  // Load initial data
  useEffect(() => {
    (async () => {
      try {
        const [prov, appts] = await Promise.all([
          fetchProviders(),
          fetchAppointments(),
        ]);

        // Transform provider + slot data
        setProviders(
          (prov || []).map((p) => ({
            ...p,
            slots: (p.slots || []).map((s) => ({
              iso: s.start,
              label: new Date(s.start).toLocaleString(),
            })),
          }))
        );

        // Transform appointment data
        setAppointments(
          (appts || []).map((a) => ({
            id: a.id,
            patient: a.patient_name,
            doctor: a.doctor,
            location: a.location,
            time: new Date(a.start).toLocaleString(),
            status: a.status,
            providerId: a.provider_id,
          }))
        );

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
        setLoading(false);
      }
    })();
  }, []);

  // Select a slot
  const handleSlotSelect = useCallback((provider, slot) => {
    setSelectedProvider(provider);
    setSelectedSlot(slot);
  }, []);

  // Book an appointment
  const handleBook = useCallback(async () => {
    if (!selectedProvider || !selectedSlot) return;
    
    setBooking(true);
    try {
      const created = await createAppointment({
        providerId: selectedProvider.id,
        patientName: "Demo User",
        start: selectedSlot.iso,
      });
      
      const newAppointment = {
        id: created.id,
        patient: created.patient_name,
        doctor: created.doctor,
        location: created.location,
        time: new Date(created.start).toLocaleString(),
        status: created.status,
        providerId: created.provider_id,
      };
      
      setAppointments((prev) => [newAppointment, ...prev]);
      
      // Add to recently booked with timestamp
      setRecentlyBooked((prev) => [
        { ...newAppointment, bookedAt: Date.now() },
        ...prev.slice(0, 2) // Keep only last 3
      ]);
      
      // Show success animation
      setShowBookingSuccess(true);
      setTimeout(() => setShowBookingSuccess(false), 3000);
      
      // Clear selection after booking
      setSelectedProvider(null);
      setSelectedSlot(null);
      
    } catch (err) {
      console.error(err);
      alert("Error booking appointment");
    } finally {
      setBooking(false);
    }
  }, [selectedProvider, selectedSlot]);

  // Cancel an appointment
  const handleCancel = useCallback(async (appt) => {
    try {
      await cancelAppointment(appt.id);
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appt.id ? { ...a, status: "cancelled" } : a
        )
      );
      
      // Store cancelled appointment for undo
      setCancelledAppointment(appt);
      setShowUndoSnackbar(true);
      
      // Auto-hide undo snackbar after 5 seconds
      setTimeout(() => {
        setShowUndoSnackbar(false);
        setCancelledAppointment(null);
      }, 5000);
      
    } catch (err) {
      console.error(err);
      alert("Error canceling appointment");
    }
  }, []);

  // Undo cancel
  const handleUndoCancel = useCallback(async () => {
    if (!cancelledAppointment) return;
    
    try {
      // Restore appointment status
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === cancelledAppointment.id ? { ...a, status: "confirmed" } : a
        )
      );
      
      // Hide snackbar
      setShowUndoSnackbar(false);
      setCancelledAppointment(null);
      
    } catch (err) {
      console.error(err);
      alert("Error undoing cancellation");
    }
  }, [cancelledAppointment]);

  // Reschedule an appointment
  const handleReschedule = useCallback(async (appt, newSlot) => {
    try {
      const updated = await rescheduleAppointment(appt.id, newSlot.iso);
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appt.id
            ? {
                ...a,
                time: new Date(updated.start).toLocaleString(),
                status: updated.status,
              }
            : a
        )
      );
    } catch (err) {
      console.error(err);
      alert("Error rescheduling appointment");
    }
  }, []);

  // Precompute derived values to avoid IIFEs in JSX
  const today = new Date();
  const todayAppointments = appointments
    .filter(a => new Date(a.time).toDateString() === today.toDateString() && a.status !== "cancelled")
    .sort((a, b) => new Date(a.time) - new Date(b.time));
  const nextAppointmentToday = todayAppointments[0];

  const nextAppointmentGlobal = appointments
    .filter(a => a.status !== "cancelled")
    .sort((a, b) => new Date(a.time) - new Date(b.time))[0];

  // Format today's date for header
  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Memoized provider cards for providers view
  const providerCards = useMemo(() => 
    providers.map((provider) => (
      <Card key={provider.id} className="p-6 hover:shadow-lg transition-all duration-300 border-custom-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-curious-blue-500 to-curious-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">👨‍⚕️</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-custom-gray-900">{provider.doctor}</h3>
            <p className="text-sm font-semibold text-curious-blue-600">{provider.specialty}</p>
          </div>
        </div>
        <div className="flex items-center text-sm text-custom-gray-600 mb-4">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {provider.location}
        </div>
        <div className="text-sm text-custom-gray-600">
          <span className="font-medium">Available Slots:</span> {provider.slots?.length || 0}
        </div>
      </Card>
    )), [providers]);

  // Memoized appointment cards for appointments view
  const appointmentCards = useMemo(() => 
    appointments.map((a) => (
      <Card
        key={a.id}
        className="p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white/80 backdrop-blur-sm border border-custom-gray-200/50 rounded-xl shadow-md"
      >
        <div>
          <h3 className="font-bold text-custom-gray-900">{a.doctor}</h3>
          <p className="text-sm text-custom-gray-600">{a.location}</p>
          <p className="text-sm font-semibold text-curious-blue-600 mt-1">
            {a.time} — <span className={`font-bold ${a.status === 'cancelled' ? 'text-red-600' : 'text-fern-600'}`}>{a.status}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="destructive"
            onClick={() => handleCancel(a)}
            disabled={a.status === "cancelled"}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              handleReschedule(a, {
                iso: new Date(Date.now() + 3600000).toISOString(),
                label: "Next Hour",
              })
            }
            className="px-6 py-3 bg-gradient-to-r from-custom-gray-600 to-custom-gray-700 hover:from-custom-gray-700 hover:to-custom-gray-800 text-white disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            Reschedule
          </Button>
        </div>
      </Card>
    )), [appointments, handleCancel, handleReschedule]);

  // Memoized dashboard provider cards with slots
  const dashboardProviderCards = useMemo(() => 
    providers.map((p) => {
      const hasSelectedSlot = selectedProvider?.id === p.id;
      return (
        <Card 
          key={p.id} 
          className={`p-6 transition-all duration-300 ${
            hasSelectedSlot 
              ? 'ring-2 ring-curious-blue-500 bg-gradient-to-br from-curious-blue-50 to-curious-blue-100 border-curious-blue-300 shadow-lg scale-105' 
              : 'hover:shadow-lg hover:scale-105 border-custom-gray-200/50 bg-white/80 backdrop-blur-sm'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-curious-blue-500 to-curious-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">👨‍⚕️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-custom-gray-900">{p.doctor}</h3>
                <p className="text-sm font-semibold text-curious-blue-600">{p.specialty}</p>
              </div>
            </div>
            {hasSelectedSlot && (
              <span className="text-xs bg-curious-blue-500 text-white px-3 py-1.5 rounded-full font-semibold shadow-sm">
                Selected
              </span>
            )}
          </div>
          <div className="flex items-center text-sm text-custom-gray-600 mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {p.location}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-custom-gray-800">Available Time Slots</p>
            <div className="flex flex-wrap gap-2">
              {(p.slots || []).map((s, index) => {
                const isSelected = selectedProvider?.id === p.id && selectedSlot?.iso === s.iso;
                const isBooking = booking && isSelected;
                return (
                  <button
                    key={s.id || `${s.iso}-${index}`}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-curious-blue-600 to-curious-blue-700 text-white shadow-lg scale-105' 
                        : 'bg-custom-gray-100 hover:bg-custom-gray-200 text-custom-gray-700 hover:shadow-md hover:scale-105'
                    }`}
                    onClick={() => !booking && handleSlotSelect(p, s)}
                    disabled={booking}
                  >
                    {isBooking ? (
                      <div className="flex items-center">
                        <Spinner className="-ml-1 mr-2 h-3 w-3" />
                        Booking...
                      </div>
                    ) : (
                      s.label
                    )}
                  </button>
                );
              })}
              {(p.slots || []).length === 0 && (
                <div className="w-full text-center py-4">
                  <span className="text-sm text-custom-gray-500 font-medium">No available slots</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      );
    }), [providers, selectedProvider, selectedSlot, booking, handleSlotSelect]);

  // Memoized dashboard appointment cards
  const dashboardAppointmentCards = useMemo(() => 
    appointments.map((a, index) => (
      <Card
        key={a.id}
        className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 animate-slideIn motion-reduce:animate-none"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div>
          <h3 className="font-medium">{a.doctor}</h3>
          <p className="text-sm text-custom-gray-600">{a.location}</p>
          <p className="text-sm text-custom-gray-700">
            {a.time} — {a.status}
          </p>
        </div>
        <div className="space-x-2">
          <Button
            variant="destructive"
            onClick={() => handleCancel(a)}
            disabled={a.status === "cancelled"}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              handleReschedule(a, {
                iso: new Date(Date.now() + 3600000).toISOString(),
                label: "Next Hour",
              })
            }
          >
            Reschedule
          </Button>
        </div>
      </Card>
    )), [appointments, handleCancel, handleReschedule]);

  if (loading) return <p className="p-4">Loading data...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <>
      <div className="h-screen flex overflow-hidden bg-gradient-to-br from-custom-gray-50 via-white to-curious-blue-50">

          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div 
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-50 md:z-auto transition-transform duration-300 ease-in-out md:flex md:flex-shrink-0`}>
        <div className="flex flex-col w-72">
          {/* Sidebar Header */}
          <div className="flex flex-col h-0 flex-1 bg-white/80 backdrop-blur-xl border-r border-custom-gray-200/50 shadow-xl">
            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
              <div className="flex items-center justify-between flex-shrink-0 px-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-curious-blue-600 to-curious-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">🏥</span>
                  </div>
                  <div className="ml-4">
                    <h1 className="text-xl font-bold text-custom-gray-900 tracking-tight">Patient Scheduler</h1>
                    <p className="text-sm text-custom-gray-500 font-medium">Cardiology Management</p>
                  </div>
                </div>
                {/* Mobile Close Button */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden p-2 text-custom-gray-500 hover:text-custom-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
                  {/* Navigation */}
                  <nav className="mt-10 flex-1 px-3 space-y-2">
                    <button 
                      onClick={() => {
                        setActiveView("dashboard");
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-md ${
                        activeView === "dashboard" 
                          ? "bg-gradient-to-r from-curious-blue-50 to-curious-blue-100 text-curious-blue-700 shadow-sm border border-curious-blue-200/50" 
                          : "text-custom-gray-600 hover:bg-gradient-to-r hover:from-custom-gray-50 hover:to-custom-gray-100 hover:text-custom-gray-900"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors duration-200 ${
                        activeView === "dashboard" 
                          ? "bg-gradient-to-br from-curious-blue-500 to-curious-blue-600 shadow-sm" 
                          : "bg-custom-gray-100 group-hover:bg-custom-gray-200"
                      }`}>
                        <svg className={`h-4 w-4 ${activeView === "dashboard" ? "text-white" : "text-custom-gray-600 group-hover:text-custom-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      Dashboard
                    </button>
                    <button 
                      onClick={() => {
                        setActiveView("providers");
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-sm ${
                        activeView === "providers" 
                          ? "bg-gradient-to-r from-curious-blue-50 to-curious-blue-100 text-curious-blue-700 shadow-sm border border-curious-blue-200/50" 
                          : "text-custom-gray-600 hover:bg-gradient-to-r hover:from-custom-gray-50 hover:to-custom-gray-100 hover:text-custom-gray-900"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors duration-200 ${
                        activeView === "providers" 
                          ? "bg-gradient-to-br from-curious-blue-500 to-curious-blue-600 shadow-sm" 
                          : "bg-custom-gray-100 group-hover:bg-custom-gray-200"
                      }`}>
                        <svg className={`h-4 w-4 ${activeView === "providers" ? "text-white" : "text-custom-gray-600 group-hover:text-custom-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      Providers
                    </button>
                    <button 
                      onClick={() => {
                        setActiveView("appointments");
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-sm ${
                        activeView === "appointments" 
                          ? "bg-gradient-to-r from-curious-blue-50 to-curious-blue-100 text-curious-blue-700 shadow-sm border border-curious-blue-200/50" 
                          : "text-custom-gray-600 hover:bg-gradient-to-r hover:from-custom-gray-50 hover:to-custom-gray-100 hover:text-custom-gray-900"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors duration-200 ${
                        activeView === "appointments" 
                          ? "bg-gradient-to-br from-curious-blue-500 to-curious-blue-600 shadow-sm" 
                          : "bg-custom-gray-100 group-hover:bg-custom-gray-200"
                      }`}>
                        <svg className={`h-4 w-4 ${activeView === "appointments" ? "text-white" : "text-custom-gray-600 group-hover:text-custom-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      Appointments
                    </button>
                    <button 
                      onClick={() => {
                        setActiveView("chat");
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-sm ${
                        activeView === "chat" 
                          ? "bg-gradient-to-r from-curious-blue-50 to-curious-blue-100 text-curious-blue-700 shadow-sm border border-curious-blue-200/50" 
                          : "text-custom-gray-600 hover:bg-gradient-to-r hover:from-custom-gray-50 hover:to-custom-gray-100 hover:text-custom-gray-900"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors duration-200 ${
                        activeView === "chat" 
                          ? "bg-gradient-to-br from-curious-blue-500 to-curious-blue-600 shadow-sm" 
                          : "bg-custom-gray-100 group-hover:bg-custom-gray-200"
                      }`}>
                        <svg className={`h-4 w-4 ${activeView === "chat" ? "text-white" : "text-custom-gray-600 group-hover:text-custom-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      Chat
                    </button>
                    <button 
                      onClick={() => {
                        setActiveView("settings");
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-sm ${
                        activeView === "settings" 
                          ? "bg-gradient-to-r from-curious-blue-50 to-curious-blue-100 text-curious-blue-700 shadow-sm border border-curious-blue-200/50" 
                          : "text-custom-gray-600 hover:bg-gradient-to-r hover:from-custom-gray-50 hover:to-custom-gray-100 hover:text-custom-gray-900"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors duration-200 ${
                        activeView === "settings" 
                          ? "bg-gradient-to-br from-curious-blue-500 to-curious-blue-600 shadow-sm" 
                          : "bg-custom-gray-100 group-hover:bg-custom-gray-200"
                      }`}>
                        <svg className={`h-4 w-4 ${activeView === "settings" ? "text-white" : "text-custom-gray-600 group-hover:text-custom-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      Settings
                    </button>
                  </nav>
            </div>
            
                {/* Next Appointment Summary */}
                {appointments.length > 0 && (
                  <div className="flex-shrink-0 border-t border-custom-gray-200/50 p-6">
                    <div className="bg-gradient-to-r from-fern-50 to-fern-100 border border-fern-200/50 rounded-xl p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-fern-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm">📅</span>
                        </div>
                        <h3 className="text-sm font-semibold text-fern-800">Next Appointment</h3>
                      </div>
                      {nextAppointmentGlobal ? (
                          <div className="space-y-2">
                          <p className="text-sm font-medium text-fern-700">{nextAppointmentGlobal.doctor}</p>
                          <p className="text-xs text-fern-600">{nextAppointmentGlobal.time}</p>
                          <p className="text-xs text-fern-500">{nextAppointmentGlobal.location}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              nextAppointmentGlobal.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                              {nextAppointmentGlobal.status}
                              </span>
                              <button 
                                onClick={() => setActiveView("appointments")}
                                className="text-xs text-fern-600 hover:text-fern-800 font-medium"
                              >
                                View All →
                              </button>
                            </div>
                          </div>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Quick Actions in Sidebar */}
                <div className="flex-shrink-0 flex border-t border-custom-gray-200/50 p-6">
                  <div className="flex-shrink-0 w-full group block">
                    <div className="flex items-center">
                      <div className="w-full">
                        <p className="text-sm font-semibold text-custom-gray-800 mb-4">Quick Actions</p>
                        <div className="space-y-2">
                          <button 
                            onClick={() => setChatInput("Book an appointment")}
                            className="w-full text-left px-4 py-3 text-sm bg-gradient-to-r from-curious-blue-50 to-curious-blue-100 hover:from-curious-blue-100 hover:to-curious-blue-200 border border-curious-blue-200/50 rounded-xl transition-all duration-200 hover:shadow-sm group"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-curious-blue-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-200">
                                <span className="text-white text-sm">📅</span>
                              </div>
                              <span className="font-medium text-curious-blue-800">Book Appointment</span>
                            </div>
                          </button>
                          <button 
                            onClick={() => setChatInput("Show available providers")}
                            className="w-full text-left px-4 py-3 text-sm bg-gradient-to-r from-custom-gray-50 to-custom-gray-100 hover:from-custom-gray-100 hover:to-custom-gray-200 border border-custom-gray-200/50 rounded-xl transition-all duration-200 hover:shadow-sm group"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-custom-gray-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-200">
                                <span className="text-white text-sm">👨‍⚕️</span>
                              </div>
                              <span className="font-medium text-custom-gray-800">Find Providers</span>
                            </div>
                          </button>
              <button
                            onClick={() => setChatInput("Cancel my appointment")}
                            className="w-full text-left px-4 py-3 text-sm bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-200/50 rounded-xl transition-all duration-200 hover:shadow-sm group"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-200">
                                <span className="text-white text-sm">❌</span>
                              </div>
                              <span className="font-medium text-red-800">Cancel Appointment</span>
                            </div>
              </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
          </div>
            </div>
          </div>

      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top Bar */}
        <header role="banner" className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
          <div className="max-w-7xl mx-auto h-16 sm:h-20 px-4 sm:px-6 md:px-8 flex items-center justify-between">
            {/* Left: logo + title */}
            <div className="min-w-0 flex items-center gap-4">
              {/* Mobile menu button (shown on small screens only) */}
              <button
                onClick={() => setSidebarOpen((s) => !s)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Open navigation"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-curious-blue-600 to-curious-blue-700 text-white grid place-items-center shadow-lg shrink-0">
                🏥
            </div>

              <div className="min-w-0">
                <h1 className="text-xl font-bold text-slate-900 truncate">
                  Patient Scheduler
                </h1>
                <p className="text-sm text-slate-500">Cardiology Management</p>
              </div>
              </div>

            {/* Right: date, assistant status, avatar */}
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="hidden md:inline text-sm text-slate-500 font-medium">{todayStr}</span>

              <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Assistant online
              </span>

              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">Welcome back!</p>
                <p className="text-xs text-slate-500">Ready to schedule?</p>
              </div>

              <button
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-curious-blue-500 to-curious-blue-600 text-white font-bold grid place-items-center shadow-lg hover:shadow-xl transition-shadow"
                aria-label="Open user menu"
              >
                U
              </button>
            </div>
          </div>
        </header>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-y-auto focus:outline-none content-container">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    {/* Today Summary Card */}
                    {activeView === "dashboard" && (
                      <div className="today-summary section-primary">
                      <div className="today-summary-content">
                        <h2>Today's Summary</h2>
                        {!nextAppointmentToday ? (
                              <div className="today-summary-no-appointments">
                                <div className="today-summary-no-appointments-icon">
                                  <span>🎉</span>
                                </div>
                                <div className="today-summary-no-appointments-content">
                                  <h3>No appointments today</h3>
                                  <p>You're all set! Enjoy your day.</p>
                                </div>
                              </div>
                        ) : (
                            <div className="today-summary-appointment">
                              <div className="today-summary-appointment-icon">
                                <span>📅</span>
                              </div>
                              <div className="today-summary-appointment-details">
                              <h3>Next: {nextAppointmentToday.doctor}</h3>
                                <p className="appointment-time">
                                🕐 {new Date(nextAppointmentToday.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="appointment-location">
                                ❤️ Location: {nextAppointmentToday.location}
                                </p>
                              <span className={`appointment-status ${nextAppointmentToday.status}`}>
                                {nextAppointmentToday.status}
                                </span>
                                {todayAppointments.length > 1 && (
                                  <div className="mt-2 text-sm text-gray-600">
                                    +{todayAppointments.length - 1} more appointments today
                                  </div>
                                )}
                              </div>
                            </div>
                        )}
                      </div>
                      <div className="today-summary-date">
                        <small>
                          {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </small>
                      </div>
                    </div>
                  )}
                  {/* View-specific content based on activeView */}
                    {activeView === "settings" && (
                      <div className="mb-8">
                        <div className="card-primary section-primary">
                        <h2 className="text-2xl font-bold text-custom-gray-900 mb-6">Settings</h2>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold text-custom-gray-800 mb-3">AI Assistant Preferences</h3>
                            <p className="text-sm text-custom-gray-600">Customize your AI assistant experience in the chat interface above.</p>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-custom-gray-800 mb-3">Account Information</h3>
                            <p className="text-sm text-custom-gray-600">Manage your profile and notification preferences.</p>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-custom-gray-800 mb-3">Privacy & Security</h3>
                            <p className="text-sm text-custom-gray-600">Control your data and privacy settings.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                    {activeView === "providers" && (
                      <Suspense fallback={<ProviderShimmer />}>
                        <ProvidersView providerCards={providerCards} />
                      </Suspense>
                  )}

                    {activeView === "appointments" && (
                      <Suspense fallback={<ProviderShimmer />}>
                        <AppointmentsView 
                          appointments={appointments} 
                          appointmentCards={appointmentCards} 
                        />
                      </Suspense>
                  )}

                  {/* Chat View */}
                    {activeView === "chat" && (
                      <div className="mb-8">
                        <AssistantSection
                            initialInput={chatInput}
                            onBooked={(created) =>
                              setAppointments((a) => [
                                {
                                  id: created.id,
                                  patient: created.patient_name,
                                  doctor: created.doctor,
                                  location: created.location,
                                  time: new Date(created.start).toLocaleString(),
                                  status: created.status,
                                  providerId: created.provider_id,
                                },
                                ...a,
                              ])
                            }
                            onCancelled={(id) =>
                              setAppointments((a) =>
                                a.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x))
                              )
                            }
                            onRescheduled={(updated) =>
                              setAppointments((a) =>
                                a.map((x) =>
                                  x.id === updated.id
                                    ? {
                                        ...x,
                                        time: new Date(updated.start).toLocaleString(),
                                        status: updated.status,
                                      }
                                    : x
                                )
                              )
                            }
                          />
                    </div>
                  )}

                    {/* Chat Assistant - Top Section (Dashboard only) */}
                    {activeView === "dashboard" && (
                      <div className="mb-8">
                        <AssistantSection
                      initialInput={chatInput}
                      onBooked={(created) =>
                        setAppointments((a) => [
                          {
                            id: created.id,
                            patient: created.patient_name,
                            doctor: created.doctor,
                            location: created.location,
                            time: new Date(created.start).toLocaleString(),
                            status: created.status,
                            providerId: created.provider_id,
                          },
                          ...a,
                        ])
                      }
                      onCancelled={(id) =>
                        setAppointments((a) =>
                          a.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x))
                        )
                      }
                      onRescheduled={(updated) =>
                        setAppointments((a) =>
                          a.map((x) =>
                            x.id === updated.id
                              ? {
                                  ...x,
                                  time: new Date(updated.start).toLocaleString(),
                                  status: updated.status,
                                }
                              : x
                          )
                        )
                      }
                    />
          </div>
                    )}

                {/* Search Bar Section */}
                <div className="mt-6">
                  <div className="card-secondary section-primary">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-custom-gray-900">Find Providers</h3>
                      <div className="text-sm text-custom-gray-500 font-medium">
                        Search by name, specialty, or location
                      </div>
                    </div>
                    <ProviderSearch 
                      onResults={(list) => setProviders(list)} 
                      onSearchStateChange={setIsSearchingProviders}
                    />
        </div>
      </div>

              {/* Content Grid */}
              <div className="dashboard-layout grid lg:grid-cols-2 gap-6">
                {/* Left Column - Providers */}
                <div className="space-y-6">
                        {/* Provider List */}
                        <section className="card-primary section-secondary">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-custom-gray-900">Available Providers</h2>
                      <div className="text-sm text-custom-gray-500 font-medium">
                        {providers.length} {providers.length === 1 ? 'provider' : 'providers'} available
                      </div>
                    </div>
                    {isSearchingProviders ? (
                      <ProviderShimmer />
                    ) : providers.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-custom-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">👨‍⚕️</span>
                        </div>
                        <p className="text-custom-gray-600 font-medium">No providers found.</p>
                        <p className="text-sm text-custom-gray-500 mt-1">Try adjusting your search criteria</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-1 xl:grid-cols-2 gap-6">
                        {dashboardProviderCards}
                      </div>
                    )}
                  </section>
                </div>

                {/* Right Column - Appointments & Booking */}
                <div className="space-y-6">
                  {/* Booking Confirmation */}
                  {selectedProvider && selectedSlot && (
                    <section className="bg-fern-50 border border-fern-200 rounded-lg p-4">
                      <h2 className="text-lg font-semibold mb-3 text-fern-800">Confirm Your Appointment</h2>
                      <div className="bg-white rounded-lg p-4 border border-fern-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h3 className="font-medium text-custom-gray-900">{selectedProvider.doctor}</h3>
                            <p className="text-sm text-custom-gray-600">{selectedProvider.specialty}</p>
                            <p className="text-sm text-custom-gray-500">{selectedProvider.location}</p>
                            <p className="text-sm font-medium text-curious-blue-600 mt-2">
                              📅 {new Date(selectedSlot.iso).toLocaleDateString()} at {new Date(selectedSlot.iso).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedProvider(null);
                                setSelectedSlot(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleBook}
                              disabled={booking}
                              className="bg-fern-600 hover:bg-fern-700 text-white disabled:opacity-50"
                            >
                              {booking ? (
                                <>
                                  <Spinner className="-ml-1 mr-2 h-4 w-4 text-white" />
                                  Booking...
                                </>
                              ) : (
                                'Book Appointment'
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Recently Booked Section */}
                  {recentlyBooked.length > 0 && (
                    <section className="bg-gradient-to-r from-fern-50 to-fern-100 rounded-2xl shadow-xl border border-fern-200/50 p-6 mb-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-fern-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">🕒</span>
                        </div>
                        <h3 className="text-lg font-semibold text-fern-800">Recently Booked</h3>
                      </div>
                      <div className="space-y-3">
                        {recentlyBooked.slice(0, 2).map((appt, index) => (
                          <div key={appt.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-fern-200/50 shadow-sm animate-slideIn motion-reduce:animate-none">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-fern-800">{appt.doctor}</p>
                                <p className="text-sm text-fern-600">{appt.time}</p>
                                <p className="text-xs text-fern-500">{appt.location}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-fern-500">
                                  {Math.round((Date.now() - appt.bookedAt) / 1000 / 60)}m ago
                                </span>
                                <div className="mt-1">
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                    ✅ Booked
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                        {/* Appointment Dashboard */}
                        <section className="card-secondary section-primary">
                    <h2 className="text-xl font-semibold mb-4 text-custom-gray-900">My Appointments</h2>
                    {appointments.length === 0 ? (
                      <p>No appointments yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {dashboardAppointmentCards}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
      {/* Success Animation */}
      {showBookingSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none" aria-live="polite">
          <div className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl animate-bounce motion-reduce:animate-none">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <span className="text-lg font-semibold">Appointment Booked Successfully!</span>
            </div>
          </div>
        </div>
      )}

      {/* Undo Snackbar */}
      {showUndoSnackbar && cancelledAppointment && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50" aria-live="polite">
          <div className="bg-custom-gray-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between animate-slideIn motion-reduce:animate-none">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-sm">❌</span>
              </div>
              <div>
                <p className="font-semibold">Appointment Cancelled</p>
                <p className="text-sm text-custom-gray-300">{cancelledAppointment.doctor}</p>
              </div>
            </div>
            <button
              onClick={handleUndoCancel}
              className="ml-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
            >
              Undo
            </button>
          </div>
        </div>
        )}
    </>
  );
}