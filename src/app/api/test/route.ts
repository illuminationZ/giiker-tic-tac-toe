/* eslint-disable react-hooks/rules-of-hooks */
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({ message: "Hello from the test route!" });
}
