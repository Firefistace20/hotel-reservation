/**
 * Booking Service Unit Tests
 */

const BookingService = require('../src/services/bookingService');

describe('BookingService', () => {
    let service;

    beforeEach(() => {
        service = new BookingService();
    });

    describe('Initialization', () => {
        test('should initialize with 97 rooms', () => {
            const stats = service.getStats();
            expect(stats.total).toBe(97);
            expect(stats.available).toBe(97);
            expect(stats.occupied).toBe(0);
        });

        test('should have correct room distribution per floor', () => {
            const rooms = service.getAllRooms();

            // Floors 1-9: 10 rooms each
            for (let floor = 1; floor <= 9; floor++) {
                const floorRooms = rooms.filter(r => r.floor === floor);
                expect(floorRooms.length).toBe(10);
            }

            // Floor 10: 7 rooms
            const floor10Rooms = rooms.filter(r => r.floor === 10);
            expect(floor10Rooms.length).toBe(7);
        });

        test('should generate correct room IDs', () => {
            expect(service.getRoomId(1, 1)).toBe(101);
            expect(service.getRoomId(1, 10)).toBe(110);
            expect(service.getRoomId(10, 7)).toBe(1007);
        });

        test('should parse room IDs correctly', () => {
            expect(service.parseRoomId(101)).toEqual({ floor: 1, position: 1 });
            expect(service.parseRoomId(523)).toEqual({ floor: 5, position: 23 });
            expect(service.parseRoomId(1007)).toEqual({ floor: 10, position: 7 });
        });
    });

    describe('Travel Time Calculation', () => {
        test('should calculate horizontal travel time correctly', () => {
            // Same floor, different positions
            expect(service.calculateTravelTime(101, 105)).toBe(4); // 4 rooms × 1 min
            expect(service.calculateTravelTime(201, 210)).toBe(9); // 9 rooms × 1 min
        });

        test('should calculate vertical travel time correctly', () => {
            // Same position, different floors
            expect(service.calculateTravelTime(101, 501)).toBe(8); // 4 floors × 2 min
            expect(service.calculateTravelTime(201, 901)).toBe(14); // 7 floors × 2 min
        });

        test('should calculate combined travel time correctly', () => {
            // Different floor and position
            expect(service.calculateTravelTime(101, 203)).toBe(4); // 1 floor × 2 + 2 rooms × 1
            expect(service.calculateTravelTime(101, 305)).toBe(8); // 2 floors × 2 + 4 rooms × 1
        });

        test('should calculate total travel time for multiple rooms', () => {
            // Contiguous rooms on same floor
            expect(service.calculateTotalTravelTime([101, 102, 103])).toBe(2);

            // Rooms across floors
            expect(service.calculateTotalTravelTime([101, 201])).toBe(2);

            // Single room
            expect(service.calculateTotalTravelTime([101])).toBe(0);

            // Empty array
            expect(service.calculateTotalTravelTime([])).toBe(0);
        });
    });

    describe('Booking - Same Floor Allocation', () => {
        test('should book contiguous rooms on same floor when available', () => {
            const result = service.bookRooms(3);

            expect(result.success).toBe(true);
            expect(result.rooms.length).toBe(3);
            expect(result.strategy).toBe('SAME_FLOOR_CONTIGUOUS');

            // All rooms should be on the same floor
            const floors = new Set(result.rooms.map(id => Math.floor(id / 100)));
            expect(floors.size).toBe(1);
        });

        test('should prefer rooms closest to lift', () => {
            const result = service.bookRooms(3);

            // Should start from position 1 (closest to lift)
            expect(result.rooms).toEqual([101, 102, 103]);
        });

        test('should book 5 rooms successfully', () => {
            const result = service.bookRooms(5);

            expect(result.success).toBe(true);
            expect(result.rooms.length).toBe(5);
            expect(result.travelTime).toBe(4); // 5 contiguous rooms = 4 moves
        });
    });

    describe('Booking - Cross Floor Allocation', () => {
        test('should fall back to cross-floor when same floor not possible', () => {
            // Occupy rooms 101-107 to leave only 3 rooms on floor 1
            for (let i = 1; i <= 7; i++) {
                service.rooms.get(100 + i).occupied = true;
            }
            // Occupy rooms 201-207
            for (let i = 1; i <= 7; i++) {
                service.rooms.get(200 + i).occupied = true;
            }

            const result = service.bookRooms(5);

            expect(result.success).toBe(true);
            expect(result.rooms.length).toBe(5);
        });

        test('should minimize travel time across floors', () => {
            // Leave only scattered rooms
            service.initializeRooms();

            // Make all rooms occupied except: 101, 102, 201, 202, 203
            service.rooms.forEach((room, id) => {
                if (![101, 102, 201, 202, 203].includes(id)) {
                    room.occupied = true;
                }
            });

            const result = service.bookRooms(4);

            expect(result.success).toBe(true);
            expect(result.rooms.length).toBe(4);
        });
    });

    describe('Edge Cases', () => {
        test('should handle booking 1 room', () => {
            const result = service.bookRooms(1);

            expect(result.success).toBe(true);
            expect(result.rooms.length).toBe(1);
            expect(result.travelTime).toBe(0);
        });

        test('should reject booking more than 5 rooms', () => {
            const result = service.bookRooms(6);

            expect(result.success).toBe(false);
            expect(result.code).toBe('EXCEEDS_MAX_BOOKING');
        });

        test('should reject booking 0 or negative rooms', () => {
            expect(service.bookRooms(0).success).toBe(false);
            expect(service.bookRooms(-1).success).toBe(false);
        });

        test('should handle not enough rooms available', () => {
            // Occupy all but 2 rooms
            service.rooms.forEach((room, id) => {
                if (id !== 101 && id !== 102) {
                    room.occupied = true;
                }
            });

            const result = service.bookRooms(3);

            expect(result.success).toBe(false);
            expect(result.code).toBe('INSUFFICIENT_ROOMS');
            expect(result.availableCount).toBe(2);
        });

        test('should handle all rooms occupied', () => {
            service.rooms.forEach(room => { room.occupied = true; });

            const result = service.bookRooms(1);

            expect(result.success).toBe(false);
            expect(result.code).toBe('NO_ROOMS_AVAILABLE');
        });

        test('should handle non-integer count', () => {
            const result = service.bookRooms(2.5);

            expect(result.success).toBe(false);
            expect(result.code).toBe('INVALID_COUNT');
        });
    });

    describe('Random Occupancy', () => {
        test('should generate random occupancy', () => {
            const result = service.setRandomOccupancy(0.5);

            expect(result.totalRooms).toBe(97);
            expect(result.occupied + result.available).toBe(97);
            // With 50% probability, expect roughly half occupied (with variance)
            expect(result.occupied).toBeGreaterThan(20);
            expect(result.occupied).toBeLessThan(80);
        });

        test('should handle 0% occupancy', () => {
            const result = service.setRandomOccupancy(0);

            expect(result.occupied).toBe(0);
            expect(result.available).toBe(97);
        });

        test('should handle 100% occupancy', () => {
            const result = service.setRandomOccupancy(1);

            expect(result.occupied).toBe(97);
            expect(result.available).toBe(0);
        });
    });

    describe('Reset', () => {
        test('should reset all rooms to available', () => {
            // Book some rooms first
            service.bookRooms(5);
            service.setRandomOccupancy(0.5);

            const result = service.reset();
            const stats = service.getStats();

            expect(stats.available).toBe(97);
            expect(stats.occupied).toBe(0);
        });
    });

    describe('Multiple Optimal Solutions', () => {
        test('should consistently choose same solution when multiple exist', () => {
            // When all rooms available, floors 1-9 all have valid solutions
            // Algorithm should consistently choose floor 1 (closest to ground)
            const result1 = service.bookRooms(3);
            service.reset();
            const result2 = service.bookRooms(3);

            expect(result1.rooms).toEqual(result2.rooms);
            expect(result1.floor).toBe(1);
        });
    });
});
