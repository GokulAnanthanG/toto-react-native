export interface permission {
    $collectionId: string;
    $createdAt: string;
    $databaseId: string;
    $id: string;
    $permissions: any[]; // You can replace `any` with a more specific type if needed
    $updatedAt: string;
    requesterId: string;
    seen: boolean;
    status: 'pending' | 'approved' | 'rejected'; // use union if status has fixed values
    userId: string;
  }