import ArrowRightIcon from "@/assets/svg/keyboardArrowRightIcon.svg?react";
import visibilityIcon from "@/assets/svg/visibilityIcon.svg";
import OAuth from "@/components/auth/OAuth";
import Facebook from "@/components/auth/Facebook";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import { toast } from "react-toastify";

function SignIn() {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const { email, password } = formData;

    const navigate = useNavigate();
    const location = useLocation();

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const auth = getAuth();

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            userCredential.user && navigate("/");
        } catch (err) {
            toast.error("Bad User Credentials ");
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

                    <div className="signInBar">
                        <p className="signInText">Sign In</p>
                        <button className="signInButton">
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
                <Link to="/sign-up" className="registerLink">
                    Sign Up Instead
                </Link>
            </div>
        </>
    );
}

export default SignIn;
