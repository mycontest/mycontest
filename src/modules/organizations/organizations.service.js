/**
 * Organizations Service
 * Business logic for organization operations
 */

const { dbQueryOne, dbQueryMany, dbTransaction } = require("../../utils/mysql");

/**
 * Create new organization
 */
const fnCreateOrganization = async (user_id, org_name, org_slug, org_type, description, website_url) => {
  // Check if user already has an organization
  const existing_org = await dbQueryOne("SELECT org_id FROM organizations WHERE user_id = ?", [user_id]);

  if (existing_org) {
    throw new Error("User already has an organization");
  }

  // Check if slug is already taken
  const slug_exists = await dbQueryOne("SELECT org_id FROM organizations WHERE org_slug = ?", [org_slug]);

  if (slug_exists) {
    throw new Error("Organization slug is already taken");
  }

  // Create organization
  const result = await dbQueryOne(
    `INSERT INTO organizations (user_id, org_name, org_slug, org_type, description, website_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, org_name, org_slug, org_type || "community", description || "", website_url || ""]
  );

  return await dbQueryOne("SELECT * FROM organizations WHERE org_id = ?", [result.insertId]);
};

/**
 * Get organization by slug
 */
const fnGetOrganizationBySlug = async (org_slug) => {
  const org = await dbQueryOne(
    `SELECT o.*, u.username as owner_username, u.full_name as owner_name
     FROM organizations o
     JOIN users u ON o.user_id = u.user_id
     WHERE o.org_slug = ?`,
    [org_slug]
  );

  if (!org) {
    throw new Error("Organization not found");
  }

  return org;
};

/**
 * Get organization by user ID
 */
const fnGetOrganizationByUserId = async (user_id) => {
  return await dbQueryOne("SELECT * FROM organizations WHERE user_id = ?", [user_id]);
};

/**
 * Get organization problems
 */
const fnGetOrganizationProblems = async (org_id, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const [problems, count] = await Promise.all([
    dbQueryMany(
      `SELECT
        p.problem_id,
        p.title,
        p.slug,
        p.difficulty,
        p.is_global,
        COUNT(DISTINCT s.user_id) as attempt_count,
        COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.user_id END) as solved_count
      FROM problems p
      LEFT JOIN submissions s ON p.problem_id = s.problem_id
      WHERE p.organization_id = ? AND p.is_active = TRUE
      GROUP BY p.problem_id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [org_id, limit, offset]
    ),
    dbQueryOne("SELECT COUNT(*) as total FROM problems WHERE organization_id = ? AND is_active = TRUE", [org_id]),
  ]);

  return {
    problems,
    pagination: {
      page,
      limit,
      total: count.total,
      total_pages: Math.ceil(count.total / limit),
    },
  };
};

/**
 * Get organization contests
 */
const fnGetOrganizationContests = async (org_id, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const [contests, count] = await Promise.all([
    dbQueryMany(
      `SELECT
        c.contest_id,
        c.title,
        c.description,
        c.is_global,
        c.start_time,
        c.end_time,
        COUNT(DISTINCT cp.problem_id) as problem_count,
        CASE
          WHEN NOW() < c.start_time THEN 'upcoming'
          WHEN NOW() BETWEEN c.start_time AND c.end_time THEN 'active'
          ELSE 'ended'
        END as status
      FROM contests c
      LEFT JOIN contest_problems cp ON c.contest_id = cp.contest_id
      WHERE c.organization_id = ?
      GROUP BY c.contest_id
      ORDER BY c.start_time DESC
      LIMIT ? OFFSET ?`,
      [org_id, limit, offset]
    ),
    dbQueryOne("SELECT COUNT(*) as total FROM contests WHERE organization_id = ?", [org_id]),
  ]);

  return {
    contests,
    pagination: {
      page,
      limit,
      total: count.total,
      total_pages: Math.ceil(count.total / limit),
    },
  };
};

/**
 * Check monthly contest limit for organization
 */
const fnCheckContestLimit = async (org_id) => {
  const month_year = new Date().toISOString().slice(0, 7); // YYYY-MM

  const limit_record = await dbQueryOne(
    "SELECT usage_count FROM monthly_limits WHERE organization_id = ? AND limit_type = 'contests' AND month_year = ?",
    [org_id, month_year]
  );

  const current_usage = limit_record ? limit_record.usage_count : 0;
  const max_limit = 10; // Basic subscription limit

  return {
    current_usage,
    max_limit,
    can_create: current_usage < max_limit,
    remaining: max_limit - current_usage,
  };
};

/**
 * Increment contest usage for organization
 */
const fnIncrementContestUsage = async (org_id) => {
  const month_year = new Date().toISOString().slice(0, 7);

  await dbQueryOne(
    `INSERT INTO monthly_limits (organization_id, limit_type, usage_count, month_year)
     VALUES (?, 'contests', 1, ?)
     ON DUPLICATE KEY UPDATE usage_count = usage_count + 1`,
    [org_id, month_year]
  );
};

/**
 * Update organization
 */
const fnUpdateOrganization = async (org_id, updates) => {
  const allowed_fields = ["org_name", "org_type", "description", "website_url"];
  const fields = [];
  const values = [];

  Object.keys(updates).forEach((key) => {
    if (allowed_fields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  });

  if (fields.length === 0) {
    throw new Error("No valid fields to update");
  }

  values.push(org_id);

  await dbQueryOne(`UPDATE organizations SET ${fields.join(", ")} WHERE org_id = ?`, values);

  return await dbQueryOne("SELECT * FROM organizations WHERE org_id = ?", [org_id]);
};

/**
 * Get all organizations (for listing)
 */
const fnGetAllOrganizations = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const [organizations, count] = await Promise.all([
    dbQueryMany(
      `SELECT
        o.*,
        u.username as owner_username,
        COUNT(DISTINCT p.problem_id) as problem_count,
        COUNT(DISTINCT c.contest_id) as contest_count
      FROM organizations o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN problems p ON o.org_id = p.organization_id
      LEFT JOIN contests c ON o.org_id = c.organization_id
      GROUP BY o.org_id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    ),
    dbQueryOne("SELECT COUNT(*) as total FROM organizations"),
  ]);

  return {
    organizations,
    pagination: {
      page,
      limit,
      total: count.total,
      total_pages: Math.ceil(count.total / limit),
    },
  };
};

module.exports = {
  fnCreateOrganization,
  fnGetOrganizationBySlug,
  fnGetOrganizationByUserId,
  fnGetOrganizationProblems,
  fnGetOrganizationContests,
  fnCheckContestLimit,
  fnIncrementContestUsage,
  fnUpdateOrganization,
  fnGetAllOrganizations,
};
