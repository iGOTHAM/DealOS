
import { DealForm } from "@/components/deal/deal-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewDealPage({ params }: { params: { orgId: string } }) {
    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Deal</CardTitle>
                    <CardDescription>Enter the basic information to start tracking a new opportunity.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DealForm orgId={params.orgId} />
                </CardContent>
            </Card>
        </div>
    )
}
