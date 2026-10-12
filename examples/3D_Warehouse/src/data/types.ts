/**
 * WareTrack domain model.
 * All timestamps are epoch milliseconds (UTC). Display formatting applies the site's IANA timezone.
 */

export type EpochMs = number;
export type SiteId = string;
export type DockId = string;
export type TruckId = string;
export type ForkliftId = string;
export type InventoryItemId = string;
export type ShipmentId = string;

/** World-space placement of a warehouse in the 3D scene (x/z plane, metres). */
export interface SiteLayout {
  originX: number;
  originZ: number;
  /** Rotation of the warehouse footprint around Y, radians. */
  heading: number;
}

export interface Site {
  id: SiteId;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  layout: SiteLayout;
  dockIds: DockId[];
}

export type DockStatus = 'available' | 'occupied' | 'maintenance';

export interface Dock {
  id: DockId;
  siteId: SiteId;
  label: string;
  /** 0-based slot index along the warehouse front. */
  slot: number;
  status: DockStatus;
  truckId: TruckId | null;
  updatedAt: EpochMs;
}

export type TruckStatus = 'idle' | 'en_route' | 'docked' | 'maintenance';

export interface Truck {
  id: TruckId;
  plate: string;
  driver: string;
  capacityKg: number;
  /** Site the truck is currently assigned to / operating at. */
  siteId: SiteId;
  status: TruckStatus;
  shipmentId: ShipmentId | null;
  /** 0 → departed origin, 1 → at site gate. Only meaningful while en_route. */
  routeProgress: number;
  updatedAt: EpochMs;
}

export type ForkliftStatus = 'idle' | 'moving' | 'lifting' | 'charging';

export interface Forklift {
  id: ForkliftId;
  siteId: SiteId;
  name: string;
  status: ForkliftStatus;
  batteryPct: number;
  dockId: DockId | null;
  updatedAt: EpochMs;
}

export interface InventoryItem {
  id: InventoryItemId;
  siteId: SiteId;
  sku: string;
  description: string;
  bin: string;
  /** Cartons physically on hand. */
  onHand: number;
  /** Cartons committed to outbound shipments. */
  reserved: number;
  /** Alert when available (onHand − reserved) is at or below this. */
  reorderPoint: number;
  updatedAt: EpochMs;
}

export type ShipmentDirection = 'inbound' | 'outbound';
export type ShipmentStatus = 'scheduled' | 'in_transit' | 'at_dock' | 'completed';

export interface ShipmentLine {
  inventoryItemId: InventoryItemId;
  cartons: number;
}

export interface Shipment {
  id: ShipmentId;
  siteId: SiteId;
  direction: ShipmentDirection;
  truckId: TruckId;
  dockId: DockId | null;
  status: ShipmentStatus;
  /** Promised arrival at the warehouse dock. */
  eta: EpochMs;
  actualArrival: EpochMs | null;
  completedAt: EpochMs | null;
  /** Planned dock dwell time for loading/unloading. */
  dwellMs: number;
  lines: ShipmentLine[];
}

export interface WarehouseData {
  sites: Site[];
  docks: Dock[];
  trucks: Truck[];
  forklifts: Forklift[];
  inventory: InventoryItem[];
  shipments: Shipment[];
}
