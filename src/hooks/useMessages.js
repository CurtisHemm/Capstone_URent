// Imports
import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';

// Hook for everything involving messages
export default function useMessages(senderId, isLandlord, receiverId) {
    const [messages, setMessages] = useState([]);       // Stores array of messages 

    // Effect that changes when sender, receiver, or is landlord changes. Fetchs array of messages of these specific parameters
    useEffect(() => {
        fetch(`/api/messages/list_message?user_id=${senderId}&is_landlord=${isLandlord}&receiver_id=${receiverId}`, {
            method: 'GET', 
            headers: {
            'Accept': 'application/json'}
            })
            .then(res => res.json())
            .then(data => {setMessages(Array.isArray(data) ? data : []);              // Sets array for the messages data
            })
            .catch(() => setMessages([]));
    }, [senderId, isLandlord, receiverId]);

    // useEffect when sender, receiver, or is landlord changes. 
    useEffect(() => {
        // Check is supabase and senderId is initalized 
        if (!supabase || !senderId) {
            console.error("Supabase client is not initialized or senderId is missing");
            return;
        }
    
        // Supabase subscription for messaging
        const subscription = supabase
            .channel('messages_channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages_table' },     // Types of changes to watch for
                (payload) => {
                    const newMessage = payload.new;
    
                    // Only get messages of the current conversation 
                    if ((newMessage.sender_landlord_id === senderId && newMessage.receiver_renter_id === receiverId) || (newMessage.sender_renter_id === senderId && newMessage.receiver_landlord_id === receiverId)) {
                            // Update messages with old messages and new message
                            setMessages((prev) => [...prev, newMessage]);
                    }
                }
            )
            .subscribe();
    
            // Unsubscribe when unmounted
        return () => {
            supabase.removeChannel(subscription);
        };
    }, [senderId, isLandlord, receiverId]);

    // sendMessage that inserts new row into message tab;e
    const sendMessage = async (content, receiverId) => {

        // Temporary message so that messages show up instantly
        setMessages(prev => [...prev, {
            message_id: `temp-${Date.now()}`,
            message: content,
            created_at: new Date().toISOString(),
            [isLandlord ? 'sender_landlord_id' : 'sender_renter_id']: parseInt(senderId),
            [isLandlord ? 'receiver_landlord_id' : 'receiver_renter_id']: parseInt(receiverId),
            isOptimistic: true
        }]);
        
        // Fetchs the send_message api to insert new row 
        try {
            return await fetch('/api/messages/send_message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_id: senderId,
                    receiver_id: receiverId,
                    message: content,
                    sender_is_landlord: isLandlord
                })
            });
        } catch (error) {
            // If there is an error, make sure temp message isn't added
            setMessages(prev_1 => prev_1.filter(msg => !msg.isOptimistic || msg.message !== content));
            throw error;
        }
        };

    // Return messages and sendMessage function
    return { messages, sendMessage };
}