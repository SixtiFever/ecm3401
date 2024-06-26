import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Pressable, Image } from 'react-native';
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { deleteDoc } from "firebase/firestore";

const shopImage = require('../../assets/coffee-shop.png');

const Login = ({route, navigation}) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [deleted, setDeleted] = useState(route.params && route.params.deleted !== undefined ? route.params.deleted : false);
    const [cafeEmail, setCafeEmail] = useState(route.params && route.params.cafeEmail !== undefined ? route.params.cafeEmail : null);

    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            navigation.navigate('Dashboard');
            // ...
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
          });
    }

    if ( deleted == true ) {
        const cRef = collection(firestore, 'cafes');
        const dRef = doc(cRef, cafeEmail);
        deleteDoc(dRef).then(() => {
            console.log('Cafe document deleted');
        }).catch(err => {
            console.log('<CafeDashboard.js/onSnapshop/deleteDoc> error: ' + err);
        })
    }

    return (
        <View style={styles.container}>
            <View style={styles.upperContainer}>
                <Image source={shopImage} style={{ width: 125, height: 125, position: 'absolute', bottom: 0 }} />
            </View>
            <View style={styles.lowerContainer}>

                <TextInput style={styles.textInput} placeholder="Email" onChangeText={setEmail} />
                <TextInput style={styles.textInput} secureTextEntry={true} placeholder="Password" onChangeText={setPassword} />
                <Pressable style={[styles.pressableButton, {backgroundColor: 'blue'}]} onPress={handleLogin} >
                    <Text style={styles.pressableText}>Login</Text>
                </Pressable>
                <Pressable style={styles.hyperlinkContainer} onPress={() => handleToSignup(navigation)}>
                    <Text style={{ color: 'blue', fontSize: 18}}>Signup</Text>
                </Pressable>

            </View>
        </View>
    )
}

function handleToSignup(nav) {
    nav.reset({
        index: 1,
        routes: [{ 'name': 'Cafe Signup' }],
    })
    nav.navigate('Cafe Signup');
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
        backgroundColor: '#F70084',
        marginTop: 20,
    },
    pressableText: {
        color: 'white',
    },
    hyperlinkContainer: {
        height: 50,
        marginTop: 10,
        display: 'flex',
        justifyContent: 'center',
    },
    upperContainer: {
        width: '100%',
        height: '30%',
        position: 'absolute',
        top: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    lowerContainer: {
        width: '100%',
        height: '70%',
        position: 'absolute',
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
})


export default Login;