import type { Metadata } from "next";
import { MemberDirectory } from "@/components/MemberDirectory";
import { PageTitle } from "@/components/ui";
import { getMembers } from "@/lib/data";

export const metadata: Metadata = { title: "選手名鑑" };

export default async function MembersPage() {
  const members = await getMembers();
  return (
    <>
      <PageTitle title="MEMBERS" sub="選手・スタッフ紹介" />
      <MemberDirectory members={members} />
    </>
  );
}
