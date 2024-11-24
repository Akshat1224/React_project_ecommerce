import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();

  const totalCartAmount = cartItems?.length
    ? cartItems.reduce(
        (sum, currentItem) =>
          sum +
          (currentItem.salePrice || currentItem.price) * currentItem.quantity,
        0
      )
    : 0;

  return (
    <SheetContent className="sm:max-w-md p-6 bg-white shadow-lg rounded-lg">
      <SheetHeader>
        <SheetTitle className="text-xl font-semibold">Your Cart</SheetTitle>
      </SheetHeader>
      <div className="mt-4 space-y-6">
        {cartItems?.length > 0 ? (
          cartItems.map((item) => (
            <UserCartItemsContent key={item.id} cartItem={item} />
          ))
        ) : (
          <div className="text-gray-500 text-center">Your cart is empty!</div>
        )}
      </div>
      <div className="mt-8">
        <div className="flex justify-between text-lg font-medium">
          <span>Total:</span>
          <span>${totalCartAmount.toFixed(2)}</span>
        </div>
      </div>
      <Button
        onClick={() => {
          navigate("/shop/checkout");
          setOpenCartSheet(false);
        }}
        className="w-full mt-6 bg-primary hover:bg-primary-dark"
      >
        Checkout
      </Button>
    </SheetContent>
  );
}

export default UserCartWrapper;
