import Link from "next/link";

export default function Sidebar() {
  return (
    <aside>
      <nav>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/users">Users</Link>
        <Link href="/settings">Settings</Link>
      </nav>
    </aside>
  );
}
