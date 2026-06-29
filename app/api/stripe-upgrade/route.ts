import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export async function POST(req: NextRequest) {
    try {
        const { customerId, returnUrl } = await req.json()

        if (!customerId) {
            return NextResponse.json(
                { error: "Missing customerId" },
                { status: 400 }
            )
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || "https://futuresdesk.io/dashboard",
            configuration: "bpc_1TgqfMBTQUOghBdWkQppUQ0j",
        })

        return NextResponse.json({ url: session.url })
} catch (error: any) {
    console.error("Stripe portal error:", error)

    return NextResponse.json(
        {
            error: "Failed to create portal session",
            message: error?.message,
        },
        { status: 500 }
    )
}
}