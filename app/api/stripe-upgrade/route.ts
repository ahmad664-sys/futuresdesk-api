import { NextRequest } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

const corsHeaders = {
    "Access-Control-Allow-Origin": "https://voluntary-jupiter-409713.framer.app",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

function jsonResponse(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
        },
    })
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    })
}

export async function POST(req: NextRequest) {
    try {
        const { customerId, returnUrl } = await req.json()

        if (!customerId) {
            return jsonResponse({ error: "Missing customerId" }, 400)
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url:
                returnUrl || "https://voluntary-jupiter-409713.framer.app/dashboard",
            configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID!,
        })

        return jsonResponse({ url: session.url })
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Unknown Stripe error"

        console.error("Stripe portal error:", error)

        return jsonResponse(
            {
                error: "Failed to create portal session",
                message,
            },
            500
        )
    }
}