import ListingItem from "@/components/listings/ListingItem";
import { getAuth, updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { db } from "@/firebase.config";
import {
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
} from "firebase/firestore";

import { toast } from "react-toastify";

import homeIcon from "@/assets/svg/homeIcon.svg";
import arrowRight from "@/assets/svg/keyboardArrowRightIcon.svg";

type TFormData = {
    name: string;
    email: string;
};

type TListing = {
    id: string;
    data: DocumentData;
};

function Profile() {
    const auth = getAuth();
    const nagivate = useNavigate();

    const [changeDetails, setChangeDetails] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [listings, setListings] = useState<null | TListing[]>(null);

    const [formData, setFormData] = useState<TFormData>({
        name: auth.currentUser?.displayName ?? "",
        email: auth.currentUser?.email ?? "",
    });

    const { name, email } = formData;

    useEffect(() => {
        const fetchListings = async () => {
            const listingRef = collection(db, "listings");

            const q = query(
                listingRef,
                where("userRef", "==", auth.currentUser?.uid),
                orderBy("timestamp", "desc")
            );

            const querySnap = await getDocs(q);
            const listingsArr: TListing[] = [];

            querySnap.forEach((doc) => {
                return listingsArr.push({
                    id: doc.id,
                    data: doc.data(),
                });
            });

            if (listingsArr !== null) {
                setListings(listingsArr);
            }
            setLoading(false);
        };

        fetchListings();
    }, [auth.currentUser?.uid]);

    const onLogout = () => {
        auth.signOut();
        nagivate("/");
    };

    const onSubmit = async () => {
        try {
            if (auth.currentUser?.displayName !== name) {
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, {
                        displayName: name,
                    });
                }

                await updateDoc(
                    doc(db, "users", auth.currentUser?.uid as string),
                    {
                        name,
                    }
                );
            }
        } catch (error) {
            toast.error("Could not update profile details");
        }
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const onDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) {
            return;
        }
        try {
            await deleteDoc(doc(db, "listings", id));
            setListings(
                (prev) => prev?.filter((listing) => listing.id !== id) ?? []
            );
            toast.success("Listing deleted successfully");
        } catch (error) {
            toast.error("Could not delete listing");
        }
    };

    const onEdit = (id: string) => {
        nagivate(`/edit-listing/${id}`);
    };

    return (
        <div className="profile">
            <header className="profileHeader">
                <p className="pageHeader">My Profile</p>
                <button type="button" className="logOut" onClick={onLogout}>
                    Logout
                </button>
            </header>

            <main>
                <div className="profileDetailsHeader">
                    <p className="profileDetailsText">Personal Details</p>
                    <p
                        className="changePersonalDetails"
                        onClick={() => {
                            changeDetails && onSubmit();
                            setChangeDetails((prev) => !prev);
                        }}
                    >
                        {changeDetails ? "done" : "change"}
                    </p>
                </div>

                <div className="profileCard">
                    <form>
                        <input
                            type="text"
                            id="name"
                            className={
                                !changeDetails
                                    ? "profileName"
                                    : "profileNameActive"
                            }
                            disabled={!changeDetails}
                            value={name}
                            onChange={onChange}
                        />
                        <input
                            type="text"
                            id="email"
                            className={
                                !changeDetails
                                    ? "profileEmail"
                                    : "profileEmailActive"
                            }
                            disabled={!changeDetails}
                            value={email}
                            onChange={onChange}
                        />
                    </form>
                </div>

                <Link to="/create-listing" className="createListing">
                    <img src={homeIcon} alt="home" />
                    <p>Sell or rent your home</p>
                    <img src={arrowRight} alt="arrow right" />
                </Link>

                {!loading && (listings?.length ?? 0) > 0 && (
                    <>
                        <p className="listingText">Your Listings</p>
                        <ul className="listingsList">
                            {listings?.map((listing) => (
                                <ListingItem
                                    key={listing.id}
                                    id={listing.id}
                                    listing={listing.data}
                                    onDelete={() => onDelete(listing.id)}
                                    onEdit={() => onEdit(listing.id)}
                                />
                            ))}
                        </ul>
                    </>
                )}
            </main>
        </div>
    );
}

export default Profile;
