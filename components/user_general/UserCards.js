import { View, Text, Button, StyleSheet, ScrollView, Pressable } from "react-native"
import { useState, useEffect } from "react"
import { collection, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore"
import { auth, firestore } from "../../firebaseConfig"
import { CameraView, Camera } from "expo-camera/next";
import Card from "../Card";

const UserCards = ({navigation}) => {

    const [cards, setCards] = useState(null);

    useEffect(() => {
        console.log('Use effect called')

        navigation.setOptions({
            headerRight: () => (<MapPressable nav={navigation} />),
        });

        // pull users loyalty cards from firestore
        getLoyaltyCards(setCards);

        userCardListener(setCards);


    }, []);

    if ( cards ) {
        cafeDocumentListener(cards);
    }

    return (
        <View style={styles.container}>

            <View style={styles.cardsContainer}>
                <ScrollView contentContainerStyle={styles.scrollViewContainer} style={{ flex: 1 }}>
                    { cards && <MapCards data={cards} /> }
                </ScrollView>
            </View>

            <View style={styles.scanBtnContainer}>
                <Button title="Scan" onPress={() => handleToScanner(navigation)} />
            </View>

        </View>
    )
}

function getLoyaltyCards(setCards){
    const cRef = collection(firestore, 'users');
    const dRef = doc(cRef, auth.currentUser.email);
    getDoc(dRef).then(snap => {
        const cards = snap.data()['cards'];
        setCards(cards)
    })
}

/*
component for rendering cards onto screen
*/
const MapCards = ({data}) => {

    const sortedCards = sortCards(data);
    
    return (
        sortedCards.map( item => {
            return (
                <Card key={item.cafeEmail} cafeName={item.cafeName} currentScans={item.currentScans} scansNeeded={item.scansNeeded} reward={item.reward} />
            )
        })
    )
}

/*
navigates to qr code scanner
*/
function handleToScanner(nav) {
    nav.navigate('Scanner');
}


/*
listens to the user.cards document for updates. Triggers render if update detected.
*/
function userCardListener(setCards) {
    const cRef = collection(firestore, 'users');
    const dRef = doc(cRef, auth.currentUser.email);
    onSnapshot(dRef, (doc) => {
        setCards(doc.data().cards);
    });
}


/*
@param1 -> Cards object from user document
Sorts the cards based on most recent time stamp. This function ensures
cards are in chronological order in the users home page.
*/
function sortCards(cards) {

    const sortedCards = Object.values(cards).sort((a,b) => {
        if ( a.mostRecent < b.mostRecent ) {
            return 1;
        } else if ( a.mostRecent > b.mostRecent ) {
            return -1;
        } else {
            return 0;
        }
    });

    return sortedCards;
}

/*
listens for updates within the cafe document and updates
cards for all users with the cafes loyalty card.
*/
async function cafeDocumentListener(cards) {
    const cafeEmails = Object.keys(cards);
    if ( cafeEmails.length < 1 ) return;
    const cRef = collection(firestore, 'cafes');
    for ( let i = 0; i < cafeEmails.length; i++ ) {
        // itetate cafe documents in the users cafe emails
        let docID = cafeEmails[i];
        let dRef = doc(cRef, docID);
        onSnapshot(dRef, (snap) => {
            updateCard(snap.data());
        });

    }
}

/* 
updates users card with the updated promotion data
*/
function updateCard(data) {
    if ( Object.entries(data.customers).length < 1 ) return;
    const cRef = collection(firestore, 'users');
    const dRef = doc(cRef, auth.currentUser.email);
    console.log('Cafe data: ' + JSON.stringify(data));
    const updatedCard = {
                cafeEmail: data.cafeEmail,
                cafeName: data.cafeName,
                currentScans: data.customers[auth.currentUser.email].current,
                reward: data.currentPromotion.reward,
                scansNeeded: data.currentPromotion.scansNeeded,
            }
            setDoc(dRef, { cards: { [data.cafeEmail]: updatedCard } }, {merge:true}).then(() => {
                console.log(updatedCard);
                console.log('<UserCards.js/updateCard> Updated card');
            }).catch(err => {
                console.log('<UserCards.js> error updating card: ' + err);
            })
}


const MapPressable = ({nav}) => {
    return (
        <Pressable onPress={() => nav.navigate('Map')}>
            <Text>Maps</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardsContainer: {
        height: '85%',
        width: '90%',
        display: 'flex',
        position: 'absolute',
        top: 0,
        justifyContent: 'center'
    },
    scanBtnContainer: {
        position: 'absolute',
        bottom: 0,
        height: '15%',
        display: 'flex',
        justifyContent: 'center',
    },
    scrollViewContainer: {
        alignItems: 'center',
    }

})

export default UserCards;