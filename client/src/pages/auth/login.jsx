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
    <div className="relative flex min-h-screen">
      {/* Left Section: Welcome Message */}
      <div className="flex-1 flex items-center justify-center px-12 py-24 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl font-bold tracking-tight mb-6 animate-slide-in">Welcome to ShoeShopAwesome!</h1>
          <p className="text-lg opacity-80">
            Explore the best collection of shoes. Your perfect pair is just a click away.
          </p>
        </div>
      </div>

      {/* Right Section: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white rounded-lg shadow-xl border-l-4 border-gray-200 backdrop-blur-lg">
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
    </div>
  );
}

export default AuthLogin;
