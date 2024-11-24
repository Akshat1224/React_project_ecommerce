import { MinusCircle, PlusCircle, Trash2 } from "lucide-react"; // Updated icons
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) => item.productId === getCartItem?.productId
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === getCartItem?.productId
        );
        const getTotalStock = productList[getCurrentProductIndex].totalStock;

        if (indexOfCurrentCartItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getTotalStock} items in stock.`,
              variant: "destructive",
            });
            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item updated successfully.",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({ userId: user?.id, productId: getCartItem?.productId })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item deleted successfully.",
        });
      }
    });
  }

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Image with hover effect */}
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="w-20 h-20 rounded-lg object-cover transform hover:scale-105 transition-transform duration-300"
      />

      {/* Product details */}
      <div className="flex-1">
        <h3 className="font-extrabold text-gray-800">{cartItem?.title}</h3>
        <div className="flex items-center gap-2 mt-2">
          {/* Decrease Quantity Button */}
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full border border-gray-300 hover:border-red-400 transition-colors duration-200"
            size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <MinusCircle className="w-5 h-5 text-gray-600 hover:text-red-400" />
            <span className="sr-only">Decrease</span>
          </Button>

          {/* Quantity */}
          <span className="font-semibold text-gray-800">{cartItem?.quantity}</span>

          {/* Increase Quantity Button */}
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full border border-gray-300 hover:border-green-400 transition-colors duration-200"
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <PlusCircle className="w-5 h-5 text-gray-600 hover:text-green-400" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </div>

      {/* Price and Delete Button */}
      <div className="flex flex-col items-end">
        <p className="font-semibold text-gray-800">
          $
          {(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
            cartItem?.quantity
          ).toFixed(2)}
        </p>

        {/* Delete Button */}
        <Trash2
          onClick={() => handleCartItemDelete(cartItem)}
          className="cursor-pointer mt-2 text-gray-600 hover:text-red-500 transition-colors duration-200"
          size={24}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;
