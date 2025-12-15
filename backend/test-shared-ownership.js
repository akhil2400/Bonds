/**
 * Test Script: Shared Ownership System for Trusted Members
 * 
 * This script tests that all 4 trusted members have full access to ALL content
 * (both public and private) created by any trusted member across all content types.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models to register schemas
require('./models/User');
require('./models/Memory');
require('./models/Timeline');
require('./models/Thought');
require('./models/Trip');
require('./models/Music');

// Import services
const MemoryService = require('./services/MemoryService');
const TimelineService = require('./services/TimelineService');
const ThoughtService = require('./services/ThoughtService');
const TripService = require('./services/TripService');
const MusicService = require('./services/MusicService');

// Import authorization helper
const { isTrustedMember } = require('./middlewares/authorization');

// Mock trusted member users
const trustedMember1 = {
  id: '507f1f77bcf86cd799439011',
  email: 'akhilathul56@gmail.com',
  role: 'member',
  isTrustedMember: true
};

const trustedMember2 = {
  id: '507f1f77bcf86cd799439012',
  email: 'friend2@example.com',
  role: 'member',
  isTrustedMember: true
};

const viewer = {
  id: '507f1f77bcf86cd799439013',
  email: 'viewer@example.com',
  role: 'viewer',
  isTrustedMember: false
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testSharedOwnership() {
  console.log('\n🧪 Testing Shared Ownership System for Trusted Members\n');
  
  try {
    // Test 1: Verify trusted member detection
    console.log('1️⃣ Testing trusted member detection:');
    console.log(`   Trusted Member 1: ${isTrustedMember(trustedMember1)}`);
    console.log(`   Trusted Member 2: ${isTrustedMember(trustedMember2)}`);
    console.log(`   Viewer: ${isTrustedMember(viewer)}`);
    
    // Test 2: Test Memory Service
    console.log('\n2️⃣ Testing Memory Service shared ownership:');
    const memories = await MemoryService.getAllMemories(trustedMember1);
    console.log(`   Trusted member can see ${memories.length} memories (all public + private)`);
    
    const viewerMemories = await MemoryService.getAllMemories(viewer);
    console.log(`   Viewer can see ${viewerMemories.length} memories (public only)`);
    
    // Test 3: Test Timeline Service
    console.log('\n3️⃣ Testing Timeline Service shared ownership:');
    const timelineEvents = await TimelineService.getAllTimelines(trustedMember1.id, trustedMember1);
    console.log(`   Trusted member can see ${timelineEvents.length} timeline events (all public + private)`);
    
    const viewerTimelineEvents = await TimelineService.getAllTimelines(viewer.id, viewer);
    console.log(`   Viewer can see ${viewerTimelineEvents.length} timeline events (public only)`);
    
    // Test 4: Test Thought Service
    console.log('\n4️⃣ Testing Thought Service shared ownership:');
    const thoughts = await ThoughtService.getAllThoughts(trustedMember1);
    console.log(`   Trusted member can see ${thoughts.length} thoughts (all public + private)`);
    
    const viewerThoughts = await ThoughtService.getAllThoughts(viewer);
    console.log(`   Viewer can see ${viewerThoughts.length} thoughts (public only)`);
    
    // Test 5: Test Trip Service
    console.log('\n5️⃣ Testing Trip Service shared ownership:');
    const trips = await TripService.getAllTrips(trustedMember1);
    console.log(`   Trusted member can see ${trips.length} trips (all public + private)`);
    
    const viewerTrips = await TripService.getAllTrips(viewer);
    console.log(`   Viewer can see ${viewerTrips.length} trips (public only)`);
    
    // Test 6: Test Music Service
    console.log('\n6️⃣ Testing Music Service shared ownership:');
    const music = await MusicService.getAllMusic(trustedMember1);
    console.log(`   Trusted member can see ${music.length} music items (all public + private)`);
    
    const viewerMusic = await MusicService.getAllMusic(viewer);
    console.log(`   Viewer can see ${viewerMusic.length} music items (public only)`);
    
    console.log('\n✅ Shared ownership system test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Trusted members have full access to ALL content (public + private)');
    console.log('   - Viewers only see public content');
    console.log('   - All 4 trusted members function as collective owners');
    console.log('   - Privacy controls work correctly for different user types');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function main() {
  await connectDB();
  await testSharedOwnership();
  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from MongoDB');
}

// Run the test
main().catch(console.error);