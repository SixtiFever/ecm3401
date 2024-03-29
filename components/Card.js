import { collection, doc, getDoc, runTransaction, deleteField, where } from 'firebase/firestore';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Alert } from 'react-native';
import { auth, firestore } from '../firebaseConfig';
import { useEffect, useState } from 'react';

const rewardIconSrc = require('../assets/gift.png');


const Card = ({cafeEmail, cafeName, currentScans, scansNeeded, reward, beanIcon}) => {

    const [beanIconArray, setBeanIconArray] = useState([])

    useEffect(()=> {

        genBeanIconArray(currentScans, scansNeeded, beanIcon, setBeanIconArray);

    }, [currentScans])


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
            {/* <View style={styles.cardLHSContainer}>
                
            </View> */}
            <View style={styles.cardRHSContainer}>
                <View style={styles.cardTitleContainer}>
                    <Text style={styles.titleText}>{cafeName}</Text>
                </View>
                <View style={styles.cardBeansContainer}>
                    {beanIconArray.map(bean => {
                        return (
                            bean
                        )
                    })}
                </View>
            </View>
            <View style={styles.cardRewardContainer}>
                <View style={styles.cardRewardIcon}>
                    <Image source={rewardIconSrc} style={{height: 25, width: 25}} />
                </View>
                <View style={styles.cardRewardText}>
                    <Text style={styles.rewardText}>{reward}</Text>
                </View>
            </View>
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


function genBeanIconArray(currentScans, scansNeeded, beanIcon, setBeanIconArray) {

    beanArr = []
    for( let i = 0; i < scansNeeded; i++) {
        if ( i < currentScans ) {
            beanArr.push(<Image source={beanIcon} style={{height: 20, width: 20, marginStart: 6, tintColor: '#3C0919'}}/>)
        } else {
            beanArr.push(<Image source={beanIcon} style={{height: 20, width: 20, marginStart: 6, tintColor: '#E4DFDA'}}/>)
        }
    }
    setBeanIconArray(beanArr)

}

const styles = StyleSheet.create({
    cardBackground: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 4,
        height: 180,
        display: 'flex',
        flexDirection: 'row',
        marginTop: 25,
        width: '100%',
        justifyContent: 'center'
      },
      cardLHSContainer: {
        height: '75%',
        width: '35%',
      },
      cardRHSContainer: {
        height: '75%',
        width: '65%',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 10,
      },
      cardTitleContainer: {
        height: '30%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingStart: 5,
      },
      cardBeansContainer: {
        height: '70%',
        display: 'flex',
        flexDirection: 'row',
        paddingTop: 15,
        paddingBottom: 15,
      },
      cardRewardContainer: {
        height: '25%',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        marginBottom: 2,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      },
      cardRewardIcon: {
        width: '15%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      },
      cardRewardText: {
        width: '85%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingStart: 5,
      },
      rewardText: {
        fontSize: 14,
        fontWeight: '500'
      },
      titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        textDecorationLine: 'underline'
      }
    })

export default Card;