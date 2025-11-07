const mongoose = require('mongoose');
const Section = require('./models/Section');
const dotenv = require('dotenv');

dotenv.config();

const listSections = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management');
        
        const sections = await Section.find();
        console.log('Current sections in database:');
        console.log(JSON.stringify(sections, null, 2));
        
        if (sections.length === 0) {
            console.log('No sections found. Creating a sample section...');
            const sampleSection = new Section({
                name: 'Class A',
                gradeLevel: 10,
                academicYear: '2025-2026'
            });
            await sampleSection.save();
            console.log('Sample section created successfully');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

listSections();