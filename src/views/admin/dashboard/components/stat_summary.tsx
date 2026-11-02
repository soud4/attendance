import { Icon } from "../../../components/ui/icon";

interface StatSummaryProps {
  totalEvents: number;
  openEvents: number;
  totalAttendances: number;
}

export function StatSummary({ totalEvents, openEvents, totalAttendances }: StatSummaryProps) {
  return (
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
      {/* Total Eventos */}
      <div class="p-3.5 sm:p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex items-center gap-3">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
          <Icon name="calendar" class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <div class="text-xs sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Eventos</div>
          <div class="text-xl sm:text-2xl font-bold text-white font-mono mt-0.5">{totalEvents}</div>
        </div>
      </div>

      {/* Eventos Abiertos */}
      <div class="p-3.5 sm:p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex items-center gap-3">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-950/50 text-emerald-400 flex items-center justify-center shrink-0">
          <Icon name="check" class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <div class="text-xs sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider">En Curso</div>
          <div class="text-xl sm:text-2xl font-bold text-emerald-400 font-mono mt-0.5">{openEvents}</div>
        </div>
      </div>

      {/* Total Asistencias */}
      <div class="col-span-2 md:col-span-1 p-3.5 sm:p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex items-center gap-3">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-950/50 text-blue-400 flex items-center justify-center shrink-0">
          <Icon name="users" class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <div class="text-xs sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider">Asistencias</div>
          <div class="text-xl sm:text-2xl font-bold text-blue-400 font-mono mt-0.5">{totalAttendances}</div>
        </div>
      </div>
    </div>
  );
}
