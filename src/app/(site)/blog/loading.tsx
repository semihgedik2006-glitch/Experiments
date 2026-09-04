import { Container } from "@/components/ui/container";

export default function BlogLoading() {
  return (
    <>
      <section className="border-b border-border py-20">
        <Container>
          <div className="h-12 w-64 animate-pulse rounded-lg bg-surface" />
          <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-surface" />
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-3 w-24 animate-pulse rounded bg-surface" />
                <div className="mt-4 h-5 w-full animate-pulse rounded bg-surface" />
                <div className="mt-2 h-5 w-2/3 animate-pulse rounded bg-surface" />
                <div className="mt-4 h-3 w-full animate-pulse rounded bg-surface" />
                <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-surface" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
