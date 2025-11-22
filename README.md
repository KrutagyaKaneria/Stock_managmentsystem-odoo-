StockMaster – Inventory Management System

A full-stack inventory management system inspired by Odoo.
Includes backend (Node.js + Express + Prisma + PostgreSQL) and frontend (React + Vite + Tailwind).
Supports complete warehouse workflows: Receipts, Deliveries, Transfers, Adjustments, Dashboard, Stock Moves.

Features

Multi-warehouse and multi-location structure

Product master with reorder level

Receipt validation (stock increase)

Delivery validation (stock decrease)

Internal transfer (location → location)

Inventory adjustments

StockRecord and StockMove tracking

Dashboard analytics (charts, KPIs, low stock list)

Odoo-style UI design

Tech Stack
Backend

Node.js

Express

Prisma ORM

PostgreSQL

Nodemailer (optional for notifications)

Frontend

React

Vite

TailwindCSS

Axios

Recharts

API Overview
Products
GET    /products
POST   /products
GET    /products/:id
PUT    /products/:id
DELETE /products/:id

Warehouses & Locations
GET  /warehouses
POST /warehouses

GET  /locations
POST /locations

Receipts
GET    /receipts
POST   /receipts
GET    /receipts/:id
PUT    /receipts/:id
POST   /receipts/:id/receive
DELETE /receipts/:id

Deliveries
GET  /deliveries
POST /deliveries
POST /deliveries/:id/validate

Transfers
GET  /transfers
POST /transfers
POST /transfers/:id/validate

Adjustments
POST /adjustments

Dashboard
GET /dashboard
GET /dashboard/low-stock
GET /dashboard/recent-moves
GET /dashboard/warehouse-summary
GET /dashboard/top-products

Folder Structure
Backend
backend/
  src/
    controllers/
    services/
    routes/
    config/
    utils/
    app.js
    server.js
  prisma/
    schema.prisma
  .env

Frontend
frontend/
  src/
    pages/
    components/
    services/
    App.jsx
  public/

Setup
Backend
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev

Frontend
cd frontend
npm install
npm run dev

Basic Workflow

Create warehouse

Create locations

Create products

Create & validate Receipt → stock increases

Create & validate Delivery → stock decreases

Create & validate Transfer → internal move

Create Adjustment → fix stock

Dashboard updates automatically

Stock Rules

Receipts increase stock

Deliveries decrease stock

Transfers move stock between locations

Adjustments overwrite stock with physical count

Every change creates a StockMove entry

Dashboard Data

Total quantity

Low stock list

Warehouse stock distribution

Recent stock moves

Top products

Movement trend chart
