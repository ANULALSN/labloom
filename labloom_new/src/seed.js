/**
 * Seed script: populate the database with sample Doctors, Tests, and Labs.
 *
 * Usage:  node src/seed.js
 *
 * This is idempotent — it skips creation if records already exist.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const Test = require('./models/Test');
const Lab = require('./models/Lab');

const MONGO_URI = process.env.MONGO_URI;

const doctors = [
    { name: 'Dr. Ananya Sharma', specialization: 'Cardiologist', price: 800, location: 'City Heart Hospital, Mumbai', about: { generalInfo: 'Expert in interventional cardiology with 15+ years of experience.', currentWorkingPlace: 'City Heart Hospital', education: 'MD (Cardiology), AIIMS Delhi', experience: 'Over 15 years' } },
    { name: 'Dr. Rajesh Kumar', specialization: 'Dermatologist', price: 600, location: 'Skin Care Centre, Bangalore', about: { generalInfo: 'Specialist in cosmetic dermatology and skin treatments.', currentWorkingPlace: 'Skin Care Centre', education: 'MD (Dermatology), JIPMER', experience: 'Over 10 years' } },
    { name: 'Dr. Priya Menon', specialization: 'Gynecologist', price: 700, location: 'Women\'s Health Clinic, Chennai', about: { generalInfo: 'Specialized in high-risk obstetrics and fertility treatments.', currentWorkingPlace: 'Women\'s Health Clinic', education: 'MS (OBG), CMC Vellore', experience: 'Over 12 years' } },
    { name: 'Dr. Vikram Reddy', specialization: 'Orthopedic', price: 900, location: 'Bone & Joint Clinic, Hyderabad', about: { generalInfo: 'Expert in joint replacement surgery and sports medicine.', currentWorkingPlace: 'Bone & Joint Clinic', education: 'MS (Ortho), NIMHANS', experience: 'Over 18 years' } },
    { name: 'Dr. Neha Gupta', specialization: 'Pediatrician', price: 500, location: 'Rainbow Children\'s Hospital, Delhi', about: { generalInfo: 'Child health specialist with expertise in neonatology.', currentWorkingPlace: 'Rainbow Children\'s Hospital', education: 'MD (Pediatrics), MAMC Delhi', experience: 'Over 8 years' } },
    { name: 'Dr. Arjun Patel', specialization: 'General Physician', price: 400, location: 'HealthFirst Clinic, Pune', about: { generalInfo: 'Experienced general practitioner with holistic approach.', currentWorkingPlace: 'HealthFirst Clinic', education: 'MBBS, MD (General Medicine)', experience: 'Over 20 years' } },
];

const tests = [
    { name: 'Complete Blood Count (CBC)', description: 'Measures red blood cells, white blood cells, hemoglobin, and platelet levels.', category: 'Hematology', price: 350, duration: '30 mins' },
    { name: 'Lipid Profile', description: 'Measures cholesterol, triglycerides, HDL, and LDL levels.', category: 'Biochemistry', price: 500, duration: '45 mins' },
    { name: 'Thyroid Panel (T3, T4, TSH)', description: 'Evaluates thyroid gland function.', category: 'Hormonal Tests', price: 700, duration: '1 hour' },
    { name: 'Blood Glucose Fasting', description: 'Measures blood sugar levels after fasting.', category: 'Diabetes', price: 150, duration: '15 mins' },
    { name: 'HbA1c', description: 'Average blood glucose over the past 3 months.', category: 'Diabetes', price: 450, duration: '30 mins' },
    { name: 'Liver Function Test (LFT)', description: 'Assesses liver health including bilirubin, ALT, AST.', category: 'Biochemistry', price: 600, duration: '45 mins' },
    { name: 'Kidney Function Test (KFT)', description: 'Evaluates kidney health including creatinine and BUN.', category: 'Biochemistry', price: 550, duration: '45 mins' },
    { name: 'Vitamin D Test', description: 'Measures 25-hydroxy vitamin D levels.', category: 'Vitamin Tests', price: 800, duration: '1 hour' },
    { name: 'Urine Routine Examination', description: 'Physical, chemical, and microscopic analysis of urine.', category: 'Urinalysis', price: 200, duration: '20 mins' },
    { name: 'COVID-19 RT-PCR', description: 'Detects SARS-CoV-2 RNA through nasal/throat swab.', category: 'Infectious Disease', price: 500, duration: '24 hours' },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // ── Doctors ──
        const existingDocs = await Doctor.countDocuments();
        if (existingDocs === 0) {
            await Doctor.insertMany(doctors);
            console.log(`✅ Seeded ${doctors.length} doctors`);
        } else {
            console.log(`⏭️  Doctors already exist (${existingDocs}), skipping`);
        }

        // ── Tests ──
        const existingTests = await Test.countDocuments();
        if (existingTests === 0) {
            await Test.insertMany(tests);
            console.log(`✅ Seeded ${tests.length} tests`);
        } else {
            console.log(`⏭️  Tests already exist (${existingTests}), skipping`);
        }

        // ── Labs ──
        const existingLabs = await Lab.countDocuments({ verificationStatus: 'approved' });
        if (existingLabs === 0) {
            const allTests = await Test.find({});
            const testRefs = allTests.map(t => ({
                testId: t._id,
                price: t.price + Math.floor(Math.random() * 100),
                turnaroundTime: t.duration
            }));

            const labsData = [
                { name: 'LifeCare Diagnostics', registrationNumber: 'LC-2024-001', email: 'info@lifecare.com', phone: '9876543210', address: { street: '12 Health Avenue', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' }, verificationStatus: 'approved', rating: 4.5, availableTests: testRefs.slice(0, 6) },
                { name: 'MedScan Labs', registrationNumber: 'MS-2024-002', email: 'contact@medscan.com', phone: '9876543211', address: { street: '34 Science Park', city: 'Bangalore', state: 'Karnataka', zipCode: '560001' }, verificationStatus: 'approved', rating: 4.2, availableTests: testRefs.slice(3, 8) },
                { name: 'Precision Pathology', registrationNumber: 'PP-2024-003', email: 'lab@precision.com', phone: '9876543212', address: { street: '56 Diagnostic Road', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600001' }, verificationStatus: 'approved', rating: 4.7, availableTests: testRefs },
            ];

            await Lab.insertMany(labsData);
            console.log(`✅ Seeded ${labsData.length} labs with tests`);
        } else {
            console.log(`⏭️  Approved labs already exist (${existingLabs}), skipping`);
        }

        console.log('\n🎉 Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err.message);
        process.exit(1);
    }
}

seed();
