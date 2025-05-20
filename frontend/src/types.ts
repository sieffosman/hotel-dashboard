export interface RoomRead {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  image_url?: string;
  facilities: string[];
}
