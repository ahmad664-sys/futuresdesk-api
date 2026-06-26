import { NextResponse } from "next/server"

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}

export async function POST(request: Request) {
    try {
        const { email, name } = await request.json()

        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email is required" },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            )
        }

        const response = await fetch(
            `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    reactivate_existing: true,
                    send_welcome_email: false,
                    source: "api",
                    utm_source: "futuresdesk",
                    custom_fields: [
                        {
                            name: "name",
                            value: name || "",
                        },
                        {
                            name: "subscription_tier",
                            value: "free",
                        },
                    ],
                }),
            }
        )

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: data,
                },
                {
                    status: response.status,
                    headers: corsHeaders,
                }
            )
        }

        return NextResponse.json(
            {
                success: true,
                subscriber: data,
            },
            {
                headers: corsHeaders,
            }
        )
    } catch (error) {
        console.error(error)

        return NextResponse.json(
            {
                success: false,
                message: "Server error",
            },
            {
                status: 500,
                headers: corsHeaders,
            }
        )
    }
}