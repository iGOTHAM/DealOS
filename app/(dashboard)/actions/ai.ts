"use server"

import { runLLM } from "@/lib/llm/llm"
import { createClient } from "@/lib/supabase/server"

// Type for the Template structure from your frontend/DB
interface Template {
    id: string
    name: string
    type: string
    isDefault?: boolean
    filePath?: string
}

// Helper to fetch and parse documents
async function getDealContext(dealId: string, supabase: any) {
    // 1. Get Deal Metadata
    const { data: deal } = await supabase
        .from('deals')
        .select('name, description')
        .eq('id', dealId)
        .single()

    if (!deal) return null

    // 2. Get Documents
    const { data: docs } = await supabase
        .from('documents')
        .select(`
            id, name, type,
            document_versions(file_path, status)
        `)
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })

    let context = `Deal Name: ${deal.name}\nDescription: ${deal.description || "N/A"}\n\n### ASSINGED SOURCES ###\n`

    if (!docs || docs.length === 0) {
        return context + "(No documents uploaded yet.)"
    }

    const { createAdminClient } = require("@/lib/supabase/admin")
    const admin = createAdminClient()

    for (const doc of docs) {
        if (!doc.document_versions?.[0]) continue

        const fileVer = doc.document_versions[0]
        context += `\n--- SOURCE: ${doc.name} ---\n`

        try {
            // Download
            const { data: fileData, error: dlError } = await admin.storage
                .from('deal_documents')
                .download(fileVer.file_path)

            if (dlError || !fileData) {
                console.error("Download failed", dlError)
                continue
            }

            const buffer = Buffer.from(await fileData.arrayBuffer())

            // Parse based on type
            if (doc.type === 'PDF' || doc.name.endsWith('.pdf')) {
                const pdf = require('pdf-parse')
                const pdfData = await pdf(buffer)
                context += pdfData.text.substring(0, 20000) // Limit per file for now
            } else if (doc.type === 'DOCX' || doc.name.endsWith('.docx')) {
                const mammoth = require('mammoth')
                const result = await mammoth.extractRawText({ buffer })
                context += result.value.substring(0, 20000)
            } else {
                context += "[Unsupported text format]"
            }
        } catch (e) {
            console.error("Parsing failed for", doc.name, e)
            context += "[Error reading file]"
        }
    }

    return context
}

export async function generateOutput(dealId: string, template: Template, modelOverride?: string) {
    const supabase = await createClient()
    const dealContext = await getDealContext(dealId, supabase)

    if (!dealContext) return { error: "Deal not found or context failed" }

    // 2. prompt Construction
    const systemPrompt = `You are a Private Equity Associate AI. 
    Your goal is to generate a "${template.name}" based on the provided deal context.
    
    Output Format:
    ${template.type === 'excel' ? 'Respond with a JSON object representing key financial inputs for an Excel model.' : 'Respond in Markdown.'}
    
    Tone: Professional, direct, and risk-aware.`

    const userPrompt = `
    Please fill out the following template using the context below.

    Template Name: ${template.name}
    Template Type: ${template.type}
    
    If the template is "Financial Deep Dive" or "IC Memo", structure the output with clear headers.
    `

    // 3. Call LLM
    try {
        const result = await runLLM({
            taskType: "generate_output",
            systemPrompt,
            userPrompt,
            retrievedContext: dealContext, // Pass our deal data
            temperature: 0.4,
            modelOverride
        })

        return { success: true, text: result.text }
    } catch (error) {
        console.error("AI Generation Failed:", error)
        return { error: "Failed to generate output. Please check your API key." }
    }
}
