import {
    collection,
    DocumentData,
    getDocs,
    limit,
    orderBy,
    query,
    QueryDocumentSnapshot,
    startAfter,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ListingItem from "@/components/listings/ListingItem";
import Spinner from "@/components/shared/Spinner";
import { db } from "@/firebase.config";
import { TListing } from "@/types/types";
import { toast } from "react-toastify";

type Params = {
    categoryName: string;
};

function Category() {
    const [listings, setListings] = useState<TListing[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [lastFetchedListing, setLastFetchedListing] =
        useState<null | QueryDocumentSnapshot<DocumentData, DocumentData>>(
            null
        );

    const params = useParams<Params>();

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const listingsRef = collection(db, "listings");

                const q = query(
                    listingsRef,
                    where("type", "==", params.categoryName),
                    orderBy("timestamp", "desc"),
                    limit(2)
                );

                const querySnap = await getDocs(q);

                const lastVisible = querySnap.docs[querySnap.docs.length - 1];
                setLastFetchedListing(lastVisible);

                const listings: TListing[] = [];

                querySnap.forEach((doc) => {
                    listings.push({ ...(doc.data() as TListing), id: doc.id });
                });

                setListings(listings);
                setLoading(false);
            } catch (error) {
                toast.error("Could not fetch listings");
            }
        };

        fetchListings();
    }, [params.categoryName]);

    const onLFetchMore = async () => {
        try {
            const listingsRef = collection(db, "listings");

            const q = query(
                listingsRef,
                where("type", "==", params.categoryName),
                orderBy("timestamp", "desc"),
                startAfter(lastFetchedListing),
                limit(2)
            );

            const querySnap = await getDocs(q);

            const lastVisible = querySnap.docs[querySnap.docs.length - 1];
            setLastFetchedListing(lastVisible);

            const listings: TListing[] = [];

            querySnap.forEach((doc) => {
                listings.push({ ...(doc.data() as TListing), id: doc.id });
            });

            setListings((prevListings) => [...prevListings, ...listings]);
            setLoading(false);
        } catch (error) {
            toast.error("Could not fetch listings");
        }
    };

    return (
        <div className="category">
            <header>
                <p className="pageHeader">
                    {params.categoryName === "rent"
                        ? "Places for rent"
                        : "Places for sale"}
                </p>
            </header>

            {loading ? (
                <Spinner />
            ) : listings && listings.length > 0 ? (
                <>
                    <main>
                        <ul className="categoryListings">
                            {listings.map((listing) => (
                                <ListingItem
                                    listing={listing}
                                    id={listing.id}
                                    key={listing.id}
                                />
                            ))}
                        </ul>
                    </main>

                    <br />
                    {lastFetchedListing && (
                        <p className="loadMore" onClick={onLFetchMore}>
                            Load More
                        </p>
                    )}
                </>
            ) : (
                <p>No Listings for {params.categoryName}</p>
            )}
        </div>
    );
}

export default Category;
