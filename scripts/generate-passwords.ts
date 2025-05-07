const bcrypt = require('bcryptjs');

// List of passwords to hash
const passwords = [
  'doctorpass',
  'clientpass',
  'reppass',
  'adminpass'
];

// Generate hashed passwords
const generateHashes = async () => {
  console.log('Generating password hashes:');
  console.log('=========================');
  
  for (const password of passwords) {
    const hash = await bcrypt.hash(password, 12);
    console.log(`Password: ${password} => Hash: ${hash}`);
  }
};

generateHashes().catch(console.error);