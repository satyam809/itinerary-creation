import SignOutButton from "@/features/auth/components/SignOutButton"

export default function Header() {
  return (
    <header className="border-bottom bg-white px-4 py-3 d-flex align-items-center justify-content-between">
      <h1 className="h5 mb-0">Itinerary System</h1>
      <SignOutButton />
    </header>
  )
}
