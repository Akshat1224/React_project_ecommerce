import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function ProductImageUpload({
  imageFile,
  setImageFile,
  imageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  isEditMode,
  isCustomStyling = false,
}) {
  const inputRef = useRef(null);

  function handleImageFileChange(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) setImageFile(selectedFile);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) setImageFile(droppedFile);
  }

  function handleRemoveImage() {
    setImageFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function uploadImageToCloudinary() {
    setImageLoadingState(true);
    const data = new FormData();
    data.append("my_file", imageFile);
    const response = await axios.post(
      "https://react-project-ecommerce.onrender.com/api/admin/products/upload-image",
      data
    );

    if (response?.data?.success) {
      setUploadedImageUrl(response.data.result.url);
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    if (imageFile !== null) uploadImageToCloudinary();
  }, [imageFile]);

  return (
    <div
      className={`w-full mt-6 ${isCustomStyling ? "" : "max-w-md mx-auto"} 
      bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4 rounded-lg shadow-md`}
    >
      <Label className="text-lg font-semibold mb-4 block text-gray-700">
        Upload Image
      </Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${
          isEditMode ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        } border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center
        transition-transform duration-300 hover:scale-105 hover:border-indigo-500`}
      >
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          disabled={isEditMode}
        />
        {!imageFile ? (
          <Label
            htmlFor="image-upload"
            className="flex flex-col items-center text-gray-500"
          >
            <UploadCloudIcon className="w-12 h-12 mb-2 text-gray-400 animate-bounce" />
            <span className="text-sm">Upload Your Image Here</span>
          </Label>
        ) : imageLoadingState ? (
          <Skeleton className="w-full h-10 bg-gray-200 animate-pulse rounded-lg" />
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <FileIcon className="w-8 h-8 text-indigo-500 mr-3" />
              <p className="text-sm font-medium text-gray-700">
                {imageFile.name}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-900"
              onClick={handleRemoveImage}
            >
              <XIcon className="w-5 h-5" />
              <span className="sr-only">Remove File</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductImageUpload;
