import type { ComponentProps, ReactNode } from "react";

export type IconProps = Omit<ComponentProps<"svg">, "children"> & {
  size?: number;
  color?: string;
};

type IconInternalProps = IconProps & { children: ReactNode };

function Icon({ size = 20, color, className, children, ...rest }: IconInternalProps) {
  return (
    <svg
      aria-hidden="true"
      {...rest}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5 21 21" />
    </Icon>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 14.09 9.26 20.5 9.26 15.45 13.14 17.55 20 12 16.09 6.45 20 8.55 13.14 3.5 9.26 9.91 9.26 Z" />
    </Icon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3a5 5 0 0 0-5 5v3l-2 4h14l-2-4V8a5 5 0 0 0-5-5Z" />
      <path d="M9 19a3 3 0 0 0 6 0" />
    </Icon>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8" />
    </Icon>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 10h16" />
      <path d="M10 10v10" />
    </Icon>
  );
}

export function BarChartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 20V10" />
      <path d="M12 20V4" />
      <path d="M18 20v-6" />
    </Icon>
  );
}

export function CandlestickIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 8v8" />
      <path d="M9 5v14" />
      <path d="M13 10v4" />
      <path d="M17 6v12" />
    </Icon>
  );
}

export function NewsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h10" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
      <path d="M13 6 19 12 13 18" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 12H5" />
      <path d="M11 6 5 12 11 18" />
    </Icon>
  );
}

export function TrendingUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 17 9 11 13 15 21 7" />
      <path d="M14 7h7v7" />
    </Icon>
  );
}

export function TrendingDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 7 9 13 13 9 21 17" />
      <path d="M14 17h7v-7" />
    </Icon>
  );
}

export function BulbIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3a6 6 0 0 0-4 10.5c1 1 1.5 2 1.5 3.5h5c0-1.5.5-2.5 1.5-3.5A6 6 0 0 0 12 3Z" />
      <path d="M9 20h6" />
      <path d="M10 22h4" />
    </Icon>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 5v6h6" />
      <path d="M3.5 15a9 9 0 1 0 2-9.5L3 8" />
      <path d="M12 8v4l3 2" />
    </Icon>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93 7.76 7.76" />
      <path d="M16.24 16.24 19.07 19.07" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07 7.76 16.24" />
      <path d="M16.24 7.76 19.07 4.93" />
    </Icon>
  );
}

export function PersonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </Icon>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17 21 12 16 7" />
      <path d="M21 12H9" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Icon>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 6h11" />
      <path d="M9 12h11" />
      <path d="M9 18h11" />
      <path d="M4.5 6h.01" />
      <path d="M4.5 12h.01" />
      <path d="M4.5 18h.01" />
    </Icon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12 10 18 20 6" />
    </Icon>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 12 12 3 21 12" />
      <path d="M5 10v11h5v-6h4v6h5V10" />
    </Icon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </Icon>
  );
}

export function SpinnerIcon({ size = 20, color, className, ...rest }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      {...rest}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      className={className ? `animate-spin ${className}` : "animate-spin"}
    >
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}
