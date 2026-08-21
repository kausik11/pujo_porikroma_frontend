export type Region = "NORTH" | "SOUTH" | "EAST" | "WEST" | "CENTRAL";

export type CrowdLevel = "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";

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
  featured?: boolean;
  verified?: boolean;
  crowdLevel?: CrowdLevel;
  crowdUpdatedAt?: string;
  bestVisitTime?: string;
  pujaType?: string;
  establishedYear?: number;
  themeYear?: number;
  themeName?: string;
  idolStyle?: string;
  pandalTheme?: string;
  specialAttractions?: string[];
  nearestMetro?: string;
  accessibility?: string[];
  visitTip?: string;
  ratingAverage?: number;
  ratingCount?: number;
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
