import React from 'react';
import {
    // Food & Drink
    LocalCafe, Restaurant, Fastfood, LocalBar, LocalPizza, BakeryDining,
    Icecream, Liquor, SetMeal, BreakfastDining, BrunchDining, DinnerDining,
    Kitchen,

    // Shopping
    ShoppingCart, LocalMall, ShoppingBag, Store, Storefront,
    CreditCard, Receipt, Sell, LocalOffer, Redeem,

    // Transport
    DirectionsCar, DirectionsBus, DirectionsSubway, Flight, TwoWheeler,
    LocalTaxi, LocalGasStation, Commute, DirectionsBoat, Train,

    // Home & Utilities
    Home, Apartment, Cottage, Weekend,
    Lightbulb, WaterDrop, Bolt, Hvac, CleaningServices, Construction,
    LocalLaundryService, Router, SmartScreen,

    // Entertainment
    Movie, Theaters, SportsEsports, Casino, QueueMusic,
    SportsSoccer, FitnessCenter, Pool, GolfCourse, SportsTennis,

    // Health & Self Care
    MedicalServices, LocalPharmacy, Healing, Spa, SelfImprovement,
    ContentCut, Checkroom, LocalHospital, Psychology,

    // Education & Work
    School, Work, BusinessCenter, Calculate, AttachMoney,
    MenuBook, Cast, Language, Science,

    // Tech & Services
    PhoneIphone, Laptop, Build, Settings, Cloud,
    Security, Lock, VpnKey, Pets, Park

} from '@mui/icons-material';

// Map of icon names to components
export const iconMap: Record<string, React.ElementType> = {
    // Food
    LocalCafe, Restaurant, Fastfood, LocalBar, LocalPizza,
    Icecream, SetMeal, Kitchen,

    // Shopping
    ShoppingCart, LocalMall, ShoppingBag, Store,
    CreditCard, Receipt, LocalOffer,

    // Transport
    DirectionsCar, DirectionsBus, Flight, TwoWheeler,
    LocalGasStation, Train,

    // Home
    Home, Apartment, Cottage,
    Lightbulb, WaterDrop, Bolt, Router,

    // Entertainment
    Movie, SportsEsports, MusicNote: QueueMusic,
    SportsSoccer, FitnessCenter,

    // Health
    MedicalServices, LocalPharmacy, Spa,

    // Work/Edu
    School, Work, AttachMoney,

    // Misc
    PhoneIphone, Laptop, Pets, Park, Build, Settings
};

export const CATEGORY_GROUPS = {
    'Alimentación': ['LocalCafe', 'Restaurant', 'Fastfood', 'LocalBar', 'LocalPizza', 'Icecream', 'SetMeal', 'Kitchen'],
    'Compras': ['ShoppingCart', 'LocalMall', 'ShoppingBag', 'Store', 'CreditCard', 'Receipt', 'LocalOffer'],
    'Transporte': ['DirectionsCar', 'DirectionsBus', 'Flight', 'TwoWheeler', 'LocalGasStation', 'Train'],
    'Hogar': ['Home', 'Apartment', 'Cottage', 'Lightbulb', 'WaterDrop', 'Bolt', 'Router'],
    'Entretenimiento': ['Movie', 'SportsEsports', 'MusicNote', 'SportsSoccer', 'FitnessCenter'],
    'Salud': ['MedicalServices', 'LocalPharmacy', 'Spa'],
    'Trabajo/Educación': ['School', 'Work', 'AttachMoney'],
    'Varios': ['PhoneIphone', 'Laptop', 'Pets', 'Park', 'Build', 'Settings']
};

interface CategoryIconProps {
    iconName: string | null | undefined;
    className?: string;
}

export function CategoryIcon({ iconName, className = '' }: CategoryIconProps) {
    if (!iconName) return null;

    // Check if it's an emoji (basic check: not in our map and "short")
    // Or if it IS in our map, render the component.
    const IconComponent = iconMap[iconName];

    if (IconComponent) {
        return <IconComponent className={className} />;
    }

    // Fallback: render as text (for emoji support)
    return <span className={className}>{iconName}</span>;
}
