import { HeartIcon, LeafIcon, ToolIcon, TruckIcon, WorkIcon } from "@/components/icons";
export function CategoryIcon({ group }: { group: string }) {
  const g=group.toLowerCase();
  const C=g.includes("hogar")?ToolIcon:g.includes("campo")?LeafIcon:g.includes("transporte")?TruckIcon:g.includes("cuidado")?HeartIcon:WorkIcon;
  return <C/>;
}
