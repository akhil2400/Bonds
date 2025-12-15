// Test memories in database
require('dotenv').config();
const mongoose = require('mongoose');
const Memory = require('./models/Memory');
const User = require('./models/User'); // Need this for populate to work

async function testMemories() {
  try {
    console.log('🧪 Testing Memories in Database');
    console.log('==============================');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to database');
    
    // Get all memories
    const memories = await Memory.find({}).populate('owner', 'name email');
    
    console.log(`📋 Found ${memories.length} memories in database`);
    
    memories.forEach((memory, index) => {
      console.log(`\n📝 Memory ${index + 1}:`);
      console.log(`   Title: ${memory.title}`);
      console.log(`   Owner: ${memory.owner?.name || 'Unknown'} (${memory.owner?.email || 'No email'})`);
      console.log(`   Privacy: ${memory.isPrivate ? 'Private 🔒' : 'Public 👁️'}`);
      console.log(`   Media count: ${memory.media?.length || 0}`);
      
      if (memory.media && memory.media.length > 0) {
        console.log('   Media structure:');
        memory.media.forEach((item, i) => {
          if (typeof item === 'string') {
            console.log(`     ${i + 1}. String URL: ${item.substring(0, 50)}...`);
          } else if (typeof item === 'object') {
            console.log(`     ${i + 1}. Object: url=${item.url ? 'SET' : 'NOT SET'}, publicId=${item.publicId ? 'SET' : 'NOT SET'}`);
            if (item.url) {
              console.log(`        URL: ${item.url.substring(0, 50)}...`);
            }
          }
        });
      }
      
      console.log(`   Created: ${memory.createdAt}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Database test completed');
    
  } catch (error) {
    console.error('❌ Error testing memories:', error.message);
    process.exit(1);
  }
}

// Run the test
testMemories();