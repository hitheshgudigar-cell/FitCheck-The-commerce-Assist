import { Store } from '../types';

export const MOCK_STORES: Store[] = [
  {
    id: "store_mysuru_devaraja",
    name: "FitCheck Central - Devaraja Mohalla",
    lat: 12.3106,
    lng: 76.6528,
    address: "142 Sayyaji Rao Road, Devaraja Mohalla, Mysuru, Karnataka 570001",
    pickup_today: true,
    open_hours: "09:30 AM - 09:30 PM",
  },
  {
    id: "store_mysuru_jayalakshmi",
    name: "FitCheck Boutique - Jayalakshmipuram",
    lat: 12.3215,
    lng: 76.6265,
    address: "45 Kalidasa Road, Jayalakshmipuram, Mysuru, Karnataka 570012",
    pickup_today: true,
    open_hours: "10:00 AM - 09:00 PM",
  },
  {
    id: "store_mysuru_kuvempunagar",
    name: "FitCheck Outlet - Kuvempunagar",
    lat: 12.2858,
    lng: 76.6272,
    address: "28 Complex Main Road, Kuvempunagar, Mysuru, Karnataka 570023",
    pickup_today: true,
    open_hours: "10:00 AM - 09:00 PM",
  },
  {
    id: "store_mysuru_saraswathipuram",
    name: "FitCheck Retail - Saraswathipuram",
    lat: 12.3015,
    lng: 76.6345,
    address: "12 5th Main, Saraswathipuram, Mysuru, Karnataka 570009",
    pickup_today: true,
    open_hours: "10:00 AM - 09:00 PM",
  },
  {
    id: "store_mysuru_gokulam",
    name: "FitCheck Studio - Gokulam",
    lat: 12.3308,
    lng: 76.6231,
    address: "8 Temple Road, 3rd Stage, Gokulam, Mysuru, Karnataka 570002",
    pickup_today: true,
    open_hours: "10:30 AM - 08:30 PM",
  },
  {
    id: "store_mysuru_bannimantap",
    name: "FitCheck Express - Bannimantap",
    lat: 12.3340,
    lng: 76.6490,
    address: "90 Highway Circle, Bannimantap, Mysuru, Karnataka 570015",
    pickup_today: true,
    open_hours: "09:00 AM - 10:00 PM",
  },
];

export const DEFAULT_USER_LOCATION = {
  lat: 12.3051,
  lng: 76.6551,
  pincode: "570001",
  city: "Mysuru",
};
