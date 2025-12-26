/**
 * Organizations Controller
 * Handles HTTP requests for organizations
 */

const {
  fnCreateOrganization,
  fnGetOrganizationBySlug,
  fnGetOrganizationByUserId,
  fnGetOrganizationProblems,
  fnGetOrganizationContests,
  fnUpdateOrganization,
  fnGetAllOrganizations,
} = require("./organizations.service");
const { fnWrap } = require("../../utils");

/**
 * Show create organization form
 */
const organizationCreateForm = fnWrap(async (req, res) => {
  // Check if user already has an organization
  const existing_org = await fnGetOrganizationByUserId(req.session.user_id);

  if (existing_org) {
    req.flash("error_msg", "You already have an organization");
    return res.redirect(`/${existing_org.org_slug}`);
  }

  res.render("organizations/create", {
    title: "Create Organization",
    user: req.session.user,
  });
});

/**
 * Create new organization
 */
const organizationCreate = fnWrap(async (req, res) => {
  const { org_name, org_slug, org_type, description, website_url } = req.body;

  const org = await fnCreateOrganization(
    req.session.user_id,
    org_name,
    org_slug,
    org_type,
    description,
    website_url
  );

  req.flash("success_msg", "Organization created successfully!");
  res.redirect(`/${org.org_slug}`);
});

/**
 * Show organization profile page
 */
const organizationProfile = fnWrap(async (req, res) => {
  const { org_slug } = req.params;
  const page = parseInt(req.query.page) || 1;
  const tab = req.query.tab || "problems"; // problems or contests

  const org = await fnGetOrganizationBySlug(org_slug);

  let data;
  if (tab === "contests") {
    data = await fnGetOrganizationContests(org.org_id, page, 20);
  } else {
    data = await fnGetOrganizationProblems(org.org_id, page, 20);
  }

  res.render("organizations/profile", {
    title: org.org_name,
    user: req.session.user,
    organization: org,
    tab,
    ...data,
  });
});

/**
 * Show organization edit form
 */
const organizationEditForm = fnWrap(async (req, res) => {
  const { org_slug } = req.params;

  const org = await fnGetOrganizationBySlug(org_slug);

  // Check if user is the owner
  if (org.user_id !== req.session.user_id) {
    req.flash("error_msg", "You don't have permission to edit this organization");
    return res.redirect(`/${org_slug}`);
  }

  res.render("organizations/edit", {
    title: "Edit Organization",
    user: req.session.user,
    organization: org,
  });
});

/**
 * Update organization
 */
const organizationUpdate = fnWrap(async (req, res) => {
  const { org_slug } = req.params;

  const org = await fnGetOrganizationBySlug(org_slug);

  // Check if user is the owner
  if (org.user_id !== req.session.user_id) {
    req.flash("error_msg", "You don't have permission to edit this organization");
    return res.redirect(`/${org_slug}`);
  }

  const updated_org = await fnUpdateOrganization(org.org_id, req.body);

  req.flash("success_msg", "Organization updated successfully!");
  res.redirect(`/${updated_org.org_slug}`);
});

/**
 * Show all organizations list
 */
const organizationsList = fnWrap(async (req, res) => {
  const page = parseInt(req.query.page) || 1;

  const { organizations, pagination } = await fnGetAllOrganizations(page, 20);

  res.render("organizations/list", {
    title: "Organizations",
    user: req.session.user,
    organizations,
    pagination,
  });
});

module.exports = {
  organizationCreateForm,
  organizationCreate,
  organizationProfile,
  organizationEditForm,
  organizationUpdate,
  organizationsList,
};
