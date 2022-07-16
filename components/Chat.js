import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Directus } from '@directus/sdk';
import { Loading } from './Loading';
import { GiftedChat } from 'react-native-gifted-chat'
import profile from "../assets/profile.jpg";
import { v1 as uuidv1 } from 'uuid';
import i18n from 'i18n-js';

const directus = new Directus('https://iw77uki0.directus.app');

export default function Chat({route}){
    const chat_id = route?.params.chat_id;
    const user_id = route?.params.user_id;
    const user_info = route?.params.user_info;

    const [messages, setMessages] = React.useState();

    async function getMessages(){
        var all_messages;
        await directus.items('chats').readOne(chat_id)
        .then((res) => {
            all_messages = [...res.messages];
        })
        all_messages.sort((a , b) => (new Date(a.createdAt) < new Date(b.createdAt)) ? 1 : ((new Date(a.createdAt) > new Date(b.createdAt)) ? -1 : 0));
        setMessages(all_messages);
    }

    React.useEffect(() => {
        const interval = setInterval(() => {
            getMessages();
        }, 1000);
        return () => clearInterval(interval);
    },[]);

    async function onSend(messagesArray){
        var all_messages;
        await directus.items('chats').readOne(chat_id)
        .then((res) => {
            all_messages = [...res.messages];
        })
        messagesArray.forEach((msg) => {
            const message_format = {
                _id: msg._id,
                text: msg.text,
                createdAt: msg.createdAt,
                user: {
                    _id: user_id,
                    name: user_info.first_name + " " + user_info.last_name,
                },
            }
            all_messages.push(message_format);
        })
        all_messages.sort((a , b) => (new Date(a.createdAt) < new Date(b.createdAt)) ? 1 : ((new Date(a.createdAt) > new Date(b.createdAt)) ? -1 : 0));
        setMessages(all_messages);
        await directus.items('chats').updateOne(chat_id, {
            messages: all_messages
        })
    }

    // const onSend = React.useCallback(async (messages = []) => {
    //     setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    //     var all_messages = [...messages];
    //     all_messages.push(messages);
    //     await directus.items('chats').updateOne(chat_id, {
    //         messages: all_messages
    //     })
    //     .then((res) => {
    //     });
    //   }, [])

    return(
        <GiftedChat
        // showUserAvatar
        // showAvatarForEveryMessage={true}
        messages={messages}
        onSend={messagesArray => onSend(messagesArray)}
        user={{
            _id: user_id,
            name: user_info.first_name + " " + user_info.last_name,
        }}
        />
    );
}
