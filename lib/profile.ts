
import { verifyPassword, updateUserPassword, getUserById } from './database'

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  // Get user from database
  const user = await getUserById(userId)
  if (!user) {
    throw new Error("User not found")
  }

  // For Google users, they shouldn't be able to change password
  if (user.provider === 'google') {
    throw new Error("Google users cannot change password. Please manage your password through your Google account.")
  }

  // Verify current password
  const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password_hash || '')
  if (!isCurrentPasswordValid) {
    throw new Error("Current password is incorrect")
  }

  // Update password
  await updateUserPassword(userId, newPassword)
}
