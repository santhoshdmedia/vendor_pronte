import { message, Skeleton, Upload } from "antd";
import { uploadImage } from "./apiHelper";
import _ from "lodash";
import { FiUpload, FiImage } from "react-icons/fi";
import { useState } from "react";

const UploadHelper = (props) => {
  const { setImagePath, image_path, multiple, max, field_key, blog, current_key, handleChange } = props;
  const [loading, setLoading] = useState(false);

  const beforeUpload = (file) => {
    const isImage = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type);
    const isLt5M = file.size / 1024 / 1024 < 5;
    
    if (!isImage) {
      message.warning(`${file.name} is not a supported image format`);
      return Upload.LIST_IGNORE;
    }
    
    if (!isLt5M) {
      message.warning('Image must be smaller than 5MB');
      return Upload.LIST_IGNORE;
    }
    
    return true;
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const result = await uploadImage(formData);
      const uploadedUrl = _.get(result, "data.data.url", "");

      if (blog) {
        handleChange(current_key, uploadedUrl);
        onSuccess();
        return;
      }

      if (uploadedUrl) {
        if (Number(field_key)) {
          setImagePath(prev => [
            ...prev,
            {
              key: prev.length + 1,
              path: uploadedUrl,
              field_key,
            },
          ]);
        } else {
          if (multiple) {
            setImagePath(prev => [
              ...prev,
              {
                key: prev.length + 1,
                path: uploadedUrl,
              },
            ]);
          } else {
            setImagePath(uploadedUrl);
          }
        }
        message.success("Image uploaded successfully!");
      }
      onSuccess();
    } catch (err) {
      console.log(err);
      message.error("Failed to upload image. Please try again.");
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Skeleton loading={loading} active>
      <Upload.Dragger
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        showUploadList={false}
        multiple={multiple}
        maxCount={max || 1}
        style={{ 
          background: "white", 
          border: "2px dashed #d9d9d9",
          borderRadius: "8px",
          padding: "16px"
        }}
        className="hover:border-blue-400 transition-colors"
      >
        <div className="flex flex-col items-center justify-center py-6">
          <div className="text-2xl mb-2 text-gray-400">
            {loading ? <div className="animate-pulse"><FiImage /></div> : <FiUpload />}
          </div>
          <p className="text-gray-600 font-medium">Click or drag images to upload</p>
          <p className="text-gray-400 text-sm mt-1">
            Supports JPG, PNG, JPEG, WEBP • Max 5MB
          </p>
        </div>
      </Upload.Dragger>
    </Skeleton>
  );
};

export default UploadHelper;