⚙️ GearGuard – The Ultimate Maintenance Tracker

GearGuard is a modern maintenance management system designed to help organizations track equipment, manage maintenance teams, and handle corrective and preventive maintenance requests through a dynamic, workflow-driven interface.

Built using React + Vite, GearGuard delivers fast performance, a clean UI, and an Odoo-like maintenance experience.

🚀 Tech Stack

Frontend: React

Build Tool: Vite

Language: JavaScript / TypeScript (optional)

UI Concepts: Kanban Board, Calendar View, Smart Buttons

Linting: ESLint

Hot Reloading: Vite HMR

📦 Features Overview
🔧 Equipment Management

Track assets by:

Department

Assigned Employee

Store key details:

Equipment Name & Serial Number

Purchase Date & Warranty

Physical Location

Assign:

Default Maintenance Team

Default Technician

Smart Button:

Maintenance → View all related maintenance requests

Badge shows count of open requests

👨‍🔧 Maintenance Teams

Create specialized teams:

Mechanics

Electricians

IT Support

Assign technicians to teams

Workflow rule:

Only team members can work on assigned requests

🛠️ Maintenance Requests

Supports two types:

Corrective (Breakdowns)

Preventive (Routine Checkups)

Request Lifecycle:

New → In Progress → Repaired → Scrap

Key Fields:

Subject (Issue Description)

Equipment (Auto-fills Team)

Assigned Technician

Scheduled Date

Duration (Hours Spent)

🔄 Workflow Automation
🚨 Breakdown Flow

Any user creates a request

Selecting equipment auto-fills:

Maintenance Team

Equipment details

Status starts as New

Technician assigns and starts work

Status moves to In Progress

On completion:

Log duration

Status moves to Repaired

📅 Preventive Maintenance Flow

Manager schedules a preventive request

Sets a future date

Request appears in:

Calendar View

Technician’s task list

🖥️ User Interface
🗂️ Kanban Board

Columns:

New | In Progress | Repaired | Scrap

Features:

Drag & drop between stages

Technician avatar display

Overdue requests highlighted in red

📆 Calendar View

Displays all preventive maintenance

Click on a date to schedule a new task

📊 Reports (Optional)

Pivot / Graph views:

Requests per Team

Requests per Equipment

🧠 Smart Logic

Auto-fill team based on equipment

Overdue detection using scheduled date

Scrap logic:

When moved to Scrap, equipment is marked unusable

🛠️ Project Setup
npm install
npm run dev

⚡ React + Vite Notes

This project uses the standard React + Vite setup with Fast Refresh.

Available plugins:

@vitejs/plugin-react (Babel-based)

@vitejs/plugin-react-swc (SWC-based, faster builds)

📌 Future Enhancements

Role-based access control

Backend integration (Node / Odoo / Firebase)

Notifications for overdue maintenance

Mobile-friendly UI

📄 License

MIT License

If you want, I can also:

Structure this as a full React folder architecture

Add Kanban + Calendar components

Create dummy JSON / API schema

Help you resolve the Git conflict properly
