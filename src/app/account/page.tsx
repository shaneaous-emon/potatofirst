import type { Metadata } from "next";
import { AccountView } from "@/components/account/account-view";
import { PageTitle } from "@/components/common/page-title";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };

/** Customer login / sign up (phone, email, Google, Facebook) and dashboard. Guest checkout stays available. */
export default function AccountPage() {
  return (
    <>
      <PageTitle crumbs={[{ label: "My Account" }]} title="My Account" />
      <div className="container-site pt-8 lg:pt-10">
        <AccountView />
      </div>
    </>
  );
}
