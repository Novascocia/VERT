import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  console.log("🏥 Health check API called");
  return NextResponse.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    message: "Basic API routing works!"
  });
}

export async function POST(request: NextRequest) {
  console.log("🏥 Health check POST called");
  const body = await request.json();
  console.log("📝 Received body:", body);
  
  return NextResponse.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    message: "POST API routing works!",
    received: body
  });
} 