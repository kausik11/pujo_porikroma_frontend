import type { Location } from "@/types/location";

export const dummyCentralEsplanadeTour: NonNullable<Location["virtualTour"]> = {
  startNodeId: "pano31",
  nodes: [
    {
      id: "pano31",
      name: "Drone View",
      caption: "Arjunpur Amra Sabai - Drone View",
      description: "Converted test panorama from the public Arjunpur Amra Sabai virtual tour CDN assets.",
      panorama: {
        url: "/images/virtual-tour/thepuja-arjunpur/step1-drone.jpg",
        publicId: "thepuja-arjunpur/pano31",
        alt: "Arjunpur Amra Sabai drone view test panorama"
      },
      thumbnail: "/images/virtual-tour/thepuja-arjunpur/step1-drone-thumb.jpg",
      links: [
        { nodeId: "pano30", yaw: -0.85, pitch: -0.12 },
        { nodeId: "pano29", yaw: 0.25, pitch: -0.08 }
      ]
    },
    {
      id: "pano30",
      name: "Entry Path",
      caption: "Arjunpur Amra Sabai - Entry Path",
      description: "Converted test panorama from the public Arjunpur Amra Sabai virtual tour CDN assets.",
      panorama: {
        url: "/images/virtual-tour/thepuja-arjunpur/step1.jpg",
        publicId: "thepuja-arjunpur/pano30",
        alt: "Arjunpur Amra Sabai entry path test panorama"
      },
      thumbnail: "/images/virtual-tour/thepuja-arjunpur/step1-thumb.jpg",
      links: [
        { nodeId: "pano31", yaw: 3.05, pitch: -0.1 },
        { nodeId: "pano29", yaw: 0.2, pitch: -0.1 }
      ]
    },
    {
      id: "pano29",
      name: "Pandal Approach",
      caption: "Arjunpur Amra Sabai - Pandal Approach",
      description: "Converted test panorama from the public Arjunpur Amra Sabai virtual tour CDN assets.",
      panorama: {
        url: "/images/virtual-tour/thepuja-arjunpur/step3.jpg",
        publicId: "thepuja-arjunpur/pano29",
        alt: "Arjunpur Amra Sabai pandal approach test panorama"
      },
      thumbnail: "/images/virtual-tour/thepuja-arjunpur/step3-thumb.jpg",
      links: [
        { nodeId: "pano30", yaw: 3.1, pitch: -0.1 },
        { nodeId: "pano28", yaw: 0.1, pitch: -0.1 }
      ]
    },
    {
      id: "pano28",
      name: "Inner Path",
      caption: "Arjunpur Amra Sabai - Inner Path",
      description: "Converted test panorama from the public Arjunpur Amra Sabai virtual tour CDN assets.",
      panorama: {
        url: "/images/virtual-tour/thepuja-arjunpur/step2.jpg",
        publicId: "thepuja-arjunpur/pano28",
        alt: "Arjunpur Amra Sabai inner path test panorama"
      },
      thumbnail: "/images/virtual-tour/thepuja-arjunpur/step2-thumb.jpg",
      links: [
        { nodeId: "pano29", yaw: 3, pitch: -0.1 },
        { nodeId: "pano32", yaw: 0.05, pitch: -0.1 }
      ]
    },
    {
      id: "pano32",
      name: "Idol Entrance",
      caption: "Arjunpur Amra Sabai - Idol Entrance",
      description: "Converted test panorama from the public Arjunpur Amra Sabai virtual tour CDN assets.",
      panorama: {
        url: "/images/virtual-tour/thepuja-arjunpur/step4.jpg",
        publicId: "thepuja-arjunpur/pano32",
        alt: "Arjunpur Amra Sabai idol entrance test panorama"
      },
      thumbnail: "/images/virtual-tour/thepuja-arjunpur/step4-thumb.jpg",
      links: [{ nodeId: "pano28", yaw: 3.1, pitch: -0.1 }]
    }
  ]
};

export function virtualTourForLocation(location: Location) {
  if (location.virtualTour?.nodes.length) return location.virtualTour;
  if (location.slug === "central-esplanade-office") return dummyCentralEsplanadeTour;
  return undefined;
}
