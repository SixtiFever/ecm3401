import { View, Text, Button, TextInput, StyleSheet, Pressable } from "react-native"
import { auth, firestore } from "../../firebaseConfig";
import { deleteUser, signOut } from "firebase/auth";
import { collection, deleteDoc, setDoc, doc, getDoc, runTransaction, onSnapshot, updateDoc }    from "firebase/firestore";
import { useState, useEffect } from 'react'
import { geocodeAsync } from 'expo-location';

const CafeSettings = ({navigation}) => {

    const [address, setAddress] = useState('');
    const [cafeDetails, setCafeDetails] = useState(null)
    const [locationsList, setLocationsList] = useState(null)

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

    updateLocationsCollection(address).then(validLocation => {
        if ( validLocation ) {
            updateCafeDoc(address, setCafeDetails)
        } else {
            alert('Can\'t add location. Either invald address or location is a duplicate.')
        }
    })
    
}

async function handleDeleteAccount(nav) {
    const cafeEmail = auth.currentUser.email;

    await runTransaction(firestore, async (transaction) => {

        const cRef = collection(firestore, 'cafes');
        const dRef = doc(cRef, auth.currentUser.email);

        const locColl = collection(firestore, 'locations');
        const locDocRef = doc(locColl, auth.currentUser.email);

        const cafeDoc = await getDoc(dRef);
        await removeCardFromUserDocs(cafeDoc.data());  // remove cafes loyaly card from all users that have it
        console.log('Removed card from user docs')

        transaction.delete(locDocRef);  // delete cafes locations
        console.log('Removed locations')

        // delete cafe authenticated account
        await deleteUser(auth.currentUser).then(() => {
            console.log('Deleted cafe authenticated account');
            deleteDoc(dRef).then(() => {
                console.log('Deleted cafe document');
            })
            nav.navigate('Cafe Login', {deleted: true, cafeEmail: cafeEmail});
        }).catch(err => {
            console.log('<CafeSettings.js> Error deleting user: ' + err);
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

    // if invalid location. i.e can't be geocoded
    if ( l.length <= 0 ) return false

    const transaction = await runTransaction(firestore, async (transaction) => {

        const cRef = collection(firestore, 'locations');
        const dRef = doc(cRef, auth.currentUser.email);
        const snap = await getDoc(dRef);
        let arr = snap.data().coordinates;
        let newVal = {'lat': l[0].latitude, 'long': l[0].longitude}
        console.log(arr)
        if ( arr.some( e => e.lat === newVal.lat && e.long === newVal.long) ) {
            console.log('Address already exists');
            return false
        }

        arr.push(newVal);
        transaction.set(dRef, { 'coordinates': arr }, {merge: true});
        return true
    })
    console.log(transaction)
    return transaction
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
        const updatedCardsObj = Object.fromEntries(newCards)
        await updateDoc(dRef, { cards: updatedCardsObj });
    }
}


const CafeLocations = (locations) => {

    const addresses = locations.locations;

    const handlePressLocation = async (address) => {

        // update locations array
        updated_locations = addresses.filter(ele => ele != address)

        // geolocate address to obtain coordinates
        const l = await geocodeAsync(address);
        coordinatesToDelete = {
            lat: l[0].latitude,
            long: l[0].longitude
        }

        await runTransaction(firestore, async(transaction) => {

            // locations update prep
            const locationsCollection = collection(firestore, 'locations')
            const locationsCafeRef = doc(locationsCollection, auth.currentUser.email)
            const locationsCafeDoc = await getDoc(locationsCafeRef)
            const coordinatesArray = locationsCafeDoc.data().coordinates
            const newArray = coordinatesArray.filter(coords => coords.lat != coordinatesToDelete.lat && coords.long != coordinatesToDelete.long)

            // cafe doc addresses update prep
            const cafeCollection = collection(firestore, 'cafes')
            const cafeDocRef = doc(cafeCollection, auth.currentUser.email)
            
            // firebase interactions
            try {

                transaction.update(locationsCafeRef, { 'coordinates': newArray })
                transaction.update(cafeDocRef, { 'address': updated_locations })

            } catch (e) {
                console.log('<CafeSettings.js/CafeLocations/HandlePressLocation/runTransaction>: ' + e)
            }
        })


    }

    return (
            addresses.map(address => {
                return (
                    <Pressable style={styles.locationElement} onPress={() => handlePressLocation(address)}>
                        <Text>{address}</Text>
                    </Pressable>
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
    },
    locationElement: {
        height: 40,
        width: '100%',
        backgroundColor: 'red',
        display: 'flex',
        justifyContent: 'center'
    }
})

export default CafeSettings;