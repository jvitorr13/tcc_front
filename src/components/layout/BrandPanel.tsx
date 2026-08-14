import { ClipboardCheck, Compass, LineChart, Target } from "lucide-react";

export function BrandPanel() {
  return (
    <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-ink-900 p-10 text-white lg:flex lg:w-[46%] xl:p-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex animate-fade-in-up items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-gold-400">
          <Compass size={18} />
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
          Consultoria Empresarial
        </span>
      </div>

      <div className="relative z-10 animate-fade-in-up">
        <p className="mb-7 max-w-xs font-display text-xl leading-snug text-white/90">
          Diagnóstico, plano de ação e acompanhamento em um só lugar.
        </p>

        <svg
          viewBox="0 0 360 200"
          fill="none"
          className="w-full max-w-md"
          role="img"
          aria-label="Trajetória de maturidade: diagnóstico, plano de ação e crescimento"
        >
          <path
            d="M10 170 C 70 170, 90 120, 130 110 S 190 60, 230 55 S 300 20, 350 15"
            stroke="#B7913C"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-draw-path"
            style={{ ["--path-length" as string]: 520 }}
          />
          {[
            { cx: 10, cy: 170 },
            { cx: 130, cy: 110 },
            { cx: 230, cy: 55 },
            { cx: 350, cy: 15 },
          ].map((p, i) => (
            <circle
              key={i}
              cx={p.cx}
              cy={p.cy}
              r={5}
              fill="#0F1B2D"
              stroke="#B7913C"
              strokeWidth="2"
            />
          ))}
        </svg>

        <dl className="relative z-10 mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-sm">
          <div className="flex items-start gap-2">
            <ClipboardCheck size={18} className="mt-0.5 shrink-0 text-gold-400" />
            <dt className="text-white/70">Diagnóstico guiado</dt>
          </div>
          <div className="flex items-start gap-2">
            <Target size={18} className="mt-0.5 shrink-0 text-gold-400" />
            <dt className="text-white/70">Plano de ação claro</dt>
          </div>
          <div className="flex items-start gap-2">
            <LineChart size={18} className="mt-0.5 shrink-0 text-gold-400" />
            <dt className="text-white/70">Maturidade em evolução</dt>
          </div>
        </dl>
      </div>

    </div>
  );
}
