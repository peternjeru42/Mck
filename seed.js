// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Guardian = require('./models/guardian');
const Student = require('./models/student');

mongoose.connect(process.env.dbURi, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const g = await Guardian.create({
      name: 'Jane Doe',
      dob: '1980-01-01',
      citizenship: 'Kenyan',
      id: 12345678,
      phone: '254712345678',
      email: 'parent@example.com',
      address: 'Nairobi'
    });

    const s = await Student.create({
      admNo: 10023,
      gender: 'F',
      name: 'John Doe',
      dob: '2015-03-01',
      medicalCondition: false,
      guardians: [g._id],
      totalFees: 50000,
      feeBalance: 50000
    });

    console.log('Seeded', s, g);
    mongoose.disconnect();
  }).catch(err => console.error(err));
