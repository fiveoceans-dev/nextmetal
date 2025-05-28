// utils/Icons.ts
// Central place to keep all icon names & utilities.
// Add new custom names here once and reuse everywhere.
// https://blueprintjs.com/docs/#icons/icons-list

import { Icon, IconProps } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";

/**
 * Map your domain‑specific icon aliases → BlueprintJS icon IDs.
 */
export const IconMap: Record<string, IconName> = {
  // fire & warnings
  flame: "flame",
  warning: "warning-sign",
  // aviation / ground / maritime assets
  airplane: "airplane",
  helicopter: "helicopter",
  buggy: "buggy",
  tractor: "tractor",
  ship: "ship",
  // space / comms
  satellite: "satellite",
  antenna: "antenna",
  // GIS / geospatial
  pin: "pin",
  unpin: "unpin",
  locate: "locate",
  geosearch: "geosearch",
  directionright: "direction-right",
  // map overlays / shapes
  circle: "circle",
  cross: "cross",
  // ops utilities
  anchor: "anchor",
  fuel: "fuel",
  mobilevideo: "mobile-video",
  camera: "camera",
  people: "people",
  person: "person",
  lock: "lock",
  unlock: "unlock",
  build: "build",
  delete: "delete",
  reset: "reset",
  history: "history",
  exchange: "exchange",
  filter: "filter",
  generate: "generate",
  tags: "tags",
  tick: "tick",
  endorsed: "endorsed",
  explain: "explain",
  search: "search",
  selectionbox: "selection-box",
  eraser: "eraser",
  edit: "edit",
  tint: "tint",
};

/**
 * Convenience React component so you can use:
 * <AppIcon name="flame" iconSize={20} intent="danger" />
 */
export const AppIcon = ({ name, ...rest }: { name: keyof typeof IconMap } & Omit<IconProps, "icon">) => {
  return <Icon icon={IconMap[name]} {...rest} />;
};

/**
 * Helper to get the icon name only (for non‑React contexts like Leaflet DivIcon).
 */
export const iconHtml = (
  name: keyof typeof IconMap,
  size = 16,
  color = "white",
): string => {
  return `<span class='bp5-icon bp5-icon-${IconMap[name]}' style='color:${color};font-size:${size}px;'></span>`;
};
