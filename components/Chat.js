import React from 'react';
import { GiftedChat } from 'react-native-gifted-chat'
import i18n from 'i18n-js';
import { firebase, fireDB } from '../firebase';
import moment from 'moment';

export default function Chat({route}){
    const chat_id = route?.params.chat_id;
    const user_id = route?.params.user_id;
    const user_info = route?.params.user_info;

    const [messages, setMessages] = React.useState();
    
    async function getMessages(){
        const chat_doc = fireDB.collection('chats').doc(chat_id);
        const db_messages = (await chat_doc.get()).data().messages;
        // db_messages.sort((a , b) => (a.createdAt < b.createdAt) ? 1 : ((a.createdAt > b.createdAt) ? -1 : 0));
        setMessages(db_messages);
    }

    React.useEffect(() => {
        getMessages()
    },[]);

    // async function getMessages(){
    //     var all_messages;
    //     await directus.items('chats').readOne(chat_id)
    //     .then((res) => {
    //         all_messages = [...res.messages];
    //     })
    //     all_messages.sort((a , b) => (new Date(a.createdAt) < new Date(b.createdAt)) ? 1 : ((new Date(a.createdAt) > new Date(b.createdAt)) ? -1 : 0));
    //     setMessages(all_messages);
    // }

    // React.useEffect(() => {
    //     const interval = setInterval(() => {
    //         getMessages();
    //     }, 1000);
    //     return () => clearInterval(interval);
    // },[]);

    // async function onSend(messagesArray){
    //     var all_messages;
    //     await directus.items('chats').readOne(chat_id)
    //     .then((res) => {
    //         all_messages = [...res.messages];
    //     })
    //     messagesArray.forEach((msg) => {
    //         const message_format = {
    //             _id: msg._id,
    //             text: msg.text,
    //             createdAt: msg.createdAt,
    //             user: {
    //                 _id: user_id,
    //                 name: user_info.first_name + " " + user_info.last_name,
    //             },
    //         }
    //         all_messages.push(message_format);
    //     })
    //     all_messages.sort((a , b) => (new Date(a.createdAt) < new Date(b.createdAt)) ? 1 : ((new Date(a.createdAt) > new Date(b.createdAt)) ? -1 : 0));
    //     setMessages(all_messages);
    //     await directus.items('chats').updateOne(chat_id, {
    //         messages: all_messages
    //     })
    // }

    React.useLayoutEffect(() => {
        const unsubscribe = fireDB.collection('chats').doc(chat_id)
        .onSnapshot(snapshot => {
            var all_messages = snapshot.data().messages;
            // all_messages.sort((a , b) => (a.createdAt < b.createdAt) ? 1 : ((a.createdAt > b.createdAt) ? -1 : 0));
            setMessages(all_messages)
        }) 
           
        return unsubscribe;
    },[]);

    const onSend = React.useCallback(async (message = []) => {

        setMessages(previousMessages => GiftedChat.append(previousMessages, message))

        const chat_doc = fireDB.collection('chats').doc(chat_id);
        const createdAt = moment(message[0].createdAt).utc().format()
        message[0].createdAt = createdAt;

        await chat_doc.update({
            messages: firebase.firestore.FieldValue.arrayUnion(message[0])
        });

    }, [])

    return(
        <GiftedChat
        // showUserAvatar
        // showAvatarForEveryMessage={true}
        inverted = {false}
        messages={messages}
        onSend={messagesArray => onSend(messagesArray)}
        user={{
            _id: user_id,
            name: user_info.first_name + " " + user_info.last_name,
        }}
        />
    );
}
