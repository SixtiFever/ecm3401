import { collection, doc, getDoc, runTransaction, deleteField, where } from 'firebase/firestore';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Alert } from 'react-native';
import { auth, firestore } from '../firebaseConfig';


const Card = ({cafeEmail, cafeName, currentScans, scansNeeded, reward}) => {

    const handleLongPress = () => {
        Alert.alert('Delete card', 'Do you want to delete your loyalty card for ' + cafeName + '? This can\'t be undone.', [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel pressed'),
                style: 'cancel',
            },
            {
                text: 'Delete',
                onPress: () => handleDeleteCard(cafeEmail, auth),
                style: 'destructive',
            }
        ]);
    }
    return (
        <Pressable style={styles.cardBackground} onLongPress={() => handleLongPress()}>
            <Text>Cafe: {cafeName}</Text>
            <Text>Current Scans: {currentScans}</Text>
            <Text>Scans Needed: {scansNeeded}</Text>
            <Text>Reward: {reward}</Text>
        </Pressable>
    )
}

async function handleDeleteCard(cafeEmail, auth) {
    try {
        await runTransaction(firestore, async (transaction) => {


            // remove card from users cards
            const userCollection = collection(firestore, 'users');
            const userDoc = doc(userCollection, auth.currentUser.email);
            const userDocSnap = await getDoc(userDoc);
            console.log(userDocSnap.data())
            // assign cards that aren't being deleted to updatedCards and then covnert to object for uploading
            const updatedCards = Object.entries(userDocSnap.data().cards).filter( card => card[0] != cafeEmail );
            const cardObject = Object.fromEntries(updatedCards);
            transaction.update(userDoc, { cards: cardObject });

            // remove from cafe.customers
            const cafeCollection = collection(firestore, 'cafes');
            const cafeDoc = doc(cafeCollection, cafeEmail);
            const cafeDocSnap = await getDoc(cafeDoc);
            const updatedCustomers = Object.entries(cafeDocSnap.data().customers).filter( customer => customer[0] != auth.currentUser.email )
            const customerObject = Object.fromEntries(updatedCustomers);
            transaction.update(cafeDoc, { customers: customerObject });

        })
    } catch (err) {
        console.log('<Card.js/handleDeleteCard> error ' + err);
    }
}

const styles = StyleSheet.create({
    cardBackground: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 4,
        height: 150,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        marginTop: 25,
        width: '100%'
      }
    })

export default Card;