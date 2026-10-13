import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function ChatProductCard({ product, onSelect }) {
  const id = product.id || product._id;
  const onSale = product.salePrice > 0;

  return (
    <Card className="overflow-hidden">
      <button type="button" className="w-full text-left" onClick={() => onSelect(id)}>
        {product.image ? (
          <img src={product.image} alt={product.title} className="w-full h-20 object-cover" />
        ) : null}
        <CardContent className="p-2 space-y-1">
          <div className="text-xs font-medium text-gray-900 line-clamp-2">{product.title}</div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${onSale ? "line-through text-gray-500" : "font-semibold"}`}>
              ${product.price}
            </span>
            {onSale ? <span className="text-xs font-semibold">${product.salePrice}</span> : null}
            {product.totalStock === 0 ? (
              <Badge className="text-[10px]">Out of stock</Badge>
            ) : null}
          </div>
        </CardContent>
      </button>
      <Link to={`/shop/listing`} className="block px-2 pb-2 text-[11px] text-indigo-600">
        View in shop
      </Link>
    </Card>
  );
}

export default ChatProductCard;
