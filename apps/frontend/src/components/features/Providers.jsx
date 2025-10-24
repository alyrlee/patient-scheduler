import React, { useEffect, useMemo, useState, useRef } from "react";

/** -------- Types (converted to JSDoc for JS) -------- */
/**
 * @typedef {Object} Slot
 * @property {string} id
 * @property {string} timeLabel - e.g., "10:00 AM"
 * @property {string} iso - e.g., "2025-10-24T10:00:00-05:00"
 */

/**
 * @typedef {Object} ProviderItem
 * @property {string} id
 * @property {string} name
 * @property {string} specialty
 * @property {string} location
 * @property {Slot[]} nextSlots - up to ~3 shown; "View all" can navigate to details
 * @property {string} [avatarText] - optional initials for fallback avatar
 */

/**
 * @typedef {Object} Option5ProvidersProps
 * @property {ProviderItem[]} providers - Data already filtered from your backend OR full list if you want frontend filtering
 * @property {string[]} [specialties] - Distinct UI options for filters (provide from API or compute locally)
 * @property {string[]} [locations] - Distinct UI options for filters (provide from API or compute locally)
 * @property {Function} [onSearch] - Called when user hits "Search" (preferred if server-filtered)
 * @property {Function} [onSelectSlot] - Called when user clicks a slot
 * @property {boolean} [loading] - Loading flag for server requests
 * @property {string} [heading] - Optional: text to show above grid (e.g., "12 providers available")
 */

/** -------- Small utilities -------- */
const cls = (...xs) => xs.filter(Boolean).join(" ");

const uniqueSorted = (list) => Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));

/** ===================== Modal ===================== */
function ProviderSlotsModal({
  provider,
  onClose,
  onSelectSlot,
}) {
  const overlayRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const initials =
    provider.avatarText ||
    provider.name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();

  // Optional: group slots by date (YYYY-MM-DD)
  const byDate = provider.nextSlots.reduce((acc, s) => {
    const d = s.iso.slice(0,10);
    (acc[d] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`All slots for ${provider.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onMouseDown={(e) => {
        // click outside content closes
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-curious-blue-100 text-curious-blue-700 flex items-center justify-center font-semibold" aria-hidden>
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{provider.name}</h3>
              <p className="text-sm text-gray-500">{provider.specialty} • {provider.location}</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-curious-blue-500"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-auto">
          {provider.nextSlots.length === 0 ? (
            <p className="text-sm text-gray-500">No available slots.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(byDate).map(([date, slots]) => (
                <div key={date}>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {new Date(date + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => onSelectSlot?.(provider, slot)}
                        className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-curious-blue-50 hover:border-curious-blue-400 focus:outline-none focus:ring-2 focus:ring-curious-blue-500"
                        aria-label={`Book ${slot.timeLabel} on ${date}`}
                      >
                        {slot.timeLabel}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** -------- Provider Card -------- */
function ProviderCard({
  item,
  onSelectSlot,
  onViewAll,
}) {
  const initials =
    item.avatarText ||
    item.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <article
      className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
      aria-label={`${item.name}, ${item.specialty} in ${item.location}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="h-10 w-10 rounded-full bg-curious-blue-100 text-curious-blue-700 flex items-center justify-center font-semibold"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.specialty} • {item.location}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-2">Next Available:</p>

      {item.nextSlots.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2">
            {item.nextSlots.slice(0, 4).map((slot) => (
              <button
                key={slot.id}
                onClick={() => onSelectSlot?.(item, slot)}
                className="px-3 py-1 rounded-md border border-gray-300 text-sm hover:bg-curious-blue-50 hover:border-curious-blue-400 focus:outline-none focus:ring-2 focus:ring-curious-blue-400"
                aria-label={`Book ${slot.timeLabel} with ${item.name}`}
              >
                {slot.timeLabel}
              </button>
            ))}
          </div>
          {item.nextSlots.length > 4 && (
            <button
              onClick={() => onViewAll?.(item)}
              className="mt-3 w-full text-sm text-curious-blue-600 font-medium hover:underline"
            >
              View all slots ({item.nextSlots.length})
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400">No upcoming slots on selected date.</p>
      )}
    </article>
  );
}

/** -------- Skeletons -------- */
function CardSkeleton() {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
      <div className="flex gap-2">
        <div className="h-8 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

/** -------- Empty State -------- */
function EmptyState({ message = "No providers match your filters." }) {
  return (
    <div className="text-center py-12 text-gray-500">
      <div className="text-4xl mb-3">🔍</div>
      <p className="font-medium">{message}</p>
    </div>
  );
}

/** -------- Filter + Cards (main) -------- */
export default function Providers({
  providers,
  specialties,
  locations,
  onSearch,
  onSelectSlot,
  loading,
  heading,
}) {
  console.log('Providers component rendering with:', { providers: providers?.length, loading, heading });
  // local UI state for filters
  const [text, setText] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [location, setLocation] = useState("all");
  const [date, setDate] = useState(null);

  // NEW: modal state
  const [openProvider, setOpenProvider] = useState(null);

  // derive filter lists if not provided
  const specialtyOptions = useMemo(
    () => ["All Specialties", ...(specialties || uniqueSorted(providers.map((p) => p.specialty)))],
    [specialties, providers]
  );
  const locationOptions = useMemo(
    () => ["All Locations", ...(locations || uniqueSorted(providers.map((p) => p.location)))],
    [locations, providers]
  );

  // frontend filtering fallback (used only when onSearch is not provided)
  const filtered = useMemo(() => {
    if (onSearch) return providers; // server-driven; show as-is
    return providers.filter((p) => {
      const textOk =
        !text ||
        p.name.toLowerCase().includes(text.toLowerCase()) ||
        p.specialty.toLowerCase().includes(text.toLowerCase()) ||
        p.location.toLowerCase().includes(text.toLowerCase());
      const specOk = specialty === "all" || p.specialty === specialty;
      const locOk = location === "all" || p.location === location;
      // If date is chosen, show providers that have at least one slot on that date (simple check)
      const dateOk =
        !date ||
        p.nextSlots.some((s) => s.iso.slice(0, 10) === date);
      return textOk && specOk && locOk && dateOk;
    });
  }, [providers, onSearch, text, specialty, location, date]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ text, specialty, location, date });
    }
    // If client-filtered, nothing to do—computed in `filtered`
  };

  // Allow pressing Enter in search input
  const onKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  useEffect(() => {
    // Optional: run an initial search when the component mounts for server-driven flows
    // onSearch?.({ text, specialty, location, date });
  }, []); // eslint-disable-line

  return (
    <section className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{heading || "Find a Provider"}</h2>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search name, specialty, location…"
              className="border rounded-md pl-9 pr-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-curious-blue-500"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Search providers"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>🔎</span>
          </div>

          <select
            className="border rounded-md px-3 py-2 text-sm bg-white"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value === "All Specialties" ? "all" : e.target.value)}
            aria-label="Filter by specialty"
          >
            {specialtyOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select
            className="border rounded-md px-3 py-2 text-sm bg-white"
            value={location}
            onChange={(e) => setLocation(e.target.value === "All Locations" ? "all" : e.target.value)}
            aria-label="Filter by location"
          >
            {locationOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="border rounded-md px-3 py-2 text-sm"
            value={date ?? ""}
            onChange={(e) => setDate(e.target.value || null)}
            aria-label="Filter by date"
          />

          <button
            onClick={handleSearch}
            className={cls(
              "bg-curious-blue-600 text-white px-4 py-2 rounded-md text-sm",
              "hover:bg-curious-blue-700 focus:outline-none focus:ring-2 focus:ring-curious-blue-500"
            )}
          >
            Search
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProviderCard
              key={p.id}
              item={p}
              onSelectSlot={onSelectSlot}
              onViewAll={(provider) => setOpenProvider(provider)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {openProvider && (
        <ProviderSlotsModal
          provider={openProvider}
          onClose={() => setOpenProvider(null)}
          onSelectSlot={(provider, slot) => {
            onSelectSlot?.(provider, slot);
            setOpenProvider(null);
          }}
        />
      )}
    </section>
  );
}

/** -------- Demo data (optional): remove when wiring real API -------- */
export const DEMO_PROVIDERS = [
  {
    id: "p1",
    name: "Dr. Sophia Nguyen",
    specialty: "Cardiology",
    location: "Frisco",
    nextSlots: [
      { id: "p1s1", timeLabel: "10:00 AM", iso: "2025-10-24T10:00:00-05:00" },
      { id: "p1s2", timeLabel: "11:30 AM", iso: "2025-10-24T11:30:00-05:00" },
      { id: "p1s3", timeLabel: "2:00 PM",  iso: "2025-10-24T14:00:00-05:00"  },
      { id: "p1s4", timeLabel: "4:15 PM", iso: "2025-10-24T16:15:00-05:00" },
      { id: "p1s5", timeLabel: "5:30 PM", iso: "2025-10-25T17:30:00-05:00" },
    ],
  },
  {
    id: "p2",
    name: "Dr. Amy Kim",
    specialty: "Dermatology",
    location: "Dallas",
    nextSlots: [
      { id: "p2s1", timeLabel: "9:30 AM", iso: "2025-10-24T09:30:00-05:00" },
      { id: "p2s2", timeLabel: "1:00 PM", iso: "2025-10-24T13:00:00-05:00" },
      { id: "p2s3", timeLabel: "3:45 PM", iso: "2025-10-25T15:45:00-05:00" },
    ],
  },
  {
    id: "p3",
    name: "Dr. Ravi Patel",
    specialty: "Pediatrics",
    location: "Plano",
    nextSlots: [
      { id: "p3s1", timeLabel: "10:15 AM", iso: "2025-10-26T10:15:00-05:00" },
      { id: "p3s2", timeLabel: "12:45 PM", iso: "2025-10-26T12:45:00-05:00" },
      { id: "p3s3", timeLabel: "4:00 PM",  iso: "2025-10-27T16:00:00-05:00"  },
    ],
  },
  {
    id: "p4",
    name: "Dr. Maria Rodriguez",
    specialty: "Internal Medicine",
    location: "McKinney",
    nextSlots: [
      { id: "p4s1", timeLabel: "8:30 AM", iso: "2025-10-24T08:30:00-05:00" },
      { id: "p4s2", timeLabel: "11:00 AM", iso: "2025-10-24T11:00:00-05:00" },
      { id: "p4s3", timeLabel: "2:30 PM", iso: "2025-10-24T14:30:00-05:00" },
      { id: "p4s4", timeLabel: "4:45 PM", iso: "2025-10-24T16:45:00-05:00" },
    ],
  },
  {
    id: "p5",
    name: "Dr. James Wilson",
    specialty: "Family Medicine",
    location: "Allen",
    nextSlots: [
      { id: "p5s1", timeLabel: "9:00 AM", iso: "2025-10-24T09:00:00-05:00" },
      { id: "p5s2", timeLabel: "1:30 PM", iso: "2025-10-24T13:30:00-05:00" },
    ],
  },
  {
    id: "p6",
    name: "Dr. Sarah Chen",
    specialty: "Cardiology",
    location: "Dallas",
    nextSlots: [
      { id: "p6s1", timeLabel: "10:30 AM", iso: "2025-10-24T10:30:00-05:00" },
      { id: "p6s2", timeLabel: "3:00 PM", iso: "2025-10-24T15:00:00-05:00" },
      { id: "p6s3", timeLabel: "5:15 PM", iso: "2025-10-24T17:15:00-05:00" },
    ],
  },
];
