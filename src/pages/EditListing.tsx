import Spinner from "@/components/shared/Spinner";
import { db } from "@/firebase.config";
import { TGeolocation, TListing } from "@/types/types";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
    doc,
    getDoc,
    serverTimestamp,
    Timestamp,
    updateDoc,
} from "firebase/firestore";
import {
    getDownloadURL,
    getStorage,
    ref,
    uploadBytesResumable,
} from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

type FormData = {
    type: string;
    name: string;
    bathrooms: number;
    bedrooms: number;
    discountedPrice: number;
    furnished: boolean;
    geolocation: TGeolocation;
    address: string;
    offer: boolean;
    parking: boolean;
    regularPrice: number;
    latitude?: number;
    longitude?: number;
    images: File[];
    userRef: string;
};

type FormDataCopy = Omit<TListing, "id" | "timestamp"> & {
    timestamp: Timestamp;
};

type Params = {
    id: string;
};

function EditListing() {
    const [geoLocationEnabled, setGeoLocationEnabled] =
        useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [listing, setListing] = useState<null | TListing>(null);
    const [formData, setFormData] = useState<FormData>({
        type: "",
        name: "",
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: "",
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: [],
        latitude: 0,
        longitude: 0,
        geolocation: {
            lat: 0,
            lng: 0,
        },
        userRef: "",
    });

    const {
        type,
        name,
        bedrooms,
        bathrooms,
        parking,
        furnished,
        address,
        offer,
        regularPrice,
        discountedPrice,
        images,
        latitude,
        longitude,
    } = formData;

    const auth = getAuth();
    const navigate = useNavigate();
    const params = useParams<Params>();
    const isMounted = useRef<boolean>(true);

    // Redirect if listing is not user's
    useEffect(() => {
        if (listing !== null && listing.userRef !== auth.currentUser?.uid) {
            toast.error("You can't edit that listing");
            navigate("/");
        }
    }, [auth.currentUser?.uid, listing, navigate]);

    // fetches the listing to edit
    useEffect(() => {
        setLoading(true);

        const fetchListing = async () => {
            const docRef = doc(db, "listings", params.id as string);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (!data.latitude && !data.longitude) {
                    setGeoLocationEnabled(true);
                }
                setListing(data as TListing);
                setFormData({ ...(data as FormData), address: data.location });
                setLoading(false);
            } else {
                navigate("/");
                toast.error("Listing not found");
            }
        };

        fetchListing();
    }, [params.id, navigate]);

    // sets userRef to the current user
    useEffect(() => {
        if (isMounted) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setFormData({ ...formData, userRef: user.uid });
                } else {
                    navigate("/sign-in");
                }
            });
        }

        return () => {
            isMounted.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted]);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);

        if (discountedPrice >= regularPrice) {
            setLoading(false);
            toast.error("Discounted price must be lower than regular price");
            return;
        }

        if (images.length > 6) {
            setLoading(false);
            toast.error("You can only upload 6 images");
            return;
        }

        const geolocation: TGeolocation = {
            lat: 0,
            lng: 0,
        };
        let location;

        if (geoLocationEnabled) {
            const response = await fetch(`
            https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${
                import.meta.env.VITE_GEOCODE_API_KEY
            }
        `);

            const data = await response.json();

            geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
            geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

            location =
                data.status === "ZERO_RESULTS"
                    ? undefined
                    : data.results[0]?.formatted_address;

            if (location === undefined || location.includes("undefined")) {
                setLoading(false);
                toast.error("Invalid address");
                return;
            }
            delete formData.latitude;
            delete formData.longitude;
        } else {
            geolocation.lat = latitude ? +latitude : 0;
            geolocation.lng = longitude ? +longitude : 0;
            formData.longitude = longitude ? +longitude : 0;
            formData.latitude = latitude ? +latitude : 0;
            location = address;
        }

        // Store images in firebase storage

        const storeImage = async (image: File) => {
            return new Promise((resolve, reject) => {
                const storage = getStorage();
                const fileName = `${auth.currentUser?.uid}-${
                    image.name
                }-${uuidv4()}`;

                const storageRef = ref(storage, "images/" + fileName);

                const uploadTask = uploadBytesResumable(storageRef, image);

                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        switch (snapshot.state) {
                            case "paused":
                                break;
                            case "running":
                                break;
                        }
                    },
                    (error) => {
                        reject(error);
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then(
                            (downloadURL) => {
                                resolve(downloadURL);
                            }
                        );
                    }
                );
            });
        };

        const imageUrls = await Promise.all(
            (images ? [...images] : []).map(
                (image) => storeImage(image) as Promise<string>
            )
        ).catch(() => {
            setLoading(false);
            toast.error("Images not uploaded");
            return [];
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { images: imageFiles, address: adrs, ...rest } = formData;

        const formDataCopy: FormDataCopy = {
            ...rest,
            imageUrls,
            geolocation,
            location,
            timestamp: serverTimestamp() as Timestamp,
        };

        location && (formDataCopy.location = location);
        !formDataCopy.offer && delete formDataCopy.discountedPrice;

        formDataCopy.bedrooms = +formDataCopy.bedrooms;
        formDataCopy.bathrooms = +formDataCopy.bathrooms;
        formDataCopy.regularPrice = +formDataCopy.regularPrice;
        formDataCopy.discountedPrice &&
            (formDataCopy.discountedPrice = +formDataCopy.discountedPrice);

        const docRef = doc(db, "listings", params.id as string);
        await updateDoc(docRef, formDataCopy);

        setLoading(false);
        toast.success("Listing saved");
        navigate(`/category/${formDataCopy.type}/${docRef.id}`);
    };

    const onMutate = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.MouseEvent<HTMLButtonElement>
            | React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        let boolean = null;

        if (e.currentTarget instanceof HTMLButtonElement) {
            if (e.currentTarget.value === "true") {
                boolean = true;
            }
            if (e.currentTarget.value === "false") {
                boolean = false;
            }
        }

        // Files
        if (e.currentTarget instanceof HTMLInputElement) {
            if (e.currentTarget.files) {
                setFormData({
                    ...formData,
                    images: [...e.currentTarget.files],
                });
            }
        }

        // Text
        if (
            e.currentTarget instanceof HTMLButtonElement ||
            e.currentTarget instanceof HTMLInputElement ||
            e.currentTarget instanceof HTMLTextAreaElement
        ) {
            if (e.currentTarget.id !== "images") {
                const value = e.currentTarget.value;
                const id = e.currentTarget.id;

                setFormData((prev) => ({
                    ...prev,
                    [id]: boolean ?? value,
                }));
            }
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="profile">
            <header>
                <p className="pageHeader">Edit a Listing</p>
            </header>

            <main>
                <form onSubmit={onSubmit}>
                    <label className="formLabel">Sell / Rent</label>
                    <div className="formButtons">
                        <button
                            type="button"
                            className={
                                type === "sale"
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            id="type"
                            value="sale"
                            onClick={onMutate}
                        >
                            Sell
                        </button>
                        <button
                            type="button"
                            className={
                                type === "rent"
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            id="type"
                            value="rent"
                            onClick={onMutate}
                        >
                            Rent
                        </button>
                    </div>

                    <label className="formLabel">Name</label>
                    <input
                        className="formInputName"
                        type="text"
                        id="name"
                        value={name}
                        onChange={onMutate}
                        maxLength={32}
                        minLength={10}
                        required
                    />

                    <div className="formRooms flex">
                        <div>
                            <label className="formLabel">Bedrooms</label>
                            <input
                                className="formInputSmall"
                                type="number"
                                id="bedrooms"
                                value={bedrooms}
                                onChange={onMutate}
                                min="1"
                                max="50"
                                required
                            />
                        </div>
                        <div>
                            <label className="formLabel">Bathrooms</label>
                            <input
                                className="formInputSmall"
                                type="number"
                                id="bathrooms"
                                value={bathrooms}
                                onChange={onMutate}
                                min="1"
                                max="50"
                                required
                            />
                        </div>
                    </div>

                    <label className="formLabel">Parking spot</label>
                    <div className="formButtons">
                        <button
                            className={
                                parking ? "formButtonActive" : "formButton"
                            }
                            type="button"
                            id="parking"
                            value="true"
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !parking && parking !== null
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            type="button"
                            id="parking"
                            value="false"
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Furnished</label>
                    <div className="formButtons">
                        <button
                            className={
                                furnished ? "formButtonActive" : "formButton"
                            }
                            type="button"
                            id="furnished"
                            value="true"
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !furnished && furnished !== null
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            type="button"
                            id="furnished"
                            value="false"
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Add geolocation</label>
                    <div className="formButtons">
                        <button
                            className={
                                !geoLocationEnabled
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            type="button"
                            value="true"
                            onClick={() => setGeoLocationEnabled(false)}
                        >
                            Yes
                        </button>
                        <button
                            className={
                                geoLocationEnabled
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            type="button"
                            value="false"
                            onClick={() => setGeoLocationEnabled(true)}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Address</label>
                    <textarea
                        className="formInputAddress"
                        id="address"
                        value={address}
                        onChange={onMutate}
                        required
                    />

                    {!geoLocationEnabled && (
                        <div className="formLatLng flex">
                            <div>
                                <label className="formLabel">Latitude</label>
                                <input
                                    className="formInputSmall"
                                    type="number"
                                    id="latitude"
                                    value={latitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                            <div>
                                <label className="formLabel">Longitude</label>
                                <input
                                    className="formInputSmall"
                                    type="number"
                                    id="longitude"
                                    value={longitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <label className="formLabel">Offer</label>
                    <div className="formButtons">
                        <button
                            className={
                                offer ? "formButtonActive" : "formButton"
                            }
                            type="button"
                            id="offer"
                            value="true"
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !offer && offer !== null
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            type="button"
                            id="offer"
                            value="false"
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Regular Price</label>
                    <div className="formPriceDiv">
                        <input
                            className="formInputSmall"
                            type="number"
                            id="regularPrice"
                            value={regularPrice}
                            onChange={onMutate}
                            min="50"
                            max="750000000"
                            required
                        />
                        {type === "rent" && (
                            <p className="formPriceText">$ / Month</p>
                        )}
                    </div>

                    {offer && (
                        <>
                            <label className="formLabel">
                                Discounted Price
                            </label>
                            <input
                                className="formInputSmall"
                                type="number"
                                id="discountedPrice"
                                value={discountedPrice}
                                onChange={onMutate}
                                min="50"
                                max="750000000"
                                required={offer}
                            />
                        </>
                    )}

                    <label className="formLabel">Images</label>
                    <p className="imagesInfo">
                        The first image will be the cover (max 6).
                    </p>
                    <input
                        className="formInputFile"
                        type="file"
                        id="images"
                        onChange={onMutate}
                        max="6"
                        accept=".jpg,.png,.jpeg"
                        multiple
                        required
                    />
                    <button
                        type="submit"
                        className="primaryButton createListingButton"
                    >
                        Create Listing
                    </button>
                </form>
            </main>
        </div>
    );
}

export default EditListing;
