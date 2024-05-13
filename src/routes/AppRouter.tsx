import Navbar from "@/components/layout/Navbar";
import PrivateRoute from "@/components/routing/PrivateRoute";
import Category from "@/pages/Category";
import Contact from "@/pages/Contact";
import CreateListings from "@/pages/CreateListings";
import EditListing from "@/pages/EditListing";
import ForgotPassword from "@/pages/ForgotPassword";
import Home from "@/pages/Home";
import Listing from "@/pages/Listing";
import Offers from "@/pages/Offers";
import Profile from "@/pages/Profile";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";

function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/category/:categoryName" element={<Category />} />
                <Route path="/profile" element={<PrivateRoute />}>
                    <Route path="/profile" element={<Profile />} />
                </Route>
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/create-listing" element={<CreateListings />} />
                <Route path="/edit-listing/:id" element={<EditListing />} />
                <Route
                    path="/category/:categoryName/:listingId"
                    element={<Listing />}
                />
                <Route path="/contact/:landlordId" element={<Contact />} />
            </Routes>
            <Navbar />
        </Router>
    );
}

export default AppRouter;
