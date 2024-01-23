import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = ({navigation}) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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

    return (
        <View style={styles.container}>
            <TextInput style={styles.textInput} placeholder="Email" onChangeText={setEmail} />
            <TextInput style={styles.textInput} placeholder="Password" onChangeText={setPassword} />
            <Button title="Login" onPress={handleLogin} />
            <Button title="Forgot password" />
            <Button title="Signup" onPress={() => handleToSignup(navigation)} />
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
        height: 50,
        borderWidth: .5,
        borderColor: 'black',
        borderRadius: 4,
        paddingStart: 10,
        marginTop: 12,
    }
})


export default Login;