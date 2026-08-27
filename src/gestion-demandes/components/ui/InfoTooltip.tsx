"use client";

import { useId, useState } from "react";
import { useI18n } from "@gd/i18n";

type Props = {
  text: string;
  label?: string;
};

export function InfoTooltip({ text, label }: Props) {
  const { t } = useI18n();
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className={`info-tooltip${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="info-tooltip-trigger"
        aria-label={label ?? t("common.moreInfo")}
        aria-describedby={tooltipId}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      <span id={tooltipId} role="tooltip" className="info-tooltip-bubble">
        {text}
      </span>
    </span>
  );
}
