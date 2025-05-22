// frontend/src/types.ts
export interface RoomBase {
  name: string;
  description: string;
  capacity: number;
  image_url?: string;
  facilities_count: number;
}

export interface RoomCreate extends RoomBase {}

export interface RoomUpdate {
  name?: string;
  description?: string;
  capacity?: number;
  image_url?: string;
  facilities_count?: number;
}

export interface RoomRead extends RoomBase {
  id: number;
  created_at: string;
  updated_at?: string;
}