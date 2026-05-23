import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/cn";

interface BaseProps {
  leading?: React.ReactNode;
  /** Primary line of text. */
  title: React.ReactNode;
  /** Optional secondary line — smaller, lower contrast. */
  subtitle?: React.ReactNode;
  /** Right-aligned value (e.g. "3d", "iOS", "On"). */
  value?: React.ReactNode;
  /** Show the iOS-style chevron on the right edge. */
  chevron?: boolean;
  className?: string;
}

interface DivRow extends BaseProps {
  as?: "div";
}

interface LinkRow extends BaseProps {
  as: "link";
  href: string;
}

interface ButtonRow extends BaseProps {
  as: "button";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

type ListRowProps = DivRow | LinkRow | ButtonRow;

/**
 * iOS list cell. Composed inside a `<Section>` to get the grouped
 * (inset) look from Apple's Settings / Contacts apps. Every interactive
 * row is at least 44pt tall so tap targets meet the HIG.
 */
export function ListRow(props: ListRowProps) {
  const { leading, title, subtitle, value, chevron, className } = props;

  const body = (
    <>
      {leading && (
        <span className="flex shrink-0 items-center justify-center">
          {leading}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] leading-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </span>
        {subtitle && (
          <span className="mt-0.5 block truncate text-[13px] text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </span>
        )}
      </span>
      {value !== undefined && (
        <span className="shrink-0 text-[15px] text-zinc-500 dark:text-zinc-400">
          {value}
        </span>
      )}
      {chevron && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500"
          aria-hidden
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      )}
    </>
  );

  const baseClasses = cn(
    "flex w-full min-h-[52px] items-center gap-3 px-4 text-left",
    className,
  );
  const interactiveClasses =
    "transition-colors hover:bg-white/40 active:bg-white/55 dark:hover:bg-white/[0.04] dark:active:bg-white/[0.08]";

  if (props.as === "link") {
    return (
      <Link href={props.href} className={cn(baseClasses, interactiveClasses)}>
        {body}
      </Link>
    );
  }
  if (props.as === "button") {
    return (
      <button
        type="button"
        onClick={props.onClick}
        disabled={props.disabled}
        className={cn(
          baseClasses,
          interactiveClasses,
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {body}
      </button>
    );
  }
  return <div className={baseClasses}>{body}</div>;
}
