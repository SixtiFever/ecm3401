import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AutoFocus, Camera, CameraType, CameraView } from 'expo-camera';
import { firestore, auth } from '../../firebaseConfig';
import { getDoc, collection, doc, setDoc, updateDoc } from 'firebase/firestore';

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


            createCustomerFieldInCafeDoc(data);
            createLoyaltyCardInUserDoc(data)

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
async function hasUserVisitedCafeBefore(cafeEmail) {
    const cRef = collection(firestore, 'cafes')
    const dRef = doc(cRef, cafeEmail);
    const snap = await getDoc(dRef);
    if ( snap.data()['customers'][auth.currentUser.email] != undefined ) {
        return true;
    } else {
        return false;
    }
}


/*
manage users  loyalty cards from the cafes customers field
- Enables users card for that cafe to listen to the cafe document 
and make dynamic changers on the cafes promotion changes.
*/
function createCustomerFieldInCafeDoc(cafeEmail) {
    const cRef = collection(firestore, 'cafes');
    const dRef = doc(cRef, cafeEmail);
    const userEmail = auth.currentUser.email;
    updateDoc(dRef, { customers: { [userEmail] : { 'current': 0, 'redeems': 0, 'loyaltyPoints': 5, 'rank':0 } }} ).then(() => {
        console.log('Created customer instances for ' + auth.currentUser.email + ' in document for ' + cafeEmail);
    }).catch(err => {
        console.log('<Scanner.js> Error creating customer instances for cafe: ' + err);
    })
}

/*
@param1 -> cafe email
updates the cafe.customers field with a new instances of the user
*/
function createLoyaltyCardInUserDoc(cafeEmail){
    const cRef = collection(firestore, 'users');
    const dRef = doc(cRef, auth.currentUser.email);
    getCafeData(cafeEmail).then(snap => {
        const card = generateLoyaltyCard(snap.data());
        updateDoc(dRef, { cards :  card } );
    }).catch( err => {
        console.log('<Scanner.js> Error creating cafe loyalty card in user document');
        return null;
    })
}

/*
@Param1 -> cafe email
returns a snap of the cafe document
*/
async function getCafeData(scanData) {
    const cRef = collection(firestore, 'cafes');
    const dRef = doc(cRef, scanData);
    const snap = await getDoc(dRef);
    if ( snap.exists() ) {
        return snap;
    }
}

/*
@Param1 -> Snapshot of cafe document
Returns object consisting of contents for the users digital loyalty card.
- Email (key), name, currentPromotion.reward, scansNeeded, postcode, currentScans
*/
function generateLoyaltyCard(cafeSnap){

    const card = {
        'cafeEmail': cafeSnap['cafeEmail'],
        'cafeName': cafeSnap['cafeName'],
        'reward': cafeSnap.currentPromotion.reward,
        'scansNeeded': cafeSnap.currentPromotion.scansNeeded,
        'postcode': cafeSnap.postcode,
        'currentScans': 0,
    }
    return { [cafeSnap.cafeEmail]: card };
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