import React, { useEffect, useState } from 'react';
import styles from './Chat.module.css';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { database } from '../firebase';
import { ref, push, onValue, update } from 'firebase/database';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isOnline, setIsOnline] = useState(false); // ✅ Track recipient online status
  const { user } = useAuth();
  const { userId: recipientId } = useParams();
  const location = useLocation();

  const recipientName = location.state?.username || "Unknown User";
  const currentUserId = user?.uid;
  const currentUserName = user?.username || "You";

  // ✅ Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    if (!currentUserId || !recipientId) return;

    const now = new Date();

    const newMessage = {
      message: inputMsg,
      sender: currentUserId,
      receiver: recipientId,
      date: now.toLocaleDateString('en-IN'),
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: "NOT_SEEN",
      img_message: ""
    };

    try {
      const chatRef = ref(database, 'Chats');
      await push(chatRef, newMessage);

      await update(ref(database, `Chatlist/${currentUserId}/${recipientId}`), {
        id: recipientId,
        username: recipientName
      });
      await update(ref(database, `Chatlist/${recipientId}/${currentUserId}`), {
        id: currentUserId,
        username: currentUserName
      });

      setInputMsg('');
    } catch (err) {
      console.error('❌ Firebase message send error:', err);
    }
  };

  // ✅ Load messages in real-time
  const loadMessages = (partnerId) => {
    const messagesRef = ref(database, 'Chats');
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const myMessages = Object.entries(data)
          .filter(([id, msg]) =>
            (msg.sender === currentUserId && msg.receiver === partnerId) ||
            (msg.sender === partnerId && msg.receiver === currentUserId)
          )
          .sort((a, b) =>
            new Date(`${a[1].date} ${a[1].time}`) -
            new Date(`${b[1].date} ${b[1].time}`)
          )
          .map(([id, msg]) => msg);
        setMessages(myMessages);
      } else {
        setMessages([]);
      }
    });
  };

  // ✅ Listen for recipient online status
  useEffect(() => {
    if (recipientId) {
      const recipientRef = ref(database, `ChatUsers/${recipientId}/status`);
      onValue(recipientRef, (snapshot) => {
        setIsOnline(snapshot.val() === "online");
      });
    }
  }, [recipientId]);

  // ✅ Run listener whenever partner changes
  useEffect(() => {
    if (recipientId && currentUserId) {
      loadMessages(recipientId);
    }
  }, [recipientId, currentUserId]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>
          Chat with {recipientName}{" "}
          <span className={isOnline ? styles.online : styles.offline}>
            ● {isOnline ? "Online" : "Offline"}
          </span>
        </h2>

        <div className={styles.chatBox}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                msg.sender === currentUserId ? styles.sent : styles.received
              }`}
            >
              {msg.message}
            </div>
          ))}
        </div>

        <form className={styles.form} onSubmit={sendMessage}>
          <input
            className={styles.input}
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Type a message"
          />
          <button className={styles.button} type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;





