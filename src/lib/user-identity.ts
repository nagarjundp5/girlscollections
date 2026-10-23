import { firestoreService } from '@/lib/firestore';

export interface FirestoreUser {
  id: string; // Primary Internal User ID (e.g. 'usr_123456789')
  clerk_id: string | null; // Clerk Google OAuth User ID
  verified_phone: string | null; // Verified E.164 phone number (e.g. '+919876543210')
  email: string | null;
  full_name: string | null;
  linked_providers: ('google' | 'phone')[]; // ['google'], ['phone'], or ['google', 'phone']
  created_at: string; // ISO Timestamp
  updated_at: string; // ISO Timestamp
  merged_into?: string | null; // If merged into another primary user ID
  is_active: boolean; // true (default) or false if merged
}

const USERS_COLLECTION = 'users';

/**
 * Generate a unique internal user ID.
 */
export function generateUserId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `usr_${timestamp}${randomStr}`;
}

/**
 * Find user document in Firestore by Clerk ID.
 */
export async function findUserByClerkId(clerkId: string): Promise<FirestoreUser | null> {
  if (!clerkId) return null;
  const docs = await firestoreService.queryDocs(USERS_COLLECTION, {
    where: [{ field: 'clerk_id', op: '==', value: clerkId }],
  });
  if (docs && docs.length > 0) {
    return docs[0] as FirestoreUser;
  }
  return null;
}

/**
 * Find user document in Firestore by verified phone number.
 */
export async function findUserByPhone(phone: string): Promise<FirestoreUser | null> {
  if (!phone) return null;
  const docs = await firestoreService.queryDocs(USERS_COLLECTION, {
    where: [{ field: 'verified_phone', op: '==', value: phone }],
  });
  if (docs && docs.length > 0) {
    return docs[0] as FirestoreUser;
  }
  return null;
}

/**
 * Find user document in Firestore by email.
 */
export async function findUserByEmail(email: string): Promise<FirestoreUser | null> {
  if (!email) return null;
  const docs = await firestoreService.queryDocs(USERS_COLLECTION, {
    where: [{ field: 'email', op: '==', value: email }],
  });
  if (docs && docs.length > 0) {
    return docs[0] as FirestoreUser;
  }
  return null;
}

/**
 * Create or update user from Google OAuth (Clerk).
 */
export async function createOrUpdateUserFromGoogle(params: {
  clerkId: string;
  email: string;
  fullName?: string;
  activeUserId?: string;
}): Promise<FirestoreUser> {
  const now = new Date().toISOString();

  // 1. Check if user with this clerk_id already exists
  let existing = await findUserByClerkId(params.clerkId);
  if (existing) {
    const updated: Partial<FirestoreUser> = {
      email: params.email || existing.email,
      full_name: params.fullName || existing.full_name,
      updated_at: now,
    };
    await firestoreService.updateDoc(USERS_COLLECTION, existing.id, updated);
    return { ...existing, ...updated };
  }

  // 2. Check if user with this email exists
  if (params.email) {
    existing = await findUserByEmail(params.email);
    if (existing) {
      const providers = Array.from(new Set([...existing.linked_providers, 'google']));
      const updated: Partial<FirestoreUser> = {
        clerk_id: params.clerkId,
        full_name: params.fullName || existing.full_name,
        linked_providers: providers as ('google' | 'phone')[],
        updated_at: now,
      };
      await firestoreService.updateDoc(USERS_COLLECTION, existing.id, updated);
      return { ...existing, ...updated };
    }
  }

  // 3. Create new Google user
  const newId = generateUserId();
  const newUser: FirestoreUser = {
    id: newId,
    clerk_id: params.clerkId,
    verified_phone: null,
    email: params.email || null,
    full_name: params.fullName || null,
    linked_providers: ['google'],
    created_at: now,
    updated_at: now,
    is_active: true,
  };

  await firestoreService.setDoc(USERS_COLLECTION, newId, newUser);
  return newUser;
}

/**
 * Create or update user from phone.email verification.
 */
export async function createOrUpdateUserFromPhone(params: {
  phone: string;
  activeUserId?: string;
}): Promise<FirestoreUser> {
  const now = new Date().toISOString();

  // 1. Check if phone is already registered to an existing user
  const existingByPhone = await findUserByPhone(params.phone);

  // If user is currently logged in with activeUserId
  if (params.activeUserId) {
    const activeUserDoc = await firestoreService.getDoc(USERS_COLLECTION, params.activeUserId);

    if (activeUserDoc) {
      if (existingByPhone && existingByPhone.id !== activeUserDoc.id) {
        // CONFLICT: Phone belongs to User B, but User A is attempting to verify it.
        // Merge User B into User A (Active Primary)
        return await mergeAccounts(activeUserDoc.id, existingByPhone.id, params.phone);
      }

      // Link phone to active user
      const providers = Array.from(new Set([...activeUserDoc.linked_providers, 'phone']));
      const updated: Partial<FirestoreUser> = {
        verified_phone: params.phone,
        linked_providers: providers as ('google' | 'phone')[],
        updated_at: now,
      };
      await firestoreService.updateDoc(USERS_COLLECTION, activeUserDoc.id, updated);
      return { ...activeUserDoc, ...updated };
    }
  }

  if (existingByPhone) {
    const updated: Partial<FirestoreUser> = {
      updated_at: now,
    };
    await firestoreService.updateDoc(USERS_COLLECTION, existingByPhone.id, updated);
    return { ...existingByPhone, ...updated };
  }

  // Create new phone user
  const newId = generateUserId();
  const newUser: FirestoreUser = {
    id: newId,
    clerk_id: null,
    verified_phone: params.phone,
    email: null,
    full_name: null,
    linked_providers: ['phone'],
    created_at: now,
    updated_at: now,
    is_active: true,
  };

  await firestoreService.setDoc(USERS_COLLECTION, newId, newUser);
  return newUser;
}

/**
 * Merge secondary user account into primary user account.
 */
export async function mergeAccounts(
  primaryUserId: string,
  secondaryUserId: string,
  verifiedPhoneOverride?: string
): Promise<FirestoreUser> {
  const now = new Date().toISOString();
  const primaryDoc = await firestoreService.getDoc(USERS_COLLECTION, primaryUserId);
  const secondaryDoc = await firestoreService.getDoc(USERS_COLLECTION, secondaryUserId);

  if (!primaryDoc) throw new Error(`Primary user ${primaryUserId} not found`);
  if (!secondaryDoc) return primaryDoc;

  // Merge fields
  const mergedProviders = Array.from(
    new Set([...(primaryDoc.linked_providers || []), ...(secondaryDoc.linked_providers || [])])
  );

  const updatedPrimary: Partial<FirestoreUser> = {
    clerk_id: primaryDoc.clerk_id || secondaryDoc.clerk_id,
    verified_phone: verifiedPhoneOverride || primaryDoc.verified_phone || secondaryDoc.verified_phone,
    email: primaryDoc.email || secondaryDoc.email,
    full_name: primaryDoc.full_name || secondaryDoc.full_name,
    linked_providers: mergedProviders as ('google' | 'phone')[],
    updated_at: now,
  };

  await firestoreService.updateDoc(USERS_COLLECTION, primaryUserId, updatedPrimary);

  // Soft-delete secondary user doc
  await firestoreService.updateDoc(USERS_COLLECTION, secondaryUserId, {
    is_active: false,
    merged_into: primaryUserId,
    updated_at: now,
  });

  return { ...primaryDoc, ...updatedPrimary };
}
