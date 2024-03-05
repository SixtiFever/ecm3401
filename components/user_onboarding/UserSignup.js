import { View, Text, Button, TextInput, StyleSheet } from "react-native"
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
            <Button title="Signup" onPress={() => handleSignup(navigation)} />

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
        height: 50,
        borderWidth: .5,
        borderColor: 'black',
        borderRadius: 4,
        paddingStart: 10,
        marginTop: 12,
    }
})

export default UserSignup;