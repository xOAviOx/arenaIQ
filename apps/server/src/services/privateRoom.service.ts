/**
 * Private "play with a friend" rooms. Purely in-memory and ephemeral — a lobby
 * exists only while its host's tab is open, and is discarded the moment the
 * match launches (the battle then lives in battle.service like any other).
 *
 * A room is keyed by a short shareable code. There is no persistence: if the
 * single backend instance restarts, open lobbies are simply gone (same trade-off
 * as the matchmaking queue and active battle rooms).
 */

export interface RoomMember {
  userId: string;
  socketId: string;
  username: string;
  rating: number;
}

export interface PrivateRoom {
  code: string;
  host: RoomMember;
  guest: RoomMember | null;
  createdAt: number;
}

// Ambiguous characters (0/O, 1/I) are omitted so codes are easy to read aloud.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;
const ROOM_TTL_MS = 30 * 60 * 1000; // abandoned lobbies expire after 30 min

const rooms = new Map<string, PrivateRoom>();

function generateCode(): string {
  let code: string;
  do {
    code = Array.from({ length: CODE_LENGTH }, () =>
      CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)],
    ).join('');
  } while (rooms.has(code));
  return code;
}

/** Drop any lobbies that have been sitting unused past their TTL. */
function sweepStale(): void {
  const cutoff = Date.now() - ROOM_TTL_MS;
  for (const [code, room] of rooms) {
    if (room.createdAt < cutoff) rooms.delete(code);
  }
}

export function createPrivateRoom(host: RoomMember): PrivateRoom {
  sweepStale();
  const code = generateCode();
  const room: PrivateRoom = { code, host, guest: null, createdAt: Date.now() };
  rooms.set(code, room);
  return room;
}

export function getPrivateRoom(code: string): PrivateRoom | undefined {
  return rooms.get(code);
}

export function removePrivateRoom(code: string): void {
  rooms.delete(code);
}

type JoinResult =
  | { ok: true; room: PrivateRoom }
  | { ok: false; error: string };

export function joinPrivateRoom(code: string, guest: RoomMember): JoinResult {
  const room = rooms.get(code);
  if (!room) return { ok: false, error: 'No room with that code. Double-check it and try again.' };
  if (room.host.userId === guest.userId) return { ok: false, error: "That's your own room — share the code with a friend." };
  if (room.guest && room.guest.userId !== guest.userId) return { ok: false, error: 'This room is already full.' };

  room.guest = guest;
  return { ok: true, room };
}
