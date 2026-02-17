
# Prompt 10: Cron Jobs Manager

## Overview
Replace the placeholder `src/pages/CronJobs.tsx` with a full cron job management interface, and add the required API methods to `src/lib/api.ts`.

## Files to Modify

### 1. `src/lib/api.ts`
Add cron job types and six new API methods:

**Types:**
- `CronJobData`: `{ name, scheduleType, expression, payloadType, payload, enabled }`
- `CronJobUpdate`: Partial version of `CronJobData`

**Methods:**
- `getCronJobs()` -- GET `/api/cron/jobs`
- `createCronJob(data)` -- POST `/api/cron/jobs`
- `updateCronJob(jobId, updates)` -- PATCH `/api/cron/jobs/:id`
- `deleteCronJob(jobId)` -- DELETE `/api/cron/jobs/:id`
- `runCronJob(jobId)` -- POST `/api/cron/jobs/:id/run`
- `getCronRuns(jobId)` -- GET `/api/cron/jobs/:id/runs`

### 2. `src/pages/CronJobs.tsx`
Complete rewrite with the following structure:

#### Header
- Page title "Cron Jobs"
- "+ New Job" `Button` that opens the create/edit modal

#### Jobs Table
- Fetched via `useQuery` calling `api.getCronJobs()` with `refetchInterval: 10000`
- Columns: Name, Schedule (type + expression), Status (enabled/disabled toggle badge), Next Run, Last Run, Actions
- **Actions column** with icon buttons:
  - **Run Now**: Calls `api.runCronJob(id)` via `useMutation`, shows toast on success
  - **Edit**: Opens create/edit modal pre-filled with job data
  - **Delete**: Shows `AlertDialog` confirmation, then calls `api.deleteCronJob(id)`
  - **View Runs**: Opens the run history modal
- Loading state: Skeleton rows
- Empty state: "No cron jobs configured" placeholder

#### Create/Edit Job Modal (`Dialog`)
- Controlled by state: `editingJob` (null for create, job object for edit)
- Form fields:
  - **Name**: `Input`
  - **Schedule Type**: `Select` dropdown with options: `cron`, `at`, `every`
  - **Expression**: `Input` with contextual help text (e.g., "*/5 * * * *" for cron)
  - **Payload Type**: `Select` dropdown with options: `agentTurn`, `systemEvent`
  - **Payload**: `Textarea` for message or task text
  - **Enabled**: `Checkbox`
- **Save**: Calls `createCronJob()` or `updateCronJob()` depending on mode, invalidates query
- **Cancel**: Closes modal, resets form

#### View Runs Modal (`Dialog`)
- Shows last 20 runs fetched via `useQuery` calling `api.getCronRuns(jobId)`, enabled only when modal is open
- Table columns: Execution ID, Triggered At, Completed At, Status (badge), Duration
- Click a row to expand and show full output in a collapsible section or nested detail
- Close button

#### State Management
- `useQuery` for jobs list (auto-refresh 10s)
- `useQuery` for run history (conditional, when runs modal is open)
- `useMutation` for create, update, delete, and run-now operations
- Local state for modal visibility, form fields, selected job for editing/viewing runs

## Components Used (all existing)
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`
- `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogTrigger`
- `Button`, `Input`, `Textarea`, `Checkbox`, `Badge`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Skeleton`, `ScrollArea`
- `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` (for run output expansion)
- Lucide icons: `Plus`, `Play`, `Pencil`, `Trash2`, `History`, `Loader2`, `Clock`, `ChevronDown`
- `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query`
- `format`, `formatDistanceToNow` from `date-fns`
- `toast` from `sonner`

## Technical Notes
- The create/edit modal shares one component with form state reset when switching between create and edit modes
- Delete uses `AlertDialog` for confirmation before calling the API
- Run history query uses `enabled: !!viewingRunsJobId` to only fetch when the modal is open
- Schedule help text changes dynamically based on selected schedule type
- Duration in runs table is computed from triggered/completed timestamps if not provided directly
