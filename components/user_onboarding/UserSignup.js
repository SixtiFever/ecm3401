import { View, Text, Button, TextInput, StyleSheet, Pressable } from "react-native"
import { useState } from "react";
import { auth, firestore } from "../../firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";


const UserSignup = ({navigation}) => {

    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSignup = () => {
        if ( email != confirmEmail && password != confirmPassword ) {
            alert('Field error');
        } else {
            
            const user = {
                'email': email.toLowerCase(),
                'password': password,
                'cards': {},
                'push_tokens': [],
            }

            registerUserWithEmailAndPassword(auth, user)
            createUserDocumentInUsersCollection(user);
            navigation.navigate('Signup');
        }
    }

    return (
        <View style={styles.container}>
            <TextInput style={styles.textInput} placeholder="Email" onChangeText={setEmail} />
            <TextInput style={styles.textInput} placeholder="Confirm email" onChangeText={setConfirmEmail} />
            <TextInput style={styles.textInput} placeholder="Password" onChangeText={setPassword} />
            <TextInput style={styles.textInput} placeholder="Confirm password" onChangeText={setConfirmPassword} />
            <Pressable style={styles.pressableButton} onPress={() => handleSignup(navigation)}>
                <Text style={styles.pressableText}>Signup</Text>
            </Pressable>

        </View>
    )
}


/*
@param1 -> Firebase authentication token
@param2 -> User object
authenticates the user in firebase authentication. Once successfully authenticate, the
'user@email' document is created in the 'users' collection
*/ 
function registerUserWithEmailAndPassword(auth, user) {
    createUserWithEmailAndPassword(auth, user.email, user.password)
    .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    const cRef = collection(firestore, 'users');

    // ...
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
    });
}

function createUserDocumentInUsersCollection(user) {
    const userEmail = user.email.toLowerCase();
    const cRef = collection(firestore, 'users');
    const dRef = doc(cRef, userEmail);
    setDoc(dRef, user).then(() => {
        console.log('User document set in Users');
    }).catch(err => {
        console.log('<UserSignup.js> error setting user document: ' + err);
    })
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
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
        backgroundColor: '#F70084',
        marginTop: 20,
    },
    pressableText: {
        color: 'white',
    },
})

export default UserSignup;