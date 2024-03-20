import { View, Text, Button, StyleSheet, ScrollView, Pressable } from "react-native"
import { useState, useEffect, useRef } from "react"
import { collection, doc, getDoc, onSnapshot, runTransaction, setDoc } from "firebase/firestore"
import { auth, firestore } from "../../firebaseConfig"
import * as Notifications from 'expo-notifications';
import NotificationController from "../notifications/NotificationController";
import Card from "../Card";

const beansIconSrc = require('../../assets/bean_icon.png');

const UserCards = ({navigation}) => {

    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();
    const [cards, setCards] = useState(null);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (<MapPressable nav={navigation} />),
            headerLeft: () => (<SettingsPressable nav={navigation} />)
        });

        // pull users loyalty cards from firestore
        getLoyaltyCards(setCards);

        // triggers cards update when a qr code is scanned
        userCardListener(setCards);

        const nc = new NotificationController()

        nc.registerForPushNotificationsAsync().then(token => setExpoPushToken(token)).catch(err => {
            console.log(err)
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });



        return () => {
            // Notifications.removeNotificationSubscription(notificationListener.current);
            //  Notifications.removeNotificationSubscription(responseListener.current);
        };


    }, []);

    if ( cards ) {
        cafeDocumentListener(cards);
    }

    if ( expoPushToken ) {
        // store in user document
        storePushTokenInUserDocument(expoPushToken)
    }

    return (
        <View style={styles.container}>

            <View style={styles.cardsContainer}>
                <ScrollView contentContainerStyle={styles.scrollViewContainer} style={{ flex: 1 }}>
                    { cards && <MapCards data={cards} beansIcon={beansIconSrc} /> }
                </ScrollView>
            </View>

            <View style={styles.scanBtnContainer}>
                <Pressable style={styles.scanButton} onPress={() => handleToScanner(navigation)}>
                    <Text style={styles.scanBtnText}>Scan</Text>
                </Pressable>
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
connects to the users document, and updated the users expo tokens for
push notifications. Only called if the users device is not registered
in current known push tokens.
*/
async function storePushTokenInUserDocument(token) {
    await runTransaction(firestore, async (transaction) => {
        const cRef = collection(firestore, 'users')
        const dRef = doc(cRef, auth.currentUser.email)
        const userDocSnap = await getDoc(dRef)
        const userTokens = userDocSnap.data().push_tokens
        if ( !userTokens.includes(token) ) {
            userTokens.push(token)
            transaction.update(dRef, { 'push_tokens': userTokens })
            console.log('Updated push tokens for user')
        }
    }).catch(err => {
        console.log('<UserCards.js/storePushTokenInUserDocument> : ' + err);
    })
}

/*
component for rendering cards onto screen
*/
const MapCards = ({data, beansIcon}) => {

    const sortedCards = sortCards(data);
    
    return (
        sortedCards.map( item => {
            return (
                <Card 
                    key={item.cafeEmail} 
                    cafeName={item.cafeName} 
                    currentScans={item.currentScans} 
                    scansNeeded={item.scansNeeded} 
                    reward={item.reward} 
                    cafeEmail={item.cafeEmail}
                    beanIcon={beansIcon} />
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

        if (!doc.exists()) return;
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
    const cafeEmails = Object.keys(cards);  // store emails of all users loyalty cards

    if ( cafeEmails.length < 1 ) {
        console.log('User has no loyalty cards')
    };

    const cRef = collection(firestore, 'cafes');

    // set up listeners for all cafe documents that a user is subscribed to
    for ( let i = 0; i < cafeEmails.length; i++ ) {

        let docID = cafeEmails[i];
        let dRef = doc(cRef, docID);

        onSnapshot(dRef, async (snap) => {

            if ( !snap.exists() ) return;
            // check if cafe.customers is empty
            // return if is, else, update card
            if ( Object.keys(snap.data().customers).length < 1 ) {
                runTransaction(firestore, async (transaction) => {
                    const userCol = collection(firestore, 'users');
                    const userRef = doc(userCol, auth.currentUser.email);
                    const userDoc = await getDoc(userRef);
                    const updatedUserCards = Object.entries(userDoc.data().cards).filter(card => card[0] != docID);
                    const cardsObj = Object.fromEntries(updatedUserCards);
                    transaction.update(userRef, { cards: cardsObj });
                    
                }).catch(err => {
                    console.log('<UserCards.js/cafeDocumentListener/onSnapshot/runTransaction> error: ' + err);
                })
                return;
            };

            updateCard(snap.data());

        });
    }
}

/* 
pulls updated data from the cafe document.
Creates a new card object based on the data
Updates the customers loyalt card with the data
*/
function updateCard(data) {
    const userEmail = auth.currentUser.email;
    if ( data.customers[userEmail] == null || data.customers[userEmail] == undefined ) {
        console.log('Cafe.customers doesn\'t include that user');
        return;
    }

    if ( Object.entries(data.customers).length < 1 ) return;  // if the cafe.customers field is empty

    const cRef = collection(firestore, 'users');
    const dRef = doc(cRef, auth.currentUser.email);
    const updatedCard = {
                cafeEmail: data.cafeEmail,
                cafeName: data.cafeName,
                currentScans: data.customers[userEmail].current,
                reward: data.currentPromotion.reward,
                scansNeeded: data.currentPromotion.scansNeeded,
            }
            setDoc(dRef, { cards: { [data.cafeEmail]: updatedCard } }, {merge:true}).then(() => {

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

const SettingsPressable = ({nav}) => {

    return (
        <Pressable onPress={() => nav.navigate('Settings')}>
            <Text>Settings</Text>
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
        alignItems: 'center',
        width: '100%',
    },
    scrollViewContainer: {
        alignItems: 'center',
    },
    scanButton: {
        height: 80,
        width: '80%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        backgroundColor: '#F70084',
    },
    scanBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    }

})

export default UserCards;