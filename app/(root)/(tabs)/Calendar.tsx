import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, { useEffect, useState } from 'react'
 import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TextInput } from 'react-native-gesture-handler';
import { Alert } from 'react-native';
import { database, DB_id, events_collection } from '@/config/appWrite';
import { ID } from 'react-native-appwrite';
import { useGlobalContext } from '@/hooks/global-provider';
const back = require("@/assets/images/angleLeft.png");

const Calendar = () => {
  const [dateBoxData, setDateBoxData] = useState<any>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [event, setEvent] = useState<any>("");
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, refetch, loading, user } = useGlobalContext();

  useEffect(() => {
    let dateBoxData: any = []
    let statingDay = new Date(selectedYear, selectedMonth, 1).getDay();
    let endingDate = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    for (let day = 1; day < statingDay; day++) {
      dateBoxData.push({
        day: null,
        isToday: false,
        isSelected: false,
      });
    }
    for (let day = 1; day <= endingDate; day++) {
      dateBoxData.push({
        day: day,
        isToday: selectedYear === new Date().getFullYear() && selectedMonth === new Date().getMonth() && day === new Date().getDate(),
        isSelected: selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === selectedMonth && selectedDate.getFullYear() === selectedYear,
      });
    }
    setDateBoxData(dateBoxData)
  }, [selectedYear, selectedMonth, selectedDate]);

  const handleMonthChangeIncrease = () => {
    const newDate = new Date(selectedYear, selectedMonth + 1);
    setSelectedYear(newDate.getFullYear());
    setSelectedMonth(newDate.getMonth());
    setSelectedDate(null);
  };

  const handleMonthChangeDecrease = () => {
    const newDate = new Date(selectedYear, selectedMonth - 1);
    setSelectedYear(newDate.getFullYear());
    setSelectedMonth(newDate.getMonth());
    setSelectedDate(null);
  };

  const handleDateClick = (day: number | null) => {
    if (day !== null) {
      setSelectedDate(new Date(selectedYear, selectedMonth, day));
    }
  }
const addEvent = async() => {
   if(event.length>0){
    try {
      const result = await database.createDocument(
        DB_id,
        events_collection,
        ID.unique(),
        {
          event,
          date: selectedDate,
          userId:user?.$id ?? ""
        }
      );
      setEvent("");
      Alert.alert('Event Added', 'Event added successfully!');
    } catch (err) {
      Alert.alert("oops something went wrong :(");
      console.log("Failed to add event", err);
    }
   }
   else{
    Alert.alert('Event Not Added', 'Please add event!');
   }
}
 
  return (
    <ScrollView
  scrollEnabled={true}
  keyboardShouldPersistTaps="handled"
 >
    <View>
      <View className="flex flex-row px-[23px] mt-[35px] gap-[61px]">
        <TouchableOpacity  onPress={() => {
          router.back();
        }}  className="w-[30px] h-[30px] bg-[#FFFFFF] rounded-full flex justify-center items-center">
          <Image resizeMode="contain" source={back} />
        </TouchableOpacity>
        <Text className="font-PoppinsMedium text-[18px] text-[#FFFFFF]">
        Manage Your Time
        </Text>
      </View>
      <View className='px-[15px] mt-[20px]'>
        <View className='w-full h-[300px] bg-[#05243E] rounded-[10px]'>
          <View
             className='w-full h-full '
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 10,
            }}
          >
            <View className='flex-row justify-center gap-5 items-center pt-5'>
              <Text onPress={handleMonthChangeDecrease}>
                <Ionicons name='chevron-back' size={22} color='#0EA5E9' />
              </Text>
              <Text className="font-PoppinsRegular text-[11px] text-[#FFFFFF]">
                {new Date(selectedYear, selectedMonth, 1).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Text onPress={handleMonthChangeIncrease}>
                <Ionicons name='chevron-forward' size={22} color='#0EA5E9' />
              </Text>
            </View>
            <View className='flex-row justify-start gap-5 pl-2 pt-2'>
              <Text className='w-[30px] h-[30px] rounded-[5px] justify-center items-center mt-1.5 text-[#FFFFFF]'>sun</Text>
              <Text className='w-[30px] h-[30px] rounded-[5px] justify-center items-center mt-1.5 text-[#FFFFFF]'>mon</Text>
              <Text className='w-[30px] h-[30px] rounded-[5px] justify-center items-center mt-1.5 text-[#FFFFFF]'>tue</Text>
              <Text className='w-[30px] h-[30px] rounded-[5px] justify-center items-center mt-1.5 text-[#FFFFFF]'>wed</Text>
              <Text className='w-[30px] h-[30px] rounded-[5px] justify-center items-center mt-1.5 text-[#FFFFFF]'>thu</Text>
              <Text className='w-[30px] h-[30px] rounded-[5px] justify-center items-center mt-1.5 text-[#FFFFFF]'>fri</Text>
              <Text className='w-[30px] h-[30px] rounded-[5px] justify-center items-center mt-1.5 text-[#FFFFFF]'>sat</Text>
            </View>
            {[0, 7, 14, 21, 28].map((startIndex) => (
              <View key={startIndex} className='flex-row justify-start gap-5 pl-2'>
                {dateBoxData.slice(startIndex, startIndex + 7).map((item: any, index: any) => (
                  <TouchableOpacity
                    key={index}
                    className={`w-[30px] h-[30px] rounded-[5px] justify-center items-center mt-1.5 ${
                      item.isToday ? 'bg-[#0EA5E9]' :
                      item.day === null ? '' :
                      item.isSelected ? 'bg-[#2da22d]' : 'bg-[#05243E]'
                    }`}
                    onPress={() => handleDateClick(item.day)}
                  >
                    <Text className='font-PoppinsRegular text-[11px] text-[#FFFFFF]'>{item.day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
        <View className="flex-row items-center justify-between gap-[8px] mt-4">
            <View className="bg-[#05243E] w-[220px] h-[42px] flex-row items-center justify-between rounded-[2px] p-4">
              <TextInput
                style={{ height: 40, width: "90%", color: "#FFFFFF" }}
                onChangeText={setEvent}
                value={event}
                placeholder={`add event`}
                placeholderTextColor={"#FFFFFF"}
              />
            </View>

            <TouchableOpacity 
              onPress={addEvent}
              disabled={!selectedDate}
              className={`${selectedDate?'bg-[#0EA5E9]':"bg-[grey]"} flex-1 h-[42px] flex-row gap-2 justify-center items-center rounded-[2px]`}
            >
              <Ionicons name="add-circle" size={12} color="#FFFFFF" />
              <Text className="text-[#FFFFFF] text-[12px] font-PoppinsRegular">
                Add
              </Text>
            </TouchableOpacity>
          </View>
      </View>
     
    </View>
  </ScrollView>
  
  )
}

export default Calendar