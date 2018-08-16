import request from 'supertest'
import mongoose from 'mongoose'
import openport from 'openport'
import { promisify } from 'util'
import { server } from '@/server'
import { User } from '@/db/models'
import { Mockgoose } from 'mockgoose'

const mockgoose = new Mockgoose(mongoose)
// jest.setTimeout(30000)

const openportFind = promisify(openport.find)
const state = {}
const testUser = {
  email: `test@user.com`,
}

// Create connection to Mongoose before tests are run
beforeAll(async () => {
  const [port] = await Promise.all([
    openportFind({ startingPort: 3001 }),
    mockgoose.prepareStorage(),
  ])

  const mongooseOpts = {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
  }

  const [app] = await Promise.all([
    server(port),
    mongoose.connect(
      `mongodb://foobar/baz`,
      mongooseOpts
    ),
  ])
  state.app = app
})

// afterEach(() => mockgoose.helper.reset())

afterAll(async () => {
  const { childProcess } = mockgoose.mongodHelper.mongoBin
  if (childProcess) {
    childProcess.kill()
  }
  await Promise.all([state.app && state.app.close(), mongoose.disconnect()])
})

// describe(`create-user`, () => {
test(`database should be empty`, async () => {
  const user = await User.find({}).exec()
  expect(user).toBeDefined()
  expect(user).toHaveLength(0)
})

test(`should create a new user in database`, async () => {
  if (!state.app) return
  await request(state.app)
    .post(`/user`)
    .send(testUser)
    .expect(200, `ok`)
  const users = await User.find({}).exec()
  expect(users.length).toBeGreaterThanOrEqual(1)
  const u = await User.findOne({ email: testUser.email }).exec()
  expect(u).not.toBeNull()
  expect(u).toBeDefined()
  expect(u).toMatchObject(testUser)
})
// })
