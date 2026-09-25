import SignOutButton from "@/features/auth/components/SignOutButton"

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

export default function Header({ menuOpen = false, onMenuClick }) {
  return (
    <header className="border-bottom bg-white px-3 px-md-4 py-2 py-md-3 d-flex align-items-center gap-2 gap-md-3">
      <button
        type="button"
        className="btn btn-outline-secondary d-md-none d-inline-flex align-items-center justify-content-center"
        aria-label="Open menu"
        aria-expanded={menuOpen}
        aria-controls="app-sidebar"
        onClick={onMenuClick}
      >
        <MenuIcon />
      </button>
      <h1 className="h5 mb-0 text-truncate flex-grow-1">Itinerary System</h1>
      <SignOutButton />
    </header>
  )
}
