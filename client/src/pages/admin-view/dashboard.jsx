import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { addFeatureImage, getFeatureImages } from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  console.log(uploadedImageUrl, "uploadedImageUrl");

  function handleUploadFeatureImage() {
    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  console.log(featureImageList, "featureImageList");

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 min-h-screen">
      <div className="bg-white shadow-xl rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Manage Feature Images
        </h2>
        <ProductImageUpload
          imageFile={imageFile}
          setImageFile={setImageFile}
          uploadedImageUrl={uploadedImageUrl}
          setUploadedImageUrl={setUploadedImageUrl}
          setImageLoadingState={setImageLoadingState}
          imageLoadingState={imageLoadingState}
          isCustomStyling={true}
        />
        <Button
          onClick={handleUploadFeatureImage}
          className="mt-5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold py-2 rounded-lg transform transition-transform duration-300 hover:scale-105"
        >
          Upload
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((featureImgItem, index) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-lg shadow-lg transform transition-transform hover:scale-105 hover:shadow-2xl"
              >
                <img
                  src={featureImgItem.image}
                  alt="Feature"
                  className="w-full h-[300px] object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition duration-300 flex items-center justify-center">
                  <p className="text-white font-bold text-lg">Feature Image</p>
                </div>
              </div>
            ))
          : (
            <p className="text-gray-500 text-center col-span-full">
              No images uploaded yet.
            </p>
          )}
      </div>
    </div>
  );
}

export default AdminDashboard;
