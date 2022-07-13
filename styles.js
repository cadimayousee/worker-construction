import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        paddingTop:40,
        alignItems:"center",
        flex:1
    
      },
      listItem:{
          height:60,
          alignItems:"center",
          flexDirection:"row",
      },
      title:{
          fontSize:18,
          marginLeft:20
      },
      header:{
        width:"100%",
        height:60,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        paddingHorizontal:20
      },
      profileImg:{
        width:80,
        height:80,
        borderRadius:40,
        marginTop:20
      },
      sidebarDivider:{
        height:1,
        width:"100%",
        backgroundColor:"lightgray",
        marginVertical:10
      },
      name_text:{
        fontWeight:"bold",
        fontSize:16,
        marginTop:10
      },
      email_text:{
        color:"gray",
        marginBottom:10
      },
      flatList:{
        width:"100%",
        marginLeft:30
      }
});
export default styles;