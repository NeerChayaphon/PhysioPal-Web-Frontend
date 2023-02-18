import React from 'react';
import io from 'socket.io-client';
import {useEffect, useState} from 'react';

const Patient = () => {
  const [socket, setSocket] = useState(null); // socket
  const [call, setCall] = useState(null);
  const [onlinePhy, setOnlinePhy] = useState({});

  useEffect(() => {
    const newSocket = io('localhost:5000/'); // socket connect
    setSocket(newSocket);
    getOnline(newSocket, setOnlinePhy);
  }, [setSocket]);

  console.log(onlinePhy);
  return (
    <div>
      {Object.keys(onlinePhy).length != 0 && (
        <div>Online Physiotherapist : {JSON.stringify(onlinePhy)}</div>
      )}
    </div>
  );
};

const getOnline = (socket, setOnlinePhy) => {
  socket.on('connect', () => {
    socket.emit('get-online-physiotherapist', socket.id);
  });
  socket.on('updatePhysiotherapistList', (physiotherapist) => {
    if (Object.keys(physiotherapist).length === 0) {
      setOnlinePhy([]);
    } else {
      setOnlinePhy(physiotherapist);
    }
    // disconnectSocket(socket);
  });
};

const disconnectSocket = (socket) => {
  socket.disconnect();
};

export default Patient;
