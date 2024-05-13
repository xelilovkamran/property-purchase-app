import { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const useAuthStatus = () => {
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [checkingStatus, setCheckingStatus] = useState<boolean>(true);
    const isMounted = useRef<boolean>(true);

    useEffect(() => {
        if (isMounted) {
            const auth = getAuth();
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setLoggedIn(true);
                }
                setCheckingStatus(false);
            });
        }

        return () => {
            isMounted.current = false;
        };
    }, [isMounted]);

    return { loggedIn, checkingStatus };
};
