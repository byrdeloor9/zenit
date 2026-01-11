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
    Icecream, SetMeal, Kitchen, BakeryDining,
    BreakfastDining, BrunchDining, DinnerDining, Liquor,

    // Shopping
    ShoppingCart, LocalMall, ShoppingBag, Store, Storefront,
    CreditCard, Receipt, LocalOffer, Sell, Redeem,
    Checkroom,

    // Transport
    DirectionsCar, DirectionsBus, DirectionsSubway, Flight, TwoWheeler,
    LocalTaxi, LocalGasStation, Commute, DirectionsBoat, Train,

    // Home
    Home, Apartment, Cottage, Weekend,
    Lightbulb, WaterDrop, Bolt, Router,
    Hvac, CleaningServices, Construction, LocalLaundryService, SmartScreen,

    // Entertainment
    Movie, Theaters, SportsEsports, Casino, MusicNote: QueueMusic,
    SportsSoccer, FitnessCenter, Pool, GolfCourse, SportsTennis,

    // Health
    MedicalServices, LocalPharmacy, Spa, Healing, SelfImprovement,
    ContentCut, LocalHospital, Psychology,

    // Work/Edu
    School, Work, AttachMoney, BusinessCenter, Calculate,
    MenuBook, Cast, Language, Science,

    // Tech
    PhoneIphone, Laptop, Build, Settings, Cloud,
    Security, Lock, VpnKey,

    // Misc
    Pets, Park
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

    // Normalize: trim strings
    const normalizedIconName = iconName.trim();

    // Check if it's an emoji (basic check: not in our map and "short")
    // Or if it IS in our map, render the component.
    const IconComponent = iconMap[normalizedIconName];

    if (IconComponent) {
        return <IconComponent className={className} />;
    }

    // DEBUG: Only log if it looks like an MUI name (starts with Uppercase) but wasn't found
    if (/^[A-Z]/.test(normalizedIconName) && normalizedIconName.length > 2) {
        console.warn(`CategoryIcon: Icon "${normalizedIconName}" not found in map.`);
    }

    // Fallback: render as text (for emoji support)
    return <span className={className}>{iconName}</span>;
}
