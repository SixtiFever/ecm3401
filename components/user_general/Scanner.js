import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AutoFocus, Camera, CameraType, CameraView } from 'expo-camera';
import { firestore, auth } from '../../firebaseConfig';
import { getDoc, collection, doc } from 'firebase/firestore';

const Scanner = ({navigation}) => {
    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {

        // pull users loyalty card data

    }, []);

    const handleBarCodeScanned = async ({ type, data }) => {
        setScanned(true);

        /*
        - Check if the user has a virtual card for the cafe
            - True -> Increment card by 1
            - False -> Pull cafe data from 'cafes' and create field in user document
        */

        if ( await hasUserVisitedCafeBefore(data) ) {
            console.log('User has visited cafe before');

            // updateLoyaltyCard
        } else {
            console.log('User hasn\'t visited cafe before');
            // createLoyaltyCard
        }
        
        alert(`${data} has been scanned!`);
    };

    if (permission) {
        return (
            <View style={styles.container}>

                <Camera 
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} 
                    autoFocus={AutoFocus.on} 
                    style={styles.camera} 
                    type={CameraType.back}>
                </Camera>

            </View>
        );
      } else if (permission === false) {
            return (
                <Text>Permission not granted</Text>
            );
    } else {
            return (
                <Text>Something</Text>
            );
    }
}

/*
@param1 -> QR Code data
Checks whether the user currently has a virtual loyalty card for that cafe
*/
async function hasUserVisitedCafeBefore(data) {
    const cRef = collection(firestore, 'users')
    const dRef = doc(cRef, auth.currentUser.email);
    const snap = await getDoc(dRef);
    if ( snap.data()['cards'][data] != undefined ) {
        return true;
    } else {
        return false;
    }
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
    },
    camera: {
        width: '100%',
        height: '100%',
    }
});

export default Scanner;