import { View, Text, StyleSheet, StatusBar } from 'react-native'
import React, { ReactNode } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
 
const Lineargradient:React.FC<{children:ReactNode}> = ({children}) => {
  return (
    <View
    style={{
      flex: 1,
    }}
  > 
    <LinearGradient
      colors={['#1253AA', '#05243E']}
      style={styles.background}>
      <View style={styles.overlay}>{children}</View>
     </LinearGradient>
    </View>
  )
}

export default Lineargradient;

const styles=StyleSheet.create({
  background:{
    flex:1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
   },
})