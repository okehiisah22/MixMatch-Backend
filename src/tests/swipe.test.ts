import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import request from "supertest"
import express from "express"
import jwt from "jsonwebtoken"
import { User, UserRole } from "../models/user.model"
import { Swipe, SwipeType } from "../models/swipe.model"
import { Match } from "../models/match.model"
import swipeRoutes from "../routes/swipe.routes"
import test, { before, after, beforeEach, describe } from "node:test"
import assert from "node:assert"

// Mock environment variables
process.env.JWT_SECRET = "test-secret"

// Create Express app for testing
const app = express()
app.use(express.json())
app.use("/api/v1/swipe", swipeRoutes)

let mongoServer: MongoMemoryServer

// Setup before tests
before(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

// Cleanup after tests
after(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

// Clear database between tests
beforeEach(async () => {
  await User.deleteMany({})
  await Swipe.deleteMany({})
  await Match.deleteMany({})
})

describe("Swipe API", () => {
  let user1: any
  let user2: any
  let token1: string
  let token2: string

  // Setup test users
  beforeEach(async () => {
    // Create test users
    user1 = await User.create({
      firstName: "Test",
      lastName: "User1",
      email: "test1@example.com",
      password: "password123",
      role: UserRole.DJ,
      refreshToken: "test-refresh-token",
    })

    user2 = await User.create({
      firstName: "Test",
      lastName: "User2",
      email: "test2@example.com",
      password: "password123",
      role: UserRole.EVENT_PLANNER,
      refreshToken: "test-refresh-token",
    })

    // Generate tokens
    token1 = jwt.sign({ id: user1._id }, process.env.JWT_SECRET as string)
    token2 = jwt.sign({ id: user2._id }, process.env.JWT_SECRET as string)
  })

  test("Should record a swipe action", async () => {
    const response = await request(app).post("/api/v1/swipe").set("Authorization", `Bearer ${token1}`).send({
      targetUserId: user2._id.toString(),
      action: SwipeType.LIKE,
    })

    assert.strictEqual(response.status, 201)
    assert.strictEqual(response.body.success, true)
    assert.strictEqual(response.body.data.swiperId.toString(), user1._id.toString())
    assert.strictEqual(response.body.data.swipedId.toString(), user2._id.toString())
    assert.strictEqual(response.body.data.type, SwipeType.LIKE)
  })

  test("Should create a match when both users like each other", async () => {
    // User1 likes User2
    await request(app).post("/api/v1/swipe").set("Authorization", `Bearer ${token1}`).send({
      targetUserId: user2._id.toString(),
      action: SwipeType.LIKE,
    })

    // User2 likes User1
    const response = await request(app).post("/api/v1/swipe").set("Authorization", `Bearer ${token2}`).send({
      targetUserId: user1._id.toString(),
      action: SwipeType.LIKE,
    })

    assert.strictEqual(response.status, 201)

    // Check if match was created
    const match = await Match.findOne({
      users: { $all: [user1._id, user2._id] },
    })

    assert.ok(match, "Match should exist")
    assert.strictEqual(match?.superLikeUsed, false)
  })

  test("Should create a match with superLikeUsed=true when one user super-likes", async () => {
    // User1 super-likes User2
    await request(app).post("/api/v1/swipe").set("Authorization", `Bearer ${token1}`).send({
      targetUserId: user2._id.toString(),
      action: SwipeType.SUPER_LIKE,
    })

    // User2 likes User1
    await request(app).post("/api/v1/swipe").set("Authorization", `Bearer ${token2}`).send({
      targetUserId: user1._id.toString(),
      action: SwipeType.LIKE,
    })

    // Check if match was created with superLikeUsed=true
    const match = await Match.findOne({
      users: { $all: [user1._id, user2._id] },
    })

    assert.ok(match, "Match should exist")
    assert.strictEqual(match?.superLikeUsed, true)
  })

  test("Should not create duplicate matches", async () => {
    // User1 likes User2
    await request(app).post("/api/v1/swipe").set("Authorization", `Bearer ${token1}`).send({
      targetUserId: user2._id.toString(),
      action: SwipeType.LIKE,
    })

    // User2 likes User1
    await request(app).post("/api/v1/swipe").set("Authorization", `Bearer ${token2}`).send({
      targetUserId: user1._id.toString(),
      action: SwipeType.LIKE,
    })

    // User1 super-likes User2 (should not create another match)
    await request(app).post("/api/v1/swipe").set("Authorization", `Bearer ${token1}`).send({
      targetUserId: user2._id.toString(),
      action: SwipeType.SUPER_LIKE,
    })

    // Count matches
    const matchCount = await Match.countDocuments({
      users: { $all: [user1._id, user2._id] },
    })

    assert.strictEqual(matchCount, 1)
  })

  test("Should not allow swiping on oneself", async () => {
    const response = await request(app).post("/api/v1/swipe").set("Authorization", `Bearer ${token1}`).send({
      targetUserId: user1._id.toString(),
      action: SwipeType.LIKE,
    })

    assert.strictEqual(response.status, 400)
    assert.strictEqual(response.body.success, false)
    assert.ok(response.body.message.includes("Cannot swipe on yourself"))
  })

  test("Should validate action type", async () => {
    const response = await request(app).post("/api/v1/swipe").set("Authorization", `Bearer ${token1}`).send({
      targetUserId: user2._id.toString(),
      action: "invalid-action",
    })

    assert.strictEqual(response.status, 400)
    assert.strictEqual(response.body.success, false)
    assert.ok(response.body.message.includes("Invalid action"))
  })

  test("Should get user matches", async () => {
    // Create a match between users
    const sortedUsers = [user1._id, user2._id].sort((a, b) => a.toString().localeCompare(b.toString()))

    await Match.create({
      users: sortedUsers,
      superLikeUsed: false,
      timestamp: new Date(),
    })

    // Get matches for user1
    const response = await request(app).get("/api/v1/swipe/matches").set("Authorization", `Bearer ${token1}`)

    assert.strictEqual(response.status, 200)
    assert.strictEqual(response.body.success, true)
    assert.strictEqual(response.body.count, 1)

    // The populated user should be user2
    const matchedUser = response.body.data[0].users[0]
    assert.strictEqual(matchedUser.email, user2.email)
  })
})
