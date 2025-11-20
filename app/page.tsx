"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, ImageIcon, Video, Database, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

type ComplianceStatus = "compliant" | "partially-compliant" | "non-compliant" | "processing"

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  status: "uploading" | "processing" | "completed"
  progress: number
  isoControl?: string
  complianceStatus?: ComplianceStatus
  agentDebate?: string[]
}

export default function AuditDashboard() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      processFiles(selectedFiles)
    }
  }

  const processFiles = async (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      status: "uploading",
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Simulate file upload and processing
    for (const newFile of newFiles) {
      // Upload simulation
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        setFiles((prev) => prev.map((f) => (f.id === newFile.id ? { ...f, progress: i } : f)))
      }

      // Update to processing
      setFiles((prev) => prev.map((f) => (f.id === newFile.id ? { ...f, status: "processing" } : f)))

      // Simulate ChromaDB ingestion and agent processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock ISO control assignment and compliance result
      const controls = ["A.5.1", "A.8.2", "A.12.1", "A.14.2", "A.18.1"]
      const statuses: ComplianceStatus[] = ["compliant", "partially-compliant", "non-compliant"]

      setFiles((prev) =>
        prev.map((f) =>
          f.id === newFile.id
            ? {
                ...f,
                status: "completed",
                progress: 100,
                isoControl: controls[Math.floor(Math.random() * controls.length)],
                complianceStatus: statuses[Math.floor(Math.random() * statuses.length)],
                agentDebate: [
                  "Agent A: Strong evidence of access controls",
                  "Agent B: Missing audit trail documentation",
                  "Judge: Partially compliant due to incomplete logs",
                ],
              }
            : f,
        ),
      )
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5" />
    if (type.startsWith("video/")) return <Video className="h-5 w-5" />
    if (type.includes("pdf") || type.includes("document")) return <FileText className="h-5 w-5" />
    if (type.includes("csv") || type.includes("spreadsheet")) return <Database className="h-5 w-5" />
    return <FileText className="h-5 w-5" />
  }

  const getComplianceIcon = (status?: ComplianceStatus) => {
    switch (status) {
      case "compliant":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      case "partially-compliant":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "non-compliant":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "processing":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      default:
        return null
    }
  }

  const getComplianceBadge = (status?: ComplianceStatus) => {
    const variants = {
      compliant: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      "partially-compliant": "bg-amber-500/10 text-amber-500 border-amber-500/20",
      "non-compliant": "bg-red-500/10 text-red-500 border-red-500/20",
      processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    }

    const labels = {
      compliant: "Compliant",
      "partially-compliant": "Partially Compliant",
      "non-compliant": "Non-Compliant",
      processing: "Processing",
    }

    if (!status) return null

    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-lg font-bold text-white">IA</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">IntelliAudit</h1>
                <p className="text-sm text-muted-foreground">ISO 27001 Compliance Platform</p>
              </div>
            </div>
            <Button variant="outline">View Reports</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Upload Area */}
        <Card className="mb-8 border-2 border-dashed border-border">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-12 text-center transition-colors ${isDragging ? "bg-accent/50" : "bg-card"}`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Upload Evidence Files</h3>
            <p className="mt-2 text-sm text-muted-foreground">Drop your screenshots, PDFs, CSVs, or videos here</p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <label htmlFor="file-upload">
                <Button asChild>
                  <span className="cursor-pointer">
                    Choose Files
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.csv,.xlsx,.xls"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </span>
                </Button>
              </label>
              <span className="text-sm text-muted-foreground">or drag and drop</span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Supported: PNG, JPG, PDF, CSV, MP4, MOV (max 100MB)</p>
          </div>
        </Card>

        {/* Files List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Uploaded Evidence ({files.length})</h2>
            <div className="space-y-3">
              {files.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        {getFileIcon(file.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-medium text-foreground">{file.name}</h3>
                            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {file.isoControl && (
                              <Badge variant="secondary" className="font-mono">
                                {file.isoControl}
                              </Badge>
                            )}
                            {getComplianceBadge(file.complianceStatus)}
                          </div>
                        </div>

                        {file.status !== "completed" && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {file.status === "uploading" ? "Uploading..." : "Processing with AI agents..."}
                              </span>
                              <span className="text-muted-foreground">{file.progress}%</span>
                            </div>
                            <Progress value={file.progress} className="mt-2" />
                          </div>
                        )}

                        {file.status === "completed" && file.agentDebate && (
                          <div className="mt-4 rounded-lg bg-muted/50 p-3">
                            <div className="mb-2 flex items-center gap-2">
                              {getComplianceIcon(file.complianceStatus)}
                              <span className="text-sm font-medium text-foreground">Agent Analysis</span>
                            </div>
                            <div className="space-y-1">
                              {file.agentDebate.map((debate, idx) => (
                                <p key={idx} className="text-xs text-muted-foreground">
                                  {debate}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {files.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <Database className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No evidence uploaded yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your first document to begin the compliance assessment
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
