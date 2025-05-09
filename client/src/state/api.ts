import { cleanParams, createNewUserInDatabase, withToast } from "@/lib/utils"
// Ensure prismaTypes correctly defines these or import directly from @prisma/client if preferred
// Assuming Tenant and Manager are the correct types for user details from DB
import type { Application, Lease, Manager, Payment, Property, Room, Tenant } from "@/types/prismaTypes"
// Import the Cognito User type if available, or define a minimal structure
import type { AuthUser as CognitoAuthUser } from 'aws-amplify/auth'; // Example import path
// Import RTK Query types
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { TagDescription } from '@reduxjs/toolkit/query';
import { toast } from 'sonner';

import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth"
import type { FiltersState } from "." // Assuming FiltersState is defined in the same directory

// Define the base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  console.error("Error: NEXT_PUBLIC_API_BASE_URL is not defined in environment variables.");
  // Optionally throw an error or provide a default fallback for development
  // throw new Error("NEXT_PUBLIC_API_BASE_URL must be defined");
}

// --- Define a specific type for the authenticated user state ---
export interface AppUser {
  cognitoInfo: CognitoAuthUser; // Use the type from aws-amplify/auth
  userInfo: Tenant | Manager;   // The user details from your database (Tenant or Manager)
  userRole: "tenant" | "manager";
}
// --- End AppUser Definition ---

// Define the valid tag types used throughout the API slice
type CacheTagType = "Applications" | "Managers" | "Tenants" | "Properties" | "PropertyDetails" | "Leases" | "Payments" | "Rooms";


export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    timeout: 60000, // Increase timeout to 60 seconds
    prepareHeaders: async (headers) => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        if (idToken) {
          headers.set("Authorization", `Bearer ${idToken}`);
        }
      } catch (error) {
        // Silently handle auth errors - this allows non-authenticated users to access public endpoints
        console.log("User not authenticated, continuing as guest");
      }
      return headers;
    },
    // Add response handling to properly handle non-JSON responses
    validateStatus: (response, body) => {
      if (response.status === 404) {
        // Return empty array for 404s on list endpoints
        if (response.url.includes('/rooms')) {
          return true;
        }
      }
      return response.status >= 200 && response.status < 300;
    },
    // Add custom response handling with retry logic
    async fetchFn(input, init) {
      const maxRetries = 3;
      let retries = 0;
      let lastError;
      
      while (retries < maxRetries) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          const response = await fetch(input, {
            ...init,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          // Clone the response before reading it
          const clonedResponse = response.clone();
      
      try {
        // Try to parse as JSON first
        const data = await response.json();
        // Create a new Response with the JSON data
        return new Response(JSON.stringify(data), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      } catch (e) {
        // If parsing fails, handle based on status
        if (response.status === 404 && response.url.includes('/rooms')) {
          // Return empty array for 404s on rooms endpoint
          return new Response(JSON.stringify([]), {
            status: 200,
            statusText: 'OK',
            headers: response.headers
          });
        }
        
        // For other errors, get the text from the cloned response
        const errorText = await clonedResponse.text();
        throw {
          status: response.status,
          data: errorText,
          originalStatus: response.status
        };
      }
        } catch (error) {
          lastError = error;
          retries++;
          console.log(`API request failed, retry attempt ${retries}/${maxRetries}`);
          
          if (retries >= maxRetries) {
            console.error('Max retries reached, throwing last error:', error);
            throw error;
          }
          
          // Exponential backoff: 1s, 2s, 4s, etc.
          const delay = Math.min(1000 * Math.pow(2, retries - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      // This should never be reached due to the throw in the loop, but TypeScript needs it
      throw lastError;
    }
  }),
  reducerPath: "api",
  tagTypes: ["Managers", "Tenants", "Properties", "PropertyDetails", "Leases", "Payments", "Applications", "Rooms"],
  endpoints: (build) => ({
    // --- Use the new AppUser type ---
    getAuthUser: build.query<AppUser, void>({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          console.log("Starting getAuthUser queryFn");
          
          const session = await fetchAuthSession();
          console.log("Auth session fetched:", { 
            hasSession: !!session, 
            hasTokens: !!session?.tokens,
            hasIdToken: !!session?.tokens?.idToken 
          });
          
          const idToken = session.tokens?.idToken;
          const cognitoUser = await getCurrentUser();
          console.log("Cognito user fetched:", { 
            hasUser: !!cognitoUser,
            userId: cognitoUser?.userId,
            username: cognitoUser?.username
          });
          
          const rawUserRole = idToken?.payload["custom:role"] as string;
          console.log("User role from token:", rawUserRole);

          if (!cognitoUser || !idToken) {
            console.log("No authenticated user found, returning error");
            // Instead of returning null, return a proper error object
            // This ensures type compatibility with RTK Query
            return { 
              error: { 
                status: 401, 
                error: "No authenticated user found",
                data: "User not authenticated"
              } 
            } as const;
          }

          const userRole = rawUserRole === "manager" ? "manager" : "tenant" as "tenant" | "manager";
          const endpoint = userRole === "manager" ? `/managers/${cognitoUser.userId}` : `/tenants/${cognitoUser.userId}`;
          console.log("Fetching user details from endpoint:", endpoint);

          let userDetailsResponse = await fetchWithBQ(endpoint);
          console.log("User details response:", {
            hasError: !!userDetailsResponse.error,
            hasData: !!userDetailsResponse.data,
            status: (userDetailsResponse.error as any)?.status
          });

          // if user doesn't exist or there's a timeout, create new user
          if (userDetailsResponse.error && 
              ((userDetailsResponse.error as any).status === 404 || 
               (userDetailsResponse.error as any).status === 504)) {
            console.log("User not found, attempting to create new user");
            userDetailsResponse = await createNewUserInDatabase(cognitoUser, idToken, userRole, fetchWithBQ);
            console.log("New user creation response:", {
              hasError: !!userDetailsResponse.error,
              hasData: !!userDetailsResponse.data
            });
          }

          if(userDetailsResponse.error){
            console.error("Error in user details response:", userDetailsResponse.error);
            throw userDetailsResponse.error;
          }

          // --- Construct the AppUser object ---
          const appUserData: AppUser = {
            cognitoInfo: cognitoUser,
            userInfo: userDetailsResponse.data as Tenant | Manager,
            userRole,
          };

          console.log("Successfully constructed AppUser data");
          return { data: appUserData } as const;
        } catch (error: any) {
            // More defensive error logging
            const errorDetails = {
                message: error?.message || 'No error message',
                status: error?.status || 'No status',
                data: error?.data || 'No data',
                stack: error?.stack || 'No stack trace',
                name: error?.name || 'No error name',
                code: error?.code || 'No error code',
                type: error?.constructor?.name || 'Unknown error type',
                isError: error instanceof Error,
                stringified: typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2) : String(error)
            };
            
            console.error("Error in getAuthUser queryFn:", errorDetails);
            
            // More detailed error message construction
            const errorMessage = error?.message || 
                               error?.data?.message || 
                               (error?.status === 401 ? "Authentication failed" : 
                                error?.status === 404 ? "User not found" :
                                error?.status === 504 ? "Server timeout - please try again" :
                                "Could not fetch user data");
                               
            // If this is a timeout error, we can return a fallback user state
            if (error?.status === 504) {
              console.log("Timeout error, returning fallback user state");
              // You could return a cached user here if available
              // For now, we'll just return the error
            }
            
            return { 
                error: { 
                    status: error?.status || 'CUSTOM_ERROR', 
                    error: errorMessage,
                    details: errorDetails
                } 
            } as const;
        }
      },
      providesTags: (result) => result?.userInfo
        ? (result.userRole === 'manager'
            ? [{ type: 'Managers', id: (result.userInfo as Manager).id }]
            : [{ type: 'Tenants', id: (result.userInfo as Tenant).id }])
        : [],
    }),

    // Property related endpoints
    getProperties: build.query<Property[], Partial<FiltersState> & { favoriteIds?: number[] }>({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: filters.beds,
          baths: filters.baths,
          propertyType: filters.propertyType,
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          amenities: filters.amenities?.join(","),
          availableFrom: filters.availableFrom,
          favoriteIds: filters.favoriteIds?.join(","),
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });

        return { url: "properties", params };
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Properties" as const, id })), { type: "Properties", id: "LIST" }]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch properties.",
        });
      },
    }),

    getProperty: build.query<Property, number>({
      query: (id) => {
        return {
          url: `properties/${id}`,
          method: 'GET',
        };
      },
      transformErrorResponse: (response: any) => {
        if (response?.status === 404) {
          console.error('Property not found:', response);
          return { data: null };
        }
        return response;
      },
      providesTags: (result, error, id) => [{ type: "PropertyDetails", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("Failed to load property details:", error);
        }
      },
    }),

    createProperty: build.mutation<Property, FormData>({
      query: (newProperty) => ({
        url: `properties`,
        method: "POST",
        body: newProperty,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Properties", id: "LIST" },
        // { type: "Managers", id: result?.manager?.id }, // Assuming manager is returned
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Property created successfully!",
          error: "Failed to create property.",
        });
      },
    }),

    updateProperty: build.mutation<Property, { id: string; body: FormData }>({
        query: ({ id, body }) => {
            // Create a new FormData object to avoid modifying the original
            const cleanFormData = new FormData();
            
            // Copy all fields except replacePhotos
            for (const [key, value] of body.entries()) {
                if (key !== 'replacePhotos') {
                    cleanFormData.append(key, value);
                }
            }
            
            return {
                url: `properties/${id}`,
                method: "PUT",
                body: cleanFormData,
            };
        },
        invalidatesTags: (result, error, { id }) => [
            { type: "Properties", id: "LIST" },
            { type: "PropertyDetails", id: Number(id) },
        ],
        async onQueryStarted(_, { queryFulfilled }) {
            await withToast(queryFulfilled, {
                success: "Property updated successfully!",
                error: "Failed to update property.",
            });
        },
    }),

    deleteProperty: build.mutation<{ message: string; id: number }, { id: number; managerCognitoId?: string }>({
        query: ({ id, managerCognitoId }) => {
            // Ensure ID is a number
            const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
            
            // Build the URL with the manager ID as part of the query string
            let url = `properties/${numericId}`;
            
            return {
                url,
                method: "DELETE",
                params: managerCognitoId ? { managerCognitoId } : undefined,
            };
        },
        transformErrorResponse: (response: any) => {
            console.error('Delete property error response:', response);
            const message = response.data?.message || 
                          `Failed to delete property (Status: ${response.status})`;
            return { data: { message } };
        },
        invalidatesTags: (result, error, { id }) => [
            { type: "Properties", id: "LIST" },
            { type: "PropertyDetails", id },
        ],
        async onQueryStarted(_, { queryFulfilled }) {
            try {
                const result = await queryFulfilled;
                toast.success("Property deleted successfully!");
            } catch (error: any) {
                console.error("Error deleting property:", error);
                toast.error(error?.data?.message || "Failed to delete property.");
            }
        },
    }),


    // Tenant related endpoints
    getTenant: build.query<Tenant, string>({
      query: (cognitoId) => `tenants/${cognitoId}`,
      providesTags: (result) => (result ? [{ type: "Tenants", id: result.id }] : []),
      // No error toast for tenant profile loading
    }),

    getCurrentResidences: build.query<Property[], string>({
      query: (cognitoId) => `tenants/${cognitoId}/current-residences`,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Properties" as const, id })), { type: "Properties", id: "LIST" }]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch current residences.",
        });
      },
    }),

    updateTenantSettings: build.mutation<Tenant, { cognitoId: string } & Partial<Tenant>>({
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `tenants/${cognitoId}`,
        method: "PUT",
        body: updatedTenant,
      }),
      invalidatesTags: (result) => (result ? [{ type: "Tenants", id: result.id }] : []),
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),

    addFavoriteProperty: build.mutation<Tenant, { cognitoId: string; propertyId: number }>({
      query: ({ cognitoId, propertyId }) => ({
        url: `tenants/${cognitoId}/favorites/${propertyId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { propertyId }) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
        { type: "PropertyDetails", id: propertyId },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Added to favorites!",
          error: "Failed to add to favorites.",
        });
      },
    }),

    removeFavoriteProperty: build.mutation<Tenant, { cognitoId: string; propertyId: number }>({
      query: ({ cognitoId, propertyId }) => ({
        url: `tenants/${cognitoId}/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { propertyId }) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
        { type: "PropertyDetails", id: propertyId },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Removed from favorites!",
          error: "Failed to remove from favorites.",
        });
      },
    }),

    // Manager related endpoints
    getManagerProperties: build.query<Property[], string>({
      query: (cognitoId) => `managers/${cognitoId}/properties`,
      providesTags: (result, error, cognitoId) => [
          ...(result ?? []).map(({ id }) => ({ type: 'Properties' as const, id })),
          { type: 'Properties', id: 'LIST' },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load manager properties.",
        });
      },
    }),

    updateManagerSettings: build.mutation<Manager, { cognitoId: string } & Partial<Manager>>({
      query: ({ cognitoId, ...updatedManager }) => ({
        url: `managers/${cognitoId}`,
        method: "PUT",
        body: updatedManager,
      }),
      invalidatesTags: (result) => (result ? [{ type: "Managers", id: result.id }] : []),
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),

    // Room related endpoints
    getRooms: build.query<Room[], number>({
      query: (propertyId) => ({
        url: `properties/${propertyId}/rooms`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (!response || !Array.isArray(response)) {
          console.log('Invalid rooms response:', response);
          return [];
        }
        return response;
      },
      transformErrorResponse: (response: any) => {
        if (response?.status === 404) {
          console.error('Room data not found for property:', response);
          return { data: [] };
        }
        return response;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Rooms' as const, id })),
              { type: 'Rooms', id: 'LIST' },
            ]
          : [{ type: 'Rooms', id: 'LIST' }],
      onQueryStarted: async (propertyId, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Error fetching rooms:', error);
          toast.error('Failed to fetch rooms');
        }
      },
    }),

    getRoom: build.query<Room, number>({
      query: (id) => `rooms/${id}`,
      providesTags: (result, error, id) => [{ type: "Rooms", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load room details.",
        });
      },
    }),

    createRoom: build.mutation<Room, { body: FormData }>({
      query: ({ body }) => ({
        url: '/rooms',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => {
        // The server returns the room directly
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.log('Room creation error response:', response);
        
        // Handle different error cases
        if (response.status === 404) {
          return { message: "Property not found" };
        }
        if (response.status === 400) {
          return { 
            message: response.data?.message || "Invalid room data",
            details: response.data
          };
        }
        if (response.status === 401) {
          return { message: "Unauthorized. Please log in again." };
        }
        if (response.status === 403) {
          return { message: "You don&apos;t have permission to create rooms" };
        }
        
        // For other errors, try to get a meaningful message
        const errorMessage = response.data?.message || 
                           response.data?.error || 
                           response.error || 
                           "Failed to create room";
                           
        return { 
          message: errorMessage,
          details: response.data || response
        };
      },
      invalidatesTags: (result, error) => {
        if (error) return [];
        return result ? [
          { type: 'Rooms', id: 'LIST' },
          { type: 'PropertyDetails', id: result.propertyId }
        ] : [];
      },
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          console.error("Error creating room:", {
            error,
            message: error?.data?.message,
            details: error?.data?.details,
            status: error?.status
          });
          
          // Show a more detailed error message
          const errorMessage = error?.data?.message || 
                             error?.data?.error || 
                             error?.error || 
                             "Failed to create room";
                             
          toast.error(errorMessage);
        }
      },
    }),

    updateRoom: build.mutation<Room, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `rooms/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: any) => {
        // The server returns the room directly
        return response;
      },
      transformErrorResponse: (response: any) => {
        if (response.status === 404) {
          return { message: "Room not found" };
        }
        if (response.status === 400) {
          return { message: response.data?.message || "Invalid room data" };
        }
        return { message: response.data?.message || "Failed to update room" };
      },
      invalidatesTags: (result, error, { id }) => {
        if (error) return [];
        return [
          { type: 'Rooms', id },
          { type: 'Rooms', id: 'LIST' },
          { type: 'PropertyDetails', id: result?.propertyId },
          { type: 'Properties', id: result?.propertyId }
        ];
      },
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Room updated successfully!");
        } catch (error: any) {
          console.error("Error updating room:", error);
          toast.error(error?.data?.message || "Failed to update room");
        }
      },
    }),

    deleteRoom: build.mutation<{ message: string; id: number }, { id: number }>({
      query: ({ id }) => ({
        url: `rooms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
          { type: "Rooms", id },
          { type: "Rooms", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Room deleted successfully!",
          error: "Failed to delete room.",
        });
      },
    }),

    // Lease related endpoints
    getLeases: build.query<Lease[], void>({
      query: () => "leases",
      providesTags: (result) =>
          result
              ? [...result.map(({ id }) => ({ type: 'Leases' as const, id })), { type: 'Leases', id: 'LIST' }]
              : [{ type: 'Leases', id: 'LIST' }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch leases.",
        });
      },
    }),

    getPropertyLeases: build.query<Lease[], number>({
      query: (propertyId) => ({
        url: `properties/${propertyId}/leases`,
        method: 'GET',
      }),
      transformErrorResponse: (response: any) => {
        if (response?.status === 404) {
          console.error('Property leases not found:', response);
          return { data: [] }; // Return empty array on 404
        }
        return response;
      },
      providesTags: (result, error, propertyId) => [
          ...(result ?? []).map(({ id }) => ({ type: 'Leases' as const, id })),
          { type: 'Leases', id: 'LIST', propertyId },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("Failed to fetch property leases:", error);
        }
      },
    }),

    getPayments: build.query<Payment[], number>({
      query: (leaseId) => `leases/${leaseId}/payments`,
      providesTags: (result, error, leaseId) => [
          ...(result ?? []).map(({ id }) => ({ type: 'Payments' as const, id })),
          { type: 'Payments', id: 'LIST', leaseId },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch payment info.",
        });
      },
    }),

    // Application related endpoints
    getApplications: build.query<Application[], { userId?: string; userType?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.userId) {
          queryParams.append("userId", params.userId.toString());
        }
        if (params.userType) {
          queryParams.append("userType", params.userType);
        }
        const queryString = queryParams.toString();
        return `applications${queryString ? `?${queryString}` : ''}`;
      },
       providesTags: (result) =>
          result
              ? [...result.map(({ id }) => ({ type: 'Applications' as const, id })), { type: 'Applications', id: 'LIST' }]
              : [{ type: 'Applications', id: 'LIST' }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch applications.",
        });
      },
    }),

    updateApplicationStatus: build.mutation<Application & { lease?: Lease }, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `applications/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      // --- CORRECTED invalidatesTags ---
      invalidatesTags: (result, error, { id }) => {
          // Explicitly define the type of the tags array
          const tags: TagDescription<CacheTagType>[] = [
              { type: 'Applications', id },
              { type: 'Applications', id: 'LIST' },
          ];
          // Conditionally add Lease tags if a lease was affected
          if (result?.lease) {
              tags.push({ type: 'Leases', id: 'LIST' });
              tags.push({ type: 'Leases', id: result.lease.id });
          }
          return tags;
      },
      // --- END CORRECTION ---
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Application status updated successfully!",
          error: "Failed to update application status.",
        });
      },
    }),

    createApplication: build.mutation<Application, Partial<Application>>({
      query: (body) => ({
        url: `applications`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: [{ type: "Applications", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Application submitted successfully!",
          error: "Failed to submit application.",
        });
      },
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useGetCurrentResidencesQuery,
  useGetManagerPropertiesQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetTenantQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  useGetLeasesQuery,
  useGetPropertyLeasesQuery,
  useGetPaymentsQuery,
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useCreateApplicationMutation,
  // Room endpoints
  useGetRoomsQuery,
  useGetRoomQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = api;

