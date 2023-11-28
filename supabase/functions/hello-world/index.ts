console.log('Hello from Functions!')

Deno.serve(async (req) => {
  console.log("Payload Received");
  const payload = await req.json();
  console.log(payload);
  return new Response(JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } })
});
