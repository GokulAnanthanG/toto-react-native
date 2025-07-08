import { Models } from "react-native-appwrite";

export interface GroupTaskWithDetails {
  $collectionId: string;
  $createdAt: string;
  $databaseId: string;
  $id: string;
  $permissions: string[];
  $updatedAt: string;
  date: string;
  description: string;
  isCompleted: boolean;
  members: Models.Document[][];
  owner: string;
  ownerDetails: Models.DocumentList<Models.Document>;
  pinned: boolean;
  time: string;
  title: string;
}