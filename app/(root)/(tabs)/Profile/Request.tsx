import {
  database,
  DB_id,
  groupTaskAddPermission_collection,
  usersCollection,
} from "@/config/appWrite";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { DBUserData } from "@/interface/UserInterface";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ID, Query } from "react-native-appwrite";
import { useGlobalContext } from "@/hooks/global-provider";
import { permissionRequest } from "@/interface/PermissionData";
const back = require("@/assets/images/angleLeft.png");

const Request = () => {
  const { isLoggedIn, refetch, loading, user } = useGlobalContext();
  const [userData, setUserData] = useState<DBUserData | any>();
  const [searchTxt, setSearchTxt] = React.useState("");
  const [isLoading, setIsloading] = useState<boolean>(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTxt) {
        searchUsers(searchTxt);
      }
    }, 500); // Debounce to optimize API calls

    return () => clearTimeout(delayDebounce);
  }, [searchTxt]);
  const searchUsers = async (searchText: string) => {
    setIsloading(true);
    try {
      const response = await database.listDocuments(DB_id, usersCollection, [
        Query.or([
          Query.contains("userId", searchText),
          Query.contains("name", searchText),
        ]),
      ]);
      setUserData(response.documents);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsloading(false);
    }
  };

  const addPermissionRequest = async (requesterId: string, userId: string) => {
    const newRecord = await database.createDocument(
      DB_id,
      groupTaskAddPermission_collection,
      ID.unique(),
      {
        requesterId,
        userId,
      }
    );

    console.log("New record created:", newRecord);
    alert("Requested for permission")
    return newRecord;
  };

  const updateStatusToPending = async (documentId: string) => {
    console.log("Doc id",documentId);
    
    try {
      const updatedDocument = await database.updateDocument(
        DB_id, 
        groupTaskAddPermission_collection,
        documentId,
        { status: "pending" }
      );
      console.log("Updated Document:", updatedDocument);
      Alert.alert(
        "Request Status",
        "Requested for permission again"
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  
  const fetchOrInsertRecord = async (requesterId: string, userId: string) => {
    try {
      const response = await database.listDocuments(
        DB_id,
        groupTaskAddPermission_collection,
        [Query.equal("requesterId", requesterId), Query.equal("userId", userId)]
      );

      if (response.documents.length > 0) {
        const record: permissionRequest = response
          .documents[0] as permissionRequest;
        if (record.status == "pending")
          Alert.alert(
            "Request Status",
            "Already requested waiting for user action"
          );
        else if (record.status == "rejected") {
          updateStatusToPending(record.$id);
        }
        return response.documents[0];
      } else {
        addPermissionRequest(requesterId, userId);
      }
    } catch (error) {
      console.error("Error fetching or inserting record:", error);
      alert("error fetching,inserting or update document");
    }
  };

  const showConfirmationAlert = (userId: string, requesterId: string) => {
    Alert.alert(
      "Confirm to submit",
      "Request the user to join your group task?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => fetchOrInsertRecord(requesterId, userId),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="px-[23px]">
      <View className="flex flex-row items-center  mt-[35px] gap-[10px]">
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          className="w-[25px] h-[25px] bg-[#FFFFFF] rounded-full flex justify-center items-center"
        >
          <Image
            className="w-[10px] h-[10px]"
            resizeMode="contain"
            source={back}
          />
        </TouchableOpacity>
        <Text className="font-PoppinsMedium text-[15px] text-[#FFFFFF]">
          Request User
        </Text>
      </View>
      <Text className="mt-1 ml-8 text-gray-300">
        Request the user to join your group task.
      </Text>
      <View className="px-[18px] pt-[15px]">
        <View className="bg-[#102D53] w-full h-[42px] rounded-[10px] flex-row items-center justify-between p-4">
          <TextInput
            style={{ height: 40, width: "90%", color: "#FFFFFF" }}
            onChangeText={setSearchTxt}
            value={searchTxt}
            placeholder="Search user by Name or User id"
            placeholderTextColor={"#FFFFFF"}
          />
          <Ionicons name="search" size={17} color="#FFFFFF" />
        </View>

        <View className="mt-[10px]">
          {isLoading && <ActivityIndicator />}
          <FlatList
            data={userData}
            keyExtractor={(item) => item.$id}
            pagingEnabled
            renderItem={(
              { item } // Destructure 'item' properly
            ) => (
              <TouchableOpacity
                onPress={() => {
                  showConfirmationAlert(item.userId, user?.$id ?? "");
                }}
                className="flex flex-row gap-[10] items-center"
              >
                <Image
                  source={{ uri: item.avatar }}
                  style={{ width: 50, height: 50, borderRadius: 25 }}
                />
                <View>
                  <Text className="text-[#FFFFFF] font-PoppinsMedium">
                    {item.name}
                  </Text>
                  <Text className="text-[#FFFFFF] font-PoppinsMedium">
                    {item.email}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default Request;
