import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';

export default function useMessages(senderId, isLandlord, receiverId) {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        fetch(`/api/messages/list_message?user_id=${senderId}&is_landlord=${isLandlord}&receiver_id=${receiverId}`, {
            method: 'GET', 
            headers: {
            'Accept': 'application/json'}
            })
            .then(res => res.json())
            .then(data => {setMessages(Array.isArray(data) ? data : []);
            })
            .catch(() => setMessages([]));
    }, [senderId, isLandlord, receiverId]);

    useEffect(() => {
        if (!supabase || !senderId) {
            console.error("Supabase client is not initialized or senderId is missing");
            return;
        }
    
        const subscription = supabase
            .channel('messages_channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages_table' },
                (payload) => {
                    const newMessage = payload.new;
    
                    if ((newMessage.sender_landlord_id === senderId && newMessage.receiver_renter_id === receiverId) || (newMessage.sender_renter_id === senderId && newMessage.receiver_landlord_id === receiverId)) {

                            setMessages((prev) => [...prev, newMessage]);
                    }
                }
            )
            .subscribe();
    
        return () => {
            supabase.removeChannel(subscription);
        };
    }, [senderId, isLandlord, receiverId]);

    const sendMessage = (content, receiverId) => {
        setMessages(prev => [...prev, {
            message_id: `temp-${Date.now()}`,
            message: content,
            created_at: new Date().toISOString(),
            [isLandlord ? 'sender_landlord_id' : 'sender_renter_id']: parseInt(senderId),
            [isLandlord ? 'receiver_landlord_id' : 'receiver_renter_id']: parseInt(receiverId),
            isOptimistic: true
        }]);
        
        return fetch('/api/messages/send_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            sender_id: senderId,
            receiver_id: receiverId,
            message: content,
            sender_is_landlord: isLandlord
            })
        }).catch(error => {
            setMessages(prev => prev.filter(msg => !msg.isOptimistic || msg.message !== content));
            throw error;
        });
        };

    return { messages, sendMessage };
}