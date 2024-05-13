/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// Components
declare module "@/components/listings/ListingItem";
declare module "@/components/shared/Spinner";
declare module "@/components/shared/Slider";
declare module "@/components/auth/OAuth";
declare module "@/components/layout/Navbar";
declare module "@/components/routing/PrivateRoute";

// Pages
declare module "@/pages/Category";
declare module "@/pages/Contact";
declare module "@/pages/CreateListings";
declare module "@/pages/EditListing";
declare module "@/pages/ForgotPassword";
declare module "@/pages/Home";
declare module "@/pages/Listing";
declare module "@/pages/Offers";
declare module "@/pages/Profile";
declare module "@/pages/SignIn";
declare module "@/pages/SignUp";

// Routes
declare module "@/routes/AppRouter";

// Hooks
declare module "@/hooks/useAuthStatus";

// Config
declare module "@/firebase.config";

// Types
declare module "@/types/types" {
    export type { TGeolocation, TListing };
}
