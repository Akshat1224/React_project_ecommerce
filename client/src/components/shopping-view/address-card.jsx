import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) {
  return (
    <Card
      onClick={
        setCurrentSelectedAddress
          ? () => setCurrentSelectedAddress(addressInfo)
          : null
      }
      className={`cursor-pointer transition-all duration-300 ease-in-out border-2 ${
        selectedId?._id === addressInfo?._id
          ? "border-indigo-600 shadow-lg scale-105"
          : "border-gray-300"
      } hover:scale-105 hover:shadow-md`}
    >
      <CardContent className="p-4 space-y-2">
        <Label className="text-lg font-semibold">Address: {addressInfo?.address}</Label>
        <Label>City: {addressInfo?.city}</Label>
        <Label>Pincode: {addressInfo?.pincode}</Label>
        <Label>Phone: {addressInfo?.phone}</Label>
        <Label>Notes: {addressInfo?.notes}</Label>
      </CardContent>
      <CardFooter className="flex justify-between p-4">
        <Button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering onClick from parent Card
            handleEditAddress(addressInfo);
          }}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Edit
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering onClick from parent Card
            handleDeleteAddress(addressInfo);
          }}
          className="bg-red-500 text-white hover:bg-red-600"
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AddressCard;
