export async function GET() {
  const data = { name: 'Hello, result!' }

  return Response.json(data)
}
