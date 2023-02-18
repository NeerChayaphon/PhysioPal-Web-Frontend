import React from 'react';
import io from 'socket.io-client';
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

const Physiotherapist = () => {
  const {id} = useParams();
  const [socket, setSocket] = useState(null); // socket
  const [call, setCall] = useState(null);

  useEffect(() => {
    const newSocket = io('localhost:5000/');
    setSocket(newSocket); // set doctor socket
    connectUser(newSocket, id);
  }, [setSocket]);
  return <div>Physiotherapist {id}</div>;
};

const connectUser = (socket, userid) => {
  socket.on('connect', () => {
    socket.emit('online-user', socket.id, userid);
  });
};

export default Physiotherapist;
