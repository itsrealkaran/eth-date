"use client";

import { useEffect, useRef, useState } from "react";

// User interface (JavaScript object structure)
// {
//   id: string,
//   x: number,
//   y: number,
//   gender: "male" | "female",
//   name: string,
//   lastSeen: number,
//   isActive: boolean
// }

// WebSocketMessage interface (JavaScript object structure)
// {
//   type: "position" | "user_joined" | "user_left" | "users_update" | "heartbeat",
//   data?: any,
//   userId?: string,
//   x?: number,
//   y?: number,
//   gender?: "male" | "female",
//   users?: User[],
//   timestamp?: number
// }

export function useWebSocket(url) {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef();
  const heartbeatIntervalRef = useRef();
  const userIdRef = useRef(
    `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const connect = () => {
    try {
      const mockWs = {
        send: (data) => {
          console.log("[v0] WebSocket sending:", data);
          const message = JSON.parse(data);

          // Simulate server responses with realistic delays
          if (message.type === "position") {
            // Update user position and broadcast to others
            setTimeout(() => {
              updateUserPosition(
                userIdRef.current,
                message.x,
                message.y,
                message.gender
              );

              // Simulate other users moving occasionally
              if (Math.random() < 0.3) {
                simulateUserMovement();
              }
            }, 50 + Math.random() * 100);
          }

          if (message.type === "heartbeat") {
            // Respond to heartbeat
            setTimeout(() => {
              handleMessage({
                type: "heartbeat",
                timestamp: Date.now(),
              });
            }, 10);
          }
        },
        close: () => {
          console.log("[v0] WebSocket connection closed");
          setIsConnected(false);
          cleanup();
        },
        readyState: 1, // OPEN
      };

      wsRef.current = mockWs;
      setIsConnected(true);
      setError(null);

      startHeartbeat();

      setTimeout(() => {
        const initialUsers = generateMockUsers();
        setUsers(initialUsers);

        startUserActivitySimulation();
      }, 500);
    } catch (err) {
      setError("Failed to connect to WebSocket");
      setIsConnected(false);

      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    }
  };

  const startHeartbeat = () => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current && isConnected) {
        wsRef.current.send(
          JSON.stringify({
            type: "heartbeat",
            userId: userIdRef.current,
            timestamp: Date.now(),
          })
        );
      }
    }, 30000); // Send heartbeat every 30 seconds
  };

  const startUserActivitySimulation = () => {
    const activityInterval = setInterval(() => {
      if (Math.random() < 0.4) {
        // 40% chance of activity
        simulateUserMovement();
      }

      if (Math.random() < 0.1) {
        // 10% chance of user joining/leaving
        simulateUserJoinLeave();
      }

      cleanupInactiveUsers();
    }, 2000 + Math.random() * 3000); // Every 2-5 seconds

    return () => clearInterval(activityInterval);
  };

  const simulateUserMovement = () => {
    setUsers((prevUsers) => {
      if (prevUsers.length === 0) return prevUsers;

      const userToMove =
        prevUsers[Math.floor(Math.random() * prevUsers.length)];
      const moveDistance = 20 + Math.random() * 40;
      const angle = Math.random() * 2 * Math.PI;

      const newX = Math.max(
        50,
        Math.min(350, userToMove.x + Math.cos(angle) * moveDistance)
      );
      const newY = Math.max(
        50,
        Math.min(450, userToMove.y + Math.sin(angle) * moveDistance)
      );

      return prevUsers.map((user) =>
        user.id === userToMove.id
          ? { ...user, x: newX, y: newY, lastSeen: Date.now(), isActive: true }
          : user
      );
    });
  };

  const simulateUserJoinLeave = () => {
    setUsers((prevUsers) => {
      if (Math.random() < 0.6 && prevUsers.length < 12) {
        // Add new user
        const newUser = generateSingleUser(
          `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        );
        return [...prevUsers, newUser];
      } else if (prevUsers.length > 2) {
        // Remove random user
        const userToRemove =
          prevUsers[Math.floor(Math.random() * prevUsers.length)];
        return prevUsers.filter((user) => user.id !== userToRemove.id);
      }
      return prevUsers;
    });
  };

  const cleanupInactiveUsers = () => {
    const now = Date.now();
    setUsers(
      (prevUsers) => prevUsers.filter((user) => now - user.lastSeen < 60000) // Remove users inactive for 1 minute
    );
  };

  const updateUserPosition = (userId, x, y, gender) => {
    setUsers((prevUsers) => {
      const existingUser = prevUsers.find((user) => user.id === userId);
      if (existingUser) {
        return prevUsers.map((user) =>
          user.id === userId
            ? { ...user, x, y, lastSeen: Date.now(), isActive: true }
            : user
        );
      }
      return prevUsers;
    });
  };

  const handleMessage = (message) => {
    switch (message.type) {
      case "users_update":
        if (message.users) {
          setUsers(message.users);
        }
        break;
      case "user_joined":
        if (message.data) {
          setUsers((prev) => [
            ...prev,
            { ...message.data, lastSeen: Date.now(), isActive: true },
          ]);
        }
        break;
      case "user_left":
        if (message.userId) {
          setUsers((prev) => prev.filter((user) => user.id !== message.userId));
        }
        break;
      case "position":
        if (
          message.userId &&
          message.x !== undefined &&
          message.y !== undefined
        ) {
          updateUserPosition(
            message.userId,
            message.x,
            message.y,
            message.gender || "male"
          );
        }
        break;
      case "heartbeat":
        // Connection is healthy
        setError(null);
        break;
    }
  };

  const sendMessage = (message) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(
        JSON.stringify({
          ...message,
          userId: userIdRef.current,
          timestamp: Date.now(),
        })
      );
    }
  };

  const sendPosition = (x, y, gender) => {
    sendMessage({
      type: "position",
      x,
      y,
      gender,
    });
  };

  const cleanup = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    cleanup();
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    users,
    error,
    sendPosition,
    sendMessage,
    connect,
    disconnect,
    userId: userIdRef.current,
  };
}

function generateSingleUser(id) {
  const names = {
    male: [
      "Alex",
      "Jake",
      "Ryan",
      "Mike",
      "Tom",
      "Chris",
      "David",
      "Sam",
      "Luke",
      "Max",
    ],
    female: [
      "Sarah",
      "Emma",
      "Mia",
      "Luna",
      "Zoe",
      "Aria",
      "Lily",
      "Maya",
      "Ava",
      "Chloe",
    ],
  };

  const gender = Math.random() > 0.5 ? "male" : "female";
  const nameList = names[gender];
  const name = nameList[Math.floor(Math.random() * nameList.length)];

  return {
    id,
    x: Math.random() * 300 + 75, // More centered positioning
    y: Math.random() * 400 + 75,
    gender,
    name: `${name}${Math.floor(Math.random() * 99)}`,
    lastSeen: Date.now(),
    isActive: true,
  };
}

function generateMockUsers() {
  const users = [];
  const userCount = Math.floor(Math.random() * 6) + 4; // 4-9 users

  for (let i = 0; i < userCount; i++) {
    users.push(generateSingleUser(`user_${i}_${Date.now()}`));
  }

  return users;
}
