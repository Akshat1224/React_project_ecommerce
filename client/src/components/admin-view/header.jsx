import { AlignJustify, UserMinus } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/auth-slice";

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  return (
    <header
      className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 border-b shadow-sm"
    >
      {/* Toggle Menu Button */}
      <Button
        onClick={() => setOpen(true)}
        className="lg:hidden sm:block p-2 rounded-md hover:scale-105 hover:shadow-md transition-transform"
      >
        <AlignJustify className="w-6 h-6 text-gray-600" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Logout Button */}
      <div className="flex flex-1 justify-end">
        <Button
          onClick={handleLogout}
          className="inline-flex gap-2 items-center rounded-lg px-5 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200 ease-in-out"
        >
          <UserMinus className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
