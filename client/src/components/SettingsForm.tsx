import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsFormData, settingsSchema } from "@/lib/schemas";
import { Form } from "./ui/form";
import { CustomFormField } from "./FormField";
import { Button } from "./ui/button";

const SettingsForm = ({
  initialData,
  onSubmit,
  userType,
}: SettingsFormProps) => {
  const [editMode, setEditMode] = useState(false);
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      form.reset(initialData);
    }
  };

  const handleSubmit = async (data: SettingsFormData) => {
    await onSubmit(data);
    setEditMode(false);
  };

  return (
    <div className="py-8 px-4 md:px-6 lg:px-8  max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {`${userType.charAt(0).toUpperCase() + userType.slice(1)} Settings`}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your account preferences and personal information
        </p>
      </div>

      <div className="bg-[#1A1C1E] rounded-xl border border-gray-800 shadow-lg backdrop-blur-sm">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="divide-y divide-gray-800"
          >
            <div className="p-6 space-y-6">
              <CustomFormField
                name="name"
                label="Name"
                disabled={!editMode}
                className="text-gray-100"
              />
              <CustomFormField
                name="email"
                label="Email"
                type="email"
                disabled={!editMode}
                className="text-gray-100"
              />
              <CustomFormField
                name="phoneNumber"
                label="Phone Number"
                disabled={!editMode}
                className="text-gray-100"
              />
            </div>

            <div className="p-6 flex items-center justify-end gap-4 bg-black/60 rounded-b-xl">
              <Button
                type="button"
                onClick={toggleEditMode}
                variant="outline"
                className="border-gray-700 text-gray-300 bg-red-800 hover:bg-gray-800 hover:text-white"
              >
                {editMode ? "Cancel" : "Edit"}
              </Button>

              {editMode && (
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Save Changes
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SettingsForm;
