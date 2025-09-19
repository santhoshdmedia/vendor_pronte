import React, { useState, useEffect } from "react";
import { User, Shield, Camera, Save } from "lucide-react";
import { toast } from "react-toastify";
import {
  getUserProfile,
  updateUserProfile,
  updateUserProfileImage,
  changePassword,
  deleteAccount,
  getCurrentUser,
  uploadImage,
} from "../Helper/apiHelper";
import ProfileUploader from "../Helper/ProfileUploader";
import ShowImages from "../Helper/ShowImages";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [image_path, setImagePath] = useState("");
  const [accountData, setAccountData] = useState({
    vendor_name: "",
    vendor_contact_number: "",
    vendor_email: "",
    shipping_address: "",
    gstNo: "",
    profile_img:"",
    city: "",
    state: "",
    country: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const id = localStorage.getItem("user");

  const fetchUserProfile = async () => {
    try {
      const response = await getCurrentUser(id);
      const userData = response.data.data;
      console.log(userData);
      setAccountData({
        vendor_name: userData.vendor_name || "",
        vendor_contact_number: userData.vendor_contact_number || "",
        vendor_email: userData.vendor_email || "",
        shipping_address: userData.shipping_address || "",
        gstNo: userData.gstNo || "N/A",
        city: userData.city || "N/A",
        state: userData.state || "N/A",
        country: userData.country || "N/A",
      });

      if (userData.profileImage) {
        setProfileImage(userData.profileImage);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to fetch profile data");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveAccount = async () => {
    setLoading(true);
    const user_id = id;
    
    try {
      console.log(image_path);

      setAccountData((prevState) => ({
        ...prevState,
        profile_img: image_path,
      }));
      console.log(accountData);
      const result=await updateUserProfile(user_id,accountData)
      console.log(result)
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Error changing password");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      setLoading(true);
      try {
        const response = await deleteAccount();

        if (response.data.success) {
          toast.success(
            response.data.message || "Account deleted successfully"
          );
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          toast.error(response.data.message || "Failed to delete account");
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error("Error deleting account");
      } finally {
        setLoading(false);
      }
    }
  };

  const tabs = [
    { id: "account", name: "Account", icon: User },
    { id: "security", name: "Security", icon: Shield },
  ];

  return (
    <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full  flex-shrink-0">
          
            <div>
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Account Information
                </h2>
              </div>

              <div className="p-6">
                {/* <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Profile Image (Optional)
                  </label>
                  {image_path ? (
                    <ShowImages
                      path={image_path}
                      setImage={setImagePath}
                      shape={"circle"}
                    />
                  ) : (
                    <ProfileUploader setImagePath={setImagePath} />
                  )}
                </div> */}

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="vendor_name"
                        value={accountData.vendor_name}
                        onChange={handleAccountChange}
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="vendor_contact_number"
                        value={accountData.vendor_contact_number}
                        onChange={handleAccountChange}
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="vendor_email"
                      value={accountData.vendor_email}
                      onChange={handleAccountChange}
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="shipping_address"
                      value={accountData.shipping_address}
                      onChange={handleAccountChange}
                      rows="3"
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="gstNo"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      GST Number
                    </label>
                    <input
                      type="text"
                      id="gstNo"
                      name="gstNo"
                      value={accountData.gstNo}
                      onChange={handleAccountChange}
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={accountData.city}
                        onChange={handleAccountChange}
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={accountData.state}
                        onChange={handleAccountChange}
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={accountData.country}
                        onChange={handleAccountChange}
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleSaveAccount}
                      disabled={loading}
                      className="inline-flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-Black font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
         
        </div>
      </div>
    </div>
  );
};

export default Settings;
