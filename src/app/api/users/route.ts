import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { name, number, email } = await req.json();

    if (!name || !number || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    const user = new User({ name, number, email });
    await user.save();

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("❌ Error saving user:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
