import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      avatar?: string | null
    }
  }

  interface User {
    id: string
    email: string
    username: string
    avatar?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string
    avatar?: string | null
  }
}
