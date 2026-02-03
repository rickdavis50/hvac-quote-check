import type { CSSProperties } from "react";
import "./AnalyzingSkull.css";

type Props = {
  stepIndex: number;
  stepLabel: string;
  fileName?: string;
};

const steps = ["Parse", "Scope", "Estimate", "Zip adjust", "Score"];

export default function AnalyzingSkull({ stepIndex, stepLabel, fileName }: Props) {
  const phase = Math.min(1, Math.max(0, stepIndex / 4));

  return (
    <div className="analyzing-shell">
      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="analyzing-title">Pressure testing your quote</div>
          <div className="text-2xl font-semibold md:text-3xl">{stepLabel}</div>
          <p className="analyzing-subhead text-sm">
            Running a deterministic check against our baseline model. No price bias,
            no drift.
          </p>
          {fileName && (
            <div className="rounded-full border border-[#1f1f1f] px-3 py-1 text-xs text-[#bdbdbd]">
              {fileName}
            </div>
          )}
          <ul className="analyzing-steps mt-6">
            {steps.map((step, index) => (
              <li key={step} className={index === stepIndex ? "active" : ""}>
                {step}
              </li>
            ))}
          </ul>
        </div>
        <div className="skull-frame" style={{ "--phase": phase } as CSSProperties}>
          <div className="skull-ink-sheen" />
          <div className="drip" />
          <div className="drip" />
          <div className="drip" />
          <img
            src="/skull-hvac.png"
            alt="Drippy skull"
            className="skull-image"
          />
        </div>
      </div>
    </div>
  );
}
