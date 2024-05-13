import shareIcon from "@/assets/svg/shareIcon.svg";
import Spinner from "@/components/shared/Spinner";
import { db } from "@/firebase.config";
import { TListing } from "@/types/types";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EffectCreative, Keyboard, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "leaflet/dist/leaflet.css";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/navigation";

type Params = {
    listingId: string;
};

function Listing() {
    const [listing, setListing] = useState<null | TListing>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [shareLinkCopied, setShareLinkCopied] = useState<boolean>(false);

    const navigate = useNavigate();
    const params = useParams<Params>();
    const auth = getAuth();

    useEffect(() => {
        const fetchListing = async () => {
            const docRef = doc(db, "listings", params.listingId as string);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setListing(docSnap.data() as TListing);
                setLoading(false);
            }
        };

        fetchListing();
    }, [navigate, params.listingId]);

    if (loading) {
        return <Spinner />;
    }

    return (
        <main>
            <Swiper
                modules={[Navigation, EffectCreative, Keyboard]}
                effect={"creative"}
                navigation={true}
                loop={true}
                keyboard={{
                    enabled: true,
                }}
                creativeEffect={{
                    prev: {
                        shadow: true,
                        translate: [0, 0, -400],
                    },
                    next: {
                        translate: ["100%", 0, 0],
                    },
                }}
                className="mySwiper"
            >
                {listing?.imageUrls.map((url: string, index: number) => (
                    <SwiperSlide key={index}>
                        <div
                            className="swiperSlideDiv"
                            style={{
                                background: `url(${url}) center no-repeat`,
                                backgroundSize: "cover",
                            }}
                        ></div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <div
                className="shareIconDiv"
                onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShareLinkCopied(true);

                    setTimeout(() => {
                        setShareLinkCopied(false);
                    }, 2000);
                }}
            >
                <img src={shareIcon} alt="" />
            </div>

            {shareLinkCopied && <p className="linkCopied">Link Copied!</p>}

            <div className="listingDetails">
                <p className="listingName">
                    {listing?.name} - $
                    {listing?.discountedPrice
                        ? listing.discountedPrice
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        : listing?.regularPrice
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </p>

                <div className="listingLocation">{listing?.location}</div>

                <p className="listingType">
                    For {listing?.type === "rent" ? "Rent" : "Sale"}
                </p>

                {listing?.offer && (
                    <p className="discountPrice">
                        {listing?.discountedPrice
                            ? listing.regularPrice -
                              listing?.discountedPrice +
                              " "
                            : listing.regularPrice}
                        discount
                    </p>
                )}

                <ul className="listingDetailsList">
                    <li>
                        {listing?.bedrooms ?? 0 > 1
                            ? `${listing?.bedrooms} Bedrooms`
                            : "1 Bedroom"}
                    </li>

                    <li>
                        {listing?.bathrooms ?? 0 > 1
                            ? `${listing?.bedrooms} Bathrooms`
                            : "1 Bathrooms"}
                    </li>
                    <li>{listing?.parking && "Parking Spot"}</li>
                    <li>{listing?.furnished && "Furnished"}</li>
                </ul>

                <p className="listingLocationTitle">Location</p>

                <div className="leafletContainer">
                    <MapContainer
                        style={{ height: "100%", width: "100%" }}
                        center={[
                            listing?.geolocation.lat ?? 0,
                            listing?.geolocation.lng ?? 0,
                        ]}
                        zoom={13}
                        scrollWheelZoom={true}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker
                            position={[
                                listing?.geolocation.lat ?? 0,
                                listing?.geolocation.lng ?? 0,
                            ]}
                        >
                            <Popup>{listing?.location}</Popup>
                        </Marker>
                    </MapContainer>
                </div>

                {auth.currentUser?.uid !== listing?.userRef && (
                    <Link
                        to={`/contact/${listing?.userRef}?listingName=${listing?.name}`}
                        className="primaryButton"
                    >
                        Contact Landlord
                    </Link>
                )}
            </div>
        </main>
    );
}

export default Listing;
