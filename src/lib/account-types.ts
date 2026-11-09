export type UserRole = "admin" | "contributor";
export interface Account {
 id:string; username:string; displayName:string; role:UserRole; active:boolean;
 mustChangePassword:boolean; createdAt:string; lastLogin:string|null;
}
export interface UserSession extends Account { sessionVersion:number }
export function canManageContent(user:Pick<UserSession,"id"|"role">,ownerId?:string|null){return user.role==="admin"||ownerId===user.id;}
export const roleLabel=(role:UserRole)=>role==="admin"?"Administrator":"Kontributor / Operator";
