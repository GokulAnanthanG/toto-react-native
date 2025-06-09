import {
  Client,
  Account,
  ID,
  Avatars,
  OAuthProvider,
  Databases,
} from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
const config = {
  platform: "com.gtech.todo",
  endPoint: "https://cloud.appwrite.io/v1",
  projectId: "67a052f7002ec71e2bb7",
};
//COLLECTION AND DB
export const DB_id="67d06d9b00158ab4cf6f";
export const task_collection="67d06f88000795a7622d";
export const usersCollection="67e1867b002bc4603781";
export const groupTaskAddPermission_collection="67e439130021eddf6b60";
export const groupTask_collection="68090ec20019ea873ef0";
export const taskComments_collection="68261bb4001a48aa12a5";
export const events_collection="684710d100169ed5cb1d";

//COLLECTION AND DB
export const client = new Client()
  .setProject("67a052f7002ec71e2bb7")
  .setPlatform("com.gtech.todo");
export const database =  new Databases(client);
export const avatar = new Avatars(client);

export const account = new Account(client);
//To create new user Account

export async function login() {
  try {
    const redirectUri = Linking.createURL("/");
    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );
    if (!response) throw new Error("Failed to login");
    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );
    console.log("browser result ",browserResult);
    
    if (browserResult.type !== "success") throw new Error("Failed to login");
    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();
    if (!secret || !userId) throw new Error("Failed to login");
    const session = await account.createSession(userId, secret);
    if (!session) throw new Error("failed to create session");
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function logOut() {
  try {
    await account.deleteSession("current");
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

//function to get login user details;
export async function getUser() {
  try {
    const response = await account.get();
    if (response.$id) {
      const userAvatar = avatar.getInitials(response.name);
      return { ...response, avatar: userAvatar.toString() };
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
