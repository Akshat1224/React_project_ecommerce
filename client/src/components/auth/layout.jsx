import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Section: Form */}
      <div className="flex flex-1 items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
        <Outlet />
      </div>

      {/* Right Section: Welcome Text */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 w-1/2 px-12">
        <div className="max-w-md space-y-6 text-center text-white">
          <h1 className="text-4xl font-extrabold tracking-tight animate-bounce">
            Welcome to E-commerce
          </h1>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
