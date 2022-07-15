import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Directus } from '@directus/sdk';
import { Loading } from './Loading';
import { GiftedChat } from 'react-native-gifted-chat'
import i18n from 'i18n-js';

const directus = new Directus('https://iw77uki0.directus.app');

export default function Chat({route}){
    const chat_id = route?.params.chat_id;
    const user_id = route?.params.user_id;
    const contractor_id = route?.params.contractor_id;

    const [messages, setMessages] = React.useState([]);

    async function putMessages(message){
        var arr = [...messages];
        arr.push(message);
        await directus.items('chats').updateOne(chat_id, {
            messages: arr
        })
        .then((res) => {
            console.log("done");
        });
    }

    React.useEffect(() => {
        setMessages([
        {
            _id: contractor_id,
            text: 'Hello developer',
            createdAt: new Date(),
            user: {
            _id: user_id,
            },
        }]);
        putMessages( {
            _id: contractor_id,
            text: 'Hello developer',
            createdAt: new Date(),
            user: {
            _id: user_id,
            },
        });
    }, [])

    const onSend = React.useCallback(async (messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
        var all_messages = [...messages];
        all_messages.push(messages);
        await directus.items('chats').updateOne(chat_id, {
            messages: all_messages
        })
        .then((res) => {
        });
      }, [])

    return(
        <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: user_id,
      }}
    />
    );
}
