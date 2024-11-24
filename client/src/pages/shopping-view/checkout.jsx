import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const totalCartAmount = cartItems?.items?.length
    ? cartItems.items.reduce(
        (sum, currentItem) =>
          sum +
          (currentItem.salePrice || currentItem.price) * currentItem.quantity,
        0
      )
    : 0;

  const handleInitiatePaypalPayment = () => {
    if (!cartItems?.items?.length) {
      toast({
        title: "Your cart is empty. Please add items to proceed.",
        variant: "destructive",
      });
      return;
    }
    if (!currentSelectedAddress) {
      toast({
        title: "Please select an address to proceed.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user.id,
      cartId: cartItems._id,
      cartItems: cartItems.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        price: item.salePrice || item.price,
        quantity: item.quantity,
      })),
      addressInfo: { ...currentSelectedAddress },
      totalAmount: totalCartAmount,
    };

    dispatch(createNewOrder(orderData)).then((response) => {
      if (response.payload.success) {
        window.location.href = approvalURL;
      } else {
        toast({ title: "Payment initiation failed.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex flex-col">
      <div className="relative h-64 w-full overflow-hidden">
        <img src={img} alt="Checkout Banner" className="h-full w-full object-cover" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="p-4 bg-white rounded-lg shadow-lg">
          <div className="space-y-6">
            {cartItems?.items?.map((item) => (
              <UserCartItemsContent key={item.id} cartItem={item} />
            ))}
          </div>
          <div className="mt-6 flex justify-between text-lg font-medium">
            <span>Total:</span>
            <span>${totalCartAmount.toFixed(2)}</span>
          </div>
          <Button
            onClick={handleInitiatePaypalPayment}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Checkout with Paypal
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
