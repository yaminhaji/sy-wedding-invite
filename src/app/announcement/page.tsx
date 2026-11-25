import { redirect } from "next/navigation";

// The announcement now lives at /save-the-date; keep this old link working.
export default function AnnouncementPage() {
  redirect("/save-the-date");
}
