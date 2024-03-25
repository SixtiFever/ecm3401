import { View, StyleSheet, Alert } from "react-native"
import MapView, { Marker } from 'react-native-maps';
import { collection, doc, getDoc, getDocs, QuerySnapshot } from 'firebase/firestore';
import { firestore, auth } from '../../firebaseConfig'
import * as Location from 'expo-location';

import { useEffect, useState } from "react";

const Map = ({navigation}) => {

    const [location, setLocation] = useState(null);
    const [cafeData, setCafeData] = useState([])
    const [cafeLocations, setCafeLocations] = useState([]);
    const [permission, setPermission] = useState(false);

    useEffect(() => {

        // get current user location
        if ( location == null ) {
            getUserLocation(setLocation).then(coordinates => {
                setLocation({latitude: coordinates.latitude, longitude: coordinates.longitude});
                setPermission(true);
            }).catch(err => {
                console.log('<Map.js/useEffect> error getting user location: ' + err);
            });
        }

        // render cafe locations;
        if ( cafeLocations.length < 1 ) {
            getCafeLocations().then( locationsArray => {

                // ensure cafe locations are in array format
                if ( Array.isArray(locationsArray) ) {
                    setCafeLocations(locationsArray);
                }
            }).catch(err => {
                console.log('<Map.js/useEffect> error getting cafe locations: ' + err);
            });
        }

    }, []);

    return (
        <View style={styles.container}>
            <MapView 
                initialRegion={ location ? {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.05,} : location 
                }

                showsUserLocation={permission ? true : false} 
                style={styles.map} >
                
                    { cafeLocations && cafeLocations.map( ele => {
                        return (
                            <Marker
                                key={cafeLocations.indexOf(ele)}
                                coordinate={{
                                    latitude: ele.lat,
                                    longitude: ele.long
                                }}
                                onPress={() => handleMarkerTap(ele)}
                            />
                        )
                    }) }
                
                </MapView>

        </View>
    )
}


async function getEmailFromMarkerTap(ele) {
    try {
        const cRef = collection(firestore, 'locations');
        const snap = await getDocs(cRef)
        const emails = snap.docs.map(doc => {
            //const data = doc.data().coordinates;
            const data = doc.data().coordinates;
            if (data != undefined) {
                for ( let i = 0; i < data.length; i++ ) {
                    if (ele.lat == data[i].lat && ele.long == data[i].long) {
                        return doc.id
                    }
                }
            }
        });
        const email = emails.filter(email => email !== undefined);
        return email;
    } catch(err) {
        console.log(err);
    }
}


async function handleMarkerTap(locObj){

    const email = await getEmailFromMarkerTap(locObj);
    const cRef = collection(firestore, 'cafes');
    const dRef = doc(cRef, email[0]);
    const snap = await getDoc(dRef);
    console.log(snap);
    Alert.alert('Cafe: ' + snap.data().cafeName, 'Reward: ' + snap.data().currentPromotion.reward, [
        {
            text: 'Ok',
            onPress: () => console.log('Cancel pressed'),
            style: 'cancel',
        }
    ])
}

/*
returns the users current coordinates
*/
async function getUserLocation() {

    let {status} = await Location.requestForegroundPermissionsAsync();
    if ( status !== 'granted' ) {
        alert('Permission to access location was denied');
        return;
    }

    let location = await Location.getCurrentPositionAsync();
    return location.coords;
};

async function getCafeLocations() {
    let cafeLocations = []
    const cRef = collection(firestore, 'locations');
    let docs = await getDocs(cRef)
    docs.forEach(doc => {
        cafeLocations = cafeLocations.concat(doc.data().coordinates)
    });

    // remove undefined locations
    const locations = cafeLocations.filter(location => location != undefined)
    
    return locations;
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
      },

})

export default Map;