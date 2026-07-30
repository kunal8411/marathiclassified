import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { connectDb } from "@/lib/db/connect";
import { setAuthCookies } from "@/lib/auth/session";
import { UserModel } from "@/models/User";
import * as userRepo from "@/repositories/user.repository";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_ACCESS_SECRET,
  providers:
    googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : [],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      await connectDb();

      const email = profile?.email?.trim().toLowerCase();
      const googleId = account.providerAccountId;
      if (!email || !googleId) {
        return false;
      }

      const name =
        (profile?.name as string | undefined)?.trim() ||
        email.split("@")[0] ||
        "User";
      const image =
        (profile as { picture?: string }).picture ??
        (typeof profile?.image === "string" ? profile.image : undefined);

      let user =
        (await userRepo.findByGoogleId(googleId)) ??
        (await userRepo.findByEmail(email));

      if (user) {
        user =
          (await userRepo.updateById(user.id, {
            image: image ?? user.image,
            lastActiveAt: new Date(),
          })) ?? user;
        if (!user.googleId) {
          await UserModel.findByIdAndUpdate(user.id, { $set: { googleId } });
          user = (await userRepo.findById(user.id)) ?? user;
        }
      } else {
        user = await userRepo.create({
          name,
          email,
          googleId,
          image,
          emailVerifiedAt: new Date(),
        });
      }

      if (user.isBanned) {
        return false;
      }

      await setAuthCookies({
        sub: user.id,
        role: user.role,
        email: user.email ?? undefined,
        phone: user.phone ?? undefined,
      });

      return true;
    },
  },
});
