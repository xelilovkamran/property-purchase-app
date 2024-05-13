import googleIcon from "@/assets/svg/googleIcon.svg";
import { db } from "@/firebase.config";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function OAuth() {
    const navigate = useNavigate();
    const location = useLocation();

    const onGoogleClick = async () => {
        try {
            const auth = getAuth();
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                await setDoc(docRef, {
                    name: user.displayName,
                    email: user.email,
                    timeStamp: serverTimestamp(),
                });
            }

            navigate("/");
        } catch (error) {
            toast.error("Could not authorize with Google");
        }
    };

    return (
        <div className="socialLogin">
            <p>Sign {location.pathname === "/sign-up" ? "up" : "in"} with</p>
            <button className="socialIconDiv" onClick={onGoogleClick}>
                <img src={googleIcon} alt="google" className="socialIconImg" />
            </button>
        </div>
    );
}

export default OAuth;
