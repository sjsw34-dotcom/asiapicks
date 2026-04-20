export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  const body = "google.com, pub-7581203537914853, DIRECT, f08c47fec0942fa0\n";
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
