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
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      {/* Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-80 h-80 bg-blue-500 opacity-40 rounded-full animate-pulse top-20 left-20"></div>
        <div className="absolute w-64 h-64 bg-green-400 opacity-30 rounded-full animate-spin-slow bottom-10 right-10"></div>
      </div>

      {/* Login Form */}
      <div
        className="relative z-10 mx-auto w-full max-w-md p-8 space-y-6 bg-white 
                   rounded-lg shadow-xl border border-gray-200 backdrop-blur-sm 
                   animate-fade-in-down"
      >
        <div className="text-center">
          <h1
            className="text-3xl font-extrabold tracking-tight text-gray-800 
                       animate-slide-in"
          >
            Welcome Back!
          </h1>
          <p className="mt-2 text-gray-600">
            Don't have an account?{" "}
            <Link
              className="ml-2 font-medium text-primary hover:underline 
                         transition-transform duration-300 hover:scale-105"
              to="/auth/register"
            >
              Register
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
  );
}

export default AuthLogin;
