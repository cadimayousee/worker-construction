import * as React from 'react';
import {View, Text, Dimensions, StyleSheet, ActivityIndicator} from 'react-native';

export const Loading = () => { 
    return(
        <View style={styles.container}>
            <ActivityIndicator size={70} color="#474747" />
        </View>
    );
};

export const styles = StyleSheet.create({
    container:{
        flex:1, 
        width: Dimensions.get('screen').width, 
        height: Dimensions.get('screen').height,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 999,
        position: 'absolute'
    }
});