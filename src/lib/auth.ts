import { db } from "./db";
import type { User } from "./db";
import { DEFAULT_SUBJECTS } from "./db";

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<User | null> {
  const existing = await db.users.where("email").equals(email).first();
  if (existing) return null;

  const passwordHash = await hashPassword(password);
  const now = Date.now();

  const newUser: Omit<User, "id"> = {
    name,
    email,
    passwordHash,
    joinedAt: now,
    streak: 0,
    preferences: {
      theme: "dark",
      pomodoroTime: 25,
      breakTime: 5,
      dailyStudyGoal: 120,
    },
    plan: "free",
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  };

  const id = await db.users.add(newUser);
  const user = { ...newUser, id };

  for (const subj of DEFAULT_SUBJECTS) {
    await db.subjects.add({
      userId: id,
      name: subj.name,
      category: subj.category,
      color: subj.color,
      icon: subj.icon,
      progress: 0,
      difficulty: 1,
      createdAt: now,
      updatedAt: now,
      totalTasks: 0,
      completedTasks: 0,
      estimatedHours: 0,
      studiedHours: 0,
    });
  }

  return user;
}

export async function loginUser(
  email: string,
  password: string
): Promise<User | null> {
  const passwordHash = await hashPassword(password);
  const user = await db.users
    .where("email")
    .equals(email)
    .and((u) => u.passwordHash === passwordHash)
    .first();

  if (user) {
    const today = new Date().toISOString().split("T")[0];
    await db.users.update(user.id!, {
      lastStudyDate: today,
      updatedAt: Date.now(),
    });
    return { ...user, lastStudyDate: today };
  }

  return null;
}

export async function getCurrentUser(): Promise<User | undefined> {
  return await db.users.where("isActive").equals(1).first();
}

export async function logoutUser(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    await db.users.update(user.id!, { isActive: 0, updatedAt: Date.now() });
  }
}

export async function updateUser(id: number, data: Partial<User>): Promise<void> {
  await db.users.update(id, { ...data, updatedAt: Date.now() });
}
