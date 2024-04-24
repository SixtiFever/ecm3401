import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Pressable } from 'react-native';
import { firestore, auth } from "../../firebaseConfig";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { EmailAuthCredential, createUserWithEmailAndPassword, getAuth, updateProfile } from "firebase/auth";
import { geocodeAsync } from 'expo-location';
import * as Location from 'expo-location';



const CafeSignup = ({ navigation }) => {

    const [cafeName, setCafeName] = useState("");
    const [cafeEmail, setCafeEmail] = useState("");
    const [cafeEmailConfirm, setCafeEmailConfirm] = useState("");
    const [cafePassword, setCafePassword] = useState("");
    const [cafePasswordConfirm, setCafePasswordConfirm] = useState("");
    const [postcode, setPostcode] = useState("");
    const [address, setAddress] = useState("");

    const handleSignup = async () => {
        if ( !cafeName || cafeEmail != cafeEmailConfirm || cafePassword != cafePasswordConfirm ) {
            alert('Field error');
        } else {

            const cafeObject = {
                'cafeName': cafeName.toLowerCase(),
                'cafeEmail': cafeEmail.toLowerCase(),
                'cafePassword': cafePassword,
                'address': [address],
                'qrLink': generateQRLink(cafeEmail.toLowerCase()),
                'customers': {},
                'redeems': 0,
                'scans': 0,
                'previousPromotions': {},
                'currentPromotion': {
                    'title': 'Buy 8 get a free coffee',
                    'scansNeeded' : 8,
                    'reward': 'single shot free coffee',
                    'customerScans': 0,
                    'customerRedeems': 0,
                    'scansPerDay': 0,
                    'redeemsPerDay': 0,
                    'startDate': getDate(new Date().toLocaleString()),
                },
            }

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            // perform geocoding on address
            geocodeAsync(cafeObject.address[0]).then(location => {
                console.log(location)
                if ( location.length <= 0 ) {
                    return false;
                }

                const cRef = collection(firestore, 'locations' );
                const dRef = doc(cRef, cafeEmail.toLowerCase());
                setDoc(dRef, { 'coordinates' : [{ lat: location[0].latitude, long: location[0].longitude }] }, { merge: true } );
                return true
            }).then(validAddress => {

                if (validAddress) {
                    registerCafeWithEmailAndPassword(auth, cafeObject);
                    navigation.navigate('Cafe Login');
                } else {
                    alert('Address couldn\'t be located.');
                    return
                }

            }).catch(err => {
                console.log('<CafeSignup.js/handleSignup> error performing address geolocation: ' + err);
            })

        }
    }

    return (
        <View style={styles.container}>
            <TextInput style={styles.textInput} placeholder="Cafe name" onChangeText={setCafeName}  />
            <TextInput style={styles.textInput} placeholder="Cafe email" onChangeText={setCafeEmail} />
            <TextInput style={styles.textInput} placeholder="Confirm cafe email" onChangeText={setCafeEmailConfirm}  />
            <TextInput style={styles.textInput} placeholder="Cafe password" onChangeText={setCafePassword} />
            <TextInput style={styles.textInput} placeholder="Confirm Cafe password"  onChangeText={setCafePasswordConfirm} />
            <TextInput style={styles.textInput} placeholder="Enter full cafe address (can add more later)" onChangeText={setAddress} />
            <Pressable style={styles.pressableButton} onPress={handleSignup}>
                <Text style={styles.pressableText}>Signup</Text>
            </Pressable>
            <Pressable style={styles.toLoginContainer} onPress={() => handleToLogin(navigation)}>
                <Text style={{ color: 'blue', fontSize: 18}}>Login</Text>
            </Pressable>
        </View>
    )
}

/*
retursn link to the QR code generate by the shop name data
*/
function generateQRLink(data) {
    let qrLink = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + data;
    return qrLink;
}

/*
navigates to cafe login
*/
function handleToLogin(nav) {
    nav.navigate('Cafe Login');
}

function getCafeCollectionRef(){
    const collectionRef = collection(firestore, 'cafes');
    return collectionRef
}

/*
@param1 -> Collection reference
@param2 -> Cafe object with form data
Creates a document in the specificed collection. Document is assigned the cafe name.
*/
function setCafeDoc(cRef, cafeObject) {
    const docRef = doc(cRef, cafeObject.cafeEmail);
    setDoc(docRef, cafeObject).then(() => {
        console.log('Cafe document set');
    }).catch(err => {
        console.log('Error setting cafe object: ' + err);
    })
}

/*
@param1 -> Firebase authentication token
@param2 -> Cafe object
authenticates the cafe in firebase authentication. Once successfully authenticate, the
'cafe@email' document is created in the 'cafes' collection
*/
function registerCafeWithEmailAndPassword(auth, cafeObject){
    createUserWithEmailAndPassword(auth, cafeObject.cafeEmail, cafeObject.cafePassword)
    .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    // reference to firestore collection and set cafe object to database
    const collectionRef = getCafeCollectionRef();
    setCafeDoc(collectionRef, cafeObject);
    // ...
    }).then(() => {
        updateProfile(auth.currentUser, {
            displayName: cafeObject.cafeName,
        })
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(error)
    });
}


function getDate(dateString){
    date = ""
    for ( const x in dateString ) {
        if ( dateString[x] == ',' ) break;
        date += dateString[x];
    }
    return date;
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    textInput : {
        width: '80%',
        height: 60,
        borderRadius: 6,
        color: '#1B0229',
        paddingStart: 15,
        backgroundColor: '#E3E3E3',
        borderWidth: .5,
        marginTop: 12,
    },
    pressableButton: {
        width: '80%',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: 'blue',
        marginTop: 20,
    },
    pressableText: {
        color: 'white',
    },
    toLoginContainer: {
        height: 50,
        marginTop: 10,
        display: 'flex',
        justifyContent: 'center',
    }
})

export default CafeSignup;