
export type Detection = {
  id: string;
  lat: number;
  lng: number;
  time: string;
  confidence: number;
  camera: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  thumbnail?: string;
};
