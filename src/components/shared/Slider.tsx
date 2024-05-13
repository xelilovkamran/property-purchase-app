import {
    collection,
    DocumentData,
    getDocs,
    limit,
    orderBy,
    query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "@/firebase.config";

import "swiper/css";
import { Autoplay, Keyboard, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Spinner from "./Spinner";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

type TListing = {
    id: string;
    data: DocumentData;
};

function Slider() {
    const [loading, setLoading] = useState<boolean>(true);
    const [listings, setListings] = useState<TListing[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchListings = async () => {
            const listingsRef = collection(db, "listings");
            const q = query(
                listingsRef,
                orderBy("timestamp", "desc"),
                limit(5)
            );

            const querySnap = await getDocs(q);

            const listings: TListing[] = [];

            querySnap.forEach((doc) => {
                return listings.push({
                    id: doc.id,
                    data: doc.data(),
                });
            });

            setListings(listings);
            setLoading(false);
        };

        fetchListings();
    }, []);

    if (loading) {
        return <Spinner />;
    }

    return (
        listings && (
            <>
                <p className="exploreHeading">Recommended</p>

                <Swiper
                    modules={[Navigation, Autoplay, Keyboard]}
                    autoplay={{ delay: 2500, disableOnInteraction: false }}
                    centeredSlides={true}
                    navigation={true}
                    loop={listings.length > 1 ? true : false}
                    keyboard={{
                        enabled: true,
                    }}
                    className="mySwiper"
                >
                    {listings.map(({ data, id }) => (
                        <SwiperSlide
                            key={id}
                            onClick={() =>
                                navigate(`/category/${data.type}/${id}`)
                            }
                        >
                            <div
                                style={{
                                    background: `url(${data.imageUrls[0]}) center no-repeat`,
                                    backgroundSize: "cover",
                                }}
                                className="swiperSlideDiv"
                            >
                                <p className="swiperSlideText">{data.name}</p>
                                <p className="swiperSlidePrice">
                                    ${data.discountedPrice ?? data.regularPrice}
                                    {""}
                                    {data.type === "rent" && "/ month"}
                                </p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </>
        )
    );
}

export default Slider;
