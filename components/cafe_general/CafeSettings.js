import { View, Text, Button, TextInput, StyleSheet } from "react-native"
import { auth, firestore } from "../../firebaseConfig";
import { deleteUser, signOut } from "firebase/auth";
import { collection, deleteDoc, setDoc, doc, getDoc, runTransaction, onSnapshot, updateDoc }    from "firebase/firestore";
import { useState, useEffect } from 'react'
import { geocodeAsync } from 'expo-location';

const CafeSettings = ({navigation}) => {

    const [address, setAddress] = useState('');
    const [cafeDetails, setCafeDetails] = useState(null)

    useEffect(() => {

        getCafeDetails(setCafeDetails);

        // trigger re-render if any changes in the cafe document
        const cRef = collection(firestore, 'cafes');
        const dRef = doc(cRef, auth.currentUser.email);
        onSnapshot(dRef, (snap) => {
            setCafeDetails(snap.data());
        })

    },[])

    return (
        <View style={styles.container}>
            <View style={styles.locationsContainer}>
                <Text style={styles.headingText}>Locations</Text>
                { cafeDetails && <CafeLocations locations={cafeDetails.address} /> }
            </View>
            <View style={styles.addLocationContainer}>
                <Text style={styles.headingText}>Add cafe location</Text>
                <TextInput style={styles.textInput} placeholder="Enter location address" onChangeText={setAddress} />
                <Button title="Add location" onPress={() => handleAddLocation(address)} />
            </View>
            <View style={styles.logoutContainer}>
                <Button title="Logout" onPress={() => handleLogout(navigation, setCafeDetails)} />
                <Button title="Delete account" onPress={() => handleDeleteAccount(navigation)} />
            </View>
        </View>
    )
}

function handleLogout(nav) {
    signOut(auth).then(() => {
        nav.navigate('Cafe Login');
    }).catch(err => {
        console.log('<CafeSettings.js> Error signing out: ' + err);
    })
}

function handleAddLocation(address, setCafeDetails) {
    updateCafeDoc(address, setCafeDetails);
    updateLocationsCollection(address)
}

async function handleDeleteAccount(nav) {


    await runTransaction(firestore, async (transaction) => {

        const cRef = collection(firestore, 'cafes');
        const dRef = doc(cRef, auth.currentUser.email);

        const locColl = collection(firestore, 'locations');
        const locDocRef = doc(locColl, auth.currentUser.email);

        const cafeDoc = await getDoc(dRef);
        removeCardFromUserDocs(cafeDoc.data());  // remove cafes loyaly card from all users that have it


        transaction.delete(locDocRef);  // delete cafes locations

        // delete cafe document and authenticated account
        deleteUser(auth.currentUser).then(() => {  
            setDoc(dRef, {}).then(() => {
                deleteDoc(dRef).then(() => {
                    console.log('Successfully deleted document');
                    nav.navigate('Cafe Login');
                }).catch(err => {
                    console.log('<CafeSettings.js>: ' + err);
                })
            }).catch(err => {
                console.log('<CafeSettings.js>: ' + err);
            })
        }).catch(err => {
            console.log('<CafeSettings.js> Error deleting user: ' + err);
        })

        nav.reset({
            index: 0,
            routes: [
                {name: 'Cafe Login'},
            ]
        })

    }).catch(err => {
        console.log('<CafeSettings.js/handleDeleteAccount> error deleting account: ' + err);
    })

}


async function updateCafeDoc(location){
    const cRef = collection(firestore, 'cafes');
    const dRef = doc(cRef, auth.currentUser.email);
    const l = location;
    await runTransaction(firestore, async (transaction) => {
        const cafeDoc = await getDoc(dRef);
        let addressArray = cafeDoc.data().address;
        addressArray.push(l);
        transaction.update(dRef, { address: addressArray });
    });
}

async function updateLocationsCollection(location) {

    // perform geocoding on address
    const l = await geocodeAsync(location);
    console.log(l)
    await runTransaction(firestore, async (transaction) => {

        const cRef = collection(firestore, 'locations');
        const dRef = doc(cRef, auth.currentUser.email);
        const snap = await getDoc(dRef);
        let arr = snap.data().coordinates;
        let newVal = {'lat': l[0].latitude, 'long': l[0].longitude}
        if ( arr.includes(newVal) ) {
            console.log('Address already exists');
            return;
        }

        arr.push(newVal);
        transaction.set(dRef, { 'coordinates': arr }, {merge: true});
        
    })

}



function getCafeDetails(setCafeDetails) {
    const cRef = collection(firestore, 'cafes');
    const dRef = doc(cRef, auth.currentUser.email);
    getDoc(dRef).then(snap => {
        setCafeDetails(snap.data());
    }).catch(err => {
        console.log('<CafeSettings.js/getCafeDetails> error pulling cafe details: ' + err);
    })
}


async function removeCardFromUserDocs(cafeDoc) {
    const cRef = collection(firestore, 'users');
    const userEmails = Object.keys(cafeDoc.customers);
    if (userEmails.length < 1) return;
    console.log(userEmails);
    for ( let i = 0; i < userEmails.length; i++ ) {
        const dRef = doc(cRef, userEmails[i]);
        const userDoc = await getDoc(dRef);
        const newCards = Object.entries(userDoc.data().cards).filter( card => card[0] != auth.currentUser.email);
        await updateDoc(dRef, { cards: newCards });
    }
}


const CafeLocations = (locations) => {

    const addresses = locations.locations;

    return (
            addresses.map(address => {
                return (
                    <Text>{address}</Text>
                )
            })
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 25,
    },
    locationsContainer: {
        width: '80%',
        display: 'flex',
    },
    addLocationContainer: {
        width: '80%',
        display: 'flex',
    },
    headingText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    textInput : {
        width: '80%',
        height: 50,
        borderWidth: .5,
        borderColor: 'black',
        borderRadius: 4,
        paddingStart: 10,
    },
    logoutContainer: {
        position: 'absolute',
        bottom: 25,
    }
})

export default CafeSettings;