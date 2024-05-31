import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketApp = () => {
  const [message, setMessage] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [socketID, setSocketID] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [room, setRoom] = useState("");


  const socket = useRef(null); // useRef to hold the socket instance

  useEffect(() => {
    if (!socket.current) {
      socket.current = io("http://localhost:5000"); // Connect to default namespace

      socket.current.on("connect", () => {
        console.log(`Connected with id ${socket.current.id}`);
        setSocketID(socket.current.id);
      });

      socket.current.on("received_message", (msg) => {
        setMessage(msg);
        console.log("New message from room:", msg);
      });

      socket.current.on("users", (users) => {
        setOnlineUsers(users);
        console.log("Online users:", users);
      });

      socket.current.on("disconnect", () => {
        console.log(`User ${socket.current.id} disconnected`);
      });
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, []);

  const handleSendMsg = () => {
    if (socket.current) {
      socket.current.emit("send_message", inputMessage,room);
      setInputMessage("");
      if(room === '') return;
      socket.current.emit("join_room", room,(r)=>{
        console.log("Joined room ======>" ,r);
      });
       // Clear the input field after sending the message
    }
  };

  return (
    <div>
      <h1 className="text-3xl text-center text-emerald-500">Socket</h1>
      {message && <p className="bg-green-500">{message}</p>}
      <div className="flex mb-4">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message"
          className="p-2 rounded-md border border-emerald-600 w-full mr-2"
        />
         <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Type room name"
          className="p-2 rounded-md border border-emerald-600 w-full mr-2"
        />
        <button
          className="p-2 rounded-md bg-emerald-600 text-white w-20 active:bg-emerald-900"
          onClick={handleSendMsg}
        >
          Send
        </button>
      </div>
      <div>
        <p>Connected with ID: {socketID}</p>
        <h2 className="text-xl">Online Users in {room} room:</h2>
        <ul>
          {onlineUsers.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SocketApp;
