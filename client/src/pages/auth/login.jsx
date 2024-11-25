import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="relative flex min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">
      {/* Left Section */}
      <div className="w-1/2 flex items-center justify-center bg-white p-8 shadow-xl">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Sign In</h2>
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                className="font-medium text-primary hover:underline"
                to="/auth/register"
              >
                Register here
              </Link>
            </p>
          </div>

          <CommonForm
            formControls={loginFormControls}
            buttonText={"Sign In"}
            formData={formData}
            setFormData={setFormData}
            onSubmit={onSubmit}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="w-1/2 flex items-center justify-center bg-black text-white relative">
        <h1 className="text-4xl font-bold animate-bounce text-center">
          Welcome to ShoeShopAwesome
        </h1>
      </div>
    </div>
  );
}

export default AuthLogin;
