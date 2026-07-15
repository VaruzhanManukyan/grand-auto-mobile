export interface ServiceCenter {
    id: string;
    name: string;
    address: string;
    city: string;
    workHours: string;
    phone: string;
    latitude: number;
    longitude: number;
    rating?: number;
    photoUrl?: string;
}