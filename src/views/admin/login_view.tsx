import { AuthLayout } from "../layouts/auth_layout";
import { Alert } from "../components/ui/alert";
import { Icon } from "../components/ui/icon";

interface LoginViewProps {
  errorMessage?: string;
  prefillDni?: string;
}

export function LoginView({ errorMessage, prefillDni }: LoginViewProps) {
  return (
    <AuthLayout title="Acceso Administrativo">
      <div class="text-center mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Acceso al Panel
        </h1>
        <p class="mt-1.5 text-xs sm:text-sm text-neutral-400">
          Ingresa con tu DNI y contraseña de administrador o coordinador
        </p>
      </div>

      <div class="w-full bg-neutral-900 border border-neutral-800/80 rounded-2xl shadow-xl shadow-black/40 p-6 sm:p-8">
        {errorMessage && (
          <div class="mb-5">
            <Alert type="error" message={errorMessage} />
          </div>
        )}

        <form action="/login" method="post" id="loginForm" class="space-y-4">
          {/* Campo DNI */}
          <div>
            <label for="dniInput" class="block text-xs font-semibold text-neutral-300 mb-1.5">
              DNI
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Icon name="table" class="w-4 h-4" />
              </div>
              <input
                type="text"
                id="dniInput"
                name="identifier"
                required
                inputmode="numeric"
                maxlength={8}
                autocomplete="username"
                placeholder="00000000"
                value={prefillDni || ""}
                class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white font-mono tracking-wider text-base py-3 pl-10 pr-4 placeholder:text-neutral-600 focus:bg-neutral-800 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div x-data="{ showPass: false }">
            <label for="passwordInput" class="block text-xs font-semibold text-neutral-300 mb-1.5">
              Contraseña
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Icon name="clock" class="w-4 h-4" />
              </div>
              <input
                x-bind:type="showPass ? 'text' : 'password'"
                type="password"
                id="passwordInput"
                name="password"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full bg-neutral-800 border border-neutral-700/80 rounded-xl text-white text-base py-3 pl-10 pr-10 placeholder:text-neutral-600 focus:bg-neutral-800 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition-all"
              />
              <button
                type="button"
                id="togglePasswordBtn"
                x-on:click="showPass = !showPass"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-200 cursor-pointer"
                title="Mostrar / ocultar contraseña"
              >
                <Icon name="users" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="submitBtn"
            class="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-lg shadow-blue-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>Ingresar al Sistema</span>
            <Icon name="chevron-right" class="w-4 h-4" />
          </button>
        </form>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          const dniInput = document.getElementById("dniInput");
          if (dniInput) {
            dniInput.addEventListener("input", (e) => {
              let clean = e.target.value.replace(/[^0-9]/g, "");
              if (clean.length > 8) clean = clean.slice(0, 8);
              e.target.value = clean;
            });
          }
        `,
        }}
      />
    </AuthLayout>
  );
}
