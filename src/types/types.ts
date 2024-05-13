export type TGeolocation = {
    lat: number;
    lng: number;
};

export type TListing = {
    id: string;
    bathrooms: number;
    bedrooms: number;
    discountedPrice?: number;
    furnished: boolean;
    geolocation: TGeolocation;
    imageUrls: string[];
    location: string;
    name: string;
    offer: boolean;
    parking: boolean;
    regularPrice: number;
    type: string;
    userRef: string;
    latitude?: number;
    longitude?: number;
    timestamp: Date;
};
