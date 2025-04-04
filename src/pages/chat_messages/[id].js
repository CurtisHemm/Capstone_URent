import { useState, useRef, useEffect } from 'react';
import { useFetchUserSession } from "@/hooks/useFetchUserSession.js";
import { useRouter } from 'next/router';
import useMessages from '@/hooks/useMessages';

export default function ChatPage() {
    const router = useRouter();
    const { id: senderId, receiver, is_landlord } = router.query;
    const { user } = useFetchUserSession(); 
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const { messages, sendMessage } = useMessages(
        senderId,
        is_landlord === 'true',
        receiver
    );

    console.log("Current messages in state:", messages);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
        sendMessage(input, receiver);
        setInput('');
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!senderId || !receiver) {
        return <p>Loading chat...</p>; 
    }

    return (
        <div className="chat-container">
        <div className="messages-container">
            {messages.map((msg) => {
            const localTime = msg.created_at
                ? new Date(msg.created_at).toLocaleString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false, 
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                })
                : null;

                const isSender = msg.sender_landlord_id === parseInt(senderId) || msg.sender_renter_id === parseInt(senderId);
                console.log('Message:', msg.message, 'isSender:', isSender, 'user.id:', user.id, 'sender_landlord_id:', msg.sender_landlord_id, 'sender_renter_id:', msg.sender_renter_id);

            return (
                <div
                key={msg.message_id}
                className={`message-bubble ${
                    isSender ? 'sent-message' : 'received-message'
                }`}
                >
                <p className="message-text">{msg.message}</p>
                <span className="message-time">{localTime}</span>
                </div>
            );
            })}
            <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-form">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="message-input"
            placeholder="Type a message..."
            />
            <button
            type="submit"
            className="send-button"
            >
            Send
            </button>
        </form>
        </div>
    );
}