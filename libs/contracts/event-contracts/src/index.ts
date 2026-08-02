/**
 * root barrel เก็บไว้เฉพาะของที่เป็น "กลางจริง ๆ" (envelope + registry)
 * ส่วน event ราย domain ให้ import แบบ subpath:
 *   import { USER_TOPICS, userCreatedV1Schema } from '@micro-service/event-contracts/user';
 * ใช้กติกาเดียวกับ proto-contracts เพื่อให้จำกฎเดียว
 */
export * from './envelope';
export * from './registry';
