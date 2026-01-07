'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShieldCheck, Sun, Waves } from "lucide-react";

const healthAndSafetyTips = [
    {
        "icon": Sun,
        "title": "Stay Hydrated",
        "description": "Drink plenty of water throughout the day. Look for free water refill stations across the festival grounds. It gets hot during the day!",
        "color": "text-blue-400"
    },
    {
        "icon": ShieldCheck,
        "title": "Pace Yourself",
        "description": "It's a marathon, not a sprint. Don't forget to rest and sleep to keep your energy levels up for the whole festival.",
        "color": "text-yellow-400"
    },
    {
        "icon": Waves,
        "title": "First Aid",
        "description": "First aid stations are clearly marked on the festival map. Don't hesitate to visit them if you or a friend feels unwell.",
        "color": "text-red-400"
    },
    {
        "icon": DollarSign,
        "title": "Look After Your Valuables",
        "description": "Keep your phone, wallet, and other valuables in a secure, zipped pocket or bag. Consider using on-site lockers.",
        "color": "text-green-400"
    }
]

export default function HealthPage() {
    return (
        <div>
            <header className="mb-8">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Health & Safety</h1>
                <p className="mt-2 text-muted-foreground">Essential tips for a safe and enjoyable festival experience.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {healthAndSafetyTips.map(tip => (
                    <Card key={tip.title}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <tip.icon className={`h-8 w-8 ${tip.color}`} />
                            <CardTitle>{tip.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{tip.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}