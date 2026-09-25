import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import { authOptions } from "@/services/auth"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const { id, name, email, image } = session.user

  const details = [
    { label: "User ID", value: id },
    { label: "Name", value: name },
    { label: "Email", value: email },
    { label: "Profile Image URL", value: image },
  ]

  return (
    <main className="p-4">
      <h1 className="h3 mb-4">Settings</h1>

      <section className="mb-4">
        <h2 className="h5 mb-3">Account Details</h2>
        <div className="d-flex align-items-center gap-3 mb-4">
          {image ? (
            <Image
              src={image}
              alt={name || "User"}
              width={72}
              height={72}
              className="rounded-circle"
            />
          ) : (
            <div
              className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
              style={{ width: 72, height: 72, fontSize: "1.5rem" }}
            >
              {(name || email || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="h5 mb-0">{name || "—"}</p>
            <p className="text-muted mb-0">{email || "—"}</p>
          </div>
        </div>

        <dl className="row mb-0">
          {details.map(({ label, value }) => (
            <div key={label} className="col-12 col-md-6 mb-3">
              <dt className="text-muted small text-uppercase mb-1">{label}</dt>
              <dd className="mb-0 text-break">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  )
}
