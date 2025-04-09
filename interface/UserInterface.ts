export interface UserData {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    name: string;
    registration: string;
    status: boolean;
    labels: string[];
    passwordUpdate: string;
    email: string;
    accessedAt: string;
    avatar?: string;  // Optional field (URL or base64 image)
    password?: string;
    hash?: string;
    hashOptions?: object;
  }
  
 export interface DBUserData {
    $id: string;
    $collectionId: string;
    $databaseId: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    avatar: string;
    email: string;
    name: string;
    userId: string;
  }
  
  