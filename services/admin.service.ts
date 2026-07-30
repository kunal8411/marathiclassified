import { UserModel } from "@/models/User";
import * as adRepo from "@/repositories/ad.repository";
import * as messageRepo from "@/repositories/message.repository";
import * as reportRepo from "@/repositories/report.repository";

export type AdminAnalytics = {
  users: number;
  adsByStatus: Partial<Record<string, number>>;
  openReports: number;
  messagesToday: number;
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function analytics(): Promise<AdminAnalytics> {
  const [users, adsByStatus, openReports, messagesToday] = await Promise.all([
    UserModel.countDocuments(),
    adRepo.countByStatus(),
    reportRepo.countOpen(),
    messageRepo.countSince(startOfToday()),
  ]);

  return {
    users,
    adsByStatus,
    openReports,
    messagesToday,
  };
}
