import axios from 'axios'
import mongoose from 'mongoose'
import openport from 'openport'
import { promisify } from 'util'
import { server } from '@/server'
import { User } from '@/db/models'
import { Mockgoose } from 'mockgoose'

const mockgoose = new Mockgoose(mongoose)
// jest.setTimeout(30000)

const openportFind = promisify(openport.find)

let app
let request

// Create connection to Mongoose before tests are run
beforeAll(async () => {
  const [port] = await Promise.all([
    openportFind({ startingPort: 3001 }),
    mockgoose.prepareStorage(),
  ])

  app = await server(port)

  request = axios.create({
    baseURL: `http://localhost:${port}`,
    // headers: { 'content-type': `application/json` },
  })

  const mongooseOpts = {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
  }

  mongoose.connection.on(`connected`, () => {
    console.log(`db connection is now open`)
  })

  await mongoose.connect(
    `mongodb://foobar/baz`,
    mongooseOpts
  )
})

afterEach(() => mockgoose.helper.reset())

afterAll(async function() {
  const { childProcess } = mockgoose.mongodHelper.mongoBin
  if (childProcess) {
    childProcess.kill()
  }
  await Promise.all([app.close(), mongoose.disconnect()])
})

const testUser = {
  email: `test@user.com`,
}

describe(`create-user`, () => {
  it(`database should be empty`, async done => {
    const user = await User.find({}).exec()
    expect(user).toBeDefined()
    expect(user).toHaveLength(0)
    done()
  })

  it(`should create a new user in database`, async done => {
    const res = await request.post(`/user`, testUser)
    expect(res.status).toEqual(200)
    expect(res.data).toMatch(`ok`)
    const users = await User.find({}).exec()
    expect(users.length).toBeGreaterThanOrEqual(1)
    const u = await User.findOne({ email: testUser.email }).exec()
    expect(u).not.toBeNull()
    expect(u).toBeDefined()
    expect(u).toMatchObject(testUser)
    done()
  })
})
