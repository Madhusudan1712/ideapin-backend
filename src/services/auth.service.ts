export interface UserProfile {
  id: string;
  email: string;
}

export class AuthService {
  /**
   * Fetches the current authenticated user's profile.
   * Currently directly returns the information, to be extended with DB queries in future phases.
   */
  public async fetchCurrentUserProfile(id: string, email: string): Promise<UserProfile> {
    return { id, email };
  }
}
