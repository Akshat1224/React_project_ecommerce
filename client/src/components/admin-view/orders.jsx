import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch all orders on component mount
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  const handleFetchOrderDetails = (getId) => {
    if (getId) {
      dispatch(getOrderDetailsForAdmin(getId));
    }
  };

  useEffect(() => {
    // Open dialog when orderDetails is available
    if (orderDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [orderDetails]);

  const closeDialog = () => {
    setOpenDetailsDialog(false);
    dispatch(resetOrderDetails());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orderList && orderList.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Order Price</TableHead>
                <TableHead>
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderList.map((orderItem, index) => (
                <TableRow key={index}>
                  <TableCell>{orderItem?._id || "N/A"}</TableCell>
                  <TableCell>
                    {orderItem?.orderDate
                      ? orderItem.orderDate.split("T")[0]
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`py-1 px-3 ${
                        orderItem?.orderStatus === "confirmed"
                          ? "bg-green-500"
                          : orderItem?.orderStatus === "rejected"
                          ? "bg-red-600"
                          : "bg-black"
                      }`}
                    >
                      {orderItem?.orderStatus || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>${orderItem?.totalAmount || "0.00"}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleFetchOrderDetails(orderItem?._id)}
                    >
                      View Details
                    </Button>
                    <Dialog
                      open={openDetailsDialog}
                      onOpenChange={closeDialog}
                    >
                      <AdminOrderDetailsView orderDetails={orderDetails} />
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No orders found.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;
