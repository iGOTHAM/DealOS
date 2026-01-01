
import { createClient } from "@/lib/supabase/server"
// import { formatDistanceToNow } from "date-fns"
import { FileText } from "lucide-react"

export async function DocumentList({ dealId }: { dealId: string }) {
    const supabase = await createClient()
    const { data: documents } = await supabase
        .from('documents')
        .select('*, document_versions(status, created_at)')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })

    if (!documents || documents.length === 0) {
        return <div className="text-muted-foreground text-sm p-4">No documents uploaded yet.</div>
    }

    return (
        <div className="space-y-2 mt-4">
            {documents.map((doc) => {
                const latestVersion = doc.document_versions?.[0]
                return (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.type}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-medium capitalize">
                                {latestVersion?.status || "Unknown"}
                            </p>
                            {latestVersion?.created_at && (
                                <p className="text-xs text-muted-foreground">
                                    {/* {formatDistanceToNow(new Date(latestVersion.created_at))} ago */}
                                    {new Date(latestVersion.created_at).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
