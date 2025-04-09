import { Redirect, router, useRouter } from "expo-router";
 import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { login, logOut } from "../config/appWrite";
import { GlobalProvider, useGlobalContext } from "@/hooks/global-provider";
import { useEffect } from "react";

 const checkMark=require("@/assets/images/Checkmark.png");
const googleLogo=require("@/assets/images/googleLogo.png");
 export default function Index() {
  const {isLoggedIn,refetch,loading,user}=useGlobalContext()
  const router = useRouter();

  useEffect(() => {
    console.log("isLoggedIn ",isLoggedIn);
    
    if (isLoggedIn) {
     router.replace("/(root)/(tabs)/(index)");        
    }
  }, [isLoggedIn])
  

   const handleLogin=async()=>{
    console.log("login triggers");
      const result =await login();
    if(result){
      refetch();
    }
    else{
      Alert.alert("Failed to login");
    }
  }
 
   
  return (
    <View className="flex items-center flex-1"> 
      <Image className="w-[100px] h-[100px] mt-[143px]" resizeMode="cover" source={checkMark}/>
      <Text className="text-white mt-[23px] text-[36px] font-DarumadropOneRegular">DO It</Text>
      <Text className="text-center text-white absolute bottom-5 font-PoppinsMedium">v 1.0.0</Text>

      <TouchableOpacity onPress={()=>handleLogin()} className="w-[85%] absolute bottom-[150px] bg-white rounded-2xl shadow-xl p-[10px]">
        <View className="flex-row justify-center items-center gap-2">
        <Image className="w-[30px] h-[30px]" resizeMode="cover" source={googleLogo}/>
        <Text className="text-[16px] font-PoppinsMedium">continue with google</Text>
        </View>
      </TouchableOpacity>
     {loading&& <View className="flex justify-center">
        <ActivityIndicator size="large"/>
      </View>}
     </View>
  );
}


