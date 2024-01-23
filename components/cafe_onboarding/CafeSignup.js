import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { firestore, auth } from "../../firebaseConfig";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

const CafeSignup = ({ navigation }) => {

    const [cafeName, setCafeName] = useState("");
    const [cafeEmail, setCafeEmail] = useState("");
    const [cafeEmailConfirm, setCafeEmailConfirm] = useState("");
    const [cafePassword, setCafePassword] = useState("");
    const [cafePasswordConfirm, setCafePasswordConfirm] = useState("");
    const [postcode, setPostcode] = useState("");
    const [address, setAddress] = useState("");

    const handleSignup = () => {
        if ( !cafeName || cafeEmail != cafeEmailConfirm || cafePassword != cafePasswordConfirm ) {
            alert('Field error');
        } else {

            const cafeObject = {
                'cafeName': cafeName,
                'cafeEmail': cafeEmail.toLowerCase(),
                'cafePassword': cafePassword,
                'address': address,
                'postcode': postcode,
                'qrLink': generateQRLink(cafeName),
                'customers': {},
                'redeems': 0,
                'scans': 0,
                'previousPromotions': {},
                'currentPromotion': {
                    'title': 'Buy 8 get a free coffee',
                    'scansNeeded' : 8,
                    'customerScans': 0,
                    'customerRedeems': 0,
                    'scansPerDay': 0,
                    'redeemsPerDay': 0,
                    'startDate': getDate(new Date().toLocaleString()),
                },
            }


            registerCafeWithEmailAndPassword(auth, cafeObject);

            navigation.navigate('Cafe Login');
        }
    }

    return (
        <View style={styles.container}>
            <TextInput style={styles.textInput} placeholder="Cafe name" onChangeText={setCafeName}  />
            <TextInput style={styles.textInput} placeholder="Cafe email" onChangeText={setCafeEmail} />
            <TextInput style={styles.textInput} placeholder="Confirm cafe email" onChangeText={setCafeEmailConfirm}  />
            <TextInput style={styles.textInput} placeholder="Cafe password" onChangeText={setCafePassword} />
            <TextInput style={styles.textInput} placeholder="Confirm Cafe password"  onChangeText={setCafePasswordConfirm} />
            <TextInput style={styles.textInput} placeholder="Enter cafe address" onChangeText={setAddress} />
            <TextInput style={styles.textInput} placeholder="Enter cafe postcode" onChangeText={setPostcode} />
            <Button title="Signup" onPress={handleSignup} />
            <Button title="Login" onPress={() => handleToLogin(navigation)} />
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
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
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
        height: 50,
        borderWidth: .5,
        borderColor: 'black',
        borderRadius: 4,
        paddingStart: 10,
        marginTop: 12,
    }
})

export default CafeSignup;