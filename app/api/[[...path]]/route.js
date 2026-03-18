import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME && process.env.DB_NAME !== 'your_database_name' ? process.env.DB_NAME : 'roamingceo';

let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGO_URL);
    await cachedClient.connect();
  }
  cachedDb = cachedClient.db(DB_NAME);
  try {
    await Promise.all([
      cachedDb.collection('users').createIndex({ user_id: 1 }, { unique: true }),
      cachedDb.collection('users').createIndex({ email: 1 }, { unique: true }),
      cachedDb.collection('sessions').createIndex({ session_token: 1 }),
      cachedDb.collection('posts').createIndex({ created_at: -1 }),
      cachedDb.collection('connections').createIndex({ requester_id: 1, recipient_id: 1 }),
      cachedDb.collection('reactions').createIndex({ post_id: 1, user_id: 1 }, { unique: true }),
      cachedDb.collection('comments').createIndex({ post_id: 1, created_at: -1 }),
    ]);
  } catch (e) { /* indexes may already exist */ }
  return cachedDb;
}

async function getAuthUser(request) {
  let token = request.cookies.get('session_token')?.value;
  if (!token) {
    const h = request.headers.get('Authorization');
    if (h?.startsWith('Bearer ')) token = h.slice(7);
  }
  if (!token) return null;
  const db = await getDb();
  const session = await db.collection('sessions').findOne(
    { session_token: token },
    { projection: { _id: 0 } }
  );
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  return await db.collection('users').findOne(
    { user_id: session.user_id },
    { projection: { _id: 0 } }
  );
}

function jsonRes(data, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(request, { params }) {
  try {
    const path = params?.path || [];
    const [r, a, b] = path;
    const url = new URL(request.url);

    if (!r) return jsonRes({ status: 'ok', platform: 'RoamingCEO API v1.0' });

    // AUTH: me
    if (r === 'auth' && a === 'me') {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      return jsonRes(user);
    }

    // USERS
    if (r === 'users') {
      const db = await getDb();
      if (a === 'search') {
        const q = url.searchParams.get('q') || '';
        const tier = url.searchParams.get('tier');
        const city = url.searchParams.get('city');
        const industry = url.searchParams.get('industry');
        const pg = parseInt(url.searchParams.get('page') || '1');
        const lim = parseInt(url.searchParams.get('limit') || '20');
        const filter = {};
        if (q) filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { headline: { $regex: q, $options: 'i' } }
        ];
        if (tier) filter.tier = tier;
        if (city) filter.city = { $regex: city, $options: 'i' };
        if (industry) filter.industry = industry;
        const users = await db.collection('users')
          .find(filter, { projection: { _id: 0 } })
          .sort({ influence_score: -1 })
          .skip((pg - 1) * lim).limit(lim).toArray();
        const total = await db.collection('users').countDocuments(filter);
        return jsonRes({ users, total, page: pg, limit: lim });
      }
      if (a === 'profile') {
        const user = await getAuthUser(request);
        if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
        return jsonRes(user);
      }
      if (a) {
        const user = await db.collection('users').findOne({ user_id: a }, { projection: { _id: 0 } });
        if (!user) return jsonRes({ error: 'User not found' }, 404);
        return jsonRes(user);
      }
    }

    // POSTS
    if (r === 'posts') {
      const db = await getDb();
      if (a && b === 'comments') {
        const comments = await db.collection('comments')
          .find({ post_id: a }, { projection: { _id: 0 } })
          .sort({ created_at: -1 }).toArray();
        const aids = [...new Set(comments.map(c => c.user_id))];
        const auths = await db.collection('users')
          .find({ user_id: { $in: aids } }, { projection: { _id: 0, user_id: 1, name: 1, picture: 1, headline: 1 } })
          .toArray();
        const am = {};
        auths.forEach(au => am[au.user_id] = au);
        return jsonRes({ comments: comments.map(c => ({ ...c, author: am[c.user_id] || {} })) });
      }
      if (!a) {
        const pg = parseInt(url.searchParams.get('page') || '1');
        const lim = parseInt(url.searchParams.get('limit') || '20');
        const uid = url.searchParams.get('user_id');
        const filter = {};
        if (uid) filter.user_id = uid;
        const posts = await db.collection('posts')
          .find(filter, { projection: { _id: 0 } })
          .sort({ created_at: -1 })
          .skip((pg - 1) * lim).limit(lim).toArray();
        const aids = [...new Set(posts.map(p => p.user_id))];
        const auths = await db.collection('users')
          .find({ user_id: { $in: aids } }, { projection: { _id: 0, user_id: 1, name: 1, picture: 1, headline: 1, tier: 1 } })
          .toArray();
        const am = {};
        auths.forEach(au => am[au.user_id] = au);
        const cu = await getAuthUser(request);
        let ur = {};
        if (cu) {
          const rxs = await db.collection('reactions')
            .find({ user_id: cu.user_id, post_id: { $in: posts.map(p => p.post_id) } }, { projection: { _id: 0 } })
            .toArray();
          rxs.forEach(rx => ur[rx.post_id] = rx.type);
        }
        const enriched = posts.map(p => ({ ...p, author: am[p.user_id] || {}, user_reaction: ur[p.post_id] || null }));
        const total = await db.collection('posts').countDocuments(filter);
        return jsonRes({ posts: enriched, total, page: pg, limit: lim });
      }
    }

    // CONNECTIONS
    if (r === 'connections') {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const db = await getDb();
      if (a === 'requests') {
        const reqs = await db.collection('connections')
          .find({ recipient_id: user.user_id, status: 'pending' }, { projection: { _id: 0 } }).toArray();
        const rids = reqs.map(r => r.requester_id);
        const rUsers = await db.collection('users')
          .find({ user_id: { $in: rids } }, { projection: { _id: 0, user_id: 1, name: 1, picture: 1, headline: 1, city: 1, tier: 1 } })
          .toArray();
        const rm = {};
        rUsers.forEach(u => rm[u.user_id] = u);
        return jsonRes({ requests: reqs.map(r => ({ ...r, requester: rm[r.requester_id] || {} })) });
      }
      if (a === 'suggestions') {
        const existing = await db.collection('connections')
          .find({ $or: [{ requester_id: user.user_id }, { recipient_id: user.user_id }] },
            { projection: { _id: 0, requester_id: 1, recipient_id: 1 } }).toArray();
        const cids = new Set([user.user_id]);
        existing.forEach(c => { cids.add(c.requester_id); cids.add(c.recipient_id); });
        const suggestions = await db.collection('users')
          .find({ user_id: { $nin: Array.from(cids) } }, { projection: { _id: 0 } })
          .limit(15).toArray();
        return jsonRes({ suggestions });
      }
      if (!a || a === 'list') {
        const conns = await db.collection('connections')
          .find({ $or: [
            { requester_id: user.user_id, status: 'accepted' },
            { recipient_id: user.user_id, status: 'accepted' }
          ] }, { projection: { _id: 0 } }).toArray();
        const cuids = conns.map(c => c.requester_id === user.user_id ? c.recipient_id : c.requester_id);
        const users = await db.collection('users')
          .find({ user_id: { $in: cuids } }, { projection: { _id: 0 } }).toArray();
        return jsonRes({ connections: conns, users });
      }
    }

    // BUSINESS INDEX
    if (r === 'business') {
      const db = await getDb();
      const q = url.searchParams.get('q') || '';
      const industry = url.searchParams.get('industry');
      const city = url.searchParams.get('city');
      const stage = url.searchParams.get('stage');
      const pg = parseInt(url.searchParams.get('page') || '1');
      const lim = parseInt(url.searchParams.get('limit') || '20');
      const filter = { 'business_profile.name': { $exists: true, $ne: '' } };
      if (q) filter.$or = [
        { 'business_profile.name': { $regex: q, $options: 'i' } },
        { 'business_profile.about': { $regex: q, $options: 'i' } }
      ];
      if (industry) filter['business_profile.industry'] = industry;
      if (city) filter['business_profile.city'] = { $regex: city, $options: 'i' };
      if (stage) filter['business_profile.stage'] = stage;
      const businesses = await db.collection('users')
        .find(filter, { projection: { _id: 0 } })
        .sort({ influence_score: -1 })
        .skip((pg - 1) * lim).limit(lim).toArray();
      const total = await db.collection('users').countDocuments(filter);
      return jsonRes({ businesses, total, page: pg, limit: lim });
    }

    // CEO INDEX
    if (r === 'ceo') {
      const db = await getDb();
      const q = url.searchParams.get('q') || '';
      const industry = url.searchParams.get('industry');
      const city = url.searchParams.get('city');
      const pg = parseInt(url.searchParams.get('page') || '1');
      const lim = parseInt(url.searchParams.get('limit') || '20');
      const filter = { tier: { $in: ['executive', 'investor'] } };
      if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { headline: { $regex: q, $options: 'i' } }];
      if (industry) filter.industry = industry;
      if (city) filter.city = { $regex: city, $options: 'i' };
      const executives = await db.collection('users')
        .find(filter, { projection: { _id: 0 } })
        .sort({ influence_score: -1 })
        .skip((pg - 1) * lim).limit(lim).toArray();
      const total = await db.collection('users').countDocuments(filter);
      return jsonRes({ executives, total, page: pg, limit: lim });
    }

    // JOBS
    if (r === 'jobs') {
      const db = await getDb();
      if (a === 'applications') {
        const user = await getAuthUser(request);
        if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
        const apps = await db.collection('applications')
          .find({ user_id: user.user_id }, { projection: { _id: 0 } })
          .sort({ created_at: -1 }).toArray();
        const jobIds = apps.map(ap => ap.job_id);
        const jbs = await db.collection('jobs')
          .find({ job_id: { $in: jobIds } }, { projection: { _id: 0 } }).toArray();
        const jm = {}; jbs.forEach(j => jm[j.job_id] = j);
        return jsonRes({ applications: apps.map(ap => ({ ...ap, job: jm[ap.job_id] || {} })) });
      }
      if (a === 'my-posts') {
        const user = await getAuthUser(request);
        if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
        const jobs = await db.collection('jobs')
          .find({ poster_id: user.user_id }, { projection: { _id: 0 } })
          .sort({ created_at: -1 }).toArray();
        return jsonRes({ jobs });
      }
      if (a) {
        const job = await db.collection('jobs').findOne({ job_id: a }, { projection: { _id: 0 } });
        if (!job) return jsonRes({ error: 'Job not found' }, 404);
        const poster = await db.collection('users').findOne(
          { user_id: job.poster_id }, { projection: { _id: 0, user_id: 1, name: 1, picture: 1, headline: 1, tier: 1 } });
        const user = await getAuthUser(request);
        let hasApplied = false;
        if (user) { const ap = await db.collection('applications').findOne({ job_id: a, user_id: user.user_id }); hasApplied = !!ap; }
        return jsonRes({ ...job, poster, has_applied: hasApplied });
      }
      const q = url.searchParams.get('q') || '';
      const jtype = url.searchParams.get('type');
      const wmode = url.searchParams.get('work_mode');
      const jcity = url.searchParams.get('city');
      const pg = parseInt(url.searchParams.get('page') || '1');
      const lim = parseInt(url.searchParams.get('limit') || '20');
      const filter = { status: 'active' };
      if (q) filter.$or = [{ title: { $regex: q, $options: 'i' } }, { company: { $regex: q, $options: 'i' } }];
      if (jtype) filter.type = jtype;
      if (wmode) filter.work_mode = wmode;
      if (jcity) filter.location = { $regex: jcity, $options: 'i' };
      const jobs = await db.collection('jobs')
        .find(filter, { projection: { _id: 0 } }).sort({ created_at: -1 })
        .skip((pg - 1) * lim).limit(lim).toArray();
      const pids = [...new Set(jobs.map(j => j.poster_id))];
      const ptrs = await db.collection('users')
        .find({ user_id: { $in: pids } }, { projection: { _id: 0, user_id: 1, name: 1, picture: 1, headline: 1, tier: 1 } }).toArray();
      const pmap = {}; ptrs.forEach(p => pmap[p.user_id] = p);
      const total = await db.collection('jobs').countDocuments(filter);
      return jsonRes({ jobs: jobs.map(j => ({ ...j, poster: pmap[j.poster_id] || {} })), total, page: pg, limit: lim });
    }

    // CONVERSATIONS
    if (r === 'conversations') {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const db = await getDb();
      if (a && b === 'messages') {
        const conv = await db.collection('conversations').findOne(
          { conversation_id: a, participants: user.user_id }, { projection: { _id: 0 } });
        if (!conv) return jsonRes({ error: 'Not found' }, 404);
        const msgs = await db.collection('messages')
          .find({ conversation_id: a }, { projection: { _id: 0 } }).sort({ created_at: 1 }).limit(200).toArray();
        await db.collection('messages').updateMany(
          { conversation_id: a, sender_id: { $ne: user.user_id }, read: false }, { $set: { read: true } });
        return jsonRes({ messages: msgs, conversation: conv });
      }
      const convs = await db.collection('conversations')
        .find({ participants: user.user_id }, { projection: { _id: 0 } }).sort({ updated_at: -1 }).toArray();
      const oIds = convs.map(c => c.participants.find(p => p !== user.user_id));
      const oUsers = await db.collection('users')
        .find({ user_id: { $in: oIds } }, { projection: { _id: 0, user_id: 1, name: 1, picture: 1, headline: 1 } }).toArray();
      const oMap = {}; oUsers.forEach(o => oMap[o.user_id] = o);
      const enriched = await Promise.all(convs.map(async c => {
        const oid = c.participants.find(p => p !== user.user_id);
        const unread = await db.collection('messages').countDocuments({ conversation_id: c.conversation_id, sender_id: oid, read: false });
        return { ...c, other_user: oMap[oid] || {}, unread_count: unread };
      }));
      return jsonRes({ conversations: enriched });
    }

    // COMMUNITIES
    if (r === 'communities') {
      const db = await getDb();
      if (a && b === 'posts') {
        const cposts = await db.collection('community_posts')
          .find({ community_id: a }, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(50).toArray();
        const cAids = [...new Set(cposts.map(p => p.user_id))];
        const cAuths = await db.collection('users')
          .find({ user_id: { $in: cAids } }, { projection: { _id: 0, user_id: 1, name: 1, picture: 1, headline: 1, tier: 1 } }).toArray();
        const cAm = {}; cAuths.forEach(au => cAm[au.user_id] = au);
        return jsonRes({ posts: cposts.map(p => ({ ...p, author: cAm[p.user_id] || {} })) });
      }
      if (a && b === 'members') {
        const mems = await db.collection('community_members')
          .find({ community_id: a }, { projection: { _id: 0 } }).toArray();
        const muids = mems.map(m => m.user_id);
        const musers = await db.collection('users')
          .find({ user_id: { $in: muids } }, { projection: { _id: 0, user_id: 1, name: 1, picture: 1, headline: 1, tier: 1 } }).toArray();
        return jsonRes({ members: mems, users: musers });
      }
      if (a) {
        const comm = await db.collection('communities').findOne({ community_id: a }, { projection: { _id: 0 } });
        if (!comm) return jsonRes({ error: 'Not found' }, 404);
        const cUser = await getAuthUser(request);
        let isMem = false;
        if (cUser) { const mem = await db.collection('community_members').findOne({ community_id: a, user_id: cUser.user_id }); isMem = !!mem; }
        return jsonRes({ ...comm, is_member: isMem });
      }
      const cq = url.searchParams.get('q') || '';
      const ctype = url.searchParams.get('type');
      const cpg = parseInt(url.searchParams.get('page') || '1');
      const clim = parseInt(url.searchParams.get('limit') || '20');
      const cfilter = {};
      if (cq) cfilter.$or = [{ name: { $regex: cq, $options: 'i' } }, { description: { $regex: cq, $options: 'i' } }];
      if (ctype) cfilter.type = ctype;
      const comms = await db.collection('communities')
        .find(cfilter, { projection: { _id: 0 } }).sort({ members_count: -1 })
        .skip((cpg - 1) * clim).limit(clim).toArray();
      const ctotal = await db.collection('communities').countDocuments(cfilter);
      const cUser2 = await getAuthUser(request);
      if (cUser2) {
        const myMems = await db.collection('community_members')
          .find({ user_id: cUser2.user_id, community_id: { $in: comms.map(c => c.community_id) } }).toArray();
        const memSet = new Set(myMems.map(m => m.community_id));
        comms.forEach(c => c.is_member = memSet.has(c.community_id));
      }
      return jsonRes({ communities: comms, total: ctotal, page: cpg, limit: clim });
    }

    // EVENTS
    if (r === 'events') {
      const db = await getDb();
      if (a) {
        const evt = await db.collection('events').findOne({ event_id: a }, { projection: { _id: 0 } });
        if (!evt) return jsonRes({ error: 'Event not found' }, 404);
        const org = await db.collection('users').findOne(
          { user_id: evt.organizer_id }, { projection: { _id: 0, user_id: 1, name: 1, picture: 1, headline: 1, tier: 1 } });
        const eUser = await getAuthUser(request);
        let eRsvp = null;
        if (eUser) { const rv = await db.collection('event_rsvps').findOne({ event_id: a, user_id: eUser.user_id }); eRsvp = rv?.status || null; }
        return jsonRes({ ...evt, organizer: org, user_rsvp: eRsvp });
      }
      const eq = url.searchParams.get('q') || '';
      const etype = url.searchParams.get('type');
      const ecity = url.searchParams.get('city');
      const efmt = url.searchParams.get('format');
      const epg = parseInt(url.searchParams.get('page') || '1');
      const elim = parseInt(url.searchParams.get('limit') || '20');
      const efilter = {};
      if (eq) efilter.$or = [{ title: { $regex: eq, $options: 'i' } }, { description: { $regex: eq, $options: 'i' } }];
      if (etype) efilter.type = etype;
      if (ecity) efilter.location = { $regex: ecity, $options: 'i' };
      if (efmt) efilter.format = efmt;
      const evts = await db.collection('events')
        .find(efilter, { projection: { _id: 0 } }).sort({ date: 1 })
        .skip((epg - 1) * elim).limit(elim).toArray();
      const etotal = await db.collection('events').countDocuments(efilter);
      return jsonRes({ events: evts, total: etotal, page: epg, limit: elim });
    }

    // COFOUNDER BOARD
    if (r === 'cofounder') {
      const db = await getDb();
      const cfq = url.searchParams.get('q') || '';
      const lf = url.searchParams.get('looking_for');
      const cfpg = parseInt(url.searchParams.get('page') || '1');
      const cflim = parseInt(url.searchParams.get('limit') || '20');
      const cffilter = { status: 'active' };
      if (cfq) cffilter.$or = [{ title: { $regex: cfq, $options: 'i' } }, { description: { $regex: cfq, $options: 'i' } }];
      if (lf) cffilter.looking_for = lf;
      const cfposts = await db.collection('cofounder_posts')
        .find(cffilter, { projection: { _id: 0 } }).sort({ created_at: -1 })
        .skip((cfpg - 1) * cflim).limit(cflim).toArray();
      const cfAids = [...new Set(cfposts.map(p => p.user_id))];
      const cfAuths = await db.collection('users')
        .find({ user_id: { $in: cfAids } }, { projection: { _id: 0, user_id: 1, name: 1, picture: 1, headline: 1, tier: 1, business_profile: 1 } }).toArray();
      const cfAm = {}; cfAuths.forEach(au => cfAm[au.user_id] = au);
      const cftotal = await db.collection('cofounder_posts').countDocuments(cffilter);
      return jsonRes({ posts: cfposts.map(p => ({ ...p, author: cfAm[p.user_id] || {} })), total: cftotal, page: cfpg, limit: cflim });
    }

    return jsonRes({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('GET error:', error);
    return jsonRes({ error: 'Internal server error' }, 500);
  }
}

export async function POST(request, { params }) {
  try {
    const path = params?.path || [];
    const [r, a, b] = path;

    // AUTH: Exchange session_id
    if (r === 'auth' && a === 'session') {
      const { session_id } = await request.json();
      if (!session_id) return jsonRes({ error: 'session_id required' }, 400);
      const authResp = await fetch(
        'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
        { headers: { 'X-Session-ID': session_id } }
      );
      if (!authResp.ok) return jsonRes({ error: 'Invalid session' }, 401);
      const { email, name, picture, session_token } = await authResp.json();
      const db = await getDb();
      let user = await db.collection('users').findOne({ email }, { projection: { _id: 0 } });
      let isNew = false;
      if (!user) {
        isNew = true;
        const userId = `user_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
        user = {
          user_id: userId, email, name, picture,
          headline: '', summary: '', tier: 'professional',
          city: '', industry: '', skills: [],
          experience: [], education: [],
          profile_completion: 20,
          status_signals: { open_to_work: false, for_hire: false, seeking_cofounder: false, open_to_investment: false },
          business_profile: null,
          connections_count: 0, followers_count: 0, influence_score: 0,
          onboarding_complete: false,
          created_at: new Date(), updated_at: new Date()
        };
        await db.collection('users').insertOne({ ...user });
      } else {
        await db.collection('users').updateOne(
          { email },
          { $set: { picture: picture || user.picture, name: name || user.name, updated_at: new Date() } }
        );
        user = await db.collection('users').findOne({ email }, { projection: { _id: 0 } });
      }
      await db.collection('sessions').insertOne({
        user_id: user.user_id, session_token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_at: new Date()
      });
      const response = jsonRes({ user, is_new: isNew });
      response.cookies.set('session_token', session_token, {
        httpOnly: true, secure: true, sameSite: 'none', path: '/', maxAge: 7 * 24 * 60 * 60
      });
      return response;
    }

    // AUTH: Email/Password Signup
    if (r === 'auth' && a === 'signup') {
      const { email, password, name } = await request.json();
      
      // Validation
      if (!email || !password || !name) {
        return jsonRes({ error: 'Email, password, and name are required' }, 400);
      }
      if (password.length < 6) {
        return jsonRes({ error: 'Password must be at least 6 characters' }, 400);
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return jsonRes({ error: 'Invalid email format' }, 400);
      }

      const db = await getDb();
      
      // Check if user already exists
      const existing = await db.collection('users').findOne({ email });
      if (existing) {
        return jsonRes({ error: 'Email already registered' }, 409);
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create new user
      const userId = `user_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
      const user = {
        user_id: userId,
        email,
        name,
        password_hash: passwordHash,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`,
        headline: '',
        summary: '',
        tier: 'professional',
        city: '',
        industry: '',
        skills: [],
        experience: [],
        education: [],
        profile_completion: 20,
        status_signals: { open_to_work: false, for_hire: false, seeking_cofounder: false, open_to_investment: false },
        business_profile: null,
        connections_count: 0,
        followers_count: 0,
        influence_score: 0,
        onboarding_complete: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      await db.collection('users').insertOne({ ...user });

      // Create session
      const sessionToken = `session_${uuidv4()}`;
      await db.collection('sessions').insertOne({
        user_id: user.user_id,
        session_token: sessionToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_at: new Date()
      });

      // Remove password hash from response
      delete user.password_hash;

      const response = jsonRes({ user, is_new: true });
      response.cookies.set('session_token', sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      });
      return response;
    }

    // AUTH: Email/Password Login
    if (r === 'auth' && a === 'login') {
      const { email, password } = await request.json();

      if (!email || !password) {
        return jsonRes({ error: 'Email and password are required' }, 400);
      }

      const db = await getDb();
      const user = await db.collection('users').findOne({ email }, { projection: { _id: 0 } });

      if (!user) {
        return jsonRes({ error: 'Invalid email or password' }, 401);
      }

      if (!user.password_hash) {
        return jsonRes({ error: 'This account uses OAuth login. Please sign in with Google.' }, 400);
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return jsonRes({ error: 'Invalid email or password' }, 401);
      }

      // Create session
      const sessionToken = `session_${uuidv4()}`;
      await db.collection('sessions').insertOne({
        user_id: user.user_id,
        session_token: sessionToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_at: new Date()
      });

      // Remove password hash from response
      delete user.password_hash;

      const response = jsonRes({ user, is_new: false });
      response.cookies.set('session_token', sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      });
      return response;
    }

    // AUTH: Logout
    if (r === 'auth' && a === 'logout') {
      const token = request.cookies.get('session_token')?.value;
      if (token) {
        const db = await getDb();
        await db.collection('sessions').deleteMany({ session_token: token });
      }
      const response = jsonRes({ success: true });
      response.cookies.set('session_token', '', {
        httpOnly: true, secure: true, sameSite: 'none', path: '/', maxAge: 0
      });
      return response;
    }

    // USERS: Onboarding
    if (r === 'users' && a === 'onboarding') {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const body = await request.json();
      const db = await getDb();
      const update = {
        tier: body.tier || user.tier,
        city: body.city || user.city,
        industry: body.industry || user.industry,
        headline: body.headline || user.headline,
        skills: body.skills || user.skills,
        onboarding_complete: true,
        updated_at: new Date()
      };
      if (body.business_profile && ['business', 'executive', 'investor'].includes(body.tier)) {
        update.business_profile = {
          name: body.business_profile.name || '',
          logo: '', tagline: body.business_profile.tagline || '',
          industry: body.business_profile.industry || '',
          stage: body.business_profile.stage || '',
          team_size: body.business_profile.team_size || '',
          founding_year: body.business_profile.founding_year || '',
          city: body.business_profile.city || '',
          website: body.business_profile.website || '',
          about: body.business_profile.about || '',
          influence_score: 0
        };
      }
      update.profile_completion = calcCompletion({ ...user, ...update });
      await db.collection('users').updateOne({ user_id: user.user_id }, { $set: update });
      const updated = await db.collection('users').findOne({ user_id: user.user_id }, { projection: { _id: 0 } });
      return jsonRes(updated);
    }

    // POSTS: Create
    if (r === 'posts' && !a) {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const { content, type = 'standard', hashtags = [] } = await request.json();
      if (!content?.trim()) return jsonRes({ error: 'Content required' }, 400);
      const db = await getDb();
      const post = {
        post_id: `post_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
        user_id: user.user_id, content: content.trim(), type, hashtags,
        reactions: { like: 0, celebrate: 0, support: 0, insightful: 0, curious: 0, love: 0 },
        comments_count: 0, shares_count: 0, created_at: new Date()
      };
      await db.collection('posts').insertOne({ ...post });
      return jsonRes({ ...post, author: { user_id: user.user_id, name: user.name, picture: user.picture, headline: user.headline, tier: user.tier } }, 201);
    }

    // POSTS: React
    if (r === 'posts' && a && b === 'react') {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const { type } = await request.json();
      const valid = ['like', 'celebrate', 'support', 'insightful', 'curious', 'love'];
      if (!valid.includes(type)) return jsonRes({ error: 'Invalid type' }, 400);
      const db = await getDb();
      const existing = await db.collection('reactions').findOne(
        { post_id: a, user_id: user.user_id }, { projection: { _id: 0 } }
      );
      if (existing) {
        if (existing.type === type) {
          await db.collection('reactions').deleteOne({ post_id: a, user_id: user.user_id });
          await db.collection('posts').updateOne({ post_id: a }, { $inc: { [`reactions.${type}`]: -1 } });
          return jsonRes({ action: 'removed', type });
        } else {
          await db.collection('reactions').updateOne(
            { post_id: a, user_id: user.user_id }, { $set: { type } }
          );
          await db.collection('posts').updateOne({ post_id: a },
            { $inc: { [`reactions.${existing.type}`]: -1, [`reactions.${type}`]: 1 } });
          return jsonRes({ action: 'changed', type });
        }
      } else {
        await db.collection('reactions').insertOne({
          reaction_id: `react_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
          post_id: a, user_id: user.user_id, type, created_at: new Date()
        });
        await db.collection('posts').updateOne({ post_id: a }, { $inc: { [`reactions.${type}`]: 1 } });
        return jsonRes({ action: 'added', type });
      }
    }

    // POSTS: Comment
    if (r === 'posts' && a && b === 'comment') {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const { content } = await request.json();
      if (!content?.trim()) return jsonRes({ error: 'Content required' }, 400);
      const db = await getDb();
      const comment = {
        comment_id: `cmt_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
        post_id: a, user_id: user.user_id, content: content.trim(), created_at: new Date()
      };
      await db.collection('comments').insertOne({ ...comment });
      await db.collection('posts').updateOne({ post_id: a }, { $inc: { comments_count: 1 } });
      return jsonRes({ ...comment, author: { user_id: user.user_id, name: user.name, picture: user.picture, headline: user.headline } }, 201);
    }

    // CONNECTIONS: Request
    if (r === 'connections' && a === 'request') {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const { recipient_id, note = '' } = await request.json();
      if (!recipient_id) return jsonRes({ error: 'recipient_id required' }, 400);
      if (recipient_id === user.user_id) return jsonRes({ error: 'Cannot connect with yourself' }, 400);
      const db = await getDb();
      const existing = await db.collection('connections').findOne({
        $or: [
          { requester_id: user.user_id, recipient_id },
          { requester_id: recipient_id, recipient_id: user.user_id }
        ]
      });
      if (existing) return jsonRes({ error: 'Connection already exists' }, 409);
      const conn = {
        connection_id: `conn_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
        requester_id: user.user_id, recipient_id, status: 'pending', note,
        created_at: new Date(), updated_at: new Date()
      };
      await db.collection('connections').insertOne({ ...conn });
      return jsonRes(conn, 201);
    }

    // JOBS: Create
    if (r === 'jobs' && !a) {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const body = await request.json();
      if (!body.title?.trim()) return jsonRes({ error: 'Title required' }, 400);
      const db = await getDb();
      const job = {
        job_id: `job_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
        poster_id: user.user_id, title: body.title.trim(),
        company: body.company || '', company_logo: '', location: body.location || '',
        type: body.type || 'full-time', work_mode: body.work_mode || 'onsite',
        description: body.description || '', salary_min: body.salary_min || 0,
        salary_max: body.salary_max || 0, skills: body.skills || [],
        experience_level: body.experience_level || 'mid',
        easy_apply: body.easy_apply !== false, applications_count: 0,
        status: 'active', created_at: new Date()
      };
      await db.collection('jobs').insertOne({ ...job });
      return jsonRes({ ...job, poster: { user_id: user.user_id, name: user.name, picture: user.picture, headline: user.headline, tier: user.tier } }, 201);
    }

    // JOBS: Apply
    if (r === 'jobs' && a && b === 'apply') {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const db = await getDb();
      const existing = await db.collection('applications').findOne({ job_id: a, user_id: user.user_id });
      if (existing) return jsonRes({ error: 'Already applied' }, 409);
      const body = await request.json();
      const app = {
        application_id: `app_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
        job_id: a, user_id: user.user_id, cover_note: body.cover_note || '',
        status: 'applied', created_at: new Date()
      };
      await db.collection('applications').insertOne({ ...app });
      await db.collection('jobs').updateOne({ job_id: a }, { $inc: { applications_count: 1 } });
      return jsonRes(app, 201);
    }

    // CONVERSATIONS: Find or Create
    if (r === 'conversations' && a === 'start') {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const { recipient_id } = await request.json();
      if (!recipient_id) return jsonRes({ error: 'recipient_id required' }, 400);
      const db = await getDb();
      let conv = await db.collection('conversations').findOne({
        participants: { $all: [user.user_id, recipient_id] }
      }, { projection: { _id: 0 } });
      if (!conv) {
        conv = {
          conversation_id: `conv_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
          participants: [user.user_id, recipient_id],
          last_message: null, updated_at: new Date(), created_at: new Date()
        };
        await db.collection('conversations').insertOne({ ...conv });
      }
      return jsonRes(conv);
    }

    // CONVERSATIONS: Send Message
    if (r === 'conversations' && a && b === 'send') {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const { content } = await request.json();
      if (!content?.trim()) return jsonRes({ error: 'Content required' }, 400);
      const db = await getDb();
      const conv = await db.collection('conversations').findOne(
        { conversation_id: a, participants: user.user_id });
      if (!conv) return jsonRes({ error: 'Conversation not found' }, 404);
      const msg = {
        message_id: `msg_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
        conversation_id: a, sender_id: user.user_id, content: content.trim(),
        read: false, created_at: new Date()
      };
      await db.collection('messages').insertOne({ ...msg });
      await db.collection('conversations').updateOne(
        { conversation_id: a },
        { $set: { last_message: { content: content.trim(), sender_id: user.user_id, created_at: new Date() }, updated_at: new Date() } }
      );
      return jsonRes(msg, 201);
    }

    // COMMUNITIES: Create
    if (r === 'communities' && !a) {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const body = await request.json();
      if (!body.name?.trim()) return jsonRes({ error: 'Name required' }, 400);
      const db = await getDb();
      const comm = {
        community_id: `comm_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
        name: body.name.trim(), type: body.type || 'topic',
        description: body.description || '', industry: body.industry || '',
        city: body.city || '', cover_image: '', rules: body.rules || '',
        members_count: 1, created_by: user.user_id, created_at: new Date()
      };
      await db.collection('communities').insertOne({ ...comm });
      await db.collection('community_members').insertOne({
        community_id: comm.community_id, user_id: user.user_id, role: 'admin', joined_at: new Date()
      });
      return jsonRes(comm, 201);
    }

    // COMMUNITIES: Join
    if (r === 'communities' && a && b === 'join') {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const db = await getDb();
      const existing = await db.collection('community_members').findOne({ community_id: a, user_id: user.user_id });
      if (existing) return jsonRes({ error: 'Already a member' }, 409);
      await db.collection('community_members').insertOne({ community_id: a, user_id: user.user_id, role: 'member', joined_at: new Date() });
      await db.collection('communities').updateOne({ community_id: a }, { $inc: { members_count: 1 } });
      return jsonRes({ success: true });
    }

    // COMMUNITIES: Create Post
    if (r === 'communities' && a && b === 'posts') {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const { content } = await request.json();
      if (!content?.trim()) return jsonRes({ error: 'Content required' }, 400);
      const db = await getDb();
      const cpost = {
        post_id: `cpost_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
        community_id: a, user_id: user.user_id, content: content.trim(), created_at: new Date()
      };
      await db.collection('community_posts').insertOne({ ...cpost });
      return jsonRes({ ...cpost, author: { user_id: user.user_id, name: user.name, picture: user.picture, headline: user.headline, tier: user.tier } }, 201);
    }

    // EVENTS: Create
    if (r === 'events' && !a) {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const body = await request.json();
      if (!body.title?.trim()) return jsonRes({ error: 'Title required' }, 400);
      const db = await getDb();
      const evt = {
        event_id: `evt_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
        title: body.title.trim(), description: body.description || '',
        type: body.type || 'meetup', format: body.format || 'physical',
        date: body.date ? new Date(body.date) : new Date(), end_date: body.end_date ? new Date(body.end_date) : null,
        location: body.location || '', venue: body.venue || '', virtual_link: body.virtual_link || '',
        cover_image: '', organizer_id: user.user_id,
        capacity: body.capacity || 100, attendees_count: 0,
        price: body.price || 0, status: 'upcoming', created_at: new Date()
      };
      await db.collection('events').insertOne({ ...evt });
      return jsonRes(evt, 201);
    }

    // EVENTS: RSVP
    if (r === 'events' && a && b === 'rsvp') {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const { status = 'going' } = await request.json();
      const db = await getDb();
      const existing = await db.collection('event_rsvps').findOne({ event_id: a, user_id: user.user_id });
      if (existing) {
        if (existing.status === status) {
          await db.collection('event_rsvps').deleteOne({ event_id: a, user_id: user.user_id });
          await db.collection('events').updateOne({ event_id: a }, { $inc: { attendees_count: -1 } });
          return jsonRes({ action: 'removed' });
        }
        await db.collection('event_rsvps').updateOne({ event_id: a, user_id: user.user_id }, { $set: { status } });
        return jsonRes({ action: 'updated', status });
      }
      await db.collection('event_rsvps').insertOne({ event_id: a, user_id: user.user_id, status, created_at: new Date() });
      await db.collection('events').updateOne({ event_id: a }, { $inc: { attendees_count: 1 } });
      return jsonRes({ action: 'added', status });
    }

    // COFOUNDER: Create Post
    if (r === 'cofounder' && !a) {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const body = await request.json();
      if (!body.title?.trim()) return jsonRes({ error: 'Title required' }, 400);
      const db = await getDb();
      const cfpost = {
        post_id: `cf_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
        user_id: user.user_id, title: body.title.trim(), description: body.description || '',
        looking_for: body.looking_for || 'tech', commitment: body.commitment || 'full-time',
        equity_range: body.equity_range || '', location_pref: body.location_pref || 'Any',
        stage: body.stage || 'Idea', status: 'active',
        created_at: new Date(), expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      };
      await db.collection('cofounder_posts').insertOne({ ...cfpost });
      return jsonRes({ ...cfpost, author: { user_id: user.user_id, name: user.name, picture: user.picture, headline: user.headline, tier: user.tier } }, 201);
    }

    return jsonRes({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('POST error:', error);
    return jsonRes({ error: 'Internal server error' }, 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const path = params?.path || [];
    const [r, a, b] = path;

    if (r === 'users' && a === 'profile') {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const body = await request.json();
      const db = await getDb();
      const allowed = ['name', 'headline', 'summary', 'city', 'industry', 'skills', 'experience', 'education', 'status_signals', 'business_profile', 'picture', 'cover_photo', 'website', 'phone', 'social_links', 'tier', 'certificates', 'licenses', 'projects', 'publications', 'awards'];
      const update = {};
      for (const f of allowed) if (body[f] !== undefined) update[f] = body[f];
      update.updated_at = new Date();
      update.profile_completion = calcCompletion({ ...user, ...update });
      await db.collection('users').updateOne({ user_id: user.user_id }, { $set: update });
      const updated = await db.collection('users').findOne({ user_id: user.user_id }, { projection: { _id: 0 } });
      return jsonRes(updated);
    }

    if (r === 'connections' && a && b) {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const db = await getDb();
      if (b === 'accept') {
        const conn = await db.collection('connections').findOne(
          { connection_id: a, recipient_id: user.user_id, status: 'pending' }
        );
        if (!conn) return jsonRes({ error: 'Not found' }, 404);
        await db.collection('connections').updateOne(
          { connection_id: a }, { $set: { status: 'accepted', updated_at: new Date() } }
        );
        await db.collection('users').updateOne({ user_id: user.user_id }, { $inc: { connections_count: 1 } });
        await db.collection('users').updateOne({ user_id: conn.requester_id }, { $inc: { connections_count: 1 } });
        return jsonRes({ success: true, status: 'accepted' });
      }
      if (b === 'reject') {
        await db.collection('connections').updateOne(
          { connection_id: a, recipient_id: user.user_id },
          { $set: { status: 'rejected', updated_at: new Date() } }
        );
        return jsonRes({ success: true, status: 'rejected' });
      }
    }

    // ADMIN: Update user status (suspend/activate)
    if (r === 'admin' && a === 'users' && b) {
      const admin = await getAuthUser(request);
      if (!admin || !admin.email?.includes('admin')) {
        return jsonRes({ error: 'Unauthorized' }, 403);
      }
      const body = await request.json();
      const db = await getDb();
      const update = {};
      if (body.status) update.status = body.status; // 'active' or 'suspended'
      if (body.tier) update.tier = body.tier;
      update.updated_at = new Date();
      await db.collection('users').updateOne({ user_id: b }, { $set: update });
      return jsonRes({ success: true });
    }

    // JOBS: Update
    if (r === 'jobs' && a && !b) {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const db = await getDb();
      const job = await db.collection('jobs').findOne({ job_id: a, poster_id: user.user_id });
      if (!job) return jsonRes({ error: 'Job not found' }, 404);
      const body = await request.json();
      const jAllowed = ['title', 'company', 'location', 'type', 'work_mode', 'description', 'salary_min', 'salary_max', 'skills', 'experience_level', 'status'];
      const jUpdate = {};
      for (const f of jAllowed) if (body[f] !== undefined) jUpdate[f] = body[f];
      if (Object.keys(jUpdate).length > 0) {
        await db.collection('jobs').updateOne({ job_id: a }, { $set: jUpdate });
      }
      const updated = await db.collection('jobs').findOne({ job_id: a }, { projection: { _id: 0 } });
      return jsonRes(updated);
    }

    // EVENTS: Update
    if (r === 'events' && a && !b) {
      const user = await getAuthUser(request);
      if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
      const db = await getDb();
      const evt = await db.collection('events').findOne({ event_id: a, organizer_id: user.user_id });
      if (!evt) return jsonRes({ error: 'Event not found' }, 404);
      const body = await request.json();
      const eAllowed = ['title', 'description', 'type', 'format', 'date', 'end_date', 'location', 'venue', 'virtual_link', 'capacity', 'price', 'status'];
      const eUpdate = {};
      for (const f of eAllowed) if (body[f] !== undefined) eUpdate[f] = body[f];
      if (eUpdate.date) eUpdate.date = new Date(eUpdate.date);
      if (eUpdate.end_date) eUpdate.end_date = new Date(eUpdate.end_date);
      if (Object.keys(eUpdate).length > 0) {
        await db.collection('events').updateOne({ event_id: a }, { $set: eUpdate });
      }
      const updated = await db.collection('events').findOne({ event_id: a }, { projection: { _id: 0 } });
      return jsonRes(updated);
    }

    return jsonRes({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('PUT error:', error);
    return jsonRes({ error: 'Internal server error' }, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const path = params?.path || [];
    const [r, id] = path;
    const user = await getAuthUser(request);
    if (!user) return jsonRes({ error: 'Not authenticated' }, 401);
    const db = await getDb();

    if (r === 'posts' && id) {
      const result = await db.collection('posts').deleteOne({ post_id: id, user_id: user.user_id });
      if (result.deletedCount === 0) return jsonRes({ error: 'Not found' }, 404);
      await db.collection('reactions').deleteMany({ post_id: id });
      await db.collection('comments').deleteMany({ post_id: id });
      return jsonRes({ success: true });
    }

    if (r === 'connections' && id) {
      const conn = await db.collection('connections').findOne({
        connection_id: id,
        $or: [{ requester_id: user.user_id }, { recipient_id: user.user_id }]
      });
      if (!conn) return jsonRes({ error: 'Not found' }, 404);
      await db.collection('connections').deleteOne({ connection_id: id });
      if (conn.status === 'accepted') {
        await db.collection('users').updateOne({ user_id: conn.requester_id }, { $inc: { connections_count: -1 } });
        await db.collection('users').updateOne({ user_id: conn.recipient_id }, { $inc: { connections_count: -1 } });
      }
      return jsonRes({ success: true });
    }

    // JOBS: Delete
    if (r === 'jobs' && id) {
      const result = await db.collection('jobs').deleteOne({ job_id: id, poster_id: user.user_id });
      if (result.deletedCount === 0) return jsonRes({ error: 'Not found' }, 404);
      await db.collection('applications').deleteMany({ job_id: id });
      return jsonRes({ success: true });
    }

    // COMMUNITIES: Leave
    if (r === 'communities' && id) {
      const mem = await db.collection('community_members').findOne({ community_id: id, user_id: user.user_id });
      if (!mem) return jsonRes({ error: 'Not a member' }, 404);
      await db.collection('community_members').deleteOne({ community_id: id, user_id: user.user_id });
      await db.collection('communities').updateOne({ community_id: id }, { $inc: { members_count: -1 } });
      return jsonRes({ success: true });
    }

    // ADMIN: Get platform stats
    if (r === 'admin' && a === 'stats') {
      const user = await getAuthUser(request);
      // Simple admin check - in production, use proper role-based access
      if (!user || !user.email?.includes('admin')) {
        return jsonRes({ error: 'Unauthorized' }, 403);
      }
      const db = await getDb();
      const [usersCount, postsCount, connectionsCount, jobsCount, communitiesCount, eventsCount] = await Promise.all([
        db.collection('users').countDocuments(),
        db.collection('posts').countDocuments(),
        db.collection('connections').countDocuments({ status: 'accepted' }),
        db.collection('jobs').countDocuments(),
        db.collection('communities').countDocuments(),
        db.collection('events').countDocuments(),
      ]);
      return jsonRes({
        users: usersCount,
        posts: postsCount,
        connections: connectionsCount,
        jobs: jobsCount,
        communities: communitiesCount,
        events: eventsCount,
      });
    }

    // ADMIN: Get all users
    if (r === 'admin' && a === 'users') {
      const user = await getAuthUser(request);
      if (!user || !user.email?.includes('admin')) {
        return jsonRes({ error: 'Unauthorized' }, 403);
      }
      const db = await getDb();
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const search = url.searchParams.get('search') || '';
      const tier = url.searchParams.get('tier');
      const filter = {};
      if (search) filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
      if (tier) filter.tier = tier;
      const users = await db.collection('users')
        .find(filter, { projection: { _id: 0 } })
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();
      const total = await db.collection('users').countDocuments(filter);
      return jsonRes({ users, total, page, limit });
    }

    // ADMIN: Get all posts for moderation
    if (r === 'admin' && a === 'posts') {
      const user = await getAuthUser(request);
      if (!user || !user.email?.includes('admin')) {
        return jsonRes({ error: 'Unauthorized' }, 403);
      }
      const db = await getDb();
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const posts = await db.collection('posts')
        .aggregate([
          { $sort: { created_at: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: 'users', localField: 'user_id', foreignField: 'user_id', as: 'author'
            }
          },
          { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
          { $project: { _id: 0, 'author._id': 0 } }
        ]).toArray();
      const total = await db.collection('posts').countDocuments();
      return jsonRes({ posts, total, page, limit });
    }

    return jsonRes({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('DELETE error:', error);
    return jsonRes({ error: 'Internal server error' }, 500);
  }
}

function calcCompletion(u) {
  let s = 0;
  if (u.picture) s += 15;
  if (u.name) s += 10;
  if (u.headline) s += 10;
  if (u.summary) s += 10;
  if (u.city) s += 10;
  if (u.industry) s += 10;
  if (u.skills?.length > 0) s += 10;
  if (u.experience?.length > 0) s += 10;
  if (u.education?.length > 0) s += 10;
  if (u.business_profile?.name) s += 5;
  return Math.min(s, 100);
}
