/**
 * Hotel Room Reservation System - Booking Service
 * 
 * Algorithm: Two-phase optimal allocation
 * Phase 1: Same-floor contiguous allocation (Priority 1)
 * Phase 2: Cross-floor sliding window clustering (Priority 2)
 * 
 * Time Complexity: O(A log A) where A = available rooms
 * Space Complexity: O(A) for sorted room list
 */

const HOTEL_CONFIG = {
    floors: 10,
    roomsPerFloor: [10, 10, 10, 10, 10, 10, 10, 10, 10, 7], // Floor 1-9: 10 rooms, Floor 10: 7 rooms
    horizontalTime: 1,  // 1 minute per room horizontally
    verticalTime: 2,    // 2 minutes per floor vertically
    maxBooking: 5       // Maximum rooms per booking
};

class BookingService {
    constructor() {
        this.rooms = new Map();
        this.initializeRooms();
    }

    /**
     * Initialize all 97 rooms with default state
     */
    initializeRooms() {
        this.rooms.clear();

        for (let floor = 1; floor <= HOTEL_CONFIG.floors; floor++) {
            const roomCount = HOTEL_CONFIG.roomsPerFloor[floor - 1];

            for (let position = 1; position <= roomCount; position++) {
                const roomId = this.getRoomId(floor, position);
                this.rooms.set(roomId, {
                    id: roomId,
                    floor,
                    position,
                    occupied: false,
                    bookedAt: null,
                    bookingId: null
                });
            }
        }

        return { totalRooms: this.rooms.size, message: 'All rooms initialized' };
    }

    /**
     * Generate room ID from floor and position
     * Room 101 = Floor 1, Position 1
     * Room 1007 = Floor 10, Position 7
     */
    getRoomId(floor, position) {
        return floor * 100 + position;
    }

    /**
     * Parse room ID back to floor and position
     */
    parseRoomId(roomId) {
        return {
            floor: Math.floor(roomId / 100),
            position: roomId % 100
        };
    }

    /**
     * Calculate travel time between two rooms
     * Formula: |floor1 - floor2| × 2 + |pos1 - pos2| × 1
     */
    calculateTravelTime(roomA, roomB) {
        const a = typeof roomA === 'number' ? this.parseRoomId(roomA) : roomA;
        const b = typeof roomB === 'number' ? this.parseRoomId(roomB) : roomB;

        const verticalDist = Math.abs(a.floor - b.floor) * HOTEL_CONFIG.verticalTime;
        const horizontalDist = Math.abs(a.position - b.position) * HOTEL_CONFIG.horizontalTime;

        return verticalDist + horizontalDist;
    }

    /**
     * Calculate total travel time for a set of rooms
     * Utilizes a TSP approach (checking permutations) for true shortest path
     */
    calculateTotalTravelTime(roomIds) {
        if (!roomIds || roomIds.length <= 1) return 0;

        // Helper to get all permutations (O(N!) but N <= 5, so max 120 calls)
        const getPermutations = (arr) => {
            if (arr.length <= 1) return [arr];
            const results = [];
            for (let i = 0; i < arr.length; i++) {
                const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
                for (const p of getPermutations(rest)) {
                    results.push([arr[i], ...p]);
                }
            }
            return results;
        };

        const perms = getPermutations([...roomIds]);
        let minTime = Infinity;

        for (const perm of perms) {
            let time = 0;
            for (let i = 0; i < perm.length - 1; i++) {
                time += this.calculateTravelTime(perm[i], perm[i + 1]);
            }
            if (time < minTime) minTime = time;
        }

        return minTime;
    }

    /**
     * Get all currently available rooms
     */
    getAvailableRooms() {
        return Array.from(this.rooms.values())
            .filter(room => !room.occupied)
            .map(room => ({
                id: room.id,
                floor: room.floor,
                position: room.position
            }));
    }

    /**
     * Group available rooms by floor
     */
    getAvailableRoomsByFloor() {
        const byFloor = new Map();

        for (let floor = 1; floor <= HOTEL_CONFIG.floors; floor++) {
            byFloor.set(floor, []);
        }

        this.getAvailableRooms().forEach(room => {
            byFloor.get(room.floor).push(room);
        });

        return byFloor;
    }

    /**
     * Find contiguous rooms on a single floor
     * Returns the contiguous block closest to the lift (leftmost)
     */
    findContiguousRooms(floorRooms, count) {
        if (floorRooms.length < count) return null;

        const sorted = [...floorRooms].sort((a, b) => a.position - b.position);
        let bestStart = null;
        let bestStartPosition = Infinity;

        for (let i = 0; i <= sorted.length - count; i++) {
            // Check if next 'count' rooms are contiguous
            let isContiguous = true;
            for (let j = 0; j < count - 1; j++) {
                if (sorted[i + j + 1].position - sorted[i + j].position !== 1) {
                    isContiguous = false;
                    break;
                }
            }

            if (isContiguous) {
                const startPos = sorted[i].position;
                // Prefer rooms closest to lift (smallest position)
                if (startPos < bestStartPosition) {
                    bestStartPosition = startPos;
                    bestStart = i;
                }
            }
        }

        if (bestStart !== null) {
            return sorted.slice(bestStart, bestStart + count);
        }

        return null;
    }

    /**
     * PHASE 1: Find best same-floor allocation
     * Priority: Contiguous rooms on a single floor, closest to lift
     */
    findBestSameFloorAllocation(count) {
        const byFloor = this.getAvailableRoomsByFloor();
        let bestAllocation = null;
        let bestScore = Infinity; // Lower is better: travelTime * 100 + distanceFromLift

        for (let floor = 1; floor <= HOTEL_CONFIG.floors; floor++) {
            const floorRooms = byFloor.get(floor);
            const contiguous = this.findContiguousRooms(floorRooms, count);

            if (contiguous) {
                const travelTime = this.calculateTotalTravelTime(contiguous.map(r => r.id));
                const distanceFromLift = contiguous[0].position;
                const score = travelTime * 100 + distanceFromLift;

                if (score < bestScore) {
                    bestScore = score;
                    bestAllocation = {
                        rooms: contiguous,
                        travelTime,
                        floor,
                        strategy: 'SAME_FLOOR_CONTIGUOUS'
                    };
                }
            }
        }

        return bestAllocation;
    }

    /**
     * PHASE 2: Find best cross-floor allocation using k-nearest neighbors heuristic
     * Minimizes total exact travel time across floors
     */
    findBestCrossFloorAllocation(count) {
        const available = this.getAvailableRooms();

        if (available.length < count) return null;

        let bestAllocation = null;
        let bestTravelTime = Infinity;

        // For every available room, form a cluster with its nearest neighbors
        for (const startRoom of available) {
            // Find distances from this room to all other available rooms
            const neighbors = available
                .filter(r => r.id !== startRoom.id)
                .map(r => ({ room: r, dist: this.calculateTravelTime(startRoom, r) }))
                .sort((a, b) => a.dist - b.dist);

            // Take the (count - 1) closest rooms
            const cluster = [startRoom, ...neighbors.slice(0, count - 1).map(n => n.room)];

            const travelTime = this.calculateTotalTravelTime(cluster.map(r => r.id));

            if (travelTime < bestTravelTime) {
                bestTravelTime = travelTime;
                bestAllocation = {
                    rooms: cluster.sort((a, b) => a.floor - b.floor || a.position - b.position),
                    travelTime,
                    floors: [...new Set(cluster.map(r => r.floor))],
                    strategy: 'CROSS_FLOOR_CLUSTER'
                };
            }
        }

        return bestAllocation;
    }

    /**
     * Main booking function
     * Input: number of rooms to book
     * Output: { success, rooms, travelTime, strategy } or { success: false, error }
     */
    bookRooms(count, bookingId = null) {
        // Validation
        if (!Number.isInteger(count) || count < 1) {
            return {
                success: false,
                error: 'Room count must be a positive integer',
                code: 'INVALID_COUNT'
            };
        }

        if (count > HOTEL_CONFIG.maxBooking) {
            return {
                success: false,
                error: `Maximum ${HOTEL_CONFIG.maxBooking} rooms can be booked at once`,
                code: 'EXCEEDS_MAX_BOOKING'
            };
        }

        const available = this.getAvailableRooms();

        if (available.length === 0) {
            return {
                success: false,
                error: 'No rooms available',
                code: 'NO_ROOMS_AVAILABLE'
            };
        }

        if (available.length < count) {
            return {
                success: false,
                error: `Only ${available.length} rooms available, requested ${count}`,
                code: 'INSUFFICIENT_ROOMS',
                availableCount: available.length
            };
        }

        // PHASE 1: Try same-floor allocation first
        const sameFloorResult = this.findBestSameFloorAllocation(count);

        if (sameFloorResult) {
            return this.confirmBooking(sameFloorResult, bookingId);
        }

        // PHASE 2: Fall back to cross-floor allocation
        const crossFloorResult = this.findBestCrossFloorAllocation(count);

        if (crossFloorResult) {
            return this.confirmBooking(crossFloorResult, bookingId);
        }

        // Should never reach here if count <= available.length
        return {
            success: false,
            error: 'Unable to find suitable room allocation',
            code: 'ALLOCATION_FAILED'
        };
    }

    /**
     * Confirm booking by marking rooms as occupied
     */
    confirmBooking(allocation, bookingId) {
        const timestamp = new Date().toISOString();
        const generatedBookingId = bookingId || `BK-${Date.now()}`;

        allocation.rooms.forEach(room => {
            const r = this.rooms.get(room.id);
            r.occupied = true;
            r.bookedAt = timestamp;
            r.bookingId = generatedBookingId;
        });

        return {
            success: true,
            bookingId: generatedBookingId,
            rooms: allocation.rooms.map(r => r.id),
            roomDetails: allocation.rooms,
            travelTime: allocation.travelTime,
            strategy: allocation.strategy,
            floor: allocation.floor || null,
            floors: allocation.floors || [allocation.floor],
            bookedAt: timestamp
        };
    }

    /**
     * Generate random occupancy for testing
     * @param {number} probability - Probability of a room being occupied (0-1)
     */
    setRandomOccupancy(probability = 0.4) {
        this.initializeRooms();

        let occupiedCount = 0;
        this.rooms.forEach((room) => {
            if (Math.random() < probability) {
                room.occupied = true;
                room.bookedAt = new Date().toISOString();
                room.bookingId = `RANDOM-${Date.now()}`;
                occupiedCount++;
            }
        });

        return {
            totalRooms: this.rooms.size,
            occupied: occupiedCount,
            available: this.rooms.size - occupiedCount,
            occupancyRate: Math.round((occupiedCount / this.rooms.size) * 100)
        };
    }

    /**
     * Reset all rooms to available
     */
    reset() {
        return this.initializeRooms();
    }

    /**
     * Get current hotel statistics
     */
    getStats() {
        let available = 0;
        let occupied = 0;
        const occupiedByFloor = new Map();

        for (let floor = 1; floor <= HOTEL_CONFIG.floors; floor++) {
            occupiedByFloor.set(floor, 0);
        }

        this.rooms.forEach(room => {
            if (room.occupied) {
                occupied++;
                occupiedByFloor.set(room.floor, occupiedByFloor.get(room.floor) + 1);
            } else {
                available++;
            }
        });

        return {
            total: this.rooms.size,
            available,
            occupied,
            occupancyRate: Math.round((occupied / this.rooms.size) * 100),
            byFloor: Object.fromEntries(occupiedByFloor)
        };
    }

    /**
     * Get all room data (for API response)
     */
    getAllRooms() {
        return Array.from(this.rooms.values()).map(room => ({
            id: room.id,
            floor: room.floor,
            position: room.position,
            occupied: room.occupied,
            bookedAt: room.bookedAt,
            bookingId: room.bookingId
        }));
    }

    /**
     * Get hotel configuration
     */
    static getConfig() {
        return { ...HOTEL_CONFIG };
    }
}

module.exports = BookingService;
