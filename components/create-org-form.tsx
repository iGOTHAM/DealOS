"use client"

import { useState, useTransition } from "react"
import { createOrganization } from "@/app/(dashboard)/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Building2, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function CreateOrgForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const result = await createOrganization(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <Card className="w-full max-w-md border-zinc-200/50 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Decorative gradient blob */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />

            <CardHeader className="text-center relative z-10">
                <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-2xl w-fit">
                    <Building2 className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                    Create Workspace
                </CardTitle>
                <CardDescription>
                    Establish your organization to begin managing deals.
                </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Organization Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Acme Capital"
                            required
                            className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md font-medium">
                            {error}
                        </div>
                    )}
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 transition-all duration-300 transform hover:-translate-y-0.5"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Organization"
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center border-t border-zinc-100 dark:border-zinc-800/50 pt-6 relative z-10">
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </CardFooter>
        </Card>
    )
}
