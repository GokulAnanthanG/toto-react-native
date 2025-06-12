export interface GroupTaskT {
    $collectionId: string;
    $createdAt: string;
    $databaseId: string;
    $id: string;
    $permissions: string[];
    $updatedAt: string;
    date: string;
    description: string;
    isCompleted: boolean;
    members: string[];
    owner: string;
    pinned: boolean;
    time: string;
    title: string;
}