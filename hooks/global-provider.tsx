import { createContext, ReactNode, useContext, useEffect } from "react";
import { useAppwrite } from "./useAppWrite";
import { account, database, DB_id, getUser, usersCollection } from "@/config/appWrite";
import { ID, Query } from "react-native-appwrite";
import { UserData } from "@/interface/UserInterface";

interface User {
  $id: string;
  name: string;
  email: string;
  avatar: string;
}
interface GlobalContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  refetch: (newParams?: Record<string, string | number>) => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const { data: user, error, loading, refetch } = useAppwrite({ fn: getUser });
 if(user)
  var userData:UserData=user;
  //ADDING USER TO DB IF HE LOGGED IN FOR THE FIRST TIME
  async function storeUserOnLogin() {
    try {
      if (!user) return;  
  
      const userId = user.$id;
      const email = user.email;
      const name = user.name;
      const avatar=user.avatar;
      // Check if the user already exists in the database
      const existingUsers = await database.listDocuments(DB_id, usersCollection, [
        Query.equal("userId", userId),
      ]);
  
      if (existingUsers.documents.length === 0) {  
        await database.createDocument(DB_id, usersCollection, ID.unique(), {
          userId,
          email,
          name,
          avatar
        });
        console.log("User stored successfully.");
      } else {
        console.log("User already exists in the database.");
      }
    } catch (error) {
      console.error("Error storing user:", error);
    }
  }
  
  useEffect(()=>{
    storeUserOnLogin();
  },[user])
  //
  const isLoggedIn = !!user;
  //!null =true =>!true =>false
  //!{userName:"gokul"} =>!false=>true;
  console.log(user, null, 2);

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        refetch,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
