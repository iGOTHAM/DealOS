"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>

            <Tabs defaultValue="billing" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="billing">Billing & Plans</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" defaultValue="King James" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" defaultValue="admin@dealos.com" disabled />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save Changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="billing" className="space-y-6">
                    {/* Current Plan */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle>Current Plan</CardTitle>
                                <CardDescription>You are currently on the <span className="font-semibold text-primary">Pro Plan</span>.</CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-primary bg-primary/10">Active</Badge>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center space-x-4 rounded-md border p-4">
                                <CreditCard />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Visa ending in 4242</p>
                                    <p className="text-sm text-muted-foreground">Expires 12/2028</p>
                                </div>
                                <Button variant="outline" size="sm">Update</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing Plans */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Starter */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Starter</CardTitle>
                                <CardDescription>For individuals just getting started.</CardDescription>
                                <div className="mt-4 text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> 1 User</li>
                                    <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> 3 Active Deals</li>
                                    <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Basic AI Models</li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="outline">Downgrade</Button>
                            </CardFooter>
                        </Card>

                        {/* Pro */}
                        <Card className="border-primary shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                            <CardHeader>
                                <CardTitle>Pro</CardTitle>
                                <CardDescription>For professionals closing deals.</CardDescription>
                                <div className="mt-4 text-3xl font-bold">$49<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> 5 Users</li>
                                    <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Unlimited Deals</li>
                                    <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Advanced AI (Claude 3.5, GPT-4)</li>
                                    <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Custom Templates</li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" disabled>Current Plan</Button>
                            </CardFooter>
                        </Card>

                        {/* Enterprise */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Enterprise</CardTitle>
                                <CardDescription>For large firms and teams.</CardDescription>
                                <div className="mt-4 text-3xl font-bold">Custom</div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Unlimited Users</li>
                                    <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> SSO & Data Controls</li>
                                    <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Dedicated Success Manager</li>
                                    <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> APIs & Webhooks</li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="outline">Contact Sales</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
