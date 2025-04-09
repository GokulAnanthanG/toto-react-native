export interface permissionRequest {
    $collectionId: string;
    $createdAt: string;
    $databaseId: string;
    $id: string;
    $permissions: string[];
    $updatedAt: string;
    requesterId: string;
    seen: boolean;
    status: "pending" | "approved" | "rejected"; // Assuming status has predefined values
    userId: string;
  }
  