import { View, Text, Button, TextInput, StyleSheet, Pressable } from "react-native"
import { useState } from "react";
import { collection, doc, runTransaction, setDoc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../../firebaseConfig";
import NumericInput from "react-native-numeric-input";
import DropDownPicker from "react-native-dropdown-picker";
import NotificationController from "../notifications/NotificationController";

const CreatePromotion = ({route, navigation}) => {
    
    const [outgoingPromotion, setOutgoingPromotion] = useState( route.params.cafeData.currentPromotion );
    const [newPromotion, setNewPromotion] = useState({});

    const [title, setTitle] = useState("");
    const [scansNeeded, setScansNeeded] = useState(0);
    const [reward, setReward] = useState("");

    // picker
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
        {label: 'Coffee+', value: 'coffeePlus'},
        {label: 'Pastry', value: 'pastry'},
        {label: 'Coffee with a discount pastry', value: 'coffeeDiscountPastry'},
        {label: 'Pastry with a discount coffee', value: 'pastryDiscountCoffee'},
    ]);

    const promotion = {
        'title': title,
        'scansNeeded' : scansNeeded,
        'reward': reward,
        'category': value,
        'customerScans': 0,
        'customerRedeems': 0,
        'scansPerDay': 0,
        'redeemsPerDay': 0,
        'startDate': formatDate(new Date().toLocaleString()),
        
    }

    return (
        <View style={styles.container}>
            <View style={styles.promotionInputs}>
                <TextInput placeholder="Enter promotion title" onChangeText={setTitle} />
                <TextInput placeholder="Enter reward" onChangeText={setReward} />

                <View style={styles.numericInputContainer}>
                    
                    <Pressable onPress={() => setScansNeeded(x => x - 1 )}>
                        <Text style={styles.numericBtn}>Decrease</Text>
                    </Pressable>
                    <Text>{scansNeeded}</Text>
                    <Pressable onPress={() => setScansNeeded(x => x + 1 )}>
                        <Text style={styles.numericBtn}>Increase</Text>
                    </Pressable>
                </View>
                <View>
                    <Text>Promotion Category</Text>
                    <DropDownPicker
                        open={open}
                        value={value}
                        items={items}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setItems} 
                        zIndex={4} />
                </View>
            </View>

            <Pressable onPress={() => handlePushNotifications(promotion)}>
                <Text>Send push notification</Text>
            </Pressable>
            
            <Pressable style={styles.launchPromotion} onPress={() => handleLaunchPromotion(outgoingPromotion, promotion, navigation)}>
                <Text style={styles.launchBtnText}>Launch Promotion</Text>
            </Pressable>

        </View>
    )
}


/*
@param1 -> outData -> Data of the promotion being finished. Store in cafe.previousPromotions.
Archives the outgoing promotion before setting cafe.currentPromotion to the new promotion details
*/
function handleLaunchPromotion(oldData, newPromotion, nav) {
    
    archivePreviousPromotion(oldData, newPromotion).then( newPromo => {
        createNewPromotion(newPromo);
        nav.navigate('Your Cafe');

    }).catch(err => {
        console.log('<CreatePromotion.js/handleLaunchPromotion> error: ' + err);
        
    });
}

/*
converts date string into array and returns the dd/mm/yyyy format
*/
function formatDate(date) {
    const dateArr = date.split(',');  
    return dateArr[0];
}

/*
@param1 -> Old promotion data
@param2 -> New promotion data
calculates days run for the old promotion and saves it to cafe.previousPromotions.
@returns the new promotion in order to pass it to function.then() for sequential execution.
This is to prevent the new promotion being set to cafe.currentPromotion before archiving the 
old promotion, which would result in the new promotion being archived and the old promotion 
being discarded.
*/
async function archivePreviousPromotion(oldData, newPromo){
    const {daysRun, endDate} = calculatePromotionTimeInDays(oldData.startDate);

    const cRef = collection(firestore, 'cafes');
    const dRef = doc(cRef, auth.currentUser.email);
    oldData['endDate'] = endDate;
    oldData['daysRun'] = daysRun;
    await setDoc(dRef, { previousPromotions: { [oldData.startDate]: oldData } }, { merge: true }).then(() => {

    }).catch(err => {
        console.log('<CreatePromotion.js/archivePreviousPromotion> Error archiving promotion: ' + err);
    });
    return newPromo;
}

function createNewPromotion(promo) {
    const cRef = collection(firestore, 'cafes');
    const dRef = doc(cRef, auth.currentUser.email);

    setDoc(dRef, { currentPromotion: promo }, {merge: true}).then(() => {
        console.log('Successfully implemeted new promotion');
    }).catch(err => {
        console.log('<CreatePromotion.js/setNewPromotion> error: ' + err);
    });
}


function calculatePromotionTimeInDays(startDate) {
    // reformat date into yyyy-mm-dd
    let from = startDate.split('/');
    const start = new Date(from[2], from[1]-1, from[0]);
    const end = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const diffInTime = end.getTime() - start.getTime();
    let diffInDays = Math.round(diffInTime / (1000 * 3600 * 24));
    return {daysRun: diffInDays, endDate: end};
}


async function getCustomerTokens() {
    const cRef = collection(firestore, 'cafes');
    const dRef = doc(cRef, auth.currentUser.email);
    const cafeDoc = await getDoc(dRef);
    const customers = cafeDoc.data().customers;  // assigns customers object, containing all customers of cafe
    let allTokens = [];
    for ( let customer of Object.values(customers) ) {
        const tokens = customer.push_tokens;
        console.log(tokens)
        for ( let i = 0; i < tokens.length; i++ ) {
            allTokens.push(tokens[i]);
        }
    }
    return allTokens;
}

async function handlePushNotifications(promotion = {}) {
    try {
        const nc = new NotificationController();
        const tokens = await getCustomerTokens();
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i].substring(18, tokens[i].length-1)
            await nc.sendPushNotification(tokens[i], promotion);
        }

    } catch(err) {
        console.log(err)
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 25
    },
    numericInputContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    numericPressable: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    promotionInputs: {
        height: '60%',
        justifyContent: 'space-evenly',
        width: '80%',
    },
    launchPromotion: {
        height: 100,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#FE4A49',
    },
    launchBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    }
})

export default CreatePromotion;