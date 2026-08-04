import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-ink-900/5 text-ink-700">
        <Compass size={26} />
      </div>
      <div>
        <h1 className="font-display text-3xl text-ink-900">Página não encontrada</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-600">
          O endereço acessado não existe ou foi movido. Confira o link ou volte para o início.
        </p>
      </div>
      <Link
        to={ROUTES.dashboard}
        className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-ink-900 px-5 text-sm font-medium text-white transition-colors hover:bg-ink-800"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
