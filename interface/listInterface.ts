export interface Task {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  title: string;
  description: string;
  date: string; // ISO date string
  time: string; // ISO time string
  isCompleted: boolean;
  pinned:boolean
}