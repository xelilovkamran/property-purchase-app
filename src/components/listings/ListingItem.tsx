import bathtubIcon from "@/assets/svg/bathtubIcon.svg";
import bedIcon from "@/assets/svg/bedIcon.svg";
import DeleteIcon from "@/assets/svg/deleteIcon.svg?react";
import EditIcon from "@/assets/svg/editIcon.svg?react";
import { DocumentData } from "firebase/firestore";
import { Link } from "react-router-dom";

type Props = {
    listing: DocumentData;
    id: string;
    onDelete?: (id: string, name: string) => void;
    onEdit?: (id: string, name: string) => void;
};

function ListingItem({ listing, id, onDelete, onEdit }: Props) {
    return (
        <li className="categoryListing">
            <Link
                to={`/category/${listing.type}/${id}`}
                className="categoryListingLink"
            >
                <img
                    src={listing.imageUrls[0]}
                    alt={listing.name}
                    className="categoryListingImg"
                />

                <div className="categoryListingDetails">
                    <p className="categoryListingLocation">
                        {listing.location}
                    </p>
                    <p className="categoryListingName">{listing.name}</p>

                    <p className="categoryListingPrice">
                        $
                        {listing.offer
                            ? listing.discountedPrice
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            : listing.regularPrice
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        {listing.type === "rent" && " / Month"}
                    </p>

                    <div className="categoryListingInfoDiv">
                        <img src={bedIcon} alt="bed" />
                        <p className="categoryListingInfoText">
                            {listing.bedrooms > 1
                                ? `${listing.bedrooms} Bedromms`
                                : "1 Bedroom"}
                        </p>
                        <img src={bathtubIcon} alt="bath" />
                        <p className="categoryListingInfoText">
                            {listing.bathrooms > 1
                                ? `${listing.bathrooms} Bathromms`
                                : "1 Bathroom"}
                        </p>
                    </div>
                </div>
            </Link>

            <div className="listingIconsDiv">
                {onDelete && (
                    <DeleteIcon
                        fill="rgb(231, 76, 60)"
                        onClick={() => onDelete(listing.id, listing.name)}
                        style={{ cursor: "pointer" }}
                    />
                )}
                {onEdit && (
                    <EditIcon
                        fill="rgb(0, 255, 0)"
                        onClick={() => onEdit(listing.id, listing.name)}
                        style={{ cursor: "pointer" }}
                    />
                )}
            </div>
        </li>
    );
}

export default ListingItem;
