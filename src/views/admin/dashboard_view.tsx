import type { EventWithStats } from "../../services/event.service";
import { Alert } from "../components/ui/alert";
import { Icon } from "../components/ui/icon";
import { StatSummary } from "./dashboard/components/stat_summary";
import { FilterToolbar } from "./dashboard/components/filter_toolbar";
import { EventCard } from "./dashboard/components/event_card";
import { EventTable } from "./dashboard/components/event_table";
import { QuickCreateModal } from "./dashboard/components/quick_create_modal";

interface DashboardViewProps {
  events: EventWithStats[];
  noticeMessage?: string;
  currentView?: "cards" | "table";
}

export function DashboardView({ events, noticeMessage, currentView = "table" }: DashboardViewProps) {
  const totalEvents = events.length;
  const openEvents = events.filter((e) => e.status === "OPEN").length;
  const totalAttendances = events.reduce((sum, e) => sum + e.attendee_count, 0);

  return (
    <div class="space-y-6">
      {/* Top Action Bar */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white">Eventos Registrados</h1>
          <p class="text-sm text-neutral-400 mt-1">
            Supervisa, administra y controla la asistencia de tus actividades presenciales
          </p>
        </div>

        <div class="flex items-center justify-end gap-3 w-full sm:w-auto">
          {/* View Switcher Toggle (Hidden on mobile, only desktop md+) */}
          <div class="hidden md:flex bg-neutral-900 border border-neutral-800 p-1 rounded-xl items-center gap-1 shadow-sm">
            <a
              href="/admin?view=cards"
              title="Vista de Tarjetas"
              class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === "cards"
                  ? "bg-neutral-800 text-white shadow-sm border border-neutral-700/60"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Icon name="cards" class="w-3.5 h-3.5" />
              <span>Tarjetas</span>
            </a>

            <a
              href="/admin?view=table"
              title="Vista de Tabla"
              class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === "table"
                  ? "bg-neutral-800 text-white shadow-sm border border-neutral-700/60"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Icon name="table" class="w-3.5 h-3.5" />
              <span>Tabla</span>
            </a>
          </div>

          {/* New Event Button */}
          <button
            type="button"
            id="openQuickCreateModalBtn"
            onclick="openQuickCreateModal()"
            class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap w-full sm:w-auto"
          >
            <Icon name="plus" class="w-4 h-4" />
            <span>Nuevo Evento</span>
          </button>
        </div>
      </div>

      {/* Notice / Alert Banner */}
      {noticeMessage && (
        <Alert type="info" message={noticeMessage} />
      )}

      {/* Stat Summary Cards */}
      <StatSummary
        totalEvents={totalEvents}
        openEvents={openEvents}
        totalAttendances={totalAttendances}
      />

      {/* Search, Status Tabs, Date Filter & Sorting Toolbar */}
      {events.length > 0 && (
        <FilterToolbar totalEvents={totalEvents} openEvents={openEvents} />
      )}

      {/* Main Content: Empty State, Cards or Table */}
      {events.length === 0 ? (
        <div class="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div class="w-12 h-12 rounded-2xl bg-neutral-800/80 text-neutral-400 flex items-center justify-center mx-auto mb-3">
            <Icon name="calendar" class="w-6 h-6" />
          </div>
          <h3 class="text-base font-bold text-white">No hay eventos registrados</h3>
          <p class="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Comienza creando tu primer evento presencial para gestionar el registro de asistencia.
          </p>
          <a
            href="/admin/events/new"
            class="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            + Crear Evento
          </a>
        </div>
      ) : currentView === "table" ? (
        <EventTable events={events} />
      ) : (
        <div class="space-y-4" id="eventCardsContainer">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Creation Modal with Leaflet Map */}
      <QuickCreateModal />

      {/* Scripts cliente externos y limpios */}
      <script src="/js/admin/map-picker.js" defer></script>
      <script src="/js/admin/dashboard.js" defer></script>
    </div>
  );
}
