/**
 * Hotel Configuration Constants (Client-side)
 * Mirrors server configuration for consistent rendering
 */

const HOTEL_CONFIG = {
    floors: 10,
    roomsPerFloor: [10, 10, 10, 10, 10, 10, 10, 10, 10, 7],
    totalRooms: 97,
    maxRoomsPerBooking: 5,
    minRoomsPerBooking: 1,

    getRoomId: (floor, position) => floor * 100 + position,

    parseRoomId: (roomId) => ({
        floor: Math.floor(roomId / 100),
        position: roomId % 100
    })
};

Object.freeze(HOTEL_CONFIG);
Object.freeze(HOTEL_CONFIG.roomsPerFloor);

export default HOTEL_CONFIG;
