import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { supabase } from "./supabase";

// ============================================================
// GAJIBN - Know Your Worth 🇧🇳
// Brunei's Salary & Career Intelligence Platform
// ============================================================

// --- REAL DATA: DEPS Labour Force Survey 2024 + MPEC Salary Guideline 2023 Edition ---

// Source: DEPS Labour Force Survey 2024, Table 3.5 (Mean Monthly Income by Economic Activity)
// National avg: BND 1,686 | Local: BND 1,879 | Non-Local: BND 1,208
// Public sector avg: BND 2,122 | Private sector avg: BND 1,497
const SALARY_BY_INDUSTRY = [
  { industry: "Mining & Quarrying (O&G)", avg: 3800, local: 4100, foreign: 2200, icon: "⛽", employed: 7200 },
  { industry: "Finance & Insurance", avg: 3100, local: 3200, foreign: 2600, icon: "🏦", employed: 5200 },
  { industry: "Public Administration", avg: 2122, local: 2140, foreign: 1800, icon: "🏛️", employed: 41600 },
  { industry: "Education", avg: 2050, local: 2100, foreign: 1550, icon: "📚", employed: 20400 },
  { industry: "Health & Social Work", avg: 2000, local: 2100, foreign: 1450, icon: "🏥", employed: 8800 },
  { industry: "ICT", avg: 1900, local: 2000, foreign: 1350, icon: "💻", employed: 4500 },
  { industry: "Professional & Admin Services", avg: 1650, local: 1850, foreign: 1100, icon: "💼", employed: 15500 },
  { industry: "Transport & Storage", avg: 1350, local: 1450, foreign: 900, icon: "🚗", employed: 6600 },
  { industry: "Construction", avg: 1300, local: 1700, foreign: 850, icon: "🏗️", employed: 24600 },
  { industry: "Manufacturing", avg: 1200, local: 1450, foreign: 780, icon: "🏭", employed: 15400 },
  { industry: "Wholesale & Retail", avg: 1150, local: 1350, foreign: 700, icon: "🛒", employed: 28400 },
  { industry: "Accommodation & Food", avg: 1000, local: 1150, foreign: 650, icon: "🍽️", employed: 21000 },
  { industry: "Domestic & Cleaning", avg: 600, local: 750, foreign: 480, icon: "🧹", employed: 8300 },
];

// Source: DEPS Labour Force Survey 2024, Table 3.4 (Employment by Occupation, MSCO 2008)
const SALARY_BY_OCCUPATION = [
  { occupation: "Managers & Senior Officials", avg: 4200, employed: 14700, share: 6.6 },
  { occupation: "Professionals", avg: 3100, employed: 39700, share: 17.9 },
  { occupation: "Technicians & Assoc. Prof.", avg: 2200, employed: 33000, share: 14.8 },
  { occupation: "Clerical Support", avg: 1600, employed: 23100, share: 10.4 },
  { occupation: "Service & Sales", avg: 1100, employed: 50800, share: 22.9 },
  { occupation: "Skilled Agriculture", avg: 1050, employed: 2000, share: 0.9 },
  { occupation: "Craft & Trades", avg: 1200, employed: 19800, share: 8.9 },
  { occupation: "Machine Operators", avg: 1100, employed: 7900, share: 3.6 },
  { occupation: "Elementary Occupations", avg: 680, employed: 31300, share: 14.1 },
];

const EARNINGS_TREND = [
  { year: "2017", avg: 1820, youth_unemp: 25.0 },
  { year: "2018", avg: 1790, youth_unemp: 22.0 },
  { year: "2019", avg: 1775, youth_unemp: 21.3 },
  { year: "2020", avg: 1740, youth_unemp: 22.0 },
  { year: "2021", avg: 1720, youth_unemp: 20.5 },
  { year: "2022", avg: 1758, youth_unemp: 17.4 },
  { year: "2023", avg: 1758, youth_unemp: 16.8 },
  { year: "2024", avg: 1686, youth_unemp: 18.3 },
];

// Source: DEPS Labour Force Survey 2024 - Mean Monthly Earnings by Sector
const GOV_VS_PRIVATE = {
  gov: { base: 2122, employed: 67100, share: 30.2 },
  private: { base: 1497, employed: 155200, share: 69.8 },
};

// Source: MPEC Salary Guideline 2023 Edition - 22 Job Families, 100 Positions
// Each level: { title, salary, exp (years experience), desc (key requirements) }
const MPEC_GUIDELINES = [
  // === GENERAL SECTOR ===
  { family: "Logistics", sector: "General", levels: [
    { title: "Packer / Courier", salary: 492, exp: "Entry", desc: "Physically fit, inventory management, warehouse maintenance, quality checker, basic heavy vehicle certification" },
    { title: "Warehouse Assistant", salary: 977, exp: "2 yrs", desc: "2 yrs as warehouse labourer, inventory management, planning coordinator, sales records, intermediate heavy vehicle cert" },
    { title: "Warehouse Supervisor", salary: 1736, exp: "3 yrs", desc: "3 yrs as warehouse assistant, business related courses, leadership skills, warehouse maintenance, analytical skills" },
    { title: "Warehouse Manager", salary: 2170, exp: "2-5 yrs", desc: "2-5 yrs as warehouse supervisor, inventory management, leadership skills, quality assurance, advanced heavy vehicle cert" },
    { title: "Supply Chain Manager", salary: 3580, exp: "3-5 yrs", desc: "3-5 yrs as warehouse manager, business/logistics courses, multi-warehouse inventory, financial performance, fleet management" },
  ]},
  { family: "Customer Care", sector: "General", levels: [
    { title: "Telephone Operator / Receptionist", salary: 492, exp: "Entry", desc: "Planning coordinator, answering/forwarding calls, pleasant personality, product knowledge, inventory management" },
    { title: "Customer Care Trainee", salary: 868, exp: "2 yrs", desc: "2 yrs as receptionist/telephone operator, product knowledge, showroom security measures, sales documentation" },
    { title: "Customer Care Executive", salary: 1085, exp: "3 yrs", desc: "3 yrs as assistant CC executive, product knowledge, marketing, updating promotions, resolve client problems" },
    { title: "Senior CC & Retention Executive", salary: 1627, exp: "1 yr", desc: "1 yr as CC executive, marketing of products, retail sales, sales documentation, adaptive market strategy" },
    { title: "CC & Retention Manager", salary: 3255, exp: "3 yrs", desc: "3 yrs as senior CC executive, creating promotion strategies, optimization of business potential, reporting of market trends" },
  ]},
  { family: "Administration", sector: "General", levels: [
    { title: "Office Assistant / Receptionist", salary: 492, exp: "Entry", desc: "Planning coordinator, answering/forwarding calls, pleasant personality, basic payment processing, delivery of documents" },
    { title: "Clerk", salary: 868, exp: "1 yr", desc: "1 yr experience, managing/drafting company paperwork, data entry, office inventory management, basic bookkeeping" },
    { title: "Office Manager", salary: 1410, exp: "2-3 yrs", desc: "2-3 yrs experience, report writing, data entry & storage, basic bookkeeping, disseminating internal memos" },
    { title: "Executive Assistant", salary: 1736, exp: "2-3 yrs", desc: "2-3 yrs experience, consolidating reports, strong logical/critical thinking, preparing paperwork for review/approval" },
    { title: "Admin Manager", salary: 2712, exp: "4 yrs", desc: "4 yrs experience, efficient office strategies, proper organization of documents, report company performance, budget preparation" },
  ]},
  { family: "Finance & Accounting", sector: "General", levels: [
    { title: "Accounting Trainee", salary: 492, exp: "Entry", desc: "Basic accounting, foundation in accounting, transaction documentation, organization of financial records, handling petty cash" },
    { title: "Accounting Clerk / Assistant", salary: 1085, exp: "CAT cert", desc: "Certified Accounting Technician (CAT), administrative support, preparing & verifying financial documents, compliance to ethical standards" },
    { title: "Assistant Accountant", salary: 2170, exp: "1-2 yrs", desc: "1-2 yrs as accounting clerk, CAT qualified, financial reports, accounts reconciliation, accounting software, assist in auditing" },
    { title: "Accountant", salary: 4340, exp: "2-3 yrs", desc: "2-3 yrs as assistant accountant, ACCA/CFA/CPA qualified, financial reporting, procurement documentation, auditing" },
    { title: "Finance Manager", salary: 9765, exp: "3-5 yrs", desc: "3-5 yrs as accountant, CFA/CPA/CMA/ACCA/CIMA certified, financial performance reporting, approval of procurement, compliance" },
  ]},
  { family: "Tourism", sector: "General", levels: [
    { title: "Junior Tour Guide", salary: 543, exp: "Licensed", desc: "Licensed tour guide (MPRT), certified first aid, comprehensive knowledge on laws/culture/arts/history, multi-lingual" },
    { title: "Senior Tour Guide", salary: 868, exp: "Licensed", desc: "Licensed tour guide (MPRT), certified first aid, multi-lingual, good time management, develop tour schedule" },
    { title: "Assistant Travel Consultant", salary: 1085, exp: "Exp'd", desc: "Comprehensive general knowledge, multi-lingual, develop tour schedule, coordinating tour visits, managing travel documents" },
    { title: "Travel Consultant", salary: 1736, exp: "Exp'd", desc: "Coordinate tour guides and groups, preparing travel brochures & promotional materials, maintain statistical & financial records" },
    { title: "Travel Agency Manager", salary: 3255, exp: "Exp'd", desc: "Comprehensive general knowledge, multi-lingual, maintain financial records, preparing sales reports, approving proposals" },
  ]},
  { family: "Cleaning Services", sector: "General", levels: [
    { title: "Cleaner", salary: 492, exp: "Entry", desc: "Attention to detail, handle heavy equipment/machinery, knowledge of cleaning chemicals & supplies, stock & maintain supply rooms" },
    { title: "Multi-Skilled Cleaner", salary: 543, exp: "1 yr", desc: "1 yr as cleaner, attention to detail, handle heavy equipment, knowledge of cleaning chemicals, health & safety compliance" },
    { title: "Head Cleaner", salary: 673, exp: "2 yrs", desc: "2 yrs as multi-skilled cleaner, familiar with MSDS, health & safety compliance, plan monthly stock usage, reporting of issues" },
    { title: "Cleaning Supervisor", salary: 1085, exp: "3-5 yrs", desc: "3-5 yrs as head cleaner, familiar with MSDS, conduct quality inspections, propose process improvements, handle cleaners' welfare" },
    { title: "Cleaning Services Manager", salary: 1410, exp: "5-7 yrs", desc: "5-7 yrs as cleaning supervisor, propose/mitigate current processes, research new cleaning products, coordinate cleaning projects" },
  ]},
  { family: "Information Technology", sector: "General", levels: [
    { title: "IT Clerk", salary: 492, exp: "Entry", desc: "Basic knowledge on common IT issues, manage IT inventory, setting up workstations, ensure safety usage of IT materials" },
    { title: "IT Assistant", salary: 868, exp: "Basic", desc: "Basic knowledge on IT issues, provide user guidance, conduct authorized software upgrades, performing back-ups, diagnose basic issues" },
    { title: "IT System Technician", salary: 977, exp: "1-2 yrs", desc: "1-2 yrs experience, Diploma in IT, Linux+/Cisco certified, diagnose & resolve IT issues, install & configure hardware/software" },
    { title: "IT System Executive", salary: 1628, exp: "3-5 yrs", desc: "3-5 yrs experience, HND in IT, Linux+/Cisco CCNA, procure IT hardware & software, conduct disaster recovery exercise" },
    { title: "IT System Manager", salary: 2170, exp: "2-5 yrs", desc: "2-5 yrs experience, Bachelor's in IT/Computer Science, prepare disaster recovery, administer websites, VBA programming, IT budgets" },
  ]},
  { family: "Culinary", sector: "General", levels: [
    { title: "Kitchen Assistant", salary: 521, exp: "Entry", desc: "Compliance with Brunei Halal regulations, cleaning & organizing kitchen, preparing ingredients, monitoring stock, quality checking" },
    { title: "Commis Chef", salary: 706, exp: "1 yr", desc: "1 yr as kitchen assistant, Halal compliance, identify ingredient shortages, inspection of food & serving areas, prepare ingredients" },
    { title: "Chef De Partie", salary: 1085, exp: "1 yr", desc: "1 yr as commis chef, Halal compliance, preparing dishes, ensuring safe food handling, manage & train kitchen staff" },
    { title: "Sous Chef", salary: 1628, exp: "Exp'd", desc: "Cook & supervise food preparation, assisting Chef De Cuisine, development of new menus, effective cost management, train staff" },
    { title: "Chef De Cuisine", salary: 3038, exp: "Senior", desc: "Setting up recipes & production systems, sourcing from approved suppliers, delegating tasks, manage schedules & training, resolving issues" },
  ]},
  { family: "Retail", sector: "General", levels: [
    { title: "Shelf Filler", salary: 500, exp: "Entry", desc: "Stocking & re-stocking shelves, organizing product areas, keeping store clean, attaching price tags, stockroom arrangement" },
    { title: "Shop Assistant", salary: 543, exp: "Entry", desc: "Opening & closing shop, inventory checking, assisting customers, reporting discrepancies, product knowledge, promoting special offers" },
    { title: "Cashier", salary: 597, exp: "Entry", desc: "Processing payments (cash/card/voucher), balancing cash registers, promoting special offers, ensuring daily cash flow, high accuracy" },
    { title: "Shop Supervisor", salary: 868, exp: "Exp'd", desc: "Dealing with customer complaints, requesting & receiving delivery, product knowledge, training & monitoring staff, store display" },
    { title: "Shop Manager", salary: 1628, exp: "Exp'd", desc: "Handling orders & payments to suppliers, report store repairs, planning store display, handle shop keys, resolve complaints, plan promotions" },
  ]},
  { family: "Hospitality (Restaurant)", sector: "General", levels: [
    { title: "Waiter / Waitress", salary: 492, exp: "Entry", desc: "Welcoming & escorting customers, taking menu orders, accepting payments, food safety & hygiene knowledge, table setup" },
    { title: "Maître D' / Host", salary: 868, exp: "Exp'd", desc: "Supervise waiter/waitress performance, table setup, customer feedback, manage restaurant presentation, cash register operations" },
    { title: "Asst Restaurant Manager", salary: 977, exp: "Exp'd", desc: "Assisting restaurant manager, ensuring restaurant cleanliness, implementing business plans, staff training, health & food safety compliance" },
    { title: "Restaurant Manager", salary: 1628, exp: "Senior", desc: "Scheduling operations, marketing strategies, inventory management, recruit & supervise staff, quality control, revenue & expense reports" },
  ]},
  { family: "Teaching", sector: "General", levels: [
    { title: "Teachers Aide", salary: 492, exp: "Entry", desc: "Assisting teacher in daily lessons, promoting early education & literacy, guiding students, encouraging interaction, reports to teacher" },
    { title: "Teacher", salary: 868, exp: "Registered", desc: "Registered with Private Education Section, preparing lesson plans, assigning & grading homework, communicate with parents, monitor progress" },
    { title: "Head of Teaching Dept", salary: 1844, exp: "Exp'd", desc: "Updating & reviewing lesson plans, observing teachers' capacity, conducting workshops, resolving teaching-related issues, providing guidance" },
    { title: "Senior Teacher", salary: 2604, exp: "Exp'd", desc: "Assisting Principal, receiving & cascading steers from Ministry of Education, reviewing teachers' capacity, creating learning environment" },
    { title: "Principal", salary: 3146, exp: "Senior", desc: "Leading school to achieve national aspirations, observing & reviewing all staff, report to higher management, assigning duties, guidance" },
  ]},
  { family: "Hospitality (Hotels)", sector: "General", levels: [
    { title: "Bell Boy / Hotel Porter", salary: 492, exp: "Entry", desc: "Welcoming guests, knowledge of hotel facilities & tourist attractions, transferring luggage, reservations, delivering room service" },
    { title: "Front Desk Clerk", salary: 543, exp: "Exp'd", desc: "Welcoming & caring for guests, processing payments, closing guest accounts, assisting with reservations & enquiries, multi-lingual" },
    { title: "Concierge", salary: 597, exp: "Exp'd", desc: "Extensive knowledge of Brunei tourist attractions, online bookings, recommending venues, communicating reservations, guest assistance" },
    { title: "Front Office Manager", salary: 1410, exp: "Senior", desc: "Coordinating all front-desk activities, revenue & occupancy forecasting, budget management, staff training & recruitment, guest complaints" },
  ]},
  // === ENERGY SECTOR (OIL & GAS) ===
  { family: "Welder", sector: "Energy", levels: [
    { title: "L1 Welder Assistant (3G)", salary: 700, exp: "0-2 yrs", desc: "AWS D1.1/EEMUA 158 qualification, production welding on minor structural joints, tacking & fillet welds, piping welding practice" },
    { title: "L2 Basic Welder (6GR)", salary: 1200, exp: "2-4 yrs", desc: "iSkill ISQ Welding L2, SMAW & GTAW welding, 6G & 6GR carbon steel qualified, mentoring techniques" },
    { title: "L3 Advanced CRA Welder", salary: 1800, exp: "3-5 yrs", desc: "iSkill NTech Welding L3, CRA welding (SS, DSS, SDSS), complex welds for pressure piping/vessels, read & layout complex prints" },
    { title: "L4 Asst Welding Supervisor", salary: 2500, exp: "4-7 yrs", desc: "ASME IX + API 1104/DNV OS F101, production welding all positions, qualified to train & inspect, mentoring techniques" },
    { title: "L5 Welding Supervisor", salary: 3500, exp: "7+ yrs", desc: "Dynamic leader, optimize welding productivity, project management methodology, welding economics & inspection knowledge, analytical skills" },
  ]},
  { family: "Marker Fitter", sector: "Energy", levels: [
    { title: "L1 Marker Fitter Assistant", salary: 700, exp: "0-1 yrs", desc: "O Level, read structural & piping drawings, basic measurements & marking, grinding & bevelling, flame cutting" },
    { title: "L2 Basic Marker Fitter", salary: 1000, exp: "1-2 yrs", desc: "iSkill ISQ MF L2, identify piping components & materials, compute maths for joining pipes, marking & fit-up structural joints" },
    { title: "L3 Advanced Marker Fitter", salary: 1500, exp: "3-5 yrs", desc: "iSkill NTech MF L3, complex structural configurations (TKY connections), proficient in flame cutting & grinding" },
    { title: "L4 Asst Construction Supv", salary: 2000, exp: "4-7 yrs", desc: "Reports to CSV, supervision of offshore construction works, advanced knowledge of 5 key elements, developed leadership skills" },
    { title: "L5 Construction Supervisor", salary: 3500, exp: "7+ yrs", desc: "Full supervision of offshore construction, ensure works completed per approved scope, construction management systems improvements" },
  ]},
  { family: "Rigger", sector: "Energy", levels: [
    { title: "L1 Rigger Assistant", salary: 700, exp: "0-1 yrs", desc: "O Level, rigger level 1, minimum 6 months workplace logbook with supervised rigging activity" },
    { title: "L2 Rigger", salary: 1000, exp: "1-2 yrs", desc: "iSkill ISQ Rigger L2, conduct rigging for lighting operations, understand lift planning preparations, interpret safe lifting info" },
    { title: "L3 Rigger Leadman", salary: 1500, exp: "2-5 yrs", desc: "iSkill NTech Rigger L3, lift planner level I (200 hours classroom), workplace logbook with supervised lift planning" },
    { title: "L4 Rigger Supv / PIC", salary: 2500, exp: "5+ yrs", desc: "PIC classroom training minimum 200 hours plus PIC assessment, refresh minimum 40 hours and assessment" },
  ]},
  { family: "Blaster Painter", sector: "Energy", levels: [
    { title: "L1 BP Assistant", salary: 700, exp: "0-1 yrs", desc: "O Level, blasting using conventional system, safety system protection, stripe coats, SRI coating application, spray painting primers" },
    { title: "L2 Basic Blaster Painter", salary: 1000, exp: "1-2 yrs", desc: "iSkill ISQ BP L2, hook up blasting equipment, secure high-pressure line, test air pressure, reading WFT/DFT" },
    { title: "L3 BP Leadman", salary: 1500, exp: "3-5 yrs", desc: "iSkill NTech BP L3, person in charge of deck level, trouble shooting, verifies system installation, interface with frontlines" },
    { title: "L4 BP Supervisor", salary: 2500, exp: "4-7 yrs", desc: "Person in charge of platform activities, permit to work holder, overall safety responsibility, toolbox talks, work distribution" },
    { title: "L5 BP Inspector", salary: 3500, exp: "7+ yrs", desc: "Qualified engineering background or 5 yrs experience with min NACE 2, overall area responsibility, quality standards & ITP" },
  ]},
  { family: "Scaffolder", sector: "Energy", levels: [
    { title: "L1 Scaffolder Assistant", salary: 700, exp: "0-1 yrs", desc: "O Level, material handling, familiarisation with equipment & environment, erect basic scaffolding (independent, birdcage, tower mobile)" },
    { title: "L2 Scaffolder Basic", salary: 1000, exp: "1-2 yrs", desc: "iSkill ISQ Scaffolder L2, complete basic training Part A&B, erect scaffolding with prefabricated beams, loading bays, cantilever" },
    { title: "L3 Advanced Scaffolder", salary: 1500, exp: "2-5 yrs", desc: "iSkill NTech Scaffolder L3, charge hand in scaffolding gang, complex scaffold structures, risk assessments & method statements" },
    { title: "L4 Scaffolder Inspector", salary: 2500, exp: "5+ yrs", desc: "Inspecting & checking scaffolds for safe use, signing certificates & registers per statutory regulations, codes of practice" },
  ]},
  { family: "Fire Watcher", sector: "Energy", levels: [
    { title: "L1 Fire Watcher Field Support", salary: 700, exp: "0-1 yrs", desc: "O Level, completed mandatory site HSSE training, familiarization to oil & gas works, support welder/marker during hot work" },
    { title: "L2 Fire Watcher", salary: 1000, exp: "1-2 yrs", desc: "Min 6 months active works, fire-fighting training, use all types of fire extinguishers, gas testing requirements, read & write English" },
  ]},
  { family: "Coating", sector: "Energy", levels: [
    { title: "L1 Coating Field Support", salary: 700, exp: "0-1 yrs", desc: "Completed HSSE training, familiarization to oil & gas construction, supporting skill workers during constructions" },
    { title: "L2 Painter", salary: 1000, exp: "0.5-1 yr", desc: "6 months as coating FS, carry out painting works with basic tools, painter trainee 6 months with structured OJT" },
    { title: "L3 Blaster Painter", salary: 1300, exp: "1-2 yrs", desc: "6 months as painter, achieve surface preparation using blasting equipment, application of coating per specifications" },
    { title: "L4 Coating Supervisor", salary: 1800, exp: "2-3.5 yrs", desc: "12 months as B/SP, knowledge on HSE/quality/schedule, planning & organisation, NACE Inspector Level 1 or BGAS Grade 2" },
    { title: "L5 Coating Inspector", salary: 2300, exp: "3.5+ yrs", desc: "12 months as supervisor, coating tests (cleanliness, profiles, adhesion), corrosion theory, NACE Level 2 or BGAS Grade 1" },
  ]},
  { family: "Civil Works", sector: "Energy", levels: [
    { title: "L1 Civil Field Support", salary: 700, exp: "0 yrs", desc: "O Level, completed HSSE training, familiarization to oil & gas civil construction, supporting skill workers" },
    { title: "L2 Civil Skill Worker", salary: 1000, exp: "1-2 yrs", desc: "L3 NTEC in Building Craft, 2-3 skill works (brick layer, carpenter, concreter, mason, plumber, roofer, steel bender)" },
    { title: "L3 Civil Construction", salary: 1300, exp: "2-4 yrs", desc: "L4 HNTec in Civil Engineering, knowledge on HSE/quality/schedule, understand drawings, planning & organisation" },
    { title: "L4 Civil Construction Inspector", salary: 1800, exp: "4-5 yrs", desc: "L5 Diploma in Civil Engineering, perform inspection tasks per agreed test plan, working with engineer & NDT/DT specialist" },
  ]},
  { family: "Industrial Cleaner", sector: "Energy", levels: [
    { title: "L1 IC Field Support", salary: 700, exp: "0-1 yrs", desc: "O Level, completed HSSE training, introduction to oil & gas industrial cleaning, supporting team through cleaning activities" },
    { title: "L2 Industrial Cleaner", salary: 1000, exp: "1-1.5 yrs", desc: "6 months as FS, industrial cleaning on cooling tower, equipment, tanks, drainage, use of HP jetting machine & industrial vacuum" },
    { title: "L3 IC Supervisor", salary: 1300, exp: "1.5-2 yrs", desc: "12 months as IC, responsible for HSE/quality/schedule of cleaning works, planning & organisation, prepare tools & equipment" },
  ]},
  { family: "Insulator", sector: "Energy", levels: [
    { title: "L1 Insulator Field Support", salary: 700, exp: "0-1 yrs", desc: "Completed HSSE training, introduction to oil & gas insulation works, familiarization of tools/materials/equipment" },
    { title: "L2 Basic Insulator", salary: 1000, exp: "1-2 yrs", desc: "12 months basic insulator trainee with structured OJT, basic insulation on flanges/pipe/valves, work with less supervision" },
    { title: "L3 Insulator / Fabricator", salary: 1300, exp: "2-4 yrs", desc: "All types of complex thermal & cryogenic insulations, read drawings & fabricate per quality standard, 24 months OJT" },
    { title: "L4 Insulator Supervisor", salary: 1800, exp: "4-5.5 yrs", desc: "3 yrs as insulator/fabricator, knowledge on HSE/quality/schedule, understand drawings, working with inspector & engineer" },
    { title: "L5 Insulation Inspector", salary: 3000, exp: "5.5+ yrs", desc: "18 months inspector trainee, ICorr Insulation Inspector Level 1, perform inspection per test plan, work with NDT/DT specialist" },
  ]},
];

// Source: DEPS Labour Force Survey 2024 Key Indicators
const KEY_STATS = [
  { label: "Average Monthly Earnings", value: "BND 1,686", change: "↓ 4.1%", negative: true, detail: "Down from BND 1,758 (2023). Median: BND 1,000" },
  { label: "Youth Unemployment (18-24)", value: "18.3%", change: "↑ 1.5pp", negative: true, detail: "Up from 16.8% in 2023. Overall: 4.7%" },
  { label: "Minimum Wage", value: "BND 500", change: "Since Jul 2023", negative: false, detail: "BND 2.62/hour for part-time workers" },
  { label: "Public vs Private Gap", value: "BND 2,122", change: "42% above private", negative: false, detail: "Private avg: BND 1,497. Gap: BND 625" },
];

const COLORS = {
  primary: "#E8833A",
  primaryLight: "#F5A96B",
  primaryDark: "#C56A25",
  warm: "#F2C078",
  green: "#6BBF7A",
  greenDark: "#4A9B58",
  red: "#E05555",
  redLight: "#F08080",
  bg: "#FDF8F3",
  bgCard: "#FFFFFF",
  bgDark: "#2C1810",
  text: "#3D2B1F",
  textLight: "#8B7355",
  textMuted: "#B8A088",
  border: "#E8DCD0",
  accent1: "#5B8DB8",
  accent2: "#9B6BA6",
  accent3: "#E8833A",
  chartColors: ["#E8833A", "#5B8DB8", "#6BBF7A", "#9B6BA6", "#F2C078", "#E05555", "#7BC8C8", "#C4A265"],
};

// ============================================================
// COMPONENTS
// ============================================================

const Nav = ({ active, setActive }) => {
  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "explore", label: "Explore Salaries", icon: "📊" },
    { id: "compare", label: "Am I Paid Fairly?", icon: "⚖️" },
    { id: "govprivate", label: "Gov vs Private", icon: "🏛️" },
    { id: "submit", label: "Share Your Salary", icon: "✍️" },
    { id: "community", label: "Community Data", icon: "👥" },
  ];
  return (
    <nav style={{ background: "#fff", borderBottom: `2px solid ${COLORS.border}`, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 0, overflowX: "auto", padding: "0 16px" }}>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: COLORS.primary, fontWeight: 700, marginRight: 24, whiteSpace: "nowrap", padding: "12px 0" }}>
          GajiBN
        </div>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            style={{
              background: "none", border: "none", padding: "14px 14px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: active === t.id ? 600 : 400,
              color: active === t.id ? COLORS.primary : COLORS.textLight,
              borderBottom: active === t.id ? `3px solid ${COLORS.primary}` : "3px solid transparent",
              whiteSpace: "nowrap", transition: "all 0.2s",
            }}>
            <span style={{ marginRight: 4 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

const StatCard = ({ stat, delay }) => (
  <div style={{
    background: COLORS.bgCard, borderRadius: 16, padding: "24px 20px", flex: "1 1 220px",
    border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 12px rgba(60,30,10,0.04)",
    animation: `fadeUp 0.5s ${delay}s both ease-out`,
  }}>
    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>{stat.label}</div>
    <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: COLORS.text, marginBottom: 4 }}>{stat.value}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{
        fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 8,
        background: stat.negative ? "#FEE9E9" : "#E6F6E9",
        color: stat.negative ? COLORS.red : COLORS.greenDark,
      }}>{stat.change}</span>
      <span style={{ fontSize: 11, color: COLORS.textMuted }}>{stat.detail}</span>
    </div>
  </div>
);

// --- HOME PAGE ---
const HomePage = ({ setActive }) => (
  <div>
    <div style={{
      background: `linear-gradient(135deg, ${COLORS.bgDark} 0%, #4A2A18 100%)`,
      padding: "64px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06,
        backgroundImage: "radial-gradient(circle at 20% 50%, #E8833A 1px, transparent 1px), radial-gradient(circle at 80% 20%, #F2C078 1px, transparent 1px)",
        backgroundSize: "60px 60px, 80px 80px",
      }} />
      <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ fontSize: 14, color: COLORS.warm, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, animation: "fadeUp 0.5s both ease-out" }}>
          🇧🇳 Brunei's Career Intelligence Platform
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 48, color: "#fff", lineHeight: 1.15, marginBottom: 16, animation: "fadeUp 0.5s 0.1s both ease-out" }}>
          Know Your Worth
        </h1>
        <p style={{ fontSize: 18, color: "#D4B896", lineHeight: 1.6, marginBottom: 32, fontFamily: "'DM Sans', sans-serif", animation: "fadeUp 0.5s 0.2s both ease-out" }}>
          Real salary data for Brunei. Compare earnings, explore industries, and make informed career decisions, powered by official government statistics and anonymous community contributions.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.5s 0.3s both ease-out" }}>
          <button onClick={() => setActive("explore")} style={{
            background: COLORS.primary, color: "#fff", border: "none", padding: "14px 28px",
            borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", transition: "transform 0.2s",
          }}>Explore Salaries →</button>
          <button onClick={() => setActive("compare")} style={{
            background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)",
            padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}>Am I Paid Fairly?</button>
        </div>
      </div>
    </div>

    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 40 }}>
        {KEY_STATS.map((s, i) => <StatCard key={i} stat={s} delay={0.1 * i} />)}
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 500px", background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: COLORS.text, marginBottom: 4 }}>Average Earnings Are Declining</h3>
          <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>Monthly earnings dropped BND 72 while youth unemployment climbed back up</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={EARNINGS_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE5DB" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: COLORS.textLight }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: COLORS.textLight }} domain={[1600, 1900]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: COLORS.accent1 }} domain={[10, 30]} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }} />
              <Line yAxisId="left" type="monotone" dataKey="avg" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 5, fill: COLORS.primary }} name="Avg Earnings (BND)" />
              <Line yAxisId="right" type="monotone" dataKey="youth_unemp" stroke={COLORS.accent1} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, fill: COLORS.accent1 }} name="Youth Unemployment (%)" />
            </LineChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 8 }}>Source: <a href="https://deps.mofe.gov.bn/labour-force/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.textMuted, textDecoration: "underline" }}>DEPS Labour Force Survey 2017-2024</a></p>
        </div>

        <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { icon: "📊", title: "Explore by Industry", desc: "See how 12 industries compare, from Oil & Gas (BND 3,850) to Hospitality (BND 1,050)", action: "explore" },
            { icon: "⚖️", title: "Am I Paid Fairly?", desc: "Enter your details and instantly see how your salary compares to the Brunei average", action: "compare" },
            { icon: "✍️", title: "Share Anonymously", desc: "Contribute your salary data to help others. 100% anonymous, zero personal details required", action: "submit" },
          ].map((card, i) => (
            <button key={i} onClick={() => setActive(card.action)} style={{
              background: COLORS.bgCard, borderRadius: 14, padding: "20px", textAlign: "left",
              border: `1px solid ${COLORS.border}`, cursor: "pointer", transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(60,30,10,0.03)",
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 16, color: COLORS.text, marginBottom: 4 }}>{card.title}</div>
              <div style={{ fontSize: 13, color: COLORS.textLight, lineHeight: 1.5 }}>{card.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- MPEC SECTION (with expandable descriptions) ---
const MpecSection = () => {
  const [expanded, setExpanded] = useState(null); // "familyIdx-levelIdx"
  const toggleExpand = (key) => setExpanded(expanded === key ? null : key);

  return (
    <div>
      <p style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 16 }}>The MPEC Salary Guideline (2023 Edition) recommends minimum salary scales for 22 job families and 100 positions in the private sector, developed from data on 114,000+ employees. <span style={{ fontSize: 12, fontStyle: "italic" }}>Click any role to see requirements.</span></p>
      {["General", "Energy"].map(sector => (
        <div key={sector} style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: sector === "Energy" ? COLORS.primaryDark : COLORS.accent1, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 16, paddingBottom: 8, borderBottom: `2px solid ${sector === "Energy" ? COLORS.primaryDark : COLORS.accent1}20` }}>
            {sector === "Energy" ? "⛽ Energy Sector (Oil & Gas)" : "🏢 General Sector"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {MPEC_GUIDELINES.filter(f => f.sector === sector).map((fam, fi) => {
          const famKey = `${sector}-${fi}`;
          const accentColor = sector === "Energy" ? COLORS.primaryDark : COLORS.accent1;
          return (
          <div key={fi} style={{ background: COLORS.bgCard, borderRadius: 14, padding: "20px 24px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.text, marginBottom: 20 }}>{fam.family}</div>
            {/* Arrow flow boxes */}
            <div style={{ display: "flex", alignItems: "stretch", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
              {fam.levels.map((level, j) => {
                const isLast = j === fam.levels.length - 1;
                const isFirst = j === 0;
                const progress = fam.levels.length > 1 ? j / (fam.levels.length - 1) : 0;
                const r = Math.round(91 + (accentColor === COLORS.primaryDark ? 106 : -2) * progress);
                const g = Math.round(141 + (accentColor === COLORS.primaryDark ? -35 : -52) * progress);
                const b = Math.round(184 + (accentColor === COLORS.primaryDark ? -147 : -4) * progress);
                const boxColor = `rgb(${r},${g},${b})`;
                const levelKey = `${famKey}-${j}`;
                const isExpanded = expanded === levelKey;
                return (
                  <div key={j} style={{ display: "flex", alignItems: "center", flex: "1 1 0", minWidth: 0 }}>
                    <div onClick={() => toggleExpand(levelKey)} style={{
                      flex: "1 1 0", minWidth: 90, padding: "14px 10px", textAlign: "center", cursor: "pointer",
                      background: boxColor, borderRadius: isFirst ? "10px 0 0 10px" : isLast ? "0 10px 10px 0" : 0,
                      borderRight: isLast ? "none" : "2px solid rgba(255,255,255,0.4)",
                      display: "flex", flexDirection: "column", justifyContent: "center", gap: 4,
                      outline: isExpanded ? "3px solid #fff" : "none", outlineOffset: -3,
                      opacity: expanded && !isExpanded ? 0.7 : 1, transition: "opacity 0.2s",
                    }}>
                      <div style={{ fontSize: 11, color: "#fff", fontWeight: 500, lineHeight: 1.25, opacity: 0.92 }}>
                        {level.title}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: 0.3 }}>
                        {isLast && fam.levels.at(-1).salary >= 1400 ? "> " : ""}BND {level.salary.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{level.exp}</div>
                    </div>
                    {!isLast && (
                      <div style={{
                        width: 0, height: 0, flexShrink: 0,
                        borderTop: "26px solid transparent", borderBottom: "26px solid transparent",
                        borderLeft: `14px solid ${boxColor}`,
                        marginRight: -14, zIndex: 1,
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Expanded description panel */}
            {expanded && expanded.startsWith(famKey) && (() => {
              const levelIdx = parseInt(expanded.split("-").pop());
              const level = fam.levels[levelIdx];
              if (!level) return null;
              const progress = fam.levels.length > 1 ? levelIdx / (fam.levels.length - 1) : 0;
              const r = Math.round(91 + (accentColor === COLORS.primaryDark ? 106 : -2) * progress);
              const g = Math.round(141 + (accentColor === COLORS.primaryDark ? -35 : -52) * progress);
              const b = Math.round(184 + (accentColor === COLORS.primaryDark ? -147 : -4) * progress);
              return (
                <div style={{
                  marginTop: 8, padding: "14px 18px", borderRadius: 10, 
                  background: `rgba(${r},${g},${b},0.08)`, border: `1px solid rgba(${r},${g},${b},0.25)`,
                  animation: "fadeUp 0.2s ease-out",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.text }}>{level.title}</div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: COLORS.textMuted }}>Exp: {level.exp}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: `rgb(${r},${g},${b})` }}>BND {level.salary.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.textLight, lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 600, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Key Requirements: </span>
                    {level.desc}
                  </div>
                </div>
              );
            })()}
            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>{fam.levels.length} career levels • Click to see details</div>
              <div style={{ fontSize: 12, color: COLORS.textLight }}>
                <span style={{ fontWeight: 600, color: accentColor }}>BND {fam.levels[0].salary.toLocaleString()}</span>
                <span style={{ margin: "0 6px" }}>→</span>
                <span style={{ fontWeight: 600, color: COLORS.greenDark }}>BND {fam.levels.at(-1).salary.toLocaleString()}{fam.levels.at(-1).salary >= 1400 ? "+" : ""}</span>
              </div>
            </div>
          </div>
          );
        })}
          </div>
        </div>
      ))}
      <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 16 }}>Source: <a href="https://www.mpec.gov.bn/Lists/EmployeePoliciesAndGuidelines/Attachments/8/Salary%20Guideline%20-%202023%20Edition.pdf" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.textMuted, textDecoration: "underline" }}>MPEC Salary Guideline 2023 Edition</a> — Full job descriptions available in the PDF</p>
    </div>
  );
};

// --- EXPLORE PAGE ---
const ExplorePage = () => {
  const [view, setView] = useState("industry");
  const [sortBy, setSortBy] = useState("avg");

  const sortedIndustry = useMemo(() => 
    [...SALARY_BY_INDUSTRY].sort((a, b) => b[sortBy] - a[sortBy]),
    [sortBy]
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: COLORS.text, marginBottom: 4 }}>Explore Brunei Salaries</h2>
      <p style={{ color: COLORS.textLight, marginBottom: 24, fontSize: 15 }}>Based on official <a href="https://deps.mofe.gov.bn/labour-force/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.accent1, textDecoration: "underline" }}>DEPS Labour Force Survey 2024</a> and <a href="https://www.mpec.gov.bn/Pages/SalaryGuideline.aspx" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.accent1, textDecoration: "underline" }}>MPEC Salary Guidelines 2023</a></p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[{ id: "industry", label: "By Industry" }, { id: "occupation", label: "By Occupation" }, { id: "mpec", label: "MPEC Guidelines" }].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} style={{
            padding: "8px 20px", borderRadius: 10, border: `1.5px solid ${view === v.id ? COLORS.primary : COLORS.border}`,
            background: view === v.id ? `${COLORS.primary}12` : "#fff", color: view === v.id ? COLORS.primary : COLORS.textLight,
            fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>{v.label}</button>
        ))}
      </div>

      {view === "industry" && (
        <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.text }}>Average Monthly Earnings by Industry</h3>
            <div style={{ display: "flex", gap: 6 }}>
              {[{ id: "avg", label: "Overall" }, { id: "local", label: "Locals" }, { id: "foreign", label: "Foreign" }].map(s => (
                <button key={s.id} onClick={() => setSortBy(s.id)} style={{
                  padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  border: sortBy === s.id ? `1.5px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                  background: sortBy === s.id ? `${COLORS.primary}15` : "transparent",
                  color: sortBy === s.id ? COLORS.primary : COLORS.textMuted,
                }}>{s.label}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={sortedIndustry} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE5DB" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.textLight }} />
              <YAxis type="category" dataKey="industry" tick={{ fontSize: 12, fill: COLORS.text }} width={130} />
              <Tooltip formatter={(v) => `BND ${v.toLocaleString()}`} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 13 }} />
              <Bar dataKey={sortBy} radius={[0, 8, 8, 0]} fill={COLORS.primary} barSize={22}>
                {sortedIndustry.map((_, i) => (
                  <Cell key={i} fill={COLORS.chartColors[i % COLORS.chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 12 }}>Source: <a href="https://deps.mofe.gov.bn/labour-force/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.textMuted, textDecoration: "underline" }}>DEPS Labour Force Survey 2024</a>. Figures are average monthly earnings in BND.</p>
        </div>
      )}

      {view === "occupation" && (
        <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.text, marginBottom: 16 }}>Average Monthly Earnings by Occupation</h3>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={SALARY_BY_OCCUPATION} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE5DB" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.textLight }} />
              <YAxis type="category" dataKey="occupation" tick={{ fontSize: 12, fill: COLORS.text }} width={130} />
              <Tooltip formatter={(v) => `BND ${v.toLocaleString()}`} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 13 }} />
              <Bar dataKey="avg" radius={[0, 8, 8, 0]} fill={COLORS.accent1} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === "mpec" && (
        <MpecSection />
      )}
    </div>
  );
};

// --- AM I PAID FAIRLY? ---
const ComparePage = () => {
  const [salary, setSalary] = useState("");
  const [industry, setIndustry] = useState("");
  const [experience, setExperience] = useState("");
  const [result, setResult] = useState(null);

  const handleCompare = () => {
    if (!salary || !industry) return;
    const ind = SALARY_BY_INDUSTRY.find(i => i.industry === industry);
    if (!ind) return;
    const userSalary = parseFloat(salary);
    const avg = ind.local;
    const percentile = userSalary > avg ? Math.min(95, 50 + ((userSalary - avg) / avg) * 50) : Math.max(5, 50 - ((avg - userSalary) / avg) * 50);
    const diff = userSalary - avg;
    const diffPercent = ((diff / avg) * 100).toFixed(1);
    const mpecMatch = MPEC_GUIDELINES.find(m => m.family.toLowerCase().includes(industry.toLowerCase().split(" ")[0]));

    setResult({ userSalary, avg, percentile: Math.round(percentile), diff, diffPercent, industry: ind, mpec: mpecMatch });
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: COLORS.text, marginBottom: 4 }}>Am I Paid Fairly?</h2>
      <p style={{ color: COLORS.textLight, marginBottom: 28, fontSize: 15 }}>Enter your details to see how your salary compares to the Brunei average for your industry.</p>

      <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 28, border: `1px solid ${COLORS.border}`, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Your Monthly Salary (BND)</label>
            <input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 1500"
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 16, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Industry</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", outline: "none", boxSizing: "border-box" }}>
              <option value="">Select industry...</option>
              {SALARY_BY_INDUSTRY.map(i => <option key={i.industry} value={i.industry}>{i.icon} {i.industry}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Years of Experience</label>
            <select value={experience} onChange={e => setExperience(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", outline: "none", boxSizing: "border-box" }}>
              <option value="">Select...</option>
              {["0-2 years", "3-5 years", "6-10 years", "10+ years"].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleCompare} style={{
          marginTop: 20, background: COLORS.primary, color: "#fff", border: "none", padding: "12px 32px",
          borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>Compare My Salary →</button>
      </div>

      {result && (
        <div style={{ animation: "fadeUp 0.4s ease-out" }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            <div style={{
              flex: "1 1 250px", background: result.diff >= 0 ? "#E6F6E9" : "#FEF3E9", borderRadius: 16, padding: 24,
              border: `1px solid ${result.diff >= 0 ? "#B8E6C0" : "#F5D4B0"}`,
            }}>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>Your salary is</div>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 36, color: result.diff >= 0 ? COLORS.greenDark : COLORS.primaryDark }}>
                {result.diff >= 0 ? "+" : ""}{result.diffPercent}%
              </div>
              <div style={{ fontSize: 14, color: COLORS.textLight }}>
                {result.diff >= 0 ? "above" : "below"} the average for locals in {industry}
              </div>
            </div>
            <div style={{ flex: "1 1 250px", background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>You earn more than approximately</div>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 36, color: COLORS.primary }}>
                {result.percentile}%
              </div>
              <div style={{ fontSize: 14, color: COLORS.textLight }}>of workers in your industry</div>
            </div>
          </div>

          <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, marginBottom: 16, color: COLORS.text }}>How You Compare</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Your Salary", value: result.userSalary, color: COLORS.primary },
                { label: `${industry} Average (locals)`, value: result.avg, color: COLORS.accent1 },
                { label: "Economy-wide Average", value: 1686, color: COLORS.textMuted },
                { label: "Minimum Wage", value: 500, color: COLORS.red },
              ].map((bar, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: COLORS.textLight }}>{bar.label}</span>
                    <span style={{ fontWeight: 700, color: bar.color }}>BND {bar.value.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 10, background: "#F0E8DF", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 5, background: bar.color, transition: "width 0.8s ease-out",
                      width: `${Math.min(100, (bar.value / 4500) * 100)}%`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
            {result.mpec && (
              <div style={{ marginTop: 20, padding: 16, background: `${COLORS.primary}08`, borderRadius: 10, border: `1px dashed ${COLORS.primary}40` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, marginBottom: 8 }}>📋 MPEC Guideline for {result.mpec.family}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {result.mpec.levels.map((level, li) => (
                    <div key={li} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ fontSize: 12, color: COLORS.textLight, padding: "3px 8px", background: result.userSalary >= level.salary ? `${COLORS.green}15` : "#f5f0eb", borderRadius: 6, border: result.userSalary >= level.salary ? `1px solid ${COLORS.green}40` : "1px solid transparent" }}>
                        <span style={{ fontWeight: 600 }}>BND {level.salary.toLocaleString()}</span>
                        <span style={{ fontSize: 10, color: COLORS.textMuted, marginLeft: 4 }}>{level.title}</span>
                      </div>
                      {li < result.mpec.levels.length - 1 && <span style={{ color: COLORS.textMuted, fontSize: 11 }}>→</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- GOV VS PRIVATE ---
const GovPrivatePage = () => {
  const g = GOV_VS_PRIVATE.gov;
  const p = GOV_VS_PRIVATE.private;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: COLORS.text, marginBottom: 4 }}>Government vs Private Sector</h2>
      <p style={{ color: COLORS.textLight, marginBottom: 28, fontSize: 15 }}>How do government and private sector salaries compare in Brunei? The gap goes beyond just the paycheck.</p>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
        <div style={{ flex: "1 1 380px", background: "#EBF2F8", borderRadius: 16, padding: 24, border: "1px solid #C8DDE8" }}>
          <div style={{ fontSize: 12, color: COLORS.accent1, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>🏛️ Government</div>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 36, color: COLORS.text, marginBottom: 4 }}>BND {g.base.toLocaleString()}</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>Average monthly base salary</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 10 }}>Additional benefits include:</div>
          {[
            "Interest-free housing loans (via Treasury)",
            "Job security and structured pay progression",
            "Government pension scheme for eligible officers",
            "TAP + SCP employer contributions",
            "Annual increments and promotion pathways",
          ].map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0", fontSize: 13, color: COLORS.textLight }}>
              <span style={{ color: COLORS.accent1, marginTop: 1 }}>✓</span>
              <span>{b}</span>
            </div>
          ))}
        </div>

        <div style={{ flex: "1 1 380px", background: "#FEF3E9", borderRadius: 16, padding: 24, border: "1px solid #F5D4B0" }}>
          <div style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>🏢 Private Sector</div>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 36, color: COLORS.text, marginBottom: 4 }}>BND {p.base.toLocaleString()}</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>Average monthly base salary</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 10 }}>Benefits vary widely by company:</div>
          {[
            "TAP + SCP employer contributions (mandatory)",
            "Some companies offer medical/dental coverage",
            "Performance bonuses (common in O&G, finance)",
            "Career progression depends on company size",
            "Higher earning ceiling in senior/specialist roles",
            "More flexibility to negotiate salary",
          ].map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0", fontSize: 13, color: COLORS.textLight }}>
              <span style={{ color: COLORS.primary, marginTop: 1 }}>✓</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}`, marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.text, marginBottom: 12 }}>The Base Salary Gap</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Government average", value: g.base, color: COLORS.accent1 },
            { label: "Private sector average", value: p.base, color: COLORS.primary },
            { label: "Minimum wage", value: 500, color: COLORS.red },
          ].map((bar, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: COLORS.textLight }}>{bar.label}</span>
                <span style={{ fontWeight: 700, color: bar.color }}>BND {bar.value.toLocaleString()}</span>
              </div>
              <div style={{ height: 12, background: "#F0E8DF", borderRadius: 6, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 6, background: bar.color, transition: "width 0.8s ease-out",
                  width: `${Math.min(100, (bar.value / 2500) * 100)}%`,
                }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 14, color: COLORS.textLight, lineHeight: 1.6 }}>
          On base salary alone, government pays about <strong style={{ color: COLORS.primary }}>49% more</strong> than the private sector average (BND 2,237 vs ~BND 1,500). On top of that, government officers have access to interest-free housing loans, structured pay progression, and strong job security. These non-salary benefits are harder to quantify but play a major role in why many graduates prefer to wait for government positions.
        </p>
        <p style={{ fontSize: 14, color: COLORS.textLight, lineHeight: 1.6, marginTop: 12 }}>
          That said, the private sector offers higher earning potential in certain fields, especially Oil & Gas (avg BND 3,850) and Finance (avg BND 3,200). Senior specialists and managers in these industries can significantly out-earn government counterparts.
        </p>
        <p style={{ fontSize: 14, color: COLORS.textLight, lineHeight: 1.6, marginTop: 12 }}>
          All Bruneian citizens receive free government healthcare regardless of which sector they work in. Both sectors are required to contribute to TAP and SCP pension schemes.
        </p>
      </div>

      <div style={{ background: `${COLORS.primary}08`, borderRadius: 12, padding: 16, border: `1px dashed ${COLORS.primary}40` }}>
        <p style={{ fontSize: 12, color: COLORS.primary, margin: 0 }}>
          Note: Salary figures are based on DEPS Labour Force Survey 2024 averages. Individual salaries vary by grade, ministry, company, and experience level. Non-salary benefits are described qualitatively as exact monetary values depend on individual circumstances.
        </p>
      </div>
      <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 12 }}>Sources: <a href="https://deps.mofe.gov.bn/labour-force/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.textMuted, textDecoration: "underline" }}>DEPS Labour Force Survey 2024</a>, TAP/SCP public contribution rates, publicly available information on government loan schemes.</p>
    </div>
  );
};

// --- SUBMIT SALARY ---
const SubmitPage = ({ submissions, setSubmissions }) => {
  const [form, setForm] = useState({ title: "", industry: "", experience: "", salary: "", sector: "", company: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!form.title || !form.industry || !form.salary || !form.sector) return;
    setSubmitting(true);
    setError(null);

    const newEntry = {
      title: form.title,
      industry: form.industry,
      sector: form.sector,
      experience: form.experience || null,
      salary: parseFloat(form.salary),
      company: form.company || null,
    };

    const { data, error: dbError } = await supabase
      .from("submissions")
      .insert([newEntry])
      .select();

    if (dbError) {
      console.error("Supabase error:", dbError);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    if (data && data[0]) {
      setSubmissions(prev => [data[0], ...prev]);
    }

    setForm({ title: "", industry: "", experience: "", salary: "", sector: "", company: "" });
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: COLORS.text, marginBottom: 4 }}>Share Your Salary</h2>
      <p style={{ color: COLORS.textLight, marginBottom: 8, fontSize: 15 }}>Help fellow Bruneians make informed career decisions. Your submission is 100% anonymous.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {["🔒 No names collected", "🙈 No emails required", "📊 Data shown in aggregate only"].map((t, i) => (
          <span key={i} style={{ padding: "4px 12px", borderRadius: 8, background: "#E6F6E9", fontSize: 12, color: COLORS.greenDark, fontWeight: 500 }}>{t}</span>
        ))}
      </div>

      {submitted && (
        <div style={{ background: "#E6F6E9", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #B8E6C0", animation: "fadeUp 0.3s ease-out" }}>
          <span style={{ fontSize: 14, color: COLORS.greenDark, fontWeight: 600 }}>✅ Thank you! Your salary has been added anonymously.</span>
        </div>
      )}

      {error && (
        <div style={{ background: "#FEE9E9", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #F5B0B0" }}>
          <span style={{ fontSize: 14, color: COLORS.red, fontWeight: 600 }}>{error}</span>
        </div>
      )}

      <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 28, border: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { key: "title", label: "Job Title *", placeholder: "e.g. Software Developer, Accountant, Teacher", type: "text" },
            { key: "salary", label: "Monthly Salary (BND) *", placeholder: "e.g. 1800", type: "number" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { key: "industry", label: "Industry *", options: SALARY_BY_INDUSTRY.map(i => i.industry) },
              { key: "sector", label: "Sector *", options: ["Government", "Private", "Semi-Government (GLC)", "Self-employed"] },
              { key: "experience", label: "Experience", options: ["0-2 years", "3-5 years", "6-10 years", "10+ years"] },
            ].map(f => (
              <div key={f.key} style={{ flex: "1 1 180px" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>{f.label}</label>
                <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", outline: "none", boxSizing: "border-box" }}>
                  <option value="">Select...</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Company (optional)</label>
            <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Optional, helps others compare"
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }} />
          </div>

          <button onClick={handleSubmit} disabled={submitting} style={{
            marginTop: 8, background: COLORS.primary, color: "#fff", border: "none", padding: "14px 32px",
            borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: submitting ? "wait" : "pointer", fontFamily: "'DM Sans', sans-serif",
            opacity: (!form.title || !form.industry || !form.salary || !form.sector || submitting) ? 0.5 : 1,
          }}>{submitting ? "Submitting..." : "Submit Anonymously ✍️"}</button>
        </div>
      </div>
    </div>
  );
};

// --- COMMUNITY DATA ---
const CommunityPage = ({ submissions }) => {
  const industryAgg = useMemo(() => {
    const map = {};
    submissions.forEach(s => {
      if (!map[s.industry]) map[s.industry] = { total: 0, count: 0, salaries: [] };
      map[s.industry].total += s.salary;
      map[s.industry].count += 1;
      map[s.industry].salaries.push(s.salary);
    });
    return Object.entries(map).map(([k, v]) => ({
      industry: k, avg: Math.round(v.total / v.count), count: v.count,
      min: Math.min(...v.salaries), max: Math.max(...v.salaries),
    })).sort((a, b) => b.avg - a.avg);
  }, [submissions]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: COLORS.text, marginBottom: 4 }}>Community Salary Data</h2>
      <p style={{ color: COLORS.textLight, marginBottom: 28, fontSize: 15 }}>Real salaries shared anonymously by Bruneians. {submissions.length} contribution{submissions.length !== 1 ? "s" : ""} so far.</p>

      {submissions.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: COLORS.bgCard, borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: COLORS.text, marginBottom: 8 }}>No submissions yet</div>
          <div style={{ fontSize: 14, color: COLORS.textLight }}>Be the first to share your salary and help build Brunei's salary database!</div>
        </div>
      ) : (
        <>
          {industryAgg.length > 0 && (
            <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}`, marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.text, marginBottom: 16 }}>Community Averages by Industry</h3>
              <ResponsiveContainer width="100%" height={Math.max(200, industryAgg.length * 48)}>
                <BarChart data={industryAgg} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE5DB" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.textLight }} />
                  <YAxis type="category" dataKey="industry" tick={{ fontSize: 12, fill: COLORS.text }} width={130} />
                  <Tooltip formatter={(v) => `BND ${v.toLocaleString()}`} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 13 }} />
                  <Bar dataKey="avg" radius={[0, 8, 8, 0]} fill={COLORS.accent2} barSize={22} name="Community Avg" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.text, marginBottom: 16 }}>Recent Submissions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {submissions.slice(0, 20).map((s, i) => (
                <div key={s.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: i % 2 === 0 ? "#FDFAF7" : "#fff", borderRadius: 10, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>{s.industry} • {s.sector}{s.experience ? ` • ${s.experience}` : ""}{s.company ? ` • ${s.company}` : ""}</div>
                  </div>
                  <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.primary }}>BND {s.salary.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
export default function GajiBN() {
  const [active, setActive] = useState("home");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubmissions() {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) {
        setSubmissions(data);
      }
      setLoading(false);
    }
    loadSubmissions();
  }, []);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        select:focus, input:focus { border-color: ${COLORS.primary} !important; box-shadow: 0 0 0 3px ${COLORS.primary}20; }
        button:hover { transform: translateY(-1px); }
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 4px; }
      `}</style>
      <Nav active={active} setActive={setActive} />
      {active === "home" && <HomePage setActive={setActive} />}
      {active === "explore" && <ExplorePage />}
      {active === "compare" && <ComparePage />}
      {active === "govprivate" && <GovPrivatePage />}
      {active === "submit" && <SubmitPage submissions={submissions} setSubmissions={setSubmissions} />}
      {active === "community" && <CommunityPage submissions={submissions} />}
      <footer style={{ textAlign: "center", padding: "32px 24px", borderTop: `1px solid ${COLORS.border}`, marginTop: 40 }}>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.text, marginBottom: 4 }}>GajiBN</div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>
          Know Your Worth 🇧🇳 • Data sources: <a href="https://deps.mofe.gov.bn/labour-force/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.textMuted, textDecoration: "underline" }}>DEPS Labour Force Survey 2024</a>, <a href="https://www.mpec.gov.bn/Pages/SalaryGuideline.aspx" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.textMuted, textDecoration: "underline" }}>MPEC Salary Guideline 2023 Edition</a>
          <br />Built for Bruneians, by Bruneians • Not affiliated with any government agency
        </div>
      </footer>
    </div>
  );
}
