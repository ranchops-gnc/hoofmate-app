export const HOOF_POSITIONS = ['LF', 'RF', 'LH', 'RH'] as const;
export type HoofPosition = typeof HOOF_POSITIONS[number];
export type ID = string;
export type ISODate = string;
export type Timestamp = string;
export type MembershipRole = 'owner' | 'manager' | 'staff' | 'boarder' | 'farrier' | 'veterinarian' | 'trainer';
export interface Ranch { id: ID; name: string; ownerUserId: ID; timezone: string; createdAt: Timestamp }
export interface Membership { ranchId: ID; userId: ID; role: MembershipRole; active: boolean }
export interface Horse { id: ID; ranchId: ID; name: string; ownerUserId: ID; breed?: string; color?: string; birthDate?: ISODate; sex?: 'mare' | 'gelding' | 'stallion' | 'unknown'; markings?: string; identification?: string; notes?: string; createdAt: Timestamp }
export interface HoofRecord { id: ID; horseId: ID; position: HoofPosition; recordedAt: Timestamp; authorUserId: ID; observations: string; measurementMm?: number; photoObjectKeys: string[] }
export interface FacilitySpace { id: ID; ranchId: ID; name: string; type: 'stall' | 'paddock' | 'pasture'; capacity: number; active: boolean }
export interface SpaceAssignment { id: ID; horseId: ID; spaceId: ID; startAt: Timestamp; endAt?: Timestamp }
export interface CareRecord { id: ID; horseId: ID; category: 'farrier' | 'veterinary' | 'vaccination' | 'deworming' | 'medication' | 'general'; performedAt: Timestamp; provider?: string; notes: string; nextDueDate?: ISODate; createdBy: ID }
export interface FeedPlan { id: ID; horseId: ID; feedName: string; quantity: number; unit: 'lb' | 'kg' | 'scoop' | 'flake'; frequencyPerDay: number; instructions?: string; active: boolean }
export interface CareTask { id: ID; ranchId: ID; horseId?: ID; title: string; dueAt: Timestamp; assignedUserId?: ID; status: 'open' | 'done' | 'cancelled'; completedAt?: Timestamp }
export interface BoardingAgreement { id: ID; ranchId: ID; horseId: ID; boarderUserId: ID; monthlyRateCents: number; currency: string; startDate: ISODate; endDate?: ISODate; status: 'active' | 'ended' }
export interface Appointment { id: ID; ranchId: ID; horseId: ID; type: 'farrier' | 'veterinary' | 'training' | 'other'; startsAt: Timestamp; provider?: string; notes?: string; status: 'scheduled' | 'completed' | 'cancelled' }
export interface CareTeamGrant { id: ID; horseId: ID; userId: ID; role: MembershipRole; grantedBy: ID; revokedAt?: Timestamp }
export function isHoofPosition(value: string): value is HoofPosition { return (HOOF_POSITIONS as readonly string[]).includes(value); }
export function overdue(task: Pick<CareTask, 'status' | 'dueAt'>, now: Timestamp): boolean { return task.status === 'open' && Date.parse(task.dueAt) < Date.parse(now); }
export function activeAssignment(assignments: SpaceAssignment[], horseId: ID): SpaceAssignment | undefined { return assignments.find(a => a.horseId === horseId && !a.endAt); }
