export interface OwnerDetail {
    $collectionId: string;
    $createdAt: string;
    $databaseId: string;
    $id: string;
    $permissions: string[];
    $updatedAt: string;
    avatar: string;
    email: string;
    name: string;
    userId: string;
  }
export interface GroupTaskViewT {
    $collectionId: string;
    $createdAt: string;
    $databaseId: string;
    $id: string;
    $permissions: string[];
    $updatedAt: string;
    date: string;
    description: string;
    isCompleted: boolean;
    members?: any;  
    owner: string;
    ownerDetail: OwnerDetail;
    pinned: boolean;
    time: string;
    title: string;
  }