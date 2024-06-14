import facebookIcon from "@/assets/svg/facebookIcon.svg";
import { db } from "@/firebase.config";
import { FacebookAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Facebook() {
    const navigate = useNavigate();

    const onFacebookClick = async () => {
        try {
            const auth = getAuth();
            const provider = new FacebookAuthProvider();
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
            toast.error("Could not authorize with Facebook");
        }
    };

    return (
        <div className="socialLogin">
            <button className="socialIconDiv" onClick={onFacebookClick}>
                <img
                    src={facebookIcon}
                    alt="facebook"
                    className="socialIconImg"
                />
            </button>
        </div>
    );
}

export default Facebook;
