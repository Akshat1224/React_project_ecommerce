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
    <div
      className="mx-auto w-full max-w-md space-y-6 p-6 border rounded-lg bg-white shadow-lg 
                 animate-fade-in-down"
    >
      <div className="text-center">
        <h1
          className="text-3xl font-bold tracking-tight text-foreground 
                     animate-slide-in"
        >
          Sign in to your account
        </h1>
        <p className="mt-2 text-gray-600">
          Don't have an account?
          <Link
            className="font-medium ml-2 text-primary hover:underline 
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
  );
}

export default AuthLogin;
