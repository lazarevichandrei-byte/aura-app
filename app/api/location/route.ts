import { NextResponse } from "next/server";

export async function GET(request: Request) {

  const ip =
    request.headers
      .get("x-forwarded-for")
      ?.split(",")[0];

  const response = await fetch(
    `https://ipapi.co/${ip}/json/`
  );

  const data = await response.json();

  return NextResponse.json({
    city: data.city || "",
    country: data.country_name || ""
  });

}