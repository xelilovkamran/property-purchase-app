import ArrowRightIcon from "@/assets/svg/keyboardArrowRightIcon.svg?react";
import visibilityIcon from "@/assets/svg/visibilityIcon.svg";
import OAuth from "@/components/auth/OAuth";
import Facebook from "@/components/auth/Facebook";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    createUserWithEmailAndPassword,
    getAuth,
    updateProfile,
} from "firebase/auth";

import { db } from "@/firebase.config";
import { doc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";

import { toast } from "react-toastify";

type TFormDataCopy = {
    name: string;
    email: string;
    timeStamp: Timestamp;
};

function SignUp() {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const { name, email, password } = formData;

    const navigate = useNavigate();

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            if (!name) {
                throw new Error("User not found");
            }

            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;
            if (auth.currentUser) {
                updateProfile(auth.currentUser, {
                    displayName: name,
                });
            }

            const formDataCopy: TFormDataCopy = {
                name,
                email,
                timeStamp: serverTimestamp() as Timestamp,
            };

            await setDoc(doc(db, "users", user.uid), formDataCopy);

            navigate("/");
        } catch (error) {
            toast.error("Something went wrong with registration");
        }
    };

    return (
        <>
            <div className="pageContainer">
                <header>
                    <p className="pageHeader">Welcome Back!</p>
                </header>

                <form onSubmit={onSubmit}>
                    <input
                        type="text"
                        className="nameInput"
                        placeholder="Name"
                        id="name"
                        value={name}
                        onChange={onChange}
                    />
                    <input
                        type="email"
                        className="emailInput"
                        placeholder="Email"
                        id="email"
                        value={email}
                        onChange={onChange}
                    />

                    <div className="passwordInputDiv">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="passwordInput"
                            placeholder="Password"
                            id="password"
                            value={password}
                            onChange={onChange}
                        />

                        <img
                            src={visibilityIcon}
                            alt="show password"
                            className="showPassword"
                            onClick={() =>
                                showPassword
                                    ? setShowPassword(false)
                                    : setShowPassword(true)
                            }
                        />
                    </div>

                    <Link to="/forgot-password" className="forgotPasswordLink">
                        Forgot Password
                    </Link>

                    <div className="signUpBar">
                        <p className="signUpText">Sign Up</p>
                        <button className="signUpButton">
                            <ArrowRightIcon
                                fill="#ffffff"
                                width="34px"
                                height="34px"
                            />
                        </button>
                    </div>
                </form>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <p>
                        Sign {location.pathname === "/sign-up" ? "up" : "in"}{" "}
                        with
                    </p>
                    <div style={{ display: "flex" }}>
                        <OAuth />
                        <Facebook />
                    </div>
                </div>

                <Link to="/sign-in" className="registerLink">
                    Sign In Instead
                </Link>
            </div>
        </>
    );
}

export default SignUp;
