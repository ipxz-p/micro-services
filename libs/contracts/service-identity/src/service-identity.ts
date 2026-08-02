/** identity ของผู้เรียกที่ถูกส่งต่อข้าม service ผ่าน gRPC metadata */
export type ServiceIdentity = {
  userId: string;
  userEmail?: string;
};
