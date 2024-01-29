import { View, Text, Button, TextInput, StyleSheet, Pressable } from "react-native"
import { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "../../firebaseConfig";
import NumericInput from "react-native-numeric-input";
import DropDownPicker from "react-native-dropdown-picker";

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
        'customerScans': 0,
        'customerRedeems': 0,
        'scansPerDay': 0,
        'redeemsPerDay': 0,
        'startDate': new Date().toLocaleString(),
        
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
            
            <Pressable style={styles.launchPromotion} onPress={() => handleLaunchPromotion(outgoingPromotion)}>
                <Text style={styles.launchBtnText}>Launch Promotion</Text>
            </Pressable>

        </View>
    )
}


/*
@param1 -> outData -> Data of the promotion being finished. Store in cafe.previousPromotions
*/
function handleLaunchPromotion(oldData) {
    /*
    - Calculate days ran for ending promotion
    - Save promotion to cafe.previousPromotions


    - Populate cafe.currentPromotion with new promotion details
    */
    
    archivePreviousPromotion(oldData);
    
    
}

function archivePreviousPromotion(oldData){
    const {daysRun, endDate} = calculatePromotionTimeInDays(oldData.startDate);

    const cRef = collection(firestore, 'cafes');
    const dRef = doc(cRef, auth.currentUser.email);
    oldData['endDate'] = endDate;
    oldData['daysRun'] = daysRun;
    setDoc(dRef, { previousPromotions: { [oldData.startDate]: oldData } }, { merge: true }).then(() => {
        console.log('Added to previous promotions');
    }).catch(err => {
        console.log('Error archiving promotion: ' + err);
    });
}


function calculatePromotionTimeInDays(startDate) {
    // reformat date into yyyy-mm-dd
    let from = startDate.split('/');
    const start = new Date(from[2], from[1]-1, from[0]);
    const end = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    //const end = Date.parse(endDate);
    const diffInTime = end.getTime() - start.getTime();
    let diffInDays = Math.round(diffInTime / (1000 * 3600 * 24));
    return {daysRun: diffInDays, endDate: end};
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