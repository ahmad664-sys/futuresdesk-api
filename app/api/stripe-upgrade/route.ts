import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
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
            return_url: returnUrl || "https://futuresdesk.io/dashboard",
            configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID!,
        })

        return NextResponse.json(
            { url: session.url },
            { headers: corsHeaders }
        )
    } catch (error: any) {
        return NextResponse.json(
            {
                error: "Failed to create portal session",
                message: error?.message,
            },
            { status: 500, headers: corsHeaders }
        )
    }
}