interface PaginationProps {
  current: number
  total: number
  onChange: (page: number) => void
}

export default function Pagination({ current, total, onChange }: PaginationProps) {
  if (total <= 1) return null

  const pages: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)

    if (current > 3) pages.push("...")

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) pages.push(i)

    if (current < total - 2) pages.push("...")

    pages.push(total)
  }

  const changePage = (p: number) => {
    onChange(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        marginTop: 32
      }}
    >
      {/* Prev */}
      <button
        onClick={() => changePage(current - 1)}
        disabled={current === 1}
        style={{
          padding: "8px 16px",
          borderRadius: 12,
          border: "1.5px solid #e5e7eb",
          background: current === 1 ? "#f9fafb" : "#fff",
          color: current === 1 ? "#d1d5db" : "#374151",
          cursor: current === 1 ? "not-allowed" : "pointer",
          fontSize: 14,
          fontWeight: 500,
          transition: "all 0.2s ease"
        }}
      >
        ← ก่อนหน้า
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} style={{ padding: "0 6px", color: "#9ca3af" }}>
            ...
          </span>
        ) : (
          <button
            key={`${p}-${i}`}
            onClick={() => changePage(p as number)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              border: "1.5px solid",
              borderColor: p === current ? "#059669" : "#e5e7eb",
              background: p === current ? "#059669" : "#fff",
              color: p === current ? "#fff" : "#374151",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: p === current ? 700 : 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              if (p !== current) {
                e.currentTarget.style.background = "#ecfdf5"
                e.currentTarget.style.borderColor = "#059669"
                e.currentTarget.style.transform = "scale(1.08)"
              }
            }}
            onMouseLeave={(e) => {
              if (p !== current) {
                e.currentTarget.style.background = "#fff"
                e.currentTarget.style.borderColor = "#e5e7eb"
                e.currentTarget.style.transform = "scale(1)"
              }
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.92)"
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1.05)"
            }}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => changePage(current + 1)}
        disabled={current === total}
        style={{
          padding: "8px 16px",
          borderRadius: 12,
          border: "1.5px solid #e5e7eb",
          background: current === total ? "#f9fafb" : "#fff",
          color: current === total ? "#d1d5db" : "#374151",
          cursor: current === total ? "not-allowed" : "pointer",
          fontSize: 14,
          fontWeight: 500,
          transition: "all 0.2s ease"
        }}
      >
        ถัดไป →
      </button>
    </div>
  )
}