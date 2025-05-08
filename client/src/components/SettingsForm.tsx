import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsFormData, settingsSchema } from "@/lib/schemas";
import { Form } from "./ui/form";
import { CustomFormField } from "./FormField";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Loader2, Save, User, Shield, Bell, Key, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface SettingsFormProps {
  initialData: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  onSubmit: (data: any) => Promise<void>;
  userType: string;
}

const SettingsForm = ({
  initialData,
  onSubmit,
  userType,
}: SettingsFormProps) => {
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  
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
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      setEditMode(false);
      toast.success("Settings updated successfully", {
        description: "Your profile information has been saved.",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      toast.error("Failed to update settings", {
        description: "Please try again later."
      });
      console.error("Error updating settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!initialData.name) return userType[0].toUpperCase();
    
    const nameParts = initialData.name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  return (
    <div className="py-8 px-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-blue-950 to-black rounded-xl p-6 md:p-8 mb-8">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 z-0"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white/10 shadow-xl">
              <AvatarImage src="" alt={initialData.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white text-xl font-bold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <Badge className="absolute -bottom-2 -right-2 bg-blue-600 text-white border-none px-2 py-1">
              {userType}
            </Badge>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {initialData.name || `${userType.charAt(0).toUpperCase() + userType.slice(1)} Account`}
            </h1>
            <p className="text-gray-300 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8 bg-[#111] border border-[#333]">
          <TabsTrigger value="account" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="mt-0">
          <Card className="bg-[#0F1112] border border-[#333] shadow-xl">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <CustomFormField
                    name="name"
                    label="Full Name"
                    disabled={!editMode}
                    className="text-gray-100"
                  />
                  <CustomFormField
                    name="email"
                    label="Email Address"
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
                  
                  <div className="flex items-center justify-end gap-4 pt-4">
                    {!editMode ? (
                      <Button
                        type="button"
                        onClick={toggleEditMode}
                        variant="outline"
                        className="border-[#333] bg-[#111] hover:bg-[#222] text-white"
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="button"
                          onClick={toggleEditMode}
                          variant="outline"
                          className="border-[#333] bg-[#111] hover:bg-[#222] text-white"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-0">
          <Card className="bg-[#0F1112] border border-[#333] shadow-xl">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-[#111] border border-[#333] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">Password</h3>
                    <p className="text-sm text-gray-400">Change your password</p>
                  </div>
                  <Button variant="outline" className="border-[#333] bg-[#111] hover:bg-[#222] text-white">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>
              
              <div className="bg-[#111] border border-[#333] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" className="border-[#333] bg-[#111] hover:bg-[#222] text-white">
                    <Shield className="h-4 w-4 mr-2" />
                    Setup 2FA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-0">
          <Card className="bg-[#0F1112] border border-[#333] shadow-xl">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-[#111] border border-[#333] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-400">Receive updates via email</p>
                  </div>
                  <Button variant="outline" className="border-[#333] bg-[#111] hover:bg-[#222] text-white">
                    Configure
                  </Button>
                </div>
              </div>
              
              <div className="bg-[#111] border border-[#333] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">SMS Notifications</h3>
                    <p className="text-sm text-gray-400">Receive updates via text message</p>
                  </div>
                  <Button variant="outline" className="border-[#333] bg-[#111] hover:bg-[#222] text-white">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsForm;
