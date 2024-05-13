import { db } from "@/firebase.config";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

type Landlord = {
    name: string;
    email: string;
    timeStamp: Date;
};

type Params = {
    landlordId: string;
};

function Contact() {
    const [message, setMessage] = useState<string>("");
    const [landlord, setLandlord] = useState<null | Landlord>(null);
    // eslint-disable-next-line
    const [searchParams, _setSearchParams] = useSearchParams();

    const params = useParams<Params>();

    useEffect(() => {
        const getLandlord = async () => {
            const docRef = doc(db, "users", params.landlordId ?? "");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setLandlord(docSnap.data() as Landlord);
            } else {
                toast.error("Could not get landlord data");
            }
        };

        getLandlord();
    }, [params.landlordId]);

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    };

    return (
        <div className="pageContainer">
            <header>
                <p className="pageHeader">Contact Landlord</p>
            </header>

            {landlord !== null && (
                <main>
                    <div className="contactLandlord">
                        <p className="landlordName">Contact {landlord?.name}</p>
                    </div>

                    <form className="messageForm">
                        <div className="messageDiv">
                            <label htmlFor="message" className="messageLabel">
                                Message
                            </label>
                            <textarea
                                name="message"
                                id="message"
                                className="textArea"
                                value={message}
                                onChange={onChange}
                                style={{
                                    padding: "10px",
                                    borderRadius: "5px",
                                    height: "200px",
                                    resize: "none",
                                    border: "1px solid #ccc",
                                    outline: "none",
                                }}
                            ></textarea>
                        </div>

                        <a
                            href={`mailto:${
                                landlord.email
                            }?Subject=${searchParams.get(
                                "listingName"
                            )}&body=${message}`}
                        >
                            <button className="primaryButton" type="button">
                                Message
                            </button>
                        </a>
                    </form>
                </main>
            )}
        </div>
    );
}

export default Contact;
