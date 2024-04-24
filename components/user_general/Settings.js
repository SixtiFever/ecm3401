import { View, Text, Button, Pressable, StyleSheet } from "react-native"
import { auth, firestore } from "../../firebaseConfig";
import { signOut, deleteUser } from "firebase/auth";
import { collection, doc, deleteDoc, getDoc, runTransaction } from "firebase/firestore";

const Settings = ({navigation}) => {

    const handleLogout = async (nav) => {
        await signOut(auth).then(() => {
            console.log('Signed out')
            nav.navigate('Login');
        }).catch(err => {
            console.log('<Settings.js> Error signing out: ' + err);
        })
    }

    const handleDeleteAccount = async (nav) => {
        const cRef = collection(firestore, 'users')
        const dRef = doc(cRef, auth.currentUser.email)
        const userDoc = await getDoc(dRef)
        const shops = Object.keys(userDoc.data().cards)
        await removeCustomerFromCafeDocs(auth.currentUser.email, shops)
        await deleteUser(auth.currentUser).then(() => {
            console.log('Deleted user authenticated account');
            deleteDoc(dRef).then(() => {
                console.log('Deleted user document');
            })
            nav.navigate('Onboarding');
        }).catch(err => {
            console.log('<Settings.js> Error deleting user: ' + err);
        })
    }
    return (
        <View style={styles.container}>
            <Pressable style={styles.pressableContainer} onPress={() => handleLogout(navigation)}>
                <Text>Logout</Text>
            </Pressable>
            <Pressable style={styles.pressableContainer} onPress={() => handleDeleteAccount(navigation)}>
                <Text>Delete account</Text>
            </Pressable>
        </View>
    )
}



async function removeCustomerFromCafeDocs(email, shopEmails) {
    
    await runTransaction(firestore, async(transaction) => {
        const cRef = collection(firestore, 'cafes')
        for (let i = 0; i < shopEmails.length; i++) {
            let dRef = doc(cRef, shopEmails[i])
            let docSnap = await getDoc(dRef)
            let customers = docSnap.data().customers
            delete customers[email]
            transaction.update(dRef, {'customers': customers})
        }
    })
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    pressableContainer: {
        width: '70%',
        height: '8%',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 8,
    }
})

export default Settings;