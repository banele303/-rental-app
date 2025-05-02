"use client";

import Loading from "@/components/Loading";
import SettingsForm from "@/components/SettingsForm";
import {
  useGetAuthUserQuery,
  useUpdateManagerSettingsMutation,
} from "@/state/api";
import React from "react";

const ManagerSettings = () => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  const [updateManager] = useUpdateManagerSettingsMutation();

  if (isLoading) return <Loading />;

  const initialData = {
    name: authUser?.userInfo?.name || "",
    email: authUser?.userInfo?.email || "",
    phoneNumber: authUser?.userInfo?.phoneNumber || "",
  };

  const handleSubmit = async (data: typeof initialData) => {
    if (!authUser?.cognitoInfo?.userId) {
      console.error("No user ID found");
      return;
    }

    await updateManager({
      cognitoId: authUser.cognitoInfo.userId,
      ...data,
    });
  };

  return (
    <div className="flex justify-center md:mx-w-10xl">
      <SettingsForm
        initialData={initialData}
        onSubmit={handleSubmit}
        userType="manager"
      />
    </div>
  );
};

export default ManagerSettings;