const { test, before, after, mock } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
let database, server, base, alice, bob, exercise;
async function request(path, token, method = 'GET', body) {
  const response = await fetch(base + '/api' + path, { method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}
before(async () => {
  process.env.JWT_SECRET = 'isolated-test-secret-not-for-production';
  database = await MongoMemoryServer.create();
  await mongoose.connect(database.getUri());
  server = require('../app').listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  alice = (await request('/auth/signup', null, 'POST', { email: 'alice@example.com', password: 'example-password', fullName: 'Alice' })).data;
  bob = (await request('/auth/signup', null, 'POST', { email: 'bob@example.com', password: 'example-password', fullName: 'Bob' })).data;
  exercise = await require('../models/Exercise').create({ name: 'Squat', bodyPart: 'legs', notes: [{ user: alice.user.id, text: 'Private training note' }] });
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  if (database) await database.stop();
});
test('signup validates input and issues expiring tokens; signin normalizes email', async () => {
  assert.equal((await request('/auth/signup', null, 'POST', { email: 'bad' })).status, 400);
  const payload = jwt.decode(alice.token);
  assert.equal(payload.exp - payload.iat, 7 * 24 * 60 * 60);
  assert.equal((await request('/auth/signin', null, 'POST', { email: ' ALICE@example.com ', password: 'example-password' })).status, 200);
  assert.equal((await request('/profile')).status, 401);
  assert.equal((await request('/profile', jwt.sign({ id: alice.user.id }, process.env.JWT_SECRET))).status, 401);
});
test('profile saves names and goals but cannot change ownership', async () => {
  const result = await request('/profile', alice.token, 'PUT', { full_name: 'Alice Updated', daily_protein_goal: 130, user: bob.user.id });
  assert.equal(result.status, 200);
  assert.equal(result.data.user, alice.user.id);
  assert.equal(result.data.full_name, 'Alice Updated');
  assert.equal(result.data.daily_protein_goal, 130);
  assert.equal((await request('/profile', alice.token, 'PUT', { weight_kg: -1 })).status, 400);
});
test('exercise responses never include private notes', async () => {
  const list = await request('/exercises', bob.token);
  assert.equal(list.status, 200);
  assert.equal(list.data[0].notes, undefined);
  const rating = await request('/exercises/rate', bob.token, 'POST', { exerciseId: exercise.id, rating: 'EFFECTIVE', comment: 'Good' });
  assert.equal(rating.status, 200);
  assert.equal(rating.data.notes, undefined);
  assert.equal(rating.data.ratings[0].user.fullName, 'Bob');
  assert.equal((await request('/exercises/' + exercise.id + '/note', bob.token)).data.text, '');
});
test('food logs can be created and deleted only by their owner', async () => {
  assert.equal((await request('/diet/foods', alice.token)).status, 200);
  const created = await request('/diet/log', alice.token, 'POST', { food_name: 'Rice', quantity_g: 100, calories: 130 });
  assert.equal(created.status, 200);
  assert.equal((await request('/diet/log/' + created.data._id, bob.token, 'DELETE')).status, 404);
  assert.equal((await request('/diet/today', alice.token)).data.length, 1);
  assert.equal((await request('/diet/log/' + created.data._id, alice.token, 'DELETE')).status, 200);
  assert.equal((await request('/diet/log', alice.token, 'POST', { food_name: 'Rice', quantity_g: -1, calories: 130 })).status, 400);
});
test('quick workout supports adding exercises and sets, enforces ownership and completion', async () => {
  const started = await request('/workouts/start', alice.token, 'POST', { name: 'Quick session' });
  assert.equal(started.status, 201);
  const id = started.data._id;
  const added = await request('/workouts/' + id + '/exercises', alice.token, 'POST', { exerciseId: exercise.id });
  assert.equal(added.status, 201);
  assert.equal(added.data.exercise_base.notes, undefined);
  const setPath = '/workouts/exercises/' + added.data._id + '/sets';
  assert.equal((await request(setPath, bob.token, 'POST', { reps: 8, weight: 40 })).status, 404);
  assert.equal((await request(setPath, alice.token, 'POST', { reps: -1, weight: 40 })).status, 400);
  const logged = await request(setPath, alice.token, 'POST', { reps: 8, weight: 40 });
  assert.equal(logged.status, 200);
  assert.equal(logged.data.exercise_base.name, 'Squat');
  assert.equal(logged.data.exercise_base.notes, undefined);
  const setId = logged.data.sets[0]._id;
  assert.equal((await request(setPath + '/' + setId, bob.token, 'DELETE')).status, 404);
  assert.equal((await request(setPath + '/' + setId, alice.token, 'DELETE')).status, 200);
  assert.equal((await request('/workouts/' + id, bob.token)).status, 404);
  const finished = await request('/workouts/' + id + '/finish', alice.token, 'PUT', { duration_minutes: 9000 });
  assert.equal(finished.status, 200);
  assert.equal(finished.data.duration_minutes, 0);
  const repeated = await request('/workouts/' + id + '/finish', alice.token, 'PUT', {});
  assert.equal(repeated.data.completed_at, finished.data.completed_at);
  assert.equal((await request(setPath, alice.token, 'POST', { reps: 8, weight: 40 })).status, 409);
  assert.equal((await request('/workouts/' + id + '/exercises', alice.token, 'POST', { exerciseId: exercise.id })).status, 409);
});
test('saved routines enforce ownership and preserve target sets', async () => {
  const routine = await request('/workouts/routines', alice.token, 'POST', { name: 'Legs', exercises: [{ _id: exercise.id, sets: 4 }] });
  assert.equal(routine.status, 201);
  assert.equal((await request('/workouts/start/' + routine.data._id, bob.token, 'POST', {})).status, 404);
  const started = await request('/workouts/start/' + routine.data._id, alice.token, 'POST', {});
  const loaded = await request('/workouts/' + started.data._id, alice.token);
  assert.equal(loaded.data.exercises[0].target_sets, 4);
  assert.equal(loaded.data.exercises[0].exercise_base.notes, undefined);
});
test('chat history is scoped to the account', async () => {
  await require('../models/ChatMessage').create({ user: alice.user.id, role: 'user', content: 'Private message' });
  assert.equal((await request('/chat/history', alice.token)).data.length, 1);
  assert.deepEqual((await request('/chat/history', bob.token)).data, []);
  await request('/chat/history', bob.token, 'DELETE');
  assert.equal((await request('/chat/history', alice.token)).data.length, 1);
  assert.equal((await request('/chat/history', alice.token, 'DELETE')).status, 200);
  assert.deepEqual((await request('/chat/history', alice.token)).data, []);
});
test('chat persists both turns and includes previous messages in the model context', async () => {
  const calls = [];
  const mocked = mock.method(require('ollama').Ollama.prototype, 'chat', async options => {
    calls.push(options);
    return { message: { content: 'Keep your workout consistent.' } };
  });
  try {
    assert.equal((await request('/chat', alice.token, 'POST', { message: 'Plan my workout' })).status, 200);
    assert.equal((await request('/chat', alice.token, 'POST', { message: 'And tomorrow?' })).status, 200);
    assert.ok(calls[1].messages.some(message => message.content === 'Plan my workout'));
    assert.equal((await request('/chat/history', alice.token)).data.length, 4);
  } finally { mocked.mock.restore(); }
});
test('vision accepts multipart images and rejects invalid uploads', async () => {
  const analysis = { body_type: 'Athletic', est_body_fat: 'Unknown', muscle_mass: 'Unknown', suggestion: 'Stay consistent' };
  const mocked = mock.method(require('ollama').Ollama.prototype, 'chat', async () => ({ message: { content: JSON.stringify(analysis) } }));
  async function upload(type, size) {
    const form = new FormData();
    form.append('image', new Blob([new Uint8Array(size)], { type }), 'upload');
    return fetch(base + '/api/vision/analyze-body', { method: 'POST', headers: { Authorization: 'Bearer ' + alice.token }, body: form });
  }
  try {
    const valid = await upload('image/png', 32);
    assert.equal(valid.status, 200);
    assert.deepEqual(await valid.json(), analysis);
    assert.equal((await upload('text/plain', 32)).status, 400);
    assert.equal((await upload('image/png', 5 * 1024 * 1024 + 1)).status, 413);
  } finally { mocked.mock.restore(); }
});
test('search treats regex characters as literal text', async () => {
  const result = await request('/exercises?query=%5B', alice.token);
  assert.equal(result.status, 200);
  assert.deepEqual(result.data, []);
});
