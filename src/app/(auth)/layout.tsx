export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-pam-cream">
      <div className="pam-container">
        {children}
      </div>
    </div>
  )
}