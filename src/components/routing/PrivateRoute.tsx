import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Navigate, Outlet } from "react-router-dom";

import Spinner from "@/components/shared/Spinner";

const PrivateRoute = () => {
    const { loggedIn, checkingStatus } = useAuthStatus(); // custom hook

    if (checkingStatus) {
        return <Spinner />;
    }

    return <>{loggedIn ? <Outlet /> : <Navigate to="/sign-in" />}</>;
};

export default PrivateRoute;
