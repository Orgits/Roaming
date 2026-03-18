import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

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
      const allowed = ['name', 'headline', 'summary', 'city', 'industry', 'skills', 'experience', 'education', 'status_signals', 'business_profile', 'picture', 'tier'];
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
