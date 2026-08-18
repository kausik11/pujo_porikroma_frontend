export type Region = "NORTH" | "SOUTH" | "EAST" | "WEST" | "CENTRAL";

export type MediaAsset = {
  url: string;
  publicId: string;
  alt?: string;
};

export type VirtualTourLink = {
  nodeId: string;
  yaw: number;
  pitch?: number;
};

export type VirtualTourNode = {
  id: string;
  name: string;
  caption?: string;
  description?: string;
  panorama: MediaAsset;
  thumbnail?: string;
  links: VirtualTourLink[];
};

export type Location = {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  fullAddress: string;
  landmark?: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  postalCode?: string;
  region: Region;
  location: { type: "Point"; coordinates: [number, number] };
  phone?: string;
  alternatePhone?: string;
  email?: string;
  openingHours?: string;
  photos: MediaAsset[];
  panorama360?: MediaAsset;
  virtualTour?: {
    startNodeId?: string;
    nodes: VirtualTourNode[];
  };
  active: boolean;
  distanceMeters?: number;
};

export type LocationFormInput = Omit<Location, "_id" | "location" | "photos" | "panorama360"> & {
  lat: number;
  lng: number;
};
