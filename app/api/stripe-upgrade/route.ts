import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

const corsHeaders = {
    "Access-Control-Allow-Origin": "https://voluntary-jupiter-409713.framer.app",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    })
}

export async function GET() {
    return NextResponse.json(
        { ok: true, message: "Stripe upgrade API is live" },
        { status: 200, headers: corsHeaders }
    )
}

export async function POST(req: NextRequest) {
    try {
        const { customerId, returnUrl } = await req.json()

        if (!customerId) {
            return NextResponse.json(
                { error: "Missing customerId" },
                { status: 400, headers: corsHeaders }
            )
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url:
                returnUrl || "https://voluntary-jupiter-409713.framer.app/dashboard",
            configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID!,
        })

        return NextResponse.json(
            { url: session.url },
            { status: 200, headers: corsHeaders }
        )
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Unknown Stripe error"

        console.error("Stripe portal error:", error)

        return NextResponse.json(
            {
                error: "Failed to create portal session",
                message,
            },
            { status: 500, headers: corsHeaders }
        )
    }
}