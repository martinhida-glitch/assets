import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export function HomeIcon(p: IconProps){return <svg {...base} {...p}><path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z"/></svg>}
export function WorkIcon(p: IconProps){return <svg {...base} {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3M3 12h18"/></svg>}
export function PlusIcon(p: IconProps){return <svg {...base} {...p}><path d="M12 5v14M5 12h14"/></svg>}
export function ActivityIcon(p: IconProps){return <svg {...base} {...p}><path d="M3 12h4l2-7 4 14 2-7h6"/></svg>}
export function UserIcon(p: IconProps){return <svg {...base} {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>}
export function PinIcon(p: IconProps){return <svg {...base} {...p}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>}
export function SearchIcon(p: IconProps){return <svg {...base} {...p}><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>}
export function BoltIcon(p: IconProps){return <svg {...base} {...p}><path d="m13 2-8 12h7l-1 8 8-12h-7Z"/></svg>}
export function CheckIcon(p: IconProps){return <svg {...base} {...p}><path d="m5 12 4 4L19 6"/></svg>}
export function BellIcon(p: IconProps){return <svg {...base} {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>}
export function ArrowIcon(p: IconProps){return <svg {...base} {...p}><path d="M5 12h14M14 7l5 5-5 5"/></svg>}
export function ToolIcon(p: IconProps){return <svg {...base} {...p}><path d="M14 7a5 5 0 0 0-7-4l3 3-4 4-3-3a5 5 0 0 0 6 7l7 7 5-5Z"/></svg>}
export function LeafIcon(p: IconProps){return <svg {...base} {...p}><path d="M3 20c3-8 8-13 18-16-1 10-6 15-14 15"/><path d="M8 15c3-2 6-4 10-5"/></svg>}
export function TruckIcon(p: IconProps){return <svg {...base} {...p}><path d="M3 6h11v11H3Z"/><path d="M14 10h4l3 3v4h-7Z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>}
export function HeartIcon(p: IconProps){return <svg {...base} {...p}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>}
export function StarIcon(p: IconProps){return <svg {...base} {...p}><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9Z"/></svg>}
export function FileIcon(p: IconProps){return <svg {...base} {...p}><path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>}
export function BookmarkIcon(p: IconProps){return <svg {...base} {...p}><path d="M6 3h12v18l-6-4-6 4Z"/></svg>}
export function FlagIcon(p: IconProps){return <svg {...base} {...p}><path d="M5 21V4M5 5h11l-2 4 2 4H5"/></svg>}
